/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Users, Star, Search, Filter, Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ServiceHeader } from '@/components/branding/ServiceHeader';
import Image from 'next/image';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  enrolled: number;
  rating: number;
  thumbnail: string;
  modules: number;
  azrReward: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  useEffect(() => {
    // Fetch courses from API
    async function fetchCourses() {
      try {
        const response = await fetch('/api/courses');
        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses || []);
        } else {
          // Fallback mock data
          setCourses(getMockCourses());
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses(getMockCourses());
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  const getMockCourses = (): Course[] => [
    {
      id: 'african-ai-fundamentals',
      title: 'African AI Fundamentals',
      description: 'Learn AI concepts with African context and applications',
      instructor: 'Dr. Nomsa Mthembu',
      duration: '8 weeks',
      level: 'beginner',
      enrolled: 1250,
      rating: 4.8,
      thumbnail: '/api/placeholder/400/240',
      modules: 12,
      azrReward: 500,
    },
    {
      id: 'blockchain-african-markets',
      title: 'Blockchain for African Markets',
      description: 'Understanding blockchain technology in African economic context',
      instructor: 'Kofi Asante',
      duration: '10 weeks',
      level: 'intermediate',
      enrolled: 890,
      rating: 4.9,
      thumbnail: '/api/placeholder/400/240',
      modules: 15,
      azrReward: 750,
    },
    {
      id: 'cloud-architecture',
      title: 'Cloud Architecture Excellence',
      description: 'Enterprise-grade cloud solutions and architecture',
      instructor: 'Sarah Johnson',
      duration: '12 weeks',
      level: 'advanced',
      enrolled: 650,
      rating: 4.7,
      thumbnail: '/api/placeholder/400/240',
      modules: 18,
      azrReward: 1000,
    },
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-950 dark:via-violet-950 dark:to-indigo-950">
      <ServiceHeader servicePath="synapse/academy-ui" />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="relative h-24 w-72">
              <Image
                src="/branding/services/azora-education-logo.svg"
                alt="Azora Academy"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Course Catalog
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover courses designed for African intelligence and global excellence
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
                    <Button
                      key={level}
                      variant={filterLevel === level ? 'default' : 'outline'}
                      onClick={() => setFilterLevel(level)}
                      className="capitalize"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading courses...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover-lift hover-glow transition-all">
                  <div className="relative h-48 w-full bg-gradient-to-br from-purple-500 to-violet-600">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-white/50" />
                    </div>
                    <Badge className="absolute top-4 right-4 bg-white/90 text-purple-700">
                      {course.azrReward} AZR
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{course.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-2" />
                        {course.enrolled.toLocaleString()} enrolled
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2" />
                        {course.duration} • {course.modules} modules
                      </div>
                      <div className="text-sm text-muted-foreground">
                        by {course.instructor}
                      </div>
                    </div>
                    <Link href={`/courses/${course.id}`} className="block">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                        <Play className="w-4 h-4 mr-2" />
                        Enroll Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No courses found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}


