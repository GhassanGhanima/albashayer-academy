'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Newspaper,
    PlusCircle,
    Search,
    Calendar,
    CheckCircle2,
    Clock,
    Edit2,
    Trash2,
    X,
    Eye,
    Globe,
    FileText,
    Check,
    Image as ImageIcon,
    Video,
    Upload
} from 'lucide-react';
import { authenticatedFetch, authenticatedUpload } from '@/lib/api';

interface NewsItem {
    id: number;
    title: string;
    content: string;
    image: string;
    images: string[];
    videos: string[];
    isPublished: boolean;
    created_at: string;
}

export default function AdminNewsPage() {
    const router = useRouter();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [uploading, setUploading] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        image: '',
        images: [] as string[],
        videos: [] as string[],
        isPublished: true
    });

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const res = await fetch('/api/news?all=true');
            const data = await res.json();
            setNews(data.news || []);
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false);
    };

    const handleFileUpload = async (file: File, type: 'image' | 'video') => {
        if (!file) return null;

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);
            formDataUpload.append('type', type);

            const res = await authenticatedUpload('/api/upload', formDataUpload);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const submitData = {
            title: formData.title,
            content: formData.content,
            image: formData.image,
            images: formData.images,
            videos: formData.videos,
            isPublished: formData.isPublished
        };

        try {
            let res;
            if (editingNews) {
                res = await authenticatedFetch(`/api/news/${editingNews.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(submitData)
                });
            } else {
                res = await authenticatedFetch('/api/news', {
                    method: 'POST',
                    body: JSON.stringify(submitData)
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

            fetchNews();
            closeModal();
        } catch (error) {
            console.error('Error:', error);
            alert('حدث خطأ في الاتصال');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا الخبر؟')) return;

        try {
            const res = await authenticatedFetch(`/api/news/${id}`, { method: 'DELETE' });

            if (res.status === 401) {
                localStorage.removeItem('admin_token');
                router.push('/admin/login');
                return;
            }

            if (res.ok) {
                fetchNews();
            } else {
                alert('فشل الحذف');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('حدث خطأ في الاتصال');
        }
    };

    const openEditModal = (item: NewsItem) => {
        setEditingNews(item);
        setFormData({
            title: item.title,
            content: item.content,
            image: item.image || '',
            images: item.images || [],
            videos: item.videos || [],
            isPublished: item.isPublished
        });
        setShowModal(true);
    };

    const openNewModal = () => {
        setEditingNews(null);
        setFormData({
            title: '',
            content: '',
            image: '',
            images: [],
            videos: [],
            isPublished: true
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingNews(null);
    };

    const filteredNews = news.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.content.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-4xl font-black mb-2">إدارة الأخبار <span className="text-gradient-gold text-2xl">📰</span></h1>
                    <p className="text-gray-400 font-medium">نشر وتحديث أخبار وإنجازات الأكاديمية</p>
                </div>
                <button onClick={openNewModal} className="btn-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark">
                    <PlusCircle className="w-5 h-5" />
                    <span>إضافة خبر جديد</span>
                </button>
            </div>

            {/* Actions Bar */}
            <div className="glass-card p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="ابحث عن خبر..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pr-12 pl-4 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium"
                    />
                </div>
                <div className="flex items-center gap-6 text-sm font-bold text-gray-400">
                    <div className="flex items-center gap-2">
                        <span>إجمالي الأخبار:</span>
                        <span className="text-white bg-white/10 px-3 py-1 rounded-full">{news.length}</span>
                    </div>
                </div>
            </div>

            {/* News Grid */}
            {filteredNews.length === 0 ? (
                <div className="glass-card p-20 rounded-[40px] text-center border-dashed">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Newspaper className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-black mb-2">لا توجد أخبار</h3>
                    <p className="text-gray-400 mb-8 max-w-xs mx-auto">لم يتم العثور على أي أخبار أو القائمة فارغة حالياً.</p>
                    <button onClick={openNewModal} className="btn-secondary mx-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark">
                        <PlusCircle className="w-5 h-5" />
                        <span>إضافة أول خبر</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredNews.map((item) => (
                        <div key={item.id} className="glass-card group hover:scale-[1.01] transition-all duration-300 rounded-[40px] overflow-hidden border-white/5 flex flex-col">
                            {/* Card Image/Icon Placeholder */}
                            <div className="h-48 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent flex items-center justify-center relative overflow-hidden">
                                {(item.images && item.images.length > 0) ? (
                                    <img
                                        src={item.images[0]}
                                        alt={item.title}
                                        width="400"
                                        height="200"
                                        className="w-full h-full object-cover"
                                    />
                                ) : item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        width="400"
                                        height="200"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Newspaper className="w-16 h-16 text-primary opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all duration-500" />
                                )}
                                <div className="absolute top-6 right-6">
                                    {item.isPublished ? (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/30">
                                            <Globe className="w-3 h-3" />
                                            <span>منشور</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/30">
                                            <Clock className="w-3 h-3" />
                                            <span>مسودة</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-4">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{new Date(item.created_at).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                                <h3 className="text-2xl font-black mb-4 group-hover:text-secondary transition-colors line-clamp-1">{item.title}</h3>
                                <p className="text-gray-400 font-medium leading-relaxed line-clamp-2 mb-8 flex-1">{item.content}</p>

                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="p-3 rounded-2xl bg-white/5 border border-white/5 text-gray-400 hover:bg-secondary hover:text-dark hover:border-secondary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
                                            aria-label="تعديل الخبر"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-3 rounded-2xl bg-white/5 border border-white/5 text-gray-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
                                            aria-label="حذف الخبر"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                                        <Eye className="w-5 h-5 text-gray-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
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
                                    <FileText className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-xl font-black">
                                    {editingNews ? 'تعديل الخبر' : 'إضافة خبر جديد'}
                                </h3>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-white/5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark" aria-label="إغلاق النافذة">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="space-y-2">
                                    <label htmlFor="news-title" className="text-sm font-bold text-gray-400 mr-2">عنوان الخبر *</label>
                                    <input
                                        id="news-title"
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-black text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-dark-soft"
                                        placeholder="أدخل عنواناً جذاباً..."
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="news-content" className="text-sm font-bold text-gray-400 mr-2">محتوى الخبر *</label>
                                    <textarea
                                        id="news-content"
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all font-medium resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-dark-soft"
                                        rows={6}
                                        placeholder="ابدأ بكتابة تفاصيل الخبر هنا..."
                                        required
                                    ></textarea>
                                </div>

                                {/* Images Upload Section */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-gray-400 mr-2">صور الخبر</label>
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
                                    <label className="text-sm font-bold text-gray-400 mr-2">فيديوهات الخبر</label>
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

                                <label className="flex items-center gap-4 p-6 bg-white/5 border border-white/5 rounded-3xl cursor-pointer group hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.isPublished ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' : 'bg-white/10 text-gray-500'}`}>
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="block font-bold">نشر الخبر</span>
                                        <span className="block text-xs text-gray-500">سيظهر الخبر فوراً في الموقع العام</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.isPublished}
                                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                        className="hidden"
                                    />
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.isPublished ? 'bg-primary border-primary' : 'border-gray-600'}`}>
                                        {formData.isPublished && <Check className="w-4 h-4 text-white" />}
                                    </div>
                                </label>
                            </div>

                            <div className="p-8 bg-white/[0.02] border-t border-white/5 flex gap-4">
                                <button type="submit" className="btn-primary flex-1 justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark-soft">
                                    <Check className="w-5 h-5" />
                                    <span>{editingNews ? 'حفظ التغييرات' : 'نشر الخبر'}</span>
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
