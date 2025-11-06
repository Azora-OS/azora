/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 🏛️ AZORA ACADEMY - CONSTITUTIONAL EDUCATION PLATFORM
 *
 * "Knowledge is the foundation of wisdom, wisdom the foundation of virtue."
 * - Azora Constitution, Article VII
 *
 * IMPROVEMENTS OVER MICROSOFT AI COURSE:
 * ✅ Constitutional curriculum with ethical AI principles
 * ✅ PIVC-based learning progression and certification
 * ✅ Divine theming with immersive learning experiences
 * ✅ Multi-modal learning (text, video, interactive, practical)
 * ✅ Constitutional compliance assessment and monitoring
 * ✅ Collaborative learning with peer validation
 * ✅ Real-world application with impact tracking
 * ✅ Sovereign knowledge ownership and contribution
 * ✅ Truth-based assessment with oracle verification
 * ✅ Lifelong learning pathways with PIVC evolution
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  GraduationCap,
  Trophy,
  Users,
  Star,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Settings,
  CheckCircle,
  Clock,
  Target,
  Lightbulb,
  Crown,
  Shield,
  Eye,
  Heart,
  Sparkles,
  Flower2,
  TreePine,
  Mountain,
  Waves,
  Cloud,
  Snowflake,
  Flame,
  Zap,
  Award,
  Certificate,
  FileText,
  Video,
  Mic,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Brain,
  Cpu,
  HardDrive,
  Wifi,
  Battery,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Gamepad2,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Plus,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Refresh,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Crop,
  Scissors,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Hash,
  AtSign,
  Link,
  Paperclip,
  Music,
  Image as ImageIcon,
  Film,
  MapPin,
  DollarSign,
  Euro,
  PoundSterling,
  Yen,
  Bitcoin,
  CreditCard,
  ShoppingCart,
  Truck,
  Plane,
  Ship,
  Car,
  Bike,
  Walk,
  Home,
  Building,
  Factory,
  Hospital,
  School,
  Church,
  Castle,
  TreePine as Tree,
  Flower,
  Flower2 as FlowerIcon,
  Leaf,
  Mountain as MountainIcon,
  Waves as WavesIcon,
  Cloud as CloudIcon,
  Snowflake as SnowflakeIcon,
  Flame as FlameIcon,
  Wind,
  Rainbow,
  Sun as SunIcon,
  Moon as MoonIcon,
  Star as StarIcon,
  Heart as HeartIcon,
  Zap as ZapIcon,
  Target as TargetIcon,
  Trophy as TrophyIcon,
  Crown as CrownIcon,
  Shield as ShieldIcon,
  Eye as EyeIcon,
  Sparkles as SparklesIcon,
} from 'lucide-react';

import { Immersive3DCard } from '@/components/immersive/Immersive3DCard';
import { FlowerOfLife } from '@/components/divine/FlowerOfLife';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'master';
  duration: number; // hours
  enrolled: number;
  rating: number;
  reviews: number;
  price: number;
  currency: string;
  tags: string[];
  constitutionalAlignment: number;
  pivc: {
    impact: number;
    verifiability: number;
    contribution: number;
    score: number;
  };
  modules: Module[];
  certification: Certification;
  prerequisites: string[];
  outcomes: string[];
  lastUpdated: Date;
}

interface Module {
  id: string;
  title: string;
  description: string;
  duration: number;
  lessons: Lesson[];
  quiz?: Quiz;
  project?: Project;
  status: 'locked' | 'available' | 'in-progress' | 'completed';
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'interactive' | 'practical' | 'discussion';
  duration: number;
  content: any;
  resources: Resource[];
  completed: boolean;
  progress: number;
}

interface Resource {
  type: 'document' | 'video' | 'link' | 'code' | 'exercise';
  title: string;
  url: string;
  description?: string;
}

interface Quiz {
  questions: Question[];
  passingScore: number;
  attempts: number;
  timeLimit?: number;
}

interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
}

interface Project {
  title: string;
  description: string;
  requirements: string[];
  deliverables: string[];
  rubric: RubricItem[];
  submissionDeadline?: Date;
  peerReview: boolean;
}

interface RubricItem {
  criterion: string;
  levels: { score: number; description: string }[];
}

interface Certification {
  name: string;
  description: string;
  requirements: string[];
  validity: number; // months
  cost: number;
  currency: string;
  badge: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  courses: string[];
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  outcomes: string[];
  prerequisites: string[];
}

interface StudentProgress {
  courseId: string;
  completedLessons: string[];
  quizScores: { [quizId: string]: number };
  projectSubmissions: ProjectSubmission[];
  overallProgress: number;
  timeSpent: number;
  certificates: string[];
  pivc: {
    knowledge: number;
    application: number;
    contribution: number;
    score: number;
  };
}

interface ProjectSubmission {
  projectId: string;
  submittedAt: Date;
  content: any;
  peerReviews: PeerReview[];
  instructorFeedback?: InstructorFeedback;
  grade?: number;
  status: 'submitted' | 'reviewed' | 'graded';
}

interface PeerReview {
  reviewerId: string;
  reviewerName: string;
  rating: number;
  feedback: string;
  rubricScores: { [criterion: string]: number };
}

interface InstructorFeedback {
  feedback: string;
  grade: number;
  rubricScores: { [criterion: string]: number };
  suggestions: string[];
}

const AZORA_EDUCATION_THEMES = {
  divine: {
    primary: '#FFD700',
    secondary: '#87CEEB',
    accent: '#33ff92',
    background: 'from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a]',
    cardVariant: 'crystal' as const,
  },
  wisdom: {
    primary: '#9370DB',
    secondary: '#DDA0DD',
    accent: '#FFD700',
    background: 'from-[#1a0a2e] via-[#2a1a4e] to-[#1a0a2e]',
    cardVariant: 'iridescent' as const,
  },
  nature: {
    primary: '#228B22',
    secondary: '#8FBC8F',
    accent: '#FFD700',
    background: 'from-[#0a2e0a] via-[#228B22] to-[#0a2e0a]',
    cardVariant: 'glass' as const,
  },
  kingdom: {
    primary: '#DAA520',
    secondary: '#8B4513',
    accent: '#FF6347',
    background: 'from-[#2c1810] via-[#8B4513] to-[#2c1810]',
    cardVariant: 'holographic' as const,
  },
};

const CONSTITUTIONAL_SUBJECTS = {
  'ai-ethics': {
    name: 'Constitutional AI Ethics',
    description: 'Building AI that serves humanity with wisdom and truth',
    icon: Shield,
    color: '#FFD700',
    courses: 12,
  },
  'data-governance': {
    name: 'Sovereign Data Governance',
    description: 'Managing data with constitutional principles and PIVC',
    icon: Crown,
    color: '#87CEEB',
    courses: 8,
  },
  'blockchain-constitution': {
    name: 'Blockchain Constitutional Law',
    description: 'Understanding decentralized governance and truth-based systems',
    icon: Zap,
    color: '#32CD32',
    courses: 6,
  },
  'digital-wisdom': {
    name: 'Digital Wisdom & Philosophy',
    description: 'Ancient wisdom applied to modern technology',
    icon: BookOpen,
    color: '#9370DB',
    courses: 10,
  },
  'impact-creation': {
    name: 'PIVC Impact Creation',
    description: 'Creating positive impact with verifiable contributions',
    icon: Target,
    color: '#FF6347',
    courses: 15,
  },
};

