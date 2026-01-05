'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    UserPlus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    Star,
    X,
    ChevronRight,
    Trophy,
    Check,
    AlertCircle,
    PlusCircle,
    Image as ImageIcon,
    Video,
    Upload,
    Power,
    Ban
} from 'lucide-react';
import { authenticatedFetch, authenticatedUpload } from '@/lib/api';

interface Player {
    id: number;
    name: string;
    age: number;
    position: string;
    bio: string;
    achievements: string[];
    images: string[];
    videos: string[];
    isFeatured: boolean;
    isActive: boolean;
    joinDate: string;
}

export default function AdminPlayersPage() {
    const router = useRouter();
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [uploading, setUploading] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        position: '',
        bio: '',
        achievements: '',
        isFeatured: false,
        isActive: true,
        images: [] as string[],
        videos: [] as string[]
    });

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        try {
            const res = await fetch('/api/players');
            const data = await res.json();
            setPlayers(data.players || []);
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const playerData = {
            name: formData.name,
            age: parseInt(formData.age),
            position: formData.position,
            bio: formData.bio,
            achievements: formData.achievements.split('\n').filter(a => a.trim()),
            isFeatured: formData.isFeatured,
            isActive: formData.isActive,
            images: formData.images,
            videos: formData.videos,
            joinDate: editingPlayer?.joinDate || new Date().toISOString().split('T')[0]
        };

        try {
            let res;
            if (editingPlayer) {
                res = await authenticatedFetch(`/api/players/${editingPlayer.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(playerData)
                });
            } else {
                res = await authenticatedFetch('/api/players', {
                    method: 'POST',
                    body: JSON.stringify(playerData)
                });
            }

            if (res.status === 401) {
                localStorage.removeItem('admin_token');
                router.push('/admin/login');
                return;
            }

            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'حدث خطأ أثناء الحفظ');
                return;
            }

            fetchPlayers();
            closeModal();
        } catch (error) {
            console.error('Error:', error);
            alert('حدث خطأ في الاتصال');
        }
    };

    const handleFileUpload = async (file: File, type: 'image' | 'video') => {
        if (!file) return null;

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);

            const res = await authenticatedUpload('/api/upload', formData);

            if (res.status === 401) {
                localStorage.removeItem('admin_token');
                router.push('/admin/login');
                return null;
            }

            const data = await res.json();

            if (data.success) {
                return data.url;
            } else {
                console.error('Upload failed:', data.error);
                alert(`فشل الرفع: ${data.error || 'حدث خطأ ما'}`);
                return null;
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('فشل الرفع: حدث خطأ في الاتصال');
            return null;
        }
    };

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setUploading(true);
        try {
            const uploadPromises = Array.from(files).map(file => handleFileUpload(file, 'image'));
            const urls = await Promise.all(uploadPromises);
            const validUrls = urls.filter(url => url !== null) as string[];

            // Use functional update to avoid race condition
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...validUrls]
            }));

            // Reset input so same files can be selected again
            if (imageInputRef.current) {
                imageInputRef.current.value = '';
            }
        } finally {
            setUploading(false);
        }
    };

    const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setUploading(true);
        try {
            const uploadPromises = Array.from(files).map(file => handleFileUpload(file, 'video'));
            const urls = await Promise.all(uploadPromises);
            const validUrls = urls.filter(url => url !== null) as string[];

            // Use functional update to avoid race condition
            setFormData(prev => ({
                ...prev,
                videos: [...prev.videos, ...validUrls]
            }));

            // Reset input so same files can be selected again
            if (videoInputRef.current) {
                videoInputRef.current.value = '';
            }
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const removeVideo = (index: number) => {
        setFormData(prev => ({
            ...prev,
            videos: prev.videos.filter((_, i) => i !== index)
        }));
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا اللاعب؟')) return;

        try {
            const res = await authenticatedFetch(`/api/players/${id}`, { method: 'DELETE' });

            if (res.status === 401) {
                localStorage.removeItem('admin_token');
                router.push('/admin/login');
                return;
            }

            if (res.ok) {
                fetchPlayers();
            } else {
                alert('فشل الحذف');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('حدث خطأ في الاتصال');
        }
    };

    const toggleActive = async (player: Player) => {
        const action = player.isActive ? 'تعطيل' : 'تفعيل';
        if (!confirm(`هل أنت متأكد من ${action} اللاعب ${player.name}؟`)) return;

        try {
            const res = await authenticatedFetch(`/api/players/${player.id}`, {
                method: 'PUT',
                body: JSON.stringify({ isActive: !player.isActive })
            });

            if (res.status === 401) {
                localStorage.removeItem('admin_token');
                router.push('/admin/login');
                return;
            }

            if (res.ok) {
                fetchPlayers();
            } else {
                alert('فشل تحديث الحالة');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('حدث خطأ في الاتصال');
        }
    };

    const openEditModal = (player: Player) => {
        setEditingPlayer(player);
        setFormData({
            name: player.name,
            age: player.age.toString(),
            position: player.position,
            bio: player.bio || '',
            achievements: (player.achievements || []).join('\n'),
            isFeatured: player.isFeatured,
            isActive: player.isActive !== undefined ? player.isActive : true,
            images: player.images || [],
            videos: player.videos || []
        });
        setShowModal(true);
    };

    const openNewModal = () => {
        setEditingPlayer(null);
        setFormData({
            name: '',
            age: '',
            position: '',
            bio: '',
            achievements: '',
            isFeatured: false,
            isActive: true,
            images: [],
            videos: []
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPlayer(null);
    };

    const filteredPlayers = players.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.position.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <h1 className="text-4xl font-black mb-2">إدارة اللاعبين <span className="text-gradient-gold text-2xl">⚽</span></h1>
                    <p className="text-gray-400 font-medium">قائمة لاعبي الأكاديمية والمواهب الناشئة</p>
                </div>
                <button onClick={openNewModal} className="btn-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark">
                    <UserPlus className="w-5 h-5" />
                    <span>إضافة لاعب جديد</span>
                </button>
            </div>

            {/* Actions Bar */}
            <div className="glass-card p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="ابحث عن لاعب أو مركز..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pr-12 pl-4 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium"
                    />
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                    <span>إجمالي اللاعبين:</span>
                    <span className="text-white bg-primary/20 px-3 py-1 rounded-full">{players.length}</span>
                </div>
            </div>

            {/* Players List */}
            {filteredPlayers.length === 0 ? (
                <div className="glass-card p-20 rounded-[40px] text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-black mb-2">لا يوجد أي لاعبين</h3>
                    <p className="text-gray-400 mb-8 max-w-xs mx-auto">لم يتم العثور على أي لاعبين يطابقون بحثك أو القائمة فارغة حالياً.</p>
                    <button onClick={openNewModal} className="btn-secondary mx-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark">
                        <PlusCircle className="w-5 h-5" />
                        <span>إضافة أول لاعب</span>
                    </button>
                </div>
            ) : (
                <div className="glass-card overflow-hidden rounded-[40px] border-white/5">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] text-right border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest">اللاعب</th>
                                    <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-center">العمر</th>
                                    <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest">المركز</th>
                                    <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest">الحالة</th>
                                    <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-widest text-left">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredPlayers.map((player) => (
                                    <tr key={player.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center font-black text-primary group-hover:scale-110 transition-transform">
                                                    {player.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-lg group-hover:text-secondary transition-colors">{player.name}</div>
                                                    <div className="text-xs text-gray-500">انضم في {player.joinDate}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center font-bold text-gray-300">
                                            {player.age}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-bold border border-white/5">{player.position}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                {player.isFeatured ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-xs font-black border border-amber-500/20">
                                                        <Star className="w-3 h-3 fill-current" />
                                                        <span>مميز</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-500/10 text-gray-500 rounded-full text-xs font-black border border-gray-500/20">
                                                        <span>عادي</span>
                                                    </span>
                                                )}
                                                {!player.isActive && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-xs font-black border border-rose-500/20">
                                                        <Ban className="w-3 h-3" />
                                                        <span>منسحب</span>
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-2 outline-none">
                                                <button
                                                    onClick={() => toggleActive(player)}
                                                    className={`p-2 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-dark ${
                                                        player.isActive
                                                            ? 'bg-white/5 border-white/5 text-gray-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 focus-visible:ring-rose-500'
                                                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white focus-visible:ring-emerald-500'
                                                    }`}
                                                    title={player.isActive ? 'تعطيل اللاعب' : 'تفعيل اللاعب'}
                                                    aria-label={player.isActive ? 'تعطيل اللاعب' : 'تفعيل اللاعب'}
                                                >
                                                    {player.isActive ? <Power className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(player)}
                                                    className="p-2 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:bg-secondary hover:text-dark hover:border-secondary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
                                                    aria-label="تعديل اللاعب"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(player.id)}
                                                    className="p-2 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
                                                    aria-label="حذف اللاعب"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modern Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-dark/80 backdrop-blur-md animate-fadeIn" onClick={closeModal} />

                    <div className="relative w-full max-w-2xl bg-dark-soft border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-reveal">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                                    <Trophy className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-xl font-black">
                                    {editingPlayer ? 'تعديل بيانات اللاعب' : 'إضافة لاعب جديد'}
                                </h3>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-white/5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark" aria-label="إغلاق النافذة">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="player-name" className="text-sm font-bold text-gray-400 mr-2">الاسم بالكامل *</label>
                                        <input
                                            id="player-name"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-dark-soft"
                                            placeholder="أدخل الاسم..."
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="player-age" className="text-sm font-bold text-gray-400 mr-2">العمر *</label>
                                        <input
                                            id="player-age"
                                            type="number"
                                            value={formData.age}
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all  font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-dark-soft"
                                            placeholder="مثال: 12"
                                            min="4"
                                            max="25"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="player-position" className="text-sm font-bold text-gray-400 mr-2">المركز في الملعب *</label>
                                    <select
                                        id="player-position"
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-bold appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-dark-soft"
                                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'left 1.5rem center', backgroundSize: '1.2rem' }}
                                        required
                                    >
                                        <option value="" className="bg-dark">اختر المركز...</option>
                                        <option value="حارس مرمى" className="bg-dark text-white p-4">حارس مرمى</option>
                                        <option value="مدافع" className="bg-dark text-white p-4">مدافع</option>
                                        <option value="وسط" className="bg-dark text-white p-4">وسط</option>
                                        <option value="جناح" className="bg-dark text-white p-4">جناح</option>
                                        <option value="مهاجم" className="bg-dark text-white p-4">مهاجم</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="player-bio" className="text-sm font-bold text-gray-400 mr-2">نبذة عن اللاعب</label>
                                    <textarea
                                        id="player-bio"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-medium resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-dark-soft"
                                        rows={3}
                                        placeholder="اكتب نبذة مختصرة عن مهارات اللاعب..."
                                    ></textarea>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="player-achievements" className="text-sm font-bold text-gray-400 mr-2">الإنجازات (كل إنجاز في سطر)</label>
                                    <textarea
                                        id="player-achievements"
                                        value={formData.achievements}
                                        onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-medium resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-dark-soft"
                                        rows={4}
                                        placeholder="مثال:&#10;أفضل حارس في بطولة 2024&#10;هداف الدوري الممتاز"
                                    ></textarea>
                                </div>

                                {/* Images Upload Section */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-gray-400 mr-2">صور اللاعب</label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex-1 flex items-center justify-center gap-3 p-4 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
                                            <ImageIcon className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                                            <span className="text-gray-400 group-hover:text-white transition-colors">
                                                {uploading ? 'جاري الرفع...' : 'اختر صوراً...'}
                                            </span>
                                            <input
                                                ref={imageInputRef}
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageSelect}
                                                className="hidden"
                                                disabled={uploading}
                                            />
                                        </label>
                                    </div>

                                    {/* Images Preview */}
                                    {formData.images.length > 0 && (
                                        <div className="grid grid-cols-4 gap-3 mt-4">
                                            {formData.images.map((img, idx) => (
                                                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden">
                                                    <img
                                                        src={img}
                                                        alt={`صورة ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(idx)}
                                                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
                                                        aria-label="حذف الصورة"
                                                    >
                                                        <X className="w-4 h-4 text-white" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Videos Upload Section */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-gray-400 mr-2">فيديوهات اللاعب</label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex-1 flex items-center justify-center gap-3 p-4 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-secondary/50 hover:bg-secondary/5 transition-all group">
                                            <Video className="w-5 h-5 text-gray-500 group-hover:text-secondary transition-colors" />
                                            <span className="text-gray-400 group-hover:text-white transition-colors">
                                                {uploading ? 'جاري الرفع...' : 'اختر فيديوهات...'}
                                            </span>
                                            <input
                                                ref={videoInputRef}
                                                type="file"
                                                multiple
                                                accept="video/*"
                                                onChange={handleVideoSelect}
                                                className="hidden"
                                                disabled={uploading}
                                            />
                                        </label>
                                    </div>

                                    {/* Videos Preview */}
                                    {formData.videos.length > 0 && (
                                        <div className="space-y-2 mt-4">
                                            {formData.videos.map((video, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl group">
                                                    <Video className="w-8 h-8 text-secondary flex-shrink-0" />
                                                    <span className="flex-1 text-sm text-gray-300 truncate">{video}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVideo(idx)}
                                                        className="p-1 text-gray-500 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-soft rounded"
                                                        aria-label="حذف الفيديو"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <label className="flex items-center gap-4 p-6 bg-white/5 border border-white/5 rounded-3xl cursor-pointer group hover:bg-amber-500/5 hover:border-amber-500/20 transition-all">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.isFeatured ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/40' : 'bg-white/10 text-gray-500'}`}>
                                        <Star className={`w-5 h-5 ${formData.isFeatured ? 'fill-current' : ''}`} />
                                    </div>
                                    <div className="flex-1">
                                        <span className="block font-bold">موهبة مميزة</span>
                                        <span className="block text-xs text-gray-500">سيظهر اللاعب في قسم "المواهب" بالصفحة الرئيسية</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                        className="hidden"
                                    />
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.isFeatured ? 'bg-primary border-primary' : 'border-gray-600'}`}>
                                        {formData.isFeatured && <Check className="w-4 h-4 text-white" />}
                                    </div>
                                </label>
                            </div>

                            <div className="p-8 bg-white/[0.02] border-t border-white/5 flex gap-4">
                                <button type="submit" className="btn-primary flex-1 justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark-soft">
                                    <Check className="w-5 h-5" />
                                    <span>{editingPlayer ? 'حفظ التعديلات' : 'إضافة اللاعب'}</span>
                                </button>
                                <button type="button" onClick={closeModal} className="btn-secondary !bg-white/5 !text-white flex-1 justify-center hover:!bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark-soft">
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
