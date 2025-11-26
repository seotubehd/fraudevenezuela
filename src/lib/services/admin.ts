
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, query, orderBy, Timestamp } from "firebase/firestore";

const REPORTS_COLLECTION = "reports";

export interface AdminReport {
    id: string;
    createdAt: string;
    status: "pending" | "verified" | "rejected";
    nombreCompleto: string;
    cedula: string;
    scamType: string;
    description: string;
    socialNetwork: string;
    profileUrl: string;
    scammerBankAccount?: string;
    scammerPagoMovil?: string;
    scammerPhone?: string;
    contactEmail?: string;
    evidencias: string[];
}

/**
 * Obtiene todos los reportes de Firestore, normalizando los datos para la app.
 */
export async function getAllReports(): Promise<AdminReport[]> {
    const q = query(collection(db, REPORTS_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // --- FIX: Normaliza el estado a minúsculas para evitar errores de filtro ---
        const rawStatus = data.estado ? String(data.estado).toLowerCase() : 'pending';
        const status: AdminReport['status'] = (rawStatus === 'verified' || rawStatus === 'rejected') ? rawStatus : 'pending';

        return {
            id: doc.id,
            nombreCompleto: data.nombreCompleto || 'No disponible',
            cedula: data.cedula || 'No disponible',
            scamType: data.scamType || 'No especificado',
            description: data.description || 'Sin descripción.',
            socialNetwork: data.socialNetwork || 'No especificada',
            profileUrl: data.profileUrl || '',
            scammerBankAccount: data.scammerBankAccount || undefined,
            scammerPagoMovil: data.scammerPagoMovil || undefined,
            scammerPhone: data.scammerPhone || undefined,
            contactEmail: data.contactEmail === 'No proporcionado' ? undefined : data.contactEmail,
            evidencias: data.evidence ? Object.values(data.evidence) as string[] : [],
            status: status, // Usa el estado normalizado
            createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : new Date().toISOString(),
        } as AdminReport;
    });
}

/**
 * Actualiza el estado de un reporte específico en la base de datos.
 */
export async function updateReportStatus(reportId: string, newStatus: "pending" | "verified" | "rejected"): Promise<void> {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);
    // Escribe en el campo 'estado' para mantener consistencia con la DB.
    await updateDoc(reportRef, { estado: newStatus });
}
