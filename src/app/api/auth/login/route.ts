import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/mysqlService';
import { generateToken, comparePassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Verify JWT_SECRET is configured
           console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
        console.log('All env keys:', Object.keys(process.env).filter(k => k.includes('JWT') || k.includes('MYSQL')));
        
        if (!process.env.JWT_SECRET) {
            return NextResponse.json(
                { error: 'Server configuration error 2 ' },
                { status: 500 }  
            );
        }

        const body = await request.json();
        const { username, password } = body;

        // Get admin credentials from unified data service
        const settings = await DataService.getSettings();

        if (!settings) {
            // Fallback to hardcoded credentials if no settings found
            // NOTE: In production, this should never happen
            if (username !== 'admin' || password !== 'admin123') {
                return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
            }
        } else {
            // Check against database credentials
            // Support both old format (adminCredentials object) and new format (admin_username/admin_password)
            let adminUsername: string, adminPassword: string;

            if (settings.adminCredentials) {
                adminUsername = settings.adminCredentials.username;
                adminPassword = settings.adminCredentials.password;
            } else if (settings.admin_username && settings.admin_password) {
                adminUsername = settings.admin_username;
                adminPassword = settings.admin_password;
            } else {
                return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
            }

            if (username !== adminUsername) {
                return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
            }

            // Check if password is hashed (starts with $2a$ or $2b$)
            const isHashed = adminPassword.startsWith('$2a$') || adminPassword.startsWith('$2b$');

            if (isHashed) {
                // Use bcrypt comparison for hashed passwords
                const passwordMatch = await comparePassword(password, adminPassword);
                if (!passwordMatch) {
                    return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
                }
            } else {
                // Direct comparison for plaintext passwords (for backward compatibility)
                // This will be phased out after first login
                if (password !== adminPassword) {
                    return NextResponse.json({ error: 'بيانات الدخول غير صحيحة' }, { status: 401 });
                }
            }
        }

        // Generate JWT token
        const token = generateToken(username, 'admin');

        const response = NextResponse.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            token
        });

        // Set cookie
        response.cookies.set('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'حدث خطأ أثناء تسجيل الدخول' }, { status: 500 });
    }
}
