import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: "2023-10-16",
});

const db = admin.firestore();

/**
 * Create a flat fee invoice for a closing
 */
export const createClosingInvoice = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  const { closingId, tenantId, clientId } = data;

  if (!closingId || !tenantId || !clientId) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required parameters");
  }

  try {
    // Get closing data
    const closingRef = db.doc(`tenants/${tenantId}/clients/${clientId}/closings/${closingId}`);
    const closingSnap = await closingRef.get();
    
    if (!closingSnap.exists) {
      throw new functions.https.HttpsError("not-found", "Closing not found");
    }

    const closing = closingSnap.data()!;
    
    // Get client data
    const clientRef = db.doc(`tenants/${tenantId}/clients/${clientId}`);
    const clientSnap = await clientRef.get();
    
    if (!clientSnap.exists) {
      throw new functions.https.HttpsError("not-found", "Client not found");
    }

    const client = clientSnap.data()!;
    
    if (!client.stripeCustomerId) {
      throw new functions.https.HttpsError("failed-precondition", "Client has no Stripe customer ID");
    }

    // Create invoice description
    const transactionType = closing.transactionType.charAt(0).toUpperCase() + closing.transactionType.slice(1);
    const description = `${transactionType} - ${closing.propertyAddress.street}, ${closing.propertyAddress.city}`;

    // Create the invoice
    const invoice = await stripe.invoices.create({
      customer: client.stripeCustomerId,
      description: `Closing Services - ${description}`,
      collection_method: "send_invoice",
      days_until_due: 7,
      metadata: {
        tenantId,
        clientId,
        closingId,
        transactionType: closing.transactionType,
      },
    });

    // Add the flat fee line item
    await stripe.invoiceItems.create({
      customer: client.stripeCustomerId,
      invoice: invoice.id,
      amount: closing.fixedFee, // Amount in cents
      currency: "usd",
      description: `Flat Fee - ${transactionType} Closing`,
    });

    // Finalize and send the invoice
    await stripe.invoices.finalizeInvoice(invoice.id);
    const sentInvoice = await stripe.invoices.sendInvoice(invoice.id);

    // Save invoice to Firestore
    const invoiceData = {
      id: sentInvoice.id,
      clientId,
      tenantId,
      closingId,
      stripeInvoiceId: sentInvoice.id,
      stripeCustomerId: sentInvoice.customer as string,
      invoiceNumber: sentInvoice.number!,
      status: sentInvoice.status!,
      subtotal: sentInvoice.subtotal,
      tax: sentInvoice.tax || 0,
      total: sentInvoice.total,
      amountPaid: sentInvoice.amount_paid,
      amountDue: sentInvoice.amount_due,
      currency: sentInvoice.currency,
      createdAt: admin.firestore.Timestamp.fromMillis(sentInvoice.created * 1000),
      updatedAt: admin.firestore.Timestamp.now(),
      dueDate: admin.firestore.Timestamp.fromMillis(sentInvoice.due_date! * 1000),
      invoicePdf: sentInvoice.invoice_pdf,
      hostedInvoiceUrl: sentInvoice.hosted_invoice_url,
      description: description,
      lineItems: [{
        id: "flat-fee",
        description: `Flat Fee - ${transactionType} Closing`,
        quantity: 1,
        unitAmount: closing.fixedFee,
        amount: closing.fixedFee,
        currency: "usd",
        closingId: closingId,
        feeType: "closing-fee" as const,
      }],
    };

    await db.doc(`tenants/${tenantId}/clients/${clientId}/invoices/${sentInvoice.id}`).set(invoiceData);

    // Update closing with invoice ID
    await closingRef.update({
      invoiceId: sentInvoice.id,
      paymentStatus: "pending",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info("Invoice created for closing", {
      closingId,
      invoiceId: sentInvoice.id,
      amount: closing.fixedFee,
    });

    return {
      invoiceId: sentInvoice.id,
      hostedInvoiceUrl: sentInvoice.hosted_invoice_url,
      invoicePdf: sentInvoice.invoice_pdf,
    };
  } catch (error: any) {
    functions.logger.error("Error creating invoice", {
      error,
      closingId,
      clientId,
    });
    
    if (error.type === "StripeError") {
      throw new functions.https.HttpsError("internal", `Stripe error: ${error.message}`);
    }
    
    throw error;
  }
});

/**
 * Get payment link for an invoice
 */
export const getInvoicePaymentLink = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  const { invoiceId, tenantId, clientId } = data;

  try {
    // Verify the invoice belongs to this client
    const invoiceRef = db.doc(`tenants/${tenantId}/clients/${clientId}/invoices/${invoiceId}`);
    const invoiceSnap = await invoiceRef.get();
    
    if (!invoiceSnap.exists) {
      throw new functions.https.HttpsError("not-found", "Invoice not found");
    }

    const invoiceData = invoiceSnap.data()!;
    
    // Get the Stripe invoice
    const stripeInvoice = await stripe.invoices.retrieve(invoiceData.stripeInvoiceId);
    
    return {
      paymentUrl: stripeInvoice.hosted_invoice_url,
      status: stripeInvoice.status,
    };
  } catch (error) {
    functions.logger.error("Error getting payment link", { error, invoiceId });
    throw new functions.https.HttpsError("internal", "Failed to get payment link");
  }
});