
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TransactionType, TransactionStatus } from '../types';
import { Search, Filter, Calendar, Truck, Recycle, CheckCircle, Clock, X } from 'lucide-react';

const TransactionHistory: React.FC = () => {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getUnitName = (unitId: string) => {
    return state.units.find(u => u.id === unitId)?.name || unitId;
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.VALIDATED:
        return <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700"><CheckCircle size={12}/> Tervalidasi</span>;
      case TransactionStatus.PENDING:
        return <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><Clock size={12}/> Menunggu</span>;
      case TransactionStatus.COMPLETED:
        return <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><CheckCircle size={12}/> Selesai</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getTypeBadge = (type: TransactionType) => {
    if (type === TransactionType.DISTRIBUTION_STERILE) {
      return (
        <div className="flex items-center gap-2 text-emerald-700">
          <div className="p-1.5 bg-emerald-100 rounded text-emerald-600">
            <Truck size={16} />
          </div>
          <span className="font-medium">Distribusi Steril</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-red-700">
        <div className="p-1.5 bg-red-100 rounded text-red-600">
          <Recycle size={16} />
        </div>
        <span className="font-medium">Pengambilan Kotor</span>
      </div>
    );
  };

  const filteredTransactions = state.transactions.filter(tx => {
    const matchesSearch = tx.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;

    let matchesDate = true;
    if (startDate || endDate) {
      const txDate = new Date(tx.timestamp).toLocaleDateString('en-CA'); // YYYY-MM-DD
      if (startDate && txDate < startDate) matchesDate = false;
      if (endDate && txDate > endDate) matchesDate = false;
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Riwayat Transaksi</h2>
          <p className="text-slate-500">Lacak semua aktivitas distribusi dan pengambilan instrumen.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Cari ID Transaksi..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
             <select 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
             >
                <option value="ALL">Semua Jenis</option>
                <option value={TransactionType.DISTRIBUTION_STERILE}>Distribusi Steril</option>
                <option value={TransactionType.COLLECTION_DIRTY}>Pengambilan Kotor</option>
             </select>
             <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>

          {/* Status Filter */}
          <div className="relative">
             <select 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
             >
                <option value="ALL">Semua Status</option>
                <option value={TransactionStatus.PENDING}>Menunggu</option>
                <option value={TransactionStatus.VALIDATED}>Tervalidasi</option>
             </select>
             <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
             <div className="relative flex-1">
               <input 
                 type="date" 
                 className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
                 value={startDate}
                 onChange={(e) => setStartDate(e.target.value)}
               />
               <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
             </div>
             <span className="text-slate-400">-</span>
             <div className="relative flex-1">
               <input 
                 type="date" 
                 className="w-full pl-8 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
                 value={endDate}
                 onChange={(e) => setEndDate(e.target.value)}
               />
               <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
             </div>
          </div>
        </div>

        {/* Active Filters Summary & Reset */}
        {(searchTerm || typeFilter !== 'ALL' || statusFilter !== 'ALL' || startDate || endDate) && (
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500">Menampilkan {filteredTransactions.length} hasil</p>
                <button 
                    onClick={clearFilters}
                    className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                >
                    <X size={14} /> Reset Filter
                </button>
            </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID Transaksi</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Jenis</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Terkait</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah Item</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Waktu</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                Tidak ada transaksi yang ditemukan.
                            </td>
                        </tr>
                    ) : (
                        filteredTransactions.map(tx => (
                            <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs font-medium text-slate-500">
                                    {tx.id}
                                </td>
                                <td className="px-6 py-4">
                                    {getTypeBadge(tx.type)}
                                </td>
                                <td className="px-6 py-4 text-slate-700 font-medium">
                                    {getUnitName(tx.unitId)}
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    {tx.items.length} item
                                </td>
                                <td className="px-6 py-4 text-slate-600 text-sm">
                                    <div className="flex flex-col">
                                        <span>{new Date(tx.timestamp).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                                        <span className="text-xs text-slate-400">{new Date(tx.timestamp).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(tx.status)}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
