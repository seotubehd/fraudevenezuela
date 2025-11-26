'use client';

import { useState, useMemo } from "react";
import { AdminReport, updateReportStatus } from "@/lib/services/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Search, Link as LinkIcon, Landmark, Smartphone, Phone, FileText, Mail, User } from 'lucide-react';

interface ReportsTableProps {
    reports: AdminReport[];
    onReportUpdate: (reportId: string, newStatus: AdminReport['status']) => void;
}

function ReportCard({ report, onOpenModal }: { report: AdminReport; onOpenModal: (report: AdminReport) => void; }) {
    const getStatusVariant = (status: AdminReport['status']) => {
        switch (status) {
            case "verified": return "default"; // FIX: Changed "success" to "default" to match available Badge variants
            case "rejected": return "destructive";
            default: return "secondary";
        }
    };

    return (
        <Card className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700/50 transition-shadow duration-300 flex flex-col shadow-md hover:shadow-yellow-400/10">
            <CardHeader>
                <CardTitle className="text-lg font-bold truncate text-yellow-400 flex items-center gap-2">
                    <User size={18} className="text-yellow-500/80" /> {report.nombreCompleto}
                </CardTitle>
                <p className="text-sm text-gray-400 font-mono pl-8">{report.cedula}</p>
            </CardHeader>
            <CardContent className="flex-grow flex justify-between items-center">
                <Badge variant={getStatusVariant(report.status)} className="capitalize text-xs">
                    {report.status}
                </Badge>
                <p className="text-xs text-gray-400">
                    {new Date(report.createdAt).toLocaleDateString()}
                </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button size="sm" onClick={() => onOpenModal(report)} className="bg-transparent border border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300">
                    <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                </Button>
            </CardFooter>
        </Card>
    );
}

export function ReportsTable({ reports, onReportUpdate }: ReportsTableProps) {
    const [filter, setFilter] = useState<"all" | AdminReport['status']>('pending');
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStatus, setModalStatus] = useState<AdminReport['status']>('pending');
    const [loading, setLoading] = useState(false);

    const filteredReports = useMemo(() => {
        if (!reports) return [];
        return reports
            .filter(report => filter === 'all' || report.status === filter)
            .filter(report => 
                report.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
                report.cedula.includes(searchQuery)
            );
    }, [reports, filter, searchQuery]);

    const handleSaveChanges = async () => {
        if (!selectedReport) return;
        setLoading(true);
        try {
            await updateReportStatus(selectedReport.id, modalStatus);
            onReportUpdate(selectedReport.id, modalStatus);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (report: AdminReport) => {
        setSelectedReport(report);
        setModalStatus(report.status);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input 
                            placeholder="Buscar por cédula o nombre..."
                            className="pl-10 w-full bg-gray-900 border-gray-600 text-white placeholder-gray-500 focus:ring-yellow-400 focus:border-yellow-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        {['all', 'pending', 'verified', 'rejected'].map(status => (
                            <Button 
                                key={status} 
                                size="sm"
                                onClick={() => setFilter(status as any)} 
                                className={`capitalize transition-colors duration-200 border ${filter === status 
                                    ? 'bg-yellow-500 text-black border-yellow-500 hover:bg-yellow-600' 
                                    : 'bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-700'}`}
                            >
                                {status}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map(report => (
                    <ReportCard key={report.id} report={report} onOpenModal={openModal} />
                ))}
            </div>
            {filteredReports.length === 0 && (
                 <p className="text-center text-gray-400 py-8">No se encontraron reportes con los filtros actuales.</p>
            )}

            {/* --- MODAL REBUILD --- */}
            {selectedReport && (
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-4xl bg-gray-900 border-gray-700 text-white font-sans">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-yellow-400 flex items-center gap-3">
                                <span>{selectedReport.nombreCompleto}</span>
                                <Badge variant="secondary" className="text-sm font-mono bg-gray-700 text-gray-300">{selectedReport.cedula}</Badge>
                            </DialogTitle>
                            <DialogDescription className="text-lg text-gray-300 capitalize">
                                Reporte de: {(selectedReport.scamType || '').replace(/_/g, ' ')}
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 mt-4 max-h-[60vh] overflow-y-auto pr-4 -mr-4">
                            {/* Columna Izquierda: Detalles del Incidente */}
                            <div className="space-y-4">
                                <SectionTitle>Detalles del Incidente</SectionTitle>
                                <DetailItem icon={<FileText size={16} />} label="Descripción del Hecho" value={selectedReport.description} isTextArea />
                                <DetailItem icon={<LinkIcon size={16} />} label="Plataforma" value={selectedReport.socialNetwork} />
                                <DetailItem icon={<LinkIcon size={16} />} label="Perfil/URL del Estafador" value={selectedReport.profileUrl} isLink />
                                <DetailItem icon={<Mail size={16} />} label="Email del Reportante" value={selectedReport.contactEmail} />
                            </div>

                            {/* Columna Derecha: Información del Estafador */}
                            <div className="space-y-4">
                                <SectionTitle>Información del Presunto Estafador</SectionTitle>
                                <DetailItem icon={<Landmark size={16} />} label="Cuenta Bancaria" value={selectedReport.scammerBankAccount} />
                                <DetailItem icon={<Smartphone size={16} />} label="Pago Móvil" value={selectedReport.scammerPagoMovil} />
                                <DetailItem icon={<Phone size={16} />} label="Teléfono" value={selectedReport.scammerPhone} />
                            </div>

                            {/* Sección de Evidencias */}
                            {selectedReport.evidencias && selectedReport.evidencias.length > 0 && (
                                <div className="md:col-span-2">
                                     <SectionTitle>Evidencias</SectionTitle>
                                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2 rounded-lg bg-black/20 p-4">
                                         {selectedReport.evidencias.map((url, index) => (
                                             <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden border-2 border-gray-700 hover:border-yellow-500 transition-all duration-200 hover:scale-105">
                                                 <img 
                                                     src={url} 
                                                     alt={`Evidencia ${index + 1}`}
                                                     className="w-full h-32 object-cover"
                                                 />
                                             </a>
                                         ))}
                                     </div>
                                </div>
                            )}
                        </div>

                        {/* --- MODAL FOOTER REBUILD --- */}
                        <DialogFooter className="mt-6 pt-4 border-t border-gray-700 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4">
                             <div className="w-full sm:w-48">
                                <Select value={modalStatus} onValueChange={(v) => setModalStatus(v as any)}>
                                    <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700/80 focus:ring-yellow-500">
                                        <SelectValue placeholder="Cambiar estado..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 text-white border-gray-600">
                                        <SelectItem value="pending" className="hover:bg-yellow-500/10 focus:bg-yellow-500/20">Pendiente</SelectItem>
                                        <SelectItem value="verified" className="hover:bg-green-500/10 focus:bg-green-500/20">Verificado</SelectItem>
                                        <SelectItem value="rejected" className="hover:bg-red-500/10 focus:bg-red-500/20">Rechazado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">Cancelar</Button>
                                <Button onClick={handleSaveChanges} disabled={loading} className="w-full sm:w-auto bg-yellow-500 text-black hover:bg-yellow-600 disabled:opacity-50">
                                    {loading ? "Guardando..." : "Guardar Cambios"}
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

function DetailItem({ label, value, icon, isLink = false, isTextArea = false }: { label: string; value?: string; icon?: React.ReactNode, isLink?: boolean, isTextArea?: boolean }) {
    if (!value) return null;

    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                {icon} {label}
            </Label>
            {isTextArea ? (
                <p className="text-sm text-gray-200 bg-black/20 p-3 rounded-md whitespace-pre-wrap border border-gray-700/50">{value}</p>
            ) : isLink ? (
                 <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-yellow-400 font-mono bg-black/20 p-2 rounded-md truncate hover:text-yellow-300 border border-gray-700/50 block">
                    {value}
                </a>
            ) : (
                <p className="text-sm text-gray-200 font-mono bg-black/20 p-2 rounded-md border border-gray-700/50">{value}</p>
            )}
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h3 className="font-bold text-lg text-yellow-500 border-b-2 border-yellow-500/30 pb-2 mb-3">{children}</h3>
}
