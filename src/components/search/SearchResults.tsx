'use client';

import { useEffect, useState } from "react";
import { getCedula, CedulaData } from "@/lib/services/cedula";
import { User } from "lucide-react";
import { ReportWizard } from "@/components/report/ReportWizard";

interface SearchResultsProps {
    cedula: string;
}

export function SearchResults({ cedula }: SearchResultsProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<CedulaData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const result = await getCedula(cedula);
                setData(result);
            } catch (err) {
                console.error(err);
                setError("Error al consultar la base de datos. Intente nuevamente.");
            } finally {
                setLoading(false);
            }
        }

        if (cedula) {
            fetchData();
        }
    }, [cedula]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f59e0b]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="max-w-2xl mx-auto bg-[#2a3544] border border-gray-700 rounded-lg p-6 text-center">
                <p className="text-gray-400">No se encontraron datos para la cédula {cedula}</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header con nombre y botón reportar */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="bg-gray-700 p-2 rounded-full">
                        <User className="h-6 w-6 text-gray-300" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white uppercase">
                            {data.nombre}
                        </h2>
                        <p className="text-sm text-gray-400">
                            Datos para C.I. {data.cedula}
                        </p>
                    </div>
                </div>
                <div className="hidden md:block">
                    <ReportWizard />
                </div>
            </div>

            {/* Contenido en dos columnas */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Columna izquierda: Información Personal */}
                <div className="bg-[#2a3544] border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 text-center md:text-left">
                        Información Personal
                    </h3>
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:justify-between py-2 border-b border-gray-700">
                            <span className="text-gray-400 text-sm">Nombre Completo</span>
                            <span className="text-white font-medium text-sm md:text-right">{data.nombre}</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:justify-between py-2 border-b border-gray-700">
                            <span className="text-gray-400 text-sm">Cédula</span>
                            <span className="text-white font-medium text-sm md:text-right">{data.cedula}</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:justify-between py-2 border-b border-gray-700">
                            <span className="text-gray-400 text-sm">RIF</span>
                            <span className="text-white font-medium text-sm md:text-right">{data.cedula.replace('-', '')}</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:justify-between py-2 border-b border-gray-700">
                            <span className="text-gray-400 text-sm">Centro Electoral</span>
                            <span className="text-white font-medium text-sm md:text-right">{data.centro}</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:justify-between py-2">
                            <span className="text-gray-400 text-sm">Ubicación CNE</span>
                            <span className="text-white font-medium text-sm md:text-right">{data.estado}</span>
                        </div>
                    </div>
                     <div className="block md:hidden mt-6">
                        <ReportWizard />
                    </div>
                </div>

                {/* Columna derecha: Reportes de Fraude */}
                <div className="bg-[#1e3a3a] border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        Reportes de Fraude
                    </h3>
                    <div className="text-center py-8">
                        <p className="text-gray-400 text-sm">
                            No se encontraron reportes de fraude para esta cédula.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
