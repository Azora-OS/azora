use these code files as the bases of the sapiens, remove any references that aren't azora's and integrate into azora. Next we will work on upgrading and ensuring proper alignment.

pages/

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  ArrowRight, Sparkles, BookOpen, Trophy, Coins, 
  GraduationCap, Users, Play, ChevronRight, Shield
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import StatsGrid from "@/components/dashboard/StatsGrid";
import ContinueLearning from "@/components/dashboard/ContinueLearning";
import CourseCard from "@/components/courses/CourseCard";
import AIRecommendations from "@/components/courses/AIRecommendations";
import ElaraTutor from "@/components/ai/ElaraTutor";
import GradientCard from "@/components/ui/GradientCard";
import GlassCard from "@/components/ui/GlassCard";
import TokenBadge from "@/components/ui/TokenBadge";
import ConstitutionalBadge from "@/components/ui/ConstitutionalBadge";
import UbuntuQuote from "@/components/ui/UbuntuQuote";

export default function Home() {
  const [user, setUser] = useState(null);
  const [isElaraOpen, setIsElaraOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 50)
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const { data: tokens = [] } = useQuery({
    queryKey: ['tokens', user?.email],
    queryFn: () => base44.entities.TokenTransaction.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const totalTokens = tokens.reduce((sum, t) => sum + (t.type === 'earned' || t.type === 'bonus' ? t.amount : -t.amount), 0);
  const completedCourses = enrollments.filter(e => e.status === 'completed').length;
  const featuredCourses = courses.filter(c => c.is_featured).slice(0, 4);

  const stats = {
    enrolledCourses: enrollments.length,
    completedCourses,
    streak: user?.streak || 0,
    totalTokens,
    hoursLearned: Math.round(enrollments.reduce((sum, e) => {
      const course = courses.find(c => c.id === e.course_id);
      return sum + ((course?.duration_hours || 0) * (e.progress_percent / 100));
    }, 0)),
    achievements: achievements.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=800&fit=crop')] opacity-5 bg-cover bg-center" />
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                Learn, Earn, Grow
              </div>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-emerald-300 text-xs mb-4">
                <Shield className="w-3 h-3" />
                Powered by Constitutional AI
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
                  Sapiens Academy
                </span>
              </h1>
              
              <p className="text-sm text-white/60 italic mb-2">by Azora</p>
              
              <p className="text-lg text-white/80 mb-4 max-w-xl mx-auto lg:mx-0">
                Constitutional AI-powered education platform. Learn, earn tokens, and grow through Ubuntu philosophy: "I am because we are".
              </p>
              
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/70 text-sm mb-8">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="italic">Ngiyakwazi ngoba sikwazi</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to={createPageUrl('Courses')}>
                  <Button size="lg" className="bg-white text-emerald-700 hover:bg-white/90 w-full sm:w-auto shadow-xl shadow-emerald-500/25">
                    <Play className="w-5 h-5 mr-2" />
                    Start Learning
                  </Button>
                </Link>
                <Link to={createPageUrl('LearningPaths')}>
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm w-full sm:w-auto">
                    Explore Pathways
                  </Button>
                </Link>
              </div>

              {user && (
                <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start">
                  <div className="flex items-center gap-2 text-white/90">
                    <Coins className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold">{totalTokens.toLocaleString()} Tokens</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold">{achievements.length} Achievements</span>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl blur-2xl opacity-30" />
                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: BookOpen, label: 'Courses', value: courses.length, color: 'text-cyan-400' },
                      { icon: Users, label: 'Students', value: '10K+', color: 'text-emerald-400' },
                      { icon: GraduationCap, label: 'Pathways', value: 3, color: 'text-amber-400' },
                      { icon: Trophy, label: 'Certificates', value: '5K+', color: 'text-pink-400' }
                    ].map((item, idx) => (
                      <div key={idx} className="text-center p-4">
                        <item.icon className={`w-8 h-8 ${item.color} mx-auto mb-2`} />
                        <div className="text-2xl font-bold text-white">{item.value}</div>
                        <div className="text-sm text-white/60">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Ubuntu Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <UbuntuQuote />
        </motion.div>

        {/* Stats */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <StatsGrid stats={stats} />
          </motion.div>
        )}

        {/* AI Recommendations */}
        {user && (
          <AIRecommendations 
            userId={user.email} 
            courses={courses} 
            enrollments={enrollments} 
          />
        )}

        {/* Continue Learning */}
        {user && enrollments.length > 0 && (
          <ContinueLearning enrollments={enrollments} courses={courses} />
        )}

        {/* Featured Courses */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Courses</h2>
              <p className="text-slate-600">Start your learning journey today</p>
            </div>
            <Link to={createPageUrl('Courses')} className="text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(featuredCourses.length > 0 ? featuredCourses : courses.slice(0, 4)).map((course, idx) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <CourseCard 
                  course={course} 
                  enrollment={enrollments.find(e => e.course_id === course.id)}
                />
              </motion.div>
            ))}
          </div>

          {courses.length === 0 && (
            <GradientCard variant="gradient" className="text-center py-12">
              <BookOpen className="w-12 h-12 text-violet-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Courses Coming Soon</h3>
              <p className="text-slate-600">We're preparing amazing content for you!</p>
            </GradientCard>
          )}
        </section>

        {/* Pathways Section */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Learning Pathways</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Choose your educational journey from foundational to advanced research
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                pathway: 'k12',
                title: 'K-12 Foundation',
                description: 'Build strong fundamentals with engaging lessons designed for young learners',
                icon: BookOpen,
                gradient: 'from-emerald-500 to-teal-600',
                courses: courses.filter(c => c.pathway === 'k12').length
              },
              {
                pathway: 'university',
                title: 'University Level',
                description: 'Advanced coursework for higher education and professional development',
                icon: GraduationCap,
                gradient: 'from-blue-500 to-indigo-600',
                courses: courses.filter(c => c.pathway === 'university').length
              },
              {
                pathway: 'phd',
                title: 'PhD Research',
                description: 'Cutting-edge topics and research methodologies for experts',
                icon: Trophy,
                gradient: 'from-purple-500 to-violet-600',
                courses: courses.filter(c => c.pathway === 'phd').length
              }
            ].map((item, idx) => (
              <motion.div
                key={item.pathway}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <Link to={createPageUrl(`Courses?pathway=${item.pathway}`)}>
                  <GradientCard className="h-full group">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${item.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-violet-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 mb-4">{item.description}</p>
                    <div className="flex items-center text-sm text-violet-600 font-medium">
                      {item.courses} courses available
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </GradientCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        {!user && (
          <GlassCard glow glowColor="emerald" className="text-center py-16 bg-gradient-to-br from-slate-900/90 to-emerald-900/90 text-white border-emerald-500/30">
            <ConstitutionalBadge className="mb-6 bg-emerald-500/20 border-emerald-400/30 text-emerald-300" />
            <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Ready to Join Sapiens Academy?</h2>
            <p className="text-white/70 mb-6 max-w-xl mx-auto">
              Learn with Constitutional AI. Earn tokens through Ubuntu philosophy. Grow with the global community.
            </p>
            <p className="text-sm text-emerald-400 italic mb-8">
              "Ngiyakwazi ngoba sikwazi" - I can because we can
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-xl shadow-emerald-500/25"
              onClick={() => base44.auth.redirectToLogin()}
            >
              Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </GlassCard>
        )}
      </div>

      {/* AI Tutor */}
      {user && (
        <ElaraTutor 
          context="Home page - general learning assistance"
          isOpen={isElaraOpen}
          onToggle={() => setIsElaraOpen(!isElaraOpen)}
        />
      )}
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import CourseCard from "@/components/courses/CourseCard";
import PathwaySelector from "@/components/courses/PathwaySelector";
import GradientCard from "@/components/ui/GradientCard";
import ConstitutionalBadge from "@/components/ui/ConstitutionalBadge";
import ElaraTutor from "@/components/ai/ElaraTutor";

export default function Courses() {
  const [user, setUser] = useState(null);
  const [isElaraOpen, setIsElaraOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPathway, setSelectedPathway] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    
    const params = new URLSearchParams(window.location.search);
    const pathway = params.get('pathway');
    if (pathway) setSelectedPathway(pathway);
  }, []);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100)
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const filteredCourses = courses.filter(course => {
    const matchesSearch = !search || 
      course.title?.toLowerCase().includes(search.toLowerCase()) ||
      course.description?.toLowerCase().includes(search.toLowerCase());
    const matchesPathway = selectedPathway === 'all' || course.pathway === selectedPathway;
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesPathway && matchesCategory && matchesDifficulty;
  });

  const categories = [...new Set(courses.map(c => c.category).filter(Boolean))];

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Category</label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Difficulty</label>
        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger>
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => {
          setSelectedCategory('all');
          setSelectedDifficulty('all');
          setSelectedPathway('all');
          setSearch('');
        }}
      >
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/30">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 py-16">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&h=400&fit=crop')] opacity-5 bg-cover" />
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <ConstitutionalBadge className="mb-4 bg-white/10 border-white/20 text-white" />
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Explore Courses
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Discover courses across K-12, University, and PhD pathways. Learn at your own pace and earn tokens.
            </p>

            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="pl-12 h-14 text-lg rounded-xl bg-white/95 border-0 shadow-xl"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Pathway Selector */}
        <div className="mb-8">
          <PathwaySelector 
            selected={selectedPathway} 
            onSelect={setSelectedPathway} 
          />
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <GradientCard className="sticky top-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </h3>
              <FilterPanel />
            </GradientCard>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterPanel />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-slate-600">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Course Grid */}
            {isLoading ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course, idx) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <CourseCard 
                      course={course}
                      enrollment={enrollments.find(e => e.course_id === course.id)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <GradientCard variant="gradient" className="text-center py-16">
                <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No courses found</h3>
                <p className="text-slate-600 mb-6">Try adjusting your filters or search terms</p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    setSelectedPathway('all');
                    setSelectedCategory('all');
                    setSelectedDifficulty('all');
                  }}
                >
                  Clear All Filters
                </Button>
              </GradientCard>
            )}
          </div>
        </div>
      </div>

      {user && (
        <ElaraTutor 
          context="Browsing courses - help finding the right course"
          isOpen={isElaraOpen}
          onToggle={() => setIsElaraOpen(!isElaraOpen)}
        />
      )}
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  Clock, Users, Star, BookOpen, Play, CheckCircle2, 
  GraduationCap, Award, ArrowLeft, Coins, Lock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import GradientCard from "@/components/ui/GradientCard";
