"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { getAllReports } from "@/lib/services/admin";
import { Report } from "@/types/report";
import { StatsOverview } from "@/components/admin/StatsOverview";
import { ReportsTable } from "@/components/admin/ReportsTable";
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';

export default function AdminPage() {
    const [user, loading, error] = useAuthState(auth);
    const router = useRouter();
    const [reports, setReports] = useState<Report[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            getAllReports()
                .then(setReports)
                .catch(err => console.error("Error fetching reports: ", err))
                .finally(() => setInitialLoading(false));
        }
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    if (loading || initialLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Panel de Administración</h1>
                <Button variant="outline" onClick={handleLogout}>Cerrar Sesión</Button>
            </header>

            <main className="space-y-8">
                <StatsOverview reports={reports} />
                <ReportsTable initialReports={reports} />
            </main>
        </div>
    );
}