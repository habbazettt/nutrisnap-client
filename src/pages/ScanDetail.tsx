import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Clock, AlertTriangle, CheckCircle, Info, XCircle, Barcode, Image } from 'lucide-react';
import { scanService } from '@/services';
import type { Scan, InsightType } from '@/types';
import { toast } from 'sonner';

const nutriScoreColors: Record<string, string> = {
    A: 'bg-[#038141] text-white',
    B: 'bg-[#85bb2f] text-white',
    C: 'bg-[#fecb02] text-slate-900',
    D: 'bg-[#ee8100] text-white',
    E: 'bg-[#e63e11] text-white',
};

const highlightColors: Record<string, string> = {
    low: 'bg-green-500/10 text-green-400 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    high: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const insightIcons: Record<InsightType, typeof CheckCircle> = {
    positive: CheckCircle,
    negative: XCircle,
    warning: AlertTriangle,
    neutral: Info,
};

const insightColors: Record<InsightType, string> = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    warning: 'text-yellow-400',
    neutral: 'text-blue-400',
};

export default function ScanDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [scan, setScan] = useState<Scan | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchScan = async () => {
            if (!id) return;
            try {
                const data = await scanService.getById(id);
                setScan(data);

                // Use image_url directly from response (backend returns presigned URL)
                // If not available, try to get it from separate endpoint
                if (data.image_url) {
                    setImageUrl(data.image_url);
                } else {
                    try {
                        const url = await scanService.getImage(id);
                        setImageUrl(url);
                    } catch {
                        // Image not available
                    }
                }
            } catch {
                toast.error('Failed to load scan');
                navigate('/history');
            } finally {
                setIsLoading(false);
            }
        };
        fetchScan();
    }, [id, navigate]);

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <Skeleton className="h-8 w-48 mb-8" />
                <div className="grid lg:grid-cols-3 gap-6">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64 lg:col-span-2" />
                </div>
            </div>
        );
    }

    if (!scan) return null;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <Button
                variant="ghost"
                className="text-slate-400 hover:text-white hover:bg-slate-800 mb-6"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Image & Meta */}
                <div className="space-y-6">
                    {/* Product Image */}
                    <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white flex items-center gap-2 text-base">
                                <Image className="w-4 h-4" />
                                Scanned Image
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt="Scanned product"
                                    className="w-full h-48 object-contain rounded-lg bg-slate-900 border border-slate-700"
                                />
                            ) : (
                                <div className="w-full h-48 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center">
                                    <p className="text-slate-500 text-sm">No image available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Barcode */}
                    {scan.barcode && (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardContent className="py-4">
                                <div className="flex items-center gap-3">
                                    <Barcode className="w-5 h-5 text-green-400" />
                                    <div>
                                        <p className="text-slate-400 text-xs">Barcode</p>
                                        <p className="text-white font-mono text-lg">{scan.barcode}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* NutriScore Card */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white text-base">NutriScore</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {scan.nutri_score ? (
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-bold ${nutriScoreColors[scan.nutri_score]}`}>
                                        {scan.nutri_score}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">
                                            {scan.nutri_score === 'A' && 'Excellent'}
                                            {scan.nutri_score === 'B' && 'Good'}
                                            {scan.nutri_score === 'C' && 'Average'}
                                            {scan.nutri_score === 'D' && 'Poor'}
                                            {scan.nutri_score === 'E' && 'Bad'}
                                        </p>
                                        <p className="text-slate-400 text-xs">
                                            Score: {scan.nutri_score_value}/100
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-slate-400">No score available</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Meta Info */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="py-4">
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <Clock className="w-4 h-4" />
                                <span>Scanned {new Date(scan.created_at).toLocaleDateString()}</span>
                            </div>
                            {scan.processing_time_ms && (
                                <p className="text-slate-500 text-xs mt-1">
                                    Processed in {scan.processing_time_ms}ms
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Nutrition & Insights */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Nutrients Card */}
                    {scan.nutrients && (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Nutrition Facts</CardTitle>
                                {scan.serving_size && (
                                    <p className="text-slate-400 text-sm">Per {scan.serving_size}</p>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                                    {Object.entries(scan.nutrients).map(([key, value]) => {
                                        if (value === undefined || value === null) return null;
                                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                        const unit = key.includes('sodium') || key.includes('salt') ? 'mg' : key.includes('energy') ? 'kcal' : 'g';
                                        return (
                                            <div key={key} className="flex justify-between py-2 border-b border-slate-700">
                                                <span className="text-slate-300">{label}</span>
                                                <span className="text-white font-medium">{value} {unit}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Highlights Card */}
                    {scan.highlights && scan.highlights.length > 0 && (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Highlights</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {scan.highlights.map((highlight, i) => (
                                        <div key={i} className={`p-3 rounded-lg border ${highlightColors[highlight.level]}`}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-medium">{highlight.name}</span>
                                                <Badge variant="outline" className={highlightColors[highlight.level]}>
                                                    {highlight.level}
                                                </Badge>
                                            </div>
                                            <p className="text-sm opacity-80">{highlight.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Insights Card */}
                    {scan.insights && scan.insights.length > 0 && (
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Health Insights</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {scan.insights.map((insight, i) => {
                                    const Icon = insightIcons[insight.type];
                                    return (
                                        <div key={i} className="flex gap-3">
                                            <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${insightColors[insight.type]}`} />
                                            <div>
                                                <p className="text-white font-medium">{insight.title}</p>
                                                <p className="text-slate-400 text-sm">{insight.message}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
