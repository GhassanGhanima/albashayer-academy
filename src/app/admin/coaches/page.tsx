'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Users,
    UserPlus,
    Search,
    Edit2,
    Trash2,
    X,
    Check,
    Award,
    Briefcase,
    GraduationCap,
    Image as ImageIcon,
    GripVertical,
    Plus,
    ChevronRight
} from 'lucide-react';

interface Coach {
    id: number;
    name: string;
    title: string;
    bio: string;
    image: string;
    experience: string;
    certifications: string[];
    isHeadCoach: boolean;
    order_index: number;
}

export default function AdminCoachesPage() {
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        bio: '',
        image: '',
        experience: '',
        certifications: '',
        isHeadCoach: false
    });

    useEffect(() => {
        fetchCoaches();
    }, []);

    const fetchCoaches = async () => {
        try {
            const res = await fetch('/api/coaches');
            const data = await res.json();
            setCoaches(data.coaches || []);
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const coachData = {
            name: formData.name,
            title: formData.title,
            bio: formData.bio,
            image: formData.image,
            experience: formData.experience,
            certifications: formData.certifications.split('\n').filter(c => c.trim()),
            isHeadCoach: formData.isHeadCoach
        };

        try {
            if (editingCoach) {
                await fetch(`/api/coaches/${editingCoach.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(coachData)
                });
            } else {
                await fetch('/api/coaches', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(coachData)
                });
            }

            fetchCoaches();
            closeModal();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا المدرب؟')) return;

        try {
            await fetch(`/api/coaches/${id}`, { method: 'DELETE' });
            fetchCoaches();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const openModal = (coach?: Coach) => {
        if (coach) {
            setEditingCoach(coach);
            setFormData({
                name: coach.name,
                title: coach.title,
                bio: coach.bio,
                image: coach.image,
                experience: coach.experience,
                certifications: coach.certifications?.join('\n') || '',
                isHeadCoach: coach.isHeadCoach
            });
        } else {
            setEditingCoach(null);
            setFormData({
                name: '',
                title: '',
                bio: '',
                image: '',
                experience: '',
                certifications: '',
                isHeadCoach: false
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingCoach(null);
    };

    const filteredCoaches = coaches.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-dark text-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-white/10">
                <div className="container px-4 mx-auto py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/admin" className="text-gray-400 hover:text-white">
                                <ChevronRight className="w-6 h-6 rotate-180" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">طاقم التدريب</h1>
                                    <p className="text-gray-400 text-sm">إدارة المدربين والطاقم الفني</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-xl transition-colors"
                        >
                            <UserPlus className="w-5 h-5" />
                            <span>إضافة مدرب</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="container px-4 mx-auto py-8">
                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="البحث في المدربين..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pr-12 pl-4 py-3 focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>

                {/* Coaches Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white/5 rounded-2xl p-6 animate-pulse">
                                <div className="w-20 h-20 bg-white/10 rounded-full mx-auto mb-4" />
                                <div className="h-4 bg-white/10 rounded mb-2" />
                                <div className="h-3 bg-white/10 rounded w-2/3 mx-auto" />
                            </div>
                        ))}
                    </div>
                ) : filteredCoaches.length === 0 ? (
                    <div className="text-center py-16">
                        <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 mb-4">لا يوجد مدربين</p>
                        <button
                            onClick={() => openModal()}
                            className="btn-primary"
                        >
                            إضافة مدرب جديد
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCoaches.map((coach) => (
                            <div
                                key={coach.id}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-primary/50 transition-colors group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {coach.image ? (
                                            <img
                                                src={coach.image}
                                                alt={coach.name}
                                                className="w-14 h-14 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center">
                                                <Users className="w-6 h-6 text-primary" />
                                            </div>
                                        )}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold">{coach.name}</h3>
                                                {coach.isHeadCoach && (
                                                    <Award className="w-4 h-4 text-secondary" fill="currentColor" />
                                                )}
                                            </div>
                                            <p className="text-sm text-primary-light">{coach.title}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openModal(coach)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(coach.id)}
                                            className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {coach.bio && (
                                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">{coach.bio}</p>
                                )}

                                {coach.experience && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Briefcase className="w-3 h-3" />
                                        <span>{coach.experience}</span>
                                    </div>
                                )}

                                {coach.certifications && coach.certifications.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {coach.certifications.slice(0, 2).map((cert, i) => (
                                            <span key={i} className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                                                {cert}
                                            </span>
                                        ))}
                                        {coach.certifications.length > 2 && (
                                            <span className="text-xs text-gray-500">+{coach.certifications.length - 2}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-dark border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-xl font-bold">
                                {editingCoach ? 'تعديل المدرب' : 'إضافة مدرب جديد'}
                            </h2>
                            <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">اسم المدرب *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                                    placeholder="مثال: محمد أحمد"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">المنصب *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                                    placeholder="مثال: المدرب الرئيسي"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">نبذة عن المدرب</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary min-h-[80px]"
                                    placeholder="وصف مختصر عن المدرب..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">الخبرة</label>
                                <input
                                    type="text"
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                                    placeholder="مثال: 15 سنة خبرة"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">الشهادات (سطر لكل شهادة)</label>
                                <textarea
                                    value={formData.certifications}
                                    onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary min-h-[80px]"
                                    placeholder="شهادة المدربين من الاتحاد الأردني&#10;رخصة UEFA B"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">رابط الصورة</label>
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary"
                                    placeholder="/uploads/coach1.jpg"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isHeadCoach"
                                    checked={formData.isHeadCoach}
                                    onChange={(e) => setFormData({ ...formData, isHeadCoach: e.target.checked })}
                                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-primary focus:ring-primary"
                                />
                                <label htmlFor="isHeadCoach" className="flex items-center gap-2 cursor-pointer">
                                    <Award className="w-4 h-4 text-secondary" />
                                    <span>المدرب الرئيسي</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                                >
                                    <Check className="w-5 h-5" />
                                    <span>{editingCoach ? 'حفظ التعديلات' : 'إضافة المدرب'}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
