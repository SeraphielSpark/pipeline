import { SimulationParams, SensorReadings } from '../types';
import { FLUID_DENSITY, DISCHARGE_COEFF, ATMOSPHERIC_PRESSURE } from '../constants';

export const calculateNextState = (
  params: SimulationParams,
  prevReading: SensorReadings,
  deltaTime: number
): SensorReadings => {
  const { inputPressure, inputFlowRate, isLeaking, leakSeverity, fluidTemperature, soilTemperature } = params;

  // 1. Principle I: Mass Balance (Flow)
  // If leak, Flow Out = Flow In - Leak Flow
  let leakFlow = 0;
  if (isLeaking) {
      // Simplified Orifice Equation for Leak Flow
      // Q_leak = Cd * A * sqrt(2 * dP / rho)
      // Area is proportional to leakSeverity
      const area = leakSeverity * 0.05; 
      const pressureDiff = Math.max(0, inputPressure - ATMOSPHERIC_PRESSURE);
      leakFlow = DISCHARGE_COEFF * area * Math.sqrt((2 * pressureDiff) / FLUID_DENSITY);
  }
  
  // Add some noise
  const flowNoise = (Math.random() - 0.5) * 0.1;
  const flowOut = Math.max(0, inputFlowRate - leakFlow + flowNoise);

  // 2. Principle II: Pressure Dynamics
  // Leak causes pressure drop proportional to flow loss
  const pressureDrop = isLeaking ? (leakFlow / inputFlowRate) * inputPressure * 1.5 : 0;
  const pressureNoise = (Math.random() - 0.5) * 500;
  const pressureOut = Math.max(ATMOSPHERIC_PRESSURE, inputPressure - pressureDrop + pressureNoise);

  // 3. Principle V: Soil Impedance (Moisture Accumulation)
  // If leaking, soil moisture increases over time towards 1.0. If not, dries slowly.
  let targetMoisture = isLeaking ? 1.0 : 0.05;
  let moistureChangeRate = isLeaking ? 0.05 : 0.01; // Wets fast, dries slow
  const newMoisture = prevReading.soilMoisture + (targetMoisture - prevReading.soilMoisture) * moistureChangeRate;

  // 4. Principle III: Thermodynamics
  // Soil temp shifts towards fluid temp if wet (leaking)
  // dT/dt propto Q_leak
  const thermalConductivity = 0.02 * (1 + newMoisture * 5); // Wet soil conducts better
  const tempDiff = fluidTemperature - prevReading.soilTempReading;
  const tempChange = tempDiff * thermalConductivity * deltaTime;
  // If not leaking, slowly return to ambient soil temp
  const ambientPull = !isLeaking ? (soilTemperature - prevReading.soilTempReading) * 0.01 : 0;
  const newTemp = prevReading.soilTempReading + tempChange + ambientPull;

  // 5. Principle IV: Acoustic
  // Vibration propto Leak Velocity and Flow Turbulence
  const baseVibration = (inputFlowRate / 10); // Normal flow noise
  const leakVibration = isLeaking ? (leakSeverity * 50) + (Math.random() * 10) : 0;
  const vibration = baseVibration + leakVibration;

  // Grand Formula: LPI Calculation
  // Normalize values 0-1 where 1 is "Definitely Leak"
  
  const w1 = 0.25; // Flow weight
  const w2 = 0.20; // Pressure weight
  const w3 = 0.15; // Temp weight
  const w4 = 0.20; // Acoustic weight
  const w5 = 0.20; // Moisture weight

  // Normalized deviations
  const flowDelta = Math.min(1, Math.abs(inputFlowRate - flowOut) / inputFlowRate);
  const pressureDelta = Math.min(1, Math.abs(inputPressure - pressureOut) / inputPressure);
  const tempDelta = Math.min(1, Math.abs(newTemp - soilTemperature) / 20); // normalized against 20 deg variance
  const acousticDelta = Math.min(1, Math.max(0, vibration - (inputFlowRate/10)) / 50);
  const moistureDelta = newMoisture; // Already 0-1

  const lpi = (w1 * flowDelta) + (w2 * pressureDelta) + (w3 * tempDelta) + (w4 * acousticDelta) + (w5 * moistureDelta);

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
