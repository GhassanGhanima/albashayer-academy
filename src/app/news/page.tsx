'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper, Calendar, ArrowRight, Star, Trophy } from 'lucide-react';

interface NewsItem {
    id: number;
    title: string;
    content: string;
    image: string;
    images: string[];
    videos: string[];
    date: string;
    createdAt: string;
}

export default function NewsPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        fetchNews();
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => setSettings(data.settings))
            .catch(console.error);
    }, []);

    const academyName = settings?.academyName || 'أكاديمية البشائر';

    const fetchNews = async () => {
        try {
            const res = await fetch('/api/news');
            const data = await res.json();
            setNews(data.news || []);
        } catch (error) {
            console.error('Fetch error:', error);
        }
        setLoading(false);
    };

    // Helper to get the display image (prefer images array, fallback to image)
    const getDisplayImage = (item: NewsItem) => {
        if (item.images && item.images.length > 0) {
            return item.images[0];
        }
        return item.image;
    };

    return (
        <div className="min-h-screen bg-dark text-white pt-32 pb-24 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <div className="container relative z-10 px-4 mx-auto">
                {/* Hero Section */}
                <div className="max-w-3xl mx-auto text-center mb-20 animate-reveal">
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <Newspaper className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-semibold text-secondary tracking-wide">المركز الإعلامي</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                        آخر الأخبار <span className="text-gradient-gold">&</span> الإنجازات
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        تابع رحلتنا في صناعة الأبطال وتعرف على أهم الأحداث والبطولات في {academyName}.
                    </p>
                </div>

                {/* News Grid */}
                <div className="relative z-10">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="aspect-square rounded-[32px] bg-white/5 animate-pulse border border-white/5" />
                            ))}
                        </div>
                    ) : news.length === 0 ? (
                        <div className="glass-card p-16 rounded-[40px] text-center max-w-2xl mx-auto animate-reveal">
                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Trophy className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">لا توجد أخبار حالياً</h3>
                            <p className="text-gray-400 mb-8 text-lg">ترقبوا أهم الأخبار والإنجازات قريباً.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {news.map((item) => {
                                const displayImage = getDisplayImage(item);
                                return (
                                    <div key={item.id} className="glass-card overflow-hidden group rounded-[32px] animate-reveal">
                                        <div className="relative aspect-video overflow-hidden">
                                            {displayImage ? (
                                                <img
                                                    src={displayImage}
                                                    alt={item.title}
                                                    width="400"
                                                    height="225"
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                                                    <Newspaper className="w-12 h-12 text-primary" />
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 px-4 py-2 bg-dark/80 backdrop-blur-md rounded-full text-xs font-bold border border-white/10 flex items-center gap-2">
                                                <Calendar className="w-3 h-3 text-secondary" />
                                                {item.date ? new Date(item.date).toLocaleDateString('ar-SA') : new Date(item.createdAt).toLocaleDateString('ar-SA')}
                                            </div>
                                        </div>

                                        <div className="p-8">
                                            <Link href={`/news/${item.id}`}>
                                                <h3 className="text-xl font-bold mb-4 line-clamp-2 hover:text-secondary transition-colors cursor-pointer">
                                                    {item.title}
                                                </h3>
                                            </Link>
                                            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6">
                                                {item.content}
                                            </p>
                                            <Link
                                                href={`/news/${item.id}`}
                                                className="flex items-center gap-2 text-primary-light font-bold text-sm group/btn hover:text-secondary transition-colors"
                                            >
                                                اقرأ المزيد
                                                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:-translate-x-1" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
