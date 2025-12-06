import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Scanner from '../components/Scanner';
import { InstrumentStatus, TransactionType, Unit } from '../types';
import { Check, ChevronRight, Truck, Clock, AlertTriangle } from 'lucide-react';

const DistributionSterile: React.FC = () => {
  const { state, getUnitByQR, createTransaction } = useApp();
  
  // Steps: 0 = Scan Unit, 1 = Select Items, 2 = Show QR
  const [step, setStep] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);

  // Filter available sterile items (located in CSSD)
  const availableItems = state.instruments.filter(
    i => i.status === InstrumentStatus.STERILE && i.currentLocationId === 'CSSD'
  );

  // --- FIFO LOGIC ---
  // 1. Sort items: Oldest sterilization date FIRST (Ascending)
  const sortedItems = [...availableItems].sort((a, b) => {
    return new Date(a.sterilizationDate).getTime() - new Date(b.sterilizationDate).getTime();
  });

  // 2. Determine the "oldest" date for each unique instrument name to flag priority
  const oldestDates: Record<string, string> = {};
  sortedItems.forEach(item => {
      if (!oldestDates[item.name]) {
          oldestDates[item.name] = item.sterilizationDate;
      }
  });

  const isOldestAvailable = (item: typeof sortedItems[0]) => {
      return item.sterilizationDate === oldestDates[item.name];
  };

  const handleUnitScan = (qrData: string) => {
    const unit = getUnitByQR(qrData);
    if (unit) {
      setSelectedUnit(unit);
      setStep(1);
    } else {
      alert('Invalid Unit QR Code');
    }
  };

  const toggleItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    if (selectedUnit && selectedItems.length > 0) {
      const trx = createTransaction(TransactionType.DISTRIBUTION_STERILE, selectedUnit.id, selectedItems);
      setGeneratedQR(trx.qrCode);
      setStep(2);
    }
  };

  const resetFlow = () => {
    setStep(0);
    setSelectedUnit(null);
    setSelectedItems([]);
    setGeneratedQR(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Distribusi Barang Steril</h2>
          <div className="flex gap-2">
            {[0, 1, 2].map(s => (
                <div key={s} className={`h-2 w-8 rounded-full ${step >= s ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            ))}
          </div>
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
             <h3 className="text-lg font-semibold mb-4">Scan QR Code Unit Tujuan</h3>
             <p className="text-slate-500 mb-6">Identifikasi unit yang meminta barang steril.</p>
             <Scanner 
                onScan={handleUnitScan} 
                simulateData="UNIT:UNIT-001" 
                label="Scan Unit" 
             />
             <div className="mt-4 text-xs text-slate-400">
                (Tip: Gunakan 'UNIT:UNIT-001' untuk simulasi)
             </div>
          </div>
        </div>
      )}

      {step === 1 && selectedUnit && (
        <div className="space-y-6">
           <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg flex items-center justify-between">
                <div>
                    <span className="text-xs text-emerald-600 font-bold uppercase">Tujuan Distribusi</span>
                    <h3 className="text-lg font-semibold text-emerald-900">{selectedUnit.name}</h3>
                </div>
                <button onClick={() => setStep(0)} className="text-sm text-emerald-600 hover:underline">Ganti</button>
           </div>

           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800">Pilih Instrumen (FIFO)</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock size={14} />
                        <span>Diurutkan berdasarkan Tanggal Steril</span>
                    </div>
                </div>
                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {sortedItems.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">Tidak ada instrumen steril di CSSD.</div>
                    ) : (
                        sortedItems.map(item => {
                            const isRecommended = isOldestAvailable(item);
                            const isSelected = selectedItems.includes(item.id);
                            
                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => toggleItem(item.id)}
                                    className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${isSelected ? 'bg-emerald-50/50' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                                            {isSelected && <Check size={14} className="text-white" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-slate-800">{item.name}</p>
                                                {isRecommended && (
                                                    <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold">FIFO</span>
                                                )}
                                            </div>
                                            <div className="flex gap-2 items-center text-xs mt-1">
                                                <span className="text-slate-500 font-mono">{item.batchNumber}</span>
                                                <span className="text-slate-400">•</span>
                                                <span className={`flex items-center gap-1 ${isRecommended ? 'text-green-600 font-medium' : 'text-slate-500'}`}>
                                                    <Clock size={12} />
                                                    {item.sterilizationDate}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                       <span className="text-xs font-mono text-slate-400 block">{item.id}</span>
                                       {!isRecommended && (
                                           <span className="text-[10px] text-orange-500 flex items-center justify-end gap-1 mt-1">
                                               <AlertTriangle size={10} />
                                               Ada stok lebih lama
                                           </span>
                                       )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
           </div>

           <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 md:static md:bg-transparent md:border-0 md:p-0">
               <button 
                  onClick={handleSubmit} 
                  disabled={selectedItems.length === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
               >
                  Buat QR Distribusi <ChevronRight size={20} />
               </button>
           </div>
        </div>
      )}

      {step === 2 && generatedQR && (
        <div className="space-y-6 text-center">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 mb-4">
                    <Truck size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Siap Didistribusikan</h3>
                <p className="text-slate-500 mb-6">Minta perawat unit untuk memindai QR ini saat serah terima barang.</p>
                
                <div className="p-4 bg-white border-4 border-slate-800 rounded-lg mb-4">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${generatedQR}`} 
                      alt="Transaction QR" 
                      className="w-48 h-48"
                    />
                </div>
                <p className="font-mono text-sm text-slate-400 bg-slate-100 px-3 py-1 rounded">{generatedQR}</p>
            </div>

            <button onClick={resetFlow} className="text-slate-600 hover:text-emerald-600 font-medium">
                Mulai Distribusi Baru
            </button>
        </div>
      )}
    </div>
  );
};

export default DistributionSterile;