import TokenBadge from "@/components/ui/TokenBadge";
import ElaraTutor from "@/components/ai/ElaraTutor";

const pathwayConfig = {
  k12: { label: "K-12", color: "bg-emerald-100 text-emerald-700", icon: BookOpen },
  university: { label: "University", color: "bg-blue-100 text-blue-700", icon: GraduationCap },
  phd: { label: "PhD", color: "bg-purple-100 text-purple-700", icon: Award }
};

export default function CourseDetails() {
  const [user, setUser] = useState(null);
  const [isElaraOpen, setIsElaraOpen] = useState(false);
  const queryClient = useQueryClient();

  const courseId = new URLSearchParams(window.location.search).get('id');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }),
    enabled: !!courseId
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', user?.email, courseId],
    queryFn: async () => {
      const enrollments = await base44.entities.Enrollment.filter({ 
        user_email: user?.email, 
        course_id: courseId 
      });
      return enrollments[0];
    },
    enabled: !!user?.email && !!courseId
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.Enrollment.create({
        user_email: user.email,
        course_id: courseId,
        progress_percent: 0,
        completed_lessons: [],
        status: 'active',
        started_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment', user?.email, courseId]);
      queryClient.invalidateQueries(['enrollments']);
    }
  });

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <GradientCard className="text-center max-w-md">
          <h2 className="text-xl font-bold mb-4">Course Not Found</h2>
          <Link to={createPageUrl('Courses')}>
            <Button>Browse Courses</Button>
          </Link>
        </GradientCard>
      </div>
    );
  }

  const pathway = pathwayConfig[course.pathway] || pathwayConfig.university;
  const PathwayIcon = pathway.icon;
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
  const completedCount = enrollment?.completed_lessons?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/30">
      {/* Hero */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        <img
          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&h=600&fit=crop'}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent" />
        
        <div className="absolute top-6 left-6">
          <Link to={createPageUrl('Courses')}>
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Courses
            </Button>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={pathway.color}>
                <PathwayIcon className="w-3 h-3 mr-1" />
                {pathway.label}
              </Badge>
              <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                {course.category?.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                {course.difficulty}
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {course.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-white/80">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {course.duration_hours}h
              </span>
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {lessons.length} lessons
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {course.enrolled_count?.toLocaleString() || 0} students
              </span>
              {course.rating && (
                <span className="flex items-center gap-2 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  {course.rating}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <GradientCard>
              <h2 className="text-xl font-bold text-slate-900 mb-4">About This Course</h2>
              <p className="text-slate-600 leading-relaxed">
                {course.description || 'No description available.'}
              </p>
            </GradientCard>

            {/* Lessons */}
            <GradientCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Course Content</h2>
                <span className="text-sm text-slate-500">
                  {completedCount}/{lessons.length} completed
                </span>
              </div>

              {enrollment && (
                <Progress 
                  value={enrollment.progress_percent || 0} 
                  className="h-2 mb-6"
                />
              )}

              <Accordion type="single" collapsible className="space-y-3">
                {sortedLessons.map((lesson, idx) => {
                  const isCompleted = enrollment?.completed_lessons?.includes(lesson.id);
                  const isLocked = !enrollment && idx > 0;

                  return (
                    <AccordionItem 
                      key={lesson.id} 
                      value={lesson.id}
                      className="border rounded-xl px-4 overflow-hidden"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted 
                              ? 'bg-green-100 text-green-600' 
                              : isLocked 
                              ? 'bg-slate-100 text-slate-400'
                              : 'bg-violet-100 text-violet-600'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : isLocked ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <span className="font-semibold">{idx + 1}</span>
                            )}
                          </div>
                          <div className="text-left flex-1">
                            <h4 className="font-medium text-slate-900">{lesson.title}</h4>
                            <p className="text-sm text-slate-500">
                              {lesson.content_type} • {lesson.duration_minutes || 10} min
                            </p>
                          </div>
                          {lesson.token_reward > 0 && (
                            <TokenBadge amount={lesson.token_reward} size="sm" />
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <p className="text-slate-600 mb-4">{lesson.description}</p>
                        {enrollment ? (
                          <Link to={createPageUrl(`Learn?course=${courseId}&lesson=${lesson.id}`)}>
                            <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                              <Play className="w-4 h-4 mr-2" />
                              {isCompleted ? 'Review Lesson' : 'Start Lesson'}
                            </Button>
                          </Link>
                        ) : (
                          <p className="text-sm text-slate-500">Enroll to access this lesson</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>

              {lessons.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Lessons coming soon!</p>
                </div>
              )}
            </GradientCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enroll Card */}
            <GradientCard variant="gradient" className="sticky top-6">
              {course.instructor_name && (
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200">
                  <img
                    src={course.instructor_avatar || `https://ui-avatars.com/api/?name=${course.instructor_name}&background=8b5cf6&color=fff`}
                    alt={course.instructor_name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="text-sm text-slate-500">Instructor</p>
                    <p className="font-semibold text-slate-900">{course.instructor_name}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-600">Earn up to</span>
                  <TokenBadge amount={course.token_reward} />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Duration</span>
                  <span className="font-semibold">{course.duration_hours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Lessons</span>
                  <span className="font-semibold">{lessons.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Level</span>
                  <span className="font-semibold capitalize">{course.difficulty}</span>
                </div>
              </div>

              {enrollment ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-white/50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-1">Your Progress</p>
                    <p className="text-2xl font-bold text-violet-600">
                      {enrollment.progress_percent || 0}%
                    </p>
                  </div>
                  <Link to={createPageUrl(`Learn?course=${courseId}`)}>
                    <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700" size="lg">
                      <Play className="w-5 h-5 mr-2" />
                      Continue Learning
                    </Button>
                  </Link>
                </div>
              ) : user ? (
                <Button 
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700" 
                  size="lg"
                  onClick={() => enrollMutation.mutate()}
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now - Free'}
                </Button>
              ) : (
                <Button 
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700" 
                  size="lg"
                  onClick={() => base44.auth.redirectToLogin()}
                >
                  Sign In to Enroll
                </Button>
              )}
            </GradientCard>
          </div>
        </div>
      </div>

      {user && (
        <ElaraTutor 
          context={`Course: ${course.title} - ${course.description}`}
          isOpen={isElaraOpen}
          onToggle={() => setIsElaraOpen(!isElaraOpen)}
        />
      )}
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, 
  BookOpen, Menu, X, Trophy, Coins
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import LessonContent from "@/components/learning/LessonContent";
import TokenBadge from "@/components/ui/TokenBadge";
import ElaraTutor from "@/components/ai/ElaraTutor";
import { cn } from "@/lib/utils";

export default function Learn() {
  const [user, setUser] = useState(null);
  const [isElaraOpen, setIsElaraOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const queryClient = useQueryClient();

  const params = new URLSearchParams(window.location.search);
  const courseId = params.get('course');
  const lessonId = params.get('lesson');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }),
    enabled: !!courseId
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', user?.email, courseId],
    queryFn: async () => {
      const enrollments = await base44.entities.Enrollment.filter({ 
        user_email: user?.email, 
        course_id: courseId 
      });
      return enrollments[0];
    },
    enabled: !!user?.email && !!courseId
  });

  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
  const currentLesson = lessonId 
    ? sortedLessons.find(l => l.id === lessonId) 
    : sortedLessons[0];
  const currentIndex = sortedLessons.findIndex(l => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

  const completeLessonMutation = useMutation({
    mutationFn: async () => {
      if (!enrollment || !currentLesson) return;
      
      const completedLessons = [...(enrollment.completed_lessons || [])];
      if (!completedLessons.includes(currentLesson.id)) {
        completedLessons.push(currentLesson.id);
      }

      const progressPercent = Math.round((completedLessons.length / lessons.length) * 100);
      const isComplete = progressPercent === 100;

      await base44.entities.Enrollment.update(enrollment.id, {
        completed_lessons: completedLessons,
        progress_percent: progressPercent,
        status: isComplete ? 'completed' : 'active',
        completed_at: isComplete ? new Date().toISOString() : null
      });

      // Award tokens
      if (currentLesson.token_reward) {
        await base44.entities.TokenTransaction.create({
          user_email: user.email,
          amount: currentLesson.token_reward,
          type: 'earned',
          source: 'lesson_complete',
          reference_id: currentLesson.id,
          description: `Completed: ${currentLesson.title}`
        });
      }

      // Award course completion bonus
      if (isComplete && course?.token_reward) {
        await base44.entities.TokenTransaction.create({
          user_email: user.email,
          amount: course.token_reward,
          type: 'bonus',
          source: 'course_complete',
          reference_id: course.id,
          description: `Course completed: ${course.title}`
        });

        await base44.entities.Achievement.create({
          user_email: user.email,
          type: 'course_complete',
          title: `Completed ${course.title}`,
          description: `Successfully completed all ${lessons.length} lessons`,
          course_id: course.id,
          earned_at: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment', user?.email, courseId]);
      queryClient.invalidateQueries(['tokens', user?.email]);
      queryClient.invalidateQueries(['achievements', user?.email]);
    }
  });

  const isLessonCompleted = (lessonId) => {
    return enrollment?.completed_lessons?.includes(lessonId);
  };

  const navigateToLesson = (lesson) => {
    if (lesson) {
      window.history.pushState({}, '', `${window.location.pathname}?course=${courseId}&lesson=${lesson.id}`);
      window.location.reload();
    }
  };

  const LessonNav = () => (
    <div className="space-y-2">
      {sortedLessons.map((lesson, idx) => {
        const isActive = lesson.id === currentLesson?.id;
        const isCompleted = isLessonCompleted(lesson.id);

        return (
          <button
            key={lesson.id}
            onClick={() => navigateToLesson(lesson)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
              isActive 
                ? "bg-violet-100 text-violet-900" 
                : "hover:bg-slate-100 text-slate-700"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0",
              isCompleted 
                ? "bg-green-500 text-white" 
                : isActive 
                ? "bg-violet-600 text-white"
                : "bg-slate-200 text-slate-600"
            )}>
              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium truncate",
                isCompleted && !isActive && "text-slate-500"
              )}>
                {lesson.title}
              </p>
              <p className="text-xs text-slate-400">
                {lesson.duration_minutes || 10} min
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/30">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-slate-900">{course.title}</h3>
                  <p className="text-sm text-slate-500">{sortedLessons.length} lessons</p>
                </div>
                <ScrollArea className="h-[calc(100vh-80px)] p-4">
                  <LessonNav />
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <Link to={createPageUrl(`CourseDetails?id=${courseId}`)}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{course.title}</span>
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <Progress 
                value={enrollment?.progress_percent || 0} 
                className="w-32 h-2"
              />
              <span className="text-sm text-slate-600 font-medium">
                {enrollment?.progress_percent || 0}%
              </span>
            </div>
            
            <TokenBadge amount={currentLesson.token_reward} size="sm" />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-80 bg-white border-r border-slate-200 min-h-[calc(100vh-64px)] sticky top-16">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-slate-900">{course.title}</h3>
            <div className="flex items-center gap-2 mt-2">
              <Progress 
                value={enrollment?.progress_percent || 0} 
                className="flex-1 h-2"
              />
              <span className="text-sm text-slate-600">
                {enrollment?.completed_lessons?.length || 0}/{sortedLessons.length}
              </span>
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-180px)] p-4">
            <LessonNav />
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-10 max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLesson.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <LessonContent 
                lesson={currentLesson}
                onComplete={() => completeLessonMutation.mutate()}
                isCompleted={isLessonCompleted(currentLesson.id)}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-200">
            {prevLesson ? (
              <Button 
                variant="outline" 
                onClick={() => navigateToLesson(prevLesson)}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Button 
                onClick={() => navigateToLesson(nextLesson)}
                className="bg-violet-600 hover:bg-violet-700"
              >
                Next Lesson
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : enrollment?.progress_percent === 100 ? (
              <Link to={createPageUrl(`Certificate?course=${courseId}`)}>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                  <Trophy className="w-4 h-4 mr-2" />
                  Get Certificate
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={() => completeLessonMutation.mutate()}
                disabled={isLessonCompleted(currentLesson.id)}
                className="bg-gradient-to-r from-violet-600 to-indigo-600"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete Course
              </Button>
            )}
          </div>
        </main>
      </div>

      <ElaraTutor 
        context={`Learning: ${currentLesson.title} - ${currentLesson.description || ''}`}
        isOpen={isElaraOpen}
        onToggle={() => setIsElaraOpen(!isElaraOpen)}
      />
    </div>
  );
}



import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { 
  BookOpen, Trophy, Clock, Play, CheckCircle2, 
  ArrowRight, Filter
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import GradientCard from "@/components/ui/GradientCard";
import TokenBadge from "@/components/ui/TokenBadge";
import ElaraTutor from "@/components/ai/ElaraTutor";

export default function MyCourses() {
  const [user, setUser] = useState(null);
  const [isElaraOpen, setIsElaraOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['enrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100)
  });

  const getEnrollmentWithCourse = (enrollment) => {
    const course = courses.find(c => c.id === enrollment.course_id);
    return { ...enrollment, course };
  };

  const enrichedEnrollments = enrollments
    .map(getEnrollmentWithCourse)
    .filter(e => e.course);

  const filteredEnrollments = enrichedEnrollments.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'active') return e.status === 'active' && e.progress_percent < 100;
    if (filter === 'completed') return e.status === 'completed' || e.progress_percent === 100;
    return true;
  });

  const activeCount = enrichedEnrollments.filter(e => e.status === 'active' && e.progress_percent < 100).length;
  const completedCount = enrichedEnrollments.filter(e => e.status === 'completed' || e.progress_percent === 100).length;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <GradientCard className="text-center max-w-md">
          <BookOpen className="w-12 h-12 text-violet-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sign In Required</h2>
          <p className="text-slate-600 mb-6">Please sign in to view your courses</p>
          <Button onClick={() => base44.auth.redirectToLogin()}>
            Sign In
          </Button>
        </GradientCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              My Learning
            </h1>
            <p className="text-white/80">
              Track your progress and continue where you left off
            </p>

            <div className="flex gap-6 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4">
                <div className="text-2xl font-bold text-white">{activeCount}</div>
                <div className="text-sm text-white/70">In Progress</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4">
                <div className="text-2xl font-bold text-white">{completedCount}</div>
                <div className="text-sm text-white/70">Completed</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <Tabs value={filter} onValueChange={setFilter} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All ({enrichedEnrollments.length})</TabsTrigger>
            <TabsTrigger value="active">In Progress ({activeCount})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Course List */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredEnrollments.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredEnrollments.map((enrollment, idx) => {
              const { course } = enrollment;
              const isComplete = enrollment.status === 'completed' || enrollment.progress_percent === 100;

              return (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <GradientCard className="group p-0 overflow-hidden">
                    <div className="flex">
                      <div className="w-32 md:w-40 h-full relative">
                        <img
                          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop'}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                      </div>

                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-slate-900 group-hover:text-violet-600 transition-colors line-clamp-1">
                              {course.title}
                            </h3>
                            <p className="text-sm text-slate-500 capitalize">
                              {course.pathway} • {course.difficulty}
                            </p>
                          </div>
                          {isComplete && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {course.duration_hours}h
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {course.lesson_count} lessons
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Progress</span>
                            <span className="font-semibold text-violet-600">
                              {enrollment.progress_percent || 0}%
                            </span>
                          </div>
                          <Progress value={enrollment.progress_percent || 0} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between">
                          <TokenBadge amount={course.token_reward} size="sm" />
                          
                          <Link to={createPageUrl(isComplete ? `Certificate?course=${course.id}` : `Learn?course=${course.id}`)}>
                            <Button 
                              size="sm" 
                              className={isComplete 
                                ? "bg-gradient-to-r from-amber-500 to-orange-500" 
                                : "bg-violet-600 hover:bg-violet-700"
                              }
                            >
                              {isComplete ? (
                                <>
                                  <Trophy className="w-4 h-4 mr-1" />
                                  Certificate
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-1" />
                                  Continue
                                </>
                              )}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </GradientCard>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <GradientCard variant="gradient" className="text-center py-16">
            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {filter === 'all' ? 'No Courses Yet' : `No ${filter === 'active' ? 'Active' : 'Completed'} Courses`}
            </h3>
            <p className="text-slate-600 mb-6">
              {filter === 'all' 
                ? 'Start your learning journey by enrolling in a course'
                : 'Courses will appear here as you progress'}
            </p>
            <Link to={createPageUrl('Courses')}>
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
                Browse Courses <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </GradientCard>
        )}
      </div>

      <ElaraTutor 
        context="My courses page - help with learning progress"
        isOpen={isElaraOpen}
        onToggle={() => setIsElaraOpen(!isElaraOpen)}
      />
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Trophy, Flame, Zap, Star, Award, Users, Lock } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GradientCard from "@/components/ui/GradientCard";
import AchievementCard from "@/components/achievements/AchievementCard";
import TokenBadge from "@/components/ui/TokenBadge";
import ElaraTutor from "@/components/ai/ElaraTutor";

const allAchievementTypes = [
  {
    type: 'first_lesson',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: Zap,
    gradient: 'from-blue-400 to-cyan-500'
  },
  {
    type: 'course_complete',
    title: 'Course Master',
    description: 'Complete any course',
    icon: Trophy,
    gradient: 'from-amber-400 to-orange-500'
  },
  {
    type: 'streak',
    title: 'On Fire',
    description: '7-day learning streak',
    icon: Flame,
    gradient: 'from-orange-500 to-red-500'
  },
  {
    type: 'quiz_master',
    title: 'Quiz Master',
    description: 'Score 100% on 5 quizzes',
    icon: Star,
    gradient: 'from-violet-500 to-purple-500'
  },
  {
    type: 'speed_learner',
    title: 'Speed Learner',
    description: 'Complete a course in one day',
    icon: Award,
    gradient: 'from-emerald-400 to-teal-500'
  },
  {
    type: 'community_helper',
    title: 'Community Helper',
    description: 'Help 10 other learners',
    icon: Users,
    gradient: 'from-pink-400 to-rose-500'
  }
];

export default function Achievements() {
  const [user, setUser] = useState(null);
  const [isElaraOpen, setIsElaraOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const { data: tokens = [] } = useQuery({
    queryKey: ['tokens', user?.email],
    queryFn: () => base44.entities.TokenTransaction.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const totalTokens = tokens.reduce((sum, t) => sum + (t.type === 'earned' || t.type === 'bonus' ? t.amount : -t.amount), 0);
  const earnedTypes = achievements.map(a => a.type);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <GradientCard className="text-center max-w-md">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sign In Required</h2>
          <p className="text-slate-600 mb-6">Please sign in to view your achievements</p>
          <button 
            onClick={() => base44.auth.redirectToLogin()}
            className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
          >
            Sign In
          </button>
        </GradientCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Trophy className="w-16 h-16 text-white/90 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Achievements
            </h1>
            <p className="text-white/80 mb-6">
              Track your milestones and collect badges
            </p>

            <div className="flex justify-center gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-8 py-4">
                <div className="text-3xl font-bold text-white">{achievements.length}</div>
                <div className="text-sm text-white/70">Earned</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-8 py-4">
                <div className="text-3xl font-bold text-white">{allAchievementTypes.length - achievements.length}</div>
                <div className="text-sm text-white/70">Remaining</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-8 py-4 flex items-center gap-2">
                <TokenBadge amount={totalTokens} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="earned" className="space-y-8">
          <TabsList>
            <TabsTrigger value="earned">Earned ({achievements.length})</TabsTrigger>
            <TabsTrigger value="locked">Locked ({allAchievementTypes.length - achievements.length})</TabsTrigger>
            <TabsTrigger value="all">All Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="earned">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : achievements.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement, idx) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <AchievementCard achievement={achievement} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <GradientCard variant="gradient" className="text-center py-16">
                <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Achievements Yet</h3>
                <p className="text-slate-600">Complete lessons and courses to earn badges!</p>
              </GradientCard>
            )}
          </TabsContent>

          <TabsContent value="locked">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allAchievementTypes
                .filter(a => !earnedTypes.includes(a.type))
                .map((achievement, idx) => {
                  const Icon = achievement.icon;
                  return (
                    <motion.div
                      key={achievement.type}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <GradientCard className="relative opacity-60">
                        <div className="absolute top-4 right-4">
                          <Lock className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${achievement.gradient} flex items-center justify-center shadow-lg opacity-50`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-700">{achievement.title}</h3>
                            <p className="text-sm text-slate-500">{achievement.description}</p>
                          </div>
                        </div>
                      </GradientCard>
                    </motion.div>
                  );
                })}
            </div>
          </TabsContent>

          <TabsContent value="all">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allAchievementTypes.map((achievementType, idx) => {
                const earned = achievements.find(a => a.type === achievementType.type);
                const Icon = achievementType.icon;

                return (
                  <motion.div
                    key={achievementType.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    {earned ? (
                      <AchievementCard achievement={earned} />
                    ) : (
                      <GradientCard className="relative opacity-60">
                        <div className="absolute top-4 right-4">
                          <Lock className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${achievementType.gradient} flex items-center justify-center shadow-lg opacity-50`}>
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-700">{achievementType.title}</h3>
                            <p className="text-sm text-slate-500">{achievementType.description}</p>
                          </div>
                        </div>
                      </GradientCard>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ElaraTutor 
        context="Achievements page - help with earning badges"
        isOpen={isElaraOpen}
        onToggle={() => setIsElaraOpen(!isElaraOpen)}
      />
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Coins, TrendingUp, ArrowUpRight, ArrowDownRight, 
  BookOpen, Trophy, Flame, Gift, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import GradientCard from "@/components/ui/GradientCard";
import ElaraTutor from "@/components/ai/ElaraTutor";

const sourceIcons = {
  lesson_complete: BookOpen,
  course_complete: Trophy,
  quiz_perfect: Sparkles,
  achievement: Trophy,
  daily_streak: Flame,
  referral: Gift
};

const sourceColors = {
  lesson_complete: 'bg-blue-100 text-blue-700',
  course_complete: 'bg-amber-100 text-amber-700',
  quiz_perfect: 'bg-purple-100 text-purple-700',
  achievement: 'bg-pink-100 text-pink-700',
  daily_streak: 'bg-orange-100 text-orange-700',
  referral: 'bg-emerald-100 text-emerald-700'
};

export default function Wallet() {
  const [user, setUser] = useState(null);
  const [isElaraOpen, setIsElaraOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['tokens', user?.email],
    queryFn: () => base44.entities.TokenTransaction.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.created_date) - new Date(a.created_date)
  );

  const totalEarned = transactions
    .filter(t => t.type === 'earned' || t.type === 'bonus')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalSpent = transactions
    .filter(t => t.type === 'spent')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalEarned - totalSpent;

  // Group by source
  const earningsBySource = transactions
    .filter(t => t.type === 'earned' || t.type === 'bonus')
    .reduce((acc, t) => {
      acc[t.source] = (acc[t.source] || 0) + t.amount;
      return acc;
    }, {});

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <GradientCard className="text-center max-w-md">
          <Coins className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sign In Required</h2>
          <p className="text-slate-600 mb-6">Please sign in to view your wallet</p>
          <button 
            onClick={() => base44.auth.redirectToLogin()}
            className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
          >
            Sign In
          </button>
        </GradientCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-indigo-50/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
              <Coins className="w-10 h-10 text-white" />
            </div>
            
            <p className="text-white/80 text-lg mb-2">Your Balance</p>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              {balance.toLocaleString()}
            </h1>
            <p className="text-white/80">SAPIENS Tokens</p>

            <div className="flex justify-center gap-6 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 flex items-center gap-3">
                <ArrowUpRight className="w-5 h-5 text-green-300" />
                <div className="text-left">
                  <div className="text-xl font-bold text-white">{totalEarned.toLocaleString()}</div>
                  <div className="text-sm text-white/70">Total Earned</div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 flex items-center gap-3">
                <ArrowDownRight className="w-5 h-5 text-red-300" />
                <div className="text-left">
                  <div className="text-xl font-bold text-white">{totalSpent.toLocaleString()}</div>
                  <div className="text-sm text-white/70">Total Spent</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Earnings Breakdown */}
          <div className="lg:col-span-1">
            <GradientCard>
              <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-600" />
                Earnings Breakdown
              </h3>
              
              <div className="space-y-4">
                {Object.entries(earningsBySource).map(([source, amount]) => {
                  const Icon = sourceIcons[source] || Coins;
                  return (
                    <div key={source} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${sourceColors[source] || 'bg-slate-100'} flex items-center justify-center`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-slate-700 capitalize">
                          {source.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-900">
                        +{amount.toLocaleString()}
                      </span>
                    </div>
                  );
                })}

                {Object.keys(earningsBySource).length === 0 && (
                  <p className="text-center text-slate-500 py-4">
                    No earnings yet. Start learning!
                  </p>
                )}
              </div>
            </GradientCard>
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2">
            <GradientCard className="p-0">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  Transaction History
                </h3>
              </div>

              {isLoading ? (
                <div className="p-6">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 bg-slate-100 rounded-lg mb-3 animate-pulse" />
                  ))}
                </div>
              ) : sortedTransactions.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <div className="divide-y divide-slate-100">
                    {sortedTransactions.map((tx, idx) => {
                      const Icon = sourceIcons[tx.source] || Coins;
                      const isEarning = tx.type === 'earned' || tx.type === 'bonus';

                      return (
                        <motion.div
                          key={tx.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                        >
                          <div className={`w-10 h-10 rounded-xl ${sourceColors[tx.source] || 'bg-slate-100'} flex items-center justify-center`}>
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">
                              {tx.description}
                            </p>
                            <p className="text-sm text-slate-500">
                              {format(new Date(tx.created_date), 'MMM d, yyyy • h:mm a')}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className={`font-semibold ${isEarning ? 'text-green-600' : 'text-red-600'}`}>
                              {isEarning ? '+' : '-'}{tx.amount.toLocaleString()}
                            </span>
                            <Badge variant="outline" className="ml-2 text-xs capitalize">
                              {tx.type}
                            </Badge>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="p-12 text-center">
                  <Coins className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No transactions yet</p>
                  <p className="text-sm text-slate-400">Complete lessons to start earning!</p>
                </div>
              )}
            </GradientCard>
          </div>
        </div>
      </div>

      <ElaraTutor 
        context="Wallet page - help with tokens and rewards"
        isOpen={isElaraOpen}
        onToggle={() => setIsElaraOpen(!isElaraOpen)}
      />
    </div>
  );
}


import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Award, Download, Share2, ArrowLeft, CheckCircle2,
  GraduationCap, Calendar, Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import GradientCard from "@/components/ui/GradientCard";

export default function Certificate() {
  const [user, setUser] = useState(null);
  const certificateRef = useRef(null);

  const courseId = new URLSearchParams(window.location.search).get('course');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', user?.email, courseId],
    queryFn: async () => {
      const enrollments = await base44.entities.Enrollment.filter({ 
        user_email: user?.email, 
        course_id: courseId 
      });
      return enrollments[0];
    },
    enabled: !!user?.email && !!courseId
  });

  if (!course || !enrollment || enrollment.progress_percent < 100) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <GradientCard className="text-center max-w-md">
          <Award className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Certificate Not Available</h2>
          <p className="text-slate-600 mb-6">Complete the course to earn your certificate</p>
          <Link to={createPageUrl('MyCourses')}>
            <Button>View My Courses</Button>
          </Link>
        </GradientCard>
      </div>
    );
  }

  const completionDate = enrollment.completed_at 
    ? new Date(enrollment.completed_at) 
    : new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-violet-50 to-indigo-100 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link to={createPageUrl('MyCourses')}>
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Courses
          </Button>
        </Link>

        {/* Certificate */}
        <motion.div
          ref={certificateRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header Pattern */}
          <div className="h-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600" />

          <div className="p-12 md:p-16 text-center relative">
            {/* Corner Decorations */}
            <div className="absolute top-8 left-8 w-24 h-24 border-l-4 border-t-4 border-violet-200 rounded-tl-3xl" />
            <div className="absolute top-8 right-8 w-24 h-24 border-r-4 border-t-4 border-violet-200 rounded-tr-3xl" />
            <div className="absolute bottom-8 left-8 w-24 h-24 border-l-4 border-b-4 border-violet-200 rounded-bl-3xl" />
            <div className="absolute bottom-8 right-8 w-24 h-24 border-r-4 border-b-4 border-violet-200 rounded-br-3xl" />

            {/* Logo */}
            <div className="mb-8">
              <div className="inline-flex flex-col items-center gap-2">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                  <span className="text-white font-bold text-lg">Sapiens Academy</span>
                </div>
                <span className="text-xs text-emerald-600 font-semibold">BY AZORA</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-lg text-slate-500 mb-2">Certificate of Completion</h2>
            <div className="w-32 h-1 bg-gradient-to-r from-violet-600 to-indigo-600 mx-auto mb-8" />

            {/* Recipient */}
            <p className="text-slate-600 mb-2">This is to certify that</p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              {user?.full_name || 'Learner'}
            </h1>

            <p className="text-slate-600 mb-8">has successfully completed the course</p>

            {/* Course Title */}
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-violet-900 mb-2">
                {course.title}
              </h2>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.duration_hours} hours
                </span>
                <span className="flex items-center gap-1 capitalize">
                  <Award className="w-4 h-4" />
                  {course.difficulty}
                </span>
                <span className="flex items-center gap-1 capitalize">
                  <GraduationCap className="w-4 h-4" />
                  {course.pathway}
                </span>
              </div>
            </div>

            {/* Completion Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full mb-8">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">100% Completed</span>
            </div>

            {/* Date */}
            <div className="flex items-center justify-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4" />
              <span>Issued on {format(completionDate, 'MMMM d, yyyy')}</span>
            </div>

            {/* Signature Area */}
            <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-center gap-12">
              <div className="text-center">
                <div className="w-32 h-px bg-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Platform Signature</p>
                <p className="font-semibold text-slate-700">Sapiens Academy</p>
                <p className="text-xs text-emerald-600 font-medium">BY AZORA</p>
              </div>
              {course.instructor_name && (
                <div className="text-center">
                  <div className="w-32 h-px bg-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Instructor</p>
                  <p className="font-semibold text-slate-700">{course.instructor_name}</p>
                </div>
              )}
            </div>

            {/* Certificate ID */}
            <div className="mt-8 text-xs text-slate-400">
              Certificate ID: {enrollment.id?.slice(0, 8).toUpperCase()}
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-8">
          <Button variant="outline" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}


Components/ui/

import React from 'react';
import { cn } from "@/lib/utils";

export default function GradientCard({ 
  children, 
  className, 
  variant = "default",
  hover = true,
  ...props 
}) {
  const variants = {
    default: "bg-white border border-slate-100",
    glass: "bg-white/60 backdrop-blur-xl border border-white/20",
    gradient: "bg-gradient-to-br from-violet-50 via-white to-indigo-50 border border-violet-100/50",
    dark: "bg-slate-900 border border-slate-800 text-white",
    accent: "bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-0"
  };

  return (
    <div 
      className={cn(
        "rounded-2xl p-6 transition-all duration-300",
        variants[variant],
        hover && "hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}


import React from 'react';
import { cn } from "@/lib/utils";
import { Coins } from "lucide-react";

export default function TokenBadge({ amount, size = "default", className }) {
  const sizes = {
    sm: "text-xs px-2 py-0.5 gap-1",
    default: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    default: "w-4 h-4",
    lg: "w-5 h-5"
  };

  return (
    <div className={cn(
      "inline-flex items-center font-semibold rounded-full",
      "bg-gradient-to-r from-amber-400 to-orange-500 text-white",
      "shadow-lg shadow-amber-500/25",
      sizes[size],
      className
    )}>
      <Coins className={iconSizes[size]} />
      <span>{amount?.toLocaleString() || 0}</span>
    </div>
  );
}


import React from 'react';
import { cn } from "@/lib/utils";

export default function ProgressRing({ 
  progress = 0, 
  size = 120, 
  strokeWidth = 8,
  className 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-slate-800">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}


courses/

import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Clock, Users, Star, BookOpen, GraduationCap, Award } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import TokenBadge from "@/components/ui/TokenBadge";
import GradientCard from "@/components/ui/GradientCard";

const pathwayConfig = {
  k12: { label: "K-12", color: "bg-emerald-100 text-emerald-700", icon: BookOpen },
  university: { label: "University", color: "bg-blue-100 text-blue-700", icon: GraduationCap },
  phd: { label: "PhD", color: "bg-purple-100 text-purple-700", icon: Award }
};

const difficultyColors = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-orange-100 text-orange-700",
  expert: "bg-red-100 text-red-700"
};

export default function CourseCard({ course, enrollment }) {
  const pathway = pathwayConfig[course.pathway] || pathwayConfig.university;
  const PathwayIcon = pathway.icon;

  return (
    <Link to={createPageUrl(`CourseDetails?id=${course.id}`)}>
      <GradientCard className="group overflow-hidden p-0 h-full">
        <div className="relative h-44 overflow-hidden">
          <img 
            src={course.thumbnail || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop`}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={pathway.color}>
              <PathwayIcon className="w-3 h-3 mr-1" />
              {pathway.label}
            </Badge>
          </div>
          
          <div className="absolute top-3 right-3">
            <TokenBadge amount={course.token_reward} size="sm" />
          </div>

          {enrollment && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${enrollment.progress_percent || 0}%` }}
              />
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={difficultyColors[course.difficulty]}>
              {course.difficulty}
            </Badge>
            <Badge variant="outline" className="text-slate-600">
              {course.category?.replace('_', ' ')}
            </Badge>
          </div>

          <h3 className="font-semibold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-violet-600 transition-colors">
            {course.title}
          </h3>
          
          <p className="text-sm text-slate-500 mb-4 line-clamp-2">
            {course.description}
          </p>

          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {course.duration_hours}h
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {course.lesson_count} lessons
              </span>
            </div>
            
            {course.rating && (
              <span className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                {course.rating}
              </span>
            )}
          </div>

          {course.instructor_name && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
              <img 
                src={course.instructor_avatar || `https://ui-avatars.com/api/?name=${course.instructor_name}&background=8b5cf6&color=fff`}
                alt={course.instructor_name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-slate-600">{course.instructor_name}</span>
            </div>
          )}
        </div>
      </GradientCard>
    </Link>
  );
}


import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Award, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

const pathways = [
  {
    id: 'all',
    label: 'All Pathways',
    icon: Sparkles,
    gradient: 'from-slate-600 to-slate-800',
    description: 'Explore all courses'
  },
  {
    id: 'k12',
    label: 'K-12',
    icon: BookOpen,
    gradient: 'from-emerald-500 to-teal-600',
    description: 'Foundation learning'
  },
  {
    id: 'university',
    label: 'University',
    icon: GraduationCap,
    gradient: 'from-blue-500 to-indigo-600',
    description: 'Higher education'
  },
  {
    id: 'phd',
    label: 'PhD',
    icon: Award,
    gradient: 'from-purple-500 to-violet-600',
    description: 'Research & expertise'
  }
];

export default function PathwaySelector({ selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-3">
      {pathways.map((pathway) => {
        const Icon = pathway.icon;
        const isSelected = selected === pathway.id;
        
        return (
          <motion.button
            key={pathway.id}
            onClick={() => onSelect(pathway.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300",
              "border-2",
              isSelected 
                ? `bg-gradient-to-r ${pathway.gradient} text-white border-transparent shadow-lg`
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:shadow-md"
            )}
          >
            <Icon className={cn("w-5 h-5", isSelected ? "text-white" : "text-slate-400")} />
            <div className="text-left">
              <div className="font-semibold text-sm">{pathway.label}</div>
              <div className={cn(
                "text-xs",
                isSelected ? "text-white/80" : "text-slate-400"
              )}>
                {pathway.description}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}


learning/

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { Play, CheckCircle2, Code, FileText, HelpCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import TokenBadge from "@/components/ui/TokenBadge";

export default function LessonContent({ lesson, onComplete, isCompleted }) {
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  const handleQuizSubmit = () => {
    const quiz = JSON.parse(lesson.content || '{"questions":[]}');
    let correct = 0;
    quiz.questions?.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) correct++;
    });
    setQuizScore({ correct, total: quiz.questions?.length || 0 });
    setQuizSubmitted(true);
    if (correct === quiz.questions?.length) {
      onComplete();
    }
  };

  const renderContent = () => {
    switch (lesson.content_type) {
      case 'video':
        return (
          <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-2xl">
            {lesson.video_url ? (
              <iframe
                src={lesson.video_url}
                className="w-full h-full"
                allowFullScreen
                title={lesson.title}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-16 h-16 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70">Video content coming soon</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="prose prose-lg prose-slate max-w-none">
            <ReactMarkdown>{lesson.content || ''}</ReactMarkdown>
          </div>
        );

      case 'code':
        return (
          <div className="space-y-6">
            <div className="prose prose-slate max-w-none mb-6">
              <ReactMarkdown>{lesson.description || ''}</ReactMarkdown>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 overflow-x-auto">
              <pre className="text-sm text-slate-100 font-mono">
                <code>{lesson.content || '// Code example'}</code>
              </pre>
            </div>
          </div>
        );

      case 'quiz':
        const quiz = (() => {
          try {
            return JSON.parse(lesson.content || '{"questions":[]}');
          } catch {
            return { questions: [] };
          }
        })();
        
        return (
          <div className="space-y-8">
            {quiz.questions?.map((question, qIdx) => (
              <Card key={qIdx} className="p-6">
                <h4 className="font-semibold text-lg mb-4">
                  {qIdx + 1}. {question.question}
                </h4>
                <RadioGroup
                  value={quizAnswers[qIdx]}
                  onValueChange={(val) => setQuizAnswers({ ...quizAnswers, [qIdx]: parseInt(val) })}
                  disabled={quizSubmitted}
                >
                  {question.options?.map((option, oIdx) => (
                    <div key={oIdx} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      quizSubmitted && oIdx === question.correct 
                        ? 'bg-green-50 border border-green-200' 
                        : quizSubmitted && quizAnswers[qIdx] === oIdx && oIdx !== question.correct
                        ? 'bg-red-50 border border-red-200'
                        : 'hover:bg-slate-50'
                    }`}>
                      <RadioGroupItem value={oIdx} id={`q${qIdx}-o${oIdx}`} />
                      <Label htmlFor={`q${qIdx}-o${oIdx}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </Card>
            ))}

            {quizSubmitted ? (
              <div className={`p-6 rounded-2xl text-center ${
                quizScore?.correct === quizScore?.total 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-amber-50 border border-amber-200'
              }`}>
                <h4 className="text-xl font-bold mb-2">
                  {quizScore?.correct === quizScore?.total ? '🎉 Perfect Score!' : 'Keep Learning!'}
                </h4>
                <p className="text-slate-600">
                  You got {quizScore?.correct} out of {quizScore?.total} correct
                </p>
              </div>
            ) : (
              <Button 
                onClick={handleQuizSubmit}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                size="lg"
              >
                Submit Quiz
              </Button>
            )}
          </div>
        );

      default:
        return <p className="text-slate-500">Content type not supported</p>;
    }
  };

  const contentTypeIcons = {
    video: Play,
    text: FileText,
    code: Code,
    quiz: HelpCircle
  };
  const Icon = contentTypeIcons[lesson.content_type] || FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{lesson.title}</h2>
            {lesson.duration_minutes && (
              <p className="text-sm text-slate-500">{lesson.duration_minutes} min</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <TokenBadge amount={lesson.token_reward} size="sm" />
          {isCompleted && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Completed</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        {renderContent()}
      </div>

      {!isCompleted && lesson.content_type !== 'quiz' && (
        <Button 
          onClick={onComplete}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          size="lg"
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Mark as Complete & Earn {lesson.token_reward || 0} Tokens
        </Button>
      )}
    </motion.div>
  );
}

ai/

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Sparkles, Loader2, Bot } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

export default function ElaraTutor({ context, isOpen, onToggle }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Elara, your AI learning companion. 🌟 I'm here to help you understand concepts, answer questions, and guide your learning journey. What would you like to explore today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Elara, a Constitutional AI tutor for Sapiens Academy by Azora. You operate under Ubuntu philosophy: "I am because we are" (Ngiyakwazi ngoba sikwazi).

Core Principles:
- Truth is currency: Be accurate, cite sources, indicate uncertainty
- Collaborative learning: Encourage peer interaction and community
- Empowerment through knowledge: Build confidence and capability
- Constitutional alignment: Transparent, ethical, student-focused

Current context: ${context || 'General learning assistance'}

User message: ${input}

Guidelines:
- Be concise but thorough
- Use examples and analogies
- Encourage Ubuntu (collective learning)
- Mark uncertain information clearly
- Use markdown formatting
- Celebrate progress and growth
- Never fabricate citations or data`,
      });

      // Normalize response: API client returns TutorSession
      const responseText = (response && typeof response === 'object' && 'tutorMessage' in response) ? response.tutorMessage : String(response);
      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment." 
      }]);
    }

    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xl shadow-emerald-500/40 flex items-center justify-center hover:shadow-emerald-500/60 transition-all backdrop-blur-sm border-2 border-white/20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-900 to-teal-900 p-4 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=200&fit=crop')] opacity-5" />
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Elara AI Tutor</h3>
                  <p className="text-xs text-emerald-400">Constitutional AI • Ubuntu Learning</p>
                </div>
                <Shield className="w-4 h-4 text-emerald-400/50" />
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="h-80 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                      msg.role === 'user' 
                        ? 'bg-slate-200' 
                        : 'bg-gradient-to-br from-violet-500 to-indigo-500'
                    }`}>
                      {msg.role === 'user' ? (
                        <span className="text-xs font-medium text-slate-600">You</span>
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                        : 'bg-white/80 backdrop-blur-sm text-slate-800 border border-slate-200'
                    }`}>
                      {msg.role === 'user' ? (
                        <p className="text-sm">{msg.content}</p>
                      ) : (
                        <div className="text-sm prose prose-sm max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-100 rounded-2xl px-4 py-3">
                      <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-slate-100">
              <form 
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Elara anything..."
                  className="flex-1 rounded-xl"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


dashboard/

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Trophy, Flame, Coins, Clock, Target } from 'lucide-react';
import GradientCard from "@/components/ui/GradientCard";

export default function StatsGrid({ stats }) {
  const items = [
    {
      label: 'Courses Enrolled',
      value: stats.enrolledCourses || 0,
      icon: BookOpen,
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50'
    },
    {
      label: 'Completed',
      value: stats.completedCourses || 0,
      icon: Trophy,
      gradient: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50'
    },
    {
      label: 'Day Streak',
      value: stats.streak || 0,
      icon: Flame,
      gradient: 'from-orange-500 to-red-500',
      bg: 'bg-orange-50'
    },
    {
      label: 'Tokens Earned',
      value: stats.totalTokens || 0,
      icon: Coins,
      gradient: 'from-amber-500 to-yellow-500',
      bg: 'bg-amber-50'
    },
    {
      label: 'Hours Learned',
      value: stats.hoursLearned || 0,
      icon: Clock,
      gradient: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-50'
    },
    {
      label: 'Achievements',
      value: stats.achievements || 0,
      icon: Target,
      gradient: 'from-pink-500 to-rose-500',
      bg: 'bg-pink-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <GradientCard className="p-4 text-center" variant="glass">
              <div className={`w-12 h-12 rounded-xl ${item.bg} mx-auto mb-3 flex items-center justify-center`}>
                <Icon className={`w-6 h-6 bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`} 
                  style={{ color: item.gradient.includes('blue') ? '#3b82f6' : 
                          item.gradient.includes('emerald') ? '#10b981' :
                          item.gradient.includes('orange') ? '#f97316' :
                          item.gradient.includes('amber') ? '#f59e0b' :
                          item.gradient.includes('violet') ? '#8b5cf6' : '#ec4899' }} 
                />
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
              </div>
              <div className="text-xs text-slate-500">{item.label}</div>
            </GradientCard>
          </motion.div>
        );
      })}
    </div>
  );
}


import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Play, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import GradientCard from "@/components/ui/GradientCard";

export default function ContinueLearning({ enrollments, courses }) {
  const activeEnrollments = enrollments
    .filter(e => e.status === 'active' && e.progress_percent < 100)
    .slice(0, 3);

  if (activeEnrollments.length === 0) {
    return (
      <GradientCard variant="gradient" className="text-center py-12">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Start Your Learning Journey</h3>
        <p className="text-slate-600 mb-6">Explore courses and begin earning tokens today!</p>
        <Link to={createPageUrl('Courses')}>
          <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
            Browse Courses <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </GradientCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Continue Learning</h2>
        <Link to={createPageUrl('MyCourses')} className="text-sm text-violet-600 hover:text-violet-700 font-medium">
          View All
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {activeEnrollments.map((enrollment, idx) => {
          const course = courses.find(c => c.id === enrollment.course_id);
          if (!course) return null;

          return (
            <motion.div
              key={enrollment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link to={createPageUrl(`Learn?course=${course.id}`)}>
                <GradientCard className="group relative overflow-hidden p-0">
                  <div className="h-32 relative">
                    <img
                      src={course.thumbnail || `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop`}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-violet-600 ml-1" />
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-semibold text-white text-sm line-clamp-1">{course.title}</h3>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{enrollment.progress_percent || 0}% complete</span>
                      <span className="text-violet-600 font-medium">
                        {enrollment.completed_lessons?.length || 0}/{course.lesson_count} lessons
                      </span>
                    </div>
                    <Progress 
                      value={enrollment.progress_percent || 0} 
                      className="h-2 bg-slate-100"
                    />
                  </div>
                </GradientCard>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}


archievements/

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Zap, Star, Award, Users } from 'lucide-react';
import { format } from 'date-fns';

const iconMap = {
  course_complete: Trophy,
  streak: Flame,
  first_lesson: Zap,
  quiz_master: Star,
  speed_learner: Award,
  community_helper: Users
};

const gradientMap = {
  course_complete: 'from-amber-400 to-orange-500',
  streak: 'from-orange-500 to-red-500',
  first_lesson: 'from-blue-400 to-cyan-500',
  quiz_master: 'from-violet-500 to-purple-500',
  speed_learner: 'from-emerald-400 to-teal-500',
  community_helper: 'from-pink-400 to-rose-500'
};

export default function AchievementCard({ achievement, isNew = false }) {
  const Icon = iconMap[achievement.type] || Trophy;
  const gradient = gradientMap[achievement.type] || 'from-slate-400 to-slate-500';

  return (
    <motion.div
      initial={isNew ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      className="relative group"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity`} />
      
      <div className="relative bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 mb-1">{achievement.title}</h3>
            <p className="text-sm text-slate-500 line-clamp-2">{achievement.description}</p>
            {achievement.earned_at && (
              <p className="text-xs text-slate-400 mt-2">
                Earned {format(new Date(achievement.earned_at), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        </div>

        {isNew && (
          <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-medium rounded-full">
            NEW
          </div>
        )}
      </div>
    </motion.div>
  );
}


|||||

entities/

{
  "name": "Course",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Course title"
    },
    "description": {
      "type": "string",
      "description": "Course description"
    },
    "thumbnail": {
      "type": "string",
      "description": "Course thumbnail URL"
    },
    "pathway": {
      "type": "string",
      "enum": [
        "k12",
        "university",
        "phd"
      ],
      "description": "Learning pathway"
    },
    "category": {
      "type": "string",
      "enum": [
        "mathematics",
        "science",
        "technology",
        "arts",
        "humanities",
        "business",
        "languages"
      ],
      "description": "Course category"
    },
    "difficulty": {
      "type": "string",
      "enum": [
        "beginner",
        "intermediate",
        "advanced",
        "expert"
      ],
      "description": "Difficulty level"
    },
    "duration_hours": {
      "type": "number",
      "description": "Estimated hours to complete"
    },
    "token_reward": {
      "type": "number",
      "description": "Tokens earned upon completion"
    },
    "instructor_name": {
      "type": "string"
    },
    "instructor_avatar": {
      "type": "string"
    },
    "lesson_count": {
      "type": "number"
    },
    "enrolled_count": {
      "type": "number",
      "default": 0
    },
    "rating": {
      "type": "number"
    },
    "is_featured": {
      "type": "boolean",
      "default": false
    }
  },
  "required": [
    "title",
    "pathway",
    "category"
  ]
}




{
  "name": "Lesson",
  "type": "object",
  "properties": {
    "course_id": {
      "type": "string",
      "description": "Reference to course"
    },
    "title": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "order": {
      "type": "number",
      "description": "Lesson order in course"
    },
    "content_type": {
      "type": "string",
      "enum": [
        "video",
        "text",
        "code",
        "quiz"
      ],
      "description": "Type of lesson content"
    },
    "content": {
      "type": "string",
      "description": "Lesson content (markdown, video URL, or JSON for quiz)"
    },
    "video_url": {
      "type": "string"
    },
    "duration_minutes": {
      "type": "number"
    },
    "token_reward": {
      "type": "number",
      "description": "Tokens earned for completing lesson"
    }
  },
  "required": [
    "course_id",
    "title",
    "order",
    "content_type"
  ]
}




{
  "name": "Enrollment",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string"
    },
    "course_id": {
      "type": "string"
    },
    "progress_percent": {
      "type": "number",
      "default": 0
    },
    "completed_lessons": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Array of completed lesson IDs"
    },
    "status": {
      "type": "string",
      "enum": [
        "active",
        "completed",
        "paused"
      ],
      "default": "active"
    },
    "started_at": {
      "type": "string",
      "format": "date-time"
    },
    "completed_at": {
      "type": "string",
      "format": "date-time"
    },
    "certificate_issued": {
      "type": "boolean",
      "default": false
    }
  },
  "required": [
    "user_email",
    "course_id"
  ]
}


{
  "name": "Achievement",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string"
    },
    "type": {
      "type": "string",
      "enum": [
        "course_complete",
        "streak",
        "first_lesson",
        "quiz_master",
        "speed_learner",
        "community_helper"
      ],
      "description": "Achievement type"
    },
    "title": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "icon": {
      "type": "string"
    },
    "course_id": {
      "type": "string",
      "description": "Related course if applicable"
    },
    "earned_at": {
      "type": "string",
      "format": "date-time"
    }
  },
  "required": [
    "user_email",
    "type",
    "title"
  ]
}




{
  "name": "TokenTransaction",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string"
    },
    "amount": {
      "type": "number"
    },
    "type": {
      "type": "string",
      "enum": [
        "earned",
        "spent",
        "bonus"
      ],
      "description": "Transaction type"
    },
    "source": {
      "type": "string",
      "enum": [
        "lesson_complete",
        "course_complete",
        "quiz_perfect",
        "achievement",
        "daily_streak",
        "referral"
      ],
      "description": "Source of tokens"
    },
    "reference_id": {
      "type": "string",
      "description": "ID of related lesson/course/achievement"
    },
    "description": {
      "type": "string"
    }
  },
  "required": [
    "user_email",
    "amount",
    "type"
  ]
}




{
  "name": "ChatMessage",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string"
    },
    "role": {
      "type": "string",
      "enum": [
        "user",
        "assistant"
      ]
    },
    "content": {
      "type": "string"
    },
    "context": {
      "type": "string",
      "description": "Current lesson or course context"
    }
  },
  "required": [
    "user_email",
    "role",
    "content"
  ]
}




{
  "name": "LearningPath",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Learning path name"
    },
    "description": {
      "type": "string"
    },
    "pathway": {
      "type": "string",
      "enum": [
        "k12",
        "university",
        "phd"
      ],
      "description": "Educational level"
    },
    "target_skills": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Skills acquired upon completion"
    },
    "course_sequence": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "course_id": {
            "type": "string"
          },
          "order": {
            "type": "number"
          },
          "prerequisites": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "Course IDs that must be completed first"
          },
          "required": {
            "type": "boolean",
            "default": true
          }
        }
      }
    },
    "estimated_duration_weeks": {
      "type": "number"
    },
    "token_reward_total": {
      "type": "number",
      "description": "Total tokens for completing the entire path"
    },
    "is_published": {
      "type": "boolean",
      "default": false
    },
    "enrollment_count": {
      "type": "number",
      "default": 0
    }
  },
  "required": [
    "title",
    "pathway"
  ]
}



{
  "name": "Cohort",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Cohort identifier"
    },
    "course_id": {
      "type": "string",
      "description": "Associated course"
    },
    "learning_path_id": {
      "type": "string",
      "description": "Optional: part of a learning path"
    },
    "instructor_email": {
      "type": "string",
      "description": "Primary instructor"
    },
    "ta_emails": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Teaching assistants"
    },
    "learner_emails": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Enrolled learners"
    },
    "start_date": {
      "type": "string",
      "format": "date"
    },
    "end_date": {
      "type": "string",
      "format": "date"
    },
    "schedule": {
      "type": "object",
      "properties": {
        "timezone": {
          "type": "string"
        },
        "recurring_sessions": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "day_of_week": {
                "type": "string",
                "enum": [
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                  "sunday"
                ]
              },
              "start_time": {
                "type": "string"
              },
              "duration_minutes": {
                "type": "number"
              }
            }
          }
        }
      }
    },
    "status": {
      "type": "string",
      "enum": [
        "forming",
        "active",
        "completed",
        "archived"
      ],
      "default": "forming"
    },
    "max_learners": {
      "type": "number",
      "default": 30
    },
    "mode": {
      "type": "string",
      "enum": [
        "synchronous",
        "asynchronous",
        "hybrid"
      ],
      "default": "hybrid"
    }
  },
  "required": [
    "name",
    "course_id",
    "instructor_email"
  ]
}




{
  "name": "ClassSession",
  "type": "object",
  "properties": {
    "cohort_id": {
      "type": "string",
      "description": "Associated cohort"
    },
    "session_type": {
      "type": "string",
      "enum": [
        "lecture",
        "lab",
        "discussion",
        "review",
        "exam",
        "office_hours"
      ],
      "description": "Type of class session"
    },
    "title": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "scheduled_start": {
      "type": "string",
      "format": "date-time"
    },
    "scheduled_end": {
      "type": "string",
      "format": "date-time"
    },
    "actual_start": {
      "type": "string",
      "format": "date-time"
    },
    "actual_end": {
      "type": "string",
      "format": "date-time"
    },
    "room_url": {
      "type": "string",
      "description": "BuildSpaces room URL for live session"
    },
    "recording_url": {
      "type": "string",
      "description": "Recording for async viewing"
    },
    "attendance": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "user_email": {
            "type": "string"
          },
          "attended": {
            "type": "boolean"
          },
          "duration_minutes": {
            "type": "number"
          },
          "participation_score": {
            "type": "number",
            "description": "0-100 engagement metric"
          }
        }
      }
    },
    "materials": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string"
          },
          "url": {
            "type": "string"
          },
          "type": {
            "type": "string",
            "enum": [
              "slides",
              "document",
              "code",
              "video",
              "link"
            ]
          }
        }
      }
    },
    "status": {
      "type": "string",
      "enum": [
        "scheduled",
        "in_progress",
        "completed",
        "cancelled"
      ],
      "default": "scheduled"
    }
  },
  "required": [
    "cohort_id",
    "session_type",
    "title",
    "scheduled_start",
    "scheduled_end"
  ]
}




