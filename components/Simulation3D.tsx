import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Cylinder,
  Sparkles,
  Grid,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import { SimulationParams, SensorReadings, PrincipleType } from "../types";
import {
  Activity,
  Thermometer,
  Droplets,
  Zap,
  BarChart3,
  ArrowRight,
} from "lucide-react";

interface Simulation3DProps {
  params: SimulationParams;
  readings: SensorReadings;
  activePrinciple: PrincipleType;
}

// --- 1. Top Right Readings Overlay (Static Summary) ---
const ReadingsOverlay: React.FC<{
  params: SimulationParams;
  readings: SensorReadings;
  activePrinciple: PrincipleType;
}> = ({ params, readings, activePrinciple }) => {
  const ReadingItem = ({ label, value, unit, color }: any) => (
    <div className="flex justify-between items-end border-b border-slate-700/50 pb-1 mb-1 last:border-0 last:mb-0">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        {label}
      </span>
      <div className="text-right">
        <span className={`text-lg font-mono font-bold ${color} leading-none`}>
          {value}
        </span>
        <span className="text-[10px] text-slate-500 ml-1">{unit}</span>
      </div>
    </div>
  );

  const CardContainer = ({ title, icon: Icon, children }: any) => (
    <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur-md border border-slate-600 p-4 rounded-xl shadow-2xl w-60 pointer-events-none select-none z-50">
      <div className="flex items-center gap-2 mb-3 border-b border-slate-700 pb-2">
        <Icon size={16} className="text-blue-400" />
        <span className="text-xs font-bold text-slate-200 uppercase">
          {title}
        </span>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );

  switch (activePrinciple) {
    case PrincipleType.PRESSURE:
      return (
        <CardContainer title="Pressure Dynamics" icon={BarChart3}>
          <ReadingItem
            label="Input (Pin)"
            value={(params.inputPressure / 1000).toLocaleString()}
            unit="kPa"
            color="text-blue-400"
          />
          <ReadingItem
            label="Sensor (Pout)"
            value={(readings.pressureOut / 1000).toFixed(1)}
            unit="kPa"
            color="text-emerald-400"
          />
          <ReadingItem
            label="ΔP (Drop)"
            value={(
              (params.inputPressure - readings.pressureOut) /
              1000
            ).toFixed(1)}
            unit="kPa"
            color="text-red-400"
          />
        </CardContainer>
      );
    case PrincipleType.FLOW:
      return (
        <CardContainer title="Mass Balance" icon={Activity}>
          <ReadingItem
            label="Inflow (Qin)"
            value={params.inputFlowRate}
            unit="m³/s"
            color="text-blue-400"
          />
          <ReadingItem
            label="Outflow (Qout)"
            value={readings.flowOut.toFixed(2)}
            unit="m³/s"
            color="text-emerald-400"
          />
          <ReadingItem
            label="Loss"
            value={(params.inputFlowRate - readings.flowOut).toFixed(2)}
            unit="m³/s"
            color="text-red-400"
          />
        </CardContainer>
      );
    case PrincipleType.THERMAL:
      return (
        <CardContainer title="Thermodynamics" icon={Thermometer}>
          <ReadingItem
            label="Fluid Temp"
            value={params.fluidTemperature}
            unit="°C"
            color="text-rose-400"
          />
          <ReadingItem
            label="Soil Temp"
            value={readings.soilTempReading.toFixed(2)}
            unit="°C"
            color="text-orange-400"
          />
          <ReadingItem
            label="Gradient ΔT"
            value={Math.abs(
              params.fluidTemperature - readings.soilTempReading
            ).toFixed(2)}
            unit="°C"
            color="text-slate-300"
          />
        </CardContainer>
      );
    case PrincipleType.ACOUSTIC:
      return (
        <CardContainer title="Vibro-Acoustics" icon={Zap}>
          <ReadingItem
            label="Noise Floor"
            value={(params.inputFlowRate / 2 + 10).toFixed(1)}
            unit="dB"
            color="text-slate-500"
          />
          <ReadingItem
            label="Measured"
            value={readings.vibrationIntensity.toFixed(1)}
            unit="dB"
            color="text-amber-400"
          />
          <div className="mt-2 text-[10px] text-center text-slate-500 font-mono border-t border-slate-800 pt-1">
            STATUS:{" "}
            {readings.vibrationIntensity > 40
              ? "CAVITATION DETECTED"
              : "NORMAL FLOW"}
          </div>
        </CardContainer>
      );
    case PrincipleType.IMPEDANCE:
      return (
        <CardContainer title="Soil Impedance" icon={Droplets}>
          <ReadingItem
            label="Saturation"
            value={(readings.soilMoisture * 100).toFixed(0)}
            unit="%"
            color="text-cyan-400"
          />
          <ReadingItem
            label="Resistance"
            value={Math.round(10000 * (1 - readings.soilMoisture))}
            unit="Ω"
            color="text-slate-300"
          />
        </CardContainer>
      );
    default:
      return null;
  }
};

