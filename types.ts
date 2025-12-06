export enum InstrumentStatus {
  STERILE = 'STERILE',
  IN_USE = 'IN_USE',
  DIRTY = 'DIRTY',
  DECONTAMINATION = 'DECONTAMINATION',
  STERILIZING = 'STERILIZING'
}

export enum TransactionType {
  DISTRIBUTION_STERILE = 'DISTRIBUTION_STERILE',
  COLLECTION_DIRTY = 'COLLECTION_DIRTY'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  VALIDATED = 'VALIDATED',
  COMPLETED = 'COMPLETED'
}

export type UserRole = 'ADMIN' | 'NURSE' | 'TECHNICIAN';

export const CYCLE_THRESHOLD = 20; // Global threshold for maintenance warning

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional because we might not want to expose it in the session object
  role: UserRole;
  unitId?: string; // Optional: linked unit for nurses
}

export interface Unit {
  id: string;
  name: string;
  qrCode: string;
  type: 'OR' | 'ICU' | 'ER' | 'WARD';
}

export interface Instrument {
  id: string;
  name: string;
  serialNumber: string; // Unique identifier
  batchNumber: string;
  status: InstrumentStatus;
  currentLocationId: string; // 'CSSD' or Unit ID
  cycleCount: number;
  sterilizationDate: string; // ISO Date string for FIFO logic
}

export interface TransactionItem {
  instrumentId: string;
  quantity: number; // Simplified logic, usually 1 for unique instruments
}

export interface Transaction {
  id: string;
  qrCode: string;
  type: TransactionType;
  status: TransactionStatus;
  unitId: string;
  timestamp: string;
  items: string[]; // List of Instrument IDs
}

export interface MockDataState {
  units: Unit[];
  instruments: Instrument[];
  transactions: Transaction[];
}