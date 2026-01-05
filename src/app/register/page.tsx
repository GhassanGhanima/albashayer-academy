'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, ArrowRight, Star, User, Phone, Mail, MessageSquare, Calendar, MapPin } from 'lucide-react';

export default function RegisterPage() {
    const [settings, setSettings] = useState<any>(null);
    useEffect(() => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => setSettings(data.settings))
            .catch(console.error);
    }, []);

    const academyName = settings?.academyName || 'أكاديمية البشائر';
    const phone = settings?.phone || '0790320153';
    const address = settings?.address || 'ماركا الجنوبية - الملاعب الخاصة بالأكاديمية';

    const [formData, setFormData] = useState({
        childName: '',
        age: '',
        parentName: '',
        phone: '',
        email: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('فشل إرسال الطلب');

            setSuccess(true);
            setFormData({
                childName: '',
                age: '',
                parentName: '',
                phone: '',
                email: '',
                message: ''
            });
        } catch (err) {
            setError('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
        }
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-dark text-white pt-32 pb-24 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <div className="container relative z-10 px-4 mx-auto">
                {/* Hero Content */}
                <div className="max-w-3xl mx-auto text-center mb-16 animate-reveal">
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <Star className="w-4 h-4 text-secondary" fill="currentColor" />
                        <span className="text-sm font-semibold text-secondary tracking-wide">كن بطلاً معنا</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                        سجل طفلك <span className="text-gradient-gold">الآن</span>
                    </h1>
                    <p className="text-lg text-gray-400 leading-relaxed">
                        خطوة واحدة تفصل طفلك عن بداية رحلة احترافية في عالم كرة القدم.
                        نحن نصنع الأبطال وننمي المواهب.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    {success ? (
                        <div className="glass-card p-12 md:p-20 rounded-[40px] text-center animate-reveal">
                            <div className="w-24 h-24 bg-secondary/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                <Trophy className="w-12 h-12 text-secondary" />
                            </div>
                            <h2 className="text-3xl font-black mb-4">تم الانضمام بنجاح!</h2>
                            <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
                                شكراً لاختياركم {academyName}. سنقوم بالتواصل معكم خلال 24 ساعة لتأكيد موعد اختبار المستوى.
                            </p>
                            <button
                                onClick={() => setSuccess(false)}
                                className="btn-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
                            >
                                تسجيل طفل آخر
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Form Area */}
                            <div className="lg:col-span-2">
                                <div className="glass-card p-8 md:p-12 rounded-[40px] animate-reveal">
                                    <div className="mb-10">
                                        <h2 className="text-2xl font-bold mb-2">بيانات المشترك</h2>
                                        <p className="text-gray-400">يرجى إدخال المعلومات بدقة لضمان التواصل السريع</p>
                                    </div>

                                    {error && (
                                        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-red-400" />
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label htmlFor="child-name" className="text-sm font-bold text-gray-300 mr-2 flex items-center gap-2">
                                                    <User className="w-4 h-4 text-primary-light" />
                                                    اسم اللاعب اليافع
                                                </label>
                                                <input
                                                    id="child-name"
                                                    type="text"
                                                    name="childName"
                                                    value={formData.childName}
                                                    onChange={handleChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-secondary transition-colors text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
                                                    placeholder="الاسم الرباعي"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="child-age" className="text-sm font-bold text-gray-300 mr-2 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-primary-light" />
                                                    العمر
                                                </label>
                                                <input
                                                    id="child-age"
                                                    type="number"
                                                    name="age"
                                                    value={formData.age}
                                                    onChange={handleChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-secondary transition-colors text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
                                                    placeholder="من 4 إلى 18 سنة"
                                                    min="4"
                                                    max="18"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="parent-name" className="text-sm font-bold text-gray-300 mr-2 flex items-center gap-2">
                                                <User className="w-4 h-4 text-primary-light" />
                                                اسم ولي الأمر
                                            </label>
                                            <input
                                                id="parent-name"
                                                type="text"
                                                name="parentName"
                                                value={formData.parentName}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-secondary transition-colors text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
                                                placeholder="اسم الأب أو الأم"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label htmlFor="phone-number" className="text-sm font-bold text-gray-300 mr-2 flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-primary-light" />
                                                    رقم الهاتف
                                                </label>
                                                <input
                                                    id="phone-number"
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-secondary transition-colors text-white dir-ltr text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
                                                    placeholder="07XXXXXXXX"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="email-address" className="text-sm font-bold text-gray-300 mr-2 flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-primary-light" />
                                                    البريد الإلكتروني
                                                </label>
                                                <input
                                                    id="email-address"
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-secondary transition-colors text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
                                                    placeholder="name@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="message-notes" className="text-sm font-bold text-gray-300 mr-2 flex items-center gap-2">
                                                <MessageSquare className="w-4 h-4 text-primary-light" />
                                                ملاحظات أو مواهب خاصة
                                            </label>
                                            <textarea
                                                id="message-notes"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-secondary transition-colors text-white min-h-[120px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark resize-none"
                                                placeholder="هل لديه خبرة سابقة؟ أي إصابات؟ مواهب معينة؟"
                                            ></textarea>
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn-primary w-full py-5 rounded-2xl justify-center text-lg mt-8 bg-primary hover:bg-primary-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
                                            disabled={loading}
                                        >
                                            {loading ? 'جاري المعالجة...' : 'إرسال طلب الانضمام ⚽'}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Info Side */}
                            <div className="space-y-6">
                                <div className="glass-card p-8 rounded-[32px] animate-reveal" style={{ animationDelay: '0.1s' }}>
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                        <MapPin className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">الموقع</h3>
                                    <p className="text-gray-400 text-sm">{address}</p>
                                </div>

                                <div className="glass-card p-8 rounded-[32px] animate-reveal" style={{ animationDelay: '0.2s' }}>
                                    <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6">
                                        <Calendar className="w-6 h-6 text-secondary" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">المواعيد</h3>
                                    <p className="text-gray-400 text-sm">يومياً من الساعة 4:00 عصراً حتى 8:00 مساءً</p>
                                </div>

                                <div className="glass-card p-8 rounded-[32px] animate-reveal" style={{ animationDelay: '0.3s' }}>
                                    <div className="w-12 h-12 bg-primary-light/10 rounded-2xl flex items-center justify-center mb-6">
                                        <Phone className="w-6 h-6 text-primary-light" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">تواصل سريع</h3>
                                    <p className="text-gray-400 text-sm dir-ltr">{phone}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

