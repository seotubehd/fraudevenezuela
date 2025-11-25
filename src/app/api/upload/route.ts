import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// La configuración del cliente S3 ahora lee las variables de entorno
const r2 = new S3Client({
    region: 'auto',
    // Usamos .trim() para eliminar cualquier espacio en blanco accidental
    endpoint: `https://${process.env.R2_ACCOUNT_ID?.trim()}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

export async function POST(request: NextRequest) {
    try {
        const { filename, contentType } = await request.json();

        if (!filename || !contentType) {
            return NextResponse.json({ error: 'Faltan parámetros de archivo.' }, { status: 400 });
        }

        const presignedUrl = await getSignedUrl(
            r2,
            new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME!,
                Key: filename, // El nombre que tendrá el archivo en R2
                ContentType: contentType,
            }),
            { expiresIn: 60 * 5 } // La URL expira en 5 minutos
        );

        return NextResponse.json({ url: presignedUrl });

    } catch (error) {
        console.error('Error al generar la URL firmada:', error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}
