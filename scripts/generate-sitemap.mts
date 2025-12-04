import admin from 'firebase-admin';
import { promises as fs } from 'fs';
import path from 'path';

let app: admin.app.App;

try {
    console.log('🚀 Initializing Firebase Admin for sitemap generation...');

    if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        throw new Error('The FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is not set.');
    }

    const serviceAccount = JSON.parse(
        Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8')
    );

    // Simplified initialization for Vercel compatibility
    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
    app = admin.app(); // Get the default app

    console.log('✅ Firebase Admin for sitemap initialized successfully.');
} catch (error) {
    console.error('🚨 FATAL: Error initializing Firebase Admin SDK for sitemap. The build will fail.', error);
    process.exit(1);
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

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${baseUrl}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>${baseUrl}/reportar</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>`;

        cedulas.forEach(cedula => {
            const safeUrl = `${baseUrl}/${cedula}`;
            sitemap += `\n  <url>\n    <loc>${escapeXml(safeUrl)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
        });

        sitemap += `\n</urlset>`;

        const sitemapPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');
        await fs.writeFile(sitemapPath, sitemap, 'utf-8');
        console.log(`✅ Sitemap successfully generated with ${cedulas.size} cedula URLs at: ${sitemapPath}`);

    } catch (error) {
        console.error("🚨 CRITICAL: Sitemap generation failed during data fetching or file writing.", error);
        process.exit(1);
    }
}

generateSitemap();
