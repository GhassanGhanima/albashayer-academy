'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Users,
    Star,
    FileText,
    CheckCircle2,
    XCircle,
    ArrowUpRight,
    ShieldAlert,
    Lightbulb,
    PlusCircle,
    Calendar,
    Settings,
    CreditCard,
    Newspaper,
    GraduationCap,
    ChevronRight
} from 'lucide-react';

interface Stats {
    totalPlayers: number;
    featuredPlayers: number;
    pendingRegistrations: number;
    paidSubscriptions: number;
    unpaidSubscriptions: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({
        totalPlayers: 0,
        featuredPlayers: 0,
        pendingRegistrations: 0,
        paidSubscriptions: 0,
        unpaidSubscriptions: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch players
            const playersRes = await fetch('/api/players');
            const playersData = await playersRes.json();
            const players = playersData.players || [];

            // Fetch registrations
            const regRes = await fetch('/api/registrations');
            const regData = await regRes.json();
            const registrations = regData.registrations || [];

            // Fetch subscriptions
            const subRes = await fetch('/api/subscriptions');
            const subData = await subRes.json();
            const subscriptions = subData.subscriptions || [];

            setStats({
                totalPlayers: players.length,
                featuredPlayers: players.filter((p: { isFeatured: boolean }) => p.isFeatured).length,
                pendingRegistrations: registrations.filter((r: { status: string }) => r.status === 'pending').length,
                paidSubscriptions: subscriptions.filter((s: { status: string }) => s.status === 'paid').length,
                unpaidSubscriptions: subscriptions.filter((s: { status: string }) => s.status === 'unpaid').length
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    const statCards = [
        { icon: Users, value: stats.totalPlayers, label: 'إجمالي اللاعبين', color: 'text-blue-400', bg: 'bg-blue-400/10', link: '/admin/players' },
        { icon: Star, value: stats.featuredPlayers, label: 'المواهب المميزة', color: 'text-amber-400', bg: 'bg-amber-400/10', link: '/admin/players' },
        { icon: FileText, value: stats.pendingRegistrations, label: 'طلبات انتظار', color: 'text-indigo-400', bg: 'bg-indigo-400/10', link: '/admin/registrations' },
        { icon: CheckCircle2, value: stats.paidSubscriptions, label: 'اشتراك مدفوع', color: 'text-emerald-400', bg: 'bg-emerald-400/10', link: '/admin/subscriptions' },
        { icon: XCircle, value: stats.unpaidSubscriptions, label: 'اشتراك غير مدفوع', color: 'text-rose-400', bg: 'bg-rose-400/10', link: '/admin/subscriptions' },
    ];

    return (
        <div className="space-y-10 animate-reveal">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black mb-2">لوحة التحكم <span className="text-gradient-gold">📊</span></h1>
                    <p className="text-gray-400 font-medium">مرحباً بك مجدداً في نظام إدارة الأكاديمية</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchStats} className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        <ArrowUpRight className="w-5 h-5 text-secondary" />
                    </button>
                    <Link href="/admin/settings" className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        <Settings className="w-5 h-5 text-gray-400" />
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Link
                            key={index}
                            href={stat.link}
                            className="glass-card p-6 rounded-[32px] group hover:scale-[1.02]"
                        >
                            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="text-3xl font-black mb-1 ">{stat.value}</div>
                            <div className="text-sm font-bold text-gray-500">{stat.label}</div>
                        </Link>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-2 glass-card p-8 rounded-[40px]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black">إجراءات سريعة</h3>
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <PlusCircle className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/admin/players" className="flex items-center gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-primary hover:border-primary transition-all group">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <Users className="w-6 h-6 text-primary group-hover:text-white" />
                            </div>
                            <div>
                                <div className="font-bold mb-0.5">إدارة اللاعبين</div>
                                <div className="text-xs text-gray-500 group-hover:text-white/70">تحديث بيانات ومهارات اللاعبين</div>
                            </div>
                        </Link>
                        <Link href="/admin/subscriptions" className="flex items-center gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-primary hover:border-primary transition-all group">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <CreditCard className="w-6 h-6 text-primary group-hover:text-white" />
                            </div>
                            <div>
                                <div className="font-bold mb-0.5">متابعة الاشتراكات</div>
                                <div className="text-xs text-gray-500 group-hover:text-white/70">مراقبة الدفعات الشهرية</div>
                            </div>
                        </Link>
                        <Link href="/admin/registrations" className="flex items-center gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-primary hover:border-primary transition-all group">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <FileText className="w-6 h-6 text-primary group-hover:text-white" />
                            </div>
                            <div>
                                <div className="font-bold mb-0.5">مراجعة الطلبات</div>
                                <div className="text-xs text-gray-500 group-hover:text-white/70">قبول اللاعبين الجدد</div>
                            </div>
                        </Link>
                        <Link href="/admin/news" className="flex items-center gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-primary hover:border-primary transition-all group">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <Newspaper className="w-6 h-6 text-primary group-hover:text-white" />
                            </div>
                            <div>
                                <div className="font-bold mb-0.5">إضافة خبر</div>
                                <div className="text-xs text-gray-500 group-hover:text-white/70">نشر أخبار وإنجازات جديدة</div>
                            </div>
                        </Link>
                        <Link href="/admin/coaches" className="flex items-center gap-4 p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-primary hover:border-primary transition-all group">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <GraduationCap className="w-6 h-6 text-primary group-hover:text-white" />
                            </div>
                            <div>
                                <div className="font-bold mb-0.5">طاقم التدريب</div>
                                <div className="text-xs text-gray-500 group-hover:text-white/70">إدارة المدربين والطاقم</div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <div className="glass-card p-8 rounded-[40px] border-secondary/20 bg-gradient-to-br from-white/5 to-secondary/5">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldAlert className="w-6 h-6 text-secondary" />
                            <h3 className="text-xl font-black tracking-tight">ملاحظات أمنية</h3>
                        </div>
                        <ul className="space-y-4 text-sm font-medium text-gray-400">
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                                <span>المعلومات المالية مخفية تماماً عن الزوار</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                                <span>قسم الاشتراكات خاص بالأدمن فقط</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                                <span>لا يوجد دفع إلكتروني مباشر حالياً</span>
                            </li>
                        </ul>
                    </div>

                    <div className="glass-card p-8 rounded-[40px] border-blue-500/10 bg-gradient-to-br from-white/5 to-blue-500/5">
                        <div className="flex items-center gap-3 mb-6">
                            <Lightbulb className="w-6 h-6 text-blue-400" />
                            <h3 className="text-xl font-black tracking-tight">نصائح سريعة</h3>
                        </div>
                        <ul className="space-y-4 text-sm font-medium text-gray-400">
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                <span>حدّث المواهب المميزة بانتظام لزيادة التفاعل</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                <span>تابع حالة الدفع شهرياً لضمان الاستمرارية</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
