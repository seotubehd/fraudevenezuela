const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: './.env.local' });

// Check for the necessary environment variable
if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  throw new Error(
    'La variable de entorno FIREBASE_SERVICE_ACCOUNT_BASE64 no está definida en tu archivo .env.local'
  );
}

// Decode the base64 service account and parse the resulting JSON
const serviceAccountJSON = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
const serviceAccount = JSON.parse(serviceAccountJSON);

// Initialize Firebase Admin SDK with the decoded credentials
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function generateBlacklistSummary() {
  console.log('Iniciando la generación del resumen de la lista negra...');

  try {
    // FINAL QUERY: Use the correct status found during inspection
    const reportsSnapshot = await db
      .collection('reports')
      .where('status', '==', 'verified') // <-- The crucial fix!
      .get();

    if (reportsSnapshot.empty) {
      console.log('No se encontraron reportes con el estado "verified". No se generará ningún resumen.');
      return;
    }

    console.log(`Se encontraron ${reportsSnapshot.size} reportes verificados.`);

    const summaryMap = new Map();

    reportsSnapshot.forEach((doc: import('firebase-admin/firestore').QueryDocumentSnapshot) => {
      const report = doc.data();
      const { cedula, nombreCompleto } = report;

      if (summaryMap.has(cedula)) {
        const existing = summaryMap.get(cedula);
        existing.reportCount += 1;
      } else {
        summaryMap.set(cedula, {
          cedula,
          nombreCompleto,
          reportCount: 1,
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

    console.log('¡Éxito! La colección "listaNegraResumen" ha sido creada/actualizada.');
    console.log(`Se escribieron ${summaryMap.size} documentos en la base de datos.`);

  } catch (error) {
    console.error('Ocurrió un error al generar el resumen de la lista negra:', error);
    process.exit(1);
  }
}

generateBlacklistSummary();
