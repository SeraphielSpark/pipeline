import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
  YAxis,
} from "recharts";
import { SensorReadings, PrincipleType, SimulationParams } from "../types";
import {
  Activity,
  Droplets,
  Thermometer,
  Zap,
  BarChart3,
  ArrowRight,
} from "lucide-react";

interface DashboardProps {
  history: SensorReadings[];
  currentReading: SensorReadings;
  activePrinciple: PrincipleType;
  params: SimulationParams;
}

const ChartCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}> = ({ title, icon, children, fullWidth }) => (
  <div
    className={`bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col h-64 shadow-lg ${
      fullWidth ? "col-span-1 md:col-span-2 lg:col-span-3" : ""
    }`}
  >
    <div className="flex justify-between items-start mb-2">
      <div className="flex items-center gap-2">
        <div className="text-slate-400">{icon}</div>
        <span className="text-slate-300 font-medium text-sm uppercase tracking-wider">
          {title}
        </span>
      </div>
    </div>
    <div className="flex-1 w-full min-h-0 relative">{children}</div>
  </div>
);

// New Component for Input vs Output comparison
const ComparisonDisplay: React.FC<{
  labelIn: string;
  valueIn: string | number;
  labelOut: string;
  valueOut: string | number;
  unit: string;
}> = ({ labelIn, valueIn, labelOut, valueOut, unit }) => (
  <div className="flex items-center justify-center gap-4 md:gap-12 mb-4 bg-slate-900/50 p-6 rounded-xl border border-slate-800 shadow-inner">
    <div className="text-center">
      <div className="text-[10px] md:text-xs text-slate-500 uppercase font-bold mb-1 tracking-widest">
        {labelIn}
      </div>
      <div className="text-2xl md:text-4xl font-mono font-bold text-blue-400">
        {valueIn}
      </div>
      <div className="text-[10px] text-slate-600">{unit}</div>
    </div>

    <div className="text-slate-700">
      <ArrowRight size={24} />
    </div>

    <div className="text-center">
      <div className="text-[10px] md:text-xs text-slate-500 uppercase font-bold mb-1 tracking-widest">
        {labelOut}
      </div>
      <div className="text-2xl md:text-4xl font-mono font-bold text-emerald-400">
        {valueOut}
      </div>
      <div className="text-[10px] text-slate-600">{unit}</div>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({
  history,
  currentReading,
  activePrinciple,
  params,
}) => {
  const recentHistory = history.slice(-50);

  // 1. PRESSURE VIEW (Pin vs Pout)
  if (activePrinciple === PrincipleType.PRESSURE) {
    return (
      <div className="p-4 space-y-4">
        <ComparisonDisplay
          labelIn="Pin (Source)"
          valueIn={(params.inputPressure / 1000).toLocaleString()}
          labelOut="Pout (Sensor)"
          valueOut={(currentReading.pressureOut / 1000).toFixed(1)}
          unit="kPa"
        />
        <div className="h-64 bg-slate-900 border border-slate-800 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={recentHistory}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fill: "#475569", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  color: "#fff",
                }}
              />
              <ReferenceLine
                y={params.inputPressure}
                stroke="#3b82f6"
                strokeDasharray="3 3"
                label={{ value: "Pin", fill: "#3b82f6", fontSize: 10 }}
              />
              <Line
                type="monotone"
                dataKey="pressureOut"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
                name="Pout"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // 2. FLOW VIEW (Qin vs Qout)
  if (activePrinciple === PrincipleType.FLOW) {
    return (
      <div className="p-4 space-y-4">
        <ComparisonDisplay
          labelIn="Qin (Source)"
          valueIn={params.inputFlowRate}
          labelOut="Qout (Sensor)"
          valueOut={currentReading.flowOut.toFixed(2)}
          unit="m³/s"
        />
        <div className="h-64 bg-slate-900 border border-slate-800 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={recentHistory}>
              <defs>
                <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <YAxis
                domain={[0, "auto"]}
                tick={{ fill: "#475569", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  color: "#fff",
                }}
              />
              <ReferenceLine
                y={params.inputFlowRate}
                stroke="#60a5fa"
                strokeDasharray="3 3"
                label={{ value: "Qin", fill: "#60a5fa", fontSize: 10 }}
              />
              <Area
                type="monotone"
                dataKey="flowOut"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorFlow)"
                name="Qout"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // 3. THERMAL VIEW (Tfluid vs Tsoil)
  if (activePrinciple === PrincipleType.THERMAL) {
    return (
      <div className="p-4 space-y-4">
        <ComparisonDisplay
          labelIn="Tfluid (Internal)"
          valueIn={params.fluidTemperature}
          labelOut="Tsoil (External)"
          valueOut={currentReading.soilTempReading.toFixed(2)}
          unit="°C"
        />
        <div className="h-64 bg-slate-900 border border-slate-800 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={recentHistory}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fill: "#475569", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  color: "#fff",
                }}
              />
              <ReferenceLine
                y={params.fluidTemperature}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{ value: "Fluid", fill: "#ef4444", fontSize: 10 }}
              />
              <ReferenceLine
                y={params.soilTemperature}
                stroke="#94a3b8"
                strokeDasharray="3 3"
                label={{ value: "Ambient", fill: "#94a3b8", fontSize: 10 }}
              />
              <Line
                type="monotone"
                dataKey="soilTempReading"
                stroke="#fb7185"
                strokeWidth={3}
                dot={false}
                name="Measured Temp"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // 4. DEFAULT / OVERVIEW VIEW (Grid of all sensors)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 pb-20 md:pb-4">
      {/* Overview Charts */}
      <ChartCard title="Flow Differential" icon={<Activity size={16} />}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={recentHistory}>
            <defs>
              <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              vertical={false}
            />
            <ReferenceLine
              y={params.inputFlowRate}
              stroke="#64748b"
              strokeDasharray="3 3"
            />
            <Area
              type="monotone"
              dataKey="flowOut"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorFlow)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Pressure Head" icon={<BarChart3 size={16} />}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={recentHistory}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              vertical={false}
            />
            <ReferenceLine
              y={params.inputPressure}
              stroke="#64748b"
              strokeDasharray="3 3"
            />
            <Line
              type="monotone"
              dataKey="pressureOut"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Acoustic / Vibro" icon={<Zap size={16} />}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={recentHistory}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              vertical={false}
            />
            <Line
              type="step"
              dataKey="vibrationIntensity"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Soil Temperature" icon={<Thermometer size={16} />}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={recentHistory}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              vertical={false}
            />
            <Line
              type="monotone"
              dataKey="soilTempReading"
              stroke="#fb7185"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* LPI Gauge (Overview) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col h-64 shadow-lg relative overflow-hidden md:col-span-2">
        <h3 className="text-slate-300 font-medium text-sm flex items-center gap-2 mb-4">
          <Activity size={16} />
          LEAK PROBABILITY INDEX (LPI)
        </h3>

        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden relative">
            <div
              className={`h-full transition-all duration-300 ${
                currentReading.lpi > 0.7
                  ? "bg-red-500"
                  : currentReading.lpi > 0.4
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${currentReading.lpi * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between w-full text-xs text-slate-500 mt-2 font-mono">
            <span>SAFE</span>
            <span>WARNING</span>
            <span>CRITICAL</span>
          </div>

          <div className="mt-4 text-center">
            <div className="text-5xl font-bold text-white font-mono tracking-tighter">
              {(currentReading.lpi * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-widest">
              Confidence Interval: 98.2%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
