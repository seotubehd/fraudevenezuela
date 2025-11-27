'use client';
import { useState } from 'react';
import { Report } from "@/types/report";
import { AlertTriangle, Camera, ChevronLeft, ChevronRight, X, FileText, User, Phone, Smartphone, Landmark } from "lucide-react";

interface ApprovedReportsProps {
    reports: Report[];
}

const scamTypeMap: { [key: string]: string } = {
    social_media: "Estafa en Redes Sociales",
    phishing: "Phishing / Suplantación de Identidad",
    fraudulent_sale: "Venta Fraudulenta",
    other: "Otro tipo de Estafa",
};

const DetailItem = ({ icon, label, value, isLink = false }: { icon: React.ReactNode, label: string, value: string | undefined, isLink?: boolean }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 p-2 rounded-md bg-black/20">
            <div className="text-yellow-400 mt-1">{icon}</div>
            <div>
                <p className="text-xs font-bold text-gray-400">{label}</p>
                {isLink ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline break-all">
                        {value}
                    </a>
                ) : (
                    <p className="text-sm text-white break-words">{value}</p>
                )}
            </div>
        </div>
    );
};


export function ApprovedReports({ reports }: ApprovedReportsProps) {
    const [currentImage, setCurrentImage] = useState<{reportId: string, index: number} | null>(null);

    const openImageViewer = (reportId: string, index: number) => {
        setCurrentImage({ reportId, index });
    };

    const closeImageViewer = () => {
        setCurrentImage(null);
    };

    const changeImage = (direction: 'next' | 'prev') => {
        if (!currentImage) return;
        const report = reports.find(r => r.id === currentImage.reportId);
        if (!report || !report.evidencias) return;

        let newIndex = currentImage.index;
        if (direction === 'next') {
            newIndex = (currentImage.index + 1) % report.evidencias.length;
        } else {
            newIndex = (currentImage.index - 1 + report.evidencias.length) % report.evidencias.length;
        }
        setCurrentImage({ ...currentImage, index: newIndex });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="text-yellow-400" />
                Reportes de Fraude Aprobados
            </h3>
            {reports.map((report) => (
                <div key={report.id} className="bg-[#3a1e1e] border border-red-700/50 rounded-lg p-4 sm:p-5 shadow-lg">
                    
                    <p className="text-base text-gray-200 whitespace-pre-wrap mb-4">{report.descripcion}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <DetailItem icon={<FileText size={18} />} label="Tipo de Estafa" value={scamTypeMap[report.scamType] || report.scamType} />
                        <DetailItem icon={<User size={18} />} label="Perfil del Estafador" value={report.profileUrl} isLink={true}/>
                        <DetailItem icon={<Phone size={18} />} label="Teléfono" value={report.scammerPhone} />
                        <DetailItem icon={<Smartphone size={18} />} label="Pago Móvil" value={report.scammerPagoMovil} />
                        <DetailItem icon={<Landmark size={18} />} label="Cuenta Bancaria" value={report.scammerBankAccount} />
                    </div>
                    
                    {report.evidencias && report.evidencias.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1.5"><Camera size={16}/> Evidencia Adjunta</h4>
                            <div className="flex gap-3 flex-wrap">
                                {report.evidencias.map((url, index) => (
                                    <button key={index} onClick={() => openImageViewer(report.id, index)} className="focus:outline-none rounded-md overflow-hidden border-2 border-gray-600/50 hover:border-yellow-400 transition-all focus:ring-2 focus:ring-yellow-400">
                                        <img 
                                            src={url} 
                                            alt={`Evidencia ${index + 1}`}
                                            className="w-24 h-24 object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* Visor de Imágenes Modal */}
            {currentImage !== null && (() => {
                const report = reports.find(r => r.id === currentImage.reportId);
                if (!report || !report.evidencias) return null;
                
                return (
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={closeImageViewer}>
                        <div className="relative w-full h-full max-w-4xl max-h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            <img 
                                src={report.evidencias[currentImage.index]} 
                                alt="Visor de evidencia" 
                                className="object-contain max-w-full max-h-full rounded-lg"
                            />
                            <button onClick={closeImageViewer} className="absolute top-2 right-2 text-white bg-black/60 rounded-full p-2 hover:bg-black/80 transition-colors"><X size={24} /></button>
                            
                            {report.evidencias.length > 1 && (
                                <>
                                    <button onClick={(e) => {e.stopPropagation(); changeImage('prev');}} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white bg-black/60 rounded-full p-2 hover:bg-black/80 transition-colors"><ChevronLeft size={30} /></button>
                                    <button onClick={(e) => {e.stopPropagation(); changeImage('next');}} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white bg-black/60 rounded-full p-2 hover:bg-black/80 transition-colors"><ChevronRight size={30} /></button>
                                </>
                            )}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
