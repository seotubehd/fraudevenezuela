'use client';
import admin from 'firebase-admin';
import { promises as fs } from 'fs';
import path from 'path';

// Helper to escape XML characters
const escapeXml = (unsafe: string): string => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '\" ': return '&quot;';
            default: return c;
        }
    });
};


// Main function to generate the sitemap
async function generateSitemap() {
    console.log('🔥 Generating sitemap...');
    const baseUrl = 'https://fraudevenezuela.info';
    const lastmod = new Date().toISOString();
    const sitemapPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');
    
    const staticUrls = [
        { loc: baseUrl, changefreq: 'daily', priority: '1.0' },
        { loc: `${baseUrl}/reportar`, changefreq: 'monthly', priority: '0.9' }
    ];

    let dynamicUrls: { loc: string; changefreq: string; priority: string; }[] = [];

    // If Firebase credentials are not available (local env), skip fetching dynamic routes
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        console.warn('⚠️ WARNING: Firebase credentials not found. Generating sitemap with static pages only.');
    } else {
        try {
            console.log('🚀 Initializing Firebase Admin...');
            const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8'));
            if (admin.apps.length === 0) {
                admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
            }
            const adminDb = admin.firestore();
            console.log('✅ Firebase Admin initialized.');

            console.log('🔍 Fetching dynamic routes from Firestore...');
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
            
            cedulas.forEach(cedula => {
                dynamicUrls.push({
                    loc: `${baseUrl}/${cedula}`,
                    changefreq: 'weekly',
                    priority: '0.8'
                });
            });
            console.log(`👍 Found ${cedulas.size} dynamic routes.`);

        } catch (error) {
            console.error("🚨 CRITICAL: Failed to fetch dynamic routes for sitemap.", error);
            // We exit here because if credentials are provided, we expect it to work.
            process.exit(1);
        }
    }

    const allUrls = [...staticUrls, ...dynamicUrls];
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls.map(url => `
  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('')}
</urlset>`;

    try {
        await fs.writeFile(sitemapPath, sitemapContent.trim(), 'utf-8');
        console.log(`✅ Sitemap successfully generated with ${allUrls.length} URLs at: ${sitemapPath}`);
    } catch (error) {
        console.error("🚨 CRITICAL: Failed to write sitemap file.", error);
        process.exit(1);
    }
}

generateSitemap();
