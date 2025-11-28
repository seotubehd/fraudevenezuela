import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import type { Report as AppReport, ReportStatus } from "@/types/report";

// --- Interfaces (sin cambios) ---
interface ApiCedulaData { nacionalidad: string; cedula: number; rif: string; primer_apellido: string; segundo_apellido: string; primer_nombre: string; segundo_nombre: string; cne?: { estado: string; municipio: string; parroquia: string; centro_electoral: string; }; }
export interface CedulaData { cedula: string; nombre: string; estado: string; municipio: string; parroquia:string; centro: string; }
interface ReportDocument { id: string; nombreCompleto: string; cedula: string; createdAt: Timestamp; estado: 'pending' | 'verified' | 'rejected'; socialNetwork?: string; profileUrl?: string; scamType?: string; descripcion?: string; evidencias?: string[]; scammerPhone?: string; scammerPagoMovil?: string; scammerBankAccount?: string; caseType?: string; caseDescription?: string; status?: 'pending' | 'verified' | 'rejected'; evidenceUrls?: string[]; phone?: string; pagoMovil?: string; bankAccount?: string; reporterName?: string; }
export type Report = Omit<AppReport, 'nombreCompleto' | 'contactEmail'> & { reporterName?: string };

// =========================================================================
// LÓGICA DE CACHÉ FINAL Y CORRECTA
// =========================================================================

// --- OBTENER DATOS DE LA PERSONA (CON CACHÉ DE FETCH) ---
// Se elimina el `cache()` de React. Se confía en el sistema de caché de datos
// nativo de Next.js, que automáticamente cachea las peticiones `fetch`.
// Esto SI persiste entre diferentes peticiones del navegador.
export async function getCedula(cedula: string): Promise<CedulaData | null> {
  console.log(`[getCedula] Procesando para la cédula: ${cedula}`);

  const appId = process.env.CEDULA_API_APP_ID;
  const token = process.env.CEDULA_API_TOKEN;

  if (!appId || !token) {
    console.error("[getCedula] ERROR CRÍTICO: Variables de entorno no configuradas.");
    throw new Error("Configuración de API incompleta en el servidor.");
  }

  const cleanCedula = cedula.replace(/[^0-9]/g, "");
  const nacionalidad = cedula.toUpperCase().startsWith("E") ? "E" : "V";
  
  const url = `https://api.cedula.com.ve/api/v1?app_id=${appId}&token=${token}&nacionalidad=${nacionalidad}&cedula=${cleanCedula}`;
  
  try {
    // Por defecto, Next.js usa `cache: 'force-cache'` para `fetch`.
    // Esto significa que la respuesta será cacheada y re-utilizada en peticiones futuras.
    const apiResponse = await fetch(url);
    
    if (!apiResponse.ok) {
      console.warn(`[getCedula] La API externa devolvió ${apiResponse.status}. Devolviendo null.`);
      return null;
    }

    const externalData = await apiResponse.json();

    if (externalData.error || !externalData.data) {
      console.warn("[getCedula] La API externa no devolvió datos. Devolviendo null.");
      return null;
    }

    const apiData: ApiCedulaData = externalData.data;
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
    console.error("[getCedula] ERROR EN CATCH. La llamada a fetch falló.", error);
    return null;
  }
}

// --- OBTENER REPORTES (SIN CACHÉ) ---
// Esta es una función async normal. No usa `fetch` y no es envuelta en `cache()`,
// por lo que SIEMPRE consultará la base de datos en tiempo real.
export async function getReportsByCedula(cedula: string): Promise<Report[]> {
    console.log(`[getReportsByCedula] Buscando reportes en tiempo real para: ${cedula}`);
    try {
        const reportsRef = collection(db, "reports");
        const q = query(reportsRef, where("cedula", "==", cedula), where("estado", "==", "verified"));
        const querySnapshot = await getDocs(q);
        console.log(`[getReportsByCedula] Consulta a Firestore completada. ${querySnapshot.docs.length} reportes encontrados.`);

        const reports: Report[] = querySnapshot.docs.map(doc => {
            const data = doc.data() as ReportDocument;
            let status: ReportStatus;
            if (data.status === 'verified') { status = 'approved'; } else if (data.status === 'rejected') { status = 'denied'; } else { status = 'pending'; }
            
            return {
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
        });
        return reports;
    } catch (error) {
        console.error("[getReportsByCedula] ERROR CRÍTICO al buscar reportes:", error);
        return [];
    }
};
