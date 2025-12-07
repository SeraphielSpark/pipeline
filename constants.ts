// Physics Constants
export const FLUID_DENSITY = 997; // kg/m^3 (Water)
export const DISCHARGE_COEFF = 0.61;
export const SOIL_BASE_RESISTANCE = 10000; // Ohms
export const ATMOSPHERIC_PRESSURE = 101325; // Pa

// Thresholds for LPI (Leak Probability Index)
export const LPI_WARNING_THRESHOLD = 0.4;
export const LPI_CRITICAL_THRESHOLD = 0.75;

// Simulation Config
export const HISTORY_LENGTH = 60;
export const UPDATE_INTERVAL_MS = 200;

export const PRINCIPLE_DETAILS = {
  FLOW: {
    title: "Principle I: Mass Balance",
    formula: "Q_leak = Q_in - Q_out - dV/dt",
    description: "Compares input vs. output mass. In a sealed system, these must be equal. A discrepancy indicates fluid loss."
  },
  PRESSURE: {
    title: "Principle II: Pressure Dynamics",
    formula: "Q = Cd * A * sqrt(2*(P_pipe - P_soil)/rho)",
    description: "A leak acts as an orifice. Fluid escaping creates a localized pressure drop proportional to the leak size."
  },
  THERMAL: {
    title: "Principle III: Thermodynamics",
    formula: "dT/dt = (Q_leak * cp * (T_fluid - T_soil)) / (m * c)",
    description: "Leaking fluid alters the surrounding soil temperature profile based on convective heat transfer."
  },
  ACOUSTIC: {
    title: "Principle IV: Acoustics",
    formula: "I(x) = I_0 * e^(-alpha * x)",
    description: "Turbulence from escaping fluid generates high-frequency vibrations that propagate through the pipe wall."
  },
  IMPEDANCE: {
    title: "Principle V: Soil Impedance",
    formula: "R_soil = a / (phi^m * Sw^n)",
    description: "Wet soil conducts electricity better than dry soil. Resistance drops drastically as saturation increases."
  },
  OVERVIEW: {
    title: "System Synthesis (Grand Formula)",
    formula: "LPI = Σ (w_i * Principle_i)",
    description: "A weighted algorithm combining all sensor inputs to calculate a Leak Probability Index (LPI) to minimize false alarms."
  }
};