import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CYCLE_THRESHOLD, Instrument, InstrumentStatus, MockDataState, Transaction, TransactionStatus, TransactionType, Unit, User, UserRole } from '../types';

// --- MOCK DATA (Translated to Indonesian) ---
const INITIAL_UNITS: Unit[] = [
  { id: 'UNIT-001', name: 'Ruang Operasi 1', qrCode: 'UNIT:UNIT-001', type: 'OR' },
  { id: 'UNIT-002', name: 'ICU Sentral', qrCode: 'UNIT:UNIT-002', type: 'ICU' },
  { id: 'UNIT-003', name: 'IGD (Gawat Darurat)', qrCode: 'UNIT:UNIT-003', type: 'ER' },
  { id: 'UNIT-004', name: 'Mawar (Rawat Inap)', qrCode: 'UNIT:UNIT-004', type: 'WARD' },
];

// Initial Users with Credentials
const INITIAL_USERS: User[] = [
  { 
    id: 'ADM-001', 
    name: 'Admin CSSD', 
    email: 'admin@meditrack.com', 
    password: 'admin123', 
    role: 'ADMIN' 
  },
  { 
    id: 'TECH-001', 
    name: 'Teknisi Sterilisasi', 
    email: 'tech@meditrack.com', 
    password: 'tech123', 
    role: 'TECHNICIAN' 
  },
  { 
    id: 'NRS-001', 
    name: 'Perawat Unit Bedah', 
    email: 'nurse@meditrack.com', 
    password: 'nurse123', 
    role: 'NURSE', 
    unitId: 'UNIT-001' 
  }
];

// Helper to get past dates for mock data
const getPastDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const INITIAL_INSTRUMENTS: Instrument[] = [
  // Two same sets with different dates to demonstrate FIFO
  { id: 'INST-101', name: 'Set Bedah Mayor', serialNumber: 'SN-2023-001', batchNumber: 'B-2023-001', status: InstrumentStatus.STERILE, currentLocationId: 'CSSD', cycleCount: 12, sterilizationDate: getPastDate(5) }, // Older
  { id: 'INST-102', name: 'Set Bedah Minor', serialNumber: 'SN-2023-002', batchNumber: 'B-2023-002', status: InstrumentStatus.STERILE, currentLocationId: 'CSSD', cycleCount: 5, sterilizationDate: getPastDate(2) },
  { id: 'INST-103', name: 'Set Laparoskopi', serialNumber: 'SN-2023-003', batchNumber: 'B-2023-003', status: InstrumentStatus.STERILE, currentLocationId: 'CSSD', cycleCount: 22, sterilizationDate: getPastDate(1) }, // High Cycle
  { id: 'INST-104', name: 'Set Bor Ortho', serialNumber: 'SN-2023-004', batchNumber: 'B-2023-004', status: InstrumentStatus.IN_USE, currentLocationId: 'UNIT-001', cycleCount: 8, sterilizationDate: getPastDate(10) },
  { id: 'INST-105', name: 'Set Jahit Dasar', serialNumber: 'SN-2023-005', batchNumber: 'B-2023-005', status: InstrumentStatus.DIRTY, currentLocationId: 'UNIT-002', cycleCount: 15, sterilizationDate: getPastDate(12) },
  { id: 'INST-106', name: 'Set Sesar (C-Section)', serialNumber: 'SN-2023-006', batchNumber: 'B-2023-006', status: InstrumentStatus.STERILE, currentLocationId: 'CSSD', cycleCount: 3, sterilizationDate: getPastDate(3) },
  { id: 'INST-107', name: 'Set Vaskular', serialNumber: 'SN-2023-007', batchNumber: 'B-2023-007', status: InstrumentStatus.DECONTAMINATION, currentLocationId: 'CSSD', cycleCount: 30, sterilizationDate: getPastDate(4) }, // High Cycle
  // Duplicate type for FIFO testing
  { id: 'INST-108', name: 'Set Bedah Mayor', serialNumber: 'SN-2023-099', batchNumber: 'B-2023-099', status: InstrumentStatus.STERILE, currentLocationId: 'CSSD', cycleCount: 10, sterilizationDate: getPastDate(1) }, // Newer
];

const INITIAL_TRANSACTIONS: Transaction[] = [];

interface AppContextType {
  state: MockDataState;
  users: User[]; // Expose users list for management
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  logout: () => void;
  // User Management
  manageAddUser: (user: Omit<User, 'id'>) => Promise<boolean>;
  manageUpdateUser: (id: string, data: Partial<User>) => Promise<void>;
  manageDeleteUser: (id: string) => void;
  
  createTransaction: (type: TransactionType, unitId: string, instrumentIds: string[]) => Transaction;
  validateTransaction: (transactionId: string) => void;
  getUnitByQR: (qr: string) => Unit | undefined;
  getTransactionByQR: (qr: string) => Transaction | undefined;
  addUnit: (unit: Omit<Unit, 'id' | 'qrCode'>) => void;
  updateUnit: (id: string, data: Partial<Unit>) => void;
  deleteUnit: (id: string) => void;
  addInstrument: (instrument: Omit<Instrument, 'id'>) => void;
  updateInstrument: (id: string, data: Partial<Instrument>) => void;
  deleteInstrument: (id: string) => void;
  checkSerialNumber: (serial: string, excludeId?: string) => boolean;
  getMaintenanceAlerts: () => Instrument[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<MockDataState>({
    units: INITIAL_UNITS,
    instruments: INITIAL_INSTRUMENTS,
    transactions: INITIAL_TRANSACTIONS,
  });

  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API Delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return false; 
    }

