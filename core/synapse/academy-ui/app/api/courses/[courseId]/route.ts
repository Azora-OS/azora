/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import { NextRequest, NextResponse } from 'next/server';

const mockCourseDetails: Record<string, any> = {
  'african-ai-fundamentals': {
    id: 'african-ai-fundamentals',
    title: 'African AI Fundamentals',
    description: 'Learn AI concepts with African context and real-world applications. This comprehensive course covers machine learning, neural networks, and AI ethics from an African perspective.',
    instructor: 'Dr. Nomsa Mthembu',
    duration: '8 weeks',
    level: 'beginner',
    enrolled: 1250,
    rating: 4.8,
    progress: 0,
    azrReward: 500,
    modules: [
      {
        id: 'intro-ai',
        title: 'Introduction to AI',
        type: 'video',
        duration: '15 min',
        completed: false,
        videoUrl: '/videos/intro-ai.mp4',
      },
      {
        id: 'ml-basics',
        title: 'Machine Learning Basics',
        type: 'interactive',
        duration: '30 min',
        completed: false,
        lessonData: {
          courseId: 'african-ai-fundamentals',
          lessonId: 'ml-basics',
          lessonTitle: 'Machine Learning Basics',
          professor: 'Dr. Nomsa Mthembu',
          quiz: [
            { q: 'What is machine learning?', a: 'A method of data analysis that automates analytical model building' },
            { q: 'What are the three types of ML?', a: 'Supervised, unsupervised, and reinforcement learning' },
          ],
        },
      },
      {
        id: 'neural-networks',
        title: 'Neural Networks in African Context',
        type: 'interactive',
        duration: '45 min',
        completed: false,
        lessonData: {
          courseId: 'african-ai-fundamentals',
          lessonId: 'neural-networks',
          lessonTitle: 'Neural Networks in African Context',
          professor: 'Dr. Nomsa Mthembu',
          quiz: [
            { q: 'What is a neural network?', a: 'A computing system inspired by biological neural networks' },
          ],
        },
      },
    ],
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;

    // TODO: Replace with actual API call to LMS service
    // const response = await fetch(`http://localhost:4000/api/courses/${courseId}`);
    // const data = await response.json();

    const course = mockCourseDetails[courseId] || mockCourseDetails['african-ai-fundamentals'];

    return NextResponse.json({
      course,
      status: 'success',
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}


