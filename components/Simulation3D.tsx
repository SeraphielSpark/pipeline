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
  TrendingDown,
} from "lucide-react";

interface Simulation3DProps {
  params: SimulationParams;
  readings: SensorReadings;
  activePrinciple: PrincipleType;
}

// --- 1. Enhanced HUD Overlay (Mobile Friendly) ---
const ReadingsOverlay: React.FC<{
  params: SimulationParams;
  readings: SensorReadings;
  activePrinciple: PrincipleType;
}> = ({ params, readings, activePrinciple }) => {
  // Reusable Component for a single metric block
  const MetricBlock = ({
    label,
    value,
    unit,
    color,
    align = "center",
  }: any) => (
    <div
      className={`flex flex-col ${
        align === "left"
          ? "items-start"
          : align === "right"
          ? "items-end"
          : "items-center"
      }`}
    >
      <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span
          className={`text-2xl md:text-3xl font-mono font-bold ${color} leading-none drop-shadow-md`}
        >
          {value}
        </span>
        <span className="text-xs text-slate-500 font-medium">{unit}</span>
      </div>
    </div>
  );

  const OverlayContainer = ({ title, icon: Icon, children, footer }: any) => (
    <div className="absolute top-2 left-2 right-2 md:left-auto md:right-4 md:w-80 z-50 flex flex-col gap-2 pointer-events-none">
      {/* Main Card */}
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 p-4 rounded-2xl shadow-2xl pointer-events-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
          <div className="p-1.5 bg-slate-800 rounded-lg">
            <Icon size={16} className="text-blue-400" />
          </div>
          <span className="text-sm font-bold text-slate-200 uppercase tracking-wide">
            {title}
          </span>
        </div>

        {/* Content Grid: In -> Out */}
        <div className="flex justify-between items-center px-1">{children}</div>

        {/* Optional Footer/Status */}
        {footer && (
          <div className="mt-3 pt-2 border-t border-slate-800/50">{footer}</div>
        )}
      </div>
    </div>
  );

  switch (activePrinciple) {
    case PrincipleType.PRESSURE:
      const pressDrop = params.inputPressure - readings.pressureOut;
      return (
        <OverlayContainer
          title="Pressure Dynamics"
          icon={BarChart3}
          footer={
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Pressure Drop (ΔP)</span>
              <span
                className={`font-mono font-bold ${
                  pressDrop > 1000
                    ? "text-red-400 animate-pulse"
                    : "text-slate-300"
                }`}
              >
                {(pressDrop / 1000).toFixed(1)} kPa
              </span>
            </div>
          }
        >
          <MetricBlock
            align="left"
            label="Inlet (Pin)"
            value={(params.inputPressure / 1000).toLocaleString()}
            unit="kPa"
            color="text-blue-400"
          />
          <ArrowRight className="text-slate-600 opacity-50" size={20} />
          <MetricBlock
            align="right"
            label="Outlet (Pout)"
            value={(readings.pressureOut / 1000).toFixed(1)}
            unit="kPa"
            color="text-emerald-400"
          />
        </OverlayContainer>
      );
    case PrincipleType.FLOW:
      const flowLoss = params.inputFlowRate - readings.flowOut;
      return (
        <OverlayContainer
          title="Mass Balance"
          icon={Activity}
          footer={
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Volume Loss</span>
              <span
                className={`font-mono font-bold ${
                  flowLoss > 0.1
                    ? "text-red-400 animate-pulse"
                    : "text-slate-300"
                }`}
              >
                {flowLoss.toFixed(2)} m³/s
              </span>
            </div>
          }
        >
          <MetricBlock
            align="left"
            label="Inflow (Qin)"
            value={params.inputFlowRate}
            unit="m³/s"
            color="text-blue-400"
          />
          <ArrowRight className="text-slate-600 opacity-50" size={20} />
          <MetricBlock
            align="right"
            label="Outflow (Qout)"
            value={readings.flowOut.toFixed(2)}
            unit="m³/s"
            color="text-emerald-400"
          />
        </OverlayContainer>
      );
    case PrincipleType.THERMAL:
      return (
        <OverlayContainer title="Thermodynamics" icon={Thermometer}>
          <MetricBlock
            align="left"
            label="Fluid Temp"
            value={params.fluidTemperature}
            unit="°C"
            color="text-rose-400"
          />
          <ArrowRight className="text-slate-600 opacity-50" size={20} />
          <MetricBlock
            align="right"
            label="Soil Sensor"
            value={readings.soilTempReading.toFixed(1)}
            unit="°C"
            color="text-orange-400"
          />
        </OverlayContainer>
      );
    case PrincipleType.ACOUSTIC:
      return (
        <OverlayContainer title="Vibro-Acoustics" icon={Zap}>
          <MetricBlock
            align="left"
            label="Baseline"
            value={(params.inputFlowRate / 2 + 10).toFixed(1)}
            unit="dB"
            color="text-slate-500"
          />
          <ArrowRight className="text-slate-600 opacity-50" size={20} />
          <MetricBlock
            align="right"
            label="Measured"
            value={readings.vibrationIntensity.toFixed(1)}
            unit="dB"
            color={
              readings.vibrationIntensity > 40
                ? "text-amber-400"
                : "text-emerald-400"
            }
          />
        </OverlayContainer>
      );
    case PrincipleType.IMPEDANCE:
      return (
        <OverlayContainer title="Soil Impedance" icon={Droplets}>
          <MetricBlock
            align="left"
            label="Saturation"
            value={(readings.soilMoisture * 100).toFixed(0)}
            unit="%"
            color="text-cyan-400"
          />
          <div className="h-8 w-[1px] bg-slate-700"></div>
          <MetricBlock
            align="right"
            label="Resistivity"
            value={Math.round(10000 * (1 - readings.soilMoisture))}
            unit="Ω"
            color="text-slate-300"
          />
        </OverlayContainer>
      );
    default:
      return null;
  }
};

