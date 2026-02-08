
export interface CableTray {
  width: number;
  height: number;
  area: number;
  allowableArea: number; // 20%
}

export interface Breaker {
  at: number; // Trip
  af: number; // Frame
}

export interface Busbar {
  width: number;
  thickness: number;
  conductors: number;
  acAmpacity: number;
}

export interface InverterBlock {
  id: string;
  count: number;
  power: number; // kW
  voltage: number; // V
  config: '3P3W' | '3P4W';
  runLength: number; // m
}

export interface CalculationInput {
  systemCapacityDc: number; // kWp
  systemCapacityAc: number; // kW
  numStrings: number;
  numPanels: number;
  panelPower: number; // W
  
  inverters: InverterBlock[]; // Supports multiple types

  systemVoltage: number; // V
  runLengthDc: number; // m
  runLengthMain: number; // m
}

export interface DcResult {
  cableOd: number;
  cableArea: number;
  totalWires: number;
  totalCrossSection: number;
  recommendedTray: string;
  fillRatio: number;
  trayQuantity: number;
}

export interface InverterResult {
  blockId: string;
  name: string; // e.g. "Inverter Type A"
  outputCurrent: number;
  designCurrent: number;
  breaker: Breaker;
  cableSize: number;
  cableOd: number;
  conduitSize: number;
  traySize: string;
  fillRatio: number;
  config: string; 
  // Passed through for BOM/Main Calc
  count: number; 
  runLength: number;
}

export interface MainSwitchResult {
  totalPower: number;
  totalCurrent: number;
  designCurrent: number;
  breaker: Breaker | string;
  busbar: string;
  mainCableSize: number; // Sum of incoming
  mainCableRuns: number; // Parallel runs per phase
  mainConduitSize: number; 
  traySize: string;
  fillRatio: number;
}

export interface BomItem {
  id: number;
  description: string;
  spec: string;
  unit: string;
  qty: number;
  remarks: string;
}
