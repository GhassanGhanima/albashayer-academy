import { NextRequest, NextResponse } from 'next/server';
import { CoachService } from '@/lib/mysqlService';
import { requireAuth } from '@/lib/auth';

// GET single coach
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const coach = await CoachService.getById(id);

        if (!coach) {
            return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
        }

        return NextResponse.json({ coach });
    } catch (error) {
        console.error('Error fetching coach:', error);
        return NextResponse.json({ error: 'Failed to fetch coach' }, { status: 500 });
    }
}

// PUT update coach
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Check authentication
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        const { id } = await params;
        const body = await request.json();

        const success = await CoachService.update(id, body);

        if (!success) {
            return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
        }

        const coach = await CoachService.getById(id);
        return NextResponse.json({ success: true, coach });
    } catch (error) {
        console.error('Error updating coach:', error);
        return NextResponse.json({ error: 'Failed to update coach' }, { status: 500 });
    }
}

// DELETE coach
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Check authentication
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        const { id } = await params;

        const success = await CoachService.delete(id);

        if (!success) {
            return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting coach:', error);
        return NextResponse.json({ error: 'Failed to delete coach' }, { status: 500 });
    }
}
