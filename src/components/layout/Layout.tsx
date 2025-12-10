import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Leaf, Camera, History, Scale, User, LogOut, LayoutDashboard, Barcode, Shield } from 'lucide-react';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-500/5 via-transparent to-transparent pointer-events-none" />

            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/dashboard" className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                                <Leaf className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white">NutriSnap</span>
                        </Link>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center gap-1">
                            <Link to="/dashboard">
                                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Button>
                            </Link>
                            {user?.role === 'admin' && (
                                <Link to="/admin">
                                    <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                                        <Shield className="w-4 h-4 mr-2" />
                                        Admin
                                    </Button>
                                </Link>
                            )}
                            <Link to="/scan">
                                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                                    <Camera className="w-4 h-4 mr-2" />
                                    Scan
                                </Button>
                            </Link>
                            <Link to="/history">
                                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                                    <History className="w-4 h-4 mr-2" />
                                    History
                                </Button>
                            </Link>
                            <Link to="/compare">
                                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                                    <Scale className="w-4 h-4 mr-2" />
                                    Compare
                                </Button>
                            </Link>
                            <Link to="/product">
                                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                                    <Barcode className="w-4 h-4 mr-2" />
                                    Product
                                </Button>
                            </Link>
                        </div>

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                    <Avatar className="h-10 w-10 border-2 border-green-500/50">
                                        <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white font-semibold">
                                            {user?.name ? getInitials(user.name) : 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end">
                                <div className="px-2 py-1.5">
                                    <p className="text-sm font-medium text-white">{user?.name}</p>
                                    <p className="text-xs text-slate-400">{user?.email}</p>
                                </div>
                                <DropdownMenuSeparator className="bg-slate-700" />
                                <DropdownMenuItem asChild>
                                    <Link to="/profile" className="cursor-pointer text-slate-300 focus:bg-slate-700 focus:text-white">
                                        <User className="w-4 h-4 mr-2" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                {user?.role === 'admin' && (
                                    <DropdownMenuItem asChild>
                                        <Link to="/admin" className="cursor-pointer text-slate-300 focus:bg-slate-700 focus:text-white">
                                            <Shield className="w-4 h-4 mr-2" />
                                            Admin Panel
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator className="bg-slate-700" />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400 focus:bg-slate-700 focus:text-red-300">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10">
                <Outlet />
            </main>
        </div>
    );
}
