import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  throw new Error('La variable de entorno FIREBASE_SERVICE_ACCOUNT_BASE64 no está definida en tu archivo .env.local');
}

const serviceAccountJSON = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
const serviceAccount = JSON.parse(serviceAccountJSON);

initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

async function generateBlacklistSummary() {
  console.log('Iniciando la generación del resumen de la lista negra...');

  try {
    const reportsSnapshot = await db.collection('reports').where('status', '==', 'verified').get();

    if (reportsSnapshot.empty) {
      console.log('No se encontraron reportes con el estado "verified". No se generará ningún resumen.');
      return;
    }

    console.log(`Se encontraron ${reportsSnapshot.size} reportes verificados.`);

    const summaryMap = new Map();

    reportsSnapshot.forEach((doc: QueryDocumentSnapshot) => {
      const report = doc.data();
      const { cedula, nombreCompleto, createdAt } = report;

      const reportTimestamp = createdAt instanceof Timestamp ? createdAt : new Timestamp(createdAt._seconds, createdAt._nanoseconds);

      if (summaryMap.has(cedula)) {
        const existing = summaryMap.get(cedula);
        existing.reportCount += 1;
        if (reportTimestamp.toMillis() > existing.lastReportedAt.toMillis()) {
          existing.lastReportedAt = reportTimestamp;
        }
      } else {
        summaryMap.set(cedula, {
          cedula,
          nombreCompleto,
          reportCount: 1,
          lastReportedAt: reportTimestamp,
        });
      }
    });

    console.log(`Se procesaron los reportes, resultando en ${summaryMap.size} personas únicas en la lista negra.`);

    const batch = db.batch();
    const summaryCollectionRef = db.collection('listaNegraResumen');

    summaryMap.forEach((summary) => {
      const docRef = summaryCollectionRef.doc(summary.cedula);
      batch.set(docRef, summary);
    });

    await batch.commit();

    console.log('¡Éxito! La colección "listaNegraResumen" ha sido creada/actualizada con timestamps.');
    console.log(`Se escribieron ${summaryMap.size} documentos en la base de datos.`);
  } catch (error) {
    console.error('Ocurrió un error al generar el resumen de la lista negra:', error);
    process.exit(1);
  }
}

generateBlacklistSummary();
