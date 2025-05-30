import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: "2023-10-16",
});

const db = admin.firestore();

/**
 * Create a setup intent for adding payment methods
 */
export const createSetupIntent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  const { tenantId, clientId } = data;

  try {
    // Get client data to find Stripe customer
    const clientRef = db.doc(`tenants/${tenantId}/clients/${clientId}`);
    const clientSnap = await clientRef.get();
    
    if (!clientSnap.exists) {
      throw new functions.https.HttpsError("not-found", "Client not found");
    }

    const client = clientSnap.data()!;
    
    if (!client.stripeCustomerId) {
      throw new functions.https.HttpsError("failed-precondition", "Client has no Stripe customer ID");
    }

    // Create setup intent
    const setupIntent = await stripe.setupIntents.create({
      customer: client.stripeCustomerId,
      payment_method_types: ["card"],
      metadata: {
        tenantId,
        clientId,
      },
    });

    return {
      clientSecret: setupIntent.client_secret,
    };
  } catch (error: any) {
    functions.logger.error("Error creating setup intent", { error, clientId });
    throw new functions.https.HttpsError("internal", "Failed to create setup intent");
  }
});

/**
 * Add a payment method to customer
 */
export const addPaymentMethod = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  const { tenantId, clientId, paymentMethodId } = data;

  try {
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

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: client.stripeCustomerId,
    });

    // Get payment method details
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Check if this is the first payment method
    const existingMethods = await db
      .collection(`tenants/${tenantId}/clients/${clientId}/paymentMethods`)
      .get();

    // Save to Firestore
    const paymentMethodData = {
      id: paymentMethod.id,
      stripePaymentMethodId: paymentMethod.id,
      type: paymentMethod.type,
      card: paymentMethod.card ? {
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        expMonth: paymentMethod.card.exp_month,
        expYear: paymentMethod.card.exp_year,
      } : undefined,
      isDefault: existingMethods.empty, // First method is default
      createdAt: admin.firestore.Timestamp.now(),
    };

    await db
      .doc(`tenants/${tenantId}/clients/${clientId}/paymentMethods/${paymentMethod.id}`)
      .set(paymentMethodData);

    // Set as default payment method in Stripe if it's the first one
    if (existingMethods.empty) {
      await stripe.customers.update(client.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });
    }

    functions.logger.info("Payment method added", {
      clientId,
      paymentMethodId: paymentMethod.id,
    });

    return { success: true };
  } catch (error: any) {
    functions.logger.error("Error adding payment method", { error, clientId });
    throw new functions.https.HttpsError("internal", "Failed to add payment method");
  }
});

/**
 * Remove a payment method
 */
export const removePaymentMethod = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  const { tenantId, clientId, paymentMethodId } = data;

  try {
    // Detach from Stripe
    await stripe.paymentMethods.detach(paymentMethodId);

    // Remove from Firestore
    await db
      .doc(`tenants/${tenantId}/clients/${clientId}/paymentMethods/${paymentMethodId}`)
      .delete();

    functions.logger.info("Payment method removed", {
      clientId,
      paymentMethodId,
    });

    return { success: true };
  } catch (error: any) {
    functions.logger.error("Error removing payment method", { error, clientId });
    throw new functions.https.HttpsError("internal", "Failed to remove payment method");
  }
});

/**
 * Pay an invoice with a payment method
 */
export const payInvoice = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  const { tenantId, clientId, invoiceId, paymentMethodId } = data;

  try {
    // Get invoice from Firestore
    const invoiceRef = db.doc(`tenants/${tenantId}/clients/${clientId}/invoices/${invoiceId}`);
    const invoiceSnap = await invoiceRef.get();
    
    if (!invoiceSnap.exists) {
      throw new functions.https.HttpsError("not-found", "Invoice not found");
    }

    const invoiceData = invoiceSnap.data()!;
    
    // Pay the invoice in Stripe
    const stripeInvoice = await stripe.invoices.pay(invoiceData.stripeInvoiceId, {
      payment_method: paymentMethodId,
    });

    functions.logger.info("Invoice paid", {
      clientId,
      invoiceId,
      amount: stripeInvoice.amount_paid,
    });

    return {
      success: true,
      receiptUrl: (stripeInvoice as any).receipt_url,
    };
  } catch (error: any) {
    functions.logger.error("Error paying invoice", { error, clientId, invoiceId });
    
    if (error.type === "StripeCardError") {
      throw new functions.https.HttpsError("invalid-argument", error.message);
    }
    
    throw new functions.https.HttpsError("internal", "Payment failed");
  }
});