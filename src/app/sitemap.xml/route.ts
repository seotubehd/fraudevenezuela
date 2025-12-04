import { adminDb } from '@/lib/firebase/admin';

export const revalidate = 86400; // Revalidar cada 24 horas

// Función para escapar caracteres especiales de XML
const escapeXml = (unsafe: string) => {
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

export async function GET() {
    const baseUrl = 'https://fraudevenezuela.info';
    const lastmod = new Date().toISOString();

    try {
        // Solo seleccionamos el campo 'cedula' para mayor eficiencia
        const reportsSnapshot = await adminDb.collection('reports').select('cedula').get();
        const searchesSnapshot = await adminDb.collection('searches').select('cedula').get();

        const cedulas = new Set<string>();

        // Agregamos cédulas de los reportes, filtrando valores no válidos
        reportsSnapshot.docs.forEach(doc => {
            const cedula = doc.data().cedula;
            if (cedula && typeof cedula === 'string' && cedula !== 'No disponible') {
                cedulas.add(cedula);
            }
        });

        // Agregamos cédulas de las búsquedas, filtrando valores no válidos
        searchesSnapshot.docs.forEach(doc => {
            const cedula = doc.data().cedula;
            if (cedula && typeof cedula === 'string' && cedula !== 'No disponible') {
                cedulas.add(cedula);
            }
        });

        // Construimos el sitemap
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
  </url>
`;

        cedulas.forEach(cedula => {
            const safeUrl = `${baseUrl}/${cedula}`;
            sitemap += `
  <url>
    <loc>${escapeXml(safeUrl)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
        });

        sitemap += `</urlset>`;

        return new Response(sitemap, {
            headers: { 'Content-Type': 'application/xml' },
        });

    } catch (error) {
        console.error("Sitemap generation failed:", error);
        // Devolver un error 500 claro si algo sale mal
        return new Response("Sitemap generation failed.", {
            status: 500,
            headers: { 'Content-Type': 'text/plain' },
        });
    }
}
