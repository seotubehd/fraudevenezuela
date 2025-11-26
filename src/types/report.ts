
import { EvidenceData } from "@/components/report/EvidenceForm";

// Tipos para el estado del reporte
export type ReportStatus = "pendiente" | "aprobado" | "denegado";

// Interfaz para la información del estafador recopilada en el asistente
export interface ScammerInfo {
    socialNetwork: string;
    profileUrl: string;
    reportedPersonName?: string; // Nombre del reportado (opcional)
    reportedPersonId?: string;   // Cédula del reportado (opcional)
}

// La estructura principal y flexible de un Reporte
export interface Report {
    id: string;                    // ID del documento de Firestore
    estado: ReportStatus;          // Estado actual del reporte
    fechaCreacion: string;        // Fecha de creación en formato ISO

    // Campos del asistente original
    scammerInfo: ScammerInfo;       // Contiene perfil, URL y ahora nombre/cédula
    scamType: string;               // Tipo de estafa (e.g., 'phishing')
    evidence: EvidenceData;         // Toda la evidencia (descripción, pruebas, etc.)
    contactEmail?: string;          // Email de contacto del reportante (opcional)

    // Campos antiguos para retrocompatibilidad (si es necesario)
    // Se mapearán desde los nuevos campos al leer los datos.
    cedula?: string;
    descripcion?: string;
    evidencia?: string;
}
