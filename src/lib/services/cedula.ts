
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import type { Report as AppReport, ReportStatus } from "@/types/report";

// Interfaz de datos que recibe la API externa de cédulas
interface ApiCedulaData {
    nacionalidad: string;
    cedula: number;
    rif: string;
    primer_apellido: string;
    segundo_apellido: string;
    primer_nombre: string;
    segundo_nombre: string;
    cne?: { estado: string; municipio: string; parroquia: string; centro_electoral: string; };
}

// Interfaz de datos normalizada para usar en la aplicación
export interface CedulaData {
  cedula: string;
  nombre: string;
  estado: string;
  municipio: string;
  parroquia: string;
  centro: string;
}

// Interfaz que representa la estructura de un reporte en la DB (campos viejos y nuevos)
interface ReportDocument {
    id: string;
    nombreCompleto: string;
    cedula: string;
    createdAt: Timestamp;
    estado: 'pending' | 'verified' | 'rejected'; 
    
    // Campos nuevos
    socialNetwork?: string;
    profileUrl?: string;
    scamType?: string;
    descripcion?: string;
    evidencias?: string[];
    scammerPhone?: string;
    scammerPagoMovil?: string;
    scammerBankAccount?: string;

    // Campos antiguos (para compatibilidad)
    caseType?: string;
    caseDescription?: string;
    status?: 'pending' | 'verified' | 'rejected';
    evidenceUrls?: string[];
    phone?: string;
    pagoMovil?: string;
    bankAccount?: string;
    reporterName?: string;
}

// Se exporta el tipo `Report` para que los componentes lo usen.
// Este es el objeto normalizado que se pasará a la UI.
export type Report = Omit<AppReport, 'nombreCompleto' | 'contactEmail'> & { reporterName?: string };


export async function getCedula(cedula: string): Promise<CedulaData | null> {
  try {
    const url = `/api/cedula?cedula=${encodeURIComponent(cedula)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const result = await response.json();
    if (result.error || !result.data) {
      console.error("API Error:", result.error_str);
      return null;
    }

    const apiData: ApiCedulaData = result.data;
    const cneData = apiData.cne || { estado: "N/A", municipio: "N/A", parroquia: "N/A", centro_electoral: "N/A" };
    
    return {
      cedula: `${apiData.nacionalidad}-${apiData.cedula}`,
      nombre: `${apiData.primer_nombre} ${apiData.segundo_nombre || ''} ${apiData.primer_apellido} ${apiData.segundo_apellido || ''}`.trim(),
      estado: cneData.estado,
      municipio: cneData.municipio,
      parroquia: cneData.parroquia,
      centro: cneData.centro_electoral
    };
  } catch (error) {
    console.error("Error fetching cedula from API:", error);
    throw error;
  }
}


export async function getReportsByCedula(cedula: string): Promise<Report[]> {
    try {
        const reportsRef = collection(db, "reports");
        const q = query(
            reportsRef,
            where("cedula", "==", cedula),      
            where("estado", "==", "verified") 
        );

        const querySnapshot = await getDocs(q);
        
        const reports: Report[] = querySnapshot.docs.map(doc => {
            const data = doc.data() as ReportDocument;
            
            // Normaliza el estado de la DB al estado de la App
            const rawStatus = data.estado || data.status || 'pending';
            let status: ReportStatus;
            if (rawStatus === 'verified') {
                status = 'approved';
            } else if (rawStatus === 'rejected') {
                status = 'denied';
            } else {
                status = 'pending';
            }

            const normalizedReport: Report = {
                id: doc.id,
                cedula: data.cedula,
                createdAt: data.createdAt,
                status: status, 

                scamType: data.scamType || data.caseType || "other",
                socialNetwork: data.socialNetwork || "other",
                descripcion: data.descripcion || data.caseDescription || "Sin descripción.",
                profileUrl: data.profileUrl || (data.evidenceUrls && data.evidenceUrls[0]) || "",
                evidencias: data.evidencias || data.evidenceUrls || [],

                scammerPhone: data.scammerPhone || data.phone,
                scammerPagoMovil: data.scammerPagoMovil || data.pagoMovil,
                scammerBankAccount: data.scammerBankAccount || data.bankAccount,

                reporterName: data.reporterName || "Anónimo",
            };
            return normalizedReport;
        });

        return reports;
    } catch (error) {
        console.error("Error fetching reports from Firestore:", error);
        return [];
    }
}
