'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { getAdminReports, AdminReport } from "@/lib/services/admin"; 
import { StatsOverview } from "@/components/admin/StatsOverview";
import { ReportsTable } from "@/components/admin/ReportsTable";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signOut } from 'firebase/auth';
import { LayoutGrid, List, Search } from 'lucide-react';

export default function AdminPage() {
    const [user, loading, error] = useAuthState(auth);
    const router = useRouter();
    const [reports, setReports] = useState<AdminReport[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [filter, setFilter] = useState<"all" | AdminReport['status']>('pending');
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            getAdminReports()
                .then(setReports)
                .catch(err => console.error("Error fetching reports: ", err))
                .finally(() => setInitialLoading(false));
        }
    }, [user]);

    const handleReportUpdate = useCallback((reportIds: string[], newStatus: AdminReport['status']) => {
        setReports(currentReports =>
            currentReports.map(report =>
                reportIds.includes(report.id) ? { ...report, status: newStatus } : report
            )
        );
    }, []);

    const handleReportDelete = useCallback((reportIds: string[]) => {
        setReports(currentReports =>
            currentReports.filter(report => !reportIds.includes(report.id))
        );
    }, []);

    const filteredReports = useMemo(() => {
        if (!reports) return [];
        return reports
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .filter(report => filter === 'all' || report.status === filter)
            .filter(report => {
                const query = searchQuery.toLowerCase();
                const nameMatch = (report.nombreCompleto || '').toLowerCase().includes(query);
                const cedulaMatch = (report.cedula || '').includes(query);
                return nameMatch || cedulaMatch;
            });
    }, [reports, filter, searchQuery]);


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
        <div className="h-screen flex flex-col bg-[#1a2332] text-white">
            <header className="container mx-auto px-4 flex-shrink-0">
                <div className="flex items-center justify-between py-6 flex-wrap gap-4">
                    <h1 className="text-3xl font-bold">Panel de Administración</h1>
                    <Button onClick={handleLogout} className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">Cerrar Sesión</Button>
                </div>
            </header>

            <main className="flex-grow overflow-y-auto">
                <div className="container mx-auto px-4 py-4">
                    <StatsOverview reports={reports} />
                    
                    <Card className="bg-gray-800/50 border-gray-700 my-4">
                        <CardContent className="p-4 space-y-4">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="relative flex-grow w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input placeholder="Buscar por cédula o nombre..." className="pl-10 w-full bg-gray-900 border-gray-600 text-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                </div>
                                 <div className="flex items-center gap-1 bg-gray-900/50 p-1 rounded-lg border border-gray-700 self-end sm:self-center">
                                    <Button size="icon" variant="ghost" onClick={() => setViewMode('grid')} className={`hover:bg-gray-700 ${viewMode === 'grid' ? 'bg-yellow-500 text-black hover:bg-yellow-600' : 'text-gray-400 hover:text-white'}`}>
                                        <LayoutGrid className="h-5 w-5" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => setViewMode('list')} className={`hover:bg-gray-700 ${viewMode === 'list' ? 'bg-yellow-500 text-black hover:bg-yellow-600' : 'text-gray-400 hover:text-white'}`}>
                                        <List className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                                {['all', 'pending', 'verified', 'rejected'].map(status => (
                                    <Button key={status} size="sm" onClick={() => setFilter(status as any)} className={`capitalize transition-colors duration-200 border ${filter === status ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-700'}`}>{status}</Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <ReportsTable 
                        reports={filteredReports} 
                        onReportUpdate={handleReportUpdate} 
                        onReportDelete={handleReportDelete}
                        viewMode={viewMode}
                    />
                </div>
            </main>
        </div>
    );
}