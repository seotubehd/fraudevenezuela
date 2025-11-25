import { Uploader } from "@/components/upload/Uploader";

export default function SubidaPage() {
    return (
        <div className="min-h-screen bg-[#1a2332] text-white p-8">
            <h1 className="text-3xl font-bold text-yellow-400 mb-4">Página de Prueba para Subida de Imágenes</h1>
            <p className="text-gray-400 mb-8">Esta página se utilizará para desarrollar y probar la funcionalidad de subida de imágenes a Cloudflare R2.</p>
            
            <Uploader />
        </div>
    );
}
