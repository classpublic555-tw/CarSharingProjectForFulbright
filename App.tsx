import React, { useState } from 'react';
import { Header } from './components/Header';
import { BookingPanel } from './components/BookingPanel';
import { ExpensePanel } from './components/ExpensePanel';
import { AdminPanel } from './components/AdminPanel';
import { SummaryPanel } from './components/SummaryPanel';
import { TripSettings, UserBooking, GasEntry, Driver, CarType } from './types';
import { Lock } from 'lucide-react';

// Extract LoginScreen outside of App to prevent re-creation on every render
interface LoginScreenProps {
  title: string;
  passwordInput: string;
  setPasswordInput: (val: string) => void;
  handleLogin: () => void;
  authError: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ 
  title, 
  passwordInput, 
  setPasswordInput, 
  handleLogin, 
  authError 
}) => (
  <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200 max-w-md mx-auto">
    <div className="bg-gray-100 p-4 rounded-full mb-4">
      <Lock size={32} className="text-gray-600" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">Restricted Access</h3>
    <p className="text-gray-500 mb-6 text-center px-6">
      Only the trip administrator (Driver) can modify {title}.
    </p>
    <div className="w-full max-w-xs space-y-4 px-6">
       <div>
         <input
           type="password"
           value={passwordInput}
           onChange={(e) => setPasswordInput(e.target.value)}
           placeholder="Enter Admin Password"
           className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center placeholder:text-gray-400"
           onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
           autoFocus
         />
       </div>
       {authError && <p className="text-red-600 text-sm text-center font-medium">{authError}</p>}
       <button
         onClick={handleLogin}
         className="w-full bg-gray-900 text-white font-bold py-2 rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
       >
         Unlock Panel
       </button>
    </div>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Initialize default date-time string (YYYY-MM-DDTHH:mm)
  const getDefaultDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  // State Management
  const [settings, setSettings] = useState<TripSettings>({
    rentalCost: 200,
    dailyInsurance: 25,
    totalDays: 3,
    carType: CarType.FIVE_SEATER,
    startDate: getDefaultDateTime(),
    zelleNumber: '',
    adminPassword: 'admin'
  });

  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [gasLogs, setGasLogs] = useState<GasEntry[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  const handleLogin = () => {
    const targetPassword = settings.adminPassword || 'admin';
    if (passwordInput === targetPassword) {
      setIsAuthenticated(true);
      setAuthError('');
      setPasswordInput('');
    } else {
      setAuthError('Incorrect password');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <BookingPanel 
                 settings={settings} 
                 bookings={bookings} 
                 setBookings={setBookings}
                 drivers={drivers} 
               />;
      case 'expenses':
        if (!isAuthenticated) return (
          <LoginScreen 
            title="Expenses & Gas Logs" 
            passwordInput={passwordInput}
            setPasswordInput={setPasswordInput}
            handleLogin={handleLogin}
            authError={authError}
          />
        );
        return <ExpensePanel 
                 gasLogs={gasLogs} 
                 setGasLogs={setGasLogs} 
               />;
      case 'admin':
        if (!isAuthenticated) return (
          <LoginScreen 
            title="Trip Configuration" 
            passwordInput={passwordInput}
            setPasswordInput={setPasswordInput}
            handleLogin={handleLogin}
            authError={authError}
          />
        );
        return <AdminPanel 
                 settings={settings} 
                 setSettings={setSettings}
                 drivers={drivers}
                 setDrivers={setDrivers}
               />;
      case 'summary':
        return <SummaryPanel 
                 settings={settings} 
                 bookings={bookings} 
                 gasLogs={gasLogs} 
               />;
      default:
        return <BookingPanel 
                 settings={settings} 
                 bookings={bookings} 
                 setBookings={setBookings} 
                 drivers={drivers}
               />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
           <h2 className="text-2xl font-bold text-gray-900">
             {activeTab === 'dashboard' && 'Book Your Seat'}
             {activeTab === 'expenses' && 'Track Expenses'}
             {activeTab === 'admin' && 'Trip Settings'}
             {activeTab === 'summary' && 'Cost Split Summary'}
           </h2>
           <p className="text-gray-600 mt-1">
             {activeTab === 'dashboard' && 'Select dates and reserve your spot in the car.'}
             {activeTab === 'expenses' && 'Log gas receipts and view total trip costs.'}
             {activeTab === 'admin' && 'Manage car details, drivers, and payment info.'}
             {activeTab === 'summary' && 'See how much everyone owes based on attendance.'}
           </p>
        </div>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;