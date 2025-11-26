"use client";

import { useState } from "react";
import { Report, ReportStatus } from "@/types/report";
import { updateReportStatus } from "@/lib/services/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Check, X } from 'lucide-react';

interface ReportsTableProps {
    initialReports: Report[];
}

export function ReportsTable({ initialReports }: ReportsTableProps) {
    const [reports, setReports] = useState<Report[]>(initialReports);
    const [loading, setLoading] = useState<Record<string, boolean>>({});

    const handleStatusChange = async (reportId: string, newStatus: ReportStatus) => {
        setLoading(prev => ({ ...prev, [reportId]: true }));
        try {
            await updateReportStatus(reportId, newStatus);
            setReports(prev => 
                prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r)
            );
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setLoading(prev => ({ ...prev, [reportId]: false }));
        }
    };

    const getStatusVariant = (status: ReportStatus) => {
        switch (status) {
            case "aprobado": return "default"; // Changed from "success"
            case "rechazado": return "destructive";
            default: return "secondary";
        }
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Cédula</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {reports.map((report) => (
                    <TableRow key={report.id}>
                        <TableCell className="font-mono">{report.cedula}</TableCell>
                        <TableCell className="max-w-sm truncate">{report.descripcion}</TableCell>
                        <TableCell className="text-center">
                            <Badge variant={getStatusVariant(report.status)} className="capitalize">
                                {report.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" disabled={loading[report.id]}>
                                        {loading[report.id] ? 
                                         <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div> : 
                                         <MoreHorizontal className="h-4 w-4" />}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleStatusChange(report.id, "aprobado")}>
                                        <Check className="mr-2 h-4 w-4 text-green-500"/> Aprobar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(report.id, "rechazado")}>
                                        <X className="mr-2 h-4 w-4 text-red-500"/> Rechazar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}