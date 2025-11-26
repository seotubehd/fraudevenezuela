'use client';
import { useState } from 'react';
import { Report } from "@/types/report";
import { AlertTriangle, Camera, ChevronLeft, ChevronRight, X } from "lucide-react";

interface ApprovedReportsProps {
    reports: Report[];
}

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
        if (!report || !report.evidencia) return;

        let newIndex = currentImage.index;
        if (direction === 'next') {
            newIndex = (currentImage.index + 1) % report.evidencia.length;
        } else {
            newIndex = (currentImage.index - 1 + report.evidencia.length) % report.evidencia.length;
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
                <div key={report.id} className="bg-[#3a1e1e] border border-red-700/50 rounded-lg p-5 shadow-md">
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{report.descripcion}</p>
                    
                    {report.evidencia && report.evidencia.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5"><Camera size={14}/> Evidencia Adjunta</h4>
                            <div className="flex gap-3 flex-wrap">
                                {report.evidencia.map((url, index) => (
                                    <button key={index} onClick={() => openImageViewer(report.id, index)} className="focus:outline-none">
                                        <img 
                                            src={url} 
                                            alt={`Evidencia ${index + 1}`}
                                            className="w-24 h-24 object-cover rounded-md border-2 border-gray-600 hover:border-yellow-400 transition-all cursor-pointer"
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
                if (!report || !report.evidencia) return null;
                
                return (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={closeImageViewer}>
                        <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                            <img 
                                src={report.evidencia[currentImage.index]} 
                                alt="Visor de evidencia" 
                                className="object-contain max-w-full max-h-full rounded-lg"
                            />
                            <button onClick={closeImageViewer} className="absolute top-2 right-2 text-white bg-black/50 rounded-full p-2"><X size={24} /></button>
                            
                            {report.evidencia.length > 1 && (
                                <>
                                    <button onClick={() => changeImage('prev')} className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2"><ChevronLeft size={30} /></button>
                                    <button onClick={() => changeImage('next')} className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2"><ChevronRight size={30} /></button>
                                </>
                            )}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
