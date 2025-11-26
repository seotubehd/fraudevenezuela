import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Sube una lista de archivos a Firebase Storage y devuelve sus URLs públicas.
 * @param reportId El ID del reporte, usado para crear una carpeta única para las evidencias.
 * @param files La lista de archivos (File) a subir.
 * @returns Una promesa que se resuelve con un array de URLs de los archivos subidos.
 */
export async function uploadFilesAndGetURLs(reportId: string, files: File[]): Promise<string[]> {
    // Mapeamos cada archivo a una promesa de subida
    const uploadPromises = files.map(async (file) => {
        // Creamos una referencia única para el archivo en el Storage, dentro de una carpeta por reporte
        // e.g., reports/report_1678886400000/evidence.jpg
        const fileRef = ref(storage, `reports/${reportId}/${file.name}`);
        
        // Subimos el archivo al bucket
        const snapshot = await uploadBytes(fileRef, file);
        
        // Obtenemos la URL de descarga pública
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return downloadURL;
    });

    // Esperamos a que todas las promesas de subida se completen
    const urls = await Promise.all(uploadPromises);
    
    return urls;
}
