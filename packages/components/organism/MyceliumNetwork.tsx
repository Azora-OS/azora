/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 

See LICENSE file for details. 
*/ 

/**
 * 🌿 Mycelium Network Component
 * 
 * Living, breathing mycelium network visualization that connects
 * all parts of the Azora OS organism like a neural network.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: string[];
  type: 'neural' | 'mycelium' | 'consciousness';
  pulse: number;
}

interface MyceliumNetworkProps {
  nodeCount?: number;
  connectionDensity?: number;
  animated?: boolean;
  interactive?: boolean;
  className?: string;
}

export const MyceliumNetwork: React.FC<MyceliumNetworkProps> = ({
  nodeCount = 50,
  connectionDensity = 0.3,
  animated = true,
  interactive = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const animationFrameRef = useRef<number>();

  // Initialize nodes
  useEffect(() => {
    const initialNodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({
      id: `node-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      connections: [],
      type: ['neural', 'mycelium', 'consciousness'][Math.floor(Math.random() * 3)] as Node['type'],
      pulse: Math.random() * Math.PI * 2,
    }));

    // Create connections based on proximity
    initialNodes.forEach((node, i) => {
      initialNodes.forEach((otherNode, j) => {
        if (i !== j && Math.random() < connectionDensity) {
          const distance = Math.sqrt(
            Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
          );
          if (distance < 30 && !node.connections.includes(otherNode.id)) {
            node.connections.push(otherNode.id);
          }
        }
      });
    });

    setNodes(initialNodes);
  }, [nodeCount, connectionDensity]);

  // Animation loop
  useEffect(() => {
    if (!animated || !canvasRef.current) {return;}

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {return;}

    const updateAndDraw = () => {
      // Set canvas size
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Clear canvas
      ctx.fillStyle = 'rgba(3, 5, 8, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      setNodes(prevNodes => {
        const updatedNodes = prevNodes.map(node => {
          // Update position
          let newX = node.x + node.vx;
          let newY = node.y + node.vy;
          let newVx = node.vx;
          let newVy = node.vy;

          // Bounce off edges
          if (newX < 0 || newX > 100) {
            newVx = -newVx;
            newX = Math.max(0, Math.min(100, newX));
          }
          if (newY < 0 || newY > 100) {
            newVy = -newVy;
            newY = Math.max(0, Math.min(100, newY));
          }

          // Update pulse
          const newPulse = (node.pulse + 0.05) % (Math.PI * 2);

          return {
            ...node,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            pulse: newPulse,
          };
        });

        // Draw connections
        updatedNodes.forEach(node => {
          node.connections.forEach(connId => {
            const targetNode = updatedNodes.find(n => n.id === connId);
            if (!targetNode) {return;}

            const x1 = (node.x / 100) * canvas.width;
            const y1 = (node.y / 100) * canvas.height;
            const x2 = (targetNode.x / 100) * canvas.width;
            const y2 = (targetNode.y / 100) * canvas.height;

            // Organic curve
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            
            const cpX = (x1 + x2) / 2 + Math.sin(node.pulse) * 20;
            const cpY = (y1 + y2) / 2 + Math.cos(node.pulse) * 20;
            ctx.quadraticCurveTo(cpX, cpY, x2, y2);

            // Color based on type
            const alpha = 0.3 + Math.sin(node.pulse) * 0.2;
            const colors = {
              neural: `rgba(0, 194, 255, ${alpha})`,
              mycelium: `rgba(51, 255, 146, ${alpha})`,
              consciousness: `rgba(138, 42, 255, ${alpha})`,
            };
            
            ctx.strokeStyle = colors[node.type];
            ctx.lineWidth = 2;
            ctx.stroke();
          });
        });

        // Draw nodes
        updatedNodes.forEach(node => {
          const x = (node.x / 100) * canvas.width;
          const y = (node.y / 100) * canvas.height;
          const size = 4 + Math.sin(node.pulse) * 2;
          const isHovered = hoveredNode === node.id;

          // Glow effect
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * (isHovered ? 8 : 4));
          const colors = {
            neural: ['#00c2ff', '#0080cc'],
            mycelium: ['#33ff92', '#1acc6f'],
            consciousness: ['#8a2aff', '#5c1ca8'],
          };
          
          gradient.addColorStop(0, colors[node.type][0] + (isHovered ? 'ff' : '88'));
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, size * (isHovered ? 8 : 4), 0, Math.PI * 2);
          ctx.fill();

          // Core node
          ctx.fillStyle = colors[node.type][0];
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        });

        return updatedNodes;
      });

      animationFrameRef.current = requestAnimationFrame(updateAndDraw);
    };

    updateAndDraw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animated, hoveredNode]);

  // Mouse interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !canvasRef.current) {return;}

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / canvas.width) * 100;
    const y = ((e.clientY - rect.top) / canvas.height) * 100;

    // Find nearest node
    let nearestNode: Node | null = null;
    let nearestDistance = 5; // threshold

    nodes.forEach(node => {
      const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestNode = node;
      }
    });

    setHoveredNode(nearestNode?.id || null);
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredNode(null)}
        style={{ background: 'transparent' }}
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-sm rounded-lg p-3 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-[#00c2ff]"></div>
          <span className="text-[#00c2ff]">Neural</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-[#33ff92]"></div>
          <span className="text-[#33ff92]">Mycelium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#8a2aff]"></div>
          <span className="text-[#8a2aff]">Consciousness</span>
        </div>
      </div>
    </div>
  );
};

export default MyceliumNetwork;

