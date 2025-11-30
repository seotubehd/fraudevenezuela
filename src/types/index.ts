import { Timestamp } from "firebase/firestore";

export interface CedulaData {
    cedula: string;
    nombre: string;
    estado: string;
    municipio: string;
    parroquia:string;
    centro: string;
}

// Interface for the data that is being stored in the database
export interface Report {
    id: string;
    scammerId: string;
    scammerName: string;
    scamType: 'social_media' | 'phishing' | 'fraudulent_sale' | 'other';
    descripcion: string;
    reporterId: string;
    reporterName: string;
    profileUrl: string;
    scammerPhone?: string; 
    scammerPagoMovil?: string;
    scammerBankAccount?: string;
    status: 'pending' | 'verified' | 'rejected';
    rejectionReason?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    evidencias: string[];
}
