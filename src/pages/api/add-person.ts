
import type { NextApiRequest, NextApiResponse } from 'next';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // FIX: Use server-side environment variable
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });
}

const db = admin.firestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { cedula, personData } = req.body;

  if (!cedula || !personData) {
    return res.status(400).json({ message: 'Missing cedula or personData' });
  }

  try {
    const peopleRef = db.collection('people').doc(cedula as string);
    await peopleRef.set(personData);
    res.status(200).json({ message: 'Person added successfully' });
  } catch (error) {
    console.error('Error adding person to Firestore:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
