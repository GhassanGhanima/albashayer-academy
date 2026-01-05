'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Trophy, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    const pathname = usePathname();
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => setSettings(data.settings))
            .catch(console.error);
    }, []);

    if (pathname?.startsWith('/admin')) return null;

    const academyName = settings?.academyName || 'أكاديمية البشائر';
    const academySlogan = 'لكرة القدم';
    const phone = settings?.phone || '0790320153';
    const email = settings?.email || 'info@albashayer.com';
    const address = settings?.address || 'الأردن - عمان - ماركا الجنوبية';
    const socialLinks = [
        { Icon: Facebook, href: settings?.facebook || '#' },
        { Icon: Instagram, href: settings?.instagram || '#' },
        { Icon: Twitter, href: settings?.twitter || '#' }
    ];

    return (
        <footer className="bg-dark pt-24 pb-12 border-t border-white/5 text-gray-400">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Info */}
                    <div>
                        <Link href="/" className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-black text-white leading-none">{academyName}</span>
                                <span className="text-xs font-bold text-secondary tracking-widest mt-1">{academySlogan}</span>
                            </div>
                        </Link>
                        <p className="leading-relaxed mb-6">
                            {settings?.slogan || 'نحن نصنع أبطال المستقبل من خلال التدريب الاحترافي والبيئة التربوية المتكاملة. انضم لعائلتنا اليوم.'}
                        </p>
                        <div className="flex gap-4">
                            {socialLinks.map(({ Icon, href }, i) => (
                                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>
                    ...
                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-bold text-lg mb-6 relative w-fit">
                            معلومات الاتصال
                            <span className="absolute -bottom-2 right-0 w-8 h-1 bg-secondary rounded-full" />
                        </h4>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-primary" />
                                <span>{address}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-primary" />
                                <span className="dir-ltr">{phone}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-primary" />
                                <span>{email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                    <p>جميع الحقوق محفوظة © {new Date().getFullYear()} {academyName}</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">الشروط والأحكام</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
