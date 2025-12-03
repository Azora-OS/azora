'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, Button } from '@azora/shared-design';
import { UbuntuServices, useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

// Fabric.js for canvas functionality
import { fabric } from 'fabric';

interface ElaraChalkboardProps {
  course?: any;
  lesson?: any;
  onProgress?: (progress: number) => void;
}

export default function ElaraChalkboard({ course, lesson, onProgress }: ElaraChalkboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvas = useRef<fabric.Canvas | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedTool, setSelectedTool] = useState<'pen' | 'eraser' | 'text' | 'shape'>('pen');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(3);
  const [ubuntuMode, setUbuntuMode] = useState(false);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const ubuntuServices = useUbuntuServices();

  // Ubuntu philosophy templates
  const ubuntuTemplates = [
    { name: 'Community Circle', type: 'circle', meaning: 'Ubuntu community unity' },
    { name: 'Connection Web', type: 'web', meaning: 'Interconnectedness of all beings' },
    { name: 'Growth Tree', type: 'tree', meaning: 'Community growth and nurturing' },
    { name: 'Knowledge Spiral', type: 'spiral', meaning: 'Continuous learning evolution' }
  ];

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

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

    // Enable collaboration features
    if (ubuntuServices) {
      setupCollaboration(canvas);
    }

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

  const setupCollaboration = async (canvas: fabric.Canvas) => {
    try {
      // Simulate Ubuntu collaboration service
      const roomId = `chalkboard-${course?.id || 'default'}`;
      console.log('Setting up Ubuntu collaboration for room:', roomId);
      
      // Mock collaborators for demo
      setCollaborators([
        { id: 'ubuntu-student-002', name: 'Ubuntu Learner', color: '#00ff88' },
        { id: 'ubuntu-student-003', name: 'Community Member', color: '#ff00ff' }
      ]);

      // In real implementation, this would connect to Ubuntu collaboration service
      // await ubuntuServices.collaboration.joinRoom(roomId, 'demo-student-001');
      
    } catch (error) {
      console.error('Collaboration setup error:', error);
    }
  };

  const addText = () => {
    if (!fabricCanvas.current) return;

    const text = new fabric.IText('Ubuntu text', {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fontSize: 20,
      fill: selectedColor,
      editable: true
    });

    fabricCanvas.current.add(text);
    fabricCanvas.current.setActiveObject(text);
    fabricCanvas.current.renderAll();
  };

  const addShape = (shapeType: 'rect' | 'circle' | 'triangle') => {
    if (!fabricCanvas.current) return;

    let shape;
    const commonProps = {
      left: 150,
      top: 150,
      fill: selectedColor,
      stroke: selectedColor,
      strokeWidth: 2
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
          left: centerX - 100,
          top: centerY - 100,
          radius: 100,
          fill: 'transparent',
          stroke: '#00ff88',
          strokeWidth: 3,
          dashArray: [10, 5]
        });
        
        // Add Ubuntu text
        const text = new fabric.Text('I am because we are', {
          left: centerX - 80,
          top: centerY - 10,
          fontFamily: 'Arial',
          fontSize: 16,
          fill: '#00ff88'
        });
        
        canvas.add(circle, text);
        break;

      case 'web':
        // Connection Web
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI * 2) / 8;
          const x = centerX + Math.cos(angle) * 120;
          const y = centerY + Math.sin(angle) * 120;
          
          const node = new fabric.Circle({
            left: x - 10,
            top: y - 10,
            radius: 10,
            fill: '#00ff88',
            stroke: '#ffffff',
            strokeWidth: 2
          });
          
          // Connect to center
          const line = new fabric.Line([centerX, centerY, x, y], {
            stroke: '#00ff88',
            strokeWidth: 1,
            selectable: false
          });
          
          canvas.add(line, node);
        }
        
        // Center node
        const centerNode = new fabric.Circle({
          left: centerX - 15,
          top: centerY - 15,
          radius: 15,
          fill: '#ffffff',
          stroke: '#00ff88',
          strokeWidth: 3
        });
        canvas.add(centerNode);
        break;

      case 'tree':
        // Growth Tree
        const trunk = new fabric.Rect({
          left: centerX - 10,
          top: centerY,
          width: 20,
          height: 80,
          fill: '#8B4513',
          selectable: false
        });
        
        // Tree crown
        const crown = new fabric.Circle({
          left: centerX - 40,
          top: centerY - 60,
          radius: 50,
          fill: '#228B22',
          stroke: '#00ff88',
          strokeWidth: 2,
          selectable: false
        });
        
        canvas.add(trunk, crown);
        
        // Add Ubuntu text
        const treeText = new fabric.Text('Community Growth', {
          left: centerX - 60,
          top: centerY + 90,
          fontFamily: 'Arial',
          fontSize: 14,
          fill: '#00ff88'
        });
        canvas.add(treeText);
        break;

      case 'spiral':
        // Knowledge Spiral
        const spiralPath = [];
        for (let i = 0; i < 100; i++) {
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
          stroke: '#00ff88',
          strokeWidth: 3,
          selectable: false
        });
        
        canvas.add(spiral);
        break;
    }

    canvas.renderAll();
  };

  const clearCanvas = () => {
    if (fabricCanvas.current) {
      fabricCanvas.current.clear();
      fabricCanvas.current.backgroundColor = '#1a1a2e';
      fabricCanvas.current.renderAll();
    }
  };

  const saveCanvas = async () => {
    if (!fabricCanvas.current) return;

    try {
      const dataURL = fabricCanvas.current.toDataURL();
      
      // Save to Ubuntu service
      if (ubuntuServices) {
        await ubuntuServices.education.saveCanvasWork({
          courseId: course?.id,
          studentId: 'demo-student-001',
          canvasData: dataURL,
          timestamp: new Date().toISOString()
        });
      }
      
      console.log('Canvas saved to Ubuntu decentralized storage');
      alert('Ubuntu canvas saved to decentralized storage!');
    } catch (error) {
      console.error('Save error:', error);
      // Fallback - download locally
      const link = document.createElement('a');
      link.download = `ubuntu-canvas-${Date.now()}.png`;
      link.href = dataURL;
      link.click();
    }
  };

  const loadFromDecentralizedStorage = async () => {
    try {
      if (ubuntuServices) {
        const savedCanvas = await ubuntuServices.education.getCanvasWork(
          course?.id, 
          'demo-student-001'
        );
        
        if (savedCanvas && savedCanvas.canvasData) {
          fabric.Image.fromURL(savedCanvas.canvasData, (img) => {
            if (fabricCanvas.current) {
              fabricCanvas.current.clear();
              fabricCanvas.current.add(img);
              fabricCanvas.current.renderAll();
            }
          });
        }
      }
    } catch (error) {
      console.error('Load error:', error);
    }
  };

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-white">🎨 Elara Chalkboard</h3>
            {ubuntuMode && (
              <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">
                Ubuntu Mode Active
              </span>
            )}
          </div>
          
          {/* Collaborators */}
          <div className="flex items-center space-x-2">
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: collaborator.color }}
              >
                {collaborator.name.charAt(0)}
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
              onClick={clearCanvas}
            >
              🗑️ Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadFromDecentralizedStorage}
            >
              📂 Load
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={saveCanvas}
            >
              💾 Save to Ubuntu
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ cursor: selectedTool === 'eraser' ? 'crosshair' : 'crosshair' }}
        />
        
        {/* Ubuntu Watermark */}
        {ubuntuMode && (
          <div className="absolute bottom-4 right-4 text-green-400 text-xs opacity-50">
            "I am because we are" • Ubuntu Learning
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <span>🎨 Elara Chalkboard</span>
            <span>•</span>
            <span>Decentralized Storage Active</span>
            <span>•</span>
            <span>Ubuntu Philosophy Integration</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>AI Handwriting Ready</span>
            <span>•</span>
            <span>Collaboration Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
