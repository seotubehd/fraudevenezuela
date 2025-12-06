'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// The component now receives the pre-calculated stats object.
interface StatsOverviewProps {
    stats: {
        total: number;
        pending: number;
        verified: number;
        rejected: number;
        shares: number;
    } | null; // Stats can be null during initial load.
}

// The keys here must match the keys in the `stats` object.
const statCards = [
    { id: "total", title: "Reportes Totales" },
    { id: "pending", title: "Reportes Pendientes" },
    { id: "verified", title: "Reportes Aprobados" },
    { id: "rejected", title: "Reportes Rechazados" },
    { id: "shares", title: "Veces Compartido" },
];

export function StatsOverview({ stats }: StatsOverviewProps) {
    // If stats are not yet available, render a loading state or nothing.
    if (!stats) {
        // Render placeholders to prevent layout shift
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 animate-pulse">
                {statCards.map(card => (
                    <Card key={card.id} className="bg-gray-800/80 border-gray-700">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium text-gray-400">
                                {card.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-10 bg-gray-700 rounded w-1/2 mx-auto"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

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
                            {/* Directly access the pre-calculated count from the stats object */}
                            {stats[card.id as keyof typeof stats]}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
