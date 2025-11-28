import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuración del cliente S3 para Cloudflare R2
const r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

// Cabeceras CORS para permitir solicitudes desde el frontend
const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // O especifica tu dominio de frontend
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// Responde a las solicitudes de "pre-vuelo" OPTIONS
// Esto es crucial para que las solicitudes POST con un cuerpo JSON funcionen desde el navegador
export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}

// Maneja la solicitud POST para obtener la URL firmada
export async function POST(request: NextRequest) {
    try {
        const { filename, contentType } = await request.json();

        if (!filename || !contentType) {
            return new NextResponse(JSON.stringify({ error: 'Faltan los parámetros "filename" o "contentType".' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Crea el comando para solicitar la URL firmada
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: filename,
            ContentType: contentType,
        });

        // Genera la URL firmada que permite la subida
        const presignedUrl = await getSignedUrl(r2, command, { expiresIn: 300 }); // URL válida por 5 minutos

        // Devuelve la URL firmada al cliente
        return new NextResponse(JSON.stringify({ url: presignedUrl }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error al generar la URL firmada:', error);
        return new NextResponse(JSON.stringify({ error: 'Error interno del servidor.' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
}
