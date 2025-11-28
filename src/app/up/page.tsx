'use client';

import { Uploader } from "@/components/upload/Uploader";
import { useState } from "react";

export default function SubidaPage() {
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

    const handleUploadComplete = (urls: string[]) => {
        console.log("Archivos subidos con éxito:", urls);
        setUploadedUrls(prev => [...prev, ...urls]);
    };

    return (
        <div className="min-h-screen bg-[#1a2332] text-white p-8">
            <h1 className="text-3xl font-bold text-yellow-400 mb-4">Página de Prueba para Subida de Imágenes</h1>
            <p className="text-gray-400 mb-8">Esta página se utilizará para desarrollar y probar la funcionalidad de subida de imágenes a Cloudflare R2.</p>
            
            <Uploader onUploadComplete={handleUploadComplete} />

            {uploadedUrls.length > 0 && (
                <div className="mt-8 p-4 border border-gray-600 rounded-lg">
                    <h2 className="text-2xl font-semibold text-yellow-400 mb-4">Resultados de la Subida</h2>
                    <p className="text-gray-400 mb-4">Las siguientes imágenes se han subido y están disponibles públicamente:</p>
                    <ul className="space-y-2">
                        {uploadedUrls.map((url, index) => (
                            <li key={index} className="flex items-center gap-4 p-2 bg-gray-800 rounded-md">
                                <img src={url} alt={`Imagen subida ${index + 1}`} className="w-20 h-20 object-cover rounded" />
                                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                                    {url}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
