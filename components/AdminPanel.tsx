import React from 'react';
import { TripSettings, CarType, Driver } from '../types';
import { Save, UserPlus, Trash, Lock } from 'lucide-react';

interface AdminPanelProps {
  settings: TripSettings;
  setSettings: React.Dispatch<React.SetStateAction<TripSettings>>;
  drivers: Driver[];
  setDrivers: React.Dispatch<React.SetStateAction<Driver[]>>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ settings, setSettings, drivers, setDrivers }) => {
  const [newDriver, setNewDriver] = React.useState('');

  const handleChange = (field: keyof TripSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const addDriver = () => {
    if (!newDriver.trim()) return;
    setDrivers(prev => [...prev, { id: crypto.randomUUID(), name: newDriver }]);
    setNewDriver('');
  };

  const removeDriver = (id: string) => {
    setDrivers(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      
      {/* Trip Configuration */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Save size={20} className="text-blue-600" /> Trip Configuration
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Rental Cost ($)</label>
              <input
                type="number"
                value={settings.rentalCost}
                onChange={(e) => handleChange('rentalCost', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Daily Insurance ($)</label>
              <input
                type="number"
                value={settings.dailyInsurance}
                onChange={(e) => handleChange('dailyInsurance', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Total Days</label>
              <input
                type="number"
                value={settings.totalDays}
                onChange={(e) => handleChange('totalDays', parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Car Type</label>
              <select
                value={settings.carType}
                onChange={(e) => handleChange('carType', parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value={5}>5-Seater Sedan</option>
                <option value={7}>7-Seater SUV/Van</option>
              </select>
            </div>
          </div>

          <div>
             <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date & Time</label>
             <input
                type="datetime-local"
                value={settings.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
          </div>

           <div>
             <label className="block text-sm font-semibold text-gray-700 mb-1">Zelle Number</label>
             <input
                type="text"
                value={settings.zelleNumber}
                onChange={(e) => handleChange('zelleNumber', e.target.value)}
                className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-gray-400"
                placeholder="(555) 123-4567"
              />
          </div>
        </div>
      </div>

      {/* Security & Driver Management */}
      <div className="space-y-6">
        {/* Admin Password */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lock size={20} className="text-gray-600" /> Security Settings
          </h2>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Admin Password</label>
            <input
              type="text"
              value={settings.adminPassword || 'admin'}
              onChange={(e) => handleChange('adminPassword', e.target.value)}
              className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">This password is required to access Expenses and Admin settings.</p>
          </div>
        </div>

        {/* Driver Management */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <UserPlus size={20} className="text-green-600" /> Authorized Drivers
          </h2>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newDriver}
              onChange={(e) => setNewDriver(e.target.value)}
              placeholder="New driver name"
              className="flex-1 px-4 py-2 bg-white text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none placeholder:text-gray-400"
            />
            <button 
              onClick={addDriver}
              className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm"
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
            {drivers.length === 0 && <p className="text-gray-400 italic text-sm">No designated drivers added.</p>}
            {drivers.map(driver => (
              <div key={driver.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="font-medium text-gray-800">{driver.name}</span>
                <button onClick={() => removeDriver(driver.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                  <Trash size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};