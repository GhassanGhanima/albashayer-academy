'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, Facebook, Instagram, Twitter, Youtube, ArrowRight, Star } from 'lucide-react';

export default function ContactPage() {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => setSettings(data.settings))
            .catch(console.error);
    }, []);

    const academyName = settings?.academyName || 'أكاديمية البشائر';
    const phone = settings?.phone || '0790320153';
    const email = settings?.email || 'info@albashayer.com';
    const address = settings?.address || 'الأردن - عمان - ماركا الجنوبية';
    const socialLinks = [
        { Icon: Facebook, href: settings?.facebook || '#', color: 'hover:bg-blue-600' },
        { Icon: Instagram, href: settings?.instagram || '#', color: 'hover:bg-pink-600' },
        { Icon: Twitter, href: settings?.twitter || '#', color: 'hover:bg-sky-500' },
        { Icon: Youtube, href: settings?.youtube || '#', color: 'hover:bg-red-600' }
    ];
    return (
        <div className="min-h-screen bg-dark text-white pt-32 pb-24 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <div className="container relative z-10 px-4 mx-auto">
                {/* Hero Section */}
                <div className="max-w-3xl mx-auto text-center mb-20 animate-reveal">
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <Phone className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-semibold text-secondary tracking-wide">تواصل معنا</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                        نحن هنا <span className="text-gradient-gold">لسماعك</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        نسعد بالتواصل معكم والإجابة على جميع استفساراتكم حول برامجنا التدريبية.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Contact Info Cards */}
                    <div className="space-y-6 animate-reveal">
                        <h2 className="text-3xl font-black mb-8">معلومات التواصل</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-card p-8 rounded-[32px] group hover:bg-white/5 transition-all duration-500">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <MapPin className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">العنوان</h3>
                                <p className="text-gray-400 text-sm italic">{address}</p>
                            </div>

                            <div className="glass-card p-8 rounded-[32px] group hover:bg-white/5 transition-all duration-500">
                                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Phone className="w-7 h-7 text-secondary" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">الهاتف</h3>
                                <p className="text-gray-400 text-sm " dir="ltr">{phone}</p>
                            </div>

                            <div className="glass-card p-8 rounded-[32px] group hover:bg-white/5 transition-all duration-500">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Mail className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">البريد الإلكتروني</h3>
                                <p className="text-gray-400 text-sm " dir="ltr">{email}</p>
                            </div>

                            <div className="glass-card p-8 rounded-[32px] group hover:bg-white/5 transition-all duration-500">
                                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Clock className="w-7 h-7 text-secondary" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">أوقات العمل</h3>
                                <div className="text-gray-400 text-sm space-y-1">
                                    <p>السبت - الخميس: 4م - 10م</p>
                                    <p>الجمعة: 4م - 8م</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8">
                            <h3 className="text-xl font-bold mb-6">تابعنا على منصات التواصل</h3>
                            <div className="flex gap-4">
                                {socialLinks.map((Social, idx) => (
                                    <a
                                        key={idx}
                                        href={Social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 ${Social.color} hover:scale-110`}
                                    >
                                        <Social.Icon className="w-5 h-5" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Map & Promo */}
                    <div className="space-y-8 animate-reveal" style={{ animationDelay: '0.2s' }}>
                        <div className="glass-card overflow-hidden rounded-[40px] border-white/10 h-[400px]">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3383.5!2d35.9!3d31.95!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sAmman%2C%20South%20Marka!5e0!3m2!1sar!2sjo!4v1"
                                width="100%"
                                height="100%"
                                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
                                allowFullScreen
                                loading="lazy"
                            ></iframe>
                        </div>

                        <div className="glass-card p-10 rounded-[40px] border-secondary/20 bg-gradient-to-br from-white/5 to-secondary/5 relative overflow-hidden group">
                            <Star className="absolute -top-4 -right-4 w-24 h-24 text-secondary/10 group-hover:rotate-12 transition-transform duration-700" />
                            <h3 className="text-2xl font-black mb-4">سجل طفلك الآن</h3>
                            <p className="text-gray-400 mb-8 leading-relaxed">
                                انضم لعائلة البشائر ودع طفلك يكتشف شغفه الحقيقي بكرة القدم في بيئة احترافية.
                            </p>
                            <Link href="/register" className="btn-primary inline-flex items-center gap-3">
                                <span>ابدأ الرحلة الآن</span>
                                <ArrowRight className="w-5 h-5 -rotate-180" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
