import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export interface ReportData {
    cedula: string;
    tipo: string;
    descripcion: string;
    ubicacion?: string;
    contacto?: string;
    evidencias?: string[];
}

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

export async function createReport(data: ReportData) {
    try {
        const docRef = await addDoc(collection(db, "reports"), {
            ...data,
            createdAt: serverTimestamp(),
            status: "pending" // pending, verified, rejected
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating report:", error);
        throw error;
    }
}
