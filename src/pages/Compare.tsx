import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Scale, Loader2, Trophy, Check } from 'lucide-react';
import { scanService, compareService } from '@/services';
import type { Scan, CompareResponse } from '@/types';
import { toast } from 'sonner';

const nutriScoreColors: Record<string, string> = {
    A: 'bg-[#038141]',
    B: 'bg-[#85bb2f]',
    C: 'bg-[#fecb02] text-slate-900',
    D: 'bg-[#ee8100]',
    E: 'bg-[#e63e11]',
};

export default function Compare() {
    const [scans, setScans] = useState<Scan[]>([]);
    const [isLoadingScans, setIsLoadingScans] = useState(true);
    const [selectedA, setSelectedA] = useState<Scan | null>(null);
    const [selectedB, setSelectedB] = useState<Scan | null>(null);
    const [isComparing, setIsComparing] = useState(false);
    const [result, setResult] = useState<CompareResponse | null>(null);

    // Load user's scans
    useEffect(() => {
        const loadScans = async () => {
            try {
                const data = await scanService.list(1, 50);
                // Only show completed scans with barcode or nutri_score
                const validScans = data.scans.filter(s => s.status === 'completed' && (s.barcode || s.nutri_score));
                setScans(validScans);
            } catch {
                toast.error('Failed to load scans');
            } finally {
                setIsLoadingScans(false);
            }
        };
        loadScans();
    }, []);

    const handleSelectScan = (scan: Scan, slot: 'A' | 'B') => {
        if (slot === 'A') {
            if (selectedB?.id === scan.id) {
                toast.error('Please select a different product');
                return;
            }
            setSelectedA(scan);
        } else {
            if (selectedA?.id === scan.id) {
                toast.error('Please select a different product');
                return;
            }
            setSelectedB(scan);
        }
        setResult(null);
    };

    const handleCompare = async () => {
        if (!selectedA || !selectedB) {
            toast.error('Please select two products');
            return;
        }

        setIsComparing(true);
        try {
            const data = await compareService.compare({
                product_a: selectedA.barcode || selectedA.id,
                product_b: selectedB.barcode || selectedB.id,
            });
            setResult(data);
        } catch {
            toast.error('Failed to compare products');
        } finally {
            setIsComparing(false);
        }
    };

    const ScanCard = ({ scan, isSelected, onSelect }: { scan: Scan; isSelected: boolean; onSelect: () => void }) => (
        <Card
            className={`cursor-pointer transition-all ${isSelected
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                }`}
            onClick={onSelect}
        >
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {scan.nutri_score ? (
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-white ${nutriScoreColors[scan.nutri_score]}`}>
                                {scan.nutri_score}
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-slate-400">
                                ?
                            </div>
                        )}
                        <div>
                            <p className="text-white font-medium text-sm">
                                {scan.barcode || `Scan #${scan.id.slice(0, 8)}`}
                            </p>
                            <p className="text-slate-500 text-xs">
                                {new Date(scan.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    {isSelected && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Scale className="w-8 h-8" />
                    Compare Products
                </h1>
                <p className="text-slate-400">
                    Select two products from your scan history to compare them
                </p>
            </div>

            {/* Selection Area */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Product A */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                            <span>Product A</span>
                            {selectedA && (
                                <Badge className="bg-green-500">Selected</Badge>
                            )}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            {selectedA ? `${selectedA.barcode || selectedA.id.slice(0, 8)}` : 'Select a product below'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-64 overflow-y-auto space-y-2">
                        {isLoadingScans ? (
                            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                        ) : scans.length === 0 ? (
                            <p className="text-slate-500 text-center py-4">No scans available. Scan a product first!</p>
                        ) : (
                            scans.map(scan => (
                                <ScanCard
                                    key={scan.id}
                                    scan={scan}
                                    isSelected={selectedA?.id === scan.id}
                                    onSelect={() => handleSelectScan(scan, 'A')}
                                />
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Product B */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                            <span>Product B</span>
                            {selectedB && (
                                <Badge className="bg-green-500">Selected</Badge>
                            )}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            {selectedB ? `${selectedB.barcode || selectedB.id.slice(0, 8)}` : 'Select a product below'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-64 overflow-y-auto space-y-2">
                        {isLoadingScans ? (
                            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                        ) : scans.length === 0 ? (
                            <p className="text-slate-500 text-center py-4">No scans available. Scan a product first!</p>
                        ) : (
                            scans.map(scan => (
                                <ScanCard
                                    key={scan.id}
                                    scan={scan}
                                    isSelected={selectedB?.id === scan.id}
                                    onSelect={() => handleSelectScan(scan, 'B')}
                                />
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Compare Button */}
            <Button
                onClick={handleCompare}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white text-lg py-6 mb-8"
                disabled={!selectedA || !selectedB || isComparing}
            >
                {isComparing ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Comparing...
                    </>
                ) : (
                    <>
                        <Scale className="mr-2 h-5 w-5" />
                        Compare Products
                    </>
                )}
            </Button>

            {/* Results */}
            {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    {/* Verdict */}
                    <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
                        <CardContent className="py-6">
                            <div className="flex items-center gap-3 mb-3">
                                <Trophy className="w-6 h-6 text-green-400" />
                                <h3 className="text-xl font-bold text-white">Verdict</h3>
                            </div>
                            <p className="text-slate-300">{result.verdict}</p>
                        </CardContent>
                    </Card>

                    {/* Product Summary Cards */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className={`bg-slate-800/50 ${result.winner === 'a' ? 'border-green-500' : 'border-slate-700'}`}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-white">Product A</CardTitle>
                                    {result.winner === 'a' && (
                                        <Badge className="bg-green-500">🏆 Winner</Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg text-white font-medium mb-2">{result.product_a.name}</p>
                                {result.product_a.nutri_score && (
                                    <div className={`inline-flex w-12 h-12 rounded-lg items-center justify-center text-xl font-bold text-white ${nutriScoreColors[result.product_a.nutri_score]}`}>
                                        {result.product_a.nutri_score}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className={`bg-slate-800/50 ${result.winner === 'b' ? 'border-green-500' : 'border-slate-700'}`}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-white">Product B</CardTitle>
                                    {result.winner === 'b' && (
                                        <Badge className="bg-green-500">🏆 Winner</Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg text-white font-medium mb-2">{result.product_b.name}</p>
                                {result.product_b.nutri_score && (
                                    <div className={`inline-flex w-12 h-12 rounded-lg items-center justify-center text-xl font-bold text-white ${nutriScoreColors[result.product_b.nutri_score]}`}>
                                        {result.product_b.nutri_score}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Comparison Table */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Nutrient Comparison</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {result.comparisons.map((comp, i) => (
                                    <div key={i} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
                                        <span className="text-slate-300 w-1/3">{comp.name}</span>
                                        <div className="flex items-center gap-4 w-2/3">
                                            <span className={`text-right w-24 ${comp.winner === 'a' ? 'text-green-400 font-semibold' : 'text-white'}`}>
                                                {comp.value_a ?? '-'} {comp.unit}
                                            </span>
                                            <span className="text-slate-500 text-sm">vs</span>
                                            <span className={`w-24 ${comp.winner === 'b' ? 'text-green-400 font-semibold' : 'text-white'}`}>
                                                {comp.value_b ?? '-'} {comp.unit}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
