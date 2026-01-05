import { NextRequest, NextResponse } from 'next/server';
import { PlayerService } from '@/lib/mysqlService';
import { requireAuth } from '@/lib/auth';

// GET single player
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const player = await PlayerService.getById(id);

        if (!player) {
            return NextResponse.json({ error: 'Player not found' }, { status: 404 });
        }

        return NextResponse.json({ player });
    } catch (error) {
        console.error('Error fetching player:', error);
        return NextResponse.json({ error: 'Failed to fetch player' }, { status: 500 });
    }
}

// PUT update player
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

        const success = await PlayerService.update(id, body);

        if (!success) {
            return NextResponse.json({ error: 'Player not found' }, { status: 404 });
        }

        const player = await PlayerService.getById(id);
        return NextResponse.json({ success: true, player });
    } catch (error: any) {
        console.error('Error updating player:', error);
        // Return more detailed error for debugging
        return NextResponse.json({
            error: 'Failed to update player',
            details: error?.message || String(error),
            code: error?.code
        }, { status: 500 });
    }
}

// DELETE player
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Check authentication
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        const { id } = await params;

        const success = await PlayerService.delete(id);

        if (!success) {
            return NextResponse.json({ error: 'Player not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting player:', error);
        return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 });
    }
}
