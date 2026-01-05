'use client';

import { useState, useEffect } from 'react';
import {
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    User,
    Phone,
    Calendar,
    MessageSquare,
    AlertCircle,
    ClipboardList,
    Check,
    X,
    Trash2,
    Search
} from 'lucide-react';

interface Registration {
    id: number;
    childName: string;
    age: number;
    parentName: string;
    phone: string;
    email: string;
    message: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    submittedAt?: string;
}

export default function AdminRegistrationsPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const fetchRegistrations = async () => {
        try {
            const res = await fetch('/api/registrations');
            const data = await res.json();
            setRegistrations(data.registrations || []);
        } catch (error) {
            console.error('Error:', error);
            showNotification('error', 'فشل تحميل طلبات التسجيل');
        }
        setLoading(false);
    };

    const updateStatus = async (id: number, status: 'pending' | 'approved' | 'rejected') => {
        setUpdatingId(id);
        setNotification(null);
        try {
            const res = await fetch(`/api/registrations/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const data = await res.json();

            if (res.ok) {
                showNotification('success', status === 'approved' ? 'تم قبول الطلب بنجاح' : 'تم رفض الطلب');
                await fetchRegistrations();
            } else {
                showNotification('error', data.error || 'فشل تحديث الحالة');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('error', 'حدث خطأ غير متوقع');
        }
        setUpdatingId(null);
    };

    const handleDelete = async (id: number, childName: string) => {
        if (!confirm(`هل أنت متأكد من حذف طلب التسجيل الخاص بـ ${childName}؟`)) return;

        setUpdatingId(id);
        try {
            const res = await fetch(`/api/registrations/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                showNotification('success', 'تم حذف الطلب بنجاح');
                await fetchRegistrations();
            } else {
                showNotification('error', 'فشل حذف الطلب');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('error', 'حدث خطأ في الاتصال');
        }
        setUpdatingId(null);
    };

    const filteredRegistrations = registrations.filter(reg => {
        // Status filter
        if (filter !== 'all' && reg.status !== filter) return false;
        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                reg.childName?.toLowerCase().includes(search) ||
                reg.parentName?.toLowerCase().includes(search) ||
                reg.phone?.includes(search)
            );
        }
        return true;
    });

    const pendingCount = registrations.filter(r => r.status === 'pending').length;
    const approvedCount = registrations.filter(r => r.status === 'approved').length;
    const rejectedCount = registrations.filter(r => r.status === 'rejected').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-reveal">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black mb-2">طلبات التسجيل <span className="text-gradient-gold text-2xl">📝</span></h1>
                    <p className="text-gray-400 font-medium">مراجعة وإدارة طلبات الانضمام الجديدة للأكاديمية</p>
                </div>

                {notification && (
                    <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 animate-reveal ${notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                        {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <span className="font-bold">{notification.message}</span>
                    </div>
                )}
            </div>

            {/* Stats & Filter Bar */}
            <div className="glass-card p-4 rounded-3xl border-white/5">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* Filter Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            الكل ({registrations.length})
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'pending' ? 'bg-amber-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            في الانتظار ({pendingCount})
                        </button>
                        <button
                            onClick={() => setFilter('approved')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'approved' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            تم القبول ({approvedCount})
                        </button>
                        <button
                            onClick={() => setFilter('rejected')}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'rejected' ? 'bg-rose-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            مرفوض ({rejectedCount})
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative w-full lg:w-64">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="ابحث باسم اللاعب أو ولي الأمر..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
                        />
                    </div>
                </div>
            </div>

            {pendingCount > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-amber-500">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-bold">يوجد {pendingCount} طلب جديد بانتظار المراجعة والتدقيق</p>
                </div>
            )}

            {filteredRegistrations.length === 0 ? (
                <div className="glass-card p-20 rounded-[40px] text-center border-dashed">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-black mb-2">لا توجد طلبات</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">لم يتم العثور على طلبات تسجيل بناءً على الفلتر المحدد.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredRegistrations.map((reg) => (
                        <div key={reg.id} className="glass-card group hover:scale-[1.01] transition-all duration-300 rounded-[40px] overflow-hidden border-white/5">
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-2xl flex items-center justify-center font-black text-primary text-xl shadow-inner group-hover:scale-110 transition-transform">
                                            {reg.childName?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black group-hover:text-secondary transition-colors">{reg.childName || 'بدون اسم'}</h3>
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{new Date(reg.created_at || reg.submittedAt || Date.now()).toLocaleDateString('ar-SA')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {reg.status === 'pending' ? (
                                            <span className="px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-full text-xs font-black border border-amber-500/20">
                                                في الانتظار
                                            </span>
                                        ) : reg.status === 'approved' ? (
                                            <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-black border border-emerald-500/20">
                                                تم القبول
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1.5 bg-rose-500/10 text-rose-500 rounded-full text-xs font-black border border-rose-500/20">
                                                مرفوض
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <User className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">العمر</span>
                                        </div>
                                        <p className="font-bold text-lg">{reg.age || '-'} سنة</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <User className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">ولي الأمر</span>
                                        </div>
                                        <p className="font-bold text-base">{reg.parentName || '-'}</p>
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Phone className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">رقم التواصل</span>
                                        </div>
                                        <p className="font-bold text-lg tracking-tight">{reg.phone || '-'}</p>
                                    </div>
                                </div>

                                {reg.message && (
                                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 mb-6 relative">
                                        <MessageSquare className="absolute -top-2 -right-2 w-6 h-6 text-amber-500/20" />
                                        <span className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest block mb-2">رسالة إضافية:</span>
                                        <p className="text-gray-300 font-medium italic text-sm">{reg.message}</p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3">
                                    {reg.status === 'pending' ? (
                                        <>
                                            <button
                                                onClick={() => updateStatus(reg.id, 'approved')}
                                                disabled={updatingId === reg.id}
                                                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                            >
                                                {updatingId === reg.id ? (
                                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        <span>قبول</span>
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => updateStatus(reg.id, 'rejected')}
                                                disabled={updatingId === reg.id}
                                                className="flex-1 py-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                            >
                                                {updatingId === reg.id ? (
                                                    <div className="w-4 h-4 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <X className="w-4 h-4" />
                                                        <span>رفض</span>
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                if (reg.status === 'approved' || reg.status === 'rejected') {
                                                    updateStatus(reg.id, 'pending');
                                                }
                                            }}
                                            disabled={updatingId === reg.id}
                                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                        >
                                            <Clock className="w-4 h-4" />
                                            <span>إعادة للانتظار</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(reg.id, reg.childName)}
                                        disabled={updatingId === reg.id}
                                        className="p-3 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 rounded-xl transition-all disabled:opacity-50"
                                        title="حذف الطلب"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
