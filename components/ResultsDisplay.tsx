
import React from 'react';
import { DcResult, InverterResult, MainSwitchResult } from '../types';
import { CheckCircle2, AlertTriangle, Cpu, Cable, Activity } from 'lucide-react';

interface Props {
  dc: DcResult;
  inverterResults: InverterResult[];
  main: MainSwitchResult;
}

const StatusIcon = ({ ratio }: { ratio: number }) => {
  if (ratio <= 20) return <CheckCircle2 className="w-5 h-5 text-green-500" />;
  return <AlertTriangle className="w-5 h-5 text-red-500" />;
};

export const ResultsDisplay: React.FC<Props> = ({ dc, inverterResults, main }) => {
  return (
    <div className="space-y-6">
      
      {/* DC System Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-500" />
            Part 1: DC System Design
          </h3>
        </div>
        <div className="p-6">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-4 py-3">Parameter</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 font-medium">Cable Specification</td>
                <td className="px-4 py-3">PV 1000V 4mm² (OD: {dc.cableOd}mm)</td>
                <td className="px-4 py-3"><span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">Standard</span></td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Total Wires</td>
                <td className="px-4 py-3">{dc.totalWires}</td>
                <td className="px-4 py-3">-</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Cable Tray Size</td>
                <td className="px-4 py-3 text-indigo-600 font-bold">{dc.recommendedTray}</td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <StatusIcon ratio={dc.fillRatio} />
                  <span>{dc.fillRatio.toFixed(2)}% Fill</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* AC Inverter Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
           <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Cable className="w-5 h-5 text-indigo-500" />
            Part 2a: AC Inverter Configuration
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {inverterResults.map((inv, idx) => (
             <div key={inv.blockId} className="p-6">
                <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded">
                        {inv.name}
                    </span>
                    <span className="text-sm text-slate-400">
                        {inv.count} Unit(s) @ {inv.runLength}m
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Output Configuration</span>
                        <span className="font-medium bg-slate-50 px-2 rounded text-slate-700">{inv.config}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Design Current (x1.25)</span>
                        <span className="font-medium">{inv.designCurrent.toFixed(1)} A</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Breaker (Table 3)</span>
                        <span className="font-bold text-blue-600">{inv.breaker.af}AF / {inv.breaker.at}AT</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Cable Size (XLPE)</span>
                        <span className="font-bold text-blue-600">1C-{inv.cableSize} mm²</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Conduit (RSG - Phase)</span>
                        <span className="font-bold text-blue-600">{inv.conduitSize} mm</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-500">Local Tray Size (Ref Only)</span>
                        <span className="text-slate-600 text-xs">{inv.traySize}</span>
                    </div>
                </div>
             </div>
          ))}
        </div>
      </div>

       {/* Main Switch Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
           <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Part 2b: Main Switchboard (Whole System)
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
             <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Total System Power</span>
                <span className="font-medium">{main.totalPower} kW</span>
             </div>
             <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Total Current (at {main.totalCurrent > 0 ? (main.totalPower * 1000 / (main.totalCurrent / 1.25) / Math.sqrt(3) * 1.25).toFixed(0) : '-'}V)</span>
                <span className="font-medium">{main.totalCurrent.toFixed(1)} A</span>
             </div>
             <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Main Breaker</span>
                <span className="font-bold text-blue-600">
                    {typeof main.breaker === 'string' ? main.breaker : `${main.breaker.af}AF / ${main.breaker.at}AT`}
                </span>
             </div>
             <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Copper Busbar</span>
                <span className="font-bold text-blue-600">{main.busbar}</span>
             </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Main Output Configuration</span>
                 <div className="text-right">
                    <span className="font-bold text-blue-600">{main.mainCableRuns} runs</span>
                    <div className="text-xs text-slate-400">of 1C-{main.mainCableSize}mm² (3P3W)</div>
                 </div>
             </div>
             <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Main Output Conduit</span>
                <span className="font-bold text-blue-600">RSG {main.mainConduitSize} mm</span>
             </div>
             <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Combined Trunk Tray</span>
                <div className="text-right">
                    <div className="font-bold text-indigo-600">{main.traySize}</div>
                    <div className={`text-xs ${main.fillRatio > 20 ? 'text-red-500' : 'text-green-500'}`}>
                        {main.fillRatio.toFixed(2)}% Fill
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
