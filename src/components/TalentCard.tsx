import Link from 'next/link';
import FacebookShare from './FacebookShare';
import { User, Star, ArrowRight } from 'lucide-react';

interface Player {
    id: number;
    name: string;
    age: number;
    position: string;
    images?: string[];
    isFeatured?: boolean;
}

interface TalentCardProps {
    player: Player;
    showShare?: boolean;
}


export default function TalentCard({ player, showShare = true }: TalentCardProps) {
    const hasImage = player.images && player.images.length > 0;

    return (
        <div className="group relative rounded-3xl overflow-hidden bg-white/5 border border-white/5 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary/30">
            {/* Featured Badge */}
            {player.isFeatured && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/90 text-dark text-xs font-bold backdrop-blur-md shadow-lg animate-fadeIn w-fit">
                    <Star className="w-3 h-3 fill-current" />
                    <span>موهبة مميزة</span>
                </div>
            )}

            {/* Image Section */}
            <div className="relative aspect-[3/4] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/20 to-transparent z-10 opacity-80 group-hover:opacity-60 transition-opacity duration-500" />

                {hasImage ? (
                    <img
                        src={player.images![0]}
                        alt={player.name}
                        width="300"
                        height="400"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-dark-soft flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-500">
                        <User className="w-20 h-20 text-white/20 group-hover:text-primary transition-colors duration-500" />
                    </div>
                )}
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 rounded-full bg-primary/80 text-white text-xs font-bold border border-white/10 backdrop-blur-sm">
                            {player.position}
                        </span>
                        <span className="text-gray-300 text-sm">{player.age} سنة</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-secondary transition-colors duration-300">
                        {player.name}
                    </h3>
                </div>

                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 transform translate-y-4 group-hover:translate-y-0">
                    <Link
                        href={`/talents/${player.id}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-white text-dark py-2.5 rounded-xl font-bold hover:bg-secondary transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
                    >
                        <span>التفاصيل</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>

                    {showShare && (
                        <div className="bg-white/10 p-2.5 rounded-xl hover:bg-white/20 transition-colors cursor-pointer backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark" role="button" tabIndex={0} aria-label="مشاركة على فيسبوك">
                            <FacebookShare
                                playerName={player.name}
                                playerId={String(player.id)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

