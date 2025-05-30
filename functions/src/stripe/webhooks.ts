import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: "2023-10-16",
});

const db = admin.firestore();

/**
 * Handle Stripe webhook events
 */
export const handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  
  if (!sig) {
    res.status(400).send("No stripe signature");
    return;
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      functions.config().stripe.webhook_secret
    );
  } catch (err: any) {
    functions.logger.error("Webhook signature verification failed", err);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    switch (event.type) {
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      case "invoice.updated":
        await handleInvoiceUpdated(event.data.object as Stripe.Invoice);
        break;
      
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        functions.logger.info(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    functions.logger.error("Webhook handler error", { error, eventType: event.type });
    res.status(500).send("Webhook handler error");
  }
});

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const tenantId = invoice.metadata?.tenantId;
  const clientId = invoice.metadata?.clientId;
  const closingId = invoice.metadata?.closingId;
  
  if (!tenantId || !clientId) {
    functions.logger.error("Missing metadata in invoice", { invoiceId: invoice.id });
    return;
  }

  const batch = db.batch();

  // Update invoice in Firestore
  const invoiceRef = db.doc(`tenants/${tenantId}/clients/${clientId}/invoices/${invoice.id}`);
  batch.update(invoiceRef, {
    status: "paid",
    amountPaid: invoice.amount_paid,
    amountDue: 0,
    paidAt: admin.firestore.Timestamp.fromMillis(invoice.status_transitions.paid_at! * 1000),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Create payment history record
  const paymentData = {
    id: invoice.payment_intent as string,
    clientId,
    invoiceId: invoice.id,
    stripePaymentIntentId: invoice.payment_intent as string,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: "succeeded" as const,
    paymentMethodType: "card", // Default, will be updated by payment_intent webhook
    createdAt: admin.firestore.Timestamp.now(),
    succeededAt: admin.firestore.Timestamp.fromMillis(invoice.status_transitions.paid_at! * 1000),
    receiptUrl: (invoice as any).receipt_url || undefined,
  };

  const paymentRef = db.doc(`tenants/${tenantId}/clients/${clientId}/payments/${invoice.payment_intent}`);
  batch.set(paymentRef, paymentData);

  // Update closing if linked
  if (closingId) {
    const closingRef = db.doc(`tenants/${tenantId}/clients/${clientId}/closings/${closingId}`);
    batch.update(closingRef, {
      paymentStatus: "paid",
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();

  functions.logger.info("Invoice payment succeeded", {
    invoiceId: invoice.id,
    clientId,
    amount: invoice.amount_paid,
  });
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const tenantId = invoice.metadata?.tenantId;
  const clientId = invoice.metadata?.clientId;
  
  if (!tenantId || !clientId) {
    return;
  }

  // Update invoice status
  await db.doc(`tenants/${tenantId}/clients/${clientId}/invoices/${invoice.id}`).update({
    status: invoice.status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  functions.logger.warn("Invoice payment failed", {
    invoiceId: invoice.id,
    clientId,
  });
}

/**
 * Handle invoice updates
 */
async function handleInvoiceUpdated(invoice: Stripe.Invoice) {
  const tenantId = invoice.metadata?.tenantId;
  const clientId = invoice.metadata?.clientId;
  
  if (!tenantId || !clientId) {
    return;
  }

  // Update invoice in Firestore
  await db.doc(`tenants/${tenantId}/clients/${clientId}/invoices/${invoice.id}`).update({
    status: invoice.status,
    amountDue: invoice.amount_due,
    amountPaid: invoice.amount_paid,
    hostedInvoiceUrl: invoice.hosted_invoice_url,
    invoicePdf: invoice.invoice_pdf,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Handle payment intent succeeded (to get payment method details)
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const tenantId = paymentIntent.metadata?.tenantId;
  const clientId = paymentIntent.metadata?.clientId;
  
  if (!tenantId || !clientId || !paymentIntent.invoice) {
    return;
  }

  const paymentMethod = await stripe.paymentMethods.retrieve(
    paymentIntent.payment_method as string
  );

  const paymentMethodDetails: any = {
    paymentMethodType: paymentMethod.type,
  };

  if (paymentMethod.card) {
    paymentMethodDetails.paymentMethodDetails = {
      card: {
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
      },
    };
  }

  // Update payment record with method details
  await db.doc(`tenants/${tenantId}/clients/${clientId}/payments/${paymentIntent.id}`).update({
    ...paymentMethodDetails,
    stripeChargeId: paymentIntent.latest_charge as string,
  });
}