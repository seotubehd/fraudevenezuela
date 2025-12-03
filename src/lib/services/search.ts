import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COUNT_DOCUMENT_ID = 'search_counter';
const countsCollectionRef = doc(db, 'searchCounts', COUNT_DOCUMENT_ID);

export async function getSearchCount(): Promise<number> {
    try {
        const docSnap = await getDoc(countsCollectionRef);
        if (docSnap.exists()) {
            return docSnap.data().count || 0;
        } else {
            // If the document doesn't exist, it might be because it hasn't been created by the server-side API yet.
            // We can initialize it here for the client-side display.
            await setDoc(countsCollectionRef, { count: 0 });
            return 0;
        }
    } catch (error) {
        console.error("Error al obtener el recuento de búsquedas:", error);
        return 0;
    }
}
