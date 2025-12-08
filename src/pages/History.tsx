import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { History as HistoryIcon, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { scanService } from '@/services';
import type { Scan, PaginatedScans } from '@/types';
import { toast } from 'sonner';

const nutriScoreColors: Record<string, string> = {
    A: 'bg-[#038141]',
    B: 'bg-[#85bb2f]',
    C: 'bg-[#fecb02] text-slate-900',
    D: 'bg-[#ee8100]',
    E: 'bg-[#e63e11]',
};

export default function History() {
    const [data, setData] = useState<PaginatedScans | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchScans = async () => {
        setIsLoading(true);
        try {
            const result = await scanService.list(page, limit);
            setData(result);
        } catch {
            toast.error('Failed to load scan history');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchScans();
    }, [page]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this scan?')) return;
        try {
            await scanService.delete(id);
            toast.success('Scan deleted');
            fetchScans();
        } catch {
            toast.error('Failed to delete scan');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <HistoryIcon className="w-8 h-8" />
                        Scan History
                    </h1>
                    <p className="text-slate-400">
                        {data?.total || 0} total scans
                    </p>
                </div>
                <Link to="/scan">
                    <Button className="bg-green-500 hover:bg-green-400">
                        New Scan
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            ) : data?.scans.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="py-12 text-center">
                        <HistoryIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">No scans yet. Start by scanning a nutrition label!</p>
                        <Link to="/scan" className="mt-4 inline-block">
                            <Button className="bg-green-500 hover:bg-green-400">
                                Start Scanning
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="space-y-4">
                        {data?.scans.map((scan: Scan) => (
                            <Link key={scan.id} to={`/scan/${scan.id}`}>
                                <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer group">
                                    <CardContent className="py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {scan.nutri_score ? (
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white ${nutriScoreColors[scan.nutri_score]}`}>
                                                        {scan.nutri_score}
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center text-slate-400">
                                                        ?
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {scan.barcode || `Scan #${scan.id.slice(0, 8)}`}
                                                    </p>
                                                    <p className="text-slate-400 text-sm">
                                                        {new Date(scan.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant="outline"
                                                    className={scan.status === 'completed' ? 'border-green-500/50 text-green-400' : 'border-yellow-500/50 text-yellow-400'}
                                                >
                                                    {scan.status}
                                                </Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDelete(scan.id);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {data && data.total_pages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <Button
                                variant="outline"
                                className="border-slate-600"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                            </Button>
                            <span className="text-slate-400">
                                Page {page} of {data.total_pages}
                            </span>
                            <Button
                                variant="outline"
                                className="border-slate-600"
                                disabled={page === data.total_pages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
