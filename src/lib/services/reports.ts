import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, UploadTask } from "firebase/storage"; // Importar uploadBytesResumable y UploadTask

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
 * Sube un archivo de evidencia a Firebase Storage con seguimiento de progreso.
 * @param file - El archivo a subir.
 * @param onProgress - Un callback para recibir el progreso de la subida (de 0 a 100).
 * @returns La URL de descarga del archivo subido.
 */
export function uploadEvidence(
    file: File,
    onProgress?: (progress: number) => void
): Promise<string> {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `evidencias/${Date.now()}_${file.name}`);
        const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                // Observar los cambios de estado como progreso, pausa y reanudación
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) {
                    onProgress(Math.round(progress));
                }
            },
            (error) => {
                // Manejar errores de subida
                console.error("Error al subir el archivo:", error);
                reject(error);
            },
            () => {
                // Manejar la subida exitosa
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                }).catch(reject);
            }
        );
    });
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
