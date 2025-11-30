
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // Ensure the environment variable is present
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
    }
    
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8')
    );
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
    });
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    // In a production environment, you might want to handle this more gracefully
    // For now, we throw to make it clear that the setup is failing.
    throw new Error('Firebase Admin SDK initialization failed. Check your service account credentials.');
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
