import { adminDb } from '@/lib/firebase/admin';

export async function GET() {
    const baseUrl = 'https://fraudevenezuela.info';
    const reportsSnapshot = await adminDb.collection('reports').get();
    const searchesSnapshot = await adminDb.collection('searches').get();

    const cedulas = new Set([
        ...reportsSnapshot.docs.map(doc => doc.data().cedula),
        ...searchesSnapshot.docs.map(doc => doc.data().cedula),
    ]);

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

    cedulas.forEach(cedula => {
        sitemap += `
  <url>
    <loc>${baseUrl}/${cedula}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    sitemap += `</urlset>`;

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
