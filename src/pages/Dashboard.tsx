import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, History, Scale, ArrowRight, Sparkles, Barcode } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome back, {user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-slate-400">
                    Ready to make healthier food choices today?
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20 hover:border-green-500/40 transition-colors">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                <Camera className="w-6 h-6 text-green-400" />
                            </div>
                            <Sparkles className="w-5 h-5 text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">New Scan</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Upload a nutrition label or barcode
                        </p>
                        <Link to="/scan">
                            <Button className="w-full bg-green-500 hover:bg-green-400 text-white">
                                Start Scanning
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                    <CardContent className="p-6">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                            <History className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Scan History</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            View your previous scans and results
                        </p>
                        <Link to="/history">
                            <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                                View History
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                    <CardContent className="p-6">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                            <Scale className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Compare Products</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Compare two products side-by-side
                        </p>
                        <Link to="/compare">
                            <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                                Compare Now
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                    <CardContent className="p-6">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4">
                            <Barcode className="w-6 h-6 text-orange-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Product Lookup</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Find product by barcode
                        </p>
                        <Link to="/product">
                            <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                                Lookup
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Tips Section */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        Quick Tips
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3 text-slate-400">
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-green-400 text-sm">1</span>
                            </span>
                            <span>For best results, make sure the nutrition label is clearly visible and well-lit</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-green-400 text-sm">2</span>
                            </span>
                            <span>You can also enter a barcode number manually if scanning doesn't work</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-green-400 text-sm">3</span>
                            </span>
                            <span>Compare similar products to make the healthiest choice for your needs</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
