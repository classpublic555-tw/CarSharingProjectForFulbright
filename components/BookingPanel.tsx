import React, { useState, useMemo } from 'react';
import { TripSettings, UserBooking, Driver, TimeSlot } from '../types';
import { Calendar, Key, Sun, Moon, Trash2, AlertCircle, User } from 'lucide-react';

interface BookingPanelProps {
  settings: TripSettings;
  bookings: UserBooking[];
  setBookings: React.Dispatch<React.SetStateAction<UserBooking[]>>;
  drivers: Driver[];
}

export const BookingPanel: React.FC<BookingPanelProps> = ({ settings, bookings, setBookings, drivers }) => {
  const [selectedName, setSelectedName] = useState('');

  // Generate array of dates
  const dates = useMemo(() => {
    const result = [];
    const start = new Date(settings.startDate);
    
    for (let i = 0; i < settings.totalDays; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      result.push(`${year}-${month}-${day}`);
    }
    return result;
  }, [settings.startDate, settings.totalDays]);

  const handleJoin = (date: string, slot: TimeSlot) => {
    if (!selectedName.trim()) return alert("Please enter your name");
    
    // Check capacity for this specific slot
    const slotBookings = bookings.filter(b => b.joinDate === date && b.slot === slot);
    if (slotBookings.length >= settings.carType) {
      return alert(`Car is full for ${slot} slot (Max ${settings.carType} people)`);
    }

    // Check if already joined this specific slot
    const exists = bookings.find(b => 
      b.joinDate === date && 
      b.slot === slot && 
      b.name.toLowerCase() === selectedName.trim().toLowerCase()
    );
    if (exists) return alert("You are already registered for this time slot.");

    const newBooking: UserBooking = {
      id: crypto.randomUUID(),
      name: selectedName.trim(),
      isDriver: false, // Default to false, assign via dropdown later
      joinDate: date,
      slot
    };

    setBookings(prev => [...prev, newBooking]);
    setSelectedName(''); // Clear input after join for easier multi-add
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent event bubbling
    if(confirm("Remove this person from the slot?")) {
      setBookings(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleAssignDriver = (driverId: string, date: string, slot: TimeSlot) => {
    setBookings(prev => prev.map(b => {
      // Only affect bookings in this specific date and slot
      if (b.joinDate === date && b.slot === slot) {
        return {
          ...b,
          isDriver: b.id === driverId // Set true if ID matches, false otherwise
        };
      }
      return b;
    }));
  };

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Reusable Slot Component
  const SlotSection = ({ date, slot, label, timeRange, icon: Icon }: { date: string, slot: TimeSlot, label: string, timeRange: string, icon: any }) => {
    const slotBookings = bookings.filter(b => b.joinDate === date && b.slot === slot);
    const isFull = slotBookings.length >= settings.carType;
    const currentDriver = slotBookings.find(b => b.isDriver);
    
    // Determine background color based on occupancy
    const bgColor = isFull ? 'bg-red-50' : 'bg-white';
    const borderColor = isFull ? 'border-red-100' : 'border-gray-100';

    return (
      <div className={`flex-1 p-3 rounded-xl border ${borderColor} ${bgColor} flex flex-col gap-2 transition-all`}>
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2 text-gray-700">
            <Icon size={16} className={slot === 'morning' ? "text-orange-500" : "text-indigo-500"} />
            <div>
              <span className="text-sm font-bold block">{label}</span>
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{timeRange}</span>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isFull ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            {slotBookings.length}/{settings.carType}
          </span>
        </div>

        {/* Driver Assignment Dropdown */}
        <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 flex items-center justify-between min-h-[40px]">
          <div className="flex items-center gap-2">
             <div className={`p-1 rounded-md ${currentDriver ? 'bg-amber-100' : 'bg-gray-200'}`}>
               <Key size={14} className={currentDriver ? "text-amber-600" : "text-gray-500"} />
             </div>
             <span className="text-xs font-semibold text-gray-600">Driver:</span>
          </div>
          
          <select 
            value={currentDriver?.id || ""}
            onChange={(e) => handleAssignDriver(e.target.value, date, slot)}
            disabled={slotBookings.length === 0}
            className={`text-sm border-none bg-transparent focus:ring-0 cursor-pointer text-right max-w-[120px] outline-none 
              ${!currentDriver && slotBookings.length > 0 ? 'text-red-500 font-bold' : 'text-gray-800 font-bold'}`}
          >
            <option value="">Select...</option>
            {slotBookings.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Passengers List */}
        <div className="space-y-1.5 flex-1 min-h-[60px]">
          {slotBookings.length === 0 && (
            <p className="text-xs text-gray-400 italic text-center py-2">No passengers</p>
          )}
          {slotBookings.map(b => (
            <div key={b.id} className="flex items-center justify-between bg-white border border-gray-200 p-2 rounded-lg shadow-sm group">
              <div className="flex items-center gap-2 overflow-hidden">
                 <div className={`w-1.5 h-1.5 rounded-full ${b.isDriver ? 'bg-amber-500' : 'bg-blue-400'}`} />
                 <span className={`text-sm truncate ${b.isDriver ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                    {b.name}
                 </span>
              </div>
              <button 
                onClick={(e) => handleRemove(e, b.id)}
                className="text-gray-300 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => handleJoin(date, slot)}
          disabled={isFull || !selectedName}
          className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wide mt-2 transition-colors
            ${isFull || !selectedName
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : slot === 'morning' 
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
        >
          {isFull ? 'Full' : '+ Join Slot'}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-20 z-40">
        <div className="flex flex-col gap-4">
           <div>
             <label className="block text-sm font-semibold text-gray-800 mb-1">Enter Name to Join</label>
             <div className="flex gap-2">
                <input
                  type="text"
                  value={selectedName}
                  onChange={(e) => setSelectedName(e.target.value)}
                  placeholder="Type name..."
                  className="flex-1 px-4 py-2 bg-gray-50 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
             </div>
           </div>

           {/* Quick Select Drivers */}
           {drivers.length > 0 && (
             <div>
               <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wider">Quick Add Authorized Drivers</p>
               <div className="flex flex-wrap gap-2">
                 {drivers.map(d => (
                   <button
                     key={d.id}
                     onClick={() => setSelectedName(d.name)}
                     className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1
                       ${selectedName === d.name 
                         ? 'bg-blue-600 text-white border-blue-600' 
                         : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                       }`}
                   >
                     <User size={12} />
                     {d.name}
                   </button>
                 ))}
               </div>
             </div>
           )}
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1">
        {dates.map((date, index) => {
          // Check start time to conditionally hide morning slot on first day
          const startHour = new Date(settings.startDate).getHours();
          const showMorning = !(index === 0 && startHour >= 12);

          // Check for missing drivers in any visible slot
          const morningBookings = bookings.filter(b => b.joinDate === date && b.slot === 'morning');
          const afternoonBookings = bookings.filter(b => b.joinDate === date && b.slot === 'afternoon');
          
          const missingDriverMorning = showMorning && morningBookings.length > 0 && !morningBookings.some(b => b.isDriver);
          const missingDriverAfternoon = afternoonBookings.length > 0 && !afternoonBookings.some(b => b.isDriver);

          return (
            <div key={date} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <div className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <Calendar size={20} className="text-blue-600"/>
                  {formatDate(date)}
                </div>
                {(missingDriverMorning || missingDriverAfternoon) && (
                  <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs font-bold border border-amber-100">
                    <AlertCircle size={12} />
                    <span>Missing Driver</span>
                  </div>
                )}
              </div>

              <div className="p-4 flex flex-col md:flex-row gap-4">
                {showMorning && (
                  <>
                    <SlotSection 
                      date={date} 
                      slot="morning" 
                      label="Morning Trip" 
                      timeRange="07:00 - 14:00"
                      icon={Sun}
                    />
                    
                    <div className="hidden md:block w-px bg-gray-200 my-2"></div>
                  </>
                )}
                
                <SlotSection 
                  date={date} 
                  slot="afternoon" 
                  label="Afternoon Trip" 
                  timeRange="14:00 - 21:00"
                  icon={Moon}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};