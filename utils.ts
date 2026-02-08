
import { 
  AC_CABLE_DIMS, 
  AC_WIRE_TABLE, 
  BREAKERS, 
  BUSBARS, 
  CONDUIT_TABLE, 
  DC_CABLE_OD_AREA, 
  TRAY_SIZES 
} from './constants';
import { 
  CalculationInput, 
  DcResult, 
  InverterBlock,
  InverterResult, 
  MainSwitchResult,
  CableTray,
  Breaker
} from './types';

// Helper to find tray
export const findTray = (requiredArea: number): { tray: CableTray, qty: number, fill: number, name: string } => {
  // Try to find a single tray first
  for (const tray of TRAY_SIZES) {
    if (requiredArea <= tray.allowableArea) {
      return {
        tray,
        qty: 1,
        fill: (requiredArea / tray.area) * 100,
        name: `${tray.width}x${tray.height} mm`
      };
    }
  }

  // If one tray isn't enough, try 2 of the largest
  const largestTray = TRAY_SIZES[TRAY_SIZES.length - 1];
  const qty = Math.ceil(requiredArea / largestTray.allowableArea);
  return {
    tray: largestTray,
    qty,
    fill: (requiredArea / (largestTray.area * qty)) * 100,
    name: `${qty} x (${largestTray.width}x${largestTray.height} mm)`
  };
};

export const calculateDcSystem = (input: CalculationInput): DcResult => {
  const totalWires = input.numStrings * 2; // Positive + Negative
  const totalCrossSection = totalWires * DC_CABLE_OD_AREA;

  const trayResult = findTray(totalCrossSection);

  return {
    cableOd: 7.54,
    cableArea: 4,
    totalWires,
    totalCrossSection,
    recommendedTray: trayResult.name,
    fillRatio: trayResult.fill,
    trayQuantity: trayResult.qty
  };
};

export const calculateInverterBlock = (block: InverterBlock, index: number): InverterResult => {
  // 3-Phase Current Formula: I = P / (V * 1.732)
  const current = (block.power * 1000) / (block.voltage * Math.sqrt(3));
  const designCurrent = current * 1.25;

  // 1. Select Breaker
  let selectedBreaker = BREAKERS.find(b => b.at >= designCurrent);
  if (!selectedBreaker) selectedBreaker = BREAKERS[BREAKERS.length - 1]; // Fallback to max

  // 2. Select Wire (Table 4)
  const is3Wire = block.config === '3P3W';
  
  let selectedWire = AC_WIRE_TABLE.find(w => {
    const ampacity = is3Wire ? w.w3 : w.w4;
    return ampacity > 0 && ampacity >= selectedBreaker!.at;
  });
  
  if (!selectedWire) {
     if (is3Wire) {
       selectedWire = AC_WIRE_TABLE[AC_WIRE_TABLE.length - 1];
     } else {
       const valid4Wire = AC_WIRE_TABLE.filter(w => w.w4 > 0);
       selectedWire = valid4Wire[valid4Wire.length - 1];
     }
  }

  // 3. Conduit (RSG)
  const conduitSize = CONDUIT_TABLE[selectedWire.size] ? CONDUIT_TABLE[selectedWire.size][0] : 0; 

  // 4. Tray Calculation (Per Inverter Type group run)
  // Usually tray is calculated for the whole trunk in Part 2b, but we provide per-inverter stats here if needed.
  // We'll calculate a theoretical tray for just this block's cables.
  const wiresPerInv = is3Wire ? 3 : 4;
  
  const cableDim = AC_CABLE_DIMS.find(d => d.size === selectedWire!.size);
  const singleCoreOd = cableDim?.single || 0;
  
  const totalWiresForBlock = block.count * wiresPerInv;
  const cableArea = totalWiresForBlock * Math.pow(singleCoreOd / 2, 2) * Math.PI;

  const trayResult = findTray(cableArea);

  return {
    blockId: block.id,
    name: `Group ${index + 1}`,
    outputCurrent: current,
    designCurrent: designCurrent,
    breaker: selectedBreaker!,
    cableSize: selectedWire.size,
    cableOd: singleCoreOd,
    conduitSize: conduitSize,
    traySize: trayResult.name,
    fillRatio: trayResult.fill,
    config: block.config,
    count: block.count,
    runLength: block.runLength
  };
};

