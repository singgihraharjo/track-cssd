import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Scanner from '../components/Scanner';
import { InstrumentStatus, TransactionType, Unit } from '../types';
import { Check, ChevronRight, Recycle } from 'lucide-react';

const CollectionDirty: React.FC = () => {
  const { state, getUnitByQR, createTransaction } = useApp();
  
  const [step, setStep] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);

  // Filter items that are DIRTY or IN_USE in the selected unit
  const unitDirtyItems = selectedUnit 
    ? state.instruments.filter(i => 
        (i.status === InstrumentStatus.DIRTY || i.status === InstrumentStatus.IN_USE) && 
        i.currentLocationId === selectedUnit.id
      )
    : [];

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
      const trx = createTransaction(TransactionType.COLLECTION_DIRTY, selectedUnit.id, selectedItems);
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
          <h2 className="text-2xl font-bold text-slate-800">Collect Dirty Instruments</h2>
          <div className="flex gap-2">
            {[0, 1, 2].map(s => (
                <div key={s} className={`h-2 w-8 rounded-full ${step >= s ? 'bg-red-500' : 'bg-slate-200'}`} />
            ))}
          </div>
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
             <h3 className="text-lg font-semibold mb-4">Scan Unit QR Code</h3>
             <p className="text-slate-500 mb-6">Identify the unit to collect dirty instruments from.</p>
             <Scanner 
                onScan={handleUnitScan} 
                simulateData="UNIT:UNIT-001" 
                label="Scan Unit" 
             />
             <div className="mt-4 text-xs text-slate-400">
                (Tip: Use 'UNIT:UNIT-001' which has items IN_USE)
             </div>
          </div>
        </div>
      )}

      {step === 1 && selectedUnit && (
        <div className="space-y-6">
           <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex items-center justify-between">
                <div>
                    <span className="text-xs text-red-600 font-bold uppercase">Collecting From</span>
                    <h3 className="text-lg font-semibold text-red-900">{selectedUnit.name}</h3>
                </div>
                <button onClick={() => setStep(0)} className="text-sm text-red-600 hover:underline">Change</button>
           </div>

           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-semibold text-slate-800">Select Instruments to Collect</h3>
                </div>
                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {unitDirtyItems.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">No dirty or used items found in this unit.</div>
                    ) : (
                        unitDirtyItems.map(item => (
                            <div 
                                key={item.id} 
                                onClick={() => toggleItem(item.id)}
                                className={`p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${selectedItems.includes(item.id) ? 'bg-red-50/50' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedItems.includes(item.id) ? 'bg-red-500 border-red-500' : 'border-slate-300'}`}>
                                        {selectedItems.includes(item.id) && <Check size={14} className="text-white" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">{item.name}</p>
                                        <div className="flex gap-2 items-center">
                                            <span className="text-xs text-slate-500">{item.batchNumber}</span>
                                            <span className={`text-[10px] px-1.5 rounded-full ${item.status === 'IN_USE' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                                {item.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs font-mono text-slate-400">{item.id}</span>
                            </div>
                        ))
                    )}
                </div>
           </div>

           <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 md:static md:bg-transparent md:border-0 md:p-0">
               <button 
                  onClick={handleSubmit} 
                  disabled={selectedItems.length === 0}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
               >
                  Generate Collection QR <ChevronRight size={20} />
               </button>
           </div>
        </div>
      )}

      {step === 2 && generatedQR && (
        <div className="space-y-6 text-center">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                <div className="bg-red-100 p-3 rounded-full text-red-600 mb-4">
                    <Recycle size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Collection</h3>
                <p className="text-slate-500 mb-6">Ask the unit nurse to scan this QR to authorize the handover.</p>
                
                {/* Simulated QR Code Display */}
                <div className="p-4 bg-white border-4 border-slate-800 rounded-lg mb-4">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${generatedQR}`} 
                      alt="Transaction QR" 
                      className="w-48 h-48"
                    />
                </div>
                <p className="font-mono text-sm text-slate-400 bg-slate-100 px-3 py-1 rounded">{generatedQR}</p>
            </div>

            <button onClick={resetFlow} className="text-slate-600 hover:text-red-600 font-medium">
                Start New Collection
            </button>
        </div>
      )}
    </div>
  );
};

export default CollectionDirty;