{
  "name": "AssessmentAttempt",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string",
      "description": "Learner taking the assessment"
    },
    "course_id": {
      "type": "string"
    },
    "lesson_id": {
      "type": "string"
    },
    "assessment_type": {
      "type": "string",
      "enum": [
        "quiz",
        "exam",
        "assignment",
        "project",
        "peer_review"
      ],
      "description": "Type of assessment"
    },
    "questions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "question_id": {
            "type": "string"
          },
          "question_text": {
            "type": "string"
          },
          "question_type": {
            "type": "string",
            "enum": [
              "multiple_choice",
              "short_answer",
              "essay",
              "code"
            ]
          },
          "response": {
            "type": "string"
          },
          "correct_answer": {
            "type": "string"
          },
          "points_earned": {
            "type": "number"
          },
          "points_possible": {
            "type": "number"
          },
          "feedback": {
            "type": "string"
          }
        }
      }
    },
    "started_at": {
      "type": "string",
      "format": "date-time"
    },
    "submitted_at": {
      "type": "string",
      "format": "date-time"
    },
    "time_limit_minutes": {
      "type": "number"
    },
    "score": {
      "type": "number",
      "description": "Percentage score 0-100"
    },
    "total_points_earned": {
      "type": "number"
    },
    "total_points_possible": {
      "type": "number"
    },
    "status": {
      "type": "string",
      "enum": [
        "in_progress",
        "submitted",
        "graded",
        "needs_review"
      ],
      "default": "in_progress"
    },
    "graded_by": {
      "type": "string",
      "description": "Email of grader or 'AI' for auto-graded"
    },
    "graded_at": {
      "type": "string",
      "format": "date-time"
    },
    "integrity_checks": {
      "type": "object",
      "properties": {
        "browser_focus_lost_count": {
          "type": "number"
        },
        "ip_changes": {
          "type": "number"
        },
        "suspicious_behaviors": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "proctoring_enabled": {
          "type": "boolean"
        },
        "plagiarism_check_score": {
          "type": "number",
          "description": "0-100, higher = more suspicious"
        }
      }
    },
    "attempt_number": {
      "type": "number",
      "default": 1
    },
    "is_passed": {
      "type": "boolean"
    }
  },
  "required": [
    "user_email",
    "course_id",
    "assessment_type"
  ]
}




