
import { adminDb, adminAuth } from '@/lib/firebase-admin';

/**
 * Verifies the user's ID token to ensure they are a logged-in administrator.
 * Throws an error if authentication or authorization fails.
 * @param idToken The Firebase ID token from the client.
 * @returns The admin's UID if verification is successful.
 */
export const verifyAdmin = async (idToken: string | undefined) => {
    if (!idToken) {
        throw new Error("401: Authentication token not provided.");
    }
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const adminDoc = await adminDb.collection('admins').doc(uid).get();

        if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
            throw new Error("403: User does not have admin privileges.");
        }
        return uid; // Return uid if verification is successful
    } catch (error: any) {
        console.error("Admin verification failed:", error);
        // Re-throw a generic error to avoid leaking implementation details
        throw new Error(`401: Authentication failed. ${error.message}`);
    }
};
