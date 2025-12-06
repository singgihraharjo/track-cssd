import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Scanner from '../components/Scanner';
import { Transaction, TransactionStatus, TransactionType } from '../types';
import { Box, CheckCircle, Truck, Recycle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ScanValidation: React.FC = () => {
  const { getTransactionByQR, validateTransaction, state } = useApp();
  const [scannedTransaction, setScannedTransaction] = useState<Transaction | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Helper to find the last created transaction for simulation convenience
  const latestTransactionQR = state.transactions.length > 0 ? state.transactions[0].qrCode : 'TRANS:INVALID';

  const handleScan = (qrData: string) => {
    const transaction = getTransactionByQR(qrData);
    if (transaction) {
      setScannedTransaction(transaction);
      setIsSuccess(false);
    } else {
      alert('Transaction not found or invalid.');
    }
  };

  const handleConfirm = () => {
    if (scannedTransaction) {
      validateTransaction(scannedTransaction.id);
      setIsSuccess(true);
      setScannedTransaction(null);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Transaction Validated!</h2>
        <p className="text-slate-500 max-w-md">The inventory has been updated successfully. The instruments have been transferred.</p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all"
        >
          Scan Another
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {!scannedTransaction ? (
        <>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Validate Transaction</h2>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <Scanner 
                onScan={handleScan} 
                simulateData={latestTransactionQR} 
                label="Scan Transaction QR" 
             />
             <div className="mt-4 text-center text-xs text-slate-400">
                (Tip: Use the generated QR from the Distribution step)
             </div>
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2 text-slate-500 hover:text-slate-800 cursor-pointer" onClick={() => setScannedTransaction(null)}>
             <span>&larr; Cancel</span>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
             <div className={`p-6 text-white ${scannedTransaction.type === TransactionType.DISTRIBUTION_STERILE ? 'bg-emerald-600' : 'bg-red-600'}`}>
                <div className="flex items-center gap-3 mb-2">
                   {scannedTransaction.type === TransactionType.DISTRIBUTION_STERILE ? <Truck size={24} /> : <Recycle size={24} />}
                   <h2 className="text-xl font-bold">
                      {scannedTransaction.type === TransactionType.DISTRIBUTION_STERILE ? 'Receiving Sterile Items' : 'Handover Dirty Items'}
                   </h2>
                </div>
                <p className="opacity-90">Transaction ID: {scannedTransaction.id}</p>
             </div>

             <div className="p-6">
                {scannedTransaction.status === TransactionStatus.VALIDATED ? (
                   <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg flex items-center gap-3 mb-6">
                      <AlertCircle size={20} />
                      <span className="font-medium">This transaction has already been validated.</span>
                   </div>
                ) : (
                   <div className="mb-6">
                      <p className="text-sm text-slate-500 uppercase font-bold mb-2">Items Included</p>
                      <div className="space-y-2">
                         {state.instruments.filter(i => scannedTransaction.items.includes(i.id)).map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                               <div className="flex items-center gap-3">
                                  <Box size={16} className="text-slate-400" />
                                  <span className="font-medium text-slate-800">{item.name}</span>
                               </div>
                               <span className="text-xs font-mono text-slate-500">{item.batchNumber}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                )}

                <button 
                  onClick={handleConfirm}
                  disabled={scannedTransaction.status === TransactionStatus.VALIDATED}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {scannedTransaction.status === TransactionStatus.VALIDATED ? 'Already Processed' : 'Confirm & Validate'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanValidation;