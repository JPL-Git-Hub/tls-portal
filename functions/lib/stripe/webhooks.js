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
exports.handleStripeWebhook = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(functions.config().stripe.secret, {
    apiVersion: "2023-10-16",
});
const db = admin.firestore();
/**
 * Handle Stripe webhook events
 */
exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    if (!sig) {
        res.status(400).send("No stripe signature");
        return;
    }
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, functions.config().stripe.webhook_secret);
    }
    catch (err) {
        functions.logger.error("Webhook signature verification failed", err);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    try {
        switch (event.type) {
            case "invoice.payment_succeeded":
                await handleInvoicePaymentSucceeded(event.data.object);
                break;
            case "invoice.payment_failed":
                await handleInvoicePaymentFailed(event.data.object);
                break;
            case "invoice.updated":
                await handleInvoiceUpdated(event.data.object);
                break;
            case "payment_intent.succeeded":
                await handlePaymentIntentSucceeded(event.data.object);
                break;
            default:
                functions.logger.info(`Unhandled event type ${event.type}`);
        }
        res.json({ received: true });
    }
    catch (error) {
        functions.logger.error("Webhook handler error", { error, eventType: event.type });
        res.status(500).send("Webhook handler error");
    }
});
/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice) {
    var _a, _b, _c;
    const tenantId = (_a = invoice.metadata) === null || _a === void 0 ? void 0 : _a.tenantId;
    const clientId = (_b = invoice.metadata) === null || _b === void 0 ? void 0 : _b.clientId;
    const closingId = (_c = invoice.metadata) === null || _c === void 0 ? void 0 : _c.closingId;
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
        paidAt: admin.firestore.Timestamp.fromMillis(invoice.status_transitions.paid_at * 1000),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    // Create payment history record
    const paymentData = {
        id: invoice.payment_intent,
        clientId,
        invoiceId: invoice.id,
        stripePaymentIntentId: invoice.payment_intent,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: "succeeded",
        paymentMethodType: "card",
        createdAt: admin.firestore.Timestamp.now(),
        succeededAt: admin.firestore.Timestamp.fromMillis(invoice.status_transitions.paid_at * 1000),
        receiptUrl: invoice.receipt_url || undefined,
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
async function handleInvoicePaymentFailed(invoice) {
    var _a, _b;
    const tenantId = (_a = invoice.metadata) === null || _a === void 0 ? void 0 : _a.tenantId;
    const clientId = (_b = invoice.metadata) === null || _b === void 0 ? void 0 : _b.clientId;
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
async function handleInvoiceUpdated(invoice) {
    var _a, _b;
    const tenantId = (_a = invoice.metadata) === null || _a === void 0 ? void 0 : _a.tenantId;
    const clientId = (_b = invoice.metadata) === null || _b === void 0 ? void 0 : _b.clientId;
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
async function handlePaymentIntentSucceeded(paymentIntent) {
    var _a, _b;
    const tenantId = (_a = paymentIntent.metadata) === null || _a === void 0 ? void 0 : _a.tenantId;
    const clientId = (_b = paymentIntent.metadata) === null || _b === void 0 ? void 0 : _b.clientId;
    if (!tenantId || !clientId || !paymentIntent.invoice) {
        return;
    }
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
    const paymentMethodDetails = {
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
    await db.doc(`tenants/${tenantId}/clients/${clientId}/payments/${paymentIntent.id}`).update(Object.assign(Object.assign({}, paymentMethodDetails), { stripeChargeId: paymentIntent.latest_charge }));
}
//# sourceMappingURL=webhooks.js.map