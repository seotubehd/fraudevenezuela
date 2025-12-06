'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { getAdminReports, updateReportsStatus, deleteMultipleReports, AdminReport, AdminData } from "@/lib/services/admin"; 
import { StatsOverview } from "@/components/admin/StatsOverview";
import { ReportsTable } from "@/components/admin/ReportsTable";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signOut } from 'firebase/auth';
import { LayoutGrid, List, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
    const AuthComponent = (props: P) => {
        const [user, loading] = useAuthState(auth);
        const router = useRouter();

        useEffect(() => {
            if (!loading && !user) {
                router.replace('/login');
            }
        }, [user, loading, router]);

        if (loading || !user) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-[#1a2332]">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500"></div>
                </div>
            );
        }

        return <Component {...props} />;
    };
    return AuthComponent;
};

function AdminPanel() {
    const [user] = useAuthState(auth); 
    const router = useRouter();
    
    // --- State Management ---
    const [reports, setReports] = useState<AdminReport[]>([]);
    const [stats, setStats] = useState<AdminData['stats'] | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [searchQuery, setSearchQuery] = useState("");

    // --- Pagination & Filtering State ---
    const [statusFilter, setStatusFilter] = useState('pending');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalReports, setTotalReports] = useState(0);
    const reportsPerPage = 10;

    const getIdToken = useCallback(() => user?.getIdToken(), [user]);

    const fetchAdminData = useCallback(async () => {
        if (!user) return;
        setIsFetching(true);
        try {
            const token = await getIdToken();
            if (!token) throw new Error("401: Token not available");

            const data = await getAdminReports(token, currentPage, reportsPerPage, statusFilter);
            setReports(data.reports || []);
            setStats(data.stats || null);
            setTotalReports(data.totalReports || 0);

        } catch (err) {
            console.error("Error fetching admin data: ", err);
            if (err instanceof Error && (err.message.startsWith('401') || err.message.startsWith('403'))) {
                await signOut(auth);
                router.replace("/login");
            }
        } finally {
            setInitialLoading(false);
            setIsFetching(false);
        }
    }, [user, getIdToken, router, currentPage, reportsPerPage, statusFilter]);

    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    const handleFilterChange = (newStatus: string) => {
        setCurrentPage(1); // Reset to first page when filter changes
        setStatusFilter(newStatus);
    };

    const handleReportUpdate = useCallback(async (reportIds: string[], newStatus: AdminReport['status']) => {
        const token = await getIdToken();
        if (!token) return;
        try {
            await updateReportsStatus(token, reportIds, newStatus);
            // Refetch data to show changes
            fetchAdminData();
        } catch (error) {
            console.error("Failed to update report status:", error);
            alert("Error al actualizar el estado del reporte. Verifique su sesión y permisos.");
        }
    }, [getIdToken, fetchAdminData]);

    const handleReportDelete = useCallback(async (reportIds: string[]) => {
        if (!window.confirm(`¿Está seguro que desea eliminar ${reportIds.length} reporte(s)? Esta acción es irreversible.`)) {
            return;
        }
        const token = await getIdToken();
        if (!token) return;
        try {
            await deleteMultipleReports(token, reportIds);
            // Refetch data, check if the current page becomes empty
            if (reports.length === reportIds.length && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            } else {
                fetchAdminData();
            }
        } catch (error) {
            console.error("Failed to delete reports:", error);
            alert("Error al eliminar los reportes. Verifique su sesión y permisos.");
        }
    }, [getIdToken, fetchAdminData, reports.length, currentPage]);

    const clientSideFilteredReports = reports.filter(report => {
        const query = searchQuery.toLowerCase();
        const nameMatch = (report.nombreCompleto || '').toLowerCase().includes(query);
        const cedulaMatch = (report.cedula || '').includes(query);
        return nameMatch || cedulaMatch;
    });

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    const totalPages = Math.ceil(totalReports / reportsPerPage);

    if (initialLoading) {
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
                    {stats && <StatsOverview stats={stats} />}
                    
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
                                {['pending', 'verified', 'rejected'].map(status => (
                                    <Button key={status} size="sm" onClick={() => handleFilterChange(status)} className={`capitalize transition-colors duration-200 border ${statusFilter === status ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-700'}`}>{status}</Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className={`transition-opacity duration-300 ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
                        <ReportsTable 
                            reports={clientSideFilteredReports} 
                            onReportUpdate={handleReportUpdate} 
                            onReportDelete={handleReportDelete}
                            viewMode={viewMode}
                        />
                    </div>

                    {/* --- PAGINATION CONTROLS --- */}
                    <div className="flex items-center justify-between py-4 text-sm text-gray-400">
                        <div>
                            Mostrando {reports.length} de {totalReports} reportes
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="icon" variant="outline" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1 || isFetching}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span>Página {currentPage} de {totalPages > 0 ? totalPages : 1}</span>
                            <Button size="icon" variant="outline" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages || isFetching}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default withAuth(AdminPanel);