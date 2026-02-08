import React, { useState } from 'react';
import { BomItem } from '../types';
import { Download, Copy, Check } from 'lucide-react';

interface Props {
  items: BomItem[];
}

export const BomTable: React.FC<Props> = ({ items }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // Create Tab-Separated Values (TSV) for spreadsheet compatibility
    const headers = ['No.', 'Description', 'Specification', 'Unit', 'Qty', 'Remarks'];
    const rows = items.map(item => [
      item.id,
      item.description,
      item.spec,
      item.unit,
      item.qty,
      item.remarks
    ].join('\t'));
    
    const tsvData = [headers.join('\t'), ...rows].join('\n');

    try {
      await navigator.clipboard.writeText(tsvData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy data:', err);
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800">Part 3: Bill of Materials (BOM)</h3>
        <div className="flex items-center gap-3">
            <button 
                onClick={handleCopy}
                className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border transition-all active:scale-95 ${
                    copied 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'bg-white border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200'
                }`}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy for Excel'}
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors">
                <Download className="w-4 h-4" /> Print / PDF
            </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 w-16">No.</th>
              <th className="px-6 py-3">Description (項目說明)</th>
              <th className="px-6 py-3">Specification (規格)</th>
              <th className="px-6 py-3">Unit (單位)</th>
              <th className="px-6 py-3">Qty (數量)</th>
              <th className="px-6 py-3">Remarks (備註)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-medium text-slate-500">{item.id}</td>
                <td className="px-6 py-3 font-medium text-slate-900">{item.description}</td>
                <td className="px-6 py-3 text-slate-600 font-mono text-xs">{item.spec}</td>
                <td className="px-6 py-3 text-slate-600">{item.unit}</td>
                <td className="px-6 py-3 font-bold text-slate-800">{item.qty.toLocaleString()}</td>
                <td className="px-6 py-3 text-slate-400 italic text-xs">{item.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};