export const calculateMainSwitch = (input: CalculationInput, inverterResults: InverterResult[]): MainSwitchResult => {
  // 1. Total Power & Current (Based on Grid Voltage)
  const totalPower = input.inverters.reduce((sum, inv) => sum + (inv.count * inv.power), 0);
  const totalCurrent = (totalPower * 1000) / (input.systemVoltage * Math.sqrt(3));
  const designCurrent = totalCurrent * 1.25;

  // 2. Main Breaker
  let mainBreaker: Breaker | string = BREAKERS.find(b => b.at >= designCurrent) || "ACB (Custom)";
  if (typeof mainBreaker !== 'string' && designCurrent > 1600) {
      mainBreaker = "ACB (Custom > 1600A)";
  }

  // 3. Busbar
  let selectedBusbar = "Custom";
  let busbarMatch = BUSBARS.find(b => b.acAmpacity >= designCurrent);
  
  if (busbarMatch) {
      selectedBusbar = `${busbarMatch.width}x${busbarMatch.thickness} mm (${busbarMatch.conductors} conductor)`;
  } else {
      let found = false;
      const MAX_RUN_LIMIT = 20; 
      for (let r = 2; r <= MAX_RUN_LIMIT; r++) {
          const ampsPerRun = designCurrent / r;
          const match = BUSBARS.find(b => b.acAmpacity >= ampsPerRun);
          if (match) {
              selectedBusbar = `${r} x (${match.width}x${match.thickness} mm, ${match.conductors}c)`;
              found = true;
              break;
          }
      }
      if (!found) {
           const maxAmpBusbar = BUSBARS.reduce((prev, current) => (prev.acAmpacity > current.acAmpacity) ? prev : current);
           const needed = Math.ceil(designCurrent / maxAmpBusbar.acAmpacity);
           selectedBusbar = `${needed} x (${maxAmpBusbar.width}x${maxAmpBusbar.thickness} mm, ${maxAmpBusbar.conductors}c)`;
      }
  }

  // 4. Tray Calculation (Main Trunk)
  // Sum area of cables from ALL inverter groups
  let totalTrayArea = 0;

  inverterResults.forEach(res => {
      const wiresPerInv = res.config === '3P3W' ? 3 : 4;
      const totalCablesForBlock = res.count * wiresPerInv;
      const singleCableArea = Math.pow(res.cableOd / 2, 2) * Math.PI;
      totalTrayArea += totalCablesForBlock * singleCableArea;
  });
  
  const mainTrayResult = findTray(totalTrayArea);

  // 5. Main Output Cable (Grid Connection) - 3P3W fixed
  const maxTableAmpacity = AC_WIRE_TABLE[AC_WIRE_TABLE.length - 1].w3;
  
  let selectedMainCableSize = 500;
  let selectedRuns = 1;

  if (designCurrent <= maxTableAmpacity) {
      const cable = AC_WIRE_TABLE.find(w => w.w3 >= designCurrent);
      selectedMainCableSize = cable ? cable.size : 500;
      selectedRuns = 1;
  } else {
      let found = false;
      const MAX_RUN_LIMIT = 20; 
      for (let r = 2; r <= MAX_RUN_LIMIT; r++) {
          const ampsPerRun = designCurrent / r;
          if (ampsPerRun <= maxTableAmpacity) {
              const cable = AC_WIRE_TABLE.find(w => w.w3 >= ampsPerRun);
              if (cable) {
                  selectedMainCableSize = cable.size;
                  selectedRuns = r;
                  found = true;
                  break;
              }
          }
      }
      if (!found) {
          selectedMainCableSize = 500;
          selectedRuns = Math.ceil(designCurrent / maxTableAmpacity);
      }
  }

  const mainConduit = CONDUIT_TABLE[selectedMainCableSize] ? CONDUIT_TABLE[selectedMainCableSize][0] : 0; 

  return {
      totalPower,
      totalCurrent,
      designCurrent,
      breaker: mainBreaker,
      busbar: selectedBusbar,
      mainCableSize: selectedMainCableSize, 
      mainCableRuns: selectedRuns,
      mainConduitSize: mainConduit,
      traySize: mainTrayResult.name,
      fillRatio: mainTrayResult.fill
  };
};
