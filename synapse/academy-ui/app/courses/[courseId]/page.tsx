/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Play,
  CheckCircle2,
  ArrowLeft,
  Trophy,
  Video,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ServiceHeader } from '@/components/branding/ServiceHeader';
import VideoLecture from '@/components/VideoLecture';
import InteractiveLesson from '@/components/InteractiveLesson';
import AIProfessor from '@/components/AIProfessor';
import AdaptiveQuiz from '@/components/AdaptiveQuiz';
import Link from 'next/link';

interface Module {
  id: string;
  title: string;
  type: 'video' | 'interactive' | 'quiz';
  duration: string;
  completed: boolean;
  videoUrl?: string;
  lessonData?: {
    courseId: string;
    lessonId: string;
    lessonTitle: string;
    professor: string;
    quiz: { q: string; a: string }[];
  };
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: string;
  enrolled: number;
  rating: number;
  modules: Module[];
  progress: number;
  azrReward: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (response.ok) {
          const data = await response.json();
          setCourse(data.course);
        } else {
          // Fallback mock data
          setCourse(getMockCourse(courseId));
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        setCourse(getMockCourse(courseId));
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const getMockCourse = (id: string): Course => {
    const courses: Record<string, Course> = {
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
              courseId: id,
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
              courseId: id,
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

    return courses[id] || courses['african-ai-fundamentals'];
  };

  const handleEnroll = async () => {
    try {
      const response = await fetch('/api/enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      if (response.ok) {
        router.push(`/courses/${courseId}/learn`);
      } else {
        alert('Enrollment failed. Please try again.');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      // For demo, just navigate
      router.push(`/courses/${courseId}/learn`);
    }
  };

  const renderModuleContent = (module: Module) => {
    switch (module.type) {
      case 'video':
        return module.videoUrl ? (
          <VideoLecture src={module.videoUrl} title={module.title} />
        ) : null;

      case 'interactive':
        return module.lessonData ? (
          <div className="space-y-6">
            <InteractiveLesson
              courseId={module.lessonData.courseId}
              lessonId={module.lessonData.lessonId}
              lessonTitle={module.lessonData.lessonTitle}
              professor={module.lessonData.professor}
              quiz={module.lessonData.quiz}
            />
            <AIProfessor
              module={module.title}
              professor={module.lessonData.professor}
            />
            {module.lessonData.quiz.length > 0 && (
              <AdaptiveQuiz questions={module.lessonData.quiz} />
            )}
          </div>
        ) : null;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-950 dark:via-violet-950 dark:to-indigo-950">
        <ServiceHeader servicePath="synapse/academy-ui" />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-950 dark:via-violet-950 dark:to-indigo-950">
        <ServiceHeader servicePath="synapse/academy-ui" />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Course not found.</p>
          <Link href="/courses">
            <Button className="mt-4">Back to Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-950 dark:via-violet-950 dark:to-indigo-950">
      <ServiceHeader servicePath="synapse/academy-ui" />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/courses">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </Link>

        {/* Course Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white">
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge className="bg-white/20 text-white border-white/30 mb-2">
                    {course.level}
                  </Badge>
                  <CardTitle className="text-3xl mb-2">{course.title}</CardTitle>
                  <CardDescription className="text-purple-100">
                    {course.description}
                  </CardDescription>
                </div>
                <Badge className="bg-white/20 text-white border-white/30">
                  <Trophy className="w-3 h-3 mr-1" />
                  {course.azrReward} AZR
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div>
                  <div className="flex items-center text-purple-100 mb-1">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-sm">Enrolled</span>
                  </div>
                  <p className="text-2xl font-bold">{course.enrolled.toLocaleString()}</p>
                </div>
                <div>
                  <div className="flex items-center text-purple-100 mb-1">
                    <Star className="w-4 h-4 mr-2 fill-white" />
                    <span className="text-sm">Rating</span>
                  </div>
                  <p className="text-2xl font-bold">{course.rating}</p>
                </div>
                <div>
                  <div className="flex items-center text-purple-100 mb-1">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <p className="text-2xl font-bold">{course.duration}</p>
                </div>
                <div>
                  <div className="flex items-center text-purple-100 mb-1">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span className="text-sm">Modules</span>
                  </div>
                  <p className="text-2xl font-bold">{course.modules.length}</p>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleEnroll}
                  className="bg-white text-purple-600 hover:bg-purple-50"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Enroll & Start Learning
                </Button>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Course Modules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Course Modules</CardTitle>
              <CardDescription>
                Complete all modules to earn {course.azrReward} AZR tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {course.modules.map((module, index) => (
                  <div
                    key={module.id}
                    className="border rounded-lg p-4 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center font-bold text-purple-700 dark:text-purple-300">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{module.title}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            {module.type === 'video' && <Video className="w-4 h-4" />}
                            {module.type === 'interactive' && <FileText className="w-4 h-4" />}
                            <span>{module.duration}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {module.completed && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                        >
                          {activeModule === module.id ? 'Hide' : 'View'} Content
                        </Button>
                      </div>
                    </div>

                    {activeModule === module.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t"
                      >
                        {renderModuleContent(module)}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}


