/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

SAPIENS K-12 LEARNING PLATFORM
Complete interactive learning ecosystem for Kindergarten through Grade 12

"Train up a child in the way he should go; even when he is old he will not depart from it." - Proverbs 22:6
*/

'use client';

import React, { useState } from 'react';
import { AgeGroupIDE } from '../components/integrated-ide';
import { 
  FractionVisualizer, 
  EcosystemSimulator, 
  ForceVisualizer, 
  InteractiveGlobe 
} from '../components/interactive-simulations';
import { 
  GraduationCap, 
  Palette, 
  FlaskConical, 
  Code, 
  Globe,
  Calculator,
  BookOpen,
  Sparkles
} from 'lucide-react';

type AgeGroup = 'K-2' | '3-5' | '6-8' | '9-12';
type Subject = 'math' | 'science' | 'coding' | 'geography' | 'language' | 'art';

export default function SapiensK12() {
  const [selectedAge, setSelectedAge] = useState<AgeGroup>('6-8');
  const [selectedSubject, setSelectedSubject] = useState<Subject>('math');
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950 text-white">
      {/* Hero Header */}
      <header className="border-b border-purple-500/30 backdrop-blur-md bg-black/20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <GraduationCap className="w-12 h-12 text-purple-400" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  SAPIENS K-12
                </h1>
                <p className="text-purple-300">Interactive Learning for Every Child</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-purple-400">Powered by</p>
              <p className="font-bold text-purple-300">Constitutional AI + Research-Backed Science</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Mission */}
        <section className="mb-12 text-center">
          <div className="inline-block p-8 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-3xl border border-yellow-500/30 max-w-4xl">
            <h2 className="text-3xl font-bold mb-4 text-yellow-200">
              Making Every Subject Interactive & Fun!
            </h2>
            <p className="text-lg text-yellow-100 mb-2">
              From kindergarten to high school, learn through play, simulations, and AI-powered guidance.
            </p>
            <p className="text-sm text-yellow-300 italic">
              "Train up a child in the way he should go; even when he is old he will not depart from it." - Proverbs 22:6
            </p>
          </div>
        </section>

        {/* Age Group Selector */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold mb-4 text-center">Select Your Grade Level</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { age: 'K-2' as AgeGroup, label: 'Kindergarten - 2nd', emoji: '🎨', color: 'from-pink-600 to-rose-600' },
              { age: '3-5' as AgeGroup, label: '3rd - 5th Grade', emoji: '🎮', color: 'from-purple-600 to-pink-600' },
              { age: '6-8' as AgeGroup, label: '6th - 8th Grade', emoji: '🔬', color: 'from-blue-600 to-purple-600' },
              { age: '9-12' as AgeGroup, label: 'High School', emoji: '🎓', color: 'from-indigo-600 to-blue-600' },
            ].map(({ age, label, emoji, color }) => (
              <button
                key={age}
                onClick={() => setSelectedAge(age)}
                className={`p-6 rounded-2xl transition-all ${
                  selectedAge === age
                    ? `bg-gradient-to-br ${color} scale-105 shadow-lg`
                    : 'bg-gray-800/50 hover:bg-gray-700/50'
                }`}
              >
                <div className="text-5xl mb-2">{emoji}</div>
                <p className="font-bold text-sm">{label}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Subject Selector */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold mb-4 text-center">Choose a Subject</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { subject: 'math' as Subject, label: 'Math', icon: Calculator, color: 'blue' },
              { subject: 'science' as Subject, label: 'Science', icon: FlaskConical, color: 'green' },
              { subject: 'coding' as Subject, label: 'Coding', icon: Code, color: 'purple' },
              { subject: 'geography' as Subject, label: 'Geography', icon: Globe, color: 'cyan' },
              { subject: 'language' as Subject, label: 'Language', icon: BookOpen, color: 'yellow' },
              { subject: 'art' as Subject, label: 'Art', icon: Palette, color: 'pink' },
            ].map(({ subject, label, icon: Icon, color }) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`p-4 rounded-xl transition-all ${
                  selectedSubject === subject
                    ? `bg-${color}-600 scale-105 shadow-lg`
                    : 'bg-gray-800/50 hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-8 h-8 mx-auto mb-2" />
                <p className="font-semibold text-sm">{label}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Learning Content Area */}
        <section className="mb-8">
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-3xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                <span>Interactive Learning Experience</span>
              </h3>
              
              <div className="text-sm">
                <span className="bg-purple-600/50 px-3 py-1 rounded-full">
                  Grade: {selectedAge}
                </span>
                <span className="ml-2 bg-blue-600/50 px-3 py-1 rounded-full">
                  {selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)}
                </span>
              </div>
            </div>

            {/* Coding Subject - Show IDE */}
            {selectedSubject === 'coding' && (
              <div className="min-h-[600px]">
                <AgeGroupIDE ageGroup={selectedAge} />
              </div>
            )}

            {/* Math Subject - Show Simulations */}
            {selectedSubject === 'math' && (
              <div className="space-y-6">
                <FractionVisualizer />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SimulationCard
                    title="Geometry Builder"
                    emoji="📐"
                    description="Build and explore shapes"
                    ageGroup={selectedAge}
                  />
                  <SimulationCard
                    title="Number Line"
                    emoji="➡️"
                    description="Visual number operations"
                    ageGroup={selectedAge}
                  />
                  <SimulationCard
                    title="Algebra Solver"
                    emoji="🧮"
                    description="Visual equation solving"
                    ageGroup={selectedAge}
                  />
                  <SimulationCard
                    title="Graphing Tool"
                    emoji="📊"
                    description="Plot functions and data"
                    ageGroup={selectedAge}
                  />
                </div>
              </div>
            )}

            {/* Science Subject - Show Simulations */}
            {selectedSubject === 'science' && (
              <div className="space-y-6">
                <EcosystemSimulator />
                <ForceVisualizer />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SimulationCard
                    title="Chemistry Lab"
                    emoji="🧪"
                    description="Safe virtual experiments"
                    ageGroup={selectedAge}
                  />
                  <SimulationCard
                    title="Human Body"
                    emoji="🫀"
                    description="Explore anatomy in 3D"
                    ageGroup={selectedAge}
                  />
                  <SimulationCard
                    title="Solar System"
                    emoji="🪐"
                    description="Journey through space"
                    ageGroup={selectedAge}
                  />
                  <SimulationCard
                    title="Plant Growth"
                    emoji="🌱"
                    description="Watch life cycles"
                    ageGroup={selectedAge}
                  />
                </div>
              </div>
            )}

            {/* Geography Subject */}
            {selectedSubject === 'geography' && (
              <div className="space-y-6">
                <InteractiveGlobe />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SimulationCard
                    title="Climate Zones"
                    emoji="🌡️"
                    description="Explore weather patterns"
                    ageGroup={selectedAge}
                  />
                  <SimulationCard
                    title="Countries Quiz"
                    emoji="🗺️"
                    description="Learn world geography"
                    ageGroup={selectedAge}
                  />
                  <SimulationCard
                    title="Landmarks"
                    emoji="🗿"
                    description="Visit famous places"
                    ageGroup={selectedAge}
                  />
                  <SimulationCard
                    title="Ocean Depths"
                    emoji="🌊"
                    description="Dive into the ocean"
                    ageGroup={selectedAge}
                  />
                </div>
              </div>
            )}

            {/* Language Arts Subject */}
            {selectedSubject === 'language' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-yellow-900/50 to-amber-900/50 rounded-2xl p-6 border border-yellow-500/30">
                  <h4 className="text-xl font-bold mb-4">📚 Interactive Reading & Writing</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-black/30 rounded-xl p-6">
                      <h5 className="font-bold mb-3">Today's Story</h5>
                      <p className="text-sm text-gray-300 mb-4">
                        The brave little turtle embarked on an adventure across the ocean...
                      </p>
                      <button className="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded-lg w-full">
                        Continue Reading
                      </button>
                    </div>
                    <div className="bg-black/30 rounded-xl p-6">
                      <h5 className="font-bold mb-3">Creative Writing</h5>
                      <textarea 
                        className="w-full h-32 bg-gray-900 rounded-lg p-3 text-sm"
                        placeholder="Write your own story..."
                      />
                      <button className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg w-full mt-2">
                        Get AI Feedback
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SimulationCard
                    title="Phonics Games"
                    emoji="🔤"
                    description="Learn letter sounds"
                    ageGroup={selectedAge}
                  />
                  <SimulationCard
                    title="Spelling Bee"
                    emoji="🐝"
                    description="Practice spelling"
                    ageGroup={selectedAge}
                  />
                  <SimulationCard
                    title="Grammar"
                    emoji="📝"
                    description="Master grammar rules"
                    ageGroup={selectedAge}
                  />
                  <SimulationCard
                    title="Vocabulary"
                    emoji="📖"
                    description="Build your word power"
                    ageGroup={selectedAge}
                  />
                </div>
              </div>
            )}

            {/* Art Subject */}
            {selectedSubject === 'art' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-pink-900/50 to-rose-900/50 rounded-2xl p-6 border border-pink-500/30">
                  <h4 className="text-xl font-bold mb-4">🎨 Digital Art Studio</h4>
                  <div className="bg-white rounded-xl h-96 mb-4 flex items-center justify-center">
                    <p className="text-gray-500">Canvas Area - Drawing tools will appear here</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-red-600 hover:bg-red-500 py-2 rounded-lg">🖌️ Brush</button>
                    <button className="flex-1 bg-blue-600 hover:bg-blue-500 py-2 rounded-lg">✏️ Pencil</button>
                    <button className="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded-lg">🎨 Fill</button>
                    <button className="flex-1 bg-purple-600 hover:bg-purple-500 py-2 rounded-lg">⭐ Shapes</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SimulationCard
                    title="Color Mixer"
                    emoji="🌈"
                    description="Mix colors and learn"
                    ageGroup={selectedAge}
                  />
                  <SimulationCard
                    title="3D Sculptor"
                    emoji="🗿"
                    description="Virtual clay modeling"
                    ageGroup={selectedAge}
                  />
                  <SimulationCard
                    title="Animation"
                    emoji="🎬"
                    description="Create animations"
                    ageGroup={selectedAge}
                  />
                  <SimulationCard
                    title="Art History"
                    emoji="🖼️"
                    description="Tour famous artworks"
                    ageGroup={selectedAge}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* AI Tutor Section */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/30">
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <span>🤖 AI Tutor Always Available</span>
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-black/30 rounded-xl p-4">
                <p className="text-sm text-purple-300 mb-2">Need help? Ask me anything!</p>
                <input 
                  type="text"
                  placeholder="Type your question here..."
                  className="w-full bg-gray-900 rounded-lg px-4 py-2 text-sm mb-2"
                />
                <button className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg w-full text-sm">
                  Ask Tutor
                </button>
              </div>
              
              <div className="bg-black/30 rounded-xl p-4">
                <p className="text-sm text-green-300 mb-2">✨ Smart Features:</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>✓ Explains concepts in simple terms</li>
                  <li>✓ Gives hints, not answers (Socratic method)</li>
                  <li>✓ Adapts to your learning pace</li>
                  <li>✓ Available 24/7 in 11+ languages</li>
                  <li>✓ 100% safe and constitutional AI</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Progress & Achievements */}
        <section>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-500/20">
              <h4 className="font-bold mb-2">📈 Your Progress</h4>
              <p className="text-3xl font-bold text-green-400 mb-1">67%</p>
              <p className="text-xs text-green-300">3 lessons completed today!</p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-900/30 to-amber-900/30 rounded-xl p-6 border border-yellow-500/20">
              <h4 className="font-bold mb-2">🔥 Streak</h4>
              <p className="text-3xl font-bold text-yellow-400 mb-1">12 Days</p>
              <p className="text-xs text-yellow-300">Keep it going!</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/20">
              <h4 className="font-bold mb-2">🏆 Achievements</h4>
              <div className="flex space-x-2">
                <span className="text-2xl">🎓</span>
                <span className="text-2xl">⭐</span>
                <span className="text-2xl">🚀</span>
                <span className="text-2xl opacity-30">🏅</span>
              </div>
              <p className="text-xs text-purple-300 mt-2">3 badges earned!</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-500/30 bg-black/20 mt-16">
        <div className="container mx-auto px-6 py-8 text-center">
          <p className="text-purple-300 mb-2">
            "Train up a child in the way he should go" - Proverbs 22:6
          </p>
          <p className="text-sm text-purple-400">
            Sapiens K-12 | Interactive Learning | From Africa 🇿🇦 For Every Child 🌍
          </p>
          <p className="text-xs text-purple-500 mt-2">
            Research-backed • Constitutional AI • 100% Safe for Children
          </p>
        </div>
      </footer>
    </div>
  );
}

// Helper Component
function SimulationCard({ 
  title, 
  emoji, 
  description, 
  ageGroup 
}: { 
  title: string; 
  emoji: string; 
  description: string; 
  ageGroup: AgeGroup;
}) {
  return (
    <button className="bg-gray-800/50 hover:bg-gray-700/50 rounded-xl p-4 text-left transition-all hover:scale-105">
      <div className="text-4xl mb-2">{emoji}</div>
      <h5 className="font-bold text-sm mb-1">{title}</h5>
      <p className="text-xs text-gray-400">{description}</p>
      <span className="inline-block mt-2 text-xs bg-purple-600/30 px-2 py-1 rounded-full">
        {ageGroup}
      </span>
    </button>
  );
}
