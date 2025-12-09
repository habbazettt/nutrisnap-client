import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, AlertTriangle, CheckCircle, Info, XCircle, Barcode, Pencil, X, Check, Loader2, Image, ZoomIn } from 'lucide-react';
import { scanService, correctionService } from '@/services';
import type { Scan, InsightType } from '@/types';
import type { Correction } from '@/services/correction';
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

// Convert nutrient key to API field name
const nutrientToFieldName: Record<string, string> = {
    energy_kcal: 'energy_kcal',
    protein_g: 'protein_g',
    fat_g: 'fat_g',
    saturated_fat_g: 'saturated_fat_g',
    carbohydrate_g: 'carbohydrate_g',
    sugar_g: 'sugar_g',
    fiber_g: 'fiber_g',
    sodium_mg: 'sodium_mg',
    salt_g: 'salt_g',
};

export default function ScanDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [scan, setScan] = useState<Scan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [corrections, setCorrections] = useState<Correction[]>([]);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    useEffect(() => {
        const fetchScan = async () => {
            if (!id) return;
            try {
                const data = await scanService.getById(id);
                setScan(data);
                // Fetch existing corrections
                const corrs = await correctionService.getCorrections(id);
                setCorrections(corrs);
            } catch {
                toast.error('Failed to load scan');
                navigate('/history');
            } finally {
                setIsLoading(false);
            }
        };
        fetchScan();
    }, [id, navigate]);

    const handleEdit = (key: string, value: number | string) => {
        setEditingField(key);
        setEditValue(String(value));
    };

    const handleCancelEdit = () => {
        setEditingField(null);
        setEditValue('');
    };

    const handleSubmitCorrection = async (key: string) => {
        if (!id || !editValue.trim()) return;

        const fieldName = nutrientToFieldName[key] || key;
        setIsSubmitting(true);

        try {
            const correction = await correctionService.submitCorrection(id, fieldName, editValue.trim());
            setCorrections(prev => [...prev, correction]);
            toast.success('Correction submitted successfully!');
            handleCancelEdit();
        } catch (err) {
            console.error('Correction error:', err);
            toast.error('Failed to submit correction');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Check if a field has a correction (approved)
    const getFieldCorrection = (key: string): Correction | undefined => {
        const fieldName = nutrientToFieldName[key] || key;
        return corrections.find(c => c.field_name === fieldName && c.status === 'approved');
    };

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
                className="mb-6 text-slate-400 hover:text-white"
                onClick={() => navigate('/history')}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to History
            </Button>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Meta */}
                <div className="space-y-6">

                    {/* Product Image */}
                    {scan.image_url && (
                        <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-white flex items-center gap-2 text-base">
                                    <Image className="w-4 h-4" />
                                    Scanned Image
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="relative group cursor-zoom-in"
                                    onClick={() => setIsImageModalOpen(true)}
                                >
                                    <img
                                        src={scan.image_url}
                                        alt="Scanned product"
                                        className="w-full h-48 object-contain rounded-lg bg-slate-900 border border-slate-700 transition-transform group-hover:scale-[1.02]"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                        <ZoomIn className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <p className="text-slate-500 text-xs text-center mt-2">Click to enlarge</p>
                            </CardContent>
                        </Card>
                    )}

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
                        <CardHeader>
                            <CardTitle className="text-white text-base">NutriScore</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {scan.nutri_score ? (
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-bold ${nutriScoreColors[scan.nutri_score] || 'bg-slate-600'}`}>
                                        {scan.nutri_score === 'unknown' ? '?' : scan.nutri_score}
                                    </div>
                                    <div>
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
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-white">Nutrition Facts</CardTitle>
                                        {scan.serving_size && (
                                            <p className="text-slate-400 text-sm">Per {scan.serving_size}</p>
                                        )}
                                    </div>
                                    <Badge variant="outline" className="text-slate-400 border-slate-600">
                                        <Pencil className="w-3 h-3 mr-1" />
                                        Click to correct
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                                    {Object.entries(scan.nutrients).map(([key, value]) => {
                                        if (value === undefined || value === null) return null;
                                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                        const unit = key.includes('sodium') || key.includes('salt') ? 'mg' : key.includes('energy') ? 'kcal' : 'g';
                                        const correction = getFieldCorrection(key);
                                        const isEditing = editingField === key;

                                        return (
                                            <div key={key} className="flex justify-between items-center py-2 border-b border-slate-700 group">
                                                <span className="text-slate-300">{label}</span>
                                                <div className="flex items-center gap-2">
                                                    {isEditing ? (
                                                        // Editing mode
                                                        <div className="flex items-center gap-1">
                                                            <Input
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="w-20 h-7 text-sm bg-slate-700 border-slate-600 text-white"
                                                                autoFocus
                                                            />
                                                            <span className="text-slate-400 text-sm">{unit}</span>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-6 w-6 text-green-400 hover:text-green-300"
                                                                onClick={() => handleSubmitCorrection(key)}
                                                                disabled={isSubmitting}
                                                            >
                                                                {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-6 w-6 text-slate-400 hover:text-slate-300"
                                                                onClick={handleCancelEdit}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        // Display mode
                                                        <>
                                                            <span className="text-white font-medium">
                                                                {correction ? (
                                                                    <>
                                                                        <span className="line-through text-slate-500 mr-2">{value}</span>
                                                                        <span className="text-green-400">{correction.corrected_value}</span>
                                                                    </>
                                                                ) : (
                                                                    value
                                                                )} {unit}
                                                            </span>
                                                            {correction && (
                                                                <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                                                                    edited
                                                                </Badge>
                                                            )}
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition-opacity"
                                                                onClick={() => handleEdit(key, value)}
                                                            >
                                                                <Pencil className="h-3 w-3" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
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
                                <div className="flex flex-wrap gap-2">
                                    {scan.highlights.map((highlight, idx) => (
                                        <Badge
                                            key={idx}
                                            className={`${highlightColors[highlight.level]} border`}
                                        >
                                            {highlight.message}: {highlight.value}{highlight.unit}
                                        </Badge>
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
                            <CardContent>
                                <div className="space-y-3">
                                    {scan.insights.map((insight, idx) => {
                                        const Icon = insightIcons[insight.type] || Info;
                                        return (
                                            <div key={idx} className="flex items-start gap-3">
                                                <Icon className={`w-5 h-5 mt-0.5 ${insightColors[insight.type]}`} />
                                                <p className="text-slate-300">{insight.message}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Image Zoom Modal */}
            {isImageModalOpen && scan.image_url && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setIsImageModalOpen(false)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] p-4">
                        <button
                            className="absolute top-2 right-2 z-10 p-2 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 transition-colors"
                            onClick={() => setIsImageModalOpen(false)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img
                            src={scan.image_url}
                            alt="Scanned product - enlarged"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
