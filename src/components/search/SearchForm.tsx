'use client';

import { useState } from 'react';
// Eliminamos la importación de useRouter ya que no la usaremos más.
// import { useRouter } from 'next/navigation'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export function SearchForm() {
    // Ya no necesitamos inicializar el router.
    // const router = useRouter();
    const [cedula, setCedula] = useState('');
    const [nacionalidad, setNacionalidad] = useState('V');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (cedula.trim()) {
            const absolutePath = `/${nacionalidad}${cedula.trim()}`;
            
            // --- LA CORRECCIÓN CLAVE ---
            // Reemplazamos router.push por window.location.href.
            // Esto fuerza una recarga completa de la página, evitando la navegación
            // del lado del cliente que estaba causando inconsistencias con la API externa.
            // Ahora, cada búsqueda será tratada como la primera, asegurando que la 
            // lógica del servidor se ejecute de manera predecible siempre.
            window.location.href = absolutePath;
        }
    };

    return (
        <div className="bg-[#2a3544] rounded-lg p-6 shadow-xl border border-gray-700">
            <form onSubmit={handleSubmit}>
                <Label htmlFor="cedula" className="text-gray-300 text-sm mb-2 block">
                    Número de Cédula
                </Label>
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex flex-1 gap-2">
                        <Select value={nacionalidad} onValueChange={setNacionalidad}>
                            <SelectTrigger className="w-20 bg-[#1a2332] border-gray-600 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="V">V</SelectItem>
                                <SelectItem value="E">E</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            id="cedula"
                            type="text"
                            placeholder="Ej: 12345678"
                            value={cedula}
                            onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
                            required
                            className="flex-1 bg-[#1a2332] border-gray-600 text-white placeholder:text-gray-500"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    >
                        Buscar
                    </Button>
                </div>
            </form>
        </div>
    );
}
