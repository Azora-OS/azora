/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import * as React from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, useTexture, Text3D, Center } from "@react-three/drei"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import * as THREE from "three"

interface Card3DProps {
  children?: React.ReactNode
  className?: string
  texture?: string
  color?: string
  metalness?: number
  roughness?: number
  envMapIntensity?: number
  rotation?: [number, number, number]
  scale?: number
  interactive?: boolean
  glow?: boolean
  particles?: boolean
}

function CardMesh({ 
  texture, 
  color = "#3b82f6", 
  metalness = 0.1, 
  roughness = 0.1,
  envMapIntensity = 1,
  glow = false,
  particles = false 
}: Partial<Card3DProps>) {
  const meshRef = React.useRef<THREE.Mesh>(null)
  const { scene } = useThree()
  
  // Load texture if provided
  const map = useTexture(texture || "/textures/card-pattern.jpg")
  
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle rotation animation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
    }
  })

  return (
    <group>
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[2, 3, 0.1]} />
        <meshStandardMaterial
          map={map}
          color={color}
          metalness={metalness}
          roughness={roughness}
          envMapIntensity={envMapIntensity}
          emissive={glow ? new THREE.Color(color).multiplyScalar(0.2) : undefined}
        />
      </mesh>
      
      {/* Glow effect */}
      {glow && (
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[2.1, 3.1, 0.02]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
      )}
      
      {/* Particles */}
      {particles && (
        <group>
          {[...Array(20)].map((_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 6,
                Math.random() * 0.5 + 0.1
              ]}
            >
              <sphereGeometry args={[0.02]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={0.6}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

export function Card3D({
  children,
  className,
  texture,
  color = "#3b82f6",
  metalness = 0.1,
  roughness = 0.1,
  envMapIntensity = 1,
  rotation = [0, 0, 0],
  scale = 1,
  interactive = true,
  glow = false,
  particles = false,
  ...props
}: Card3DProps) {
  return (
    <motion.div
      className={cn("relative w-full h-96", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      {...props}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        shadows
        className="w-full h-full"
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        {/* Environment */}
        <Environment preset="city" />
        
        {/* Card */}
        <group rotation={rotation} scale={scale}>
          <CardMesh
            texture={texture}
            color={color}
            metalness={metalness}
            roughness={roughness}
            envMapIntensity={envMapIntensity}
            glow={glow}
            particles={particles}
          />
        </group>
        
        {/* Controls */}
        {interactive && (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            enableRotate={true}
            autoRotate={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        )}
      </Canvas>
      
      {/* Overlay Content */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className="text-center text-white drop-shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

// Interactive 3D Text Component
export function Text3DComponent({
  text,
  font = "/fonts/helvetiker_regular.typeface.json",
  size = 0.5,
  color = "#ffffff",
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  className,
  ...props
}: {
  text: string
  font?: string
  size?: number
  color?: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  className?: string
} & React.ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      className={cn("relative w-full h-64", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      {...props}
    >
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <Center position={position} rotation={rotation}>
          <Text3D
            font={font}
            size={size}
            height={0.1}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
          >
            {text}
            <meshStandardMaterial color={color} />
          </Text3D>
        </Center>
        
        <OrbitControls enableZoom={false} />
      </Canvas>
    </motion.div>
  )
}

// Floating 3D Elements
export function FloatingElements({
  count = 10,
  color = "#3b82f6",
  className,
  ...props
}: {
  count?: number
  color?: string
  className?: string
} & React.ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      className={cn("relative w-full h-full overflow-hidden", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      {...props}
    >
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        
        {[...Array(count)].map((_, i) => (
          <FloatingElement
            key={i}
            color={color}
            index={i}
            total={count}
          />
        ))}
      </Canvas>
    </motion.div>
  )
}

function FloatingElement({ 
  color, 
  index, 
  total 
}: { 
  color: string
  index: number
  total: number 
}) {
  const meshRef = React.useRef<THREE.Mesh>(null)
  const { scene } = useThree()
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime
      const delay = (index / total) * Math.PI * 2
      
      meshRef.current.position.y = Math.sin(time + delay) * 2
      meshRef.current.position.x = Math.cos(time * 0.5 + delay) * 3
      meshRef.current.rotation.x = time + delay
      meshRef.current.rotation.y = time * 0.5 + delay
    }
  })

  const geometry = React.useMemo(() => {
    const shapes = [
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      new THREE.SphereGeometry(0.15),
      new THREE.ConeGeometry(0.15, 0.3),
      new THREE.TorusGeometry(0.15, 0.05),
    ]
    return shapes[index % shapes.length]
  }, [index])

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.7}
        emissive={new THREE.Color(color).multiplyScalar(0.2)}
      />
    </mesh>
  )
}
