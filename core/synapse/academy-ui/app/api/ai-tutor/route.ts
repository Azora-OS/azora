/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, module, professor } = body;

    // TODO: Replace with actual Elara AI integration
    // const response = await fetch('http://localhost:4000/api/ai-tutor', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ question, module, professor }),
    // });

    // Mock AI response
    const mockResponses: Record<string, string> = {
      'teach': `Welcome to ${module}! Let me explain this step by step:\n\n1. First, we'll cover the fundamentals\n2. Then we'll explore practical applications\n3. Finally, we'll work through examples\n\nThis approach ensures you understand both theory and practice.`,
      'default': `That's a great question about ${module}! Let me help you understand this concept. The key points are:\n\n1. Understanding the basics is crucial\n2. Practice makes perfect\n3. Don't hesitate to ask follow-up questions\n\nWould you like me to explain any specific aspect in more detail?`,
    };

    const responseType = question.toLowerCase().includes('teach') ? 'teach' : 'default';
    const answer = mockResponses[responseType] || mockResponses['default'];

    return NextResponse.json({
      answer,
      professor,
      module,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI tutor error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI tutor response', answer: 'I apologize, but I encountered an error. Please try again.' },
      { status: 200 }
    );
  }
}


