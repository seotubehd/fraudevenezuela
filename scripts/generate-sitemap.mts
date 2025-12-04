import * as admin from 'firebase-admin';
import { promises as fs } from 'fs';
import path from 'path';

// Este es un script independiente. Inicializa una app de Firebase separada.
let app;

try {
    console.log('🚀 Initializing Firebase Admin for sitemap generation...');
    
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      throw new Error('The FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is not set. Sitemap generation cannot proceed.');
    }
    
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8')
    );
    
    // Usa un nombre único para evitar conflictos
    app = admin.apps.find(a => a?.name === 'sitemap-generator') || admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    }, 'sitemap-generator');

    console.log('✅ Firebase Admin for sitemap initialized successfully.');
} catch (error) {
    console.error('🚨 FATAL: Error initializing Firebase Admin SDK for sitemap. The build will fail.', error);
    process.exit(1); // Salir con código de error para fallar la build
}

const adminDb = app.firestore();

const escapeXml = (unsafe: string): string => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
};

async function generateSitemap() {
    console.log('🔥 Generating static sitemap...');
    const baseUrl = 'https://fraudevenezuela.info';
    const lastmod = new Date().toISOString();

    try {
        const reportsSnapshot = await adminDb.collection('reports').select('cedula').get();
        const searchesSnapshot = await adminDb.collection('searches').select('cedula').get();

        const cedulas = new Set<string>();

        reportsSnapshot.docs.forEach(doc => {
            const cedula = doc.data().cedula;
            if (cedula && typeof cedula === 'string' && cedula.trim().length > 0 && cedula !== 'No disponible') {
                cedulas.add(cedula.trim());
            }
        });

        searchesSnapshot.docs.forEach(doc => {
            const cedula = doc.data().cedula;
            if (cedula && typeof cedula === 'string' && cedula.trim().length > 0 && cedula !== 'No disponible') {
                cedulas.add(cedula.trim());
            }
        });

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/reportar</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`;

        cedulas.forEach(cedula => {
            const safeUrl = `${baseUrl}/${cedula}`;
            sitemap += `
  <url>
    <loc>${escapeXml(safeUrl)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });

        sitemap += `\n</urlset>`;

        const sitemapPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');
        await fs.writeFile(sitemapPath, sitemap, 'utf-8');
        console.log(`✅ Sitemap successfully generated with ${cedulas.size} cedula URLs at: ${sitemapPath}`);

    } catch (error) {
        console.error("🚨 CRITICAL: Sitemap generation failed during data fetching or file writing.", error);
        process.exit(1); // Fail the build
    }
}

generateSitemap();
