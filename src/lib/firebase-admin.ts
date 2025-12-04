
// IMPORTANT: This file should only be imported by server-side code.
import * as admin from 'firebase-admin';

let serviceAccount: admin.ServiceAccount;

// Check if the recommended Base64 environment variable is present.
if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
        // Decode the base64 string to a UTF-8 string
        const decodedServiceAccount = Buffer.from(
            process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 
            'base64'
        ).toString('utf8');
        // Parse the string as JSON
        serviceAccount = JSON.parse(decodedServiceAccount);
    } catch (e: any) {
        console.error("Fatal: Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64.", e);
        throw new Error("Invalid Firebase Admin SDK credentials format. Check your .env.local file.");
    }
} else {
    // If the recommended variable is not found, throw an error with clear instructions.
    throw new Error(`Missing Firebase Admin SDK credentials. \nPlease create a FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable with the base64-encoded content of your Firebase service account JSON file.`);
}

const initializeAdmin = () => {
    // Avoid re-initializing the app in hot-reload environments
    if (admin.apps.length > 0) {
        return admin.app();
    }
    return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
};

// Initialize and export the admin-powered tools
const adminApp = initializeAdmin();
const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth, adminApp };
