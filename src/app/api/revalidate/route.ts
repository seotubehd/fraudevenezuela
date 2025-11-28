import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

// Esta API se encarga de revalidar el caché de datos específicos bajo demanda.
// Es crucial para asegurar que los datos mostrados estén actualizados después de un cambio,
// como la adición de un nuevo reporte.
// Recibe una cédula por query params y revalida los tags asociados a esa cédula.

export async function GET(request: NextRequest) {
    const cedula = request.nextUrl.searchParams.get('cedula');

    // 1. Validar que la cédula fue proporcionada
    if (!cedula) {
        return NextResponse.json({ error: 'El parámetro "cedula" es requerido.' }, { status: 400 });
    }

    // 2. Validar el token de autorización (si existe)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.REVALIDATE_TOKEN}`) {
        return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    // 3. Revalidar los tags asociados a la cédula
    // CORRECCIÓN REAL: Se añade el segundo argumento 'page' a las llamadas de revalidateTag.
    revalidateTag(`cedula:${cedula}`, 'page');
    revalidateTag(`reports:${cedula}`, 'page');

    return NextResponse.json({ revalidated: true, cedula: cedula });
}
