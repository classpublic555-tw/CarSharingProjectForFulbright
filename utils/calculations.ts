import { TripSettings, UserBooking, GasEntry, CostShare } from '../types';

export const calculateShares = (
  settings: TripSettings,
  bookings: UserBooking[],
  gasLogs: GasEntry[]
): { shares: CostShare[]; totalTripCost: number; costPerSlot: number } => {
  
  // 1. Calculate Total Expenses
  const totalRental = settings.rentalCost;
  const totalInsurance = settings.dailyInsurance * settings.totalDays;
  const totalGas = gasLogs.reduce((sum, entry) => sum + entry.amount, 0);
  const totalTripCost = totalRental + totalInsurance + totalGas;

  // 2. Calculate Total "Person-Slots"
  // A person-slot is 1 person joining for 1 slot (Morning or Afternoon).
  // We sum up the number of people booked for each slot across all days.
  
  // First, group bookings by unique person (by name) to count their slots
  const personMap = new Map<string, number>(); // Name -> Slot Count
  
  bookings.forEach(b => {
    const current = personMap.get(b.name) || 0;
    personMap.set(b.name, current + 1);
  });

  let totalPersonSlots = 0;
  personMap.forEach((count) => {
    totalPersonSlots += count;
  });

  // Avoid division by zero
  if (totalPersonSlots === 0) {
    return { shares: [], totalTripCost, costPerSlot: 0 };
  }

  const costPerSlot = totalTripCost / totalPersonSlots;

  // 3. Calculate Individual Shares
  const shares: CostShare[] = [];
  personMap.forEach((slotCount, name) => {
    const myShare = costPerSlot * slotCount;
    
    // Pro-rate breakdown for display (approximate)
    const ratio = slotCount / totalPersonSlots;
    
    shares.push({
      name,
      slotsJoined: slotCount,
      totalShare: parseFloat(myShare.toFixed(2)),
      details: {
        rentalShare: parseFloat((totalRental * ratio).toFixed(2)),
        insuranceShare: parseFloat((totalInsurance * ratio).toFixed(2)),
        gasShare: parseFloat((totalGas * ratio).toFixed(2))
      }
    });
  });

  return { shares, totalTripCost, costPerSlot };
};