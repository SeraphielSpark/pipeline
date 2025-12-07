import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Cylinder,
  Sparkles,
  Grid,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import { SimulationParams, SensorReadings } from "../types";

interface Simulation3DProps {
  params: SimulationParams;
  readings: SensorReadings;
}

const FlowParticles: React.FC<{ speed: number; isLeaking: boolean }> = ({
  speed,
  isLeaking,
}) => {
  const count = 400; // Increased count
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = Math.random();
      const speedOffset = Math.random();
      // Tighter spread to ensure they are inside the pipe visually
      const x = (Math.random() - 0.5) * 0.6;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 0.6;
      temp.push({ t, factor, speedOffset, x, y, z });
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    particles.forEach((particle, i) => {
      let { y, speedOffset } = particle;
      y -= speed * (1 + speedOffset * 0.5) * delta * 5;
      if (y < -10) y = 10;
      particle.y = y;
      dummy.position.set(particle.x, y, particle.z);

      // Increased scale for better visibility
      dummy.scale.setScalar(0.08);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 8, 8]} />
      {/* Emissive material makes it glow and easier to see */}
      <meshStandardMaterial
        color="#3b82f6"
        emissive="#3b82f6"
        emissiveIntensity={2}
        toneMapped={false}
      />
    </instancedMesh>
  );
};

const LeakEffect: React.FC<{ isLeaking: boolean; severity: number }> = ({
  isLeaking,
  severity,
}) => {
  if (!isLeaking) return null;
  return (
    <group position={[0, -0.6, 0]}>
      <Sparkles
        count={50 * (severity * 10)}
        scale={[3, 5, 3]}
        size={10}
        speed={3}
        opacity={1}
        color="#bae6fd"
        position={[0, -1, 0]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <circleGeometry args={[1 + severity * 2, 32]} />
        <meshStandardMaterial
          color="#2563eb"
          emissive="#2563eb"
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

const PipeSystem: React.FC<Simulation3DProps> = ({ params, readings }) => {
  return (
    <group>
      <group rotation={[0, 0, Math.PI / 2]}>
        {/* Made pipe glassier and less opaque so particles show through */}
        <Cylinder args={[0.65, 0.65, 20, 32]} position={[0, 0, 0]}>
          <meshPhysicalMaterial
            color="#94a3b8"
            transparent
            opacity={0.1}
            metalness={0.1}
            roughness={0}
            transmission={0.9}
            thickness={0.1}
            side={THREE.DoubleSide}
            depthWrite={false} // Helps with transparency sorting
          />
        </Cylinder>
        <FlowParticles
          speed={params.inputFlowRate / 5}
          isLeaking={params.isLeaking}
        />
      </group>

      {/* Simplified Sensor Nodes */}
      <group position={[-8, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
      <group position={[8, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      <group position={[0, 0, 0]}>
        {params.isLeaking && (
          <Html position={[0, 2.5, 0]}>
            <div className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded font-bold animate-bounce shadow-lg shadow-red-500/50 whitespace-nowrap">
              ⚠️ LEAKING
            </div>
          </Html>
        )}
        <LeakEffect
          isLeaking={params.isLeaking}
          severity={params.leakSeverity}
        />
      </group>

      <group position={[0, -2.5, 0]}>
        <Grid
          infiniteGrid
          fadeDistance={30}
          sectionColor="#1e293b"
          cellColor="#0f172a"
          sectionThickness={1}
          cellThickness={0.5}
        />
      </group>
    </group>
  );
};

export const SimulationScene: React.FC<Simulation3DProps> = (props) => {
  return (
    <div className="w-full h-full bg-slate-950/50 relative rounded-xl overflow-hidden border border-slate-800/50">
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          {/* Adjusted Camera for better initial view on small screens */}
          <PerspectiveCamera makeDefault position={[0, 4, 14]} fov={50} />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={5}
            maxDistance={25}
          />

          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 10, 5]} intensity={1} />
          <pointLight
            position={[0, 0, 0]}
            intensity={0.5}
            color="#3b82f6"
            distance={10}
          />

          <PipeSystem {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
};
