import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/mysqlService';
import { PlayerService } from '@/lib/mysqlService';
import { requireAuth } from '@/lib/auth';

// GET all players (public)
export async function GET() {
    try {
        const players = await DataService.getPlayers();
        return NextResponse.json({ players });
    } catch (error) {
        console.error('Error fetching players:', error);
        return NextResponse.json({ players: [], error: 'Failed to fetch players' }, { status: 500 });
    }
}

// POST new player (admin only)
export async function POST(request: NextRequest) {
    // Check authentication
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        const body = await request.json();
        const { name, age, position, bio, achievements, images, videos, isFeatured, joinDate, subscription } = body;

        // Validate required fields
        if (!name || !age || !position) {
            return NextResponse.json({ error: 'Missing required fields (name, age, position)' }, { status: 400 });
        }

        // Convert age to number if it's a string
        const ageNumber = typeof age === 'string' ? parseInt(age, 10) : age;

        if (isNaN(ageNumber) || ageNumber < 1 || ageNumber > 100) {
            return NextResponse.json({ error: 'Invalid age' }, { status: 400 });
        }

        const playerId = await PlayerService.create({
            name,
            age: ageNumber,
            position,
            bio: bio || '',
            achievements: achievements || [],
            images: images || [],
            videos: videos || [],
            isFeatured: isFeatured || false,
            isActive: true,
            joinDate: joinDate || new Date(),
            subscription: subscription || undefined
        });

        return NextResponse.json({ success: true, playerId });
    } catch (error) {
        console.error('Error creating player:', error);
        return NextResponse.json({ error: 'Failed to create player' }, { status: 500 });
    }
}
