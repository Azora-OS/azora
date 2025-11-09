import { NextResponse } from 'next/server';

const STUDYSPACES_API = process.env.STUDYSPACES_API_URL || 'http://localhost:4300';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization');
    const response = await fetch(`${STUDYSPACES_API}/rooms`, {
      headers: { 'Authorization': token || '' }
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ rooms: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization');
    const body = await request.json();
    const response = await fetch(`${STUDYSPACES_API}/rooms`, {
      method: 'POST',
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
