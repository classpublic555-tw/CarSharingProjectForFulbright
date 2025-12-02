import React from 'react';
import { Car, Settings, CreditCard, Users } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Booking', icon: <Car size={18} /> },
    { id: 'expenses', label: 'Gas & Costs', icon: <CreditCard size={18} /> },
    { id: 'admin', label: 'Admin', icon: <Settings size={18} /> },
    { id: 'summary', label: 'Final Split', icon: <Users size={18} /> },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm">
              <Car size={24} />
            </div>
            <h1 className="font-bold text-xl text-gray-900 hidden sm:block tracking-tight">TripSplit</h1>
          </div>
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};