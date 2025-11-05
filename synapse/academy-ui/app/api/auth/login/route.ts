/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate @ac.azora.world domain
    const allowedDomains = ['@ac.azora.world', '@azora.world', '@azora.es'];
    const isValidDomain = allowedDomains.some(domain =>
      email.toLowerCase().endsWith(domain.toLowerCase())
    );

    if (!isValidDomain) {
      return NextResponse.json(
        { error: 'Email must be from @ac.azora.world domain' },
        { status: 400 }
      );
    }

    // TODO: Call actual auth service
    // const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4000';
    // const response = await fetch(`${authServiceUrl}/api/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password }),
    // });

    // Mock successful login
    const mockUser = {
      id: `user-${Date.now()}`,
      email,
      name: email.split('@')[0],
      role: 'student',
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };

    const mockToken = `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      user: mockUser,
      token: mockToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}

