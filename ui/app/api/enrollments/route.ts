import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    try {
        const response = await fetch(`http://localhost:4200/api/enrollments/${userId}`);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching user enrollments:', error);
        return NextResponse.json({ error: 'Failed to fetch user enrollments' }, { status: 500 });
    }
}