'use client';

import { AdminReport } from "@/lib/services/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsOverviewProps {
    reports: AdminReport[];
}

const statCards = [
    { id: "total", title: "Reportes Totales" },
    { id: "pending", title: "Reportes Pendientes" },
    { id: "verified", title: "Reportes Aprobados" },
    { id: "rejected", title: "Reportes Rechazados" },
];

export function StatsOverview({ reports }: StatsOverviewProps) {
    const counts = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        verified: reports.filter(r => r.status === 'verified').length,
        rejected: reports.filter(r => r.status === 'rejected').length,
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map(card => (
                <Card key={card.id} className="bg-gray-800 border-gray-700 text-white text-center shadow-md hover:shadow-yellow-400/10 transition-shadow duration-300">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium text-gray-300">
                            {card.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-white">
                            {counts[card.id as keyof typeof counts]}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
