import React, { useState } from "react";
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
  XAxis,
} from "recharts";
import { SensorReadings, PrincipleType, SimulationParams } from "../types";
import { Copy, Check, Activity } from "lucide-react";
import { PRINCIPLE_DETAILS } from "../constants";

interface DashboardProps {
  history: SensorReadings[];
  activePrinciple: PrincipleType;
  params: SimulationParams;
}

const FormulaCard: React.FC<{ principle: PrincipleType }> = ({ principle }) => {
  const [copied, setCopied] = useState(false);
  // Fallback to Pressure if overview is active (though UI hides it)
  const details = PRINCIPLE_DETAILS[principle] || PRINCIPLE_DETAILS["PRESSURE"];

  const handleCopy = () => {
    navigator.clipboard.writeText(details.formula);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between h-full shadow-lg relative overflow-hidden group">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={handleCopy}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors border border-slate-700"
          title="Copy Formula"
        >
          {copied ? (
            <Check size={14} className="text-emerald-500" />
          ) : (
            <Copy size={14} />
          )}
        </button>
      </div>
      <div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
          Governing Equation
        </div>
        <div className="font-mono text-sm md:text-base text-blue-300 bg-slate-950 p-3 rounded border border-slate-800 overflow-x-auto whitespace-nowrap">
          {details.formula}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
          Principle Description
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {details.description}
        </p>
      </div>
    </div>
  );
};

const ValueCard: React.FC<{
  label: string;
  value: string | number;
  unit: string;
  color: string;
  subLabel?: string;
}> = ({ label, value, unit, color, subLabel }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex-1 min-w-[140px] flex flex-col justify-center">
    <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">
      {label}
    </div>
    <div className={`text-3xl font-mono font-bold ${color}`}>
      {value} <span className="text-xs text-slate-600 font-normal">{unit}</span>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({
  history,
  activePrinciple,
  params,
}) => {
  const recentHistory = history.slice(-50);
  const currentReading = history[history.length - 1] || {
    pressureOut: 0,
    flowOut: 0,
    soilTempReading: 0,
    vibrationIntensity: 0,
    soilMoisture: 0,
  };

  const currentPrinciple =
    !activePrinciple || activePrinciple === "OVERVIEW"
      ? PrincipleType.FLOW
      : activePrinciple;

  const renderContent = () => {
    switch (currentPrinciple) {
      case PrincipleType.PRESSURE:
        return {
          input: {
            label: "Inlet (Pin)",
            val: (params.inputPressure / 1000).toLocaleString(),
            unit: "kPa",
          },
          output: {
            label: "Outlet (Pout)",
            val: (currentReading.pressureOut / 1000).toFixed(1),
            unit: "kPa",
          },
          chart: (
            <LineChart data={recentHistory}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <XAxis hide dataKey="timestamp" />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fill: "#475569", fontSize: 10 }}
                width={30}
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
                label={{
                  value: "Pin",
                  fill: "#3b82f6",
                  fontSize: 10,
                  position: "insideTopRight",
                }}
              />
              <Line
                type="monotone"
                dataKey="pressureOut"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
                name="Pout"
                isAnimationActive={false}
              />
            </LineChart>
          ),
        };
      case PrincipleType.FLOW:
        return {
          input: {
            label: "Inlet (Qin)",
            val: params.inputFlowRate,
            unit: "m³/s",
          },
          output: {
            label: "Outlet (Qout)",
            val: currentReading.flowOut.toFixed(2),
            unit: "m³/s",
          },
          chart: (
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
              <XAxis hide dataKey="timestamp" />
              <YAxis
                domain={[0, "auto"]}
                tick={{ fill: "#475569", fontSize: 10 }}
                width={30}
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
                label={{
                  value: "Qin",
                  fill: "#60a5fa",
                  fontSize: 10,
                  position: "insideTopRight",
                }}
              />
              <Area
                type="monotone"
                dataKey="flowOut"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorFlow)"
                name="Qout"
                isAnimationActive={false}
              />
            </AreaChart>
          ),
        };
      case PrincipleType.THERMAL:
        return {
          input: {
            label: "Fluid Temp",
            val: params.fluidTemperature,
            unit: "°C",
          },
          output: {
            label: "Soil Temp",
            val: currentReading.soilTempReading.toFixed(2),
            unit: "°C",
          },
          chart: (
            <LineChart data={recentHistory}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <XAxis hide dataKey="timestamp" />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fill: "#475569", fontSize: 10 }}
                width={30}
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
                label={{
                  value: "T-Fluid",
                  fill: "#ef4444",
                  fontSize: 10,
                  position: "insideTopRight",
                }}
              />
              <Line
                type="monotone"
                dataKey="soilTempReading"
                stroke="#fb7185"
                strokeWidth={3}
                dot={false}
                name="T-Soil"
                isAnimationActive={false}
              />
            </LineChart>
          ),
        };
      case PrincipleType.ACOUSTIC:
        return {
          input: {
            label: "Noise Floor",
            val: (params.inputFlowRate / 2 + 10).toFixed(1),
            unit: "dB",
          },
          output: {
            label: "Vibration",
            val: currentReading.vibrationIntensity.toFixed(2),
            unit: "dB",
          },
          chart: (
            <LineChart data={recentHistory}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <XAxis hide dataKey="timestamp" />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  color: "#fff",
                }}
              />
              <Line
                type="step"
                dataKey="vibrationIntensity"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                name="Vibration"
                isAnimationActive={false}
              />
            </LineChart>
          ),
        };
      case PrincipleType.IMPEDANCE:
        return {
          input: { label: "Porosity", val: params.soilPorosity, unit: "φ" },
          output: {
            label: "Resistivity",
            val: Math.round(10000 * (1 - currentReading.soilMoisture)),
            unit: "Ω",
          },
          chart: (
            <AreaChart data={recentHistory}>
              <defs>
                <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <XAxis hide dataKey="timestamp" />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="soilMoisture"
                stroke="#22d3ee"
                fill="url(#colorImp)"
                name="Moisture"
                isAnimationActive={false}
              />
            </AreaChart>
          ),
        };
      default:
        return null;
    }
  };

  const content = renderContent();
  if (!content)
    return <div className="p-4 text-slate-500">Initializing...</div>;

  return (
    <div className="flex flex-col md:flex-row h-full gap-4 p-4 md:p-0">
      {/* Left Column: Data & Formula */}
      <div className="w-full md:w-[35%] flex flex-col gap-4">
        {/* Value Cards */}
        <div className="flex gap-2">
          <ValueCard
            label={content.input.label}
            value={content.input.val}
            unit={content.input.unit}
            color="text-blue-400"
          />
          <ValueCard
            label={content.output.label}
            value={content.output.val}
            unit={content.output.unit}
            color="text-emerald-400"
          />
        </div>

        {/* Formula */}
        <div className="flex-1 min-h-[150px]">
          <FormulaCard principle={currentPrinciple} />
        </div>
      </div>

      {/* Right Column: Chart */}
      <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-lg p-4 relative flex flex-col min-h-[300px] md:min-h-0">
        <div className="flex items-center gap-2 mb-2">
          <Activity size={14} className="text-slate-400" />
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Live Sensor Trend
          </h3>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            {content.chart}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
