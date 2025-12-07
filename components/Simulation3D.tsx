import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Cylinder, Sparkles, Grid, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { SimulationParams, SensorReadings } from '../types';

interface Simulation3DProps {
  params: SimulationParams;
  readings: SensorReadings;
}

const FlowParticles: React.FC<{ speed: number; isLeaking: boolean }> = ({ speed, isLeaking }) => {
  const count = 300;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Random initial positions
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = Math.random();
      const speedOffset = Math.random();
      const x = (Math.random() - 0.5) * 1; // Pipe radius spread
      const y = (Math.random() - 0.5) * 1;
      const z = (Math.random() - 0.5) * 20;
      temp.push({ t, factor, speedOffset, x, y, z });
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    
    // Animate particles flowing through pipe
    particles.forEach((particle, i) => {
      let { z, speedOffset } = particle;
      // Move particle along Z axis
      z -= (speed * (1 + speedOffset * 0.5)) * delta * 5; 
      
      // Reset if out of bounds
      if (z < -10) z = 10;
      
      particle.z = z;

      dummy.position.set(particle.x * 0.4, particle.y * 0.4, z);
      dummy.scale.setScalar(0.05);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#60a5fa" transparent opacity={0.6} />
    </instancedMesh>
  );
};

const LeakEffect: React.FC<{ isLeaking: boolean; severity: number }> = ({ isLeaking, severity }) => {
  if (!isLeaking) return null;

  return (
    <group position={[0, -0.6, 0]}>
      {/* Spray */}
      <Sparkles 
        count={50 * (severity * 5)} 
        scale={[2, 4, 2]} 
        size={4} 
        speed={2} 
        opacity={0.8}
        color="#93c5fd"
        position={[0, -1, 0]}
      />
      {/* Puddle Accumulation */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <circleGeometry args={[1 + severity * 2, 32]} />
        <meshStandardMaterial color="#1e3a8a" transparent opacity={0.7} roughness={0.1} metalness={0.8} />
      </mesh>
    </group>
  );
};

const PipeSystem: React.FC<Simulation3DProps> = ({ params, readings }) => {
  return (
    <group>
      {/* Main Pipe */}
      <group rotation={[0, 0, Math.PI / 2]}>
         {/* Transparent Outer Shell */}
        <Cylinder args={[0.6, 0.6, 20, 32]} rotation={[0, 0, Math.PI / 2]} position={[0,0,0]}>
          <meshPhysicalMaterial 
            color="#cbd5e1" 
            transparent 
            opacity={0.15} 
            metalness={0.8} 
            roughness={0.1} 
            clearcoat={1}
            side={THREE.DoubleSide}
          />
        </Cylinder>
        
        {/* Inner Fluid Simulation */}
        <group rotation={[0, 0, -Math.PI / 2]}>
          <FlowParticles speed={params.inputFlowRate / 5} isLeaking={params.isLeaking} />
        </group>
      </group>

      {/* Sensor Nodes Visuals */}
      <group position={[-8, 0.7, 0]}>
         <Html distanceFactor={15}>
            <div className="bg-slate-900/80 backdrop-blur border border-slate-600 px-2 py-1 rounded text-xs text-blue-200 whitespace-nowrap">
              Inlet Sensor Node
            </div>
         </Html>
         <mesh>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="orange" />
         </mesh>
      </group>

      <group position={[8, 0.7, 0]}>
         <Html distanceFactor={15}>
            <div className="bg-slate-900/80 backdrop-blur border border-slate-600 px-2 py-1 rounded text-xs text-blue-200 whitespace-nowrap">
              Outlet Sensor Node
            </div>
         </Html>
         <mesh>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="orange" />
         </mesh>
      </group>

      {/* Leak Point Indicator (Hidden unless leaking or debug) */}
      <group position={[0, 0, 0]}>
         {params.isLeaking && (
             <Html position={[0, 2, 0]}>
                <div className="bg-red-500/90 text-white px-3 py-1 rounded font-bold animate-pulse shadow-lg shadow-red-500/50">
                  ⚠️ LEAK DETECTED
                </div>
             </Html>
         )}
         <LeakEffect isLeaking={params.isLeaking} severity={params.leakSeverity} />
      </group>

      {/* Soil Representation */}
      <group position={[0, -2.5, 0]}>
         <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[30, 10]} />
            <meshStandardMaterial 
                color={readings.soilMoisture > 0.5 ? "#3f3f2f" : "#5d5d4d"} 
                roughness={1} 
            />
         </mesh>
         <Grid infiniteGrid fadeDistance={25} sectionColor="#4ade80" cellColor="#4ade80" sectionThickness={1} cellThickness={0.5} position={[0, 0.01, 0]} />
      </group>
    </group>
  );
};

export const SimulationScene: React.FC<Simulation3DProps> = (props) => {
  return (
    <div className="w-full h-full bg-slate-950 relative rounded-xl overflow-hidden shadow-2xl border border-slate-800">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[5, 4, 12]} fov={45} />
        <OrbitControls enablePan={true} enableZoom={true} maxPolarAngle={Math.PI / 2} minDistance={5} maxDistance={30} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <Environment preset="city" />

        <PipeSystem {...props} />
        
      </Canvas>
      
      {/* Overlay UI for Scene */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <h2 className="text-xl font-bold text-white drop-shadow-md">3D Live Twin</h2>
        <div className="flex items-center gap-2 mt-1">
             <div className={`w-3 h-3 rounded-full ${props.params.isLeaking ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></div>
             <span className="text-xs text-slate-300 font-mono">{props.params.isLeaking ? 'CRITICAL ALERT' : 'SYSTEM OPTIMAL'}</span>
        </div>
      </div>
    </div>
  );
};
