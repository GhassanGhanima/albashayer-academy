'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FacebookShare from '@/components/FacebookShare';
import { ArrowRight, Trophy, Award } from 'lucide-react';

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
    joinDate: string;
}

export default function TalentDetailPage({ params }: { params: { id: string } }) {
    const [player, setPlayer] = useState<Player | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlayer();
    }, [params.id]);

    const fetchPlayer = async () => {
        try {
            const res = await fetch(`/api/players/${params.id}`);
            const data = await res.json();
            setPlayer(data.player);
        } catch (error) {
            console.error('Error fetching player:', error);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark text-white pt-32 pb-24 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">جاري تحميل الملف الشخصي...</p>
                </div>
            </div>
        );
    }

    if (!player) {
        return (
            <div className="min-h-screen bg-dark text-white pt-32 pb-24 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-6">⚽</div>
                    <h3 className="text-2xl font-bold mb-4">اللاعب غير موجود</h3>
                    <Link href="/talents" className="btn-primary">العودة للمواهب</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark text-white pt-32 pb-24 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <div className="container relative z-10 px-4 mx-auto max-w-6xl">
                {/* Back Link */}
                <Link
                    href="/talents"
                    className="inline-flex items-center gap-2 text-secondary hover:text-secondary-glow transition-colors mb-8 font-bold"
                >
                    <ArrowRight className="w-5 h-5" />
                    العودة للمواهب
                </Link>

                {/* Hero Section */}
                <div className="glass-card p-8 md:p-12 rounded-[40px] mb-8 animate-reveal">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black mb-4">
                                {player.name}
                            </h1>
                            <div className="flex flex-wrap gap-3">
                                <span className="glass px-4 py-2 rounded-full text-sm font-semibold">
                                    {player.position}
                                </span>
                                <span className="glass px-4 py-2 rounded-full text-sm font-semibold">
                                    {player.age} سنة
                                </span>
                                <span className="glass px-4 py-2 rounded-full text-sm font-semibold">
                                    انضم في {player.joinDate ? new Date(player.joinDate).toLocaleDateString('ar-SA') : '2024'}
                                </span>
                                {player.isFeatured && (
                                    <span className="px-4 py-2 rounded-full text-sm font-semibold bg-secondary/20 text-secondary border border-secondary/30">
                                        موهبة مميزة ⭐
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar - Image */}
                    <div className="lg:col-span-1">
                        <div className="glass-card p-4 rounded-[32px] sticky top-32">
                            {player.images?.[0] ? (
                                <img
                                    src={player.images[0]}
                                    alt={player.name}
                                    className="w-full aspect-[3/4] object-cover rounded-[24px]"
                                />
                            ) : (
                                <div className="w-full aspect-[3/4] bg-gradient-to-br from-primary to-dark rounded-[24px] flex items-center justify-center text-8xl">
                                    ⚽
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About Section */}
                        <div className="glass-card p-8 rounded-[32px]">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <span className="w-1 h-8 bg-primary rounded-full"></span>
                                عن اللاعب
                            </h2>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                {player.bio || 'لاعب متميز في أكاديمية البشائر لكرة القدم، يتمتع بروح رياضية عالية وطموح كبير للاحتراف.'}
                            </p>
                        </div>

                        {/* Achievements Section */}
                        <div className="glass-card p-8 rounded-[32px]">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Trophy className="w-6 h-6 text-secondary" />
                                الإنجازات والبطولات
                            </h2>
                            {player.achievements && player.achievements.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {player.achievements.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="glass p-4 rounded-2xl flex items-center gap-4 hover:border-secondary/30 transition-colors"
                                        >
                                            <Award className="w-8 h-8 text-secondary flex-shrink-0" />
                                            <p className="font-semibold">{item}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-500">ترقبوا أولى إنجازات هذا البطل قريباً.</p>
                                </div>
                            )}
                        </div>

                        {/* Gallery Section */}
                        {player.images && player.images.length > 1 && (
                            <div className="glass-card p-8 rounded-[32px]">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <span className="w-1 h-8 bg-primary rounded-full"></span>
                                    معرض الصور
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {player.images.map((img, idx) => (
                                        <div key={idx} className="aspect-square rounded-2xl overflow-hidden">
                                            <img
                                                src={img}
                                                alt={`صورة ${idx + 1}`}
                                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Videos Section */}
                        {player.videos && player.videos.length > 0 && (
                            <div className="glass-card p-8 rounded-[32px]">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <span className="w-1 h-8 bg-secondary rounded-full"></span>
                                    فيديوهات اللاعب
                                </h2>
                                <div className="space-y-4">
                                    {player.videos.map((video, idx) => (
                                        <div key={idx} className="rounded-2xl overflow-hidden bg-black/30">
                                            <video
                                                src={video}
                                                controls
                                                className="w-full max-h-[400px]"
                                                preload="metadata"
                                            >
                                                متصفحك لا يدعم تشغيل الفيديو
                                            </video>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Share Section */}
                        <div className="glass-card p-8 rounded-[32px] text-center">
                            <h2 className="text-2xl font-bold mb-3">شارك الموهبة 📢</h2>
                            <p className="text-gray-400 mb-6">ساعد في وصول {player.name} للعالمية!</p>
                            <FacebookShare playerName={player.name} playerId={String(player.id)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
