'use client';

import { AppLayout, AccessibleCard, GradientText, Button } from '@azora/shared-design';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Target, Clock, Users, Award, TrendingUp, Play, Sparkles } from 'lucide-react';
import { learningPaths, LearningPath } from '../../lib/learning-paths-data';
import { useState } from 'react';

export default function LearningPathsPage() {
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [generating, setGenerating] = useState(false);
  const [personalizedPath, setPersonalizedPath] = useState<any>(null);

  const handleGeneratePath = async (path: LearningPath) => {
    setSelectedPath(path);
    setGenerating(true);
    try {
      // In a real app, you'd get the user's profile and auth token
      const mockStudentProfile = {
        currentLevel: 'beginner',
        interests: path.skills.slice(0, 3),
        learningStyle: 'visual',
      };

      const response = await fetch('http://localhost:4003/api/learning-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-jwt-token', // Replace with real auth
        },
        body: JSON.stringify({
          goal: path.goal,
          subject: path.title,
          targetLevel: path.difficulty.toLowerCase(),
          timeframe: parseInt(path.duration) || 4, // months
          studentProfile: mockStudentProfile,
          useAiGenerator: true,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setPersonalizedPath(result.data);
      } else {
        console.error('Failed to generate path:', result.error);
      }
    } catch (error) {
      console.error('Error generating path:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleEnroll = (pathId: string) => {
    // Navigate to education service or trigger enrollment
    router.push(`/education/enroll?pathId=${pathId}`);
  };

  const handleStartStudy = (pathId: string) => {
    // Navigate to studyspaces to create/join a study room
    router.push(`/studyspaces/create?pathId=${pathId}`);
  };

  return (
    <AppLayout appName="Azora Master" userName="Student">
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-2">
            <GradientText>Ubuntu Learning Paths</GradientText>
          </h1>
          <p className="text-gray-400">Personalized learning journeys aligned with your goals and Ubuntu values</p>
        </motion.div>

        {/* Personalized Path Result */}
        {personalizedPath && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <AccessibleCard className="p-6 border-purple-500/30 bg-purple-500/5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Your Personalized Path</h3>
                    <p className="text-gray-400">
                      Generated via {personalizedPath.source} • {personalizedPath.estimatedDuration} months
                    </p>
                    {personalizedPath.aiMeta?.used && (
                      <p className="text-xs text-purple-400 mt-1">
                        AI-enhanced with GPT-4 at {new Date(personalizedPath.aiMeta.generatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Milestones</h4>
                      <ul className="space-y-1 text-sm text-gray-300">
                        {personalizedPath.milestones?.slice(0, 3).map((milestone: any, i: number) => (
                          <li key={i} className="flex items-center gap-2">
                            <Target className="h-3 w-3 text-purple-400" />
                            {milestone.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Resources</h4>
                      <div className="space-y-1 text-sm text-gray-300">
                        <div>Videos: {personalizedPath.resources?.videos || 0}</div>
                        <div>Readings: {personalizedPath.resources?.readings || 0}</div>
                        <div>Projects: {personalizedPath.resources?.projects || 0}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" onClick={() => handleEnroll(personalizedPath.id || 'generated')}>
                      Enroll in Education
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleStartStudy(personalizedPath.id || 'generated')}>
                      Start Study Room
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPersonalizedPath(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </AccessibleCard>
          </motion.div>
        )}

        {/* Learning Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningPaths.map((path, i) => (
            <motion.div key={path.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (i * 0.05) }}>
              <AccessibleCard className="p-6 hover:border-purple-500/30 transition-colors">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          <BookOpen className="h-5 w-5 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold">{path.title}</h3>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{path.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300">
                          {path.difficulty}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {path.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {path.azrReward.toLocaleString()} AZR
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Enrollments</span>
                      <span className="font-bold">{path.enrollments.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Completion Rate</span>
                      <span className="font-bold">{path.completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${path.completionRate}%` }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-gray-400">Key Skills</div>
                    <div className="flex flex-wrap gap-1">
                      {path.skills.slice(0, 4).map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-800 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                      {path.skills.length > 4 && (
                        <span className="px-2 py-1 bg-gray-800 rounded text-xs">
                          +{path.skills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleGeneratePath(path)}
                      disabled={generating && selectedPath?.id === path.id}
                    >
                      {generating && selectedPath?.id === path.id ? (
                        <>Generating...</>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-1" />
                          Generate My Path
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEnroll(path.id)}>
                      Enroll
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleStartStudy(path.id)}>
                      Study Room
                    </Button>
                  </div>
                </div>
              </AccessibleCard>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
