import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";

const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: "2023-10-16",
});

/**
 * Create a Stripe customer when a new client is created
 */
export const createStripeCustomer = functions.firestore
  .document("tenants/{tenantId}/clients/{clientId}")
  .onCreate(async (snap, context) => {
    const { tenantId, clientId } = context.params;
    const clientData = snap.data();

    try {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: clientData.profile.email,
        name: `${clientData.profile.firstName} ${clientData.profile.lastName}`,
        phone: clientData.profile.phone,
        metadata: {
          tenantId,
          clientId,
          firebaseUID: clientData.uid,
        },
      });

      // Update client document with Stripe customer ID
      await snap.ref.update({
        stripeCustomerId: customer.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      functions.logger.info("Stripe customer created", {
        clientId,
        stripeCustomerId: customer.id,
      });
    } catch (error) {
      functions.logger.error("Error creating Stripe customer", {
        error,
        clientId,
        tenantId,
      });
      throw error;
    }
  });

/**
 * Update Stripe customer when client profile is updated
 */
export const updateStripeCustomer = functions.firestore
  .document("tenants/{tenantId}/clients/{clientId}")
  .onUpdate(async (change, context) => {
    const { clientId } = context.params;
    const before = change.before.data();
    const after = change.after.data();

    // Check if relevant fields changed
    const profileChanged = 
      before.profile.email !== after.profile.email ||
      before.profile.firstName !== after.profile.firstName ||
      before.profile.lastName !== after.profile.lastName ||
      before.profile.phone !== after.profile.phone;

    if (!profileChanged || !after.stripeCustomerId) {
      return;
    }

    try {
      await stripe.customers.update(after.stripeCustomerId, {
        email: after.profile.email,
        name: `${after.profile.firstName} ${after.profile.lastName}`,
        phone: after.profile.phone,
      });

      functions.logger.info("Stripe customer updated", {
        clientId,
        stripeCustomerId: after.stripeCustomerId,
      });
    } catch (error) {
      functions.logger.error("Error updating Stripe customer", {
        error,
        clientId,
        stripeCustomerId: after.stripeCustomerId,
      });
    }
  });