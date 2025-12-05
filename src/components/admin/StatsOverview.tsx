'use client';

import { useEffect, useState } from 'react';
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
    { id: "shares", title: "Veces Compartido" },
];

export function StatsOverview({ reports }: StatsOverviewProps) {
    const [shareCount, setShareCount] = useState(0);

    useEffect(() => {
        const fetchShareCount = async () => {
            try {
                const response = await fetch('/api/shares');
                if (response.ok) {
                    const data = await response.json();
                    setShareCount(data.shareCount);
                } else {
                    console.error('Failed to fetch share count');
                }
            } catch (error) {
                console.error('Error fetching share count:', error);
            }
        };

        fetchShareCount();
    }, []);

    const counts = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        verified: reports.filter(r => r.status === 'verified').length,
        rejected: reports.filter(r => r.status === 'rejected').length,
        shares: shareCount,
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
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
