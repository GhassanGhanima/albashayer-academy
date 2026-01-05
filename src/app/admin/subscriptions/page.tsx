'use client';

import { useState, useEffect } from 'react';
import {
    CreditCard,
    CheckCircle2,
    Clock,
    Calendar,
    Edit2,
    Check,
    AlertTriangle,
    Wallet,
    Users,
    X,
    TrendingUp,
    Filter
} from 'lucide-react';

interface Subscription {
    id: number;
    player_id: number;
    player_name: string;
    player_age: number;
    player_position: string;
    type: string;
    amount: number;
    status: 'paid' | 'unpaid';
    last_payment: string | null;
    notes: string;
    isActive: boolean;
    joinDate: string;
    paymentHistory: Array<{
        month: string;
        amount: number;
        status: 'paid' | 'unpaid';
        paymentDate: string | null;
        notes?: string;
    }>;
}

export default function AdminSubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSub, setEditingSub] = useState<Subscription | null>(null);
    const [updating, setUpdating] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [formData, setFormData] = useState({
        type: 'شهري',
        amount: '20',
        notes: ''
    });
    const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
    const [selectedMonth, setSelectedMonth] = useState('');

    useEffect(() => {
        // Set default month to current month
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        setSelectedMonth(currentMonth);
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const res = await fetch('/api/subscriptions');
            const data = await res.json();
            setSubscriptions(data.subscriptions || []);
        } catch (error) {
            console.error('Error:', error);
            showNotification('error', 'فشل تحميل بيانات الاشتراكات');
        }
        setLoading(false);
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSub) return;

        setUpdating(true);
        try {
            const res = await fetch('/api/subscriptions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingSub.id,
                    type: formData.type,
                    amount: parseFloat(formData.amount),
                    notes: formData.notes
                })
            });

            const data = await res.json();

            if (res.ok) {
                showNotification('success', 'تم تحديث الاشتراك بنجاح');
                await fetchSubscriptions();
                closeModal();
            } else {
                showNotification('error', data.error || 'فشل تحديث الاشتراك');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('error', 'حدث خطأ في الاتصال');
        }
        setUpdating(false);
    };

    const openEditModal = (sub: Subscription) => {
        setEditingSub(sub);
        setFormData({
            type: sub.type || 'شهري',
            amount: sub.amount?.toString() || '20',
            notes: sub.notes || ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingSub(null);
    };

    // Get payment status for a specific player and month
    const getPaymentStatusForMonth = (sub: Subscription, month: string) => {
        if (!sub.paymentHistory) {
            // Fallback to current status
            return {
                paid: sub.status === 'paid',
                paymentDate: sub.last_payment,
                amount: sub.amount
            };
        }

        // Find payment record for this specific month
        const monthlyPayment = sub.paymentHistory.find(p => p.month === month);

        if (monthlyPayment) {
            return {
                paid: monthlyPayment.status === 'paid',
                paymentDate: monthlyPayment.paymentDate,
                amount: monthlyPayment.amount
            };
        }

        // No record for this month - not paid
        return {
            paid: false,
            paymentDate: null,
            amount: sub.amount
        };
    };

    // Mark as paid for the selected month
    const markAsPaid = async (sub: Subscription) => {
        setUpdating(true);
        try {
            const res = await fetch('/api/subscriptions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: sub.id,
                    month: selectedMonth,
                    status: 'paid',
                    amount: sub.amount,
                    last_payment: new Date().toISOString().split('T')[0]
                })
            });

            if (res.ok) {
                showNotification('success', `تم تسجيل دفع اشتراك ${sub.player_name} لشهر ${getMonthName(selectedMonth)}`);
                fetchSubscriptions();
            } else {
                showNotification('error', 'فشل تحديث حالة الدفع');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('error', 'حدث خطأ في الاتصال');
        }
        setUpdating(false);
    };

    // Mark as unpaid for the selected month
    const markAsUnpaid = async (sub: Subscription) => {
        setUpdating(true);
        try {
            const res = await fetch('/api/subscriptions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: sub.id,
                    month: selectedMonth,
                    status: 'unpaid',
                    amount: sub.amount,
                    last_payment: null
                })
            });

            if (res.ok) {
                showNotification('success', `تم تحديث اشتراك ${sub.player_name} لشهر ${getMonthName(selectedMonth)}`);
                fetchSubscriptions();
            } else {
                showNotification('error', 'فشل تحديث حالة الدفع');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('error', 'حدث خطأ في الاتصال');
        }
        setUpdating(false);
    };

    // Filter subscriptions by month - ALL active players are shown
    const filteredSubscriptions = subscriptions.filter(sub => {
        // Must be active
        if (!sub.isActive) return false;

        // Status filter based on selected month
        const monthPaymentStatus = getPaymentStatusForMonth(sub, selectedMonth);

        if (statusFilter === 'paid') return monthPaymentStatus.paid;
        if (statusFilter === 'unpaid') return !monthPaymentStatus.paid;

        return true;
    });

    // Calculate stats for selected month
    const paidCount = subscriptions.filter(sub => {
        if (!sub.isActive) return false;
        return getPaymentStatusForMonth(sub, selectedMonth).paid;
    }).length;

    const unpaidCount = subscriptions.filter(sub => {
        if (!sub.isActive) return false;
        return !getPaymentStatusForMonth(sub, selectedMonth).paid;
    }).length;

    const totalAmount = subscriptions.filter(s => s.isActive).reduce((sum, s) => sum + (s.amount || 0), 0);
    const paidAmount = subscriptions.filter(sub => {
        if (!sub.isActive) return false;
        return getPaymentStatusForMonth(sub, selectedMonth).paid;
    }).reduce((sum, s) => sum + (s.amount || 0), 0);
    const unpaidAmount = totalAmount - paidAmount;

    // Get month name in Arabic
    const getMonthName = (monthStr: string) => {
        if (!monthStr) return '';
        const [year, month] = monthStr.split('-');
        const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    };

    // Generate available months (last 3 months + current + next 2 months)
    const getAvailableMonths = () => {
        const months: string[] = [];
        const now = new Date();
        for (let i = -3; i <= 2; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
            months.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
        }
        return months;
    };

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
                    <h1 className="text-4xl font-black mb-2">إدارة الاشتراكات <span className="text-gradient-gold text-2xl">💳</span></h1>
                    <p className="text-gray-400 font-medium">تقرير الاشتراكات الشهرية لكل اللاعبين النشطين</p>
                </div>

                {notification && (
                    <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 animate-reveal ${notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                        {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        <span className="font-bold">{notification.message}</span>
                    </div>
                )}
            </div>

            {/* Month Selector & Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Month Selector */}
                <div className="lg:col-span-1 glass-card p-6 rounded-[32px] border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">اختر الشهر</div>
                            <div className="text-xs text-gray-400">للتقرير</div>
                        </div>
                    </div>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-bold text-sm"
                    >
                        {getAvailableMonths().map(month => (
                            <option key={month} value={month} className="bg-dark">
                                {getMonthName(month)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Stats */}
                <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-card p-5 rounded-[32px] border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/5 text-gray-400 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">{subscriptions.filter(s => s.isActive).length}</div>
                                <div className="text-xs font-bold text-gray-500">اللاعبين النشطين</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-5 rounded-[32px] border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">{totalAmount.toFixed(0)}</div>
                                <div className="text-xs font-bold text-gray-500">إجمالي المستحق (د.أ)</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-5 rounded-[32px] border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-emerald-500">{paidAmount.toFixed(0)}</div>
                                <div className="text-xs font-bold text-emerald-500/70">تم تحصيله (د.أ)</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-5 rounded-[32px] border-rose-500/20 bg-rose-500/5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center relative">
                                <Clock className="w-6 h-6" />
                                {unpaidCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-dark animate-pulse" />}
                            </div>
                            <div>
                                <div className="text-2xl font-black text-rose-500">{unpaidAmount.toFixed(0)}</div>
                                <div className="text-xs font-bold text-rose-500/70">معلق (د.أ)</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Month Report Banner */}
            {selectedMonth && (
                <div className="glass-card p-6 rounded-3xl bg-gradient-to-r from-primary/10 to-secondary/5 border-primary/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                                <Filter className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-400">تقرير شهر</div>
                                <div className="text-2xl font-black">{getMonthName(selectedMonth)}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="text-center">
                                <div className="text-xs font-bold text-gray-500 mb-1">نسبة التحصيل</div>
                                <div className={`text-xl font-black ${totalAmount > 0 ? (paidAmount / totalAmount >= 0.8 ? 'text-emerald-500' : paidAmount / totalAmount >= 0.5 ? 'text-amber-500' : 'text-rose-500') : 'text-gray-500'}`}>
                                    {totalAmount > 0 ? `${Math.round((paidAmount / totalAmount) * 100)}%` : '-'}
                                </div>
                            </div>
                            <div className="h-12 w-px bg-white/10"></div>
                            <div className="text-center">
                                <div className="text-xs font-bold text-gray-500 mb-1">المبلغ المتبقي</div>
                                <div className="text-xl font-black text-rose-500">{unpaidAmount.toFixed(0)} د.أ</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Bar */}
            <div className="glass-card p-4 rounded-3xl border-white/5 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-500 mr-2">عرض حسب الحالة:</span>
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${statusFilter === 'all' ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        الكل ({filteredSubscriptions.length})
                    </button>
                    <button
                        onClick={() => setStatusFilter('paid')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${statusFilter === 'paid' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        مدفوع ({paidCount})
                    </button>
                    <button
                        onClick={() => setStatusFilter('unpaid')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${statusFilter === 'unpaid' ? 'bg-rose-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        غير مدفوع ({unpaidCount})
                    </button>
                </div>
            </div>

            {unpaidCount > 0 && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-500">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-bold">تنبيه: يوجد {unpaidCount} لاعب لم يدفعوا اشتراك شهر {getMonthName(selectedMonth)} بقيمة {unpaidAmount.toFixed(0)} د.أ</p>
                </div>
            )}

            {filteredSubscriptions.length === 0 ? (
                <div className="glass-card p-20 rounded-[40px] text-center border-dashed">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Wallet className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-black mb-2">لا توجد بيانات</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">لم يتم العثور على اشتراكات بناءً على الفلتر المحدد.</p>
                </div>
            ) : (
                <div className="glass-card overflow-hidden rounded-[40px] border-white/5 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-6 py-5 text-sm font-black text-gray-400 uppercase tracking-widest">اللاعب</th>
                                    <th className="px-6 py-5 text-sm font-black text-gray-400 uppercase tracking-widest">نوع الاشتراك</th>
                                    <th className="px-6 py-5 text-sm font-black text-gray-400 uppercase tracking-widest text-center">المبلغ (د.أ)</th>
                                    <th className="px-6 py-5 text-sm font-black text-gray-400 uppercase tracking-widest text-center">حالة الدفع</th>
                                    <th className="px-6 py-5 text-sm font-black text-gray-400 uppercase tracking-widest">تاريخ السداد</th>
                                    <th className="px-6 py-5 text-sm font-black text-gray-400 uppercase tracking-widest text-left">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredSubscriptions.map((sub) => {
                                    const monthPaymentStatus = getPaymentStatusForMonth(sub, selectedMonth);
                                    return (
                                        <tr key={sub.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center font-black text-primary group-hover:scale-110 transition-transform">
                                                        {sub.player_name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-base group-hover:text-secondary transition-colors">{sub.player_name || 'بدون اسم'}</div>
                                                        <div className="text-xs text-gray-500">{sub.player_position || 'لاعب'} • {sub.player_age || '-'} سنة</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="px-3 py-1 bg-white/5 rounded-lg text-sm font-medium text-gray-300 border border-white/5">
                                                    {sub.type || 'شهري'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="font-black text-lg">{(sub.amount || 0).toFixed(0)}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex justify-center">
                                                    {monthPaymentStatus.paid ? (
                                                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-sm font-black border border-emerald-500/20">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            <span>مدفوع</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 rounded-xl text-sm font-black border border-rose-500/20">
                                                            <Clock className="w-4 h-4" />
                                                            <span>غير مدفوع</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-gray-400 text-sm">
                                                {monthPaymentStatus.paymentDate ? (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-600" />
                                                        <span>{new Date(monthPaymentStatus.paymentDate).toLocaleDateString('ar-SA')}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-600">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    {!monthPaymentStatus.paid ? (
                                                        <button
                                                            onClick={() => markAsPaid(sub)}
                                                            disabled={updating}
                                                            className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                                                            title={`تأكيد دفع ${getMonthName(selectedMonth)}`}
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => markAsUnpaid(sub)}
                                                            disabled={updating}
                                                            className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white transition-all disabled:opacity-50"
                                                            title={`إلغاء دفع ${getMonthName(selectedMonth)}`}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => openEditModal(sub)}
                                                        disabled={updating}
                                                        className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:bg-secondary hover:text-dark hover:border-secondary transition-all disabled:opacity-50"
                                                        title="تعديل تفاصيل الاشتراك"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showModal && editingSub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-dark/80 backdrop-blur-md animate-fadeIn" onClick={closeModal} />

                    <div className="relative w-full max-w-lg bg-dark-soft border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-reveal">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-xl font-black">
                                    تعديل اشتراك: {editingSub.player_name}
                                </h3>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-400">اللاعب:</span>
                                        <span className="font-black text-primary">{editingSub.player_name}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400">نوع الاشتراك</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-bold"
                                        >
                                            <option value="شهري">شهري</option>
                                            <option value="ربع سنوي">ربع سنوي</option>
                                            <option value="نصف سنوي">نصف سنوي</option>
                                            <option value="سنوي">سنوي</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-400">المبلغ (د.أ)</label>
                                        <input
                                            type="number"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-black"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400">ملاحظات</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-medium resize-none"
                                        rows={3}
                                        placeholder="ملاحظات إضافية..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-3">
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="btn-primary flex-1 justify-center disabled:opacity-50"
                                >
                                    {updating ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            <span>حفظ التغييرات</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="btn-secondary !bg-white/5 !text-white flex-1 justify-center hover:!bg-white/10"
                                >
                                    <span>إلغاء</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
