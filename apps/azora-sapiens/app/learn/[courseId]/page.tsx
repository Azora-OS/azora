'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { UbuntuServices, useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

// Elara Canvas Tool Components
import ElaraChalkboard from '../components/elara/ElaraChalkboard';
import ElaraProjector from '../components/elara/ElaraProjector';
import ElaraVisualizer from '../components/elara/ElaraVisualizer';
import ElaraIDE from '../components/elara/ElaraIDE';
import ElaraNoteTaker from '../components/elara/ElaraNoteTaker';
import ElaraWhiteboard from '../components/elara/ElaraWhiteboard';
import ElaraAITutor from '../components/elara/ElaraAITutor';

interface Course {
  id: string;
  title: string;
  category: string;
  subject: string;
  level: string;
  tools: string[];
  description: string;
  progress: number;
}

interface ToolConfiguration {
  primaryTools: string[];
  secondaryTools: string[];
  personalizedTools: string[];
  collaborativeFeatures: string[];
  accessibilityTools: string[];
  contentSources: string[];
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'interactive' | 'quiz' | 'simulation';
  duration: string;
  content?: any;
  externalResources?: any[];
}

export default function LearnPage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [toolConfig, setToolConfig] = useState<ToolConfiguration | null>(null);
  const [activeTool, setActiveTool] = useState<string>('chalkboard');
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const ubuntuServices = useUbuntuServices();
  
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCourseAndTools();
  }, [params.courseId]);

  const loadCourseAndTools = async () => {
    try {
      // Load course information
      const courseData = await ubuntuServices.education.getCourse(params.courseId);
      setCourse(courseData.course);

      // Get tool configuration for this course
      const config = getToolConfiguration(courseData.course);
      setToolConfig(config);

      // Load course modules and lessons
      const modulesData = await ubuntuServices.education.getCourseModules(params.courseId);
      setModules(modulesData.modules);

      // Load current lesson
      const lessonData = await ubuntuServices.education.getCurrentLesson(params.courseId, 'demo-student-001');
      setLesson(lessonData.lesson);

    } catch (error) {
      console.error('Error loading course:', error);
      // Fallback data for demo
      const fallbackCourse = {
        id: params.courseId,
        title: 'Ubuntu Philosophy 101',
        category: 'Humanities',
        subject: 'Philosophy',
        level: 'Beginner',
        tools: ['chalkboard', 'noteTaker', 'whiteboard', 'aiTutor'],
        description: 'Learn the principles of Ubuntu philosophy',
        progress: 45
      };
      setCourse(fallbackCourse);
      setToolConfig(getToolConfiguration(fallbackCourse));
      
      // Fallback modules
      setModules([
        {
          id: 'm1',
          title: 'Module 1: Introduction to Ubuntu',
          lessons: [
            { id: 'l1', title: 'Welcome to Ubuntu Philosophy', duration: '15:00', type: 'video' },
            { id: 'l2', title: '"I am because we are" - Core Principles', duration: '20:00', type: 'interactive' },
            { id: 'l3', title: 'Community Discussion', duration: '30:00', type: 'interactive' },
          ]
        }
      ]);
      
      setLesson({
        id: 'l1',
        title: 'Welcome to Ubuntu Philosophy',
        type: 'video',
        duration: '15:00',
        externalResources: [
          { title: 'Ubuntu Origins', source: 'YouTube', url: '#' },
          { title: 'African Philosophy', source: 'Khan Academy', url: '#' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const getToolConfiguration = (course: Course): ToolConfiguration => {
    const toolMap: Record<string, ToolConfiguration> = {
      'STEM': {
        primaryTools: ['visualizer', 'ide', 'simulator', 'chalkboard'],
        secondaryTools: ['noteTaker', 'whiteboard', 'aiTutor', 'collaborativeTools'],
        personalizedTools: ['adaptiveIDE', 'smartSimulator', 'interactiveExercises'],
        collaborativeFeatures: ['peerProgramming', 'sharedWhiteboard', 'communityProjects'],
        accessibilityTools: ['screenReader', 'highContrast', 'keyboardNavigation'],
        contentSources: ['Khan Academy', 'PhET Simulations', 'MIT OpenCourseWare', 'GitHub']
      },
      'Arts': {
        primaryTools: ['chalkboard', 'projector', 'noteTaker', 'whiteboard'],
        secondaryTools: ['visualizer', 'gallery', 'aiTutor', 'collaborativeStudio'],
        personalizedTools: ['artHistoryTimeline', 'musicTheoryTools', 'creativeAssistant'],
        collaborativeFeatures: ['sharedCanvas', 'peerCritique', 'communityGallery'],
        accessibilityTools: ['colorBlindMode', 'largeText', 'audioDescription'],
        contentSources: ['Google Arts & Culture', 'MoMA Learning', 'YouTube Music', 'SoundCloud']
      },
      'Humanities': {
        primaryTools: ['noteTaker', 'chalkboard', 'aiTutor', 'discussionBoard'],
        secondaryTools: ['projector', 'whiteboard', 'visualizer', 'textAnalyzer'],
        personalizedTools: ['conceptMapper', 'writingAssistant', 'researchOrganizer'],
        collaborativeFeatures: ['sharedNotes', 'discussionBoard', 'peerReview'],
        accessibilityTools: ['textToSpeech', 'dyslexicFont', 'readingGuide'],
        contentSources: ['Project Gutenberg', 'Poetry Foundation', 'Stanford Humanities', 'JSTOR']
      },
      'Languages': {
        primaryTools: ['aiTutor', 'noteTaker', 'conversationPartner', 'pronunciationCoach'],
        secondaryTools: ['projector', 'whiteboard', 'visualizer', 'translationTools'],
        personalizedTools: ['adaptiveLearning', 'culturalImmersion', 'conversationPractice'],
        collaborativeFeatures: ['languageExchange', 'peerReview', 'communityPractice'],
        accessibilityTools: ['slowAudio', 'subtitles', 'translation', 'visualCues'],
        contentSources: ['Duolingo', 'BBC Languages', 'OpenCulture', 'YouTube Education']
      },
      'Business': {
        primaryTools: ['whiteboard', 'simulator', 'noteTaker', 'visualizer'],
        secondaryTools: ['projector', 'ide', 'aiTutor', 'collaborativeTools'],
        personalizedTools: ['businessSimulator', 'marketAnalyzer', 'strategyPlanner'],
        collaborativeFeatures: ['teamProjects', 'peerReview', 'communityConsulting'],
        accessibilityTools: ['screenReader', 'highContrast', 'keyboardNavigation'],
        contentSources: ['Harvard Business Review', 'TED Business', 'Khan Academy Business', 'Coursera']
      }
    };

    return toolMap[course.category] || toolMap['Humanities'];
  };

  const renderActiveTool = () => {
    if (!course) return null;

    switch (activeTool) {
      case 'chalkboard':
        return <ElaraChalkboard course={course} lesson={lesson} />;
      case 'projector':
        return <ElaraProjector course={course} lesson={lesson} />;
      case 'visualizer':
        return <ElaraVisualizer course={course} lesson={lesson} />;
      case 'ide':
        return <ElaraIDE course={course} lesson={lesson} />;
      case 'noteTaker':
        return <ElaraNoteTaker course={course} lesson={lesson} />;
      case 'whiteboard':
        return <ElaraWhiteboard course={course} lesson={lesson} />;
      case 'aiTutor':
        return <ElaraAITutor course={course} lesson={lesson} />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="text-6xl mb-4">🛠️</div>
              <h3 className="text-xl font-bold text-white mb-2">Tool Coming Soon</h3>
              <p className="text-gray-400">{getToolDisplayName(activeTool)} is being developed</p>
            </div>
          </div>
        );
    }
          </div>
        </div>
      ),
      visualizer: (
        <div className="h-full flex items-center justify-center bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Elara Visualizer</h3>
            <p className="text-gray-400">3D experiments and data visualization</p>
          </div>
        </div>
      ),
      whiteboard: (
        <div className="h-full flex items-center justify-center bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-white mb-2">Elara Whiteboard</h3>
            <p className="text-gray-400">Collaborative whiteboard for Ubuntu learning</p>
          </div>
        </div>
      ),
      noteTaker: (
        <div className="h-full flex items-center justify-center bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-white mb-2">Elara Note Taker</h3>
            <p className="text-gray-400">AI-powered note organization and sharing</p>
          </div>
        </div>
      ),
      ide: (
        <div className="h-full flex items-center justify-center bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="text-6xl mb-4">💻</div>
            <h3 className="text-xl font-bold text-white mb-2">Elara IDE</h3>
            <p className="text-gray-400">Adaptive code editor for programming courses</p>
          </div>
        </div>
      ),
      simulator: (
        <div className="h-full flex items-center justify-center bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="text-6xl mb-4">🔬</div>
            <h3 className="text-xl font-bold text-white mb-2">Elara Simulator</h3>
            <p className="text-gray-400">Interactive science and math simulations</p>
          </div>
        </div>
      ),
      aiTutor: (
        <div className="h-full flex items-center justify-center bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-white mb-2">Elara AI Tutor</h3>
            <p className="text-gray-400">Ubuntu-aligned AI learning companion</p>
          </div>
        </div>
      )
    };

    return toolComponents[activeTool] || toolComponents.chalkboard;
  };

  if (loading) {
    return (
      <AppLayout appName="Azora Sapiens" userName="Azora Citizen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading Elara Canvas...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!course || !toolConfig) {
    return (
      <AppLayout appName="Azora Sapiens" userName="Azora Citizen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-white mb-2">Course not found</h3>
            <p className="text-gray-400">The course you're looking for doesn't exist</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout appName="Azora Sapiens" userName="Azora Citizen">
      <div className="h-screen flex flex-col bg-gray-900">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => window.history.back()}>
                ← Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">{course.title}</h1>
                <p className="text-gray-400 text-sm">{course.subject} • {course.level}</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Progress:</span>
                <div className="w-32 h-2 bg-gray-700 rounded-full">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <span className="text-green-400 text-sm">{course.progress}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tool Selection */}
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {toolConfig.primaryTools.map((tool) => (
              <Button
                key={tool}
                variant={activeTool === tool ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTool(tool)}
                className="whitespace-nowrap"
              >
                {getToolDisplayName(tool)}
              </Button>
            ))}
            
            {toolConfig.secondaryTools.length > 0 && (
              <>
                <div className="w-px h-6 bg-gray-600"></div>
                {toolConfig.secondaryTools.map((tool) => (
                  <Button
                    key={tool}
                    variant={activeTool === tool ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTool(tool)}
                    className="whitespace-nowrap"
                  >
                    {getToolDisplayName(tool)}
                  </Button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex">
          {/* Tool Panel */}
          <div className="w-full p-4" ref={canvasRef}>
            {renderActiveTool()}
          </div>
        </div>

        {/* Ubuntu Footer */}
        <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-4">
              <span>🌍 Ubuntu Learning</span>
              <span>•</span>
              <span>"I am because we are"</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Elara AI Active</span>
              <span>•</span>
              <span>Community Connected</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function getToolDisplayName(tool: string): string {
  const displayNames: Record<string, string> = {
    chalkboard: '🎨 Chalkboard',
    projector: '📺 Projector',
    visualizer: '📊 Visualizer',
    whiteboard: '🤝 Whiteboard',
    noteTaker: '📝 Notes',
    ide: '💻 IDE',
    simulator: '🔬 Simulator',
    aiTutor: '🤖 AI Tutor',
    adaptiveIDE: '💻 Adaptive IDE',
    smartSimulator: '🔬 Smart Sim',
    digitalCanvas: '🎨 Canvas',
    artHistoryTimeline: '📜 Timeline',
    sharedCanvas: '🤝 Shared Canvas',
    peerCritique: '💬 Peer Review',
    textAnalyzer: '📖 Text Analysis',
    conceptMapper: '🗺️ Concept Map',
    sharedNotes: '📝 Shared Notes',
    discussionBoard: '💬 Discussion',
    pronunciationCoach: '🗣️ Pronunciation',
    conversationPartner: '👥 Conversation',
    languageExchange: '🌍 Exchange',
    peerReview: '👀 Peer Review'
  };
  
  return displayNames[tool] || tool;
}
            ]
        }
    ]
};

export default function CourseViewerPage({ params }: { params: { courseId: string } }) {
    const [activeLesson, setActiveLesson] = useState(COURSE_CONTENT.modules[0].lessons[2]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(450); // 7:30 in seconds
    const audioRef = useRef<HTMLAudioElement>(null);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
            {/* Header */}
            <header className="h-16 bg-[#1e293b] border-b border-white/10 flex items-center justify-between px-4 z-20">
                <div className="flex items-center gap-4">
                    <Link href="/my-courses" className="text-blue-300 hover:text-white">
                        ← Back
                    </Link>
                    <h1 className="font-bold truncate">{COURSE_CONTENT.title}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:block text-sm text-blue-300">
                        Progress: 35%
                    </div>
                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden hidden md:block">
                        <div className="h-full bg-green-500 w-[35%]" />
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-black relative">
                    <div className="aspect-video w-full bg-black flex items-center justify-center">
                        {activeLesson.type === 'video' ? (
                            <div className="text-center w-full px-4">
                                <div className="text-6xl mb-4">🎧</div>
                                <h2 className="text-2xl font-bold mb-2">{activeLesson.title}</h2>
                                <p className="text-blue-300 mb-8">Audio Lesson by Elara AI</p>

                                {/* Audio Player */}
                                {activeLesson.hasAudio && (
                                    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/30 backdrop-blur-lg">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={togglePlay}
                                                className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                                            >
                                                <span className="text-2xl">{isPlaying ? '⏸️' : '▶️'}</span>
                                            </button>
                                            <div className="flex-1">
                                                <div className="text-sm text-purple-200 mb-2 font-medium">Narrated by Elara</div>
                                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                                                        style={{ width: `${(currentTime / duration) * 100}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-xs text-purple-300 mt-1">
                                                    <span>{formatTime(currentTime)}</span>
                                                    <span>{formatTime(duration)}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                                    <span className="text-lg">🔊</span>
                                                </button>
                                                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                                                    <span className="text-lg">⚙️</span>
                                                </button>
                                            </div>
                                        </div>
                                        <audio
                                            ref={audioRef}
                                            src="/audio/sample-lesson.mp3"
                                            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                                            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                                            className="hidden"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="text-6xl mb-4">📝</div>
                                <h2 className="text-2xl font-bold">{activeLesson.title}</h2>
                                <PremiumButton className="mt-4">Start Quiz</PremiumButton>
                            </div>
                        )}
                    </div>

                    <div className="p-8 max-w-4xl mx-auto">
                        <h1 className="text-2xl font-bold mb-4">{activeLesson.title}</h1>
                        <div className="bg-white/5 p-6 rounded-xl border border-white/10 mb-6">
                            <h3 className="font-bold mb-2 text-purple-300">📝 Transcript</h3>
                            <p className="text-blue-200 leading-relaxed">
                                Welcome to this lesson on {activeLesson.title}. In this comprehensive tutorial,
                                we'll explore the fundamental concepts and practical applications.
                                You'll learn through clear explanations, code examples, and hands-on exercises.
                                [Full AI-generated transcript would appear here]
                            </p>
                        </div>

                        <div className="mt-8 flex justify-between">
                            <PremiumButton variant="secondary">Previous Lesson</PremiumButton>
                            <PremiumButton>Next Lesson</PremiumButton>
                        </div>
                    </div>
                </main>

                {/* Sidebar */}
                <aside className={`w-80 bg-[#1e293b] border-l border-white/10 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full absolute right-0 h-full'}`}>
                    <div className="p-4 font-bold border-b border-white/10 flex justify-between items-center">
                        <span>Course Content</span>
                        <button onClick={() => setSidebarOpen(false)} className="md:hidden">✕</button>
                    </div>

                    <div className="p-4 space-y-6">
                        {COURSE_CONTENT.modules.map((module) => (
                            <div key={module.id}>
                                <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider mb-3">
                                    {module.title}
                                </h3>
                                <div className="space-y-1">
                                    {module.lessons.map((lesson) => (
                                        <button
                                            key={lesson.id}
                                            onClick={() => setActiveLesson(lesson)}
                                            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeLesson.id === lesson.id
                                                ? 'bg-blue-600 text-white'
                                                : 'hover:bg-white/5 text-blue-200'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${lesson.completed
                                                ? 'border-green-500 bg-green-500 text-black'
                                                : 'border-blue-400'
                                                }`}>
                                                {lesson.completed && '✓'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium">{lesson.title}</div>
                                                <div className="text-xs opacity-70 flex items-center gap-1">
                                                    {lesson.duration}
                                                    {lesson.hasAudio && <span className="text-purple-400">🎧</span>}
                                                </div>
                                            </div>
                                            <div className="text-xs">
                                                {lesson.type === 'video' ? '📺' : '📝'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
}