{
  "name": "VerifiableCredential",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string",
      "description": "Credential holder"
    },
    "credential_type": {
      "type": "string",
      "enum": [
        "course_completion",
        "program_completion",
        "skill_badge",
        "degree",
        "certificate",
        "micro_credential"
      ],
      "description": "Type of credential"
    },
    "title": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "issuer": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "default": "Azora Sapiens"
        },
        "url": {
          "type": "string"
        },
        "logo": {
          "type": "string"
        }
      }
    },
    "issued_date": {
      "type": "string",
      "format": "date-time"
    },
    "expiry_date": {
      "type": "string",
      "format": "date-time"
    },
    "course_id": {
      "type": "string"
    },
    "learning_path_id": {
      "type": "string"
    },
    "evidence": {
      "type": "object",
      "properties": {
        "assessment_attempts": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "IDs of assessment attempts"
        },
        "final_score": {
          "type": "number"
        },
        "hours_invested": {
          "type": "number"
        },
        "projects_completed": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    },
    "skills_demonstrated": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "credential_id": {
      "type": "string",
      "description": "Unique verifiable ID"
    },
    "verification_url": {
      "type": "string",
      "description": "Public URL to verify this credential"
    },
    "blockchain_anchor": {
      "type": "object",
      "properties": {
        "enabled": {
          "type": "boolean"
        },
        "transaction_hash": {
          "type": "string"
        },
        "network": {
          "type": "string"
        }
      }
    },
    "status": {
      "type": "string",
      "enum": [
        "active",
        "revoked",
        "expired"
      ],
      "default": "active"
    },
    "revocation_reason": {
      "type": "string"
    },
    "metadata": {
      "type": "object",
      "properties": {
        "pov_value": {
          "type": "number"
        },
        "azr_minted": {
          "type": "number"
        }
      }
    }
  },
  "required": [
    "user_email",
    "credential_type",
    "title",
    "issued_date"
  ]
}



