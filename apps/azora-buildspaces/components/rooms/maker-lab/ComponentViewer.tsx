"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Grid, Environment, Text, Html } from '@react-three/drei';
import { useRef, useState } from 'react';
import { Mesh, Vector3 } from 'three';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cpu, Lightbulb, Thermometer, Wifi, Battery, Camera, Speaker, Mic, Zap } from "lucide-react";

interface Component3D {
    id: string;
    name: string;
    icon: any;
    description: string;
    specs: string[];
    price: string;
    category: string;
}

// Available 3D components
const components3D: Component3D[] = [
    {
        id: 'esp32',
        name: 'ESP32-WROOM-32',
        icon: Cpu,
        description: 'Dual-core microcontroller with WiFi and Bluetooth',
        specs: ['240MHz Dual Core', 'WiFi 802.11 b/g/n', 'Bluetooth 4.2', '520KB SRAM'],
        price: '$5.99',
        category: 'Microcontrollers'
    },
    {
        id: 'arduino-uno',
        name: 'Arduino Uno R3',
        icon: Cpu,
        description: 'Classic microcontroller board for beginners',
        specs: ['ATmega328P', '14 Digital I/O', '6 Analog Inputs', '16MHz Clock'],
        price: '$22.99',
        category: 'Microcontrollers'
    },
    {
        id: 'led-matrix',
        name: '8x8 LED Matrix',
        icon: Lightbulb,
        description: 'Red LED matrix display module',
        specs: ['8x8 Matrix', 'Red LEDs', 'Common Cathode', '5V Operation'],
        price: '$3.99',
        category: 'Displays'
    },
    {
        id: 'dht11',
        name: 'DHT11 Sensor',
        icon: Thermometer,
        description: 'Temperature and humidity sensor',
        specs: ['Temperature: 0-50°C', 'Humidity: 20-90%', '3-5V Operation', 'Digital Output'],
        price: '$4.99',
        category: 'Sensors'
    },
    {
        id: 'esp32-cam',
        name: 'ESP32-CAM',
        icon: Camera,
        description: 'ESP32 with camera module for vision projects',
        specs: ['OV2640 Camera', '2MP Resolution', 'WiFi Streaming', 'MicroSD Slot'],
        price: '$12.99',
        category: 'Cameras'
    },
    {
        id: 'servo-motor',
        name: 'SG90 Servo',
        icon: Zap,
        description: '9g micro servo motor for precise control',
        specs: ['180° Rotation', '4.8-6V Operation', 'Torque: 1.8kg/cm', 'Speed: 0.1s/60°'],
        price: '$5.49',
        category: 'Actuators'
    }
];

function ESP32Board({ position, onClick, selected }: { position: Vector3; onClick: () => void; selected: boolean }) {
    const meshRef = useRef<Mesh>(null);
    const [hovered, setHover] = useState(false);

    useFrame((state, delta) => {
        if (meshRef.current && !selected) {
            meshRef.current.rotation.y += delta * 0.2;
        }
    });

    return (
        <group position={position} onClick={onClick}>
            {/* PCB Board */}
            <mesh
                ref={meshRef}
                scale={selected ? 1.2 : hovered ? 1.1 : 1}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                <boxGeometry args={[2, 0.1, 1]} />
                <meshStandardMaterial
                    color={selected ? '#3b82f6' : hovered ? '#6b7280' : '#1a1a1a'}
                    metalness={0.3}
                    roughness={0.7}
                />
            </mesh>

            {/* WiFi Chip */}
            <mesh position={[0.5, 0.1, 0]}>
                <boxGeometry args={[0.5, 0.1, 0.5]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Antenna */}
            <mesh position={[0.8, 0.2, 0]}>
                <boxGeometry args={[0.05, 0.3, 0.05]} />
                <meshStandardMaterial color="#silver" metalness={1} roughness={0.1} />
            </mesh>

            {/* Pins */}
            {Array.from({ length: 10 }).map((_, i) => (
                <mesh key={`pin-l-${i}`} position={[-0.9, 0, -0.4 + i * 0.1]}>
                    <boxGeometry args={[0.1, 0.2, 0.05]} />
                    <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.1} />
                </mesh>
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
                <mesh key={`pin-r-${i}`} position={[0.9, 0, -0.4 + i * 0.1]}>
                    <boxGeometry args={[0.1, 0.2, 0.05]} />
                    <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.1} />
                </mesh>
            ))}

            {/* Component Label */}
            <Html position={[0, -0.5, 0]} center>
                <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                    ESP32-WROOM-32
                </div>
            </Html>
        </group>
    );
}

