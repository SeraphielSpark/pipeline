import React from 'react';
import { SimulationParams, PrincipleType } from '../types';
import { Play, AlertTriangle, Settings, Wind, Thermometer, Info } from 'lucide-react';
import { PRINCIPLE_DETAILS } from '../constants';

interface ControlPanelProps {
  params: SimulationParams;
  setParams: React.Dispatch<React.SetStateAction<SimulationParams>>;
  selectedPrinciple: PrincipleType;
  setSelectedPrinciple: (p: PrincipleType) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ params, setParams, selectedPrinciple, setSelectedPrinciple }) => {
  
  const handleToggleLeak = () => {
    setParams(prev => ({ ...prev, isLeaking: !prev.isLeaking }));
  };

  const handleChange = (key: keyof SimulationParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const principles = Object.keys(PRINCIPLE_DETAILS) as PrincipleType[];

  return (
    <div className="h-full bg-slate-900 border-r border-slate-700 w-80 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-700 bg-slate-950">
        <h1 className="text-lg font-bold text-blue-400 tracking-wider flex items-center gap-2">
            <Settings className="w-5 h-5" />
            SENTINEL OS
        </h1>
        <p className="text-xs text-slate-500 mt-1">Underground Pipeline Monitor v1.0</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Main Trigger */}
        <button
            onClick={handleToggleLeak}
            className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-3
            ${params.isLeaking 
                ? 'bg-red-600 hover:bg-red-700 shadow-red-900/50 animate-pulse' 
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/50'}`}
        >
            {params.isLeaking ? <><AlertTriangle /> STOP SIMULATION</> : <><Play /> TRIGGER LEAK</>}
        </button>

        {/* Leak Properties */}
        {params.isLeaking && (
            <div className="bg-red-900/20 border border-red-800 p-3 rounded-lg space-y-2">
                <label className="text-xs text-red-300 font-mono uppercase">Leak Severity (Hole Size)</label>
                <input 
                    type="range" 
                    min="0.1" 
                    max="1.0" 
                    step="0.05"
                    value={params.leakSeverity}
                    onChange={(e) => handleChange('leakSeverity', parseFloat(e.target.value))}
                    className="w-full accent-red-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        )}

        {/* Principle Selector */}
        <div className="space-y-2">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Analysis Logic</h3>
             <div className="grid grid-cols-1 gap-1">
                 {principles.map(p => (
                     <button
                        key={p}
                        onClick={() => setSelectedPrinciple(p)}
                        className={`text-left px-3 py-2 text-sm rounded transition-colors flex items-center justify-between
                        ${selectedPrinciple === p ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                     >
                        {p === 'OVERVIEW' ? 'Grand Formula (LPI)' : p.charAt(0) + p.slice(1).toLowerCase()}
                        {selectedPrinciple === p && <div className="w-2 h-2 bg-white rounded-full"></div>}
                     </button>
                 ))}
             </div>
        </div>

        {/* Input Parameters */}
        <div className="space-y-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700 pb-2">Environment Inputs</h3>
             
             <div className={`space-y-1 ${selectedPrinciple === 'PRESSURE' ? 'bg-blue-900/20 p-2 rounded -mx-2' : ''}`}>
                 <label className="text-xs text-slate-300 flex justify-between">
                    <span>Input Pressure (Pa)</span>
                    <span className="font-mono text-blue-400">{params.inputPressure.toLocaleString()}</span>
                 </label>
                 <input 
                    type="range" min="100000" max="500000" step="1000"
                    value={params.inputPressure}
                    onChange={(e) => handleChange('inputPressure', parseFloat(e.target.value))}
                    className="w-full accent-blue-500 h-1 bg-slate-700 rounded appearance-none"
                 />
             </div>

             <div className={`space-y-1 ${selectedPrinciple === 'FLOW' ? 'bg-blue-900/20 p-2 rounded -mx-2' : ''}`}>
                 <label className="text-xs text-slate-300 flex justify-between">
                    <span>Flow Rate (m³/s)</span>
                    <span className="font-mono text-blue-400">{params.inputFlowRate}</span>
                 </label>
                 <input 
                    type="range" min="1" max="50" step="0.5"
                    value={params.inputFlowRate}
                    onChange={(e) => handleChange('inputFlowRate', parseFloat(e.target.value))}
                    className="w-full accent-blue-500 h-1 bg-slate-700 rounded appearance-none"
                 />
             </div>

             <div className={`space-y-1 ${selectedPrinciple === 'THERMAL' ? 'bg-blue-900/20 p-2 rounded -mx-2' : ''}`}>
                 <label className="text-xs text-slate-300 flex justify-between">
                    <span className="flex gap-1"><Thermometer size={12}/> Fluid Temp (°C)</span>
                    <span className="font-mono text-blue-400">{params.fluidTemperature}</span>
                 </label>
                 <input 
                    type="range" min="5" max="90"
                    value={params.fluidTemperature}
                    onChange={(e) => handleChange('fluidTemperature', parseFloat(e.target.value))}
                    className="w-full accent-blue-500 h-1 bg-slate-700 rounded appearance-none"
                 />
             </div>

              <div className={`space-y-1 ${selectedPrinciple === 'THERMAL' ? 'bg-blue-900/20 p-2 rounded -mx-2' : ''}`}>
                 <label className="text-xs text-slate-300 flex justify-between">
                    <span>Soil Temp (°C)</span>
                    <span className="font-mono text-blue-400">{params.soilTemperature}</span>
                 </label>
                 <input 
                    type="range" min="-10" max="40"
                    value={params.soilTemperature}
                    onChange={(e) => handleChange('soilTemperature', parseFloat(e.target.value))}
                    className="w-full accent-blue-500 h-1 bg-slate-700 rounded appearance-none"
                 />
             </div>

             <div className={`space-y-1 ${selectedPrinciple === 'IMPEDANCE' ? 'bg-blue-900/20 p-2 rounded -mx-2' : ''}`}>
                 <label className="text-xs text-slate-300 flex justify-between">
                    <span>Soil Porosity</span>
                    <span className="font-mono text-blue-400">{params.soilPorosity}</span>
                 </label>
                 <input 
                    type="range" min="0.1" max="0.8" step="0.05"
                    value={params.soilPorosity}
                    onChange={(e) => handleChange('soilPorosity', parseFloat(e.target.value))}
                    className="w-full accent-blue-500 h-1 bg-slate-700 rounded appearance-none"
                 />
             </div>
        </div>
      </div>
      
      {/* Principle Info Card */}
      <div className="bg-slate-800 p-4 border-t border-slate-700">
        <h4 className="text-blue-300 text-xs font-bold mb-1 flex items-center gap-1">
            <Info size={12}/> {PRINCIPLE_DETAILS[selectedPrinciple].title}
        </h4>
        <div className="text-[10px] text-slate-400 mb-2 font-mono bg-slate-950 p-2 rounded border border-slate-700">
            {PRINCIPLE_DETAILS[selectedPrinciple].formula}
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
            {PRINCIPLE_DETAILS[selectedPrinciple].description}
        </p>
      </div>
    </div>
  );
};