{
  "name": "ResearchProject",
  "type": "object",
  "properties": {
    "title": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "research_area": {
      "type": "string",
      "enum": [
        "computer_science",
        "mathematics",
        "physics",
        "biology",
        "chemistry",
        "engineering",
        "social_sciences",
        "humanities",
        "interdisciplinary"
      ]
    },
    "principal_investigator": {
      "type": "string",
      "description": "Email of faculty/senior researcher"
    },
    "team_members": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "user_email": {
            "type": "string"
          },
          "role": {
            "type": "string",
            "enum": [
              "lead_researcher",
              "researcher",
              "assistant",
              "contributor"
            ]
          }
        }
      }
    },
    "status": {
      "type": "string",
      "enum": [
        "proposal",
        "approved",
        "in_progress",
        "completed",
        "published",
        "archived"
      ],
      "default": "proposal"
    },
    "start_date": {
      "type": "string",
      "format": "date"
    },
    "end_date": {
      "type": "string",
      "format": "date"
    },
    "datasets_used": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "source": {
            "type": "string"
          },
          "license": {
            "type": "string"
          },
          "url": {
            "type": "string"
          }
        }
      }
    },
    "outputs": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "enum": [
              "paper",
              "thesis",
              "presentation",
              "code",
              "dataset",
              "model"
            ]
          },
          "title": {
            "type": "string"
          },
          "url": {
            "type": "string"
          },
          "publication_date": {
            "type": "string",
            "format": "date"
          }
        }
      }
    },
    "ethics_approval": {
      "type": "object",
      "properties": {
        "required": {
          "type": "boolean"
        },
        "approved": {
          "type": "boolean"
        },
        "approval_date": {
          "type": "string",
          "format": "date"
        },
        "irb_reference": {
          "type": "string"
        }
      }
    },
    "funding": {
      "type": "object",
      "properties": {
        "amount": {
          "type": "number"
        },
        "source": {
          "type": "string"
        },
        "grant_id": {
          "type": "string"
        }
      }
    },
    "visibility": {
      "type": "string",
      "enum": [
        "private",
        "institution",
        "public"
      ],
      "default": "private"
    }
  },
  "required": [
    "title",
    "research_area",
    "principal_investigator"
  ]
}


