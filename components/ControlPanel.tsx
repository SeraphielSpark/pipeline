import React from "react";
import { SimulationParams, PrincipleType } from "../types";
import { Play, Square, Settings, ChevronRight, Activity } from "lucide-react";
import { PRINCIPLE_DETAILS } from "../constants";

interface ControlPanelProps {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  selectedPrinciple: PrincipleType;
  setSelectedPrinciple: (p: PrincipleType) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  params,
  setParams,
  selectedPrinciple,
  setSelectedPrinciple,
}) => {
  const handleToggleLeak = () => {
    setParams((prev) => ({ ...prev, isLeaking: !prev.isLeaking }));
  };

  const handleChange = (key: keyof SimulationParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const principles = Object.keys(PRINCIPLE_DETAILS) as PrincipleType[];

  return (
    <div className="w-full md:w-80 flex flex-col bg-slate-900 border-b md:border-r border-slate-800 shrink-0 h-[40vh] md:h-full shadow-xl z-20">
      {/* Minimal Header */}
      <div className="px-4 py-3 bg-slate-950 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500/20 p-1.5 rounded-lg">
            <Settings className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-200 tracking-wide">
              SENTINEL OS
            </h1>
            <p className="text-[10px] text-slate-500 font-mono">
              Pipeline v1.0
            </p>
          </div>
        </div>
        <div className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-500 font-mono border border-slate-800">
          {params.isLeaking ? "⚠️ ALERT" : "● ONLINE"}
        </div>
      </div>

      {/* Primary Action - STICKY / ALWAYS VISIBLE */}
      <div className="p-4 bg-slate-900 border-b border-slate-800">
        <button
          onClick={handleToggleLeak}
          className={`w-full py-3 rounded-xl font-bold text-sm tracking-widest shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 border
            ${
              params.isLeaking
                ? "bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20 shadow-red-900/20 animate-pulse"
                : "bg-emerald-500/10 border-emerald-500 text-emerald-400 hover:bg-emerald-500/20 shadow-emerald-900/20"
            }`}
        >
          {params.isLeaking ? (
            <>
              <Square size={16} fill="currentColor" /> STOP SIMULATION
            </>
          ) : (
            <>
              <Play size={16} fill="currentColor" /> INITIATE LEAK
            </>
          )}
        </button>
      </div>

      {/* Scrollable Settings Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-900/50">
        {/* Leak Slider (Conditional) */}
        {params.isLeaking && (
          <div className="bg-red-950/30 border border-red-900/50 p-3 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center">
              <label className="text-xs text-red-300 font-bold uppercase tracking-wider">
                Hole Size
              </label>
              <span className="text-xs font-mono text-red-400">
                {(params.leakSeverity * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={params.leakSeverity}
              onChange={(e) =>
                handleChange("leakSeverity", parseFloat(e.target.value))
              }
              className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        )}

        {/* Minimal Principle Tabs */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            View Mode
          </h3>
          <div className="flex flex-wrap gap-1">
            {principles.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPrinciple(p)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-all
                        ${
                          selectedPrinciple === p
                            ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50"
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                        }`}
              >
                {p === "OVERVIEW"
                  ? "Overview"
                  : p.charAt(0) + p.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Environmental Controls */}
        <div className="space-y-4 pt-2">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Activity size={12} /> System Inputs
          </h3>

          {/* Simplified Sliders */}
          {[
            {
              label: "Pressure",
              val: params.inputPressure,
              key: "inputPressure",
              min: 100000,
              max: 500000,
              step: 1000,
              unit: "Pa",
            },
            {
              label: "Flow Rate",
              val: params.inputFlowRate,
              key: "inputFlowRate",
              min: 1,
              max: 50,
              step: 0.5,
              unit: "m³/s",
            },
            {
              label: "Temperature",
              val: params.fluidTemperature,
              key: "fluidTemperature",
              min: 5,
              max: 90,
              step: 1,
              unit: "°C",
            },
          ].map((item) => (
            <div key={item.key} className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>{item.label}</span>
                <span className="font-mono text-slate-200">
                  {item.val.toLocaleString()}{" "}
                  <span className="text-slate-600">{item.unit}</span>
                </span>
              </div>
              <input
                type="range"
                min={item.min}
                max={item.max}
                step={item.step}
                value={item.val}
                onChange={(e) =>
                  handleChange(item.key as any, parseFloat(e.target.value))
                }
                className="w-full accent-blue-500 h-1 bg-slate-800 rounded appearance-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
