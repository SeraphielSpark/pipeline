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
  PRESSURE: {
    title: "Principle I: Pascal's Principle",
    formula: "ΔP = Pin - Pout",
    description: "According to Pascal's Principle, pressure applied to a fluid is transmitted equally. A leak disrupts this, creating a measurable pressure drop (Pin - Pout)."
  },
  FLOW: {
    title: "Principle II: Bernoulli's Equation",
    formula: "Q_leak = Qin - Qout",
    description: "Based on the Conservation of Mass and Bernoulli's principle, the flow rate entering the pipe (Qin) must equal the flow exiting (Qout) unless fluid is lost to a leak."
  },
  THERMAL: {
    title: "Principle III: Thermal Gradient",
    formula: "ΔT = |T_fluid - T_soil|",
    description: "Escaping fluid alters the local thermal equilibrium. We measure the anomaly between expected ambient soil temperature and the sensor reading."
  },
  ACOUSTIC: {
    title: "Principle IV: Vibro-Acoustics",
    formula: "dB_leak > dB_ambient",
    description: "Fluid escaping under pressure creates turbulence and cavitation, generating high-frequency acoustic vibrations significantly above baseline noise."
  },
  IMPEDANCE: {
    title: "Principle V: Soil Impedance",
    formula: "Z_soil ∝ 1 / Moisture",
    description: "Water is conductive. As leaking fluid saturates the soil, the electrical impedance (resistance) drops sharply compared to dry soil."
  }
};