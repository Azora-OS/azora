import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch('http://localhost:4200/api/courses');
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }
}