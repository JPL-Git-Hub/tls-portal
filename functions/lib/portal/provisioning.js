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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSubdomainAvailability = exports.deprovisionClientPortal = exports.provisionClientPortal = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * Provision a new client portal when a client is created
 */
exports.provisionClientPortal = functions.firestore
    .document("tenants/{tenantId}/clients/{clientId}")
    .onCreate(async (snap, context) => {
    const { tenantId, clientId } = context.params;
    const clientData = snap.data();
    try {
        // 1. Verify subdomain is unique (already done during creation)
        functions.logger.info("Provisioning portal for client", {
            clientId,
            subdomain: clientData.subdomain,
            portalUrl: clientData.portalUrl,
        });
        // 2. Create portal configuration
        const portalConfig = {
            clientId,
            tenantId,
            subdomain: clientData.subdomain,
            status: "active",
            features: {
                documents: true,
                billing: true,
                messages: true,
                scheduling: false, // Future feature
            },
            branding: {
                primaryColor: "#1e40af",
                logoUrl: null,
                companyName: clientData.tenantName || "The Law Shop",
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            activatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        // Store portal configuration
        await db
            .collection("portals")
            .doc(clientData.subdomain)
            .set(portalConfig);
        // 3. Create initial portal user from client data
        if (clientData.profile.email) {
            // Check if user already exists
            let userRecord;
            try {
                userRecord = await admin.auth().getUserByEmail(clientData.profile.email);
            }
            catch (error) {
                if (error.code === "auth/user-not-found") {
                    // Create new auth user
                    userRecord = await admin.auth().createUser({
                        email: clientData.profile.email,
                        displayName: `${clientData.profile.firstName} ${clientData.profile.lastName}`,
                        // Generate a random password - they'll need to reset it
                        password: generateRandomPassword(),
                    });
                    // Send password reset email will be handled by welcome email
                }
            }
            // Set custom claims for the user
            if (userRecord) {
                await admin.auth().setCustomUserClaims(userRecord.uid, {
                    clientId,
                    tenantId,
                    subdomain: clientData.subdomain,
                    role: "client",
                });
                // Create user document
                await db.collection("users").doc(userRecord.uid).set({
                    clientId,
                    tenantId,
                    email: clientData.profile.email,
                    role: "client",
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });
            }
        }
        // 4. Initialize default data structures
        const batch = db.batch();
        // Create default folders for documents
        const foldersRef = db.collection(`tenants/${tenantId}/clients/${clientId}/folders`);
        const defaultFolders = [
            { name: "Contracts", type: "contracts", order: 1 },
            { name: "Correspondence", type: "correspondence", order: 2 },
            { name: "Court Documents", type: "court", order: 3 },
            { name: "Financial Records", type: "financial", order: 4 },
        ];
        defaultFolders.forEach((folder, index) => {
            const folderRef = foldersRef.doc();
            batch.set(folderRef, Object.assign(Object.assign({}, folder), { id: folderRef.id, createdAt: admin.firestore.FieldValue.serverTimestamp() }));
        });
        await batch.commit();
        // 5. Update client with portal provisioning status
        await snap.ref.update({
            portalStatus: "active",
            portalProvisionedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        functions.logger.info("Portal provisioned successfully", {
            clientId,
            subdomain: clientData.subdomain,
        });
    }
    catch (error) {
        functions.logger.error("Error provisioning portal", {
            error,
            clientId,
            subdomain: clientData.subdomain,
        });
        // Update client with error status
        await snap.ref.update({
            portalStatus: "error",
            portalError: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
    }
});
/**
 * Handle portal deactivation when a client is deleted
 */
exports.deprovisionClientPortal = functions.firestore
    .document("tenants/{tenantId}/clients/{clientId}")
    .onDelete(async (snap, context) => {
    const clientData = snap.data();
    try {
        // 1. Mark portal as inactive
        await db
            .collection("portals")
            .doc(clientData.subdomain)
            .update({
            status: "inactive",
            deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // 2. Disable all users associated with this client
        const usersSnapshot = await db
            .collection("users")
            .where("clientId", "==", context.params.clientId)
            .get();
        const disablePromises = usersSnapshot.docs.map(async (userDoc) => {
            try {
                await admin.auth().updateUser(userDoc.id, { disabled: true });
            }
            catch (error) {
                functions.logger.error("Error disabling user", { error, userId: userDoc.id });
            }
        });
        await Promise.all(disablePromises);
        functions.logger.info("Portal deprovisioned", {
            clientId: context.params.clientId,
            subdomain: clientData.subdomain,
        });
    }
    catch (error) {
        functions.logger.error("Error deprovisioning portal", {
            error,
            clientId: context.params.clientId,
        });
    }
});
/**
 * Verify subdomain availability
 */
exports.checkSubdomainAvailability = functions.https.onCall(async (data) => {
    const { subdomain } = data;
    if (!subdomain || typeof subdomain !== "string") {
        throw new functions.https.HttpsError("invalid-argument", "Subdomain is required");
    }
    // Check if subdomain is already taken
    const portalDoc = await db.collection("portals").doc(subdomain).get();
    if (portalDoc.exists) {
        return { available: false };
    }
    // Also check across all clients
    const tenantsSnapshot = await db.collection("tenants").get();
    for (const tenantDoc of tenantsSnapshot.docs) {
        const clientsSnapshot = await db
            .collection(`tenants/${tenantDoc.id}/clients`)
            .where("subdomain", "==", subdomain)
            .limit(1)
            .get();
        if (!clientsSnapshot.empty) {
            return { available: false };
        }
    }
    return { available: true };
});
// Helper function to generate a random password
function generateRandomPassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    let password = "";
    for (let i = 0; i < 16; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}
//# sourceMappingURL=provisioning.js.map