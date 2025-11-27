'use client';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';

// Tipos para los reportes en el panel de administración
export interface AdminReport {
    id: string;
    nombreCompleto: string;
    cedula: string;
    status: 'pending' | 'verified' | 'rejected';
    createdAt: string;
    socialNetwork?: string;
    profileUrl?: string;
    scamType?: string;
    description?: string; 
    scammerBankAccount?: string;
    scammerPagoMovil?: string;
    scammerPhone?: string;
    evidencias?: string[];
    reporterName?: string;
    contactEmail?: string;
    reporterWhatsapp?: string;
}

// Obtiene todos los reportes para el panel de administración
export const getAdminReports = async (): Promise<AdminReport[]> => {
    const reportsCollection = collection(db, 'reports');
    const snapshot = await getDocs(reportsCollection);
    
    return snapshot.docs.map(doc => {
        const data = doc.data();
        // Unificar campos viejos y nuevos para compatibilidad
        const description = data.descripcion || data.description || data.caseDescription || ''; // <-- CORREGIDO
        const evidences = data.evidencias || data.evidenceUrls || [];

        return {
            id: doc.id,
            nombreCompleto: data.nombreCompleto,
            cedula: data.cedula,
            status: data.status || data.estado || 'pending',
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            socialNetwork: data.socialNetwork,
            profileUrl: data.profileUrl,
            scamType: data.scamType || data.caseType,
            description: description,
            scammerBankAccount: data.scammerBankAccount || data.bankAccount,
            scammerPagoMovil: data.scammerPagoMovil || data.pagoMovil,
            scammerPhone: data.scammerPhone || data.phone,
            evidencias: evidences,
            reporterName: data.reporterName || 'Anónimo',
            contactEmail: data.contactEmail,
            reporterWhatsapp: data.reporterWhatsapp,
        };
    });
};

// Actualiza el estado de un reporte
export const updateReportStatus = async (reportId: string, status: 'pending' | 'verified' | 'rejected'): Promise<void> => {
    const reportDoc = doc(db, 'reports', reportId);
    await updateDoc(reportDoc, { status: status, estado: status });
};
