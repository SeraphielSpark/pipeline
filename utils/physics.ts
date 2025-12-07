import { SimulationParams, SensorReadings } from '../types';
import { FLUID_DENSITY, DISCHARGE_COEFF, ATMOSPHERIC_PRESSURE } from '../constants';

export const calculateNextState = (
  params: SimulationParams,
  prevReading: SensorReadings,
  deltaTime: number
): SensorReadings => {
  const { inputPressure, inputFlowRate, isLeaking, leakSeverity, fluidTemperature, soilTemperature } = params;

  // --- 1. Flow (Bernoulli / Continuity): Q_leak = Qin - Qout ---
  // If leaking, we lose some flow proportional to severity
  let leakFlow = 0;
  if (isLeaking) {
      // Arbitrary leak scale for simulation: max leak is 40% of flow at max severity
      leakFlow = inputFlowRate * (leakSeverity * 0.4); 
  }
  // Add slight fluctuation noise
  const flowNoise = (Math.random() - 0.5) * 0.2;
  const flowOut = Math.max(0, inputFlowRate - leakFlow + flowNoise);

  // --- 2. Pressure (Pascal): P_drop = Pin - Pout ---
  // Pressure drop is proportional to flow loss (Bernoulli relationship)
  let pressureDrop = 0;
  if (isLeaking) {
      // More severe leak = higher pressure drop
      pressureDrop = inputPressure * (leakSeverity * 0.5); 
  }
  const pressureNoise = (Math.random() - 0.5) * 1000;
  const pressureOut = Math.max(ATMOSPHERIC_PRESSURE, inputPressure - pressureDrop + pressureNoise);

  // --- 3. Soil Impedance (Moisture) ---
  // If leaking, moisture -> 1.0. If not, dries -> 0.05
  const targetMoisture = isLeaking ? 0.95 : 0.05;
  const moistureRate = isLeaking ? 0.1 : 0.02; 
  const newMoisture = prevReading.soilMoisture + (targetMoisture - prevReading.soilMoisture) * moistureRate;

  // --- 4. Thermal (Temp Difference) ---
  // If leaking, Soil Temp approaches Fluid Temp. If not, approaches Ambient Soil Temp.
  const targetTemp = isLeaking ? fluidTemperature : soilTemperature;
  const tempRate = isLeaking ? 0.08 : 0.01; // Water transfers heat faster than air
  const tempNoise = (Math.random() - 0.5) * 0.1;
  const newTemp = prevReading.soilTempReading + (targetTemp - prevReading.soilTempReading) * tempRate + tempNoise;

  // --- 5. Acoustic (Vibration) ---
  // Baseline flow noise + Leak noise
  const baselineNoise = 10 + (inputFlowRate / 2); // Flow generates some noise
  const leakNoise = isLeaking ? (leakSeverity * 80) : 0; // Leaks are loud
  const vibration = baselineNoise + leakNoise + (Math.random() * 2);

  // --- Grand Formula: LPI Calculation ---
  // Weighted sum of normalized deviations
  
  // 1. Flow Deviation (0 to 1)
  const flowDev = Math.max(0, (inputFlowRate - flowOut) / inputFlowRate);
  
  // 2. Pressure Deviation (0 to 1)
  const pressDev = Math.max(0, (inputPressure - pressureOut) / inputPressure);
  
  // 3. Moisture Level (0 to 1)
  const moistDev = newMoisture;

  // 4. Acoustic Spike (normalized against expected max of ~100dB)
  const acoustDev = Math.min(1, Math.max(0, (vibration - 20) / 80));

  // Weights
  const lpi = (0.3 * flowDev) + (0.2 * pressDev) + (0.3 * moistDev) + (0.2 * acoustDev);

  return {
    timestamp: Date.now(),
    flowOut,
    pressureOut,
    soilMoisture: newMoisture,
    soilTempReading: newTemp,
    vibrationIntensity: vibration,
    lpi
  };
};