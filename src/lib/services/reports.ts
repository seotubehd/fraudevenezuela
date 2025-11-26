import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Estructura de datos para un reporte de irregularidad
export interface ReportData {
    nombreCompleto: string; // Nombre de la persona afectada
    cedula: string;         // Cédula de la persona afectada
    tipo: string;           // Tipo de irregularidad reportada
    descripcion: string;    // Descripción detallada del problema
    ubicacion?: string;     // Centro de votación o ubicación (opcional)
    contacto?: string;      // Email de contacto del reportante (opcional)
    evidencias?: string[];  // URLs de los archivos de evidencia (opcional)
}

/**
 * Sube un archivo de evidencia a Firebase Storage.
 * @param file - El archivo a subir.
 * @returns La URL de descarga del archivo subido.
 */
export async function uploadEvidence(file: File): Promise<string> {
    try {
        const storageRef = ref(storage, `evidencias/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
}

/**
 * Crea un nuevo documento de reporte en la colección 'reports' de Firestore.
 * @param data - Los datos del reporte que cumplen con la interfaz ReportData.
 */
export async function createReport(data: ReportData) {
    try {
        const docRef = await addDoc(collection(db, "reports"), {
            ...data,
            createdAt: serverTimestamp(), // Fecha de creación en el servidor
            status: "pending"           // Estado inicial: pendiente
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating report:", error);
        throw error;
    }
}
