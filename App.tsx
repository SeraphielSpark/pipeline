import React, { useState, useEffect } from "react";
import { ControlPanel } from "./components/ControlPanel";
import { SimulationScene } from "./components/Simulation3D";
import { Dashboard } from "./components/Dashboard";
import { SimulationParams, SensorReadings, PrincipleType } from "./types";
import { calculateNextState } from "./utils/physics";
import { UPDATE_INTERVAL_MS, HISTORY_LENGTH } from "./constants";

const INITIAL_PARAMS: SimulationParams = {
  inputPressure: 250000,
  inputFlowRate: 15,
  fluidTemperature: 60,
  soilTemperature: 15,
  soilPorosity: 0.4,
  isLeaking: false,
  leakSeverity: 0.5,
};

const INITIAL_READINGS: SensorReadings = {
  timestamp: Date.now(),
  pressureOut: 250000,
  flowOut: 15,
  soilMoisture: 0.05,
  vibrationIntensity: 1.5,
  soilTempReading: 15,
  lpi: 0,
};

const App: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>(INITIAL_PARAMS);
  const [selectedPrinciple, setSelectedPrinciple] = useState<PrincipleType>(
    PrincipleType.OVERVIEW
  );
  const [readings, setReadings] = useState<SensorReadings>(INITIAL_READINGS);
  const [history, setHistory] = useState<SensorReadings[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setReadings((prev) => {
        const next = calculateNextState(
          params,
          prev,
          UPDATE_INTERVAL_MS / 1000
        );
        setHistory((prevHist) => {
          const newHist = [...prevHist, next];
          if (newHist.length > HISTORY_LENGTH)
            return newHist.slice(newHist.length - HISTORY_LENGTH);
          return newHist;
        });
        return next;
      });
    }, UPDATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [params]);

  return (
    <>
      <div className="flex flex-col md:flex-row min-h-screen w-full bg-slate-950 text-white font-sans md:overflow-hidden">
        <ControlPanel
          params={params}
          setParams={setParams}
          selectedPrinciple={selectedPrinciple}
          setSelectedPrinciple={setSelectedPrinciple}
        />

        <div className="flex-1 flex flex-col h-full relative">
          <div className="h-[50vh] md:h-[55%] p-2 md:p-4 relative z-10 shrink-0">
            <SimulationScene params={params} readings={readings} />
          </div>

          <div className="flex-1 bg-slate-950 border-t border-slate-800 md:overflow-y-auto">
            <div className="sticky top-0 bg-slate-950/95 backdrop-blur z-20 px-6 py-2 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Real-Time Sensor Fusion Data
              </h2>
              <div className="flex gap-4 text-xs font-mono text-slate-500">
                <span>Samples: {history.length}</span>
                <span>Update Rate: {1000 / UPDATE_INTERVAL_MS}Hz</span>
              </div>
            </div>

            <div className="p-4 md:p-0">
              {/* Passed params here to enable Input vs Output comparison */}
              <Dashboard
                history={history}
                currentReading={readings}
                activePrinciple={selectedPrinciple}
                params={params}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