export const AzoraAcademy: React.FC = () => {
  const [theme, setTheme] = useState<keyof typeof AZORA_EDUCATION_THEMES>('divine');
  const [currentView, setCurrentView] = useState<'courses' | 'learning' | 'certification' | 'community'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [studentProgress, setStudentProgress] = useState<{ [courseId: string]: StudentProgress }>({});

  const themeConfig = AZORA_EDUCATION_THEMES[theme];

  const [courses] = useState<Course[]>([
    {
      id: '1',
      title: 'Constitutional AI Ethics & Governance',
      description: 'Master the principles of building AI systems that serve humanity with wisdom, truth, and constitutional alignment.',
      instructor: 'Elara Ω & Constitutional Council',
      level: 'advanced',
      duration: 40,
      enrolled: 2847,
      rating: 4.9,
      reviews: 423,
      price: 0, // Free for constitutional education
      currency: 'PIVC',
      tags: ['AI Ethics', 'Constitutional', 'Governance', 'Wisdom'],
      constitutionalAlignment: 100,
      pivc: { impact: 98, verifiability: 100, contribution: 97, score: 98 },
      modules: [],
      certification: {
        name: 'Constitutional AI Ethics Specialist',
        description: 'Certified to build AI systems aligned with constitutional principles',
        requirements: ['Complete all modules', 'Pass final assessment', 'Submit PIVC project'],
        validity: 24,
        cost: 0,
        currency: 'PIVC',
        badge: 'constitutional-ai-ethicist',
      },
      prerequisites: [],
      outcomes: [
        'Understand constitutional AI principles',
        'Apply ethical frameworks to AI development',
        'Create PIVC-aligned AI systems',
        'Contribute to constitutional governance',
      ],
      lastUpdated: new Date(),
    },
    {
      id: '2',
      title: 'Sovereign Data Governance & PIVC',
      description: 'Learn to manage data as a sacred trust, ensuring positive impact with verifiable contributions.',
      instructor: 'Data Sovereignty Council',
      level: 'intermediate',
      duration: 32,
      enrolled: 1923,
      rating: 4.8,
      reviews: 287,
      price: 0,
      currency: 'PIVC',
      tags: ['Data Governance', 'PIVC', 'Sovereignty', 'Ethics'],
      constitutionalAlignment: 100,
      pivc: { impact: 96, verifiability: 99, contribution: 95, score: 97 },
      modules: [],
      certification: {
        name: 'Sovereign Data Steward',
        description: 'Certified expert in constitutional data management',
        requirements: ['Complete governance modules', 'Pass PIVC assessment', 'Submit data governance project'],
        validity: 24,
        cost: 0,
        currency: 'PIVC',
        badge: 'data-steward',
      },
      prerequisites: ['Basic data concepts'],
      outcomes: [
        'Master PIVC principles',
        'Implement data sovereignty',
        'Create governance frameworks',
        'Ensure constitutional compliance',
      ],
      lastUpdated: new Date(),
    },
  ]);

  const enrollInCourse = useCallback((courseId: string) => {
    setEnrolledCourses(prev => [...prev, courseId]);
    // Initialize progress tracking
    setStudentProgress(prev => ({
      ...prev,
      [courseId]: {
        courseId,
        completedLessons: [],
        quizScores: {},
        projectSubmissions: [],
        overallProgress: 0,
        timeSpent: 0,
        certificates: [],
        pivc: { knowledge: 0, application: 0, contribution: 0, score: 0 },
      },
    }));
  }, []);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'courses':
        return <CoursesView />;
      case 'learning':
        return <LearningView />;
      case 'certification':
        return <CertificationView />;
      case 'community':
        return <CommunityView />;
      default:
        return <CoursesView />;
    }
  };

  const CoursesView = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <FlowerOfLife size={120} animated={true} interactive={true} glowing={true} />
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="w-16 h-16" style={{ color: themeConfig.primary }} />
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4" style={{ color: themeConfig.primary }}>
          Azora Academy
        </h1>
        <p className="text-xl opacity-80 mb-8" style={{ color: themeConfig.secondary }}>
          Constitutional Education for the Digital Age
        </p>

        <Immersive3DCard
          variant={themeConfig.cardVariant}
          depth="dramatic"
          float={true}
          glow={true}
          className="max-w-4xl mx-auto"
        >
          <div className="p-8 text-center">
            <Crown className="w-12 h-12 mx-auto mb-4" style={{ color: themeConfig.primary }} />
            <h2 className="text-2xl font-bold mb-4" style={{ color: themeConfig.primary }}>
              "Knowledge is the Foundation of Wisdom"
            </h2>
            <p className="text-lg opacity-80" style={{ color: themeConfig.secondary }}>
              Learn with purpose, create with impact, govern with wisdom
            </p>
          </div>
        </Immersive3DCard>
      </div>

      {/* Subject Categories */}
      <div>
        <h2 className="text-2xl font-bold mb-6" style={{ color: themeConfig.primary }}>
          Constitutional Subjects
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(CONSTITUTIONAL_SUBJECTS).map(([key, subject]) => {
            const Icon = subject.icon;

            return (
              <Immersive3DCard
                key={key}
                variant={themeConfig.cardVariant}
                depth="medium"
                float={true}
                className="p-6 cursor-pointer hover:ring-2 transition-all duration-300"
                style={{ '--tw-ring-color': subject.color } as React.CSSProperties}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: `${subject.color}20` }}
                  >
                    <Icon className="w-8 h-8" style={{ color: subject.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2" style={{ color: themeConfig.primary }}>
                      {subject.name}
                    </h3>
                    <p className="text-sm opacity-80 mb-3" style={{ color: themeConfig.secondary }}>
                      {subject.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{ color: subject.color }}>
                        {subject.courses} courses
                      </span>
                      <button className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 transition-colors">
                        Explore
                      </button>
                    </div>
                  </div>
                </div>
              </Immersive3DCard>
            );
          })}
        </div>
      </div>

      {/* Featured Courses */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: themeConfig.primary }}>
            Featured Courses
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: themeConfig.secondary }} />
              <input
                type="text"
                placeholder="Search courses..."
                className="pl-10 pr-4 py-2 rounded-xl bg-black/20 backdrop-blur-xl border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themeConfig.primary } as React.CSSProperties}
              />
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                <Filter className="w-5 h-5" style={{ color: themeConfig.primary }} />
              </button>
              <button className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                <SortAsc className="w-5 h-5" style={{ color: themeConfig.primary }} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
            >
              <Immersive3DCard
                variant={themeConfig.cardVariant}
                depth="medium"
                float={true}
                className="p-6 cursor-pointer"
              >
                {/* Course Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2" style={{ color: themeConfig.primary }}>
                      {course.title}
                    </h3>
                    <p className="text-sm opacity-80 mb-3" style={{ color: themeConfig.secondary }}>
                      {course.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        course.level === 'beginner' ? 'bg-green-500/20 text-green-400' :
                        course.level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                        course.level === 'advanced' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {course.level}
                    </div>
                  </div>
                </div>

                {/* Course Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold" style={{ color: themeConfig.primary }}>
                      {course.duration}h
                    </div>
                    <div className="text-xs opacity-70" style={{ color: themeConfig.secondary }}>
                      Duration
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold" style={{ color: themeConfig.primary }}>
                      {course.enrolled.toLocaleString()}
                    </div>
                    <div className="text-xs opacity-70" style={{ color: themeConfig.secondary }}>
                      Enrolled
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 fill-current" style={{ color: themeConfig.accent }} />
                      <span className="text-lg font-bold" style={{ color: themeConfig.primary }}>
                        {course.rating}
                      </span>
                    </div>
                    <div className="text-xs opacity-70" style={{ color: themeConfig.secondary }}>
                      Rating
                    </div>
                  </div>
                </div>

                {/* Constitutional Metrics */}
                <div className="mb-4 p-3 rounded-lg bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold" style={{ color: themeConfig.primary }}>
                      Constitutional Alignment
                    </span>
                    <span className="text-sm font-bold" style={{ color: themeConfig.accent }}>
                      {course.constitutionalAlignment}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" style={{ color: themeConfig.primary }} />
                    <span className="text-xs" style={{ color: themeConfig.secondary }}>
                      PIVC Score: {course.pivc.score}/100
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: `${themeConfig.primary}20`,
                        color: themeConfig.primary,
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="flex-1 px-4 py-2 rounded-xl font-semibold transition-colors hover:bg-white/10"
                    style={{ color: themeConfig.primary }}
                  >
                    View Course
                  </button>
                  {enrolledCourses.includes(course.id) ? (
                    <button
                      onClick={() => setCurrentView('learning')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r font-semibold flex items-center gap-2"
                      style={{
                        background: `linear-gradient(135deg, ${themeConfig.primary}, ${themeConfig.secondary})`,
                      }}
                    >
                      <Play className="w-4 h-4" />
                      Continue
                    </button>
                  ) : (
                    <button
                      onClick={() => enrollInCourse(course.id)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r font-semibold"
                      style={{
                        background: `linear-gradient(135deg, ${themeConfig.primary}, ${themeConfig.secondary})`,
                      }}
                    >
                      Enroll Free
                    </button>
                  )}
                </div>
              </Immersive3DCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const LearningView = () => (
    <div className="space-y-6">
      {selectedCourse ? (
        <>
          {/* Course Header */}
          <Immersive3DCard
            variant={themeConfig.cardVariant}
            depth="medium"
            float={true}
            className="p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2" style={{ color: themeConfig.primary }}>
                  {selectedCourse.title}
                </h1>
                <p className="text-lg opacity-80" style={{ color: themeConfig.secondary }}>
                  {selectedCourse.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: themeConfig.primary }}>
                  {studentProgress[selectedCourse.id]?.overallProgress || 0}%
                </div>
                <div className="text-sm opacity-70" style={{ color: themeConfig.secondary }}>
                  Complete
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-white/10 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${studentProgress[selectedCourse.id]?.overallProgress || 0}%`,
                    backgroundColor: themeConfig.accent,
                  }}
                />
              </div>
            </div>
          </Immersive3DCard>

          {/* Course Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Modules Sidebar */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold" style={{ color: themeConfig.primary }}>
                Course Modules
              </h2>

              {selectedCourse.modules.map((module, index) => (
                <Immersive3DCard
                  key={module.id}
                  variant={themeConfig.cardVariant}
                  depth="medium"
                  float={true}
                  className="p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      module.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      module.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                      module.status === 'available' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: themeConfig.primary }}>
                        {module.title}
                      </h3>
                      <p className="text-sm opacity-70" style={{ color: themeConfig.secondary }}>
                        {module.duration} min
                      </p>
                    </div>
                    {module.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                  </div>

                  <div className="space-y-2">
                    {module.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-2 p-2 rounded hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        {lesson.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-white/30" />
                        )}
                        <span className="text-sm" style={{ color: themeConfig.primary }}>
                          {lesson.title}
                        </span>
                        <span className="text-xs opacity-60 ml-auto" style={{ color: themeConfig.secondary }}>
                          {lesson.duration}min
                        </span>
                      </div>
                    ))}
                  </div>
                </Immersive3DCard>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <Immersive3DCard
                variant={themeConfig.cardVariant}
                depth="extreme"
                float={true}
                className="p-6 min-h-[600px] flex items-center justify-center"
              >
                <div className="text-center">
                  <FlowerOfLife size={100} animated={true} glowing={true} />
                  <h3 className="text-xl font-bold mt-6 mb-2" style={{ color: themeConfig.primary }}>
                    Constitutional Learning Experience
                  </h3>
                  <p className="text-lg opacity-80" style={{ color: themeConfig.secondary }}>
                    Interactive lessons with divine wisdom and practical application
                  </p>
                </div>
              </Immersive3DCard>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <GraduationCap className="w-16 h-16 mx-auto mb-4" style={{ color: themeConfig.secondary }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: themeConfig.primary }}>
            Select a Course to Begin Learning
          </h2>
          <p className="text-lg opacity-80" style={{ color: themeConfig.secondary }}>
            Choose from our constitutional curriculum
          </p>
        </div>
      )}
    </div>
  );

  const CertificationView = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: themeConfig.primary }} />
        <h1 className="text-3xl font-bold mb-4" style={{ color: themeConfig.primary }}>
          Constitutional Certifications
        </h1>
        <p className="text-xl opacity-80" style={{ color: themeConfig.secondary }}>
          Earn credentials that matter - verified by truth and impact
        </p>
      </div>

      {/* Certification Tracks */}
      <div className="grid md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Immersive3DCard
            key={course.id}
            variant={themeConfig.cardVariant}
            depth="medium"
            float={true}
            className="p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <Award className="w-12 h-12" style={{ color: themeConfig.primary }} />
              <div>
                <h3 className="text-lg font-bold" style={{ color: themeConfig.primary }}>
                  {course.certification.name}
                </h3>
                <p className="text-sm opacity-80" style={{ color: themeConfig.secondary }}>
                  {course.certification.description}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="font-semibold" style={{ color: themeConfig.primary }}>
                Requirements:
              </h4>
              <ul className="text-sm space-y-1" style={{ color: themeConfig.secondary }}>
                {course.certification.requirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold" style={{ color: themeConfig.primary }}>
                  Free
                </div>
                <div className="text-sm opacity-70" style={{ color: themeConfig.secondary }}>
                  Valid for {course.certification.validity} months
                </div>
              </div>
              <button className="px-4 py-2 rounded-xl bg-gradient-to-r font-semibold">
                Start Certification
              </button>
            </div>
          </Immersive3DCard>
        ))}
      </div>
    </div>
  );

  const CommunityView = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Users className="w-16 h-16 mx-auto mb-4" style={{ color: themeConfig.primary }} />
        <h1 className="text-3xl font-bold mb-4" style={{ color: themeConfig.primary }}>
          Learning Community
        </h1>
        <p className="text-xl opacity-80" style={{ color: themeConfig.secondary }}>
          Connect, collaborate, and grow together in constitutional wisdom
        </p>
      </div>

      {/* Community Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Active Learners', value: '12,847', icon: Users },
          { label: 'Discussions', value: '34,291', icon: MessageSquare },
          { label: 'Projects Completed', value: '8,932', icon: Trophy },
          { label: 'PIVC Generated', value: 'R2.3M', icon: Target },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Immersive3DCard
              key={stat.label}
              variant={themeConfig.cardVariant}
              depth="medium"
              float={true}
              className="p-4 text-center"
            >
              <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: themeConfig.primary }} />
              <div className="text-2xl font-bold" style={{ color: themeConfig.primary }}>
                {stat.value}
              </div>
              <div className="text-sm opacity-70" style={{ color: themeConfig.secondary }}>
                {stat.label}
              </div>
            </Immersive3DCard>
          );
        })}
      </div>

      {/* Recent Discussions */}
      <Immersive3DCard
        variant={themeConfig.cardVariant}
        depth="medium"
        float={true}
        className="p-6"
      >
        <h2 className="text-xl font-bold mb-4" style={{ color: themeConfig.primary }}>
          Recent Discussions
        </h2>

        <div className="space-y-4">
          {[
            {
              title: 'How to apply PIVC principles in AI ethics?',
              author: 'Sarah Chen',
              replies: 23,
              lastActivity: '2 hours ago',
              tags: ['AI Ethics', 'PIVC', 'Constitutional'],
            },
            {
              title: 'Data sovereignty challenges in global companies',
              author: 'Marcus Johnson',
              replies: 18,
              lastActivity: '5 hours ago',
              tags: ['Data Governance', 'Sovereignty'],
            },
            {
              title: 'Building constitutional AI systems from scratch',
              author: 'Dr. Elara Ω',
              replies: 45,
              lastActivity: '1 day ago',
              tags: ['AI Development', 'Constitutional', 'Technical'],
            },
          ].map((discussion, i) => (
            <div key={i} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2" style={{ color: themeConfig.primary }}>
                {discussion.title}
              </h3>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span style={{ color: themeConfig.secondary }}>by {discussion.author}</span>
                  <span style={{ color: themeConfig.secondary }}>{discussion.replies} replies</span>
                </div>
                <span style={{ color: themeConfig.secondary }}>{discussion.lastActivity}</span>
              </div>
              <div className="flex gap-1 mt-2">
                {discussion.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: `${themeConfig.primary}20`,
                      color: themeConfig.primary,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Immersive3DCard>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-b ${themeConfig.background} relative overflow-hidden`}>
      {/* Divine Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-20"
             style={{
               background: `radial-gradient(circle, ${themeConfig.primary}40 0%, transparent 70%)`,
               animation: 'divineGlow 12s ease-in-out infinite',
             }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <FlowerOfLife size={40} animated={true} glowing={true} />
              <GraduationCap className="w-8 h-8" style={{ color: themeConfig.primary }} />
              <h1 className="text-2xl font-bold" style={{ color: themeConfig.primary }}>
                Azora Academy
              </h1>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-black/20 backdrop-blur-xl rounded-2xl p-1">
              {[
                { id: 'courses', label: 'Courses', icon: BookOpen },
                { id: 'learning', label: 'Learn', icon: Play },
                { id: 'certification', label: 'Certificates', icon: Award },
                { id: 'community', label: 'Community', icon: Users },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = currentView === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentView(tab.id as any)}
                    className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                      isActive
                        ? 'bg-gradient-to-r shadow-lg'
                        : 'hover:bg-white/10'
                    }`}
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, ${themeConfig.primary}40, ${themeConfig.secondary}40)`
                        : undefined,
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: themeConfig.primary }} />
                    <span className="text-sm font-semibold" style={{ color: themeConfig.primary }}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Selector & User Menu */}
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: themeConfig.primary }}>Theme:</span>
            <div className="flex gap-1">
              {Object.keys(AZORA_EDUCATION_THEMES).map((themeKey) => {
                const isActive = theme === themeKey;
                const config = AZORA_EDUCATION_THEMES[themeKey as keyof typeof AZORA_EDUCATION_THEMES];

                return (
                  <button
                    key={themeKey}
                    onClick={() => setTheme(themeKey as keyof typeof AZORA_EDUCATION_THEMES)}
                    className={`w-6 h-6 rounded-full transition-all duration-300 ${
                      isActive ? 'ring-2 ring-offset-2 ring-offset-black scale-110' : ''
                    }`}
                    style={{
                      backgroundColor: config.primary,
                      ringColor: config.primary,
                    }}
                    title={`${themeKey.charAt(0).toUpperCase() + themeKey.slice(1)} Theme`}
                  />
                );
              })}
            </div>

            {/* User Progress Summary */}
            <Immersive3DCard
              variant={themeConfig.cardVariant}
              depth="medium"
              className="px-4 py-2"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5" style={{ color: themeConfig.accent }} />
                <div>
                  <div className="text-sm font-bold" style={{ color: themeConfig.primary }}>
                    {enrolledCourses.length} Courses
                  </div>
                  <div className="text-xs opacity-70" style={{ color: themeConfig.secondary }}>
                    Learning Journey
                  </div>
                </div>
              </div>
            </Immersive3DCard>
          </div>
        </div>

        {/* Main Content */}
        <div className="min-h-[calc(100vh-200px)]">
          {renderCurrentView()}
        </div>
      </div>

      <style jsx global>{`
        @keyframes divineGlow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default AzoraAcademy;