function LEDMatrix({ position, onClick, selected }: { position: Vector3; onClick: () => void; selected: boolean }) {
    const groupRef = useRef<any>(null);
    const [hovered, setHover] = useState(false);

    return (
        <group
            ref={groupRef}
            position={position}
            scale={selected ? 1.2 : hovered ? 1.1 : 1}
            onClick={onClick}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            {/* PCB Base */}
            <mesh>
                <boxGeometry args={[1.5, 0.1, 1.5]} />
                <meshStandardMaterial color="#2d3748" metalness={0.3} roughness={0.7} />
            </mesh>

            {/* LED Grid */}
            {Array.from({ length: 8 }).map((_, row) =>
                Array.from({ length: 8 }).map((_, col) => (
                    <mesh key={`${row}-${col}`} position={[-0.6 + col * 0.15, 0.1, -0.6 + row * 0.15]}>
                        <cylinderGeometry args={[0.05, 0.05, 0.05]} />
                        <meshStandardMaterial
                            color={selected ? "#ef4444" : "#dc2626"}
                            emissive={selected ? "#ef4444" : "#000000"}
                            emissiveIntensity={selected ? 0.3 : 0}
                        />
                    </mesh>
                ))
            )}

            <Html position={[0, -0.4, 0]} center>
                <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                    8x8 LED Matrix
                </div>
            </Html>
        </group>
    );
}

function DHT11Sensor({ position, onClick, selected }: { position: Vector3; onClick: () => void; selected: boolean }) {
    const meshRef = useRef<Mesh>(null);
    const [hovered, setHover] = useState(false);

    return (
        <group
            position={position}
            scale={selected ? 1.2 : hovered ? 1.1 : 1}
            onClick={onClick}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            {/* Sensor Body */}
            <mesh ref={meshRef}>
                <boxGeometry args={[1, 0.3, 0.8]} />
                <meshStandardMaterial
                    color={selected ? '#10b981' : hovered ? '#6b7280' : '#374151'}
                    metalness={0.4}
                    roughness={0.6}
                />
            </mesh>

            {/* Sensor Grid */}
            <mesh position={[0, 0.2, 0]}>
                <boxGeometry args={[0.6, 0.05, 0.6]} />
                <meshStandardMaterial color="#1f2937" />
            </mesh>

            {/* Pins */}
            {Array.from({ length: 4 }).map((_, i) => (
                <mesh key={`pin-${i}`} position={[-0.3 + i * 0.2, -0.2, 0]}>
                    <boxGeometry args={[0.05, 0.2, 0.05]} />
                    <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.1} />
                </mesh>
            ))}

            <Html position={[0, -0.6, 0]} center>
                <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                    DHT11 Sensor
                </div>
            </Html>
        </group>
    );
}

