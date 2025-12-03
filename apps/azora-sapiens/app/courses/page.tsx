'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { UbuntuServices, useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

interface Course {
  id: string;
  title: string;
  category: string;
  subject: string;
  level: string;
  description: string;
  duration: string;
  modules: number;
  tools: string[];
  externalSources: string[];
  ubuntuFocus: string;
  progress?: number;
  enrolled?: boolean;
}

interface ToolConfiguration {
  primaryTools: string[];
  secondaryTools: string[];
  personalizedTools: string[];
  collaborativeFeatures: string[];
  accessibilityTools: string[];
  contentSources: string[];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const ubuntuServices = useUbuntuServices();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      // Use Ubuntu education service or fallback to curated course data
      const response = await ubuntuServices.education.getCourses();
      
      if (response.courses && response.courses.length > 0) {
        setCourses(response.courses);
      } else {
        // Fallback to our curated course database
        setCourses(getCuratedCourseData());
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      // Fallback to curated data
      setCourses(getCuratedCourseData());
    } finally {
      setLoading(false);
    }
  };

  const getCuratedCourseData = (): Course[] => {
    return [
      // STEM Courses
      {
        id: 'math-101',
        title: 'Ubuntu Mathematics: Numbers in Community',
        category: 'STEM',
        subject: 'Mathematics',
        level: 'Beginner',
        description: 'Learn mathematics through Ubuntu community examples and real-world problem-solving',
        duration: '8 weeks',
        modules: 12,
        tools: ['visualizer', 'simulator', 'chalkboard', 'noteTaker'],
        externalSources: ['Khan Academy', 'Wolfram Alpha', 'GeoGebra'],
        ubuntuFocus: 'Mathematics as community problem-solving',
        progress: 0,
        enrolled: false
      },
      {
        id: 'physics-101',
        title: 'Ubuntu Physics: Energy in Community',
        category: 'STEM',
        subject: 'Physics',
        level: 'Beginner',
        description: 'Physics principles through community energy systems and sustainability',
        duration: '10 weeks',
        modules: 14,
        tools: ['visualizer', 'simulator', 'experimentLab', 'chalkboard'],
        externalSources: ['PhET Simulations', 'Feynman Lectures', 'Khan Academy'],
        ubuntuFocus: 'Physics for sustainable communities',
        progress: 0,
        enrolled: false
      },
      {
        id: 'bio-101',
        title: 'Community Biology: Ecosystems as Ubuntu',
        category: 'STEM',
        subject: 'Biology',
        level: 'Beginner',
        description: 'Understanding ecosystems through Ubuntu philosophy and interconnectedness',
        duration: '10 weeks',
        modules: 14,
        tools: ['visualizer', 'simulator', 'microscope', 'noteTaker'],
        externalSources: ['HHMI BioInteractive', 'Khan Academy', 'Crash Course'],
        ubuntuFocus: 'Biology as interconnected community',
        progress: 0,
        enrolled: false
      },
      {
        id: 'chem-101',
        title: 'Ubuntu Chemistry: Reactions in Community',
        category: 'STEM',
        subject: 'Chemistry',
        level: 'Beginner',
        description: 'Chemistry through community applications and sustainable practices',
        duration: '10 weeks',
        modules: 14,
        tools: ['simulator', 'visualizer', 'labTools', 'chalkboard'],
        externalSources: ['PhET Chemistry', 'Khan Academy', 'ChemCollective'],
        ubuntuFocus: 'Chemistry for community wellbeing',
        progress: 0,
        enrolled: false
      },
      {
        id: 'cs-101',
        title: 'Ubuntu Programming: Code for Community',
        category: 'STEM',
        subject: 'Computer Science',
        level: 'Beginner',
        description: 'Learn programming through community-building projects and social impact',
        duration: '12 weeks',
        modules: 16,
        tools: ['ide', 'simulator', 'chalkboard', 'collaborativeCoding'],
        externalSources: ['FreeCodeCamp', 'Codecademy', 'MIT CS6.00'],
        ubuntuFocus: 'Programming as community service',
        progress: 0,
        enrolled: false
      },
      {
        id: 'cs-201',
        title: 'Data Science for Collective Intelligence',
        category: 'STEM',
        subject: 'Data Science',
        level: 'Intermediate',
        description: 'Data analysis for community improvement and collective decision-making',
        duration: '14 weeks',
        modules: 18,
        tools: ['ide', 'visualizer', 'dataLab', 'noteTaker'],
        externalSources: ['Kaggle Learn', 'DataCamp', 'Fast.ai'],
        ubuntuFocus: 'Data science for community insights',
        progress: 0,
        enrolled: false
      },
      
      // Arts & Humanities Courses
      {
        id: 'art-101',
        title: 'Ubuntu Visual Arts: Community Expression',
        category: 'Arts',
        subject: 'Visual Arts',
        level: 'Beginner',
        description: 'Art as community expression and cultural preservation through digital media',
        duration: '8 weeks',
        modules: 10,
        tools: ['digitalCanvas', 'projector', 'gallery', 'noteTaker'],
        externalSources: ['Google Arts & Culture', 'MoMA Learning', 'Khan Academy Arts'],
        ubuntuFocus: 'Art as community storytelling',
        progress: 0,
        enrolled: false
      },
      {
        id: 'music-101',
        title: 'Ubuntu Music: Harmony in Community',
        category: 'Arts',
        subject: 'Music',
        level: 'Beginner',
        description: 'Music theory and practice through community traditions and collaborative creation',
        duration: '10 weeks',
        modules: 12,
        tools: ['audioStudio', 'projector', 'collaborativeJam', 'noteTaker'],
        externalSources: ['YouTube Music Education', 'Soundtrap', 'MusicTheory.net'],
        ubuntuFocus: 'Music as community unity',
        progress: 0,
        enrolled: false
      },
      
      // Humanities Courses
      {
        id: 'phil-101',
        title: 'Ubuntu Philosophy: "I am because we are"',
        category: 'Humanities',
        subject: 'Philosophy',
        level: 'Beginner',
        description: 'Deep dive into Ubuntu philosophy and modern applications in daily life',
        duration: '6 weeks',
        modules: 8,
        tools: ['chalkboard', 'discussionBoard', 'noteTaker', 'aiTutor'],
        externalSources: ['Stanford Encyclopedia', 'YouTube Philosophy', 'Academic Papers'],
        ubuntuFocus: 'Core Ubuntu principles and modern relevance',
        progress: 0,
        enrolled: false
      },
      {
        id: 'lit-101',
        title: 'Community Literature: Stories That Bind Us',
        category: 'Humanities',
        subject: 'Literature',
        level: 'Beginner',
        description: 'Literature as community identity and shared experience across cultures',
        duration: '8 weeks',
        modules: 10,
        tools: ['textAnalyzer', 'discussionBoard', 'noteTaker', 'projector'],
        externalSources: ['Project Gutenberg', 'Poetry Foundation', 'Google Books'],
        ubuntuFocus: 'Literature as community memory',
        progress: 0,
        enrolled: false
      },
      {
        id: 'hist-101',
        title: 'Ubuntu History: Community Through Time',
        category: 'Humanities',
        subject: 'History',
        level: 'Beginner',
        description: 'History through the lens of community and collective action',
        duration: '10 weeks',
        modules: 12,
        tools: ['timeline', 'projector', 'discussionBoard', 'noteTaker'],
        externalSources: ['Khan Academy History', 'Crash Course', 'Historical Archives'],
        ubuntuFocus: 'History as community narrative',
        progress: 0,
        enrolled: false
      },
      
      // Language Courses
      {
        id: 'lang-101',
        title: 'Ubuntu Language: Communication as Connection',
        category: 'Languages',
        subject: 'Communication',
        level: 'Beginner',
        description: 'Language learning through community and cultural exchange',
        duration: '12 weeks',
        modules: 16,
        tools: ['conversationPartner', 'pronunciationCoach', 'culturalContext', 'noteTaker'],
        externalSources: ['Duolingo', 'BBC Languages', 'OpenCulture', 'YouTube Language'],
        ubuntuFocus: 'Language as community bridge',
        progress: 0,
        enrolled: false
      },
      
      // Business Courses
      {
        id: 'biz-101',
        title: 'Ubuntu Business: Prosperity Through Community',
        category: 'Business',
        subject: 'Business',
        level: 'Beginner',
        description: 'Business principles that benefit community and create shared prosperity',
        duration: '10 weeks',
        modules: 14,
        tools: ['simulator', 'whiteboard', 'caseStudies', 'noteTaker'],
        externalSources: ['Khan Academy Business', 'Harvard Business Review', 'TED Business'],
        ubuntuFocus: 'Business as community service',
        progress: 0,
        enrolled: false
      }
    ];
  };

  const handleEnroll = async (courseId: string) => {
    try {
      await ubuntuServices.education.enrollCourse(courseId, 'demo-student-001');
      
      // Update local state
      setCourses(prev => prev.map(course => 
        course.id === courseId 
          ? { ...course, enrolled: true, progress: 0 }
          : course
      ));
      
      // Show success message
      alert('Successfully enrolled in Ubuntu course!');
    } catch (error) {
      console.error('Enrollment error:', error);
      // Fallback enrollment
      setCourses(prev => prev.map(course => 
        course.id === courseId 
          ? { ...course, enrolled: true, progress: 0 }
          : course
      ));
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const categories = ['All', ...Array.from(new Set(courses.map(c => c.category)))];
  const levels = ['All', ...Array.from(new Set(courses.map(c => c.level)))];

  if (loading) {
    return (
      <AppLayout appName="Azora Sapiens" userName="Azora Citizen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading Ubuntu courses...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout appName="Azora Sapiens" userName="Azora Citizen">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl font-bold tracking-tighter">
            <GradientText>Ubuntu Learning Courses</GradientText>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover courses that embody "I am because we are" philosophy with Elara Canvas tools
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search Ubuntu courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>
        </div>

        {/* Course Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AccessibleCard className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{filteredCourses.length}</div>
            <div className="text-gray-400 text-sm">Available Courses</div>
          </AccessibleCard>
          <AccessibleCard className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {courses.filter(c => c.enrolled).length}
            </div>
            <div className="text-gray-400 text-sm">Enrolled</div>
          </AccessibleCard>
          <AccessibleCard className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {new Set(courses.map(c => c.category)).size}
            </div>
            <div className="text-gray-400 text-sm">Categories</div>
          </AccessibleCard>
          <AccessibleCard className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">
              {courses.reduce((sum, c) => sum + c.modules, 0)}
            </div>
            <div className="text-gray-400 text-sm">Total Modules</div>
          </AccessibleCard>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <AccessibleCard className="p-6 h-full flex flex-col">
                <div className="space-y-4 flex-1">
                  {/* Course Header */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        course.category === 'STEM' ? 'bg-blue-900 text-blue-300' :
                        course.category === 'Arts' ? 'bg-purple-900 text-purple-300' :
                        course.category === 'Humanities' ? 'bg-green-900 text-green-300' :
                        course.category === 'Languages' ? 'bg-orange-900 text-orange-300' :
                        'bg-gray-900 text-gray-300'
                      }`}>
                        {course.category}
                      </span>
                      <span className="text-xs text-gray-400">{course.level}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{course.description}</p>
                  </div>

                  {/* Course Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white">{course.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Modules:</span>
                      <span className="text-white">{course.modules}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tools:</span>
                      <span className="text-white">{course.tools.length} available</span>
                    </div>
                  </div>

                  {/* Ubuntu Focus */}
                  <div className="bg-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Ubuntu Focus</div>
                    <div className="text-sm text-green-400">{course.ubuntuFocus}</div>
                  </div>

                  {/* External Sources */}
                  <div>
                    <div className="text-xs text-gray-400 mb-2">External Sources:</div>
                    <div className="flex flex-wrap gap-1">
                      {course.externalSources.slice(0, 3).map((source, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded">
                          {source}
                        </span>
                      ))}
                      {course.externalSources.length > 3 && (
                        <span className="px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded">
                          +{course.externalSources.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress (if enrolled) */}
                  {course.enrolled && course.progress !== undefined && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-green-400">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 space-y-2">
                  {course.enrolled ? (
                    <Button className="w-full" onClick={() => window.location.href = `/learn/${course.id}`}>
                      Continue Learning
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => handleEnroll(course.id)}>
                      Enroll in Ubuntu Course
                    </Button>
                  )}
                  
                  <Button variant="ghost" size="sm" className="w-full">
                    View Course Details
                  </Button>
                </div>
              </AccessibleCard>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-white mb-2">No courses found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
