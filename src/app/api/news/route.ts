import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/mysqlService';
import { NewsService } from '@/lib/mysqlService';
import { requireAuth } from '@/lib/auth';

// GET all news (public - only published by default)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const all = searchParams.get('all') === 'true';

        const news = await DataService.getNews(!all);

        return NextResponse.json({ news });
    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json({ news: [], error: 'Failed to fetch news' }, { status: 500 });
    }
}

// POST new news item (admin only)
export async function POST(request: NextRequest) {
    // Check authentication
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        const body = await request.json();
        const { title, content, image, images, videos, isPublished } = body;

        if (!title || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newsId = await NewsService.create({
            title,
            content,
            image: image || '',
            images: images || [],
            videos: videos || [],
            isPublished: isPublished !== false,
            date: new Date()
        });

        return NextResponse.json({ success: true, newsId });
    } catch (error: any) {
        console.error('Error creating news:', error);
        return NextResponse.json({
            error: 'Failed to create news',
            details: error?.message || String(error)
        }, { status: 500 });
    }
}
