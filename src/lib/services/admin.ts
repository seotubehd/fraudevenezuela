import { db } from "@/lib/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    doc,
    writeBatch,
    getCountFromServer,
    Timestamp
} from "firebase/firestore";
import { ReportData } from "./reports";

export interface DashboardStats {
    totalReports: number;
    pendingReports: number;
    verifiedReports: number;
    rejectedReports: number;
    recentReports: (ReportData & { id: string, createdAt: Timestamp })[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const reportsRef = collection(db, "reports");

    // Get counts (optimized using count aggregation)
    const totalSnap = await getCountFromServer(reportsRef);
    const pendingSnap = await getCountFromServer(query(reportsRef, where("status", "==", "pending")));
    const verifiedSnap = await getCountFromServer(query(reportsRef, where("status", "==", "verified")));
    const rejectedSnap = await getCountFromServer(query(reportsRef, where("status", "==", "rejected")));

    // Get recent reports
    const recentQuery = query(reportsRef, orderBy("createdAt", "desc"), limit(5));
    const recentSnap = await getDocs(recentQuery);
    const recentReports = recentSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as (ReportData & { id: string, createdAt: Timestamp })[];

    return {
        totalReports: totalSnap.data().count,
        pendingReports: pendingSnap.data().count,
        verifiedReports: verifiedSnap.data().count,
        rejectedReports: rejectedSnap.data().count,
        recentReports
    };
}

export async function getAllReports() {
    const reportsRef = collection(db, "reports");
    const q = query(reportsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (ReportData & { id: string, createdAt: Timestamp, status: string })[];
}

export async function batchUpdateStatus(reportIds: string[], newStatus: 'verified' | 'rejected' | 'pending') {
    const batch = writeBatch(db);

    reportIds.forEach(id => {
        const docRef = doc(db, "reports", id);
        batch.update(docRef, { status: newStatus });
    });

    await batch.commit();
}