    const newUser: User = {
        id: `USR-${Date.now()}`,
        name,
        email,
        password,
        role,
        unitId: role === 'NURSE' ? 'UNIT-001' : undefined // Default unit assignment
    };

    setUsers([...users, newUser]);
    // Auto login after register
    setCurrentUser(newUser);
    return true;
  };

  const resetPassword = async (email: string): Promise<boolean> => {
     await new Promise(resolve => setTimeout(resolve, 1000));
     // Check if email exists
     return users.some(u => u.email.toLowerCase() === email.toLowerCase());
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // --- USER MANAGEMENT ---
  const manageAddUser = async (userData: Omit<User, 'id'>): Promise<boolean> => {
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        return false;
    }
    const newUser: User = {
        ...userData,
        id: `USR-${Date.now()}-${Math.floor(Math.random()*1000)}`
    };
    setUsers(prev => [...prev, newUser]);
    return true;
  };

  const manageUpdateUser = async (id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
    // If updating self, update current session
    if (currentUser && currentUser.id === id) {
        setCurrentUser(prev => prev ? { ...prev, ...data } : null);
    }
  };

  const manageDeleteUser = (id: string) => {
      setUsers(prev => prev.filter(u => u.id !== id));
  };


  const getUnitByQR = (qr: string) => state.units.find(u => u.qrCode === qr);
  
  const getTransactionByQR = (qr: string) => state.transactions.find(t => t.qrCode === qr);

  const checkSerialNumber = (serial: string, excludeId?: string) => {
    return state.instruments.some(inst => inst.serialNumber === serial && inst.id !== excludeId);
  };

  const getMaintenanceAlerts = () => {
    return state.instruments.filter(inst => inst.cycleCount >= CYCLE_THRESHOLD);
  };

  const createTransaction = (type: TransactionType, unitId: string, instrumentIds: string[]) => {
    const newTransaction: Transaction = {
      id: `TRX-${Date.now()}`,
      qrCode: `TRANS:TRX-${Date.now()}`,
      type,
      status: TransactionStatus.PENDING,
      unitId,
      timestamp: new Date().toISOString(),
      items: instrumentIds,
    };

    setState(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions],
    }));

    return newTransaction;
  };

  const validateTransaction = (transactionId: string) => {
    setState(prev => {
      const transactionIndex = prev.transactions.findIndex(t => t.id === transactionId);
      if (transactionIndex === -1) return prev;

      const transaction = prev.transactions[transactionIndex];
      if (transaction.status === TransactionStatus.VALIDATED) return prev;

      // Update Transaction Status
      const updatedTransactions = [...prev.transactions];
      updatedTransactions[transactionIndex] = { ...transaction, status: TransactionStatus.VALIDATED };

      // Update Instruments Status & Location
      const updatedInstruments = prev.instruments.map(inst => {
        if (transaction.items.includes(inst.id)) {
          if (transaction.type === TransactionType.DISTRIBUTION_STERILE) {
             // Moving from CSSD -> Unit
             return { ...inst, status: InstrumentStatus.IN_USE, currentLocationId: transaction.unitId }; // Assuming ready to use
          } else if (transaction.type === TransactionType.COLLECTION_DIRTY) {
             // Moving from Unit -> CSSD
             return { ...inst, status: InstrumentStatus.DECONTAMINATION, currentLocationId: 'CSSD' };
          }
        }
        return inst;
      });

      return {
        ...prev,
        transactions: updatedTransactions,
        instruments: updatedInstruments
      };
    });
  };

  const addUnit = (unitData: Omit<Unit, 'id' | 'qrCode'>) => {
    // Generate ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `UNIT-${randomSuffix}`;
    // Format: UNIT:{id}
    const newUnit: Unit = {
      ...unitData,
      id: newId,
      qrCode: `UNIT:${newId}`
    };

    setState(prev => ({
      ...prev,
      units: [...prev.units, newUnit]
    }));
  };

  const updateUnit = (id: string, data: Partial<Unit>) => {
    setState(prev => ({
      ...prev,
      units: prev.units.map(u => u.id === id ? { ...u, ...data } : u)
    }));
  };

  const deleteUnit = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus unit ini?')) {
      setState(prev => ({
        ...prev,
        units: prev.units.filter(u => u.id !== id)
      }));
    }
  };

  // --- CRUD INSTRUMENT ---
  const addInstrument = (instrumentData: Omit<Instrument, 'id'>) => {
    const newId = `INST-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInstrument: Instrument = {
      ...instrumentData,
      id: newId,
      // Ensure sterilizationDate is set if missing
      sterilizationDate: instrumentData.sterilizationDate || new Date().toISOString().split('T')[0]
    };
    setState(prev => ({
      ...prev,
      instruments: [...prev.instruments, newInstrument]
    }));
  };

  const updateInstrument = (id: string, data: Partial<Instrument>) => {
    setState(prev => ({
      ...prev,
      instruments: prev.instruments.map(inst => 
        inst.id === id ? { ...inst, ...data } : inst
      )
    }));
  };

  const deleteInstrument = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus instrumen ini? Data yang dihapus tidak dapat dikembalikan.')) {
      setState(prev => ({
        ...prev,
        instruments: prev.instruments.filter(inst => inst.id !== id)
      }));
    }
  };

  return (
    <AppContext.Provider value={{ 
      state, 
      users,
      currentUser,
      login,
      register,
      resetPassword,
      logout,
      manageAddUser,
      manageUpdateUser,
      manageDeleteUser,
      createTransaction, 
      validateTransaction, 
      getUnitByQR, 
      getTransactionByQR, 
      addUnit,
      updateUnit, 
      deleteUnit,
      addInstrument,
      updateInstrument,
      deleteInstrument,
      checkSerialNumber,
      getMaintenanceAlerts
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};