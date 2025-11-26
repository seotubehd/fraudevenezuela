
import { db } from "@/lib/firebase";
import { Report, ReportStatus } from "@/types/report";
import { collection, getDocs, doc, updateDoc, query, orderBy, Timestamp } from "firebase/firestore";

const REPORTS_COLLECTION = "reports";

/**
 * Fetches all reports from Firestore, ordered by creation date.
 */
export async function getAllReports(): Promise<Report[]> {
    const q = query(collection(db, REPORTS_COLLECTION), orderBy("fechaCreacion", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            cedula: data.cedula,
            descripcion: data.descripcion,
            evidencia: data.evidencia,
            estado: data.estado,
            fechaCreacion: (data.fechaCreacion as Timestamp).toDate().toISOString(),
        } as Report;
    });
}

/**
 * Updates the status of a specific report.
 * 
 * @param reportId - The ID of the report to update.
 * @param newStatus - The new status to set for the report.
 */
export async function updateReportStatus(reportId: string, newStatus: ReportStatus): Promise<void> {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);
    await updateDoc(reportRef, { estado: newStatus });
}
