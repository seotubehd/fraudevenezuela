import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
    try {
        const { cedula } = await req.json();

        if (!cedula) {
            return NextResponse.json({ error: 'Cedula is required' }, { status: 400 });
        }

        // Add the searched cedula to the 'searches' collection
        const searchDocRef = adminDb.collection('searches').doc(cedula);
        await searchDocRef.set({ cedula, timestamp: new Date() });

        // Increment the general search count
        const countsCollectionRef = adminDb.collection('searchCounts').doc('search_counter');
        // Use { merge: true } to create the document if it doesn't exist
        await countsCollectionRef.set({ count: FieldValue.increment(1) }, { merge: true });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error in /api/search:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
