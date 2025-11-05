/**
 * HEALTH CHECK ENDPOINT
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const startTime = Date.now();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      api: true,
      database: await checkDatabase(),
      cache: await checkCache(),
      pricing: await checkPricing(),
      external: await checkExternalAPIs()
    }
  };
  
  const responseTime = Date.now() - startTime;
  health.checks['responseTime'] = responseTime;
  
  const allHealthy = Object.values(health.checks).every(v => v === true || typeof v === 'number');
  health.status = allHealthy ? 'healthy' : 'degraded';
  
  return NextResponse.json(health, {
    status: allHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}

async function checkDatabase(): Promise<boolean> {
  try {
    // TODO: Add actual database ping
    return true;
  } catch {
    return false;
  }
}

async function checkCache(): Promise<boolean> {
  try {
    // TODO: Add actual Redis ping
    return true;
  } catch {
    return false;
  }
}

async function checkPricing(): Promise<boolean> {
  try {
    // Quick test of pricing engine
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      signal: AbortSignal.timeout(3000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function checkExternalAPIs(): Promise<boolean> {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(3000)
    });
    return response.ok;
  } catch {
    return false;
  }
}
