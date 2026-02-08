
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
    <div className="space-y-8">
      
      {/* DC System Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-500" />
            Part 1: DC System Design
          </h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-3">Parameter</th>
                        <th className="px-6 py-3">Specification</th>
                        <th className="px-6 py-3">Details / Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-700">Cable Specification</td>
                        <td className="px-6 py-4 text-blue-600 font-medium">PV 1000V 4mm²</td>
                        <td className="px-6 py-4 text-slate-500">OD: {dc.cableOd}mm (Standard)</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-700">Total Wires</td>
                        <td className="px-6 py-4 text-slate-900">{dc.totalWires} Wires</td>
                        <td className="px-6 py-4 text-slate-500">{dc.totalCrossSection.toFixed(1)} mm² Total Area</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-700">Cable Tray</td>
                        <td className="px-6 py-4 text-indigo-600 font-bold">{dc.recommendedTray}</td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <StatusIcon ratio={dc.fillRatio} />
                                <span className={dc.fillRatio > 20 ? 'text-red-600' : 'text-green-600'}>
                                    {dc.fillRatio.toFixed(2)}% Fill
                                </span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>

      {/* AC Inverter Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
           <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Cable className="w-5 h-5 text-indigo-500" />
            Part 2a: AC Inverter Configuration
          </h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-4 py-3">Group</th>
                        <th className="px-4 py-3">Config</th>
                        <th className="px-4 py-3">Design Current</th>
                        <th className="px-4 py-3">Breaker (AT/AF)</th>
                        <th className="px-4 py-3">Cable (XLPE)</th>
                        <th className="px-4 py-3">Conduit</th>
                        <th className="px-4 py-3">Ref Tray</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {inverterResults.map((inv, idx) => (
                    <tr key={inv.blockId} className="hover:bg-slate-50">
                        <td className="px-4 py-4">
                            <div className="font-bold text-slate-700">{inv.name}</div>
                            <div className="text-xs text-slate-400">{inv.count} Unit(s)</div>
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-slate-600">{inv.config}</td>
                        <td className="px-4 py-4">
                            <div className="font-medium text-slate-900">{inv.designCurrent.toFixed(1)} A</div>
                            <div className="text-xs text-slate-400">Ic={inv.outputCurrent.toFixed(1)}A</div>
                        </td>
                         <td className="px-4 py-4 font-medium text-blue-600">
                            {inv.breaker.at}AT / {inv.breaker.af}AF
                        </td>
                        <td className="px-4 py-4 font-medium text-slate-700">
                            1C-{inv.cableSize}mm²
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                            RSG {inv.conduitSize}mm
                        </td>
                         <td className="px-4 py-4">
                            <div className="text-xs text-slate-500">{inv.traySize}</div>
                            <div className={`text-xs font-medium ${inv.fillRatio > 20 ? 'text-red-500' : 'text-green-600'}`}>
                                Fill: {inv.fillRatio.toFixed(1)}%
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
      </div>

       {/* Main Switch Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
           <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Part 2b: Main Switchboard (Whole System)
          </h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-3">System Parameter</th>
                        <th className="px-6 py-3">Calculated Result</th>
                        <th className="px-6 py-3">Notes</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-700">Total System Power</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{main.totalPower} kW</td>
                        <td className="px-6 py-4 text-slate-500 text-xs">Sum of all inverters</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-700">Main Design Current</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{main.designCurrent.toFixed(1)} A</td>
                        <td className="px-6 py-4 text-slate-500 text-xs">Includes 1.25x Safety Factor</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-700">Main Breaker (ACB/MCCB)</td>
                        <td className="px-6 py-4 font-bold text-blue-600">
                             {typeof main.breaker === 'string' ? main.breaker : `${main.breaker.at}AT / ${main.breaker.af}AF`}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">Based on Table 3</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-700">Copper Busbar</td>
                        <td className="px-6 py-4 font-medium text-slate-800">{main.busbar}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs">Safety Factor applied</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-700">Main Output Cable</td>
                        <td className="px-6 py-4 font-bold text-blue-600">
                            {main.mainCableRuns} runs of 1C-{main.mainCableSize}mm²
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">XLPE 600V (3P3W)</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-700">Main Conduit</td>
                        <td className="px-6 py-4 text-slate-800">RSG {main.mainConduitSize} mm</td>
                        <td className="px-6 py-4 text-slate-500 text-xs">Per wire run</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-700">Combined Trunk Tray</td>
                        <td className="px-6 py-4 font-bold text-indigo-600">{main.traySize}</td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <StatusIcon ratio={main.fillRatio} />
                                <span className={main.fillRatio > 20 ? 'text-red-600' : 'text-green-600'}>
                                    {main.fillRatio.toFixed(2)}% Fill
                                </span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
