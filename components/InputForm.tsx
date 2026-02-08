
import React from 'react';
import { CalculationInput, InverterBlock } from '../types';
import { Settings, Zap, Grid, Ruler, AlertTriangle, Plus, Trash2, Layers } from 'lucide-react';

interface Props {
  values: CalculationInput;
  onChange: (key: keyof CalculationInput, value: any) => void;
}

export const InputForm: React.FC<Props> = ({ values, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      onChange(name as keyof CalculationInput, parseFloat(value) || 0);
    } else {
      onChange(name as keyof CalculationInput, value);
    }
  };

  const handleInverterChange = (id: string, field: keyof InverterBlock, value: any) => {
    const updatedInverters = values.inverters.map(inv => {
      if (inv.id === id) {
        return { ...inv, [field]: value };
      }
      return inv;
    });
    onChange('inverters', updatedInverters);
  };

  const addInverter = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newBlock: InverterBlock = {
      id: newId,
      count: 1,
      power: 30,
      voltage: 380,
      config: '3P3W',
      runLength: 60
    };
    onChange('inverters', [...values.inverters, newBlock]);
  };

  const removeInverter = (id: string) => {
    if (values.inverters.length <= 1) return;
    onChange('inverters', values.inverters.filter(inv => inv.id !== id));
  };

  const dcAcRatio = values.systemCapacityAc > 0 
    ? values.systemCapacityDc / values.systemCapacityAc 
    : 0;

  const isHighRatio = dcAcRatio > 1.3;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Settings className="w-5 h-5 text-blue-600" />
        System Specifications
      </h2>

      {/* DC Section */}
      <div className="space-y-4 mb-8">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
          <Grid className="w-4 h-4" /> DC Configuration
        </h3>
        <div className="grid grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">System Capacity (kWp)</label>
            <input 
                type="number" 
                name="systemCapacityDc" 
                value={values.systemCapacityDc} 
                readOnly 
                className="w-full p-2 border rounded-md bg-slate-100 text-slate-500 cursor-not-allowed outline-none font-semibold" 
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Panel Power (W)</label>
            <input type="number" name="panelPower" value={values.panelPower} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Total Panels</label>
            <input type="number" name="numPanels" value={values.numPanels} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Total Strings</label>
            <input type="number" name="numStrings" value={values.numStrings} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">DC Run Length (m)</label>
              <input type="number" name="runLengthDc" value={values.runLengthDc} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
        </div>
      </div>

      {/* AC Section */}
      <div className="space-y-4 mb-8">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
          <Zap className="w-4 h-4" /> AC Inverters
        </h3>
        
        {/* Global AC Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-50 p-4 rounded-lg">
             <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Total AC Power (kW)</label>
              <div className="font-bold text-slate-800 text-lg">{values.systemCapacityAc}</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">DC/AC Ratio</label>
              <div className={`font-bold flex items-center gap-2 ${isHighRatio ? 'text-amber-600' : 'text-slate-800'}`}>
                {dcAcRatio.toFixed(2)}
                {isHighRatio && <AlertTriangle className="w-4 h-4" />}
              </div>
            </div>
        </div>

        {/* Dynamic Inverter Blocks */}
        <div className="space-y-6">
            {values.inverters.map((inv, index) => (
                <div key={inv.id} className="border border-slate-200 rounded-lg p-4 relative group hover:border-blue-200 transition-colors">
                    <div className="absolute -top-3 left-3 bg-white px-2 text-xs font-bold text-blue-600 flex items-center gap-2">
                        <Layers className="w-3 h-3" /> Group {index + 1}
                    </div>
                    {values.inverters.length > 1 && (
                        <button 
                            onClick={() => removeInverter(inv.id)}
                            className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-1"
                            title="Remove Inverter Group"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <div>
                            <label className="block text-xs text-slate-500 mb-1">Quantity</label>
                            <input 
                                type="number" 
                                value={inv.count} 
                                onChange={(e) => handleInverterChange(inv.id, 'count', parseFloat(e.target.value) || 0)}
                                className="w-full p-2 text-sm border rounded hover:border-blue-400 focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>
                         <div>
                            <label className="block text-xs text-slate-500 mb-1">Power (kW)</label>
                            <input 
                                type="number" 
                                value={inv.power} 
                                onChange={(e) => handleInverterChange(inv.id, 'power', parseFloat(e.target.value) || 0)}
                                className="w-full p-2 text-sm border rounded hover:border-blue-400 focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>
                         <div>
                            <label className="block text-xs text-slate-500 mb-1">Output Voltage (V)</label>
                            <input 
                                type="number" 
                                value={inv.voltage} 
                                onChange={(e) => handleInverterChange(inv.id, 'voltage', parseFloat(e.target.value) || 0)}
                                className="w-full p-2 text-sm border rounded hover:border-blue-400 focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>
                         <div>
                            <label className="block text-xs text-slate-500 mb-1">Output Config</label>
                            <select
                                value={inv.config}
                                onChange={(e) => handleInverterChange(inv.id, 'config', e.target.value)}
                                className="w-full p-2 text-sm border rounded hover:border-blue-400 focus:border-blue-500 outline-none bg-white"
                            >
                                <option value="3P3W">3-Phase / 3-Wire</option>
                                <option value="3P4W">3-Phase / 4-Wire</option>
                            </select>
                        </div>
                         <div className="col-span-2">
                            <label className="block text-xs text-slate-500 mb-1">Cable Run Length (m)</label>
                            <input 
                                type="number" 
                                value={inv.runLength} 
                                onChange={(e) => handleInverterChange(inv.id, 'runLength', parseFloat(e.target.value) || 0)}
                                className="w-full p-2 text-sm border rounded hover:border-blue-400 focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>
            ))}
            
            <button 
                onClick={addInverter}
                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 text-sm font-medium hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4" /> Add Inverter Type
            </button>
        </div>
      </div>

      {/* Grid Connection */}
      <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b pb-2 flex items-center gap-2">
            <Ruler className="w-4 h-4" /> Grid Connection
          </h3>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Grid Voltage (V)</label>
              <input type="number" name="systemVoltage" value={values.systemVoltage} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Main Run Length (m)</label>
              <input type="number" name="runLengthMain" value={values.runLengthMain} onChange={handleChange} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </div>
    </div>
  );
};
