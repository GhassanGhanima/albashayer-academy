'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Target, Star, History, Trophy, Users, Shield, Lightbulb, ArrowRight } from 'lucide-react';

interface Coach {
    id: number;
    name: string;
    title: string;
    bio: string;
    image?: string;
    experience?: string;
    certifications?: string[];
    isHeadCoach: boolean;
}

export default function AboutPage() {
    const [settings, setSettings] = useState<any>(null);
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/settings').then(res => res.json()),
            fetch('/api/coaches').then(res => res.json())
        ])
            .then(([settingsData, coachesData]) => {
                setSettings(settingsData.settings);
                setCoaches(coachesData.coaches || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const academyName = settings?.academyName || 'أكاديمية البشائر';

    return (
        <div className="min-h-screen bg-dark text-white pt-32 pb-24 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <div className="container relative z-10 px-4 mx-auto">
                {/* Hero Section */}
                <div className="max-w-3xl mx-auto text-center mb-24 animate-reveal">
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <Trophy className="w-4 h-4 text-secondary" fill="currentColor" />
                        <span className="text-sm font-semibold text-secondary tracking-wide">عن {academyName}</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                        نصنع <span className="text-gradient-gold">أبطال المستقبل</span>
                    </h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        نحن لا نعلم كرة القدم فحسب، بل نصقل الشخصية ونبني القادة منذ عام 2016.
                    </p>
                </div>

                {/* Vision & Mission */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
                    <div className="glass-card p-10 rounded-[40px] animate-reveal">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8">
                            <Target className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-black mb-4">رؤيتنا</h2>
                        <p className="text-gray-400 leading-relaxed">
                            أن نكون الأكاديمية الرائدة في اكتشاف وتطوير المواهب الكروية الواعدة،
                            ومصدراً رئيسياً لتزويد الأندية المحلية والدولية بلاعبين محترفين.
                        </p>
                    </div>
                    <div className="glass-card p-10 rounded-[40px] animate-reveal" style={{ animationDelay: '0.1s' }}>
                        <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-8">
                            <Lightbulb className="w-8 h-8 text-secondary" />
                        </div>
                        <h2 className="text-2xl font-black mb-4">رسالتنا</h2>
                        <p className="text-gray-400 leading-relaxed">
                            تقديم بيئة تدريبية احترافية ومتكاملة تجمع بين التطوير الفني والبدني والنفسي،
                            مع التركيز على بناء شخصية اللاعب وغرس القيم الرياضية الأصيلة.
                        </p>
                    </div>
                </div>

                {/* Our Story */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
                    <div className="relative animate-reveal">
                        <div className="aspect-square rounded-[40px] bg-gradient-to-br from-primary to-primary-glow overflow-hidden flex items-center justify-center text-8xl shadow-2xl">
                            ⚽
                        </div>
                        <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-secondary/20 rounded-3xl backdrop-blur-3xl border border-white/10 flex flex-col items-center justify-center text-center p-4">
                            <div className="text-4xl font-black text-secondary">+8</div>
                            <div className="text-xs font-bold text-gray-300">سنوات من الخبرة</div>
                        </div>
                    </div>
                    <div className="animate-reveal">
                        <h2 className="text-4xl font-black mb-8 leading-tight">قصتنا بدأت من <span className="text-gradient-gold">الشغف</span></h2>
                        <div className="space-y-6 text-gray-400 leading-relaxed">
                            <p>
                                انطلقت {academyName} في عام 2016 برؤية واضحة:
                                اكتشاف وتطوير المواهب الكروية الواعدة في المملكة الأردنية الهاشمية.
                            </p>
                            <p>
                                بدأنا بمجموعة صغيرة من 20 لاعباً، واليوم نفخر بأن نضم أكثر من 150
                                لاعباً موهوباً يتدربون تحت إشراف نخبة من المدربين المحترفين.
                            </p>
                            <p>
                                حققنا خلال مسيرتنا أكثر من 25 بطولة على مستوى المنطقة والمملكة،
                                وأسهمنا في صقل مهارات العديد من اللاعبين الذين انضموا لأندية الدرجة الأولى.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32">
                    {[
                        { icon: Users, value: '150+', label: 'لاعب مسجل' },
                        { icon: Trophy, value: '25+', label: 'بطولة' },
                        { icon: Shield, value: '10+', label: 'مدرب محترف' },
                        { icon: Star, value: '24/7', label: 'دعم فني' },
                    ].map((stat, index) => (
                        <div key={index} className="glass-card p-8 rounded-[32px] text-center animate-reveal" style={{ animationDelay: `${index * 0.1}s` }}>
                            <stat.icon className="w-8 h-8 text-primary-light mx-auto mb-4" />
                            <div className="text-3xl font-black mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Coaches */}
                <div className="mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-4">طاقم <span className="text-gradient-gold">التدريب</span></h2>
                        <p className="text-gray-400">نخبة من المدربين المحترفين لتطوير مهارات أبنائكم</p>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="glass-card p-8 rounded-[40px] text-center animate-pulse">
                                    <div className="w-24 h-24 bg-white/10 rounded-full mx-auto mb-6" />
                                    <div className="h-4 bg-white/10 rounded mb-2" />
                                    <div className="h-3 bg-white/10 rounded w-2/3 mx-auto" />
                                </div>
                            ))}
                        </div>
                    ) : coaches.length === 0 ? (
                        <div className="glass-card p-12 rounded-[40px] text-center">
                            <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400">سيتم إضافة طاقم التدريب قريباً</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {coaches.map((coach, index) => (
                                <div key={coach.id} className="glass-card p-8 rounded-[40px] text-center group animate-reveal" style={{ animationDelay: `${index * 0.1}s` }}>
                                    {coach.image ? (
                                        <img
                                            src={coach.image}
                                            alt={coach.name}
                                            className="w-24 h-24 rounded-full object-cover mx-auto mb-6 group-hover:ring-4 ring-primary transition-all"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary transition-colors duration-500">
                                            <Users className="w-10 h-10 text-primary group-hover:text-white transition-colors" />
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <h3 className="text-xl font-bold group-hover:text-secondary transition-colors">{coach.name}</h3>
                                        {coach.isHeadCoach && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                                    </div>
                                    <div className="text-primary-light font-bold text-sm mb-4">{coach.title}</div>
                                    {coach.bio && <p className="text-gray-400 text-sm leading-relaxed mb-4">{coach.bio}</p>}
                                    {coach.experience && (
                                        <p className="text-xs text-gray-500 mb-3">{coach.experience}</p>
                                    )}
                                    {coach.certifications && coach.certifications.length > 0 && (
                                        <div className="flex flex-wrap justify-center gap-1">
                                            {coach.certifications.slice(0, 2).map((cert, i) => (
                                                <span key={i} className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                                                    {cert}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* CTA */}
                <div className="glass-card p-12 md:p-20 rounded-[40px] text-center relative overflow-hidden animate-reveal">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />

                    <h2 className="text-4xl md:text-5xl font-black mb-6 relative z-10">هل أنت مستعد للانضمام؟</h2>
                    <p className="text-lg text-gray-300 mb-10 max-w-lg mx-auto relative z-10">
                        سجل طفلك اليوم وابدأ رحلة النجوم مع أفضل أكاديمية في المنطقة.
                    </p>
                    <Link href="/register" className="btn-secondary mx-auto relative z-10">
                        <span>سجل الآن مجاناً</span>
                        <ArrowRight className="w-5 h-5 -rotate-180" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
