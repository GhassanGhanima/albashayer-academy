'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Trophy, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'فشل تسجيل الدخول');
                return;
            }

            // Store token in localStorage
            localStorage.setItem('admin_token', data.token);
            router.push('/admin');
        } catch (err) {
            setError('حدث خطأ أثناء تسجيل الدخول');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-reveal">
                <div className="glass-card p-10 rounded-[40px] border-white/10">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-glow rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/20 transform hover:rotate-12 transition-transform duration-500">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-black mb-2 tracking-tight">لوحة تحكم <span className="text-gradient-gold">الأدمن</span></h1>
                        <p className="text-gray-400 font-medium">أكاديمية البشائر لكرة القدم</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 animate-shake">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-bold">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 mr-2">اسم المستخدم</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-secondary transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all font-medium"
                                    placeholder="أدخل اسم المستخدم"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 mr-2">كلمة المرور</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-secondary transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none transition-all font-medium"
                                    placeholder="أدخل كلمة المرور"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-secondary w-full py-4 justify-center group"
                            disabled={loading}
                        >
                            <span>{loading ? 'جاري الدخول...' : 'تسجيل الدخول'}</span>
                            {!loading && <ArrowRight className="w-5 h-5 -rotate-180 group-hover:-translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-white/5 text-center">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-4">بيانات تجريبية</p>
                        <div className="inline-flex items-center gap-4 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-500 mb-0.5">المستخدم:</span>
                                <span className="text-xs font-mono font-bold text-secondary">admin</span>
                            </div>
                            <div className="w-px h-3 bg-white/10" />
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-500 mb-0.5">كلمة المرور:</span>
                                <span className="text-xs font-mono font-bold text-secondary">admin123</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