// --- 2. In-Scene 3D Labels (Contextual) ---
const InSceneLabels: React.FC<{
  params: SimulationParams;
  readings: SensorReadings;
  activePrinciple: PrincipleType;
}> = ({ params, readings, activePrinciple }) => {
  // Label Component - Moved slightly to avoid overlap
  const Label3D = ({ position, label, value, unit, color }: any) => (
    <Html position={position} center distanceFactor={15} zIndexRange={[10, 0]}>
      <div className="flex flex-col items-center pointer-events-none opacity-80 hover:opacity-100 transition-opacity">
        <div
          className={`bg-slate-950/80 backdrop-blur-sm border border-slate-700 px-2 py-1 rounded-md shadow-lg flex flex-col items-center`}
        >
          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
            {label}
          </span>
          <div className="flex items-baseline gap-0.5">
            <span className={`text-sm font-mono font-bold ${color}`}>
              {value}
            </span>
            <span className="text-[8px] text-slate-500">{unit}</span>
          </div>
        </div>
        <div className="w-0.5 h-6 bg-slate-700/50"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
      </div>
    </Html>
  );

  switch (activePrinciple) {
    case PrincipleType.PRESSURE:
      return (
        <>
          <Label3D
            position={[-10, 2, 0]}
            label="Pin"
            value={(params.inputPressure / 1000).toLocaleString()}
            unit="kPa"
            color="text-blue-400"
          />
          <Label3D
            position={[10, 2, 0]}
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
            position={[-10, 2, 0]}
            label="Qin"
            value={params.inputFlowRate}
            unit="m³/s"
            color="text-blue-400"
          />
          <Label3D
            position={[10, 2, 0]}
            label="Qout"
            value={readings.flowOut.toFixed(2)}
            unit="m³/s"
            color="text-emerald-400"
          />
        </>
      );
    // ... (Other cases similar, kept minimal for clarity)
    default:
      return null;
  }
};

// --- 3. 3D Scene Components ---
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

      <group position={[-10, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>
      <group position={[10, 0, 0]}>
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
              ⚠️ LEAK DETECTED
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
      {/* 1. HUD OVERLAY (Top Center/Right) */}
      <ReadingsOverlay
        params={props.params}
        readings={props.readings}
        activePrinciple={props.activePrinciple}
      />

      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          {/* Camera optimized for mobile view */}
          <PerspectiveCamera makeDefault position={[0, 6, 24]} fov={40} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={5}
            maxDistance={50}
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
