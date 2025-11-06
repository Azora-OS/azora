import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const response = await fetch(`http://localhost:4200/api/users/${params.userId}/rewards`);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching user rewards:', error);
        return NextResponse.json({ error: 'Failed to fetch user rewards' }, { status: 500 });
    }
}