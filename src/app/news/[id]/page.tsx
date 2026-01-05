'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Newspaper, Calendar, ArrowRight, Share2 } from 'lucide-react';
import Link from 'next/link';

interface NewsItem {
    id: number;
    title: string;
    content: string;
    image: string;
    date: string;
    createdAt: string;
}

export default function NewsDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [news, setNews] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        if (params.id) {
            fetchNews(params.id as string);
        }
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => setSettings(data.settings))
            .catch(console.error);
    }, [params.id]);

    const fetchNews = async (id: string) => {
        try {
            const res = await fetch(`/api/news/${id}`);
            if (res.ok) {
                const data = await res.json();
                setNews(data.news);
            } else {
                router.push('/news');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            router.push('/news');
        }
        setLoading(false);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: news?.title || '',
                    text: news?.content || '',
                    url: window.location.href
                });
            } catch (err) {
                console.log('Share canceled');
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('تم نسخ الرابط!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark text-white pt-32 pb-24 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!news) {
        return (
            <div className="min-h-screen bg-dark text-white pt-32 pb-24 flex items-center justify-center">
                <div className="text-center">
                    <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-6">الخبر غير موجود</p>
                    <Link href="/news" className="btn-primary">
                        العودة للأخبار
                    </Link>
                </div>
            </div>
        );
    }

    const academyName = settings?.academyName || 'أكاديمية البشائر';

    return (
        <div className="min-h-screen bg-dark text-white pt-32 pb-24 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <div className="container relative z-10 px-4 mx-auto max-w-4xl">
                {/* Back Button */}
                <Link href="/news" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    <span>العودة للأخبار</span>
                </Link>

                {/* News Header */}
                <div className="mb-8 animate-reveal">
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <Calendar className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-semibold text-secondary">
                            {news.date ? new Date(news.date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date(news.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                        {news.title}
                    </h1>

                    <div className="flex items-center gap-4">
                        <span className="text-gray-400">{academyName}</span>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 text-primary hover:text-secondary transition-colors"
                        >
                            <Share2 className="w-5 h-5" />
                            <span className="text-sm">مشاركة</span>
                        </button>
                    </div>
                </div>

                {/* Featured Image */}
                {news.image && (
                    <div className="relative aspect-video rounded-3xl overflow-hidden mb-10 animate-reveal" style={{ animationDelay: '0.1s' }}>
                        <img
                            src={news.image}
                            alt={news.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="glass-card p-8 md:p-12 rounded-[40px] animate-reveal" style={{ animationDelay: '0.2s' }}>
                    <div className="prose prose-invert prose-lg max-w-none">
                        <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                            {news.content}
                        </p>
                    </div>
                </div>

                {/* Related Actions */}
                <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-reveal" style={{ animationDelay: '0.3s' }}>
                    <Link href="/news" className="btn-primary flex items-center justify-center gap-2">
                        <ArrowRight className="w-5 h-5 rotate-180" />
                        <span>جميع الأخبار</span>
                    </Link>
                    <Link href="/register" className="btn-secondary flex items-center justify-center gap-2">
                        <span>سجل الآن</span>
                        <Newspaper className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
