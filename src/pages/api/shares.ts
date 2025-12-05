
import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '@/lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const docRef = adminDb.collection('metrics').doc('metadata');

  if (req.method === 'POST') {
    try {
      await adminDb.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef);
        const newShareCount = (doc.data()?.shareCount || 0) + 1;
        transaction.set(docRef, { shareCount: newShareCount }, { merge: true });
      });
      res.status(200).json({ message: 'Share count incremented' });
    } catch (error) {
      console.error('Error incrementing share count:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (req.method === 'GET') {
    try {
      const doc = await docRef.get();
      const shareCount = doc.data()?.shareCount || 0;
      res.status(200).json({ shareCount });
    } catch (error) {
      console.error('Error fetching share count:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
