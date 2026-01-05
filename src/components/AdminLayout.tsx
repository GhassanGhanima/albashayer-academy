'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import {
    LayoutDashboard,
    Users,
    CreditCard,
    FileText,
    Newspaper,
    Globe,
    LogOut,
    ChevronLeft,
    Trophy,
    Menu,
    X,
    Settings as SettingsIcon,
    GraduationCap
} from 'lucide-react';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        checkAuth();
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => setSettings(data.settings))
            .catch(console.error);
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem('admin_token');
        if (!token && pathname !== '/admin/login') {
            router.push('/admin/login');
        } else {
            setIsAuthenticated(true);
        }
        setLoading(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
    };

    // Don't show layout on login page
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const navLinks = [
        { href: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard },
        { href: '/admin/players', label: 'اللاعبين', icon: Users },
        { href: '/admin/coaches', label: 'طاقم التدريب', icon: GraduationCap },
        { href: '/admin/subscriptions', label: 'الاشتراكات', icon: CreditCard },
        { href: '/admin/registrations', label: 'طلبات التسجيل', icon: FileText },
        { href: '/admin/news', label: 'الأخبار', icon: Newspaper },
        { href: '/admin/settings', label: 'الإعدادات', icon: SettingsIcon },
    ];

    return (
        <div className="min-h-screen bg-dark text-white flex overflow-hidden">
            {/* Sidebar Overlay (Mobile) */}
            {!isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden fixed bottom-6 left-6 z-50 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 animate-bounce"
                >
                    <Menu className="w-6 h-6 text-white" />
                </button>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 right-0 z-40 w-72 bg-dark-soft/50 backdrop-blur-3xl border-l border-white/5 transition-transform duration-500 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} lg:flex lg:flex-col`}
            >
                <div className="p-8 pb-12 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="block text-lg font-black tracking-tight">{settings?.academyName?.split(' ')[1] || 'البشايـر'}</span>
                            <span className="block text-[10px] text-secondary font-bold uppercase tracking-widest leading-none">لوحة التحكم</span>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-4 px-5 py-4 rounded-[20px] transition-all duration-300 group ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20 shadow-green-900/40 translate-x-1'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-primary'}`} />
                                <span className="font-bold">{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-white/5 space-y-2">
                    <Link href="/" className="flex items-center gap-4 px-5 py-4 rounded-[20px] text-gray-400 hover:bg-white/5 hover:text-white transition-all group">
                        <Globe className="w-5 h-5 text-secondary group-hover:scale-110 transition-transform" />
                        <span className="font-bold">الموقع العام</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-5 py-4 rounded-[20px] text-red-400 hover:bg-red-500/10 transition-all group w-full text-right"
                    >
                        <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        <span className="font-bold">تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 relative">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[80px] -z-10" />

                <div className="max-w-7xl mx-auto animate-reveal">
                    {children}
                </div>
            </main>
        </div>
    );
}
