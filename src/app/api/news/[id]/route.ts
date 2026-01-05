import { NextRequest, NextResponse } from 'next/server';
import { NewsService } from '@/lib/mysqlService';
import { requireAuth } from '@/lib/auth';

// GET single news item
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const news = await NewsService.getById(id);

        if (!news) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 });
        }

        return NextResponse.json({ news });
    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}

// PUT update news
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

        const success = await NewsService.update(id, body);

        if (!success) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 });
        }

        const news = await NewsService.getById(id);
        return NextResponse.json({ success: true, news });
    } catch (error) {
        console.error('Error updating news:', error);
        return NextResponse.json({ error: 'Failed to update news' }, { status: 500 });
    }
}

// DELETE news
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Check authentication
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        const { id } = await params;

        const success = await NewsService.delete(id);

        if (!success) {
            return NextResponse.json({ error: 'News not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting news:', error);
        return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 });
    }
}
