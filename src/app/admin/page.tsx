"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsOverview } from "@/components/admin/StatsOverview";
import { ReportsTable } from "@/components/admin/ReportsTable";
import { getDashboardStats, getAllReports, DashboardStats } from "@/lib/services/admin";
import { LogOut, RefreshCw } from "lucide-react";

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [reports, setReports] = useState<any[]>([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/login");
            } else {
                fetchData();
            }
        });

        return () => unsubscribe();
    }, [router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsData, reportsData] = await Promise.all([
                getDashboardStats(),
                getAllReports()
            ]);
            setStats(statsData);
            setReports(reportsData);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await auth.signOut();
        router.push("/login");
    };

    if (loading && !stats) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col">
            <div className="border-b">
                <div className="flex h-16 items-center px-4 md:px-8">
                    <h2 className="text-lg font-semibold">Panel de Administración</h2>
                    <div className="ml-auto flex items-center space-x-4">
                        <Button variant="outline" size="sm" onClick={fetchData}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Actualizar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Salir
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Resumen</TabsTrigger>
                        <TabsTrigger value="reports">Reportes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        {stats && <StatsOverview stats={stats} />}
                    </TabsContent>

                    <TabsContent value="reports" className="space-y-4">
                        <ReportsTable reports={reports} onUpdate={fetchData} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
