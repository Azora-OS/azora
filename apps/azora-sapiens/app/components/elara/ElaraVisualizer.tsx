'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, Button } from '@azora/shared-design';
import { UbuntuServices, useUbuntuServices } from '@azora/shared-design/lib/ubuntu-services';

// Three.js for 3D visualizations
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface ElaraVisualizerProps {
  course?: any;
  lesson?: any;
  onProgress?: (progress: number) => void;
}

interface VisualizationModule {
  id: string;
  name: string;
  category: string;
  description: string;
  ubuntuFocus: string;
  interactive: boolean;
  parameters: any[];
}

export default function ElaraVisualizer({ course, lesson, onProgress }: ElaraVisualizerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number | null>(null);
  
  const [selectedModule, setSelectedModule] = useState<VisualizationModule | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [ubuntuMode, setUbuntuMode] = useState(true);
  const ubuntuServices = useUbuntuServices();

  // Ubuntu-aligned visualization modules
  const visualizationModules: VisualizationModule[] = [
    // Physics Modules
    {
      id: 'physics-solar-community',
      name: 'Community Solar System',
      category: 'Physics',
      description: 'Ubuntu-inspired planetary system showing interconnected orbits',
      ubuntuFocus: 'Community harmony through gravitational balance',
      interactive: true,
      parameters: [
        { name: 'Community Size', type: 'range', min: 3, max: 12, default: 8 },
        { name: 'Harmony Level', type: 'range', min: 0, max: 100, default: 75 },
        { name: 'Ubuntu Energy', type: 'checkbox', default: true }
      ]
    },
    {
      id: 'physics-wave-unity',
      name: 'Unity Wave Propagation',
      category: 'Physics',
      description: 'Wave patterns showing how unity creates stronger signals',
      ubuntuFocus: 'Collective strength through synchronized action',
      interactive: true,
      parameters: [
        { name: 'Unity Factor', type: 'range', min: 1, max: 10, default: 5 },
        { name: 'Community Nodes', type: 'range', min: 5, max: 50, default: 20 }
      ]
    },
    
    // Chemistry Modules
    {
      id: 'chem-community-bonds',
      name: 'Community Molecular Bonds',
      category: 'Chemistry',
      description: 'Molecular structures representing community connections',
      ubuntuFocus: 'Stronger communities through proper bonding',
      interactive: true,
      parameters: [
        { name: 'Bond Strength', type: 'range', min: 1, max: 10, default: 7 },
        { name: 'Community Diversity', type: 'range', min: 2, max: 8, default: 4 }
      ]
    },
    
    // Biology Modules
    {
      id: 'bio-ecosystem-ubuntu',
      name: 'Ubuntu Ecosystem',
      category: 'Biology',
      description: 'Balanced ecosystem showing interdependence',
      ubuntuFocus: 'I am because we are in nature',
      interactive: true,
      parameters: [
        { name: 'Biodiversity', type: 'range', min: 10, max: 100, default: 50 },
        { name: 'Community Balance', type: 'range', min: 0, max: 100, default: 80 }
      ]
    },
    
    // Mathematics Modules
    {
      id: 'math-fractal-ubuntu',
      name: 'Ubuntu Fractal Patterns',
      category: 'Mathematics',
      description: 'Fractals showing infinite community growth',
      ubuntuFocus: 'Self-similar patterns in community structures',
      interactive: true,
      parameters: [
        { name: 'Iterations', type: 'range', min: 1, max: 8, default: 5 },
        { name: 'Community Scale', type: 'range', min: 0.5, max: 3, default: 1.5 }
      ]
    },
    {
      id: 'math-geometry-unity',
      name: 'Sacred Geometry of Unity',
      category: 'Mathematics',
      description: 'Geometric patterns representing Ubuntu principles',
      ubuntuFocus: 'Mathematical harmony in community design',
      interactive: true,
      parameters: [
        { name: 'Complexity', type: 'range', min: 3, max: 12, default: 6 },
        { name: 'Ubuntu Ratio', type: 'range', min: 0.5, max: 2, default: 1.618 }
      ]
    }
  ];

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 10);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Ubuntu glow light
    const ubuntuLight = new THREE.PointLight(0x00ff88, 0.5, 100);
    ubuntuLight.position.set(0, 0, 0);
    scene.add(ubuntuLight);

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Animation loop
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current || !controlsRef.current) return;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  // Load visualization module
  const loadVisualization = (module: VisualizationModule) => {
    setSelectedModule(module);
    
    if (!sceneRef.current) return;

    // Clear existing objects
    while (sceneRef.current.children.length > 0) {
      const child = sceneRef.current.children[0];
      if (child.type !== 'AmbientLight' && child.type !== 'DirectionalLight' && child.type !== 'PointLight') {
        sceneRef.current.remove(child);
      } else {
        break;
      }
    }

    // Load specific visualization
    switch (module.id) {
      case 'physics-solar-community':
        createCommunitySolarSystem();
        break;
      case 'physics-wave-unity':
        createUnityWavePattern();
        break;
      case 'chem-community-bonds':
        createCommunityMolecularBonds();
        break;
      case 'bio-ecosystem-ubuntu':
        createUbuntuEcosystem();
        break;
      case 'math-fractal-ubuntu':
        createUbuntuFractal();
        break;
      case 'math-geometry-unity':
        createSacredGeometry();
        break;
    }

    setIsPlaying(true);
  };

  const createCommunitySolarSystem = () => {
    if (!sceneRef.current) return;

    // Central community (sun)
    const sunGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sunMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffaa00,
      emissive: 0xff4400,
      emissiveIntensity: 0.3
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sceneRef.current.add(sun);

    // Community members (planets)
    const communityMembers = 8;
    for (let i = 0; i < communityMembers; i++) {
      const radius = 2 + i * 0.8;
      const planetGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.2, 16, 16);
      const planetMaterial = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color().setHSL(i / communityMembers, 0.7, 0.5)
      });
      const planet = new THREE.Mesh(planetGeometry, planetMaterial);
      
      // Orbital position
      const angle = (i / communityMembers) * Math.PI * 2;
      planet.position.x = Math.cos(angle) * radius;
      planet.position.z = Math.sin(angle) * radius;
      
      sceneRef.current.add(planet);

      // Orbital path
      const orbitGeometry = new THREE.RingGeometry(radius - 0.02, radius + 0.02, 64);
      const orbitMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff88, 
        side: THREE.DoubleSide,
        opacity: 0.3,
        transparent: true
      });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      sceneRef.current.add(orbit);

      // Animate orbital motion
      const animatePlanet = () => {
        const speed = 0.001 / (i + 1);
        planet.position.x = Math.cos(angle + Date.now() * speed) * radius;
        planet.position.z = Math.sin(angle + Date.now() * speed) * radius;
        
        if (isPlaying) {
          requestAnimationFrame(animatePlanet);
        }
      };
      animatePlanet();
    }

    // Ubuntu energy field
    const fieldGeometry = new THREE.SphereGeometry(8, 16, 16);
    const fieldMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ff88, 
      wireframe: true,
      opacity: 0.1,
      transparent: true
    });
    const energyField = new THREE.Mesh(fieldGeometry, fieldMaterial);
    sceneRef.current.add(energyField);
  };

  const createUnityWavePattern = () => {
    if (!sceneRef.current) return;

    // Create wave grid representing community unity
    const gridSize = 20;
    const spacing = 0.5;
    
    for (let x = -gridSize/2; x < gridSize/2; x++) {
      for (let z = -gridSize/2; z < gridSize/2; z++) {
        const geometry = new THREE.SphereGeometry(0.05, 8, 8);
        const material = new THREE.MeshPhongMaterial({ 
          color: 0x00ff88,
          emissive: 0x00ff88,
          emissiveIntensity: 0.2
        });
        const node = new THREE.Mesh(geometry, material);
        
        node.position.set(x * spacing, 0, z * spacing);
        sceneRef.current.add(node);

        // Animate wave
        const animateWave = () => {
          const distance = Math.sqrt(x * x + z * z);
          const height = Math.sin(Date.now() * 0.001 - distance * 0.3) * 0.3;
          node.position.y = height;
          
          if (isPlaying) {
            requestAnimationFrame(animateWave);
          }
        };
        animateWave();
      }
    }
  };

  const createCommunityMolecularBonds = () => {
    if (!sceneRef.current) return;

    // Central community atom
    const centerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const centerMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xff6b6b,
      emissive: 0xff0000,
      emissiveIntensity: 0.2
    });
    const centerAtom = new THREE.Mesh(centerGeometry, centerMaterial);
    sceneRef.current.add(centerAtom);

    // Surrounding community members
    const members = 6;
    for (let i = 0; i < members; i++) {
      const angle = (i / members) * Math.PI * 2;
      const radius = 2;
      
      const atomGeometry = new THREE.SphereGeometry(0.3, 12, 12);
      const atomMaterial = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color().setHSL(i / members, 0.8, 0.6)
      });
      const atom = new THREE.Mesh(atomGeometry, atomMaterial);
      
      atom.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * 0.5,
        Math.sin(angle) * radius
      );
      
      sceneRef.current.add(atom);

      // Bond to center
      const bondGeometry = new THREE.CylinderGeometry(0.05, 0.05, radius, 8);
      const bondMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 0.1
      });
      const bond = new THREE.Mesh(bondGeometry, bondMaterial);
      
      bond.position.set(
        Math.cos(angle) * radius / 2,
        Math.sin(angle) * 0.25,
        Math.sin(angle) * radius / 2
      );
      
      bond.lookAt(centerAtom.position);
      sceneRef.current.add(bond);
    }
  };

  const createUbuntuEcosystem = () => {
    if (!sceneRef.current) return;

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x2d5016,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    sceneRef.current.add(ground);

    // Community trees
    const treePositions = [
      { x: -3, z: -3 }, { x: 3, z: -3 }, { x: -3, z: 3 }, { x: 3, z: 3 },
      { x: 0, z: -5 }, { x: 5, z: 0 }, { x: 0, z: 5 }, { x: -5, z: 0 }
    ];

    treePositions.forEach((pos, i) => {
      // Trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2);
      const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(pos.x, 1, pos.z);
      sceneRef.current.add(trunk);

      // Leaves
      const leavesGeometry = new THREE.SphereGeometry(1.5, 8, 6);
      const leavesMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x228B22,
        emissive: 0x00ff00,
        emissiveIntensity: 0.1
      });
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.set(pos.x, 2.5, pos.z);
      sceneRef.current.add(leaves);

      // Ubuntu energy connection
      if (i < treePositions.length - 1) {
        const nextPos = treePositions[i + 1];
        const connectionGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1, 8);
        const connectionMaterial = new THREE.MeshBasicMaterial({ 
          color: 0x00ff88,
          opacity: 0.5,
          transparent: true
        });
        const connection = new THREE.Mesh(connectionGeometry, connectionMaterial);
        
        connection.position.set(
          (pos.x + nextPos.x) / 2,
          0.5,
          (pos.z + nextPos.z) / 2
        );
        
        sceneRef.current.add(connection);
      }
    });

    // Central community fire/gathering point
    const fireGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const fireMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff6600,
      emissive: 0xff0000,
      emissiveIntensity: 1
    });
    const fire = new THREE.Mesh(fireGeometry, fireMaterial);
    fire.position.set(0, 0.3, 0);
    sceneRef.current.add(fire);
  };

  const createUbuntuFractal = () => {
    if (!sceneRef.current) return;

    const createFractalBranch = (x: number, y: number, z: number, size: number, depth: number) => {
      if (depth <= 0 || size < 0.1) return;

      // Create branch
      const geometry = new THREE.CylinderGeometry(size * 0.1, size * 0.2, size, 8);
      const material = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color().setHSL(depth / 5, 0.7, 0.5),
        emissive: 0x00ff88,
        emissiveIntensity: 0.1
      });
      const branch = new THREE.Mesh(geometry, material);
      branch.position.set(x, y + size/2, z);
      sceneRef.current.add(branch);

      // Create sub-branches
      const angles = [0, Math.PI/3, 2*Math.PI/3, Math.PI, 4*Math.PI/3, 5*Math.PI/3];
      angles.forEach((angle, i) => {
        if (Math.random() > 0.3) { // Some branches don't grow (natural variation)
          const newX = x + Math.cos(angle) * size * 0.7;
          const newZ = z + Math.sin(angle) * size * 0.7;
          const newY = y + size;
          createFractalBranch(newX, newY, newZ, size * 0.6, depth - 1);
        }
      });
    };

    // Start fractal from center
    createFractalBranch(0, 0, 0, 3, 5);
  };

  const createSacredGeometry = () => {
    if (!sceneRef.current) return;

    // Flower of Life pattern
    const radius = 2;
    const circles = 7; // Center + 6 around
    
    for (let i = 0; i < circles; i++) {
      let x = 0, z = 0;
      
      if (i > 0) {
        const angle = (i - 1) * (Math.PI * 2) / 6;
        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;
      }

      // Create circle
      const geometry = new THREE.TorusGeometry(radius, 0.1, 8, 32);
      const material = new THREE.MeshPhongMaterial({ 
        color: 0x00ff88,
        emissive: 0x00ff88,
        emissiveIntensity: 0.2,
        opacity: 0.8,
        transparent: true
      });
      const circle = new THREE.Mesh(geometry, material);
      circle.position.set(x, 0, z);
      circle.rotation.x = Math.PI / 2;
      sceneRef.current.add(circle);

      // Ubuntu energy at intersections
      if (i > 0) {
        const energyGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const energyMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xffffff,
          emissive: 0x00ff88,
          emissiveIntensity: 1
        });
        const energy = new THREE.Mesh(energyGeometry, energyMaterial);
        energy.position.set(x, 0, z);
        sceneRef.current.add(energy);
      }
    }

    // Central Ubuntu sphere
    const centerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const centerMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,
      emissive: 0x00ff88,
      emissiveIntensity: 0.5
    });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.set(0, 0, 0);
    sceneRef.current.add(center);
  };

  const resetVisualization = () => {
    if (!sceneRef.current) return;

    // Clear all objects except lights
    while (sceneRef.current.children.length > 0) {
      const child = sceneRef.current.children[0];
      if (child.type !== 'AmbientLight' && child.type !== 'DirectionalLight' && child.type !== 'PointLight') {
        sceneRef.current.remove(child);
      } else {
        break;
      }
    }

    setSelectedModule(null);
    setIsPlaying(false);
  };

  const exportVisualization = () => {
    if (!rendererRef.current) return;

    const dataURL = rendererRef.current.domElement.toDataURL();
    const link = document.createElement('a');
    link.download = `ubuntu-visualization-${selectedModule?.id || 'export'}.png`;
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-white">📊 Elara Visualizer</h3>
            {ubuntuMode && (
              <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded">
                Ubuntu Philosophy Active
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
              variant={showControls ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setShowControls(!showControls)}
            >
              ⚙️ Controls
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Module Selection Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h4 className="text-white font-semibold mb-4">Ubuntu Visualizations</h4>
            
            {/* Categories */}
            <div className="space-y-4">
              {['Physics', 'Chemistry', 'Biology', 'Mathematics'].map(category => (
                <div key={category}>
                  <h5 className="text-gray-400 text-sm font-medium mb-2">{category}</h5>
                  <div className="space-y-2">
                    {visualizationModules
                      .filter(module => module.category === category)
                      .map(module => (
                        <div
                          key={module.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedModule?.id === module.id 
                              ? 'bg-purple-900 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                          onClick={() => loadVisualization(module)}
                        >
                          <h6 className="font-medium text-sm">{module.name}</h6>
                          <p className="text-xs opacity-75 mt-1">{module.description}</p>
                          <div className="mt-2">
                            <span className="text-xs bg-green-900 text-green-300 px-1 rounded">
                              {module.ubuntuFocus}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3D Visualization Area */}
        <div className="flex-1 relative">
          <div ref={mountRef} className="w-full h-full" />
          
          {/* Ubuntu Overlay */}
          {ubuntuMode && selectedModule && (
            <div className="absolute top-4 left-4 bg-green-900 bg-opacity-80 text-green-300 px-3 py-2 rounded-lg max-w-sm">
              <div className="text-sm font-medium">{selectedModule.name}</div>
              <div className="text-xs mt-1">{selectedModule.ubuntuFocus}</div>
            </div>
          )}

          {/* Controls Panel */}
          {showControls && selectedModule && (
            <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-90 text-white p-4 rounded-lg max-w-sm">
              <h5 className="font-medium mb-3">Visualization Controls</h5>
              
              <div className="space-y-3">
                {selectedModule.parameters.map((param, index) => (
                  <div key={index}>
                    <label className="text-xs text-gray-400">{param.name}</label>
                    {param.type === 'range' ? (
                      <input
                        type="range"
                        min={param.min}
                        max={param.max}
                        defaultValue={param.default}
                        className="w-full"
                      />
                    ) : param.type === 'checkbox' ? (
                      <input
                        type="checkbox"
                        defaultChecked={param.default}
                        className="mr-2"
                      />
                    ) : null}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 space-y-2">
                <Button
                  variant={isPlaying ? 'primary' : 'ghost'}
                  size="sm"
                  className="w-full"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={resetVisualization}
                >
                  🔄 Reset
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={exportVisualization}
                >
                  📸 Export
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!selectedModule && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <h4 className="text-xl font-bold text-white mb-2">Select a Visualization</h4>
                <p className="text-gray-400">Choose an Ubuntu-aligned 3D visualization</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <span>📊 Elara Visualizer</span>
            <span>•</span>
            <span>3D Interactive Simulations</span>
            <span>•</span>
            <span>Ubuntu Philosophy Integration</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Three.js Active</span>
            <span>•</span>
            <span>Orbital Controls Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
