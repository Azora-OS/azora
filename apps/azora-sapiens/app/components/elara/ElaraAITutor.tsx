'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, Button } from '@azora/shared-design';
import { UbuntuServices, useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

interface ElaraAITutorProps {
  course?: any;
  lesson?: any;
  onProgress?: (progress: number) => void;
}

interface TutorMessage {
  id: string;
  type: 'tutor' | 'student' | 'system';
  content: string;
  timestamp: string;
  ubuntuWisdom?: string;
  suggestedActions?: string[];
  relatedConcepts?: string[];
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  progress: number;
  ubuntuFocus: string;
  nextSteps: string[];
}

interface PersonalizedInsight {
  type: 'strength' | 'improvement' | 'opportunity';
  title: string;
  description: string;
  ubuntuConnection: string;
  actionable: boolean;
}

export default function ElaraAITutor({ course, lesson, onProgress }: ElaraAITutorProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ubuntuMode, setUbuntuMode] = useState(true);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [insights, setInsights] = useState<PersonalizedInsight[]>([]);
  const [showInsights, setShowInsights] = useState(false);
  const [showLearningPath, setShowLearningPath] = useState(false);
  const [tutorPersonality, setTutorPersonality] = useState<'guide' | 'mentor' | 'friend'>('mentor');
  const ubuntuServices = useUbuntuServices();

  // Ubuntu wisdom quotes
  const ubuntuWisdom = [
    "I am because we are - our identity is shaped by our community",
    "Alone we can do so little; together we can do so much",
    "The best way to predict the future is to create it together",
    "Knowledge is only meaningful when shared with the community",
    "Your success lifts the entire community",
    "We rise by lifting others",
    "Community is the foundation of all learning"
  ];

  // Ubuntu teaching principles
  const ubuntuTeachingPrinciples = [
    { principle: "Collaborative Learning", description: "Learn together, grow together" },
    { principle: "Community Impact", description: "Apply knowledge to benefit others" },
    { principle: "Shared Wisdom", description: "Everyone has something valuable to contribute" },
    { principle: "Mutual Support", description: "Help others learn as you learn" },
    { principle: "Collective Growth", description: "Individual success strengthens the community" }
  ];

  useEffect(() => {
    initializeTutor();
    generatePersonalizedInsights();
  }, []);

  useEffect(() => {
    // Auto-scroll to latest message
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const initializeTutor = async () => {
    try {
      // Initialize Ubuntu AI tutor
      if (ubuntuServices) {
        const tutorConfig = await ubuntuServices.education.initializeTutor({
          studentId: 'demo-student-001',
          courseId: course?.id,
          ubuntuMode: ubuntuMode,
          personality: tutorPersonality
        });
        
        setLearningPath(tutorConfig.learningPath);
      }
      
      // Send welcome message
      const welcomeMessage: TutorMessage = {
        id: 'welcome',
        type: 'tutor',
        content: getWelcomeMessage(),
        timestamp: new Date().toISOString(),
        ubuntuWisdom: ubuntuWisdom[0],
        suggestedActions: [
          "Tell me about your learning goals",
          "Show me your current progress",
          "Ask for Ubuntu philosophy guidance",
          "Get personalized learning recommendations"
        ],
        relatedConcepts: ["Ubuntu Philosophy", "Community Learning", "Collaborative Growth"]
      };
      
      setMessages([welcomeMessage]);
      
    } catch (error) {
      console.error('Tutor initialization error:', error);
    }
  };

  const getWelcomeMessage = (): string => {
    const personalityMessages = {
      guide: "Welcome! I'm your Ubuntu AI guide. I'll help you navigate your learning journey with community-focused wisdom and collaborative spirit.",
      mentor: "Greetings! As your Ubuntu AI mentor, I'm here to support your growth while connecting it to our shared community values and collective success.",
      friend: "Hey there! I'm your Ubuntu learning friend! Let's explore this subject together and discover how it can benefit our community."
    };
    
    return personalityMessages[tutorPersonality];
  };

  const generatePersonalizedInsights = async () => {
    try {
      // Mock personalized insights based on Ubuntu principles
      const mockInsights: PersonalizedInsight[] = [
        {
          type: 'strength',
          title: 'Community Collaboration',
          description: 'You excel at working with others and sharing knowledge',
          ubuntuConnection: 'This embodies the Ubuntu principle of collective growth',
          actionable: true
        },
        {
          type: 'improvement',
          title: 'Ubuntu Philosophy Application',
          description: 'Consider how your learning can directly benefit the community',
          ubuntuConnection: 'Ubuntu teaches us that knowledge gains meaning through service',
          actionable: true
        },
        {
          type: 'opportunity',
          title: 'Teach Others',
          description: 'Share your understanding with fellow learners to strengthen the community',
          ubuntuConnection: '"I am because we are" - teaching others deepens your own understanding',
          actionable: true
        }
      ];
      
      setInsights(mockInsights);
      
    } catch (error) {
      console.error('Insights generation error:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const studentMessage: TutorMessage = {
      id: `student-${Date.now()}`,
      type: 'student',
      content: inputText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, studentMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Get AI tutor response
      let response = '';
      
      if (ubuntuServices) {
        const aiResponse = await ubuntuServices.education.getTutorResponse({
          message: inputText,
          context: messages,
          ubuntuMode: ubuntuMode,
          personality: tutorPersonality,
          courseId: course?.id
        });
        
        response = aiResponse.content;
      } else {
        // Fallback to mock response
        response = generateMockResponse(inputText);
      }

      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const tutorMessage: TutorMessage = {
        id: `tutor-${Date.now()}`,
        type: 'tutor',
        content: response,
        timestamp: new Date().toISOString(),
        ubuntuWisdom: getRandomUbuntuWisdom(),
        suggestedActions: generateSuggestedActions(inputText),
        relatedConcepts: generateRelatedConcepts(inputText)
      };

      setMessages(prev => [...prev, tutorMessage]);
      
    } catch (error) {
      console.error('Message error:', error);
      
      const errorMessage: TutorMessage = {
        id: `error-${Date.now()}`,
        type: 'tutor',
        content: "I'm having trouble connecting right now, but remember: 'Alone we can do so little; together we can do so much.' Let's continue our Ubuntu learning journey!",
        timestamp: new Date().toISOString(),
        ubuntuWisdom: ubuntuWisdom[1]
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
    } finally {
      setIsTyping(false);
    }
  };

  const generateMockResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('ubuntu') || lowerInput.includes('community')) {
      return "Ubuntu philosophy teaches us that our individual growth is interconnected with community prosperity. When you learn, you're not just improving yourself - you're enhancing the collective wisdom of our community. How can you apply what you're learning to benefit others?";
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('stuck')) {
      return "Remember the Ubuntu principle: 'I am because we are.' You're never alone in your learning journey. Let's break this down together, and then we can explore how understanding this concept can help our community.";
    }
    
    if (lowerInput.includes('progress') || lowerInput.includes('how am i doing')) {
      return "Your progress reflects not just personal achievement, but community growth. Every concept you master becomes a tool for collective problem-solving. Let's explore how your current learning connects to Ubuntu values of shared prosperity.";
    }
    
    if (lowerInput.includes('why') || lowerInput.includes('explain')) {
      return "Understanding 'why' connects us to deeper wisdom. In Ubuntu tradition, knowledge isn't just about facts - it's about understanding our place in the community and how we can contribute. Let's explore this together with that perspective.";
    }
    
    return "That's a thoughtful question! Let's approach this with Ubuntu wisdom - how might this knowledge help us build stronger communities and support one another's growth?";
  };

  const getRandomUbuntuWisdom = (): string => {
    return ubuntuWisdom[Math.floor(Math.random() * ubuntuWisdom.length)];
  };

  const generateSuggestedActions = (input: string): string[] => {
    const actions = [
      "Explore how this concept applies to community building",
      "Share this insight with fellow learners",
      "Practice this in a collaborative setting",
      "Reflect on how this serves the collective good",
      "Connect this to Ubuntu philosophy",
      "Teach this concept to someone else"
    ];
    
    // Return 3 random actions
    return actions.sort(() => Math.random() - 0.5).slice(0, 3);
  };

  const generateRelatedConcepts = (input: string): string[] => {
    const concepts = [
      "Ubuntu Philosophy",
      "Community Learning",
      "Collaborative Problem-Solving",
      "Shared Wisdom",
      "Collective Growth",
      "Mutual Support",
      "Social Impact",
      "Community Service"
    ];
    
    return concepts.sort(() => Math.random() - 0.5).slice(0, 4);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const generateLearningPath = async () => {
    try {
      if (ubuntuServices) {
        const path = await ubuntuServices.education.generateLearningPath({
          studentId: 'demo-student-001',
          courseId: course?.id,
          ubuntuMode: ubuntuMode,
          currentProgress: 25 // Mock progress
        });
        
        setLearningPath(path);
      } else {
        // Mock learning path
        const mockPath: LearningPath = {
          id: 'path-1',
          title: 'Ubuntu Community Builder Path',
          description: 'A learning journey focused on applying knowledge for community benefit',
          progress: 25,
          ubuntuFocus: 'Community impact through collaborative learning',
          nextSteps: [
            'Master fundamental concepts',
            'Practice community application',
            'Teach others to reinforce learning',
            'Create community impact project'
          ]
        };
        
        setLearningPath(mockPath);
      }
      
      setShowLearningPath(true);
    } catch (error) {
      console.error('Learning path generation error:', error);
    }
  };

  const clearChat = () => {
    setMessages([]);
    initializeTutor();
  };

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-white">🤖 Elara AI Tutor</h3>
            {ubuntuMode && (
              <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">
                Ubuntu Philosophy Active
              </span>
            )}
            <span className="px-2 py-1 bg-purple-900 text-purple-300 text-xs rounded">
              {tutorPersonality === 'guide' ? '🧭 Guide' : 
               tutorPersonality === 'mentor' ? '👨‍🏫 Mentor' : '👫 Friend'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={tutorPersonality}
              onChange={(e) => setTutorPersonality(e.target.value as any)}
              className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
            >
              <option value="guide">🧭 Guide</option>
              <option value="mentor">👨‍🏫 Mentor</option>
              <option value="friend">👫 Friend</option>
            </select>
            
            <Button
              variant={ubuntuMode ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setUbuntuMode(!ubuntuMode)}
            >
              🌍 Ubuntu
            </Button>
            
            <Button
              variant={showInsights ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setShowInsights(!showInsights)}
            >
              💡 Insights
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={generateLearningPath}
            >
              🛤️ Path
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'student' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl px-4 py-3 rounded-lg ${
                    message.type === 'student' 
                      ? 'bg-purple-900 text-white' 
                      : message.type === 'system'
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  {/* Message Header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">
                      {message.type === 'student' ? 'You' : 
                       message.type === 'system' ? 'System' : 'Ubuntu AI Tutor'}
                    </span>
                    <span className="text-xs opacity-75">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {/* Message Content */}
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  
                  {/* Ubuntu Wisdom */}
                  {message.ubuntuWisdom && ubuntuMode && (
                    <div className="mt-3 p-2 bg-green-900 bg-opacity-30 rounded border border-green-800">
                      <p className="text-xs text-green-300 italic">
                        🌍 Ubuntu Wisdom: "{message.ubuntuWisdom}"
                      </p>
                    </div>
                  )}
                  
                  {/* Suggested Actions */}
                  {message.suggestedActions && message.suggestedActions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 mb-2">Suggested Actions:</p>
                      <div className="space-y-1">
                        {message.suggestedActions.map((action, index) => (
                          <button
                            key={index}
                            className="block w-full text-left text-xs bg-gray-700 bg-opacity-50 hover:bg-opacity-70 px-2 py-1 rounded transition-colors"
                            onClick={() => setInputText(action)}
                          >
                            → {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Related Concepts */}
                  {message.relatedConcepts && message.relatedConcepts.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-400 mb-2">Related Concepts:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.relatedConcepts.map((concept, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-900 bg-opacity-30 text-blue-300 text-xs rounded"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-white px-4 py-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-400">Ubuntu AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-gray-800 border-t border-gray-700 p-4">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask your Ubuntu AI tutor anything..."
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded resize-none"
                  rows={2}
                  disabled={isTyping}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={sendMessage}
                  disabled={!inputText.trim() || isTyping}
                >
                  Send
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        {(showInsights || showLearningPath) && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
            {showInsights && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-semibold">💡 Ubuntu Insights</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInsights(false)}
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {insights.map((insight, index) => (
                    <div key={index} className="p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          insight.type === 'strength' ? 'bg-green-900 text-green-300' :
                          insight.type === 'improvement' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-blue-900 text-blue-300'
                        }`}>
                          {insight.type}
                        </span>
                        {insight.actionable && (
                          <span className="text-xs text-purple-400">Actionable</span>
                        )}
                      </div>
                      
                      <h6 className="text-white font-medium text-sm mb-1">{insight.title}</h6>
                      <p className="text-gray-400 text-xs mb-2">{insight.description}</p>
                      
                      <div className="p-2 bg-green-900 bg-opacity-20 rounded border border-green-800">
                        <p className="text-xs text-green-300">
                          🌍 {insight.ubuntuConnection}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {showLearningPath && learningPath && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-semibold">🛤️ Learning Path</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLearningPath(false)}
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h6 className="text-white font-medium mb-2">{learningPath.title}</h6>
                    <p className="text-gray-400 text-sm mb-3">{learningPath.description}</p>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Progress</span>
                        <span className="text-xs text-gray-400">{learningPath.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-400 h-2 rounded-full"
                          style={{ width: `${learningPath.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="p-2 bg-green-900 bg-opacity-20 rounded border border-green-800">
                      <p className="text-xs text-green-300">
                        🌍 Ubuntu Focus: {learningPath.ubuntuFocus}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h6 className="text-white font-medium text-sm mb-2">Next Steps:</h6>
                    <div className="space-y-2">
                      {learningPath.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-green-400 text-sm">→</span>
                          <span className="text-gray-300 text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ubuntu Teaching Principles Footer */}
      {ubuntuMode && (
        <div className="bg-green-900 bg-opacity-20 border-t border-green-800 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-green-400 font-medium text-sm">🌍 Ubuntu Teaching Principles:</span>
              <div className="flex items-center space-x-3">
                {ubuntuTeachingPrinciples.slice(0, 3).map((principle, index) => (
                  <div key={index} className="flex items-center space-x-1">
                    <span className="text-green-300 text-xs">{principle.principle}:</span>
                    <span className="text-green-400 text-xs">"{principle.description}"</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <span>🤖 Elara AI Tutor</span>
            <span>•</span>
            <span>Ubuntu Philosophy Integration</span>
            <span>•</span>
            <span>Personalized Learning</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>AI-Powered Guidance</span>
            <span>•</span>
            <span>Community-Focused Learning</span>
          </div>
        </div>
      </div>
    </div>
  );
}
