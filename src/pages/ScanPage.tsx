import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Loader2, X, ImageIcon, CheckCircle } from 'lucide-react';
import { scanService } from '@/services';
import { toast } from 'sonner';
import type { Scan } from '@/types';

export default function ScanPage() {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [scanResult, setScanResult] = useState<Scan | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = useCallback((selectedFile: File | null) => {
        if (selectedFile) {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
                toast.error('Please upload JPEG, PNG, or WebP');
                return;
            }
            if (selectedFile.size > 10 * 1024 * 1024) {
                toast.error('Max file size is 10MB');
                return;
            }
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setScanResult(null);
        }
    }, []);

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        setScanResult(null);
    };

    // Poll for scan completion
    const pollScanStatus = async (scanId: string) => {
        setIsPolling(true);
        let attempts = 0;
        const maxAttempts = 60;

        const poll = async () => {
            try {
                const scan = await scanService.getById(scanId);
                setScanResult(scan);

                if (scan.status === 'completed' || scan.status === 'failed') {
                    setIsPolling(false);
                    if (scan.status === 'completed') {
                        toast.success('Scan completed!');
                    } else {
                        toast.error(scan.error_message || 'Scan failed');
                    }
                    return;
                }

                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(poll, 1000);
                } else {
                    setIsPolling(false);
                    toast.error('Timeout. Please try again.');
                }
            } catch {
                setIsPolling(false);
                toast.error('Error checking status');
            }
        };

        poll();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error('Please upload nutrition label image');
            return;
        }

        setIsLoading(true);
        setScanResult(null);

        try {
            const scan = await scanService.create(file, undefined, true);
            toast.success('Processing...');
            setScanResult(scan);
            pollScanStatus(scan.id);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Scan failed';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const nutriScoreColor = (score: string) => {
        const colors: Record<string, string> = {
            A: 'bg-[#038141]', B: 'bg-[#85bb2f]', C: 'bg-[#fecb02] text-slate-900',
            D: 'bg-[#ee8100]', E: 'bg-[#e63e11]'
        };
        return colors[score] || 'bg-slate-600';
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Scan Nutrition Label</h1>
                <p className="text-slate-400">
                    Upload a photo of the nutrition facts label to analyze
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Camera className="w-5 h-5 text-green-400" />
                            Upload Nutrition Label
                            {file && <Badge className="bg-green-500/20 text-green-400 border-0">Ready</Badge>}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Take a clear photo of the nutrition facts table
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {preview ? (
                            <div className="relative">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full max-h-80 object-contain rounded-lg border border-slate-600 bg-slate-900"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white hover:text-white"
                                    onClick={clearFile}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <div
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    handleFileChange(e.dataTransfer.files[0]);
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                }}
                                className={`
                  border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
                  ${isDragging
                                        ? 'border-green-500 bg-green-500/10'
                                        : 'border-slate-600 hover:border-green-500/50 hover:bg-slate-800'
                                    }
                `}
                                onClick={() => document.getElementById('nutrition-input')?.click()}
                            >
                                <input
                                    id="nutrition-input"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                                />
                                <div className="flex flex-col items-center gap-4">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-green-500/20' : 'bg-slate-700'
                                        }`}>
                                        <ImageIcon className={`w-8 h-8 ${isDragging ? 'text-green-400' : 'text-slate-400'}`} />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-lg">
                                            {isDragging ? 'Drop image here' : 'Click or drag to upload'}
                                        </p>
                                        <p className="text-slate-500 text-sm mt-1">
                                            JPG, PNG, WebP up to 10MB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white text-lg py-6 shadow-lg shadow-green-500/25"
                    disabled={isLoading || isPolling || !file}
                >
                    {isLoading || isPolling ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {isPolling ? 'Analyzing...' : 'Uploading...'}
                        </>
                    ) : (
                        <>
                            <Camera className="mr-2 h-5 w-5" />
                            Analyze Nutrition Label
                        </>
                    )}
                </Button>
            </form>

            {/* Result */}
            {scanResult && scanResult.status === 'completed' && (
                <Card className="mt-6 border-green-500 bg-green-500/5 animate-in fade-in">
                    <CardContent className="py-6">
                        <div className="flex items-center gap-4 mb-4">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                            <span className="text-white font-semibold text-lg">Scan Complete!</span>
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            {scanResult.nutri_score && (
                                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-bold text-white ${nutriScoreColor(scanResult.nutri_score)}`}>
                                    {scanResult.nutri_score}
                                </div>
                            )}
                            {scanResult.barcode && (
                                <div>
                                    <p className="text-slate-400 text-sm">Barcode detected</p>
                                    <Badge className="bg-slate-700 text-white font-mono text-sm px-3">
                                        {scanResult.barcode}
                                    </Badge>
                                </div>
                            )}
                        </div>
                        <Button
                            onClick={() => navigate(`/scan/${scanResult.id}`)}
                            className="w-full bg-green-500 hover:bg-green-400 text-white"
                        >
                            View Full Details
                        </Button>
                    </CardContent>
                </Card>
            )}

            {scanResult && scanResult.status === 'processing' && (
                <Card className="mt-6 border-yellow-500/50 bg-yellow-500/5">
                    <CardContent className="py-6 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-yellow-400 mx-auto mb-3" />
                        <p className="text-yellow-400 font-medium">Processing image...</p>
                        <p className="text-slate-500 text-sm mt-1">This may take a few seconds</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
