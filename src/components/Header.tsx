'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Trophy } from 'lucide-react';

export default function Header() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        fetch('/api/settings')
            .then(res => res.json())
            .then(data => setSettings(data.settings))
            .catch(console.error);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (pathname?.startsWith('/admin')) return null;

    const navLinks = [
        { href: '/', label: 'الرئيسية' },
        { href: '/talents', label: 'المواهب' },
        { href: '/about', label: 'عن الأكاديمية' },
        { href: '/news', label: 'الأخبار' },
        { href: '/contact', label: 'التواصل' },
    ];

    const academyName = settings?.academyName || 'أكاديمية البشائر';

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-3 bg-dark/80 backdrop-blur-xl border-b border-white/5 shadow-lg' : 'py-6 bg-transparent'}`}>
            <div className="container px-4 mx-auto">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark rounded-lg">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-green-900/40 group-hover:scale-105 transition-transform duration-300">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black text-white leading-none group-hover:text-secondary transition-colors">{academyName}</span>
                            <span className="text-xs font-bold text-secondary tracking-widest mt-1">لكرة القدم</span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative text-white/80 font-bold hover:text-secondary transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark rounded-lg px-2 py-1 ${pathname === link.href ? 'text-secondary' : ''}`}
                            >
                                {link.label}
                                {pathname === link.href && (
                                    <span className="absolute -bottom-2 right-0 w-full h-0.5 bg-secondary rounded-full animate-reveal" />
                                )}
                            </Link>
                        ))}
                        <Link href="/register" className="btn-primary px-6 py-2 text-sm shadow-none hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark">
                            سجل الآن
                        </Link>
                    </nav>

                    {/* Mobile Toggle */}
                    <button
                        className="lg:hidden text-white hover:text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark rounded-lg p-1"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
                    >
                        {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                    </button>

                    {/* Mobile Nav Overlay */}
                    <div className={`fixed inset-0 bg-dark/95 backdrop-blur-xl z-40 lg:hidden flex flex-col justify-center items-center gap-8 transition-all duration-500 overflow-x-hidden ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-2xl font-bold ${pathname === link.href ? 'text-secondary' : 'text-white/80'} hover:text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark rounded-lg px-4 py-2`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href="/register"
                            className="btn-primary w-fit px-12 mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            سجل الآن
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
