import React, { useState, useRef } from 'react';
import { GasEntry } from '../types';
import { parseGasReceipt } from '../services/geminiService';
import { Plus, Trash2, Loader2, Camera } from 'lucide-react';

interface ExpensePanelProps {
  gasLogs: GasEntry[];
  setGasLogs: React.Dispatch<React.SetStateAction<GasEntry[]>>;
}

export const ExpensePanel: React.FC<ExpensePanelProps> = ({ gasLogs, setGasLogs }) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!amount) return;
    setGasLogs(prev => [...prev, {
      id: crypto.randomUUID(),
      amount: parseFloat(amount),
      date: new Date().toISOString().split('T')[0],
      note: note || 'Gas fill up'
    }]);
    setAmount('');
    setNote('');
  };

  const handleDelete = (id: string) => {
    setGasLogs(prev => prev.filter(g => g.id !== id));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await parseGasReceipt(base64);
        setAmount(result.amount.toString());
        setNote(`${result.note} (Scanned)`);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert("Failed to scan receipt. Please enter manually.");
    } finally {
      setIsScanning(false);
    }
  };

  const totalGas = gasLogs.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Input Section */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="text-blue-600" /> Add Gas Expense
          </h2>
          
          <div className="space-y-4">
             <div>
               <label className="block text-sm font-semibold text-gray-700 mb-1">Amount ($)</label>
               <input
                 type="number"
                 value={amount}
                 onChange={(e) => setAmount(e.target.value)}
                 className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-gray-400"
                 placeholder="0.00"
               />
             </div>
             <div>
               <label className="block text-sm font-semibold text-gray-700 mb-1">Note (Optional)</label>
               <input
                 type="text"
                 value={note}
                 onChange={(e) => setNote(e.target.value)}
                 className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-gray-400"
                 placeholder="e.g. Shell Station"
               />
             </div>

             <div className="flex gap-3 pt-2">
               <button
                 onClick={handleAdd}
                 className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
               >
                 Add Entry
               </button>
               
               <button
                 onClick={() => fileInputRef.current?.click()}
                 className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                 disabled={isScanning}
               >
                 {isScanning ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
               </button>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="image/*"
                 onChange={handleFileUpload}
               />
             </div>
             {isScanning && <p className="text-xs text-center text-blue-600 animate-pulse font-medium">AI is reading your receipt...</p>}
          </div>
        </div>
      </div>

      {/* List Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Gas Log</h2>
          <div className="text-right">
             <p className="text-xs text-gray-500 uppercase font-bold">Total Gas</p>
             <p className="text-2xl font-bold text-green-600">${totalGas.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {gasLogs.length === 0 && (
            <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
              No gas receipts added yet.
            </div>
          )}
          {gasLogs.map(log => (
            <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group border border-gray-100">
               <div>
                 <p className="font-bold text-gray-900">${log.amount.toFixed(2)}</p>
                 <p className="text-xs text-gray-500">{log.date} • {log.note}</p>
               </div>
               <button 
                 onClick={() => handleDelete(log.id)}
                 className="text-gray-300 hover:text-red-600 transition-colors p-2"
               >
                 <Trash2 size={16} />
               </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};