// --- 2. In-Scene 3D Labels (Floating on Pipe) ---
const InSceneLabels: React.FC<{
  params: SimulationParams;
  readings: SensorReadings;
  activePrinciple: PrincipleType;
}> = ({ params, readings, activePrinciple }) => {
  // Label Component
  const Label3D = ({ position, label, value, unit, color }: any) => (
    <Html position={position} center distanceFactor={12} zIndexRange={[100, 0]}>
      <div className="flex flex-col items-center pointer-events-none">
        <div
          className={`bg-slate-900/90 backdrop-blur border border-slate-600 px-3 py-1.5 rounded-lg shadow-xl flex flex-col items-center min-w-[80px]`}
        >
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
            {label}
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`text-lg font-mono font-bold ${color}`}>
              {value}
            </span>
            <span className="text-[10px] text-slate-500">{unit}</span>
          </div>
        </div>
        {/* Arrow pointing down to pipe */}
        <div className="w-0.5 h-4 bg-slate-600/50 mt-[-1px]"></div>
        <div className="w-2 h-2 rounded-full bg-slate-500 ring-2 ring-slate-900"></div>
      </div>
    </Html>
  );

  switch (activePrinciple) {
    case PrincipleType.PRESSURE:
      return (
        <>
          <Label3D
            position={[-9, 2.5, 0]}
            label="Pin"
            value={(params.inputPressure / 1000).toLocaleString()}
            unit="kPa"
            color="text-blue-400"
          />
          <Label3D
            position={[9, 2.5, 0]}
            label="Pout"
            value={(readings.pressureOut / 1000).toFixed(1)}
            unit="kPa"
            color="text-emerald-400"
          />
        </>
      );
    case PrincipleType.FLOW:
      return (
        <>
          <Label3D
            position={[-9, 2.5, 0]}
            label="Qin"
            value={params.inputFlowRate}
            unit="m³/s"
            color="text-blue-400"
          />
          <Label3D
            position={[9, 2.5, 0]}
            label="Qout"
            value={readings.flowOut.toFixed(2)}
            unit="m³/s"
            color="text-emerald-400"
          />
        </>
      );
    case PrincipleType.THERMAL:
      return (
        <>
          <Label3D
            position={[-9, 2.5, 0]}
            label="T-Fluid"
            value={params.fluidTemperature}
            unit="°C"
            color="text-rose-400"
          />
          <Label3D
            position={[0, 3, 0]}
            label="T-Soil"
            value={readings.soilTempReading.toFixed(1)}
            unit="°C"
            color="text-orange-400"
          />
        </>
      );
    default:
      return null;
  }
};

// --- 3. 3D Scene Components (Flow, Pipe, etc.) ---
const FlowParticles: React.FC<{ speed: number; isLeaking: boolean }> = ({
  speed,
  isLeaking,
}) => {
  const count = 400;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 0.6;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 0.6;
      const speedOffset = Math.random();
      temp.push({ speedOffset, x, y, z });
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

const PipeSystem: React.FC<{
  params: SimulationParams;
  readings: SensorReadings;
  activePrinciple: PrincipleType;
}> = ({ params, readings, activePrinciple }) => {
  return (
    <group>
      <group rotation={[0, 0, Math.PI / 2]}>
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
            depthWrite={false}
          />
        </Cylinder>
        <FlowParticles
          speed={params.inputFlowRate / 5}
          isLeaking={params.isLeaking}
        />
      </group>

      {/* Sensor Nodes */}
      <group position={[-9, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
      <group position={[9, 0, 0]}>
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
          <Html position={[0, 2.5, 0]} center>
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

      {/* Floating Labels attached to the pipe */}
      <InSceneLabels
        params={params}
        readings={readings}
        activePrinciple={activePrinciple}
      />
    </group>
  );
};

export const SimulationScene: React.FC<Simulation3DProps> = (props) => {
  return (
    <div className="w-full h-full bg-slate-950/50 relative rounded-xl overflow-hidden border border-slate-800/50">
      {/* Absolute Overlay for Readings (Top Right) */}
      <ReadingsOverlay
        params={props.params}
        readings={props.readings}
        activePrinciple={props.activePrinciple}
      />

      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          {/* UPDATED: Position pushed back to z:22 for better mobile view */}
          <PerspectiveCamera makeDefault position={[0, 5, 22]} fov={45} />

          {/* UPDATED: Increased maxDistance for zooming out, enabled Pan */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={2}
            maxDistance={60}
          />

          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 10, 5]} intensity={1} />
          <pointLight
            position={[0, 0, 0]}
            intensity={0.5}
            color="#3b82f6"
            distance={10}
          />

          <PipeSystem
            params={props.params}
            readings={props.readings}
            activePrinciple={props.activePrinciple}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
