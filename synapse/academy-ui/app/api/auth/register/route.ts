/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

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

    // Validate password strength
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // TODO: Call actual auth service
    // const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4000';
    // const response = await fetch(`${authServiceUrl}/api/auth/register`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password, name, role: role || 'student' }),
    // });

    // Mock successful registration
    const mockUser = {
      id: `user-${Date.now()}`,
      email,
      name: name || email.split('@')[0],
      role: role || 'student',
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };

    const mockToken = `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      user: mockUser,
      token: mockToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}

