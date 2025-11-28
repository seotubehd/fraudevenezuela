import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, Timestamp, doc, getDoc, setDoc } from "firebase/firestore";
import type { Report as AppReport, ReportStatus } from "@/types/report";

// --- Interfaces (sin cambios) ---
interface ApiCedulaData { nacionalidad: string; cedula: number; rif: string; primer_apellido: string; segundo_apellido: string; primer_nombre: string; segundo_nombre: string; cne?: { estado: string; municipio: string; parroquia: string; centro_electoral: string; }; }
export interface CedulaData { cedula: string; nombre: string; estado: string; municipio: string; parroquia:string; centro: string; }
interface ReportDocument { id: string; nombreCompleto: string; cedula: string; createdAt: Timestamp; estado: 'pending' | 'verified' | 'rejected'; socialNetwork?: string; profileUrl?: string; scamType?: string; descripcion?: string; evidencias?: string[]; scammerPhone?: string; scammerPagoMovil?: string; scammerBankAccount?: string; caseType?: string; caseDescription?: string; status?: 'pending' | 'verified' | 'rejected'; evidenceUrls?: string[]; phone?: string; pagoMovil?: string; bankAccount?: string; reporterName?: string; }
export type Report = Omit<AppReport, 'nombreCompleto' | 'contactEmail'> & { reporterName?: string };

// =========================================================================
// LÓGICA DE ALMACENAMIENTO PERMANENTE EN FIRESTORE
// =========================================================================

export async function getCedula(cedula: string): Promise<CedulaData | null> {
    console.log(`[getCedula] Buscando datos para la cédula: ${cedula}`);
    const peopleRef = doc(db, "people", cedula);

    try {
        // 1. Check Firestore first
        const docSnap = await getDoc(peopleRef);

        if (docSnap.exists()) {
            console.log(`[getCedula] HIT: Datos encontrados en Firestore para ${cedula}. Sirviendo desde la base de datos.`);
            return docSnap.data() as CedulaData;
        }

        // 2. If not in Firestore, fetch from external API
        console.log(`[getCedula] MISS: Datos no encontrados en Firestore. Buscando en la API externa para ${cedula}.`);
        
        const appId = process.env.CEDULA_API_APP_ID;
        const token = process.env.CEDULA_API_TOKEN;

        if (!appId || !token) {
            console.error("[getCedula] ERROR CRÍTICO: Variables de entorno no configuradas.");
            throw new Error("Configuración de API incompleta en el servidor.");
        }

        const cleanCedula = cedula.replace(/[^0-9]/g, "");
        const nacionalidad = cedula.toUpperCase().startsWith("E") ? "E" : "V";
        
        const url = `https://api.cedula.com.ve/api/v1?app_id=${appId}&token=${token}&nacionalidad=${nacionalidad}&cedula=${cleanCedula}`;
        
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

        const personData: CedulaData = {
            cedula: `${apiData.nacionalidad}-${apiData.cedula}`,
            nombre: `${apiData.primer_nombre} ${apiData.segundo_nombre || ''} ${apiData.primer_apellido} ${apiData.segundo_apellido || ''}`.trim(),
            estado: cneData.estado,
            municipio: cneData.municipio,
            parroquia: cneData.parroquia,
            centro: cneData.centro_electoral
        };

        // 3. Save the new data to Firestore for future requests
        console.log(`[getCedula] Datos obtenidos de la API. Guardando en Firestore para ${cedula}.`);
        await setDoc(peopleRef, personData);

        return personData;

    } catch (error) {
        console.error("[getCedula] ERROR EN CATCH. La operación falló.", error);
        return null;
    }
}


// --- OBTENER REPORTES (SIN CACHÉ) - NO CHANGES HERE ---
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
