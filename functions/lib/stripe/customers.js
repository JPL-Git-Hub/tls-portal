"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStripeCustomer = exports.createStripeCustomer = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(functions.config().stripe.secret, {
    apiVersion: "2023-10-16",
});
/**
 * Create a Stripe customer when a new client is created
 */
exports.createStripeCustomer = functions.firestore
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
    }
    catch (error) {
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
exports.updateStripeCustomer = functions.firestore
    .document("tenants/{tenantId}/clients/{clientId}")
    .onUpdate(async (change, context) => {
    const { clientId } = context.params;
    const before = change.before.data();
    const after = change.after.data();
    // Check if relevant fields changed
    const profileChanged = before.profile.email !== after.profile.email ||
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
    }
    catch (error) {
        functions.logger.error("Error updating Stripe customer", {
            error,
            clientId,
            stripeCustomerId: after.stripeCustomerId,
        });
    }
});
//# sourceMappingURL=customers.js.map