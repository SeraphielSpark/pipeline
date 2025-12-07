import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { SensorReadings, PrincipleType } from '../types';
import { Activity, Droplets, Thermometer, Zap, BarChart3 } from 'lucide-react';

interface DashboardProps {
  history: SensorReadings[];
  currentReading: SensorReadings;
  activePrinciple: PrincipleType;
}

const ChartCard: React.FC<{ title: string; icon: React.ReactNode; value: string | number; unit: string; color: string; children: React.ReactNode }> = ({ title, icon, value, unit, color, children }) => (
  <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex flex-col h-64 shadow-lg">
    <div className="flex justify-between items-start mb-2">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded bg-slate-800 ${color}`}>{icon}</div>
        <span className="text-slate-300 font-medium text-sm">{title}</span>
      </div>
      <div className="text-right">
        <div className="text-xl font-mono font-bold text-white">{value}</div>
        <div className="text-xs text-slate-500">{unit}</div>
      </div>
    </div>
    <div className="flex-1 w-full min-h-0">
      {children}
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ history, currentReading, activePrinciple }) => {
  // Filter history to last 30 points for cleaner graphs
  const recentHistory = history.slice(-30);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      
      {/* Flow Rate Chart (Principle I) */}
      <div className={activePrinciple === PrincipleType.FLOW ? "ring-2 ring-blue-500 rounded-lg" : ""}>
        <ChartCard 
          title="Flow Differential" 
          icon={<Activity size={16} />}
          value={(currentReading.flowOut).toFixed(2)}
          unit="m³/s"
          color="text-blue-400"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={recentHistory}>
              <defs>
                <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                itemStyle={{ color: '#60a5fa' }}
                formatter={(val: number) => [val.toFixed(2), 'Flow Out']}
                labelStyle={{ display: 'none' }}
              />
              <Area type="monotone" dataKey="flowOut" stroke="#3b82f6" fillOpacity={1} fill="url(#colorFlow)" animationDuration={300} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Pressure Chart (Principle II) */}
      <div className={activePrinciple === PrincipleType.PRESSURE ? "ring-2 ring-blue-500 rounded-lg" : ""}>
        <ChartCard 
          title="Pressure Head" 
          icon={<BarChart3 size={16} />}
          value={(currentReading.pressureOut / 1000).toFixed(1)}
          unit="kPa"
          color="text-emerald-400"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={recentHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                formatter={(val: number) => [(val/1000).toFixed(1) + ' kPa', 'Pressure']}
                labelStyle={{ display: 'none' }}
              />
              <Line type="monotone" dataKey="pressureOut" stroke="#10b981" strokeWidth={2} dot={false} animationDuration={300} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

       {/* Acoustic Chart (Principle IV) */}
       <div className={activePrinciple === PrincipleType.ACOUSTIC ? "ring-2 ring-blue-500 rounded-lg" : ""}>
        <ChartCard 
          title="Acoustic / Vibro" 
          icon={<Zap size={16} />}
          value={currentReading.vibrationIntensity.toFixed(1)}
          unit="dB-Hz"
          color="text-amber-400"
        >
          <ResponsiveContainer width="100%" height="100%">
             <LineChart data={recentHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                labelStyle={{ display: 'none' }}
              />
              <Line type="step" dataKey="vibrationIntensity" stroke="#f59e0b" strokeWidth={2} dot={false} animationDuration={300} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Temp Chart (Principle III) */}
      <div className={activePrinciple === PrincipleType.THERMAL ? "ring-2 ring-blue-500 rounded-lg" : ""}>
        <ChartCard 
          title="Soil Temperature" 
          icon={<Thermometer size={16} />}
          value={currentReading.soilTempReading.toFixed(2)}
          unit="°C"
          color="text-rose-400"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={recentHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
               <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                labelStyle={{ display: 'none' }}
              />
              <Line type="monotone" dataKey="soilTempReading" stroke="#fb7185" strokeWidth={2} dot={false} animationDuration={300} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Impedance Chart (Principle V) */}
      <div className={activePrinciple === PrincipleType.IMPEDANCE ? "ring-2 ring-blue-500 rounded-lg" : ""}>
        <ChartCard 
          title="Soil Impedance" 
          icon={<Droplets size={16} />}
          value={Math.round(10000 * (1 - currentReading.soilMoisture))}
          unit="Ω (Ohms)"
          color="text-cyan-400"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={recentHistory}>
                <defs>
                <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <YAxis hide />
              <Tooltip 
                 contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                 formatter={(val: number) => [Math.round(10000 * (1 - val)) + ' Ω', 'Resistivity']}
                 labelStyle={{ display: 'none' }}
              />
              <Area type="monotone" dataKey="soilMoisture" stroke="#22d3ee" fill="url(#colorImp)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

       {/* LPI Gauge (Overview) */}
       <div className={activePrinciple === PrincipleType.OVERVIEW ? "ring-2 ring-blue-500 rounded-lg" : ""}>
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex flex-col h-64 shadow-lg relative overflow-hidden">
            <h3 className="text-slate-300 font-medium text-sm flex items-center gap-2">
                <div className="p-1.5 rounded bg-slate-800 text-purple-400"><Activity size={16} /></div>
                Leak Probability Index (LPI)
            </h3>
            
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-40 h-20 overflow-hidden mt-4">
                     <div className="absolute top-0 left-0 w-full h-full bg-slate-800 rounded-t-full"></div>
                     <div 
                        className={`absolute top-0 left-0 w-full h-full rounded-t-full origin-bottom transition-transform duration-500 ease-out`}
                        style={{ 
                            backgroundColor: currentReading.lpi > 0.7 ? '#ef4444' : currentReading.lpi > 0.4 ? '#f59e0b' : '#10b981',
                            transform: `rotate(${(currentReading.lpi * 180) - 180}deg)`
                        }}
                     ></div>
                </div>
                <div className="text-4xl font-bold mt-[-10px] z-10 text-white font-mono">
                    {(currentReading.lpi * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-slate-400 mt-2 text-center uppercase tracking-widest">
                    {currentReading.lpi > 0.7 ? 'CRITICAL DANGER' : currentReading.lpi > 0.4 ? 'WARNING' : 'SYSTEM SECURE'}
                </div>
            </div>
            
            {/* LPI Equation Visualization */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"></div>
        </div>
      </div>

    </div>
  );
};
