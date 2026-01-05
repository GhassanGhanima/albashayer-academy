'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import TalentCard from '@/components/TalentCard';
import { Trophy, Shield, TrendingUp, ArrowRight, Star } from 'lucide-react';

interface Player {
  id: number;
  name: string;
  age: number;
  position: string;
  isFeatured: boolean;
  images: string[];
}

export default function HomePage() {
  const [featuredPlayers, setFeaturedPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const playersRes = await fetch('/api/players');
        const playersData = await playersRes.json();
        const all = playersData.players || [];
        setFeaturedPlayers(all.filter((p: Player) => p.isFeatured).slice(0, 3));

        const settingsRes = await fetch('/api/settings');
        const settingsData = await settingsRes.json();
        setSettings(settingsData.settings);
      } catch (error) {
        console.error('Fetch error:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const academyName = settings?.academyName || 'أكاديمية البشائر';
  const slogan = settings?.slogan || 'نصنع الأبطال';

  return (
    <div className="min-h-screen bg-dark text-white selection:bg-primary selection:text-white">

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px]" />
          {/* <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-5" /> */} {/* Optional Texture - missing asset */}
        </div>

        <div className="container relative z-10 px-4 mx-auto text-center">

          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-reveal">
            <Star className="w-4 h-4 text-secondary" fill="currentColor" />
            <span className="text-sm font-semibold text-secondary tracking-wide">{academyName} - {slogan}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight animate-reveal" style={{ animationDelay: '0.1s' }}>
            من القلب إلى <br />
            <span className="text-gradient-gold">الملاعب العالمية</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed animate-reveal" style={{ animationDelay: '0.2s' }}>
            نحن لا نعلم كرة القدم فحسب، بل نصقل الشخصية ونبني القادة.
            انضم لأفضل أكاديمية تدريب ناشئين في المنطقة وابدأ رحلة الاحتراف.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-reveal" style={{ animationDelay: '0.3s' }}>
            <Link href="/register" className="btn-primary group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark">
              <span>سجل الآن مجاناً</span>
              <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <Link href="/talents" className="btn-secondary group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark">
              <span>اكتشف مواهبنا</span>
              <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto border-t border-white/10 pt-8 animate-reveal" style={{ animationDelay: '0.5s' }}>
            <div>
              <div className="text-3xl md:text-4xl font-black text-white mb-1">+150</div>
              <div className="text-sm text-gray-400">لاعب ناشئ</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-black text-secondary mb-1">+12</div>
              <div className="text-sm text-gray-400">مدرب محترف</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-black text-primary-light mb-1">24/7</div>
              <div className="text-sm text-gray-400">دعم وتدريب</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">لماذا نحن <span className="text-gradient-gold">الأفضل؟</span></h2>
            <p className="text-gray-400 max-w-xl mx-auto">نقدم بيئة تدريبية احترافية تنافس المعايير العالمية لتطوير قدرات اللاعبين</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-3xl text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                <Trophy className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-3">رؤية احترافية</h3>
              <p className="text-gray-400 leading-relaxed">
                نهدف للوصول بمواهبنا إلى منصات التتويج المحلية والدولية من خلال برامجنا المكثفة والمدروسة.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl text-center group border-secondary/20">
              <div className="w-16 h-16 mx-auto mb-6 bg-secondary/10 rounded-2xl flex items-center justify-center group-hover:bg-secondary transition-colors duration-300">
                <Shield className="w-8 h-8 text-secondary group-hover:text-dark transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-3">بيئة آمنة</h3>
              <p className="text-gray-400 leading-relaxed">
                نولي صحة وسلامة لاعبينا الأولوية القصوى من خلال ملاعب مجهزة وطاقم طبي متواجد على مدار الساعة.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                <TrendingUp className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-3">تطوير مستمر</h3>
              <p className="text-gray-400 leading-relaxed">
                تقارير دورية لأولياء الأمور عن تطور مستوى اللاعب فنياً وبدنياً وسلوكياً لضمان التقدم المستمر.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Talents Section */}
      <section className="py-24 bg-dark-soft/50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />

        <div className="container px-4 mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="text-right">
              <h2 className="text-4xl font-bold mb-2">مواهب <span className="text-gradient-gold">ذهبية</span></h2>
              <p className="text-gray-400">نخبة من لاعبي الأكاديمية المميزين الذين ينتظرهم مستقبل واعد</p>
            </div>
            <Link href="/talents" className="btn-secondary px-6 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark">
              عرض كل المواهب
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="aspect-[3/4] rounded-3xl bg-white/5 animate-pulse" />
              ))
            ) : (
              featuredPlayers.map(player => (
                <TalentCard key={player.id} player={player} />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

