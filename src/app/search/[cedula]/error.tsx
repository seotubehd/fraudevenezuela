'use client'; // Los componentes de error deben ser Componentes de Cliente

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Opcional: Registrar el error en un servicio de monitorización
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto bg-[#2a3544] border border-red-700 rounded-lg p-8 text-center mt-10">
      <div className="flex justify-center mb-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">¡Ups! Algo salió mal.</h2>
      <p className="text-gray-400 mb-6">
        Ocurrió un error inesperado al procesar tu búsqueda. Esto puede ser un problema temporal. Por favor, intenta de nuevo.
      </p>
      <Button
        onClick={
          // Intenta recuperarse volviendo a renderizar el segmento
          () => reset()
        }
        className="bg-yellow-500 hover:bg-yellow-600 text-black"
      >
        Intentar de Nuevo
      </Button>
    </div>
  );
}
