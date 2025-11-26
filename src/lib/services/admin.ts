
import { db } from "@/lib/firebase";
import { Report, ReportStatus } from "@/types/report";
import { collection, getDocs, doc, updateDoc, query, orderBy, Timestamp } from "firebase/firestore";

const REPORTS_COLLECTION = "reports";

/**
 * Fetches all reports from Firestore, ordered by creation date.
 */
export async function getAllReports(): Promise<Report[]> {
    // CORRECCIÓN: Ordenar por 'createdAt' en lugar de 'fechaCreacion'.
    const q = query(collection(db, REPORTS_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
        const data = doc.data();

        // CORRECCIÓN: Mapear la nueva estructura de datos a la que espera el componente de la tabla.
        // Esto actúa como una capa de adaptación.
        const evidenceData = data.evidence || {};
        const scammerInfoData = data.scammerInfo || {};

        return {
            id: doc.id,
            // Adaptamos los nuevos campos a los que la tabla espera
            cedula: scammerInfoData.profileUrl || 'No disponible',
            descripcion: evidenceData.scamDescription || 'No disponible',
            evidencia: evidenceData.proof ? (Array.isArray(evidenceData.proof) ? evidenceData.proof.join(', ') : evidenceData.proof) : 'No disponible',
            estado: data.estado,
            // Usar el campo de fecha correcto 'createdAt'
            fechaCreacion: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : new Date().toISOString(),
            // Incluir los nuevos campos por si se necesitan en el futuro
            scammerInfo: scammerInfoData,
            scamType: data.scamType,
            contactEmail: data.contactEmail,
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
    // CORRECCIÓN: Asegurarse de que el campo a actualizar sea 'estado'.
    await updateDoc(reportRef, { estado: newStatus });
}
