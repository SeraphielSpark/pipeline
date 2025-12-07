export enum PrincipleType {
  FLOW = 'FLOW',
  PRESSURE = 'PRESSURE',
  THERMAL = 'THERMAL',
  ACOUSTIC = 'ACOUSTIC',
  IMPEDANCE = 'IMPEDANCE'
}

export interface SimulationParams {
  inputPressure: number; // Pascals (Pa)
  inputFlowRate: number; // m^3/s
  fluidTemperature: number; // Celsius
  soilTemperature: number; // Celsius
  soilPorosity: number; // 0-1
  isLeaking: boolean;
  leakSeverity: number; // 0-1 (Size of hole)
}

export interface SensorReadings {
  timestamp: number;
  pressureOut: number;
  flowOut: number;
  soilMoisture: number; // 0-1 (Saturation)
  vibrationIntensity: number; // Arbitrary units
  soilTempReading: number; // Celsius
  lpi: number; // Leak Probability Index
}

export interface SystemState {
  params: SimulationParams;
  readings: SensorReadings;
  history: SensorReadings[];
  selectedPrinciple: PrincipleType;
}