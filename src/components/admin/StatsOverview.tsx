"use client";

import { Report, ReportStatus } from "@/types/report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface StatsOverviewProps {
    reports: Report[];
}

export function StatsOverview({ reports }: StatsOverviewProps) {
    const getCount = (status: ReportStatus) => reports.filter(r => r.estado === status).length;

    const stats = [
        { 
            title: "Pendientes", 
            value: getCount("pendiente"), 
            icon: Clock, 
            color: "text-amber-500"
        },
        { 
            title: "Aprobados", 
            value: getCount("aprobado"), 
            icon: CheckCircle, 
            color: "text-green-500"
        },
        { 
            title: "Denegados", 
            value: getCount("denegado"), 
            icon: XCircle,
            color: "text-red-500"
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat, index) => (
                <Card key={index}>
                    <CardHeader className="flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">Total de reportes</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}