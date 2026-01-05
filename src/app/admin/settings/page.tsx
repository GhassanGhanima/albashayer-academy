'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Settings,
    Save,
    Globe,
    Phone,
    Mail,
    MapPin,
    Share2,
    ShieldCheck,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { authenticatedFetch } from '@/lib/api';

export default function AdminSettings() {
    const router = useRouter();
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            setSettings(data.settings);
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);

        try {
            const res = await authenticatedFetch('/api/settings', {
                method: 'PUT',
                body: JSON.stringify(settings)
            });

            if (res.status === 401) {
                localStorage.removeItem('admin_token');
                router.push('/admin/login');
                setSaving(false);
                return;
            }

            if (res.ok) {
                setStatus({ type: 'success', message: 'تم حفظ الإعدادات بنجاح' });
            } else {
                const data = await res.json();
                setStatus({ type: 'error', message: data.error || 'حدث خطأ أثناء الحفظ' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'حدث خطأ في الاتصال' });
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-reveal">
            <div>
                <h1 className="text-4xl font-black mb-2">إعدادات النظام <span className="text-gradient-gold">⚙️</span></h1>
                <p className="text-gray-400 font-medium">إدارة معلومات الأكاديمية والموقع الإلكتروني</p>
            </div>

            {status && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-reveal ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                    {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="font-bold">{status.message}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* General Settings */}
                <div className="glass-card p-8 rounded-[40px] space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Globe className="w-6 h-6 text-primary" />
                        <h3 className="text-xl font-bold">المعلومات الأساسية</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2 mr-2">اسم الأكاديمية</label>
                            <input
                                type="text"
                                value={settings?.academyName || ''}
                                onChange={(e) => setSettings({ ...settings, academyName: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2 mr-2">الشعار التعريفي</label>
                            <input
                                type="text"
                                value={settings?.slogan || ''}
                                onChange={(e) => setSettings({ ...settings, slogan: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all font-bold"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Settings */}
                <div className="glass-card p-8 rounded-[40px] space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Phone className="w-6 h-6 text-secondary" />
                        <h3 className="text-xl font-bold">معلومات التواصل</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2 mr-2">رقم الهاتف</label>
                            <input
                                type="text"
                                value={settings?.phone || ''}
                                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all font-bold "
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2 mr-2">البريد الإلكتروني</label>
                            <input
                                type="email"
                                value={settings?.email || ''}
                                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all font-bold "
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2 mr-2">العنوان</label>
                            <input
                                type="text"
                                value={settings?.address || ''}
                                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all font-bold"
                            />
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div className="glass-card p-8 rounded-[40px] space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Share2 className="w-6 h-6 text-blue-400" />
                        <h3 className="text-xl font-bold">روابط التواصل الاجتماعي</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2 mr-2">فيسبوك (Facebook)</label>
                            <input
                                type="text"
                                value={settings?.facebook || ''}
                                onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all font-bold "
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2 mr-2">إنستغرام (Instagram)</label>
                            <input
                                type="text"
                                value={settings?.instagram || ''}
                                onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all font-bold "
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2 mr-2">تويتر (X)</label>
                            <input
                                type="text"
                                value={settings?.twitter || ''}
                                onChange={(e) => setSettings({ ...settings, twitter: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all font-bold "
                            />
                        </div>
                    </div>
                </div>

                {/* Admin Access Section */}
                <div className="glass-card p-8 rounded-[40px] border-secondary/20 bg-gradient-to-br from-white/5 to-secondary/5 space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <ShieldCheck className="w-6 h-6 text-secondary" />
                        <h3 className="text-xl font-bold">بيانات الدخول</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2 mr-2">اسم المستخدم</label>
                            <input
                                type="text"
                                value={settings?.adminCredentials?.username || ''}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    adminCredentials: { ...settings.adminCredentials, username: e.target.value }
                                })}
                                className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 focus:border-secondary outline-none transition-all font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2 mr-2">كلمة المرور</label>
                            <input
                                type="password"
                                value={settings?.adminCredentials?.password || ''}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    adminCredentials: { ...settings.adminCredentials, password: e.target.value }
                                })}
                                className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 focus:border-secondary outline-none transition-all font-bold"
                            />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary px-12 py-5 flex items-center gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    >
                        {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        <span className="text-lg">حفظ كافة التغييرات</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
