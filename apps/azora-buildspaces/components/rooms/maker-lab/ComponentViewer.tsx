"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, Grid, Environment } from '@react-three/drei';
import { useRef, useState } from 'react';
import { Mesh } from 'three';

function ESP32Board(props: any) {
    const meshRef = useRef<Mesh>(null);
    const [hovered, setHover] = useState(false);
    const [active, setActive] = useState(false);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.2;
        }
    });

    return (
        <group {...props}>
            {/* PCB Board */}
            <mesh
                ref={meshRef}
                scale={active ? 1.1 : 1}
                onClick={() => setActive(!active)}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                <boxGeometry args={[2, 0.1, 1]} />
                <meshStandardMaterial color={hovered ? '#333' : '#1a1a1a'} />
            </mesh>

            {/* WiFi Chip */}
            <mesh position={[0.5, 0.1, 0]}>
                <boxGeometry args={[0.5, 0.1, 0.5]} />
                <meshStandardMaterial color="#silver" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Pins */}
            {Array.from({ length: 10 }).map((_, i) => (
                <mesh key={`pin-l-${i}`} position={[-0.9, 0, -0.4 + i * 0.1]}>
                    <boxGeometry args={[0.1, 0.2, 0.05]} />
                    <meshStandardMaterial color="gold" metalness={1} roughness={0.1} />
                </mesh>
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
                <mesh key={`pin-r-${i}`} position={[0.9, 0, -0.4 + i * 0.1]}>
                    <boxGeometry args={[0.1, 0.2, 0.05]} />
                    <meshStandardMaterial color="gold" metalness={1} roughness={0.1} />
                </mesh>
            ))}
        </group>
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
