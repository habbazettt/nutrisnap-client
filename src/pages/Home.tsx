import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Camera, BarChart3, Scale, ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent" />

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">NutriSnap</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login">
                        <Button variant="ghost" className="text-slate-300 hover:text-white">
                            Sign In
                        </Button>
                    </Link>
                    <Link to="/register">
                        <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm mb-8">
                    <Sparkles className="w-4 h-4" />
                    AI-Powered Nutrition Analysis
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                    Scan. Understand.
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                        Eat Healthier.
                    </span>
                </h1>

                <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                    Take a photo of any nutrition label or barcode and get instant health insights,
                    scores, and comparisons. Make informed food choices effortlessly.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/register">
                        <Button size="lg" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-lg px-8 shadow-lg shadow-green-500/25">
                            Start Scanning Free
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                    <Link to="/login">
                        <Button size="lg" variant="outline" className="border-slate-600 text-black hover:bg-slate-800 hover:text-white text-lg px-8">
                            Sign In
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
                <h2 className="text-3xl font-bold text-white text-center mb-12">
                    Everything you need for healthier choices
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl hover:border-green-500/50 transition-colors">
                        <CardContent className="p-6">
                            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                                <Camera className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Instant Scan</h3>
                            <p className="text-slate-400 text-sm">
                                Snap a photo of nutrition labels and get results in seconds
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl hover:border-green-500/50 transition-colors">
                        <CardContent className="p-6">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                                <BarChart3 className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">NutriScore</h3>
                            <p className="text-slate-400 text-sm">
                                Easy A-E rating system to understand food healthiness
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl hover:border-green-500/50 transition-colors">
                        <CardContent className="p-6">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                                <Scale className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Compare</h3>
                            <p className="text-slate-400 text-sm">
                                Compare products side-by-side to make better choices
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl hover:border-green-500/50 transition-colors">
                        <CardContent className="p-6">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4">
                                <Zap className="w-6 h-6 text-orange-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Insights</h3>
                            <p className="text-slate-400 text-sm">
                                Get personalized health insights and recommendations
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Trust Section */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
                <div className="flex flex-wrap items-center justify-center gap-8 text-slate-500">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        <span>Privacy First</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        <span>Fast & Accurate</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        <span>AI-Powered</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
