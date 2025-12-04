
// 1. Cargar EXPLICITAMENTE las variables de entorno desde .env.local
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// 2. SOLO importar tipos y utilidades que no inicialicen la app de Firebase
import { Timestamp } from 'firebase-admin/firestore';
import fs from 'fs';

// Define cómo lucen los datos en tu archivo JSON
interface OldReport {
    cedula: string;
    nombreCompleto: string;
    socialNetwork: string;
    profileUrl: string;
    scamType: string;
    descripcion: string;
    scammerPhone: string;
    scammerPagoMovil: string;
    scammerBankAccount: string;
    evidencias: string[];
    reporterName: string;
    contactEmail: string | null;
    reporterWhatsapp: string | null;
    createdAt: string; 
    status: string;
    estado: string;
}

async function deleteCollection(collectionRef: FirebaseFirestore.CollectionReference, batchSize: number) {
    const query = collectionRef.limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(query, resolve, reject);
    });
}

async function deleteQueryBatch(query: FirebaseFirestore.Query, resolve: (value: unknown) => void, reject: (reason?: any) => void) {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
        resolve(true);
        return;
    }

    const batch = query.firestore.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();

    process.nextTick(() => {
        deleteQueryBatch(query, resolve, reject);
    });
}


// Función principal que hace la migración
const migrateData = async () => {
    try {
        console.log('🚀 Forzando la carga de variables de entorno ANTES de la importación de Firebase...');

        // 3. Importar dinámicamente adminDb DESPUÉS de que dotenv haya cargado las variables
        const { adminDb } = await import('../src/lib/firebase-admin.js');

        console.log('✅ ¡Éxito! Credenciales de administrador cargadas. Procediendo con la migración.');

        const reportsCollection = adminDb.collection('reports');
        
        console.log('🗑️  Borrando todos los reportes existentes para asegurar una migración limpia...');
        await deleteCollection(reportsCollection, 50);
        console.log('✅ Colección de reportes purgada.');


        const dataPath = path.resolve(process.cwd(), 'src/components/upload/migration-data.json');
        const fileContent = fs.readFileSync(dataPath, 'utf-8');
        const oldReports: OldReport[] = JSON.parse(fileContent);

        console.log(`🔍 Se encontraron ${oldReports.length} reportes en el archivo para migrar.`);

        for (const oldReport of oldReports) {

            // --- ¡CORRECCIÓN CLAVE! ---
            // Formatear la Cédula para que coincida con el formato de la aplicación (V-XXXXXXXX)
            let formattedCedula = oldReport.cedula || '';
            // Si no está vacía y NO empieza con V- o E-
            if (formattedCedula && !/^[VE]-/i.test(formattedCedula)) {
                // Limpia cualquier caracter no numérico (por si acaso)
                const numericCedula = formattedCedula.replace(/[^0-9]/g, '');
                if (numericCedula) {
                    // Añade el prefijo 'V-'
                    formattedCedula = `V-${numericCedula}`;
                } else {
                    formattedCedula = 'No disponible';
                }
            } else if (!formattedCedula) {
                formattedCedula = 'No disponible';
            }
            
            console.log(`  -> Procesando reporte C.I. ${oldReport.cedula} como ${formattedCedula}...`);

            const cleanedEvidencias = oldReport.evidencias.filter(url => url && url.startsWith('http'));

            const dateObject = new Date(oldReport.createdAt);
            if (isNaN(dateObject.getTime())) {
                console.error(`      ❌ Error: Fecha inválida para C.I. ${oldReport.cedula}. Saltando este registro.`);
                continue;
            }
            const firestoreTimestamp = Timestamp.fromDate(dateObject);

            const newReportData: any = {
                cedula: formattedCedula, // Usar la cédula formateada
                nombreCompleto: oldReport.nombreCompleto || 'No disponible',
                socialNetwork: oldReport.socialNetwork || 'No disponible',
                profileUrl: oldReport.profileUrl || '',
                scamType: oldReport.scamType || 'No disponible',
                description: oldReport.descripcion || '',
                scammerPhone: oldReport.scammerPhone || 'No disponible',
                scammerPagoMovil: oldReport.scammerPagoMovil || 'No disponible',
                scammerBankAccount: oldReport.scammerBankAccount || 'No disponible',
                evidencias: cleanedEvidencias,
                reporterName: oldReport.reporterName || 'Anónimo',
                createdAt: firestoreTimestamp,
                status: 'pending', // Todos los reportes migrados inician como pendientes
                estado: 'pending', // Mantenemos ambos campos por consistencia
            };

            if (oldReport.contactEmail) {
                newReportData.contactEmail = oldReport.contactEmail;
            }
            if (oldReport.reporterWhatsapp) {
                newReportData.reporterWhatsapp = oldReport.reporterWhatsapp;
            }

            await reportsCollection.add(newReportData);
            console.log(`      ✅ ¡Reporte para C.I. ${formattedCedula} subido con éxito!`);
        }

        console.log('\n🎉 ¡Migración completada! Todos los reportes han sido subidos a Firestore con el formato de C.I. correcto.');

    } catch (error) {
        console.error('\n🚨 Ocurrió un error grave durante el proceso de migración:', error);
        console.log('Es posible que solo una parte de los datos haya sido migrada.');
    }
};

migrateData();