export default function ComponentViewer() {
    const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = ['all', ...Array.from(new Set(components3D.map(c => c.category)))];

    const filteredComponents = selectedCategory === 'all'
        ? components3D
        : components3D.filter(c => c.category === selectedCategory);

    const selectedComponentData = components3D.find(c => c.id === selectedComponent);

    const render3DComponent = (componentId: string) => {
        const positions = {
            esp32: [0, 0, 0],
            'arduino-uno': [3, 0, 0],
            'led-matrix': [-3, 0, 0],
            dht11: [0, 0, 3],
            'esp32-cam': [3, 0, 3],
            'servo-motor': [-3, 0, 3]
        } as any;

        switch (componentId) {
            case 'esp32':
                return <ESP32Board
                    position={positions.esp32}
                    onClick={() => setSelectedComponent('esp32')}
                    selected={selectedComponent === 'esp32'}
                />;
            case 'led-matrix':
                return <LEDMatrix
                    position={positions['led-matrix']}
                    onClick={() => setSelectedComponent('led-matrix')}
                    selected={selectedComponent === 'led-matrix'}
                />;
            case 'dht11':
                return <DHT11Sensor
                    position={positions.dht11}
                    onClick={() => setSelectedComponent('dht11')}
                    selected={selectedComponent === 'dht11'}
                />;
            default:
                return <ESP32Board
                    position={positions.esp32}
                    onClick={() => setSelectedComponent('esp32')}
                    selected={selectedComponent === 'esp32'}
                />;
        }
    };

    return (
        <div className="h-full flex">
            {/* Component Library */}
            <div className="w-80 border-r bg-gray-50 p-4 flex flex-col">
                <h3 className="font-semibold mb-4 text-gray-900">Hardware Library</h3>

                {/* Category Filter */}
                <div className="mb-4">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-2 border rounded-md text-sm"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category === 'all' ? 'All Categories' : category}
                            </option>
                        ))}
                    </select>
                </div>

                <ScrollArea className="flex-1">
                    <div className="space-y-3">
                        {filteredComponents.map((component) => (
                            <Card
                                key={component.id}
                                className={`p-4 cursor-pointer transition-all ${
                                    selectedComponent === component.id
                                        ? 'bg-blue-50 border-blue-300 shadow-md'
                                        : 'hover:bg-gray-100'
                                }`}
                                onClick={() => setSelectedComponent(component.id)}
                            >
                                <div className="flex items-start gap-3">
                                    <component.icon className="w-6 h-6 mt-1 text-gray-600" />
                                    <div className="flex-1">
                                        <div className="font-medium text-sm text-gray-900">{component.name}</div>
                                        <div className="text-xs text-gray-600 mt-1">{component.description}</div>
                                        <div className="flex items-center justify-between mt-2">
                                            <Badge variant="outline" className="text-xs">
                                                {component.category}
                                            </Badge>
                                            <span className="font-semibold text-green-600">{component.price}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* 3D Viewer */}
            <div className="flex-1 flex flex-col">
                {/* 3D Canvas */}
                <div className="flex-1">
                    <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
                        <Environment preset="studio" />
                        <Stage environment="studio" intensity={0.5}>
                            <Grid args={[10, 10]} />
                            {selectedComponent && render3DComponent(selectedComponent)}
                        </Stage>
                        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                    </Canvas>
                </div>

                {/* Component Details */}
                {selectedComponentData && (
                    <div className="border-t bg-white p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <selectedComponentData.icon className="w-6 h-6 text-gray-600" />
                            <div>
                                <h4 className="font-semibold text-gray-900">{selectedComponentData.name}</h4>
                                <p className="text-sm text-gray-600">{selectedComponentData.description}</p>
                            </div>
                            <div className="ml-auto">
                                <span className="font-bold text-lg text-green-600">{selectedComponentData.price}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h5 className="font-medium text-sm text-gray-900 mb-2">Specifications</h5>
                                <ul className="text-xs text-gray-600 space-y-1">
                                    {selectedComponentData.specs.map((spec, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                            {spec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button size="sm" className="w-full">
                                    Add to Project
                                </Button>
                                <Button size="sm" variant="outline" className="w-full">
                                    View Datasheet
                                </Button>
                                <Button size="sm" variant="outline" className="w-full">
                                    Order Now
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


export default function ComponentViewer() {
    return (
        <div className="h-full w-full bg-gradient-to-b from-slate-900 to-slate-950 relative">
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-white font-semibold bg-black/50 px-3 py-1 rounded-full backdrop-blur text-sm border border-white/10">
                    3D Component Viewer
                </h3>
            </div>

            <Canvas shadows camera={{ position: [4, 4, 4], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <pointLight position={[-10, -10, -10]} />

                <Stage environment="city" intensity={0.6}>
                    <ESP32Board position={[0, 0, 0]} />
                </Stage>

                <Grid
                    renderOrder={-1}
                    position={[0, -0.5, 0]}
                    infiniteGrid
                    cellSize={0.5}
                    sectionSize={3}
                    fadeDistance={30}
                    sectionColor="#ea580c"
                    cellColor="#6b7280"
                />

                <OrbitControls autoRotate autoRotateSpeed={0.5} />
                <Environment preset="city" />
            </Canvas>

            <div className="absolute bottom-4 left-4 z-10 text-xs text-slate-400 font-mono">
                <p>Model: ESP32-WROOM-32</p>
                <p>Status: Rendering</p>
                <p>Controls: Left Click (Rotate), Right Click (Pan), Scroll (Zoom)</p>
            </div>
        </div>
    );
}
