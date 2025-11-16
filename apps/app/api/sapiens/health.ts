import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        embeddings: 'operational',
        vectorStorage: 'operational',
        searchEngine: 'operational',
        elara: 'operational',
        themba: 'operational',
        naledi: 'operational',
        kofi: 'operational',
      },
      version: '2.0.0',
      uptime: process.uptime(),
    };

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