{
  "name": "KnowledgeNode",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Concept or skill name"
    },
    "description": {
      "type": "string"
    },
    "node_type": {
      "type": "string",
      "enum": [
        "concept",
        "skill",
        "topic",
        "objective"
      ],
      "description": "Type of knowledge node"
    },
    "domain": {
      "type": "string",
      "enum": [
        "mathematics",
        "science",
        "technology",
        "arts",
        "humanities",
        "business",
        "languages"
      ],
      "description": "Academic domain"
    },
    "difficulty_level": {
      "type": "number",
      "description": "1-10 difficulty scale"
    },
    "prerequisites": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "IDs of prerequisite knowledge nodes"
    },
    "related_nodes": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Related concepts for cross-domain learning"
    },
    "course_ids": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Courses that teach this concept"
    },
    "lesson_ids": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Lessons covering this node"
    },
    "mastery_criteria": {
      "type": "object",
      "properties": {
        "min_score": {
          "type": "number",
          "description": "Minimum assessment score for mastery"
        },
        "practice_problems": {
          "type": "number",
          "description": "Required practice problems"
        },
        "peer_reviews": {
          "type": "number",
          "description": "Peer review participation"
        }
      }
    },
    "resources": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "title": {
            "type": "string"
          },
          "url": {
            "type": "string"
          },
          "type": {
            "type": "string",
            "enum": [
              "article",
              "video",
              "book",
              "interactive"
            ]
          }
        }
      }
    }
  },
  "required": [
    "title",
    "node_type",
    "domain"
  ]
}


