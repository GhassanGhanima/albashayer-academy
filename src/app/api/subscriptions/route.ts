import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/mysqlService';
import { PlayerService } from '@/lib/mysqlService';
import { SubscriptionService } from '@/lib/mysqlService';
import { requireAuth } from '@/lib/auth';
import { execute } from '@/lib/mysql';

// GET all subscriptions with player info (admin only)
export async function GET(request: NextRequest) {
    // Check authentication
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        const subscriptions = await SubscriptionService.getAll();
        return NextResponse.json({ subscriptions });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return NextResponse.json({ subscriptions: [], error: 'Failed to fetch subscriptions' }, { status: 500 });
    }
}

// PUT update subscription or record monthly payment
export async function PUT(request: NextRequest) {
    // Check authentication
    const authError = requireAuth(request);
    if (authError) return authError;

    try {
        const body = await request.json();
        const { id, month, type, amount, status, last_payment, notes } = body;

        // If month is provided, record payment for that specific month
        if (month) {
            // Record payment for specific month
            const success = await SubscriptionService.recordPayment(id, month, {
                amount: amount || 20,
                status: status || 'unpaid',
                paymentDate: last_payment || null,
                notes: notes || ''
            });

            if (!success) {
                return NextResponse.json({ error: 'Player not found' }, { status: 404 });
            }

            return NextResponse.json({ success: true });
        }

        // Otherwise, update basic subscription details
        const success = await PlayerService.updateSubscription(id, {
            type,
            amount,
            status,
            lastPayment: last_payment,
            notes
        });

        if (!success) {
            return NextResponse.json({ error: 'Player not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating subscription:', error);
        return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }
}
