'use client';

import { Facebook } from 'lucide-react';

interface FacebookShareProps {
    playerName: string;
    playerId: string;
    customText?: string;
}

export default function FacebookShare({ playerName, playerId, customText }: FacebookShareProps) {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${baseUrl}/talents/${playerId}`;
    const defaultText = `فخورون بموهبة ${playerName} من أكاديمية البشائر لكرة القدم! ⚽🌟`;
    const shareText = customText?.replace('{playerName}', playerName) || defaultText;

    const handleShare = () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#1877F2]/20"
            aria-label="شارك على فيسبوك"
        >
            <Facebook className="w-4 h-4" />
            <span>فيسبوك</span>
        </button>
    );
}
