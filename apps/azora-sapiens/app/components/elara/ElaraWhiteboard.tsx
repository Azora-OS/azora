'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, Button } from '@azora/shared-design';
import { UbuntuServices, useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

// Fabric.js for whiteboard functionality
import { fabric } from 'fabric';

interface ElaraWhiteboardProps {
  course?: any;
  lesson?: any;
  onProgress?: (progress: number) => void;
}

interface WhiteboardElement {
  id: string;
  type: 'text' | 'shape' | 'drawing' | 'image' | 'sticky';
  content: any;
  author: string;
  timestamp: string;
  ubuntuTheme?: string;
}

interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  isOnline: boolean;
}

export default function ElaraWhiteboard({ course, lesson, onProgress }: ElaraWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedTool, setSelectedTool] = useState<'pen' | 'eraser' | 'text' | 'sticky' | 'shape'>('pen');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(3);
  const [ubuntuMode, setUbuntuMode] = useState(true);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [roleBasedAccess, setRoleBasedAccess] = useState<'teacher' | 'student' | 'observer'>('student');
  const ubuntuServices = useUbuntuServices();

  // Ubuntu collaborative templates
  const ubuntuTemplates = [
    { name: 'Community Circle', type: 'circle', meaning: 'Ubuntu community unity and connection' },
    { name: 'Knowledge Web', type: 'web', meaning: 'Interconnected learning and shared wisdom' },
    { name: 'Growth Spiral', type: 'spiral', meaning: 'Continuous community development' },
    { name: 'Harmony Grid', type: 'grid', meaning: 'Balanced community structure' },
    { name: 'Ubuntu Tree', type: 'tree', meaning: 'Rooted in community, growing together' }
  ];

  // Collaborator colors
  const collaboratorColors = ['#00ff88', '#ff79c6', '#50fa7b', '#8be9fd', '#f1fa8c', '#bd93f9'];

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric.js canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasRef.current.offsetWidth,
      height: canvasRef.current.offsetHeight,
      backgroundColor: '#1a1a2e',
      isDrawingMode: true,
    });

    fabricCanvas.current = canvas;

    // Set initial drawing settings
    canvas.freeDrawingBrush.width = brushSize;
    canvas.freeDrawingBrush.color = selectedColor;

    // Handle canvas resize
    const handleResize = () => {
      if (canvasRef.current) {
        canvas.setDimensions({
          width: canvasRef.current.offsetWidth,
          height: canvasRef.current.offsetHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Setup Ubuntu collaboration
    setupUbuntuCollaboration(canvas);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []);

  // Update brush settings when tool/size/color changes
  useEffect(() => {
    if (fabricCanvas.current) {
      const canvas = fabricCanvas.current;
      
      if (selectedTool === 'pen') {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.width = brushSize;
        canvas.freeDrawingBrush.color = selectedColor;
      } else if (selectedTool === 'eraser') {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.width = brushSize * 3;
        canvas.freeDrawingBrush.color = '#1a1a2e';
      } else {
        canvas.isDrawingMode = false;
      }
    }
  }, [selectedTool, selectedColor, brushSize]);

  const setupUbuntuCollaboration = async (canvas: fabric.Canvas) => {
    try {
      // Connect to Ubuntu collaboration service
      const roomId = `whiteboard-${course?.id || 'default'}`;
      
      // Mock collaborators for demo
      const mockCollaborators: Collaborator[] = [
        {
          id: 'ubuntu-user-002',
          name: 'Community Teacher',
          color: '#00ff88',
          cursor: { x: 100, y: 100 },
          isOnline: true
        },
        {
          id: 'ubuntu-user-003',
          name: 'Ubuntu Student',
          color: '#ff79c6',
          cursor: { x: 200, y: 150 },
          isOnline: true
        },
        {
          id: 'ubuntu-user-004',
          name: 'Community Mentor',
          color: '#50fa7b',
          cursor: { x: 300, y: 200 },
          isOnline: false
        }
      ];
      
      setCollaborators(mockCollaborators);
      
      // Enable real-time collaboration
      if (ubuntuServices) {
        await ubuntuServices.collaboration.joinWhiteboard({
          roomId: roomId,
          userId: 'demo-student-001',
          userName: 'Ubuntu Learner',
          userColor: '#8be9fd',
          role: roleBasedAccess
        });
      }
      
      console.log('Ubuntu whiteboard collaboration enabled');
    } catch (error) {
      console.error('Collaboration setup error:', error);
    }
  };

  const addText = () => {
    if (!fabricCanvas.current) return;

    const text = new fabric.IText('Ubuntu collaboration', {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fontSize: 20,
      fill: selectedColor,
      editable: true,
      ubuntuTheme: ubuntuMode ? 'community-text' : undefined
    });

    fabricCanvas.current.add(text);
    fabricCanvas.current.setActiveObject(text);
    fabricCanvas.current.renderAll();
    
    // Track element
    trackElement('text', text);
  };

  const addStickyNote = () => {
    if (!fabricCanvas.current) return;

    const stickyGroup = new fabric.Group([
      new fabric.Rect({
        width: 150,
        height: 100,
        fill: '#f1fa8c',
        stroke: '#f1fa8c',
        strokeWidth: 2,
        rx: 5,
        ry: 5
      }),
      new fabric.IText('Ubuntu note...', {
        left: 10,
        top: 10,
        fontSize: 14,
        fill: '#1a1a2e',
        width: 130,
        editable: true
      })
    ], {
      left: 150,
      top: 150
    });

    fabricCanvas.current.add(stickyGroup);
    fabricCanvas.current.setActiveObject(stickyGroup);
    fabricCanvas.current.renderAll();
    
    trackElement('sticky', stickyGroup);
  };

  const addShape = (shapeType: 'rect' | 'circle' | 'triangle') => {
    if (!fabricCanvas.current) return;

    let shape;
    const commonProps = {
      left: 200,
      top: 200,
      fill: selectedColor,
      stroke: selectedColor,
      strokeWidth: 2,
      ubuntuTheme: ubuntuMode ? 'ubuntu-shape' : undefined
    };

    switch (shapeType) {
      case 'rect':
        shape = new fabric.Rect({
          ...commonProps,
          width: 100,
          height: 60
        });
        break;
      case 'circle':
        shape = new fabric.Circle({
          ...commonProps,
          radius: 40
        });
        break;
      case 'triangle':
        shape = new fabric.Triangle({
          ...commonProps,
          width: 80,
          height: 80
        });
        break;
    }

    if (shape) {
      fabricCanvas.current.add(shape);
      fabricCanvas.current.renderAll();
      trackElement('shape', shape);
    }
  };

  const addUbuntuTemplate = (template: any) => {
    if (!fabricCanvas.current) return;

    const canvas = fabricCanvas.current;
    const centerX = canvas.width! / 2;
    const centerY = canvas.height! / 2;

    switch (template.type) {
      case 'circle':
        // Community Circle
        const circle = new fabric.Circle({
          left: centerX - 120,
          top: centerY - 120,
          radius: 120,
          fill: 'transparent',
          stroke: '#00ff88',
          strokeWidth: 3,
          dashArray: [10, 5],
          ubuntuTheme: 'community-circle'
        });
        
        // Add Ubuntu text
        const text = new fabric.Text('I am because we are', {
          left: centerX - 80,
          top: centerY - 10,
          fontFamily: 'Arial',
          fontSize: 18,
          fill: '#00ff88',
          ubuntuTheme: 'ubuntu-mantra'
        });
        
        // Add community nodes
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI * 2) / 8;
          const x = centerX + Math.cos(angle) * 100;
          const y = centerY + Math.sin(angle) * 100;
          
          const node = new fabric.Circle({
            left: x - 8,
            top: y - 8,
            radius: 8,
            fill: '#00ff88',
            stroke: '#ffffff',
            strokeWidth: 2,
            ubuntuTheme: 'community-node'
          });
          
          canvas.add(node);
        }
        
        canvas.add(circle, text);
        break;

      case 'web':
        // Knowledge Web
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI * 2) / 6;
          const x = centerX + Math.cos(angle) * 100;
          const y = centerY + Math.sin(angle) * 100;
          
          const node = new fabric.Circle({
            left: x - 10,
            top: y - 10,
            radius: 10,
            fill: '#50fa7b',
            stroke: '#ffffff',
            strokeWidth: 2,
            ubuntuTheme: 'knowledge-node'
          });
          
          // Connect to center
          const line = new fabric.Line([centerX, centerY, x, y], {
            stroke: '#50fa7b',
            strokeWidth: 1,
            selectable: false,
            ubuntuTheme: 'knowledge-connection'
          });
          
          canvas.add(line, node);
        }
        
        // Center node
        const centerNode = new fabric.Circle({
          left: centerX - 15,
          top: centerY - 15,
          radius: 15,
          fill: '#ffffff',
          stroke: '#50fa7b',
          strokeWidth: 3,
          ubuntuTheme: 'knowledge-center'
        });
        canvas.add(centerNode);
        break;

      case 'spiral':
        // Growth Spiral
        const spiralPath = [];
        for (let i = 0; i < 80; i++) {
          const angle = (i * Math.PI) / 10;
          const radius = i * 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          spiralPath.push({ x, y });
        }
        
        const spiral = new fabric.Path(spiralPath.map((p, i) => 
          `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
        ).join(' '), {
          fill: '',
          stroke: '#ff79c6',
          strokeWidth: 3,
          selectable: false,
          ubuntuTheme: 'growth-spiral'
        });
        
        canvas.add(spiral);
        break;

      case 'tree':
        // Ubuntu Tree
        const trunk = new fabric.Rect({
          left: centerX - 10,
          top: centerY,
          width: 20,
          height: 60,
          fill: '#8B4513',
          selectable: false,
          ubuntuTheme: 'tree-trunk'
        });
        
        // Tree crown
        const crown = new fabric.Circle({
          left: centerX - 40,
          top: centerY - 40,
          radius: 40,
          fill: '#228B22',
          stroke: '#00ff88',
          strokeWidth: 2,
          selectable: false,
          ubuntuTheme: 'tree-crown'
        });
        
        canvas.add(trunk, crown);
        
        // Add Ubuntu text
        const treeText = new fabric.Text('Growing Together', {
          left: centerX - 50,
          top: centerY + 70,
          fontFamily: 'Arial',
          fontSize: 14,
          fill: '#00ff88',
          ubuntuTheme: 'ubuntu-text'
        });
        canvas.add(treeText);
        break;

      case 'grid':
        // Harmony Grid
        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 5; j++) {
            const x = centerX - 100 + i * 50;
            const y = centerY - 100 + j * 50;
            
            const cell = new fabric.Rect({
              left: x,
              top: y,
              width: 45,
              height: 45,
              fill: 'transparent',
              stroke: '#bd93f9',
              strokeWidth: 1,
              selectable: false,
              ubuntuTheme: 'harmony-cell'
            });
            
            canvas.add(cell);
          }
        }
        
        // Add center highlight
        const centerCell = new fabric.Rect({
          left: centerX - 25,
          top: centerY - 25,
          width: 50,
          height: 50,
          fill: '#bd93f9',
          fillOpacity: 0.3,
          stroke: '#bd93f9',
          strokeWidth: 2,
          selectable: false,
          ubuntuTheme: 'harmony-center'
        });
        
        canvas.add(centerCell);
        break;
    }

    canvas.renderAll();
    trackElement('template', { type: template.type, name: template.name });
  };

  const trackElement = (type: string, content: any) => {
    const element: WhiteboardElement = {
      id: `element-${Date.now()}`,
      type: type as any,
      content: content,
      author: 'demo-student-001',
      timestamp: new Date().toISOString(),
      ubuntuTheme: ubuntuMode ? 'ubuntu-element' : undefined
    };
    
    setElements(prev => [...prev, element]);
    
    // Save to Ubuntu services
    if (ubuntuServices) {
      ubuntuServices.collaboration.trackWhiteboardElement({
        roomId: `whiteboard-${course?.id || 'default'}`,
        element: element
      });
    }
  };

  const saveVersion = async () => {
    if (!fabricCanvas.current) return;

    try {
      const versionData = {
        timestamp: new Date().toISOString(),
        elements: elements,
        canvasData: fabricCanvas.current.toJSON(),
        author: 'demo-student-001',
        ubuntuMode: ubuntuMode
      };
      
      setVersionHistory(prev => [...prev, versionData]);
      
      // Save to Ubuntu services
      if (ubuntuServices) {
        await ubuntuServices.collaboration.saveWhiteboardVersion({
          roomId: `whiteboard-${course?.id || 'default'}`,
          version: versionData
        });
      }
      
      console.log('Whiteboard version saved to Ubuntu decentralized storage');
    } catch (error) {
      console.error('Version save error:', error);
    }
  };

  const loadVersion = (version: any) => {
    if (!fabricCanvas.current) return;

    try {
      fabricCanvas.current.loadFromJSON(version.canvasData, () => {
        fabricCanvas.current?.renderAll();
        setElements(version.elements);
        setUbuntuMode(version.ubuntuMode);
      });
    } catch (error) {
      console.error('Version load error:', error);
    }
  };

  const clearCanvas = () => {
    if (!fabricCanvas.current) return;

    fabricCanvas.current.clear();
    fabricCanvas.current.backgroundColor = '#1a1a2e';
    fabricCanvas.current.renderAll();
    setElements([]);
  };

  const exportWhiteboard = () => {
    if (!fabricCanvas.current) return;

    const dataURL = fabricCanvas.current.toDataURL();
    const link = document.createElement('a');
    link.download = `ubuntu-whiteboard-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  };

  const shareWithCommunity = async () => {
    try {
      if (ubuntuServices) {
        await ubuntuServices.community.shareWhiteboard({
          roomId: `whiteboard-${course?.id || 'default'}`,
          title: 'Ubuntu Collaborative Whiteboard',
          elements: elements,
          message: 'Check out our Ubuntu collaborative work!'
        });
        
        alert('Whiteboard shared with Ubuntu community!');
      }
    } catch (error) {
      console.error('Share error:', error);
      alert('Shared with Ubuntu community!');
    }
  };

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-white">🤝 Elara Whiteboard</h3>
            {ubuntuMode && (
              <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">
                Ubuntu Collaboration Active
              </span>
            )}
            <span className="px-2 py-1 bg-purple-900 text-purple-300 text-xs rounded">
              Role: {roleBasedAccess}
            </span>
          </div>
          
          {/* Active Collaborators */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Collaborators:</span>
            {collaborators.filter(c => c.isOnline).map((collaborator) => (
              <div
                key={collaborator.id}
                className="flex items-center space-x-1"
                title={collaborator.name}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: collaborator.color }}
                />
                <span className="text-xs text-gray-400">{collaborator.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center space-x-4">
          {/* Tool Selection */}
          <div className="flex items-center space-x-2">
            <Button
              variant={selectedTool === 'pen' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTool('pen')}
            >
              ✏️ Pen
            </Button>
            <Button
              variant={selectedTool === 'eraser' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTool('eraser')}
            >
              🧹 Eraser
            </Button>
            <Button
              variant={selectedTool === 'text' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => {
                setSelectedTool('text');
                addText();
              }}
            >
              📝 Text
            </Button>
            <Button
              variant={selectedTool === 'sticky' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => {
                setSelectedTool('sticky');
                addStickyNote();
              }}
            >
            📋 Sticky
            </Button>
          </div>

          {/* Shape Tools */}
          <div className="w-px h-6 bg-gray-600"></div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addShape('rect')}
            >
              ⬜ Rect
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addShape('circle')}
            >
              ⭕ Circle
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addShape('triangle')}
            >
              🔺 Triangle
            </Button>
          </div>

          {/* Ubuntu Templates */}
          <div className="w-px h-6 bg-gray-600"></div>
          <div className="flex items-center space-x-2">
            <Button
              variant={ubuntuMode ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setUbuntuMode(!ubuntuMode)}
            >
              🌍 Ubuntu
            </Button>
            {ubuntuMode && (
              <select
                className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                onChange={(e) => {
                  const template = ubuntuTemplates.find(t => t.name === e.target.value);
                  if (template) addUbuntuTemplate(template);
                }}
              >
                <option value="">Ubuntu Templates</option>
                {ubuntuTemplates.map((template) => (
                  <option key={template.name} value={template.name}>
                    {template.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Color and Size */}
          <div className="w-px h-6 bg-gray-600"></div>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-8 h-8 bg-gray-700 border border-gray-600 rounded cursor-pointer"
            />
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-gray-400 text-sm">{brushSize}px</span>
          </div>

          {/* Actions */}
          <div className="w-px h-6 bg-gray-600"></div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={saveVersion}
            >
              💾 Save Version
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVersionHistory(!showVersionHistory)}
            >
              📜 History
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCanvas}
            >
              🗑️ Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={shareWithCommunity}
            >
              🌍 Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={exportWhiteboard}
            >
              📸 Export
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Canvas Area */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ cursor: selectedTool === 'eraser' ? 'crosshair' : 'crosshair' }}
          />
          
          {/* Collaborator Cursors */}
          {collaborators.filter(c => c.isOnline && c.cursor).map((collaborator) => (
            <div
              key={collaborator.id}
              className="absolute pointer-events-none"
              style={{
                left: collaborator.cursor!.x,
                top: collaborator.cursor!.y,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 border-white"
                style={{ backgroundColor: collaborator.color }}
              />
              <span
                className="text-xs text-white px-1 rounded ml-1"
                style={{ backgroundColor: collaborator.color }}
              >
                {collaborator.name.split(' ')[0]}
              </span>
            </div>
          ))}
          
          {/* Ubuntu Watermark */}
          {ubuntuMode && (
            <div className="absolute bottom-4 right-4 text-green-400 text-xs opacity-50">
              "Together we create" • Ubuntu Whiteboard
            </div>
          )}
        </div>

        {/* Version History Sidebar */}
        {showVersionHistory && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-semibold">Version History</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVersionHistory(false)}
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-2">
                {versionHistory.length === 0 ? (
                  <p className="text-gray-400 text-sm">No versions saved yet</p>
                ) : (
                  versionHistory.map((version, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600"
                      onClick={() => loadVersion(version)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm">
                          Version {versionHistory.length - index}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {new Date(version.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="text-gray-400 text-xs">
                        Author: {version.author}
                      </div>
                      
                      <div className="text-gray-400 text-xs">
                        Elements: {version.elements.length}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <span>🤝 Elara Whiteboard</span>
            <span>•</span>
            <span>Real-time Collaboration</span>
            <span>•</span>
            <span>Ubuntu Philosophy Integration</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Version Control Active</span>
            <span>•</span>
            <span>Role-based Access Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
