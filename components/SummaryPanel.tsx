import React, { useEffect, useState } from 'react';
import { TripSettings, UserBooking, GasEntry } from '../types';
import { calculateShares } from '../utils/calculations';
import { getCostAdvice } from '../services/geminiService';
import { PieChart, DollarSign, Info, Copy } from 'lucide-react';

interface SummaryPanelProps {
  settings: TripSettings;
  bookings: UserBooking[];
  gasLogs: GasEntry[];
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ settings, bookings, gasLogs }) => {
  const { shares, totalTripCost, costPerSlot } = calculateShares(settings, bookings, gasLogs);
  const [advice, setAdvice] = useState<string>("");

  useEffect(() => {
      if (totalTripCost > 0 && shares.length > 0) {
          getCostAdvice(totalTripCost, shares.length).then(setAdvice);
      }
  }, [totalTripCost, shares.length]);

  const copyZelle = () => {
    navigator.clipboard.writeText(settings.zelleNumber);
    alert("Zelle number copied!");
  };

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-200/50">
           <p className="text-blue-100 text-sm font-medium mb-1">Total Trip Cost</p>
           <h2 className="text-3xl font-bold tracking-tight">${totalTripCost.toFixed(2)}</h2>
           <p className="text-xs mt-2 opacity-80">Includes Rental, Insurance & Gas</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
           <p className="text-gray-500 text-sm font-medium mb-1">Cost Per Slot</p>
           <h2 className="text-3xl font-bold text-gray-900 tracking-tight">${costPerSlot.toFixed(2)}</h2>
           <p className="text-xs mt-2 text-gray-400">1 Slot = Morning or Afternoon</p>
        </div>
         <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg shadow-indigo-200/50">
           <p className="text-purple-100 text-sm font-medium mb-1">Pay To (Zelle)</p>
           <div className="flex items-center gap-2 mt-1">
             <h2 className="text-xl font-bold tracking-wide">{settings.zelleNumber || "Not Set"}</h2>
             <button onClick={copyZelle} className="hover:bg-white/20 p-1 rounded transition-colors"><Copy size={16}/></button>
           </div>
           <p className="text-xs mt-3 italic opacity-90 leading-relaxed">"{advice || "Loading AI tip..."}"</p>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
           <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
             <PieChart className="text-blue-600" size={20}/> Cost Breakdown
           </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-700">Person</th>
                <th className="p-4 text-sm font-semibold text-gray-700 text-center">Slots Joined</th>
                <th className="p-4 text-sm font-semibold text-gray-700 text-right">Rental Share</th>
                <th className="p-4 text-sm font-semibold text-gray-700 text-right">Gas Share</th>
                <th className="p-4 text-sm font-semibold text-gray-700 text-right">Total to Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shares.map((share) => (
                <tr key={share.name} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold border border-blue-200">
                      {share.name.charAt(0).toUpperCase()}
                    </div>
                    {share.name}
                  </td>
                  <td className="p-4 text-center text-gray-600">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-700">{share.slotsJoined}</span>
                  </td>
                  <td className="p-4 text-right text-gray-500 text-sm">
                    ${(share.details.rentalShare + share.details.insuranceShare).toFixed(2)}
                  </td>
                  <td className="p-4 text-right text-gray-500 text-sm">
                    ${share.details.gasShare.toFixed(2)}
                  </td>
                  <td className="p-4 text-right font-bold text-blue-700">
                    ${share.totalShare.toFixed(2)}
                  </td>
                </tr>
              ))}
              {shares.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    No bookings yet. Calculated shares will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50 text-xs text-gray-500 flex items-start gap-2 border-t border-gray-100">
          <Info size={14} className="mt-0.5 shrink-0 text-gray-400" />
          <p>Calculation Method: The total cost (Rental + Insurance + Gas) is divided by the total number of booked slots. Each person pays based on how many morning/afternoon slots they joined.</p>
        </div>
      </div>
    </div>
  );
};