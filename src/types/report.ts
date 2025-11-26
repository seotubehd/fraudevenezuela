import { Timestamp } from "firebase/firestore";

// Tipos para el estado del reporte
export type ReportStatus = "pending" | "approved" | "denied";

/**
 * La estructura de datos unificada para un reporte de estafa.
 * Esta es la fuente de verdad para toda la aplicación.
 */
export interface Report {
    id: string;                    // ID del documento de Firestore
    
    // Información de la persona reportada
    nombreCompleto: string;
    cedula: string;

    // Detalles de la estafa
    socialNetwork: string;
    profileUrl: string;
    scamType: string;               // Tipo de estafa (e.g., 'phishing')
    descripcion: string;            // Descripción detallada del incidente
    
    // Información de pago del estafador (opcional)
    scammerPhone?: string;
    scammerPagoMovil?: string;
    scammerBankAccount?: string;

    // Evidencia
    evidencias: string[];           // Array de URLs de las pruebas

    // Metadatos del reporte
    contactEmail?: string;          // Email de contacto del reportante (opcional)
    createdAt: Timestamp;           // Fecha de creación del reporte
    status: ReportStatus;           // Estado actual del reporte
}
