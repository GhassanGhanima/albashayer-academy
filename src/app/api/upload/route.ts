import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import { requireAuth } from '@/lib/auth';

export const runtime = 'nodejs';

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(originalName);
    return `${timestamp}-${random}${ext}`;
}

// POST - Upload file (image or video)
export async function POST(request: NextRequest) {
    // Check authentication
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string || 'image'; // 'image' or 'video'

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File too large. Max size is 10MB' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = type === 'video' ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({
                error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
            }, { status: 400 });
        }

        // Create uploads directory if it doesn't exist (handles Windows paths)
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', type);

        // Ensure directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (mkdirError) {
            console.error('Directory creation error:', mkdirError);
            // Continue - directory might already exist
        }

        // Generate unique filename
        const filename = generateUniqueFilename(file.name);
        const filepath = path.join(uploadDir, filename);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Return the public URL (use forward slashes for web URLs)
        const publicUrl = `/uploads/${type}/${filename}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            filename,
            type: file.type,
            size: file.size
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({
            error: 'Failed to upload file',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// DELETE - Remove uploaded file
export async function DELETE(request: NextRequest) {
    // Check authentication
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        const { searchParams } = new URL(request.url);
        const filePath = searchParams.get('path');

        if (!filePath) {
            return NextResponse.json({ error: 'No file path provided' }, { status: 400 });
        }

        // Security: Only allow files from uploads directory
        if (!filePath.startsWith('/uploads/')) {
            return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
        }

        const fullPath = path.join(process.cwd(), 'public', filePath);

        // Check if file exists
        if (!existsSync(fullPath)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Delete file
        const { unlink } = await import('fs/promises');
        await unlink(fullPath);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }
}
