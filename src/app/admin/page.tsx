'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { getAllReports, AdminReport } from "@/lib/services/admin"; 
import { StatsOverview } from "@/components/admin/StatsOverview";
import { ReportsTable } from "@/components/admin/ReportsTable";
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';

export default function AdminPage() {
    const [user, loading, error] = useAuthState(auth);
    const router = useRouter();
    const [reports, setReports] = useState<AdminReport[]>([]);
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

    const handleReportUpdate = (reportId: string, newStatus: AdminReport['status']) => {
        setReports(currentReports =>
            currentReports.map(report =>
                report.id === reportId ? { ...report, status: newStatus } : report
            )
        );
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    if (loading || initialLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#1a2332]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-[#1a2332] text-white">
            <div className="container mx-auto px-4 py-8">
                <header className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Panel de Administración</h1>
                    {/* --- FIX: Explicit dark theme styling for logout button --- */}
                    <Button onClick={handleLogout} className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                        Cerrar Sesión
                    </Button>
                </header>

                <main className="space-y-8">
                    <StatsOverview reports={reports} />
                    <ReportsTable reports={reports} onReportUpdate={handleReportUpdate} />
                </main>
            </div>
        </div>
    );
}