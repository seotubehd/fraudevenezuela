import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COUNT_DOCUMENT_ID = 'search_counter';
const countsCollectionRef = doc(db, 'searchCounts', COUNT_DOCUMENT_ID);

export async function getSearchCount(): Promise<number> {
    try {
        const docSnap = await getDoc(countsCollectionRef);
        if (docSnap.exists()) {
            return docSnap.data().count || 0;
        } else {
            await setDoc(countsCollectionRef, { count: 0 });
            return 0;
        }
    } catch (error) {
        console.error("Error al obtener el recuento de búsquedas:", error);
        return 0;
    }
}

export async function incrementSearchCount(): Promise<void> {
    try {
        const docSnap = await getDoc(countsCollectionRef);
        if (docSnap.exists()) {
            await updateDoc(countsCollectionRef, {
                count: increment(1)
            });
        } else {
            await setDoc(countsCollectionRef, { count: 1 });
        }
    } catch (error) {
        console.error("Error al incrementar el recuento de búsquedas:", error);
    }
}

export async function resetSearchCount(): Promise<void> {
    try {
        await setDoc(countsCollectionRef, { count: 0 });
    } catch (error) {
        console.error("Error al restablecer el recuento de búsquedas:", error);
    }
}
