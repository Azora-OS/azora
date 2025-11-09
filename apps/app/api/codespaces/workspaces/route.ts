import { NextResponse } from 'next/server';

const CODESPACES_API = process.env.CODESPACES_API_URL || 'http://localhost:4200';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization');
    const response = await fetch(`${CODESPACES_API}/api/workspaces`, {
      headers: { 'Authorization': token || '' }
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ workspaces: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization');
    const body = await request.json();
    const response = await fetch(`${CODESPACES_API}/api/workspaces`, {
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
    return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
  }
}
