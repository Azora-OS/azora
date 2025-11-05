/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import { NextRequest, NextResponse } from 'next/server';
import { AzoraInstitutionalSystem } from '@/../../services/azora-institutional-system/institutional-system';
import { InstitutionType } from '@/../../services/azora-institutional-system/student-number-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      dateOfBirth,
      institutionType,
      program,
      grade,
      password,
      idNumber,
      country,
      phoneNumber,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth || !institutionType || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate institution type
    if (!Object.values(InstitutionType).includes(institutionType)) {
      return NextResponse.json(
        { error: 'Invalid institution type' },
        { status: 400 }
      );
    }

    // Validate date of birth
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date of birth' },
        { status: 400 }
      );
    }

    // Validate program/grade based on institution type
    if (institutionType === InstitutionType.UNIVERSITY && !program) {
      return NextResponse.json(
        { error: 'Program required for university enrollment' },
        { status: 400 }
      );
    }

    if (institutionType === InstitutionType.K12 && !grade) {
      return NextResponse.json(
        { error: 'Grade required for K-12 enrollment' },
        { status: 400 }
      );
    }

    if (institutionType === InstitutionType.K12 && (grade < 1 || grade > 12)) {
      return NextResponse.json(
        { error: 'Grade must be between 1 and 12' },
        { status: 400 }
      );
    }

    // Register student
    const profile = await AzoraInstitutionalSystem.registerStudent({
      firstName,
      lastName,
      dateOfBirth: dob,
      institutionType,
      program,
      grade,
      password,
      idNumber,
      country: country || 'South Africa',
      phoneNumber,
    });

    return NextResponse.json({
      success: true,
      studentNumber: profile.studentNumber,
      email: profile.email,
      message: `Welcome to ${institutionType === InstitutionType.UNIVERSITY ? 'Azora Sapiens University' : 'Azora K-12 Education'}! Your student number is ${profile.studentNumber} and your email is ${profile.email}. Please check your email to verify your account.`,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}

