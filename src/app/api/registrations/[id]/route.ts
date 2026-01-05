import { NextRequest, NextResponse } from 'next/server';
import { RegistrationService } from '@/lib/mysqlService';
import { PlayerService } from '@/lib/mysqlService';
import { requireAuth } from '@/lib/auth';

// PUT update registration status
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
        const { status } = body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const registration = await RegistrationService.getById(id);

        if (!registration) {
            return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
        }

        await RegistrationService.updateStatus(id, status as 'pending' | 'approved' | 'rejected');

        if (status === 'approved') {
            await PlayerService.create({
                name: registration.childName,
                age: registration.age,
                position: 'غير محدد',
                bio: '',
                achievements: [],
                images: [],
                videos: [],
                isFeatured: false,
                isActive: true,
                joinDate: new Date(),
                subscription: {
                    type: 'شهري',
                    amount: 20,
                    status: 'unpaid',
                    notes: 'تم إنشاؤه من طلب التسجيل'
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: status === 'approved'
                ? 'تم قبول التسجيل وإنشاء اللاعب والاشتراك'
                : 'تم تحديث حالة التسجيل'
        });
    } catch (error) {
        console.error('Error updating registration:', error);
        return NextResponse.json({ error: 'Failed to update registration' }, { status: 500 });
    }
}

// DELETE registration
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Check authentication
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        const { id } = await params;

        const success = await RegistrationService.delete(id);

        if (!success) {
            return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting registration:', error);
        return NextResponse.json({ error: 'Failed to delete registration' }, { status: 500 });
    }
}
