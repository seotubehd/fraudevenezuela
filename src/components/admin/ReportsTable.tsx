'use client';

import { useState, useMemo, useEffect } from "react";
import { AdminReport } from "@/lib/services/admin"; // Keep the type, remove functions
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Link as LinkIcon, Landmark, Smartphone, Phone, FileText, Mail, User, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReportsTableProps {
    reports: AdminReport[];
    onReportUpdate: (reportIds: string[], newStatus: AdminReport['status']) => void;
    onReportDelete: (reportIds: string[]) => void;
    viewMode: 'grid' | 'list';
}

// ... (Helper components like getStatusClasses, DetailItem, etc. remain unchanged) ...
const getStatusClasses = (status: AdminReport['status']) => {
    switch (status) {
        case "verified": return "bg-green-500/10 text-green-400 border-green-500/30";
        case "rejected": return "bg-red-500/10 text-red-400 border-red-500/30";
        default: return "bg-gray-500/10 text-gray-300 border-gray-500/30";
    }
};

function DetailItem({ label, value, icon, isLink = false, isTextArea = false }: { label: string; value?: string; icon?: React.ReactNode, isLink?: boolean, isTextArea?: boolean }) {
    if (!value) return null;
    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-semibold text-gray-400 flex items-center gap-2">{icon} {label}</Label>
            {isTextArea ? <p className="text-sm text-gray-200 bg-black/20 p-3 rounded-md whitespace-pre-wrap border border-gray-700/50">{value}</p> : isLink ? <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-yellow-400 font-mono bg-black/20 p-2 rounded-md truncate hover:text-yellow-300 border border-gray-700/50 block">{value}</a> : <p className="text-sm font-mono bg-black/20 p-2 rounded-md border border-gray-700/50 text-gray-200">{value}</p>}
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h3 className="font-bold text-lg text-yellow-500 border-b-2 border-yellow-500/30 pb-2 mb-4 mt-2">{children}</h3>;
}

function ReportCard({ report, onOpenModal, onSelect, isSelected }: { report: AdminReport; onOpenModal: (report: AdminReport) => void; onSelect: (id: string, isSelected: boolean) => void; isSelected: boolean; }) {
    return (
        <Card className={`bg-gray-800 border-2 text-white transition-all duration-200 flex flex-col shadow-md ${isSelected ? 'border-yellow-500' : 'border-gray-700 hover:border-gray-600'}`}>
            <div className="absolute top-2 right-2">
                <Checkbox checked={isSelected} onCheckedChange={(checked) => onSelect(report.id, !!checked)} className="h-5 w-5 border-gray-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-400" />
            </div>
            <CardHeader className="pr-10">
                <CardTitle className="text-lg font-bold truncate text-yellow-400 flex items-center gap-2"><User size={18} className="text-yellow-500/80" /> {report.nombreCompleto}</CardTitle>
                <p className="text-sm text-gray-400 font-mono pl-8">{report.cedula}</p>
            </CardHeader>
            <CardContent className="flex-grow flex justify-between items-center">
                <Badge variant={getStatusClasses(report.status) as any} className="capitalize text-xs">{report.status}</Badge>
                <p className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button size="sm" onClick={() => onOpenModal(report)} className="bg-transparent border border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300"><Eye className="mr-2 h-4 w-4" /> Ver Detalles</Button>
            </CardFooter>
        </Card>
    );
}

function ReportRow({ report, onOpenModal, onSelect, isSelected }: { report: AdminReport; onOpenModal: (report: AdminReport) => void; onSelect: (id: string, isSelected: boolean) => void; isSelected: boolean; }) {
    return (
        <div className={`flex items-center gap-4 p-3 rounded-lg transition-colors duration-200 ${isSelected ? 'bg-yellow-500/10' : 'bg-gray-800/50 hover:bg-gray-800'}`}>
            <Checkbox checked={isSelected} onCheckedChange={(checked) => onSelect(report.id, !!checked)} className="h-5 w-5 border-gray-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-400" />
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                <div className="truncate">
                    <p className="font-semibold text-white truncate">{report.nombreCompleto}</p>
                    <p className="text-sm text-gray-400 font-mono">{report.cedula}</p>
                </div>
                <div className="hidden md:block">
                    <Badge variant={getStatusClasses(report.status) as any} className="capitalize text-xs">{report.status}</Badge>
                </div>
                <p className="hidden md:block text-sm text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</p>
                 <p className="md:hidden text-sm text-gray-400 text-right">{new Date(report.createdAt).toLocaleDateString()}</p>
            </div>
            <Button size="sm" onClick={() => onOpenModal(report)} className="bg-transparent border border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300 ml-auto"><Eye className="mr-2 h-4 w-4" /> Ver</Button>
        </div>
    );
}

export function ReportsTable({ reports, onReportUpdate, onReportDelete, viewMode }: ReportsTableProps) {
    const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStatus, setModalStatus] = useState<AdminReport['status']>('pending');
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        setCurrentPage(1);
        setSelectedIds([]);
    }, [reports]);

    const totalPages = Math.ceil(reports.length / ITEMS_PER_PAGE);
    const paginatedReports = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return reports.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [reports, currentPage]);

    const handleSelect = (id: string, isSelected: boolean) => {
        setSelectedIds(prev => isSelected ? [...prev, id] : prev.filter(pId => pId !== id));
    };
    
    const handleSelectAll = () => {
        if (selectedIds.length === paginatedReports.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(paginatedReports.map(r => r.id));
        }
    };

    // MODIFIED: Use the onReportUpdate prop from the parent
    const handleSaveChanges = () => {
        if (!selectedReport) return;
        onReportUpdate([selectedReport.id], modalStatus);
        setIsModalOpen(false);
    };

    // MODIFIED: Use onReportUpdate and onReportDelete props
    const handleBulkAction = (action: 'verified' | 'rejected' | 'delete') => {
        if (selectedIds.length === 0) return;
        
        if (action === 'delete') {
            onReportDelete(selectedIds);
        } else {
            onReportUpdate(selectedIds, action);
        }
        setSelectedIds([]); // Clear selection after action
    };

    const openModal = (report: AdminReport) => {
        setSelectedReport(report);
        setModalStatus(report.status);
        setIsModalOpen(true);
    };

    const openImageModal = (url: string) => {
        setSelectedImageUrl(url);
        setIsImageModalOpen(true);
    };

    return (
        <div className="space-y-4 pb-24">
            {/* ... (JSX for bulk actions bar, grid/list view, pagination etc. remains unchanged) ... */}
            <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-3">
                    {paginatedReports.length > 0 && (
                        <>
                            <Checkbox id="select-all" checked={selectedIds.length > 0 && selectedIds.length === paginatedReports.length} onCheckedChange={handleSelectAll} className="h-5 w-5 border-gray-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-400"/>
                            <Label htmlFor="select-all" className="text-sm font-medium text-gray-300 cursor-pointer">Seleccionar página</Label>
                        </>
                    )}
                </div>
                <p className="text-sm text-gray-400">Mostrando {paginatedReports.length} de {reports.length} reportes</p>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginatedReports.map(report => <ReportCard key={report.id} report={report} onOpenModal={openModal} onSelect={handleSelect} isSelected={selectedIds.includes(report.id)} />)}
                </div>
            ) : (
                <div className="space-y-2">
                    {paginatedReports.map(report => <ReportRow key={report.id} report={report} onOpenModal={openModal} onSelect={handleSelect} isSelected={selectedIds.includes(report.id)} />)}
                </div>
            )}

            {reports.length === 0 && <p className="text-center text-gray-400 py-8">No se encontraron reportes con los filtros actuales.</p>}

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <Button size="icon" variant="outline" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="bg-gray-800 border-gray-600 hover:bg-gray-700"><ChevronLeft className="h-4 w-4" /></Button>
                    <span className="text-gray-300 text-sm font-medium">Página {currentPage} de {totalPages}</span>
                    <Button size="icon" variant="outline" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="bg-gray-800 border-gray-600 hover:bg-gray-700"><ChevronRight className="h-4 w-4" /></Button>
                </div>
            )}

            {selectedReport && (
                 <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="bg-gray-900 border-gray-700 text-white font-sans w-full max-w-4xl h-screen sm:h-auto sm:max-h-[90vh] flex flex-col p-0 sm:rounded-lg">
                        <DialogHeader className="p-6 pb-4 border-b border-gray-700 flex-shrink-0">
                            <DialogTitle className="text-2xl font-bold text-yellow-400 flex items-center gap-3"><span>{selectedReport.nombreCompleto}</span><Badge variant="secondary" className="text-sm font-mono bg-gray-700 text-gray-300">{selectedReport.cedula}</Badge></DialogTitle>
                            <DialogDescription className="text-gray-300 capitalize pt-1">Reporte de: {(selectedReport.scamType || '').replace(/_/g, ' ')}</DialogDescription>
                        </DialogHeader>
                        <div className="p-6 flex-grow overflow-y-auto"><div className="grid md:grid-cols-2 gap-x-8 gap-y-6"><div className="space-y-4"><SectionTitle>Detalles del Incidente</SectionTitle><DetailItem icon={<FileText size={16} />} label="Descripción" value={selectedReport.description} isTextArea /><DetailItem icon={<LinkIcon size={16} />} label="Plataforma" value={selectedReport.socialNetwork} /><DetailItem icon={<LinkIcon size={16} />} label="Perfil/URL del Estafador" value={selectedReport.profileUrl} isLink /><SectionTitle>Datos del Estafador</SectionTitle><DetailItem icon={<Landmark size={16} />} label="Cuenta Bancaria" value={selectedReport.scammerBankAccount} /><DetailItem icon={<Smartphone size={16} />} label="Pago Móvil" value={selectedReport.scammerPagoMovil} /><DetailItem icon={<Phone size={16} />} label="Teléfono" value={selectedReport.scammerPhone} /></div><div className="space-y-4"><SectionTitle>Información del Reportante</SectionTitle><DetailItem icon={<User size={16} />} label="Nombre" value={selectedReport.reporterName} /><DetailItem icon={<Mail size={16} />} label="Email" value={selectedReport.contactEmail} /><DetailItem icon={<Smartphone size={16} />} label="WhatsApp" value={selectedReport.reporterWhatsapp} />{selectedReport.evidencias && selectedReport.evidencias.length > 0 && (<div><SectionTitle>Evidencias</SectionTitle><div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2 rounded-lg bg-black/20 p-3">{selectedReport.evidencias.map((url: string, index: number) => (<button key={index} onClick={() => openImageModal(url)} className="block rounded-lg overflow-hidden border-2 border-gray-700 hover:border-yellow-500 focus:outline-none focus:ring-2 ring-offset-2 ring-offset-gray-900 focus:ring-yellow-500"><img src={url} alt={`Evidencia ${index + 1}`} className="w-full h-24 object-cover" /></button>))}</div></div>)}</div></div></div>
                        <DialogFooter className="p-4 border-t border-gray-700 flex-shrink-0 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 w-full">
                             <div className="w-full sm:w-auto"><Select value={modalStatus} onValueChange={(v) => setModalStatus(v as any)}><SelectTrigger className="w-full sm:w-48 bg-gray-800 border-gray-600 text-gray-200 focus:ring-yellow-500"><SelectValue placeholder="Cambiar estado..." /></SelectTrigger><SelectContent className="bg-gray-800 text-white border-gray-600"><SelectItem value="pending">Pendiente</SelectItem><SelectItem value="verified">Verificado</SelectItem><SelectItem value="rejected">Rechazado</SelectItem></SelectContent></Select></div>
                            {/* MODIFIED: Removed loading state as parent handles it */}
                            <div className="flex gap-3 w-full sm:w-auto"><DialogClose asChild><Button variant="outline" className="w-full sm:w-auto bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700">Cancelar</Button></DialogClose><Button onClick={handleSaveChanges} className="w-full sm:w-auto bg-yellow-500 text-black hover:bg-yellow-600 disabled:opacity-50">Guardar Cambios</Button></div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>)}

            {isImageModalOpen && (<Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}><DialogContent className="p-1 bg-transparent border-0 max-w-5xl w-full h-auto"><img src={selectedImageUrl} alt="Evidencia ampliada" className="rounded-lg object-contain max-h-[90vh] w-full mx-auto" /></DialogContent></Dialog>)}
            
            {/* MODIFIED: Removed loading state as parent handles it */}
            {selectedIds.length > 0 && (<div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-yellow-500/50 shadow-lg z-20 p-3 flex justify-between items-center animate-fade-in-up"><p className="text-white font-semibold">{selectedIds.length} reporte(s) seleccionado(s)</p><div className="flex items-center gap-2"><Button size="sm" variant="outline" onClick={() => handleBulkAction('verified')} className="bg-green-600/20 border-green-500 text-green-300 hover:bg-green-600/40 hover:text-green-200"><CheckCircle className="mr-2 h-4 w-4"/> Aprobar</Button><Button size="sm" variant="outline" onClick={() => handleBulkAction('rejected')} className="bg-red-600/20 border-red-500 text-red-300 hover:bg-red-600/40 hover:text-red-200"><XCircle className="mr-2 h-4 w-4"/> Rechazar</Button><Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}><Trash2 className="mr-2 h-4 w-4"/> Eliminar</Button></div></div>)}
        </div>
    );
}
