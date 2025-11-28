'use server';
import { adminDb, adminAuth } from '@/lib/firebase-admin'; // CORRECT IMPORT
import { Timestamp } from 'firebase-admin/firestore';
import { revalidateTag } from 'next/cache';

// Helper function to verify the user is a logged-in admin
const verifyAdmin = async (idToken: string | undefined) => {
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
        throw new Error(`401: Authentication failed. ${error.message}`);
    }
};


// --- TYPES ---
export interface AdminReport {
    id: string;
    nombreCompleto: string;
    cedula: string;
    status: 'pending' | 'verified' | 'rejected';
    createdAt: string;
    // ... other fields
    [key: string]: any; 
}

// --- SERVICE FUNCTIONS ---

// Gets all reports, protected for admins only
export const getAdminReports = async (idToken: string | undefined): Promise<AdminReport[]> => {
    await verifyAdmin(idToken);
    const snapshot = await adminDb.collection('reports').get();
    
    return snapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();

        return {
            ...data,
            id: doc.id,
            nombreCompleto: data.nombreCompleto || '',
            cedula: data.cedula || '',
            status: data.status || data.estado || 'pending',
            createdAt: createdAt,
        } as AdminReport;
    });
};

// Updates the status of reports, protected for admins only
export const updateReportsStatus = async (
    idToken: string | undefined, 
    reportIds: string[], 
    status: 'pending' | 'verified' | 'rejected'
): Promise<void> => {
    await verifyAdmin(idToken);
    if (reportIds.length === 0) return;

    const batch = adminDb.batch();
    reportIds.forEach(id => {
        const reportDocRef = adminDb.collection('reports').doc(id);
        batch.update(reportDocRef, { status: status, estado: status });
    });

    await batch.commit();

    // For revalidation, we need to get the cedulas associated with the reports
    // This is a simplified example; a real-world scenario might need to fetch them.
    console.log('Revalidation might be needed for affected cedulas.');
    // Example: revalidateTag(`cedula:SOME_CEDULA`);
};


// Deletes multiple reports, protected for admins only
export const deleteMultipleReports = async (idToken: string | undefined, reportIds: string[]): Promise<void> => {
    await verifyAdmin(idToken);
    if (reportIds.length === 0) return;

    const batch = adminDb.batch();
    reportIds.forEach(id => {
        const reportDocRef = adminDb.collection('reports').doc(id);
        batch.delete(reportDocRef);
    });

    await batch.commit();
};