import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const response = await fetch('http://localhost:4200/api/enroll', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error enrolling in course:', error);
        return NextResponse.json({ error: 'Failed to enroll in course' }, { status: 500 });
    }
}