import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/lib/mysqlService';
import { RegistrationService } from '@/lib/mysqlService';

// GET all registrations (admin only in practice)
export async function GET() {
    try {
        const registrations = await DataService.getRegistrations();
        return NextResponse.json({ registrations });
    } catch (error) {
        console.error('Error fetching registrations:', error);
        return NextResponse.json({ registrations: [], error: 'Failed to fetch registrations' }, { status: 500 });
    }
}

// POST new registration (public)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { childName, age, parentName, phone, email, message } = body;

        // Validate required fields
        if (!childName || !age || !parentName || !phone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Convert age to number if it's a string
        const ageNumber = typeof age === 'string' ? parseInt(age, 10) : age;

        if (isNaN(ageNumber) || ageNumber < 1 || ageNumber > 100) {
            return NextResponse.json({ error: 'Invalid age' }, { status: 400 });
        }

        const registrationId = await RegistrationService.create({
            childName,
            age: ageNumber,
            parentName,
            phone,
            email: email || '',
            message: message || '',
            status: 'pending',
            submittedAt: new Date()
        });

        return NextResponse.json({ success: true, registrationId });
    } catch (error) {
        console.error('Error creating registration:', error);
        return NextResponse.json({ error: 'Failed to create registration' }, { status: 500 });
    }
}