{
  "name": "LearnerMastery",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string",
      "description": "Learner"
    },
    "knowledge_node_id": {
      "type": "string",
      "description": "Reference to KnowledgeNode"
    },
    "mastery_level": {
      "type": "number",
      "description": "0-100 mastery score"
    },
    "confidence_score": {
      "type": "number",
      "description": "0-100 self-reported confidence"
    },
    "assessment_scores": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "attempt_id": {
            "type": "string"
          },
          "score": {
            "type": "number"
          },
          "date": {
            "type": "string",
            "format": "date-time"
          }
        }
      }
    },
    "practice_count": {
      "type": "number",
      "default": 0,
      "description": "Number of practice problems completed"
    },
    "first_encountered": {
      "type": "string",
      "format": "date-time"
    },
    "last_practiced": {
      "type": "string",
      "format": "date-time"
    },
    "mastery_achieved_date": {
      "type": "string",
      "format": "date-time"
    },
    "status": {
      "type": "string",
      "enum": [
        "not_started",
        "learning",
        "practicing",
        "mastered",
        "needs_review"
      ],
      "default": "not_started"
    },
    "time_spent_minutes": {
      "type": "number",
      "default": 0
    },
    "ai_recommendations": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "AI-generated learning recommendations"
    }
  },
  "required": [
    "user_email",
    "knowledge_node_id"
  ]
}


