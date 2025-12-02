export enum CarType {
  FIVE_SEATER = 5,
  SEVEN_SEATER = 7
}

export interface TripSettings {
  rentalCost: number;
  dailyInsurance: number;
  totalDays: number;
  carType: CarType;
  startDate: string;
  zelleNumber: string;
  adminPassword?: string;
}

export type TimeSlot = 'morning' | 'afternoon';

export interface UserBooking {
  id: string;
  name: string;
  isDriver: boolean;
  joinDate: string; // YYYY-MM-DD
  slot: TimeSlot;
}

export interface GasEntry {
  id: string;
  amount: number;
  date: string;
  note: string;
}

export interface Driver {
  id: string;
  name: string;
}

export interface CostShare {
  name: string;
  slotsJoined: number;
  totalShare: number;
  details: {
    rentalShare: number;
    insuranceShare: number;
    gasShare: number;
  };
}