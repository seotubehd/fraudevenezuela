"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Check, X, ExternalLink } from "lucide-react";
import { ReportData } from "@/lib/services/reports";
import { Timestamp } from "firebase/firestore";
import { batchUpdateStatus } from "@/lib/services/admin";

interface ExtendedReportData extends ReportData {
    id: string;
    createdAt: Timestamp;
    status: string;
}

interface ReportsTableProps {
    reports: ExtendedReportData[];
    onUpdate: () => void;
}

export function ReportsTable({ reports, onUpdate }: ReportsTableProps) {
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const toggleSelectAll = () => {
        if (selectedRows.length === reports.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(reports.map((r) => r.id));
        }
    };

    const toggleSelectRow = (id: string) => {
        if (selectedRows.includes(id)) {
            setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
        } else {
            setSelectedRows([...selectedRows, id]);
        }
    };

    const handleBatchAction = async (status: 'verified' | 'rejected') => {
        if (selectedRows.length === 0) return;
        setLoading(true);
        try {
            await batchUpdateStatus(selectedRows, status);
            setSelectedRows([]);
            onUpdate();
        } catch (error) {
            console.error("Error updating reports:", error);
            alert("Error al actualizar reportes");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "verified":
                return <Badge className="bg-emerald-500">Verificado</Badge>;
            case "rejected":
                return <Badge variant="destructive">Rechazado</Badge>;
            default:
                return <Badge variant="secondary">Pendiente</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            {selectedRows.length > 0 && (
                <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg border">
                    <span className="text-sm font-medium">
                        {selectedRows.length} seleccionados
                    </span>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                            onClick={() => handleBatchAction("verified")}
                            disabled={loading}
                        >
                            <Check className="mr-2 h-4 w-4" />
                            Aprobar
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50"
                            onClick={() => handleBatchAction("rejected")}
                            disabled={loading}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Rechazar
                        </Button>
                    </div>
                </div>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectedRows.length === reports.length && reports.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Cédula</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No hay reportes registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            reports.map((report) => (
                                <TableRow key={report.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedRows.includes(report.id)}
                                            onCheckedChange={() => toggleSelectRow(report.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {report.createdAt?.toDate().toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="font-medium">{report.cedula}</TableCell>
                                    <TableCell>{report.tipo}</TableCell>
                                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() => navigator.clipboard.writeText(report.cedula)}
                                                >
                                                    Copiar Cédula
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => batchUpdateStatus([report.id], "verified").then(onUpdate)}>
                                                    Marcar como Verificado
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => batchUpdateStatus([report.id], "rejected").then(onUpdate)}>
                                                    Marcar como Rechazado
                                                </DropdownMenuItem>
                                                {report.evidencias && report.evidencias.length > 0 && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem asChild>
                                                            <a href={report.evidencias[0]} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                                Ver Evidencia
                                                            </a>
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
