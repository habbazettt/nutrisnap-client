import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Barcode, Camera, Search, Loader2, CheckCircle, XCircle } from 'lucide-react';
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
    const scannerRef = useRef<Html5Qrcode | null>(null);

    // Cleanup scanner on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, []);

    const startScanner = async () => {
        try {
            const scanner = new Html5Qrcode('barcode-reader');
            scannerRef.current = scanner;
            setIsScanning(true);

            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 150 } },
                (decodedText) => {
                    // Barcode detected
                    setBarcode(decodedText);
                    stopScanner();
                    toast.success(`Barcode detected: ${decodedText}`);
                },
                () => {
                    // Ignore scan errors (no barcode found yet)
                }
            );
        } catch (err) {
            console.error('Scanner error:', err);
            toast.error('Could not start camera. Please enter barcode manually.');
            setIsScanning(false);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
            } catch {
                // Ignore stop errors
            }
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
            const errorMessage = err instanceof Error ? err.message : 'Product not found';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        try {
            console.log('Uploading file for barcode scan:', file.name);

            // html5-qrcode requires a visible element, but we can position it off-screen
            const tempDiv = document.createElement('div');
            tempDiv.id = 'temp-scanner-' + Date.now();
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.top = '-9999px';
            tempDiv.style.width = '300px';
            tempDiv.style.height = '300px';
            document.body.appendChild(tempDiv);

            const scanner = new Html5Qrcode(tempDiv.id);

            try {
                const result = await scanner.scanFile(file, true);
                console.log('Barcode detected:', result);
                setBarcode(result);
                toast.success(`Barcode detected: ${result}`);
            } finally {
                // Always cleanup
                try {
                    await scanner.clear();
                } catch {
                    // Ignore cleanup errors
                }
                if (document.body.contains(tempDiv)) {
                    document.body.removeChild(tempDiv);
                }
            }
        } catch (err) {
            console.error('Scan file error:', err);
            toast.error('Could not detect barcode in image. Try a clearer photo or enter manually.');
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
                    Scan or enter a barcode to find product information
                </p>
            </div>

            {/* Barcode Input Section */}
            <Card className="bg-slate-800/50 border-slate-700 mb-6">
                <CardHeader>
                    <CardTitle className="text-white">Enter Barcode</CardTitle>
                    <CardDescription className="text-slate-400">
                        Type the barcode number or use the scanner
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Manual Input */}
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter barcode number (e.g., 8991002101128)"
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
                            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                        >
                            <Camera className="w-4 h-4 mr-2" />
                            {isScanning ? 'Stop Camera' : 'Use Camera'}
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                            onClick={() => document.getElementById('barcode-file')?.click()}
                        >
                            <Barcode className="w-4 h-4 mr-2" />
                            Upload Image
                        </Button>
                        <input
                            id="barcode-file"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(file);
                            }}
                        />
                    </div>

                    {/* Camera Scanner Area */}
                    {isScanning && (
                        <div id="barcode-reader" className="w-full rounded-lg overflow-hidden border border-slate-600" />
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
                                    {product.nutri_score}
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
