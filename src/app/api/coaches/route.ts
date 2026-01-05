import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/mysqlService';
import { CoachService } from '@/lib/mysqlService';
import { requireAuth } from '@/lib/auth';

// GET all coaches (public)
export async function GET() {
    try {
        const coaches = await DataService.getCoaches();
        return NextResponse.json({ coaches });
    } catch (error) {
        console.error('Error fetching coaches:', error);
        return NextResponse.json({ coaches: [], error: 'Failed to fetch coaches' }, { status: 500 });
    }
}

// POST new coach (admin only)
export async function POST(request: NextRequest) {
    // Check authentication
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        const body = await request.json();
        const { name, title, bio, image, experience, certifications, isHeadCoach, order_index } = body;

        // Validate required fields
        if (!name || !title) {
            return NextResponse.json({ error: 'Missing required fields (name, title)' }, { status: 400 });
        }

        const coachId = await CoachService.create({
            name,
            title,
            bio: bio || '',
            image: image || '',
            experience: experience || '',
            certifications: certifications || [],
            isHeadCoach: isHeadCoach || false,
            order_index: order_index || 0
        });

        return NextResponse.json({ success: true, coachId });
    } catch (error) {
        console.error('Error creating coach:', error);
        return NextResponse.json({ error: 'Failed to create coach' }, { status: 500 });
    }
}

// PUT reorder coaches
export async function PUT(request: NextRequest) {
    // Check authentication
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        const body = await request.json();
        const { coachIds } = body;

        if (!Array.isArray(coachIds)) {
            return NextResponse.json({ error: 'Invalid coachIds array' }, { status: 400 });
        }

        const success = await CoachService.reorder(coachIds);

        return NextResponse.json({ success });
    } catch (error) {
        console.error('Error reordering coaches:', error);
        return NextResponse.json({ error: 'Failed to reorder coaches' }, { status: 500 });
    }
}
