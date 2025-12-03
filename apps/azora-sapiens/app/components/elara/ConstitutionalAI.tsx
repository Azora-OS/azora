'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, Button } from '@azora/shared-design';
import { UbuntuServices, useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

// Constitutional AI Framework
interface ConstitutionalPrinciple {
  id: string;
  principle: string;
  description: string;
  weight: number;
  examples: string[];
}

interface AIAnalysis {
  ubuntuScore: number;
  principleAlignment: Record<string, number>;
  recommendations: string[];
  wisdomInsights: string[];
  communityBenefit: string;
}

interface ConstitutionalAIResponse {
  content: string;
  analysis: AIAnalysis;
  constitutionalBasis: string[];
  ethicalConsiderations: string[];
  ubuntuWisdom: string;
}

export default function ConstitutionalAISystem() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [aiResponse, setAiResponse] = useState<ConstitutionalAIResponse | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<ConstitutionalAIResponse[]>([]);
  const [selectedPrinciples, setSelectedPrinciples] = useState<string[]>([]);
  const ubuntuServices = useUbuntuServices();

  // Ubuntu Constitutional Principles
  const ubuntuConstitution: ConstitutionalPrinciple[] = [
    {
      id: 'community-first',
      principle: 'Community Benefit First',
      description: 'All decisions must prioritize community benefit over individual gain',
      weight: 10,
      examples: [
        'How does this learning benefit the Ubuntu community?',
        'What positive impact does this have on others?',
        'Does this strengthen our collective wisdom?'
      ]
    },
    {
      id: 'shared-wisdom',
      principle: 'Knowledge Sharing',
      description: 'Knowledge should be freely shared and accessible to all community members',
      weight: 9,
      examples: [
        'How can this knowledge help others learn?',
        'Is this accessible to all community members?',
        'Does this promote collective growth?'
      ]
    },
    {
      id: 'collaborative-learning',
      principle: 'Collaborative Learning',
      description: 'Learning is a collaborative endeavor, not a competitive one',
      weight: 8,
      examples: [
        'How can we learn this together?',
        'Does this encourage collaboration?',
        'Is this approach inclusive and supportive?'
      ]
    },
    {
      id: 'human-connection',
      principle: 'Human Connection Enhancement',
      description: 'Technology should enhance human connection, not replace it',
      weight: 9,
      examples: [
        'Does this strengthen human relationships?',
        'Does this technology bring us closer together?',
        'Are we maintaining authentic human connection?'
      ]
    },
    {
      id: 'ubuntu-wisdom',
      principle: 'Ubuntu Wisdom Guidance',
      description: 'All AI decisions must be guided by traditional Ubuntu wisdom',
      weight: 10,
      examples: [
        'What does Ubuntu philosophy teach us about this?',
        'How does this align with "I am because we are"?',
        'Does this honor our ancestral wisdom?'
      ]
    },
    {
      id: 'mutual-support',
      principle: 'Mutual Support',
      description: 'Community members must support each other\'s growth and well-being',
      weight: 8,
      examples: [
        'How does this support others in the community?',
        'Are we creating systems of mutual support?',
        'Does this strengthen our ability to help each other?'
      ]
    },
    {
      id: 'interconnectedness',
      principle: 'Recognition of Interconnectedness',
      description: 'All actions must recognize the interconnected nature of our community',
      weight: 7,
      examples: [
        'How does this action affect the whole community?',
        'Are we considering all impacts on our interconnected network?',
        'Does this honor our interdependence?'
      ]
    },
    {
      id: 'peace-building',
      principle: 'Peace and Harmony',
      description: 'All decisions must contribute to peace and harmony in the community',
      weight: 9,
      examples: [
        'Does this promote peace and understanding?',
        'How does this contribute to community harmony?',
        'Are we building bridges of understanding?'
      ]
    }
  ];

  useEffect(() => {
    // Initialize Constitutional AI
    initializeConstitutionalAI();
  }, []);

  const initializeConstitutionalAI = async () => {
    try {
      if (ubuntuServices) {
        await ubuntuServices.ai.initializeConstitutionalAI({
          constitution: ubuntuConstitution,
          ethicalFramework: 'ubuntu-philosophy',
          oversightLevel: 'community-elders',
          transparencyMode: 'full'
        });
      }
    } catch (error) {
      console.error('Constitutional AI initialization error:', error);
    }
  };

  const analyzeWithConstitutionalAI = async () => {
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    
    try {
      // Generate Constitutional AI response
      const response = await generateConstitutionalResponse(inputText);
      setAiResponse(response);
      setAnalysisHistory(prev => [response, ...prev.slice(0, 9)]); // Keep last 10
      
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateConstitutionalResponse = async (text: string): Promise<ConstitutionalAIResponse> => {
    // Simulate Constitutional AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Calculate Ubuntu scores based on constitutional principles
    const principleAlignment: Record<string, number> = {};
    let totalScore = 0;
    
    ubuntuConstitution.forEach(principle => {
      const alignment = calculatePrincipleAlignment(text, principle);
      principleAlignment[principle.id] = alignment;
      totalScore += alignment * principle.weight;
    });
    
    const ubuntuScore = Math.min(100, totalScore / ubuntuConstitution.reduce((sum, p) => sum + p.weight, 0));

    // Generate recommendations based on analysis
    const recommendations = generateUbuntuRecommendations(text, principleAlignment);
    
    // Generate wisdom insights
    const wisdomInsights = generateWisdomInsights(text, ubuntuScore);
    
    // Determine community benefit
    const communityBenefit = assessCommunityBenefit(text, ubuntuScore);

    return {
      content: generateUbuntuGuidance(text, ubuntuScore),
      analysis: {
        ubuntuScore,
        principleAlignment,
        recommendations,
        wisdomInsights,
        communityBenefit
      },
      constitutionalBasis: getConstitutionalBasis(principleAlignment),
      ethicalConsiderations: getEthicalConsiderations(text, principleAlignment),
      ubuntuWisdom: getRandomUbuntuWisdom(ubuntuScore)
    };
  };

  const calculatePrincipleAlignment = (text: string, principle: ConstitutionalPrinciple): number => {
    const lowerText = text.toLowerCase();
    let score = 50; // Base score
    
    // Check for Ubuntu keywords
    const ubuntuKeywords = ['community', 'ubuntu', 'together', 'we', 'us', 'our', 'collective', 'shared', 'collaboration'];
    ubuntuKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        score += 5;
      }
    });
    
    // Check for principle-specific keywords
    switch (principle.id) {
      case 'community-first':
        if (lowerText.includes('benefit') || lowerText.includes('help') || lowerText.includes('support')) {
          score += 8;
        }
        break;
      case 'shared-wisdom':
        if (lowerText.includes('share') || lowerText.includes('teach') || lowerText.includes('learn')) {
          score += 8;
        }
        break;
      case 'collaborative-learning':
        if (lowerText.includes('together') || lowerText.includes('team') || lowerText.includes('group')) {
          score += 8;
        }
        break;
      case 'human-connection':
        if (lowerText.includes('connect') || lowerText.includes('relationship') || lowerText.includes('human')) {
          score += 8;
        }
        break;
      case 'ubuntu-wisdom':
        if (lowerText.includes('wisdom') || lowerText.includes('philosophy') || lowerText.includes('ancestral')) {
          score += 8;
        }
        break;
    }
    
    return Math.min(100, score);
  };

  const generateUbuntuRecommendations = (text: string, alignment: Record<string, number>): string[] => {
    const recommendations: string[] = [];
    
    if (alignment['community-first'] < 70) {
      recommendations.push('Consider how this learning can benefit the Ubuntu community');
    }
    
    if (alignment['shared-wisdom'] < 70) {
      recommendations.push('Think about how you can share this knowledge with others');
    }
    
    if (alignment['collaborative-learning'] < 70) {
      recommendations.push('Explore ways to learn this together with community members');
    }
    
    if (alignment['human-connection'] < 70) {
      recommendations.push('Ensure this approach strengthens human connections');
    }
    
    if (alignment['ubuntu-wisdom'] < 70) {
      recommendations.push('Reflect on how Ubuntu philosophy guides this learning');
    }
    
    // Add positive reinforcement for high scores
    const highScorePrinciples = Object.entries(alignment)
      .filter(([_, score]) => score >= 80)
      .map(([id, _]) => ubuntuConstitution.find(p => p.id === id)?.principle);
    
    if (highScorePrinciples.length > 0) {
      recommendations.push(`Excellent alignment with: ${highScorePrinciples.join(', ')}`);
    }
    
    return recommendations;
  };

  const generateWisdomInsights = (text: string, score: number): string[] => {
    const insights: string[] = [];
    
    if (score >= 80) {
      insights.push('This approach embodies the essence of Ubuntu philosophy');
      insights.push('Your learning journey strengthens our collective wisdom');
      insights.push('You are living the principle of "I am because we are"');
    } else if (score >= 60) {
      insights.push('You are on the right path toward Ubuntu-aligned learning');
      insights.push('Consider how this approach can serve the community better');
      insights.push('Ubuntu wisdom can guide your learning journey');
    } else {
      insights.push('Ubuntu philosophy offers guidance for your learning path');
      insights.push('Reflect on how this approach can benefit our community');
      insights.push('Remember that individual growth strengthens the whole community');
    }
    
    return insights;
  };

  const assessCommunityBenefit = (text: string, score: number): string => {
    if (score >= 80) {
      return 'This approach has significant positive impact on the Ubuntu community';
    } else if (score >= 60) {
      return 'This approach contributes positively to community growth';
    } else if (score >= 40) {
      return 'This approach has potential community benefit with Ubuntu guidance';
    } else {
      return 'This approach needs Ubuntu philosophy alignment for community benefit';
    }
  };

  const generateUbuntuGuidance = (text: string, score: number): string => {
    if (score >= 80) {
      return `Your approach beautifully embodies Ubuntu principles with a score of ${score}%. You are demonstrating how "I am because we are" guides meaningful learning. Continue sharing this wisdom with our community, as your journey inspires others to walk the Ubuntu path together.`;
    } else if (score >= 60) {
      return `With a Ubuntu alignment score of ${score}%, you are on a meaningful path. Consider how your learning can better serve our collective growth. Ubuntu teaches us that individual enlightenment strengthens the entire community - let your journey be a beacon for others.`;
    } else if (score >= 40) {
      return `Your Ubuntu alignment score is ${score}%. This is an opportunity to deepen your connection to Ubuntu philosophy. Reflect on how "I am because we are" can transform your approach. Our community grows stronger when each member embraces our collective wisdom.`;
    } else {
      return `With a score of ${score}%, let Ubuntu philosophy guide your learning journey. Remember that "I am because we are" - your growth is intrinsically connected to our community's wellbeing. Consider how Ubuntu wisdom can illuminate your path and benefit all members of our community.`;
    }
  };

  const getConstitutionalBasis = (alignment: Record<string, number>): string[] => {
    return ubuntuConstitution
      .filter(principle => alignment[principle.id] >= 70)
      .map(principle => principle.principle);
  };

  const getEthicalConsiderations = (text: string, alignment: Record<string, number>): string[] => {
    const considerations: string[] = [];
    
    if (alignment['community-first'] < 60) {
      considerations.push('Consider the broader community impact of this approach');
    }
    
    if (alignment['shared-wisdom'] < 60) {
      considerations.push('Reflect on how this knowledge can be shared more widely');
    }
    
    if (alignment['human-connection'] < 60) {
      considerations.push('Ensure this approach maintains authentic human connections');
    }
    
    return considerations;
  };

  const getRandomUbuntuWisdom = (score: number): string => {
    const wisdom = [
      "I am because we are - our humanity is defined by our relationships",
      "Alone we can do so little; together we can do so much",
      "The best way to predict the future is to create it together",
      "Knowledge is only meaningful when shared with the community",
      "Your success lifts the entire community",
      "We rise by lifting others",
      "Community is the foundation of all learning",
      "Ubuntu teaches us that our individual growth strengthens the collective"
    ];
    
    return wisdom[Math.floor(Math.random() * wisdom.length)];
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number): string => {
    if (score >= 80) return 'bg-green-900';
    if (score >= 60) return 'bg-yellow-900';
    if (score >= 40) return 'bg-orange-900';
    return 'bg-red-900';
  };

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-white">🧠 Constitutional AI</h3>
            <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">
              Ubuntu Philosophy Active
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Constitution:</span>
            <span className="text-green-400 text-sm font-medium">Ubuntu Principles</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Analysis Area */}
        <div className="flex-1 flex flex-col p-4">
          {/* Input Section */}
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-3">Analyze with Ubuntu Constitutional AI</h4>
            <div className="space-y-3">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your learning content, question, or approach for Ubuntu Constitutional AI analysis..."
                className="w-full h-32 bg-gray-800 text-white px-4 py-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400 text-sm">
                    {inputText.length} characters
                  </span>
                  <span className="text-gray-400 text-sm">
                    Ubuntu analysis ready
                  </span>
                </div>
                
                <Button
                  variant="primary"
                  onClick={analyzeWithConstitutionalAI}
                  disabled={!inputText.trim() || isAnalyzing}
                >
                  {isAnalyzing ? '🧠 Analyzing...' : '🔍 Analyze with Ubuntu AI'}
                </Button>
              </div>
            </div>
          </div>

          {/* AI Response */}
          {aiResponse && (
            <div className="flex-1 space-y-4 overflow-y-auto">
              {/* Ubuntu Score */}
              <div className={`${getScoreBackground(aiResponse.analysis.ubuntuScore)} bg-opacity-20 border border-opacity-30 rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <h5 className={`text-lg font-semibold ${getScoreColor(aiResponse.analysis.ubuntuScore)}`}>
                    Ubuntu Alignment Score
                  </h5>
                  <span className={`text-2xl font-bold ${getScoreColor(aiResponse.analysis.ubuntuScore)}`}>
                    {aiResponse.analysis.ubuntuScore}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-3 mb-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      aiResponse.analysis.ubuntuScore >= 80 ? 'bg-green-400' :
                      aiResponse.analysis.ubuntuScore >= 60 ? 'bg-yellow-400' :
                      aiResponse.analysis.ubuntuScore >= 40 ? 'bg-orange-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${aiResponse.analysis.ubuntuScore}%` }}
                  />
                </div>
                
                <p className="text-gray-300 text-sm">
                  {aiResponse.analysis.communityBenefit}
                </p>
              </div>

              {/* AI Guidance */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h5 className="text-white font-semibold mb-3">🌍 Ubuntu AI Guidance</h5>
                <p className="text-gray-300 leading-relaxed">
                  {aiResponse.content}
                </p>
              </div>

              {/* Constitutional Basis */}
              {aiResponse.constitutionalBasis.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h5 className="text-white font-semibold mb-3">⚖️ Constitutional Basis</h5>
                  <div className="space-y-2">
                    {aiResponse.constitutionalBasis.map((basis, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-gray-300">{basis}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Principle Alignment */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h5 className="text-white font-semibold mb-3">📊 Principle Alignment</h5>
                <div className="space-y-3">
                  {Object.entries(aiResponse.analysis.principleAlignment)
                    .sort(([_, a], [__, b]) => b - a)
                    .slice(0, 5)
                    .map(([principleId, score]) => {
                      const principle = ubuntuConstitution.find(p => p.id === principleId);
                      if (!principle) return null;
                      
                      return (
                        <div key={principleId} className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="text-gray-300 text-sm">{principle.principle}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  score >= 80 ? 'bg-green-400' :
                                  score >= 60 ? 'bg-yellow-400' :
                                  score >= 40 ? 'bg-orange-400' : 'bg-red-400'
                                }`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                              {score}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Recommendations */}
              {aiResponse.analysis.recommendations.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h5 className="text-white font-semibold mb-3">💡 Ubuntu Recommendations</h5>
                  <div className="space-y-2">
                    {aiResponse.analysis.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-green-400 mt-1">→</span>
                        <span className="text-gray-300 text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wisdom Insights */}
              {aiResponse.analysis.wisdomInsights.length > 0 && (
                <div className="bg-green-900 bg-opacity-20 border border-green-800 rounded-lg p-4">
                  <h5 className="text-green-400 font-semibold mb-3">🌟 Ubuntu Wisdom Insights</h5>
                  <div className="space-y-2">
                    {aiResponse.analysis.wisdomInsights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-green-400 mt-1">•</span>
                        <span className="text-green-300 text-sm italic">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ubuntu Wisdom */}
              <div className="bg-purple-900 bg-opacity-20 border border-purple-800 rounded-lg p-4">
                <h5 className="text-purple-400 font-semibold mb-2">🌍 Ubuntu Wisdom</h5>
                <p className="text-purple-300 text-sm italic">
                  "{aiResponse.ubuntuWisdom}"
                </p>
              </div>

              {/* Ethical Considerations */}
              {aiResponse.ethicalConsiderations.length > 0 && (
                <div className="bg-orange-900 bg-opacity-20 border border-orange-800 rounded-lg p-4">
                  <h5 className="text-orange-400 font-semibold mb-3">⚖️ Ethical Considerations</h5>
                  <div className="space-y-2">
                    {aiResponse.ethicalConsiderations.map((consideration, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-orange-400 mt-1">!</span>
                        <span className="text-orange-300 text-sm">{consideration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
          <div className="p-4">
            {/* Ubuntu Constitution */}
            <div className="mb-6">
              <h4 className="text-white font-semibold mb-3">🌍 Ubuntu Constitution</h4>
              <div className="space-y-2">
                {ubuntuConstitution.slice(0, 4).map((principle) => (
                  <div
                    key={principle.id}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      selectedPrinciples.includes(principle.id)
                        ? 'bg-purple-900 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={() => {
                      setSelectedPrinciples(prev =>
                        prev.includes(principle.id)
                          ? prev.filter(p => p !== principle.id)
                          : [...prev, principle.id]
                      );
                    }}
                  >
                    <div className="font-medium text-sm">{principle.principle}</div>
                    <div className="text-xs opacity-75 mt-1">Weight: {principle.weight}/10</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis History */}
            <div>
              <h4 className="text-white font-semibold mb-3">📜 Analysis History</h4>
              <div className="space-y-2">
                {analysisHistory.length === 0 ? (
                  <p className="text-gray-400 text-sm">No analyses yet</p>
                ) : (
                  analysisHistory.map((response, index) => (
                    <div
                      key={index}
                      className="p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
                      onClick={() => setAiResponse(response)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-300 text-sm">Analysis #{analysisHistory.length - index}</span>
                        <span className={`text-sm font-medium ${getScoreColor(response.analysis.ubuntuScore)}`}>
                          {response.analysis.ubuntuScore}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {response.content.substring(0, 50)}...
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <span>🧠 Constitutional AI</span>
            <span>•</span>
            <span>Ubuntu Philosophy Constitution</span>
            <span>•</span>
            <span>Ethical AI Framework</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>AI Oversight Active</span>
            <span>•</span>
            <span>Community Wisdom Integration</span>
          </div>
        </div>
      </div>
    </div>
  );
}
