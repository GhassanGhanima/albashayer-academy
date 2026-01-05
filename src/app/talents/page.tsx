'use client';

import { useState, useEffect } from 'react';
import Link from 'next/navigation';
import TalentCard from '@/components/TalentCard';
import { Star, Trophy, Users } from 'lucide-react';

interface Player {
    id: number;
    name: string;
    age: number;
    position: string;
    bio: string;
    images: string[];
    isFeatured: boolean;
}

export default function TalentsPage() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        fetchPlayers();
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => setSettings(data.settings))
            .catch(console.error);
    }, []);

    const fetchPlayers = async () => {
        try {
            const res = await fetch('/api/players');
            const data = await res.json();
            setPlayers(data.players || []);
        } catch (error) {
            console.error('Error fetching players:', error);
        }
        setLoading(false);
    };

    const academyName = settings?.academyName || 'الأكاديمية';

    return (
        <div className="min-h-screen bg-dark text-white pt-32 pb-24 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <div className="container relative z-10 px-4 mx-auto">
                {/* Hero Section */}
                <div className="max-w-3xl mx-auto text-center mb-20 animate-reveal">
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <Star className="w-4 h-4 text-secondary" fill="currentColor" />
                        <span className="text-sm font-semibold text-secondary tracking-wide">نجوم المستقبل</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                        مواهب <span className="text-gradient-gold">{academyName}</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        نفتخر بجيل واعد من اللاعبين المتميزين الذين يتم إعدادهم للمنافسة في أعلى المستويات.
                        اكتشف نجومنا القادمين.
                    </p>
                </div>

                {/* Content Section */}
                <div className="relative z-10">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="aspect-[3/4] rounded-[32px] bg-white/5 animate-pulse border border-white/5" />
                            ))}
                        </div>
                    ) : players.length === 0 ? (
                        <div className="glass-card p-16 rounded-[40px] text-center max-w-2xl mx-auto animate-reveal">
                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Users className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">لا توجد مواهب حالياً</h3>
                            <p className="text-gray-400 mb-8 text-lg">كن أول المنضمين إلينا وابدأ رحلتك نحو النجومية!</p>
                            <a href="/register" className="btn-primary inline-flex items-center gap-2">
                                <span>سجل طفلك الآن</span>
                                <Trophy className="w-5 h-5" />
                            </a>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {players.map((player) => (
                                <TalentCard key={player.id} player={player} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
