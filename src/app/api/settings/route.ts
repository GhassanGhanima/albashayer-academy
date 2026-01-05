import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/mysqlService';
import { SettingService } from '@/lib/mysqlService';
import { requireAuth } from '@/lib/auth';

export async function GET() {
    try {
        const settings = await DataService.getSettings();

        // Remove admin credentials from response for security
        if (settings) {
            const { admin_username, admin_password, adminCredentials, ...safeSettings } = settings as any;
            return NextResponse.json({ settings: safeSettings });
        }

        return NextResponse.json({ settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ settings: null, error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    // Check authentication
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        const body = await request.json();

        const settings = await SettingService.upsert(body);

        // Remove admin credentials from response for security
        if (settings) {
            const { admin_username, admin_password, adminCredentials, ...safeSettings } = settings as any;
            return NextResponse.json({ success: true, settings: safeSettings });
        }

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
