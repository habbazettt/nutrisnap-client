import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import Quagga from '@ericblade/quagga2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Barcode, Camera, Search, Loader2, CheckCircle, XCircle, Upload } from 'lucide-react';
import { productService, type Product } from '@/services/product';
import { toast } from 'sonner';

const nutriScoreColors: Record<string, string> = {
    A: 'bg-[#038141]',
    B: 'bg-[#85bb2f]',
    C: 'bg-[#fecb02] text-slate-900',
    D: 'bg-[#ee8100]',
    E: 'bg-[#e63e11]',
};

export default function ProductLookup() {
    const [barcode, setBarcode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [product, setProduct] = useState<Product | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isUploadScanning, setIsUploadScanning] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    // Configure barcode formats for camera
    const formatsToSupport = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
    ];

    // Cleanup scanner on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, []);

    const startScanner = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            toast.error('Camera not supported on this device');
            return;
        }

        try {
            setIsScanning(true);
            await new Promise(resolve => setTimeout(resolve, 100));

            const scanner = new Html5Qrcode('barcode-reader', { formatsToSupport, verbose: false });
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 150 } },
                (decodedText) => {
                    setBarcode(decodedText);
                    stopScanner();
                    toast.success(`Barcode detected: ${decodedText}`);
                },
                () => { }
            );
        } catch (err) {
            console.error('Scanner error:', err);
            const errMessage = err instanceof Error ? err.message : 'Unknown error';
            if (errMessage.includes('Permission denied')) {
                toast.error('Camera permission denied. Please allow camera access.');
            } else {
                toast.error('Could not start camera: ' + errMessage);
            }
            setIsScanning(false);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
            } catch { }
            scannerRef.current = null;
        }
        setIsScanning(false);
    };

    const handleLookup = async () => {
        if (!barcode.trim()) {
            toast.error('Please enter or scan a barcode');
            return;
        }

        setIsLoading(true);
        setProduct(null);
        setError(null);

        try {
            console.log('Looking up barcode:', barcode.trim());
            const data = await productService.getByBarcode(barcode.trim());
            console.log('Product found:', data);
            setProduct(data);
            toast.success('Product found!');
        } catch (err: unknown) {
            console.error('Lookup error:', err);
            // User-friendly error messages
            let errorMessage = 'Product not found in database';
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosErr = err as { response?: { status?: number } };
                if (axiosErr.response?.status === 404) {
                    errorMessage = `Product with barcode "${barcode}" not found in OpenFoodFacts database`;
                } else if (axiosErr.response?.status === 401) {
                    errorMessage = 'Please login to lookup products';
                } else if (axiosErr.response?.status === 500) {
                    errorMessage = 'Server error. Please try again later';
                }
            }
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Use Quagga for file-based barcode detection
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadScanning(true);

        try {
            console.log('Scanning file with Quagga:', file.name);

            // Convert file to data URL
            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            // Try multiple configurations
            const configs = [
                { size: 800, patchSize: 'medium' as const, halfSample: true, locate: true },
                { size: 1280, patchSize: 'large' as const, halfSample: false, locate: true },
                { size: 640, patchSize: 'small' as const, halfSample: true, locate: false },
                { size: 800, patchSize: 'x-large' as const, halfSample: false, locate: true },
            ];

            let detectedCode: string | null = null;

            for (const cfg of configs) {
                if (detectedCode) break;

                try {
                    const result = await new Promise<string | null>((resolve) => {
                        Quagga.decodeSingle({
                            src: dataUrl,
                            numOfWorkers: 0,
                            inputStream: { size: cfg.size },
                            locator: { patchSize: cfg.patchSize, halfSample: cfg.halfSample },
                            decoder: {
                                readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'upc_e_reader', 'code_128_reader'],
                            },
                            locate: cfg.locate,
                        }, (scanResult) => {
                            if (scanResult?.codeResult?.code) {
                                resolve(scanResult.codeResult.code);
                            } else {
                                resolve(null);
                            }
                        });
                    });

                    if (result) {
                        detectedCode = result;
                    }
                } catch {
                    continue;
                }
            }

            if (detectedCode) {
                console.log('Barcode detected:', detectedCode);
                setBarcode(detectedCode);
                toast.success(`Barcode detected: ${detectedCode}`);
            } else {
                throw new Error('No barcode found');
            }

        } catch (err) {
            console.error('File scan error:', err);
            toast.error('No barcode found. Please enter manually.');
        } finally {
            setIsUploadScanning(false);
            e.target.value = '';
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Barcode className="w-8 h-8 text-green-400" />
                    Product Lookup
                </h1>
                <p className="text-slate-400">
                    Scan or enter a barcode to find product information from OpenFoodFacts
                </p>
            </div>

            {/* Barcode Input Section */}
            <Card className="bg-slate-800/50 border-slate-700 mb-6">
                <CardHeader>
                    <CardTitle className="text-white">Enter Barcode</CardTitle>
                    <CardDescription className="text-slate-400">
                        Type the barcode number or scan it
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Manual Input */}
                    <div className="flex gap-2">
                        <Input
                            placeholder="e.g., 8991002101128"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 font-mono text-lg"
                            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                        />
                        <Button
                            onClick={handleLookup}
                            disabled={isLoading || !barcode.trim()}
                            className="bg-green-500 hover:bg-green-400 text-white px-6"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
                        </Button>
                    </div>

                    {/* Scan Options */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => isScanning ? stopScanner() : startScanner()}
                            className={`flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white ${isScanning ? 'bg-red-500/20 border-red-500' : ''}`}
                        >
                            <Camera className="w-4 h-4 mr-2" />
                            {isScanning ? 'Stop Camera' : 'Use Camera'}
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                            disabled={isUploadScanning}
                            onClick={() => document.getElementById('barcode-file')?.click()}
                        >
                            {isUploadScanning ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Scanning...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Image
                                </>
                            )}
                        </Button>
                        <input
                            id="barcode-file"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </div>

                    {/* Camera Scanner Area */}
                    {isScanning && (
                        <div className="space-y-2">
                            <div
                                id="barcode-reader"
                                className="w-full min-h-[250px] rounded-lg overflow-hidden border border-green-500 bg-slate-900"
                            />
                            <p className="text-slate-400 text-sm text-center">Point camera at barcode</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Result Section */}
            {isLoading && (
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="py-8 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-green-400 mx-auto mb-4" />
                        <p className="text-slate-400">Looking up product...</p>
                    </CardContent>
                </Card>
            )}

            {error && !isLoading && (
                <Card className="border-red-500/50 bg-red-500/5">
                    <CardContent className="py-6">
                        <div className="flex items-center gap-3 text-red-400">
                            <XCircle className="w-6 h-6" />
                            <span>{error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {product && !isLoading && (
                <Card className="border-green-500 bg-green-500/5 animate-in fade-in">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                            <CardTitle className="text-white">Product Found</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Product Info */}
                        <div className="flex items-start gap-4">
                            {product.nutri_score && (
                                <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-bold text-white ${nutriScoreColors[product.nutri_score]}`}>
                                    {product.nutri_score == 'unknown' ? 'X' : product.nutri_score}
                                </div>
                            )}
                            <div>
                                <h3 className="text-xl font-semibold text-white">
                                    {product.name || 'Unknown Product'}
                                </h3>
                                {product.brand && (
                                    <p className="text-slate-400">{product.brand}</p>
                                )}
                                <Badge className="mt-2 bg-slate-700 text-slate-300 font-mono">
                                    {product.barcode}
                                </Badge>
                            </div>
                        </div>

                        {/* Nutrients */}
                        {product.nutrients && (
                            <div>
                                <h4 className="text-slate-300 font-medium mb-3">Nutrition Facts</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(product.nutrients).map(([key, value]) => {
                                        if (value === undefined || value === null) return null;
                                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                        const unit = key.includes('sodium') || key.includes('salt') ? 'mg' : key.includes('energy') ? 'kcal' : 'g';
                                        return (
                                            <div key={key} className="flex justify-between py-2 px-3 bg-slate-800 rounded">
                                                <span className="text-slate-400">{label}</span>
                                                <span className="text-white font-medium">{value} {unit}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <p className="text-slate-500 text-sm">
                            Source: {product.source === 'openfoodfacts' ? 'OpenFoodFacts' : 'Local Database'}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
