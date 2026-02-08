
import React, { useState, useMemo } from 'react';
import { InputForm } from './components/InputForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { BomTable } from './components/BomTable';
import { calculateDcSystem, calculateInverterBlock, calculateMainSwitch } from './utils';
import { CalculationInput, BomItem } from './types';
import { Sun, Calculator, ArrowLeft, AlertTriangle } from 'lucide-react';

const DEFAULT_INPUT: CalculationInput = {
  systemCapacityDc: 213.6,
  systemCapacityAc: 180,
  numStrings: 24,
  numPanels: 480,
  panelPower: 445,
  inverters: [
    {
      id: 'default-1',
      count: 6,
      power: 30,
      voltage: 380,
      config: '3P4W',
      runLength: 60
    }
  ],
  systemVoltage: 380,
  runLengthDc: 40,
  runLengthMain: 15,
};

function App() {
  const [input, setInput] = useState<CalculationInput>(DEFAULT_INPUT);
  const [committedInput, setCommittedInput] = useState<CalculationInput>(DEFAULT_INPUT);
  const [hasCalculated, setHasCalculated] = useState(false);

  const handleInputChange = (key: keyof CalculationInput, value: any) => {
    setInput(prev => {
      const next = { ...prev, [key]: value };
      
      // Auto-calculate DC
      if (key === 'panelPower' || key === 'numPanels') {
        const powerW = typeof next.panelPower === 'number' ? next.panelPower : 0;
        const count = typeof next.numPanels === 'number' ? next.numPanels : 0;
        next.systemCapacityDc = parseFloat(((powerW * count) / 1000).toFixed(3));
      }

      // Auto-calculate Total AC
      if (key === 'inverters') {
        const totalAc = next.inverters.reduce((sum, inv) => sum + (inv.count * inv.power), 0);
        next.systemCapacityAc = parseFloat(totalAc.toFixed(3));
      }
      
      return next;
    });
  };

  const handleCalculate = () => {
    setCommittedInput(input);
    setHasCalculated(true);
  };

  const dcResult = useMemo(() => calculateDcSystem(committedInput), [committedInput]);
  
  const inverterResults = useMemo(() => {
      return committedInput.inverters.map((inv, index) => calculateInverterBlock(inv, index));
  }, [committedInput]);

  const mainResult = useMemo(() => calculateMainSwitch(committedInput, inverterResults), [committedInput, inverterResults]);

  const dcAcRatio = useMemo(() => {
    return committedInput.systemCapacityAc > 0 
      ? committedInput.systemCapacityDc / committedInput.systemCapacityAc 
      : 0;
  }, [committedInput.systemCapacityDc, committedInput.systemCapacityAc]);

  // Generate BOM Items
  const bomItems: BomItem[] = useMemo(() => {
    const activeInput = committedInput;
    const items: BomItem[] = [];
    let idCounter = 1;

    // 1. Modules
    items.push({
      id: idCounter++,
      description: "太陽能模組 (PV Modules)",
      spec: `${activeInput.panelPower}W (Voc: 39.41V)`,
      unit: "pcs",
      qty: activeInput.numPanels,
      remarks: `Total DC: ${activeInput.systemCapacityDc} kWp`
    });

    // 2. Inverters (Grouped)
    activeInput.inverters.forEach((inv, idx) => {
        items.push({
        id: idCounter++,
        description: `變流器 Group ${idx + 1} (Inverter)`,
        spec: `${inv.power}kW, ${inv.voltage}V (${inv.config})`,
        unit: "Set",
        qty: inv.count,
        remarks: `Subtotal: ${inv.count * inv.power} kW`
        });
    });

    // 3. DC Cable (PV Wire)
    const dcCableQty = activeInput.runLengthDc * activeInput.numStrings * 2;
    items.push({
      id: idCounter++,
      description: "直流電纜 (DC Cable)",
      spec: `PV 1000V 1C-${dcResult.cableArea}mm²`,
      unit: "m",
      qty: dcCableQty,
      remarks: `For ${activeInput.numStrings} Strings`
    });

    // 4. DC Grounding Cable
    items.push({
      id: idCounter++,
      description: "接地線 (Grounding Cable)",
      spec: "PVC 3.5mm²",
      unit: "m",
      qty: activeInput.runLengthDc * activeInput.numStrings, 
      remarks: "Est. BoS"
    });

    // 5. DC Cable Tray
    items.push({
      id: idCounter++,
      description: "直流電纜線槽 (DC Cable Tray)",
      spec: dcResult.recommendedTray,
      unit: "m",
      qty: activeInput.runLengthDc * dcResult.trayQuantity,
      remarks: `Fill: ${dcResult.fillRatio.toFixed(1)}%`
    });

    // 6 - 8. AC Components per Inverter Group
    inverterResults.forEach((res, idx) => {
        // Breaker
        items.push({
            id: idCounter++,
            description: `無熔絲開關 Grp ${idx+1} (Inv Breaker)`,
            spec: `${res.breaker.af}AF / ${res.breaker.at}AT`,
            unit: "pcs",
            qty: res.count,
            remarks: `Per Inv (${res.designCurrent.toFixed(0)}A)`
        });

        // AC Cable
        const wiresPerInv = res.config === '3P3W' ? 3 : 4;
        const acCableQty = res.count * wiresPerInv * res.runLength;
        items.push({
            id: idCounter++,
            description: `交流電纜 Grp ${idx+1} (AC Cable)`,
            spec: `XLPE 600V 1C-${res.cableSize}mm²`,
            unit: "m",
            qty: acCableQty,
            remarks: `${res.config}`
        });

        // Conduit
        items.push({
            id: idCounter++,
            description: `金屬導線管 Grp ${idx+1} (AC Conduit)`,
            spec: `RSG ${res.conduitSize}mm`,
            unit: "m",
            qty: res.count * wiresPerInv * res.runLength, 
            remarks: "1 Wire/Conduit"
        });
    });

    // 9. AC Cable Tray (Main Trunk)
    // We assume the trunk runs for the longest inverter run length, or distinct segments? 
    // For simplicity in BOM, we take the max run length of any inverter group for the trunk, 
    // or arguably the trunk length is separate. 
    // The previous app used 'runLengthInv'. Now we have individual run lengths.
    // We will list it as 'Main Trunk Tray' and use the maximum run length among inverters as a safe estimate for the common path.
    const maxInvRun = Math.max(...activeInput.inverters.map(i => i.runLength));
    
    items.push({
      id: idCounter++,
      description: "交流電纜線槽 (AC Cable Tray Trunk)",
      spec: mainResult.traySize,
      unit: "m",
      qty: maxInvRun,
      remarks: `Trunk Fill: ${mainResult.fillRatio.toFixed(1)}%`
    });

    // 10. Main Breaker
    items.push({
      id: idCounter++,
      description: "主無熔絲開關 (Main Breaker)",
      spec: typeof mainResult.breaker === 'string' ? mainResult.breaker : `${mainResult.breaker.af}AF / ${mainResult.breaker.at}AT`,
      unit: "pcs",
      qty: 1,
      remarks: `Main Switchboard (${activeInput.systemCapacityAc} kW)`
    });

    // 11. Busbar
    items.push({
      id: idCounter++,
      description: "匯流銅排 (Copper Busbar)",
      spec: mainResult.busbar,
      unit: "Set",
      qty: 1,
      remarks: `Rated for ${mainResult.designCurrent.toFixed(0)}A`
    });

    // 12. Main Output Cable
    items.push({
      id: idCounter++,
      description: "主幹線電纜 (Main Output Cable)",
      spec: `XLPE 600V 1C-${mainResult.mainCableSize}mm²`,
      unit: "m",
      qty: mainResult.mainCableRuns * 3 * activeInput.runLengthMain,
      remarks: `${mainResult.mainCableRuns} runs (3P3W)`
    });

     // 13. Main Conduit
    items.push({
      id: idCounter++,
      description: "主幹線導線管 (Main Conduit)",
      spec: `RSG ${mainResult.mainConduitSize}mm`,
      unit: "m",
      qty: mainResult.mainCableRuns * 3 * activeInput.runLengthMain,
      remarks: "1 Wire/Conduit Rule"
    });

    // BoS Extras
    items.push({
      id: idCounter++,
      description: "支架系統 (Mounting Structure)",
      spec: "Aluminum/Hot-Dip Galv.",
      unit: "kW",
      qty: activeInput.systemCapacityDc,
      remarks: "BoS Item"
    });

    items.push({
      id: idCounter++,
      description: "氣象站 (Weather Station)",
      spec: "Pyranometer + Temp",
      unit: "Set",
      qty: 1,
      remarks: "BoS Item"
    });

    items.push({
      id: idCounter++,
      description: "資料收集器 (Data Logger)",
      spec: "Standard",
      unit: "Set",
      qty: 1,
      remarks: "BoS Item"
    });

    return items;
  }, [committedInput, dcResult, inverterResults, mainResult]);

  return (
    <div className="min-h-screen pb-12">
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <Sun className="w-8 h-8 text-yellow-400" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">SolarSpec Engineer</h1>
            <p className="text-xs text-slate-400">Automated Design & BOM Generator</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            <InputForm values={input} onChange={handleInputChange} />
            
            <button 
              onClick={handleCalculate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 transform active:scale-95"
            >
              <Calculator className="w-5 h-5" />
              Calculate Results
            </button>
             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                <p className="font-semibold mb-1">Guidebook Constraints Applied:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Safety Factor: 1.25x</li>
                    <li>Cable Tray Fill: Max 20%</li>
                    <li>DC Wire: 4mm² Fixed</li>
                    <li>Supports Multiple Inv Types</li>
                </ul>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
            {hasCalculated ? (
              <>
                {dcAcRatio > 1.3 && (
                    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4 shadow-sm animate-fade-in">
                        <div className="bg-amber-100 p-2 rounded-full flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-900">System Design Warning: High DC/AC Ratio</h3>
                            <p className="text-amber-800 text-sm mt-1 leading-relaxed">
                                The calculated DC/AC ratio is <strong className="text-amber-950">{dcAcRatio.toFixed(2)}</strong>, which exceeds the recommended limit of <strong>1.3</strong>.
                            </p>
                            <p className="text-amber-700 text-xs mt-2">
                                Current Configuration: {committedInput.systemCapacityDc} kWp (DC) / {committedInput.systemCapacityAc} kW (AC).
                                Consider reducing the number of panels or increasing inverter capacity to avoid power clipping.
                            </p>
                        </div>
                    </div>
                )}

                <ResultsDisplay 
                  dc={dcResult} 
                  inverterResults={inverterResults} 
                  main={mainResult} 
                />
                
                <BomTable items={bomItems} />
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center h-full min-h-[500px]">
                <div className="bg-slate-50 p-6 rounded-full mb-6">
                  <Calculator className="w-16 h-16 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Awaiting Calculation</h3>
                <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                  Adjust the system specifications in the panel on the left (including multiple inverter types) and click the <span className="font-bold text-slate-700">Calculate Results</span> button to generate the complete engineering design analysis and Bill of Materials (BOM).
                </p>
                <div className="mt-8 flex items-center gap-2 text-sm text-blue-600 font-medium animate-pulse">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Start on the left</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
