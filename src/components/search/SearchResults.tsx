'use client';

import { useEffect, useState } from "react";
import { getCedula, getReportsByCedula, Report } from "@/lib/services/cedula";
import type { CedulaData } from "@/lib/services/cedula"; // Import type explicitly
import { User, AlertTriangle, ChevronLeft, ChevronRight, Link as LinkIcon, Phone, Smartphone, Landmark, Image as ImageIcon } from "lucide-react";
import { ReportWizard } from "@/components/report/ReportWizard";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface SearchResultsProps {
    cedula: string;
}

// Mapeo para los tipos de estafa
const scamTypeMap: { [key: string]: string } = {
    social_media: "Estafa en Redes Sociales",
    phishing: "Phishing / Suplantación",
    fraudulent_sale: "Venta Fraudulenta",
    other: "Otro tipo",
};

// Helper para formatear Timestamps de Firestore
const formatTimestamp = (timestamp: any) => {
    if (!timestamp || !timestamp.seconds) return "Fecha no disponible";
    const date = new Date(timestamp.seconds * 1000);
    return new Intl.DateTimeFormat('es-VE', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: 'numeric', minute: 'numeric', hour12: true
    }).format(date);
};

export function SearchResults({ cedula }: SearchResultsProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<CedulaData | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [currentReportIndex, setCurrentReportIndex] = useState(0);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState("");

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);
            setCurrentReportIndex(0);
            try {
                const formattedCedula = cedula.includes('-') 
                    ? cedula 
                    : `${cedula.charAt(0)}-${cedula.slice(1)}`;

                const [cedulaResult, reportsResult] = await Promise.all([
                    getCedula(formattedCedula),
                    getReportsByCedula(formattedCedula)
                ]);

                setData(cedulaResult);
                const sortedReports = reportsResult.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
                setReports(sortedReports);

            } catch (err: any) {
                console.error("Error en fetchData:", err);
                setError(err.message || "Error al consultar los datos. Intente nuevamente.");
            } finally {
                setLoading(false);
            }
        }

        if (cedula) {
            fetchData();
        }
    }, [cedula]);

    const openImageModal = (url: string) => {
        setSelectedImageUrl(url);
        setIsImageModalOpen(true);
    };

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

    const currentReport = reports[currentReportIndex];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-gray-700">
                 <div className="flex items-center gap-3">
                    <div className="bg-gray-700 p-2 rounded-full"><User className="h-6 w-6 text-gray-300" /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-white uppercase">{data.nombre}</h2>
                        <p className="text-sm text-gray-400">Datos para C.I. {data.cedula}</p>
                    </div>
                </div>
                <div className="hidden md:block"><ReportWizard personName={data.nombre} personId={data.cedula} /></div>
            </div>

            {reports.length > 0 && (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-center gap-4">
                    <AlertTriangle className="h-8 w-8 text-red-400 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-red-400">¡Alerta de Fraude!</h3>
                        <p className="text-red-300 text-sm">
                            Esta persona tiene {reports.length} {reports.length > 1 ? 'reportes verificados' : 'reporte verificado'}. Mostrando reporte {currentReportIndex + 1}.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#2a3544] border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Información Personal</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-gray-700/50"><span className="text-gray-400">Nombre Completo</span><span className="text-white font-medium text-right">{data.nombre}</span></div>
                        <div className="flex justify-between py-2 border-b border-gray-700/50"><span className="text-gray-400">Cédula</span><span className="text-white font-medium text-right">{data.cedula}</span></div>
                        <div className="flex justify-between py-2 border-b border-gray-700/50"><span className="text-gray-400">RIF</span><span className="text-white font-medium text-right">{data.cedula.replace('-', '')}</span></div>
                        <div className="flex justify-between py-2 border-b border-gray-700/50"><span className="text-gray-400">Centro Electoral</span><span className="text-white font-medium text-right">{data.centro}</span></div>
                        <div className="flex justify-between py-2"><span className="text-gray-400">Ubicación CNE</span><span className="text-white font-medium text-right">{data.estado}</span></div>
                    </div>
                    <div className="block md:hidden mt-6"><ReportWizard personName={data.nombre} personId={data.cedula} /></div>
                </div>

                <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Reportes de Fraude</h3>
                        {reports.length > 1 && (
                            <div className="flex items-center gap-2 text-sm text-white">
                                <button onClick={() => setCurrentReportIndex(prev => Math.max(0, prev - 1))} disabled={currentReportIndex === 0} className="p-1 rounded-full bg-gray-600/50 hover:bg-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="h-4 w-4" /></button>
                                <span>{currentReportIndex + 1} / {reports.length}</span>
                                <button onClick={() => setCurrentReportIndex(prev => Math.min(reports.length - 1, prev + 1))} disabled={currentReportIndex === reports.length - 1} className="p-1 rounded-full bg-gray-600/50 hover:bg-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="h-4 w-4" /></button>
                            </div>
                        )}
                    </div>

                    {reports.length > 0 && currentReport ? (
                        <div className="space-y-4 text-sm flex-grow flex flex-col">
                            <div><span className="text-gray-400">Tipo de Estafa</span><p className="text-white font-medium">{scamTypeMap[currentReport.scamType] || currentReport.scamType}</p></div>
                            <div><span className="text-gray-400">Fecha del Reporte</span><p className="text-white font-medium">{formatTimestamp(currentReport.createdAt)}</p></div>
                            <div><span className="text-gray-400">Descripción</span><p className="text-white font-medium mt-1 bg-gray-800/40 p-3 rounded whitespace-pre-wrap">{currentReport.descripcion}</p></div>
                            
                            {currentReport.evidencias && currentReport.evidencias.length > 0 && (
                                <div className="pt-3">
                                    <h4 className="text-md font-semibold text-white mb-2 flex items-center gap-2"><ImageIcon size={16} /> Evidencias del Reporte</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {currentReport.evidencias.map((url, index) => (
                                            <button 
                                                key={index} 
                                                onClick={() => openImageModal(url)} 
                                                className="block rounded-lg overflow-hidden border-2 border-gray-700 hover:border-yellow-500 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                            >
                                                <img src={url} alt={`Evidencia ${index + 1}`} className="w-full h-24 object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 mt-auto border-t border-gray-700/50">
                                <h4 className="text-md font-semibold text-white mb-3">Datos del Estafador</h4>
                                <div className="space-y-3">
                                     <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-gray-400"><LinkIcon size={14}/> Perfil</span><a href={currentReport.profileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline">Ver Perfil</a></div>
                                    {currentReport.scammerPhone && <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-gray-400"><Phone size={14}/> Teléfono</span><span className="text-white font-medium">{currentReport.scammerPhone}</span></div>}
                                    {currentReport.scammerPagoMovil && <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-gray-400"><Smartphone size={14}/> Pago Móvil</span><span className="text-white font-medium">{currentReport.scammerPagoMovil}</span></div>}
                                    {currentReport.scammerBankAccount && <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-gray-400"><Landmark size={14}/> Cta. Bancaria</span><span className="text-white font-medium">{currentReport.scammerBankAccount}</span></div>}
                                </div>
                            </div>

                             <div className="pt-3 mt-4 border-t border-gray-700/50 text-center">
                                <span className="text-xs text-gray-500">Denuncia realizada por: {currentReport.reporterName || 'Anónimo'}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 flex-grow flex items-center justify-center">
                            <p className="text-gray-400 text-sm">No se encontraron reportes de fraude verificados para esta cédula.</p>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
                <DialogContent className="p-1 bg-transparent border-0 max-w-4xl w-full">
                    <DialogTitle className="sr-only">Imagen de Evidencia</DialogTitle>
                    <img src={selectedImageUrl} alt="Evidencia" className="rounded-lg object-contain max-h-[90vh] w-full" />
                </DialogContent>
            </Dialog>
        </div>
    );
}
