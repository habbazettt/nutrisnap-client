import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Scan, Barcode, Activity, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: adminService.getStats,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Users</CardTitle>
                        <Users className="w-4 h-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.total_users}</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Scans</CardTitle>
                        <Scan className="w-4 h-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.total_scans}</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Products Cached</CardTitle>
                        <Barcode className="w-4 h-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.total_products}</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Active Users</CardTitle>
                        <Activity className="w-4 h-4 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.active_users}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