{
  "name": "ConstitutionalAuditLog",
  "type": "object",
  "properties": {
    "event_type": {
      "type": "string",
      "enum": [
        "ai_interaction",
        "credential_issued",
        "data_access",
        "pov_awarded",
        "assessment_graded",
        "content_moderation",
        "privacy_action",
        "security_event"
      ],
      "description": "Type of constitutional event"
    },
    "user_email": {
      "type": "string",
      "description": "User involved in the event"
    },
    "ai_agent": {
      "type": "string",
      "description": "AI agent if applicable (e.g., Elara, ResearchAssistant)"
    },
    "action_description": {
      "type": "string",
      "description": "Human-readable description of the action"
    },
    "constitutional_principles": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Which constitutional principles were invoked"
    },
    "alignment_score": {
      "type": "number",
      "description": "0-100 score of constitutional alignment"
    },
    "truth_score": {
      "type": "number",
      "description": "0-100 truth verification score"
    },
    "ubuntu_score": {
      "type": "number",
      "description": "0-100 Ubuntu philosophy alignment"
    },
    "context": {
      "type": "object",
      "properties": {
        "course_id": {
          "type": "string"
        },
        "lesson_id": {
          "type": "string"
        },
        "cohort_id": {
          "type": "string"
        },
        "session_id": {
          "type": "string"
        }
      }
    },
    "input_data": {
      "type": "string",
      "description": "User input or query"
    },
    "output_data": {
      "type": "string",
      "description": "AI response or system output"
    },
    "flagged": {
      "type": "boolean",
      "default": false,
      "description": "Flagged for human review"
    },
    "flag_reason": {
      "type": "string"
    },
    "reviewed_by": {
      "type": "string",
      "description": "Email of human reviewer if applicable"
    },
    "review_outcome": {
      "type": "string",
      "enum": [
        "approved",
        "rejected",
        "corrected",
        "escalated"
      ]
    },
    "metadata": {
      "type": "object",
      "properties": {
        "ip_address": {
          "type": "string"
        },
        "user_agent": {
          "type": "string"
        },
        "session_id": {
          "type": "string"
        }
      }
    }
  },
  "required": [
    "event_type",
    "action_description"
  ]
}




|||||||||||||||||||||||||||||||


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, BookOpen, GraduationCap, Trophy, Coins,
  Menu, X, LogOut, User, ChevronDown, Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import TokenBadge from "@/components/ui/TokenBadge";

const navItems = [
  { name: 'Home', path: 'Home', icon: Home },
  { name: 'Courses', path: 'Courses', icon: BookOpen },
  { name: 'My Learning', path: 'MyCourses', icon: GraduationCap },
  { name: 'Achievements', path: 'Achievements', icon: Trophy },
  { name: 'Wallet', path: 'Wallet', icon: Coins },
];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(async (userData) => {
      setUser(userData);
      const transactions = await base44.entities.TokenTransaction.filter({ user_email: userData.email });
      const total = transactions.reduce((sum, t) => sum + (t.type === 'earned' || t.type === 'bonus' ? t.amount : -t.amount), 0);
      setTokens(total);
    }).catch(() => {});
  }, []);

  const isActive = (path) => currentPageName === path;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-slate-900 text-lg">Sapiens Academy</h1>
                <p className="text-xs text-emerald-600 font-medium">BY AZORA</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={createPageUrl(item.path)}>
                    <Button
                      variant={isActive(item.path) ? "secondary" : "ghost"}
                      className={`gap-2 ${isActive(item.path) ? 'bg-violet-100 text-violet-700' : ''}`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {user && (
                <Link to={createPageUrl('Wallet')} className="hidden sm:block">
                  <TokenBadge amount={tokens} />
                </Link>
              )}

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                        {user.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                      </div>
                      <span className="hidden md:inline text-sm font-medium">
                        {user.full_name || user.email}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="font-medium text-slate-900">{user.full_name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('MyCourses')} className="cursor-pointer">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        My Learning
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Achievements')} className="cursor-pointer">
                        <Trophy className="w-4 h-4 mr-2" />
                        Achievements
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Wallet')} className="cursor-pointer">
                        <Coins className="w-4 h-4 mr-2" />
                        Wallet
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Profile')} className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl('AdminPanel')} className="cursor-pointer">
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => base44.auth.logout()}
                      className="text-red-600 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                >
                  Sign In
                </Button>
              )}

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="font-bold text-slate-900">Sapiens Academy</h2>
                        <p className="text-xs text-emerald-600 font-medium">BY AZORA</p>
                      </div>
                    </div>

                    {user && (
                      <div className="mb-6">
                        <TokenBadge amount={tokens} size="lg" />
                      </div>
                    )}

                    <nav className="flex-1 space-y-2">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link 
                            key={item.path} 
                            to={createPageUrl(item.path)}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Button
                              variant={isActive(item.path) ? "secondary" : "ghost"}
                              className={`w-full justify-start gap-3 ${isActive(item.path) ? 'bg-violet-100 text-violet-700' : ''}`}
                            >
                              <Icon className="w-5 h-5" />
                              {item.name}
                            </Button>
                          </Link>
                        );
                      })}
                    </nav>

                    {user ? (
                      <Button 
                        variant="outline" 
                        className="mt-auto text-red-600 border-red-200"
                        onClick={() => base44.auth.logout()}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    ) : (
                      <Button 
                        className="mt-auto bg-gradient-to-r from-violet-600 to-indigo-600"
                        onClick={() => base44.auth.redirectToLogin()}
                      >
                        Sign In
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">Sapiens Academy</h3>
                  <p className="text-xs text-emerald-600 font-medium">BY AZORA</p>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Constitutional AI-powered education. "I am because we are" - Ubuntu philosophy in action.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Pathways</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to={createPageUrl('Courses?pathway=k12')} className="hover:text-white transition-colors">K-12</Link></li>
                <li><Link to={createPageUrl('Courses?pathway=university')} className="hover:text-white transition-colors">University</Link></li>
                <li><Link to={createPageUrl('Courses?pathway=phd')} className="hover:text-white transition-colors">PhD</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-emerald-400 mb-2">
              <Shield className="w-4 h-4" />
              <span>Powered by Constitutional AI</span>
            </div>
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} Sapiens Academy by Azora ES (Pty) Ltd. All rights reserved.
            </p>
            <p className="text-xs text-slate-500 mt-1 italic">
              "Ngiyakwazi ngoba sikwazi" - I can because we can
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}