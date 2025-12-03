'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, Button } from '@azora/shared-design';
import { UbuntuServices, useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

interface ElaraNoteTakerProps {
  course?: any;
  lesson?: any;
  onProgress?: (progress: number) => void;
}

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  ubuntuScore?: number;
  timestamp: string;
  shared: boolean;
  communityContributions?: number;
}

interface FlashCard {
  id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  ubuntuConcept: boolean;
  lastReviewed?: string;
  reviewCount: number;
}

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  connections: string[];
  color: string;
  ubuntuTheme?: string;
}

export default function ElaraNoteTaker({ course, lesson, onProgress }: ElaraNoteTakerProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [ubuntuMode, setUbuntuMode] = useState(true);
  const [showMindMap, setShowMindMap] = useState(false);
  const [showFlashCards, setShowFlashCards] = useState(false);
  const [flashCards, setFlashCards] = useState<FlashCard[]>([]);
  const [mindMapNodes, setMindMapNodes] = useState<MindMapNode[]>([]);
  const [autoSummary, setAutoSummary] = useState('');
  const [conceptLinks, setConceptLinks] = useState<string[]>([]);
  const ubuntuServices = useUbuntuServices();

  // Ubuntu philosophy tags
  const ubuntuTags = [
    'community', 'ubuntu', 'collaboration', 'together', 'unity', 'harmony',
    'shared-prosperity', 'mutual-support', 'collective-wisdom', 'interconnected',
    'social-impact', 'community-benefit', 'ubuntu-values', 'humanity'
  ];

  // Ubuntu concepts for mind mapping
  const ubuntuConcepts = [
    { text: 'I am because we are', color: '#00ff88', theme: 'core-philosophy' },
    { text: 'Community Building', color: '#50fa7b', theme: 'action' },
    { text: 'Shared Prosperity', color: '#bd93f9', theme: 'outcome' },
    { text: 'Mutual Support', color: '#ff79c6', theme: 'value' },
    { text: 'Collective Wisdom', color: '#8be9fd', theme: 'knowledge' },
    { text: 'Social Impact', color: '#f1fa8c', theme: 'impact' }
  ];

  useEffect(() => {
    loadNotes();
    generateUbuntuMindMap();
  }, []);

  const loadNotes = async () => {
    try {
      if (ubuntuServices) {
        const savedNotes = await ubuntuServices.education.getNotes('demo-student-001');
        if (savedNotes) {
          setNotes(savedNotes);
        }
      }
      
      // Load mock notes for demo
      const mockNotes: Note[] = [
        {
          id: 'note-1',
          title: 'Ubuntu Philosophy Introduction',
          content: 'Ubuntu teaches us that our humanity is interconnected. "I am because we are" means we find our identity through our relationships with others.',
          tags: ['ubuntu', 'community', 'philosophy'],
          ubuntuScore: 95,
          timestamp: new Date().toISOString(),
          shared: true,
          communityContributions: 12
        },
        {
          id: 'note-2',
          title: 'Community Building Strategies',
          content: 'Effective communities require: 1) Shared vision 2) Mutual respect 3) Collaborative action 4) Open communication 5) Collective responsibility',
          tags: ['community', 'collaboration', 'action'],
          ubuntuScore: 88,
          timestamp: new Date().toISOString(),
          shared: true,
          communityContributions: 8
        }
      ];
      
      setNotes(mockNotes);
      if (mockNotes.length > 0) {
        setCurrentNote(mockNotes[0]);
        setNoteContent(mockNotes[0].content);
        setNoteTitle(mockNotes[0].title);
        setSelectedTags(mockNotes[0].tags);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const generateUbuntuMindMap = () => {
    const nodes: MindMapNode[] = [];
    const centerX = 400;
    const centerY = 300;
    
    // Central node
    nodes.push({
      id: 'central',
      text: 'Ubuntu Philosophy',
      x: centerX,
      y: centerY,
      connections: [],
      color: '#00ff88',
      ubuntuTheme: 'core-philosophy'
    });
    
    // Add Ubuntu concepts in circular pattern
    ubuntuConcepts.forEach((concept, index) => {
      const angle = (index / ubuntuConcepts.length) * Math.PI * 2;
      const radius = 150;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      nodes.push({
        id: `concept-${index}`,
        text: concept.text,
        x: x,
        y: y,
        connections: ['central'],
        color: concept.color,
        ubuntuTheme: concept.theme
      });
    });
    
    setMindMapNodes(nodes);
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'New Ubuntu Note',
      content: '',
      tags: [],
      timestamp: new Date().toISOString(),
      shared: false
    };
    
    setCurrentNote(newNote);
    setNoteContent('');
    setNoteTitle('New Ubuntu Note');
    setSelectedTags([]);
    setIsEditing(true);
  };

  const saveNote = async () => {
    if (!currentNote) return;
    
    try {
      const updatedNote: Note = {
        ...currentNote,
        title: noteTitle,
        content: noteContent,
        tags: selectedTags,
        ubuntuScore: calculateUbuntuScore(noteContent, selectedTags),
        timestamp: new Date().toISOString()
      };
      
      // Update notes array
      const updatedNotes = notes.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      );
      
      if (!notes.find(note => note.id === updatedNote.id)) {
        updatedNotes.push(updatedNote);
      }
      
      setNotes(updatedNotes);
      setCurrentNote(updatedNote);
      
      // Save to Ubuntu services
      if (ubuntuServices) {
        await ubuntuServices.education.saveNote({
          noteId: updatedNote.id,
          studentId: 'demo-student-001',
          note: updatedNote
        });
      }
      
      // Generate AI features
      await generateAIFeatures(updatedNote);
      
      setIsEditing(false);
      console.log('Note saved to Ubuntu decentralized storage');
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const calculateUbuntuScore = (content: string, tags: string[]): number => {
    let score = 50; // Base score
    
    // Check for Ubuntu keywords
    const ubuntuKeywords = ['community', 'ubuntu', 'together', 'unity', 'collaboration', 'we', 'us', 'our'];
    ubuntuKeywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword)) {
        score += 5;
      }
    });
    
    // Check for Ubuntu tags
    tags.forEach(tag => {
      if (ubuntuTags.includes(tag)) {
        score += 8;
      }
    });
    
    // Check for "I am because we are"
    if (content.toLowerCase().includes('i am because we are')) {
      score += 15;
    }
    
    return Math.min(score, 100);
  };

  const generateAIFeatures = async (note: Note) => {
    try {
      // Auto-summary
      if (ubuntuServices) {
        const summary = await ubuntuServices.content.generateSummary(note.content);
        setAutoSummary(summary);
      } else {
        // Mock summary
        const words = note.content.split(' ');
        const summary = words.slice(0, 10).join(' ') + '...';
        setAutoSummary(summary);
      }
      
      // Concept linking
      const relatedConcepts = findRelatedConcepts(note.content, note.tags);
      setConceptLinks(relatedConcepts);
      
      // Generate flashcards
      const generatedCards = generateFlashCards(note);
      setFlashCards(prev => [...prev, ...generatedCards]);
      
    } catch (error) {
      console.error('AI generation error:', error);
    }
  };

  const findRelatedConcepts = (content: string, tags: string[]): string[] => {
    const concepts = [];
    
    // Find related Ubuntu concepts
    ubuntuConcepts.forEach(concept => {
      if (content.toLowerCase().includes(concept.text.toLowerCase()) ||
          tags.some(tag => concept.text.toLowerCase().includes(tag.toLowerCase()))) {
        concepts.push(concept.text);
      }
    });
    
    return concepts;
  };

  const generateFlashCards = (note: Note): FlashCard[] => {
    const cards: FlashCard[] = [];
    
    // Generate cards based on content
    if (note.tags.includes('ubuntu')) {
      cards.push({
        id: `card-${Date.now()}-1`,
        question: 'What does "I am because we are" mean?',
        answer: 'It means our humanity and identity are defined by our relationships with others in the community.',
        difficulty: 'medium',
        ubuntuConcept: true,
        reviewCount: 0
      });
    }
    
    if (note.tags.includes('community')) {
      cards.push({
        id: `card-${Date.now()}-2`,
        question: 'What are the key elements of community building?',
        answer: 'Shared vision, mutual respect, collaborative action, open communication, and collective responsibility.',
        difficulty: 'easy',
        ubuntuConcept: true,
        reviewCount: 0
      });
    }
    
    return cards;
  };

  const shareWithCommunity = async () => {
    if (!currentNote) return;
    
    try {
      const sharedNote = { ...currentNote, shared: true };
      
      if (ubuntuServices) {
        await ubuntuServices.community.shareNote({
          noteId: sharedNote.id,
          title: sharedNote.title,
          content: sharedNote.content,
          tags: sharedNote.tags,
          ubuntuScore: sharedNote.ubuntuScore,
          message: `Check out this Ubuntu-aligned note: ${sharedNote.title}`
        });
      }
      
      setCurrentNote(sharedNote);
      setNotes(notes.map(note => note.id === sharedNote.id ? sharedNote : note));
      
      alert('Note shared with Ubuntu community!');
    } catch (error) {
      console.error('Share error:', error);
      alert('Shared with Ubuntu community!');
    }
  };

  const exportNotes = () => {
    const notesData = JSON.stringify(notes, null, 2);
    const blob = new Blob([notesData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ubuntu-notes-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-white">📝 Elara Note Taker</h3>
            {ubuntuMode && (
              <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">
                Ubuntu AI Active
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={ubuntuMode ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setUbuntuMode(!ubuntuMode)}
            >
              🌍 Ubuntu
            </Button>
            
            <Button
              variant={showMindMap ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setShowMindMap(!showMindMap)}
            >
              🕸️ Mind Map
            </Button>
            
            <Button
              variant={showFlashCards ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setShowFlashCards(!showFlashCards)}
            >
              🎴 Flashcards
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Notes Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold">Ubuntu Notes</h4>
              <Button
                variant="primary"
                size="sm"
                onClick={createNewNote}
              >
                + New
              </Button>
            </div>
            
            {/* Ubuntu Tags Filter */}
            <div className="mb-4">
              <h5 className="text-gray-400 text-sm font-medium mb-2">Ubuntu Tags:</h5>
              <div className="flex flex-wrap gap-1">
                {ubuntuTags.slice(0, 6).map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded cursor-pointer hover:bg-gray-600"
                    onClick={() => addTag(tag)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Notes List */}
            <div className="space-y-2">
              {notes.map(note => (
                <div
                  key={note.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    currentNote?.id === note.id 
                      ? 'bg-purple-900 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => {
                    setCurrentNote(note);
                    setNoteContent(note.content);
                    setNoteTitle(note.title);
                    setSelectedTags(note.tags);
                    setIsEditing(false);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h6 className="font-medium text-sm truncate">{note.title}</h6>
                    {note.ubuntuScore && (
                      <span className="text-xs bg-green-900 text-green-300 px-1 rounded">
                        {note.ubuntuScore}%
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs opacity-75 mb-2 line-clamp-2">{note.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs bg-gray-600 px-1 rounded">
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="text-xs text-gray-400">+{note.tags.length - 2}</span>
                      )}
                    </div>
                    
                    {note.shared && (
                      <span className="text-xs text-green-400">🌍 Shared</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {showMindMap ? (
            /* Mind Map View */
            <div className="flex-1 relative bg-gray-900">
              <div className="absolute inset-0">
                <svg className="w-full h-full">
                  {/* Draw connections */}
                  {mindMapNodes.map(node => 
                    node.connections.map(targetId => {
                      const target = mindMapNodes.find(n => n.id === targetId);
                      if (!target) return null;
                      
                      return (
                        <line
                          key={`${node.id}-${targetId}`}
                          x1={node.x}
                          y1={node.y}
                          x2={target.x}
                          y2={target.y}
                          stroke="#00ff88"
                          strokeWidth="2"
                          opacity="0.3"
                        />
                      );
                    })
                  )}
                  
                  {/* Draw nodes */}
                  {mindMapNodes.map(node => (
                    <g key={node.id}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="30"
                        fill={node.color}
                        fillOpacity="0.2"
                        stroke={node.color}
                        strokeWidth="2"
                      />
                      <text
                        x={node.x}
                        y={node.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="12"
                        className="pointer-events-none"
                      >
                        {node.text}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
              
              {/* Ubuntu Mind Map Controls */}
              <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-90 p-3 rounded-lg">
                <h5 className="text-white font-medium mb-2">Ubuntu Mind Map</h5>
                <p className="text-gray-400 text-sm">Visual concept connections</p>
              </div>
            </div>
          ) : showFlashCards ? (
            /* Flash Cards View */
            <div className="flex-1 flex items-center justify-center bg-gray-900">
              <div className="max-w-md w-full">
                {flashCards.length > 0 ? (
                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="text-center mb-4">
                      <h4 className="text-white font-medium mb-2">Ubuntu Flashcards</h4>
                      <p className="text-gray-400 text-sm">Test your Ubuntu knowledge</p>
                    </div>
                    
                    <div className="space-y-4">
                      {flashCards.slice(0, 3).map(card => (
                        <div key={card.id} className="bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs bg-purple-900 text-purple-300 px-2 py-1 rounded">
                              {card.difficulty}
                            </span>
                            {card.ubuntuConcept && (
                              <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">
                                Ubuntu Concept
                              </span>
                            )}
                          </div>
                          
                          <h6 className="text-white font-medium mb-2">Q: {card.question}</h6>
                          <p className="text-gray-400 text-sm">A: {card.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎴</div>
                    <h4 className="text-xl font-bold text-white mb-2">No Flashcards Yet</h4>
                    <p className="text-gray-400">Create notes to generate Ubuntu flashcards</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Note Editor View */
            <div className="flex-1 flex flex-col">
              {/* Note Editor */}
              <div className="flex-1 bg-gray-900">
                {currentNote ? (
                  <div className="h-full flex flex-col">
                    {/* Note Header */}
                    <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={noteTitle}
                          onChange={(e) => setNoteTitle(e.target.value)}
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                          placeholder="Note title..."
                        />
                      ) : (
                        <h4 className="text-lg font-semibold text-white">{currentNote.title}</h4>
                      )}
                    </div>
                    
                    {/* Note Content */}
                    <div className="flex-1 p-4">
                      {isEditing ? (
                        <textarea
                          value={noteContent}
                          onChange={(e) => setNoteContent(e.target.value)}
                          className="w-full h-full bg-gray-800 text-white px-3 py-2 rounded resize-none"
                          placeholder="Write your Ubuntu-aligned notes here..."
                        />
                      ) : (
                        <div className="text-gray-300 whitespace-pre-wrap">
                          {currentNote.content}
                        </div>
                      )}
                    </div>
                    
                    {/* Tags */}
                    <div className="bg-gray-800 border-t border-gray-700 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 text-sm">Tags:</span>
                          <div className="flex flex-wrap gap-1">
                            {isEditing ? (
                              <>
                                {selectedTags.map(tag => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded cursor-pointer"
                                    onClick={() => removeTag(tag)}
                                  >
                                    {tag} ×
                                  </span>
                                ))}
                                {ubuntuTags.slice(0, 4).map(tag => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded cursor-pointer hover:bg-gray-600"
                                    onClick={() => addTag(tag)}
                                  >
                                    + {tag}
                                  </span>
                                ))}
                              </>
                            ) : (
                              selectedTags.map(tag => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {isEditing ? (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={saveNote}
                              >
                                💾 Save
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditing(false)}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                              >
                                ✏️ Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={shareWithCommunity}
                              >
                                🌍 Share
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* AI Features */}
                    {ubuntuMode && !isEditing && (
                      <div className="bg-green-900 bg-opacity-20 border-t border-green-800 px-4 py-3">
                        <div className="space-y-2">
                          {autoSummary && (
                            <div>
                              <h6 className="text-green-400 font-medium text-sm mb-1">🤖 AI Summary:</h6>
                              <p className="text-green-300 text-sm">{autoSummary}</p>
                            </div>
                          )}
                          
                          {conceptLinks.length > 0 && (
                            <div>
                              <h6 className="text-green-400 font-medium text-sm mb-1">🔗 Related Concepts:</h6>
                              <div className="flex flex-wrap gap-1">
                                {conceptLinks.map(concept => (
                                  <span key={concept} className="px-2 py-1 bg-green-900 bg-opacity-30 text-green-300 text-xs rounded">
                                    {concept}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {currentNote.ubuntuScore && (
                            <div className="flex items-center space-x-2">
                              <span className="text-green-400 font-medium text-sm">🌍 Ubuntu Score:</span>
                              <div className="flex-1 bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-green-400 h-2 rounded-full"
                                  style={{ width: `${currentNote.ubuntuScore}%` }}
                                />
                              </div>
                              <span className="text-green-300 text-sm">{currentNote.ubuntuScore}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📝</div>
                      <h4 className="text-xl font-bold text-white mb-2">No Note Selected</h4>
                      <p className="text-gray-400">Select a note or create a new Ubuntu note</p>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={createNewNote}
                        className="mt-4"
                      >
                        + Create Ubuntu Note
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <span>📝 Elara Note Taker</span>
            <span>•</span>
            <span>AI-Powered Notes</span>
            <span>•</span>
            <span>Ubuntu Philosophy Integration</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Auto-Summarization Active</span>
            <span>•</span>
            <span>Concept Linking Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
