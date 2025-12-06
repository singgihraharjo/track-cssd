import React from 'react';
import { useApp } from '../context/AppContext';
import { InstrumentStatus, TransactionType, CYCLE_THRESHOLD } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Box, CheckCircle, Clock, Truck, Recycle, AlertTriangle, ChevronRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, colorClass }: { title: string, value: string | number, icon: React.ReactNode, colorClass: string }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 tracking-tight group-hover:text-emerald-600 transition-colors">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClass} text-white shadow-sm group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { state, getMaintenanceAlerts } = useApp();
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  const sterileCount = state.instruments.filter(i => i.status === InstrumentStatus.STERILE).length;
  const dirtyCount = state.instruments.filter(i => i.status === InstrumentStatus.DIRTY).length;
  const inUseCount = state.instruments.filter(i => i.status === InstrumentStatus.IN_USE).length;
  const processingCount = state.instruments.filter(i => [InstrumentStatus.DECONTAMINATION, InstrumentStatus.STERILIZING].includes(i.status)).length;
  const todayTransactions = state.transactions.length;

  const maintenanceAlerts = getMaintenanceAlerts();

  const dataStatus = [
    { name: 'Steril', value: sterileCount, color: '#10b981' }, // emerald-500
    { name: 'Dipakai', value: inUseCount, color: '#3b82f6' },   // blue-500
    { name: 'Kotor', value: dirtyCount, color: '#ef4444' },    // red-500
    { name: 'Proses', value: processingCount, color: '#f59e0b' }, // amber-500
  ];

  const unitData = state.units.map(unit => {
    const count = state.instruments.filter(i => i.currentLocationId === unit.id).length;
    return { name: unit.name.replace('Ruang Operasi', 'OK').replace('Gawat Darurat', 'IGD'), count };
  });
  unitData.unshift({
    name: 'CSSD',
    count: state.instruments.filter(i => i.currentLocationId === 'CSSD').length
  });

  const getStatusLabel = (status: string) => {
      switch (status) {
          case 'VALIDATED': return 'Tervalidasi';
          case 'PENDING': return 'Menunggu';
          case 'COMPLETED': return 'Selesai';
          default: return status;
      }
  };

  const filteredTransactions = state.transactions.filter(tx => {
    const txDate = new Date(tx.timestamp).toLocaleDateString('en-CA');
    if (startDate && txDate < startDate) return false;
    if (endDate && txDate > endDate) return false;
    return true;
  });

  const displayTransactions = filteredTransactions.slice(0, 10);

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Maintenance Alert Section */}
      {maintenanceAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200 rounded-2xl p-5 shadow-sm animate-slide-up">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
             <div className="flex items-center gap-3">
               <div className="bg-white p-2.5 rounded-full text-orange-500 shadow-sm border border-orange-100">
                  <AlertTriangle size={24} />
               </div>
               <div>
                  <h3 className="font-bold text-orange-900 text-lg">Peringatan Pemeliharaan</h3>
                  <p className="text-orange-700 text-sm">
                    {maintenanceAlerts.length} instrumen telah melebihi batas siklus sterilisasi.
                  </p>
               </div>
             </div>
             <Link 
               to="/inventory" 
               className="text-sm font-semibold text-orange-700 hover:text-orange-900 hover:bg-orange-100 flex items-center gap-1 bg-white px-4 py-2 rounded-xl border border-orange-200 shadow-sm transition-colors"
             >
               Lihat Detail <ChevronRight size={16} />
             </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
             {maintenanceAlerts.slice(0, 3).map(inst => (
               <div key={inst.id} className="bg-white/80 p-3 rounded-xl border border-orange-100/50 shadow-sm flex justify-between items-center backdrop-blur-sm">
                  <span className="text-sm font-medium text-slate-700 truncate">{inst.name}</span>
                  <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full border border-orange-200">
                     {inst.cycleCount} Siklus
                  </span>
               </div>
             ))}
             {maintenanceAlerts.length > 3 && (
               <div className="flex items-center justify-center text-sm text-orange-700 font-medium bg-orange-100/50 rounded-xl p-3">
                  + {maintenanceAlerts.length - 3} instrumen lainnya
               </div>
             )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="delay-100 animate-slide-up"><StatCard title="Stok Steril" value={sterileCount} icon={<CheckCircle size={24} />} colorClass="bg-emerald-500" /></div>
        <div className="delay-200 animate-slide-up"><StatCard title="Sedang Dipakai" value={inUseCount} icon={<Activity size={24} />} colorClass="bg-blue-500" /></div>
        <div className="delay-300 animate-slide-up"><StatCard title="Proses Cuci/Steril" value={processingCount} icon={<Clock size={24} />} colorClass="bg-amber-500" /></div>
        <div className="delay-100 animate-slide-up"><StatCard title="Transaksi Hari Ini" value={todayTransactions} icon={<Box size={24} />} colorClass="bg-slate-700" /></div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-500 rounded-full"></span> Status Instrumen
          </h3>
          <div className="flex-1 w-full h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={dataStatus}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={85}
                   paddingAngle={5}
                   dataKey="value"
                   stroke="none"
                 >
                   {dataStatus.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                 <Legend verticalAlign="bottom" height={36} iconType="circle"/>
               </PieChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-emerald-500 rounded-full"></span> Lokasi Inventaris
          </h3>
           <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unitData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
             <span className="w-1 h-6 bg-slate-800 rounded-full"></span> Aktivitas Terkini
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-sm bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
             <div className="relative group">
                <input 
                  type="date" 
                  className="pl-8 pr-2 py-1.5 border-none bg-transparent text-slate-600 focus:outline-none text-xs w-28 group-hover:bg-slate-50 rounded"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
             </div>
             <span className="text-slate-300">|</span>
             <div className="relative group">
                <input 
                  type="date" 
                  className="pl-8 pr-2 py-1.5 border-none bg-transparent text-slate-600 focus:outline-none text-xs w-28 group-hover:bg-slate-50 rounded"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
             </div>
             {(startDate || endDate) && (
               <button 
                 onClick={() => { setStartDate(''); setEndDate(''); }}
                 className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 bg-red-50 rounded hover:bg-red-100 transition-colors"
               >
                 Reset
               </button>
             )}
          </div>
        </div>
        <div className="divide-y divide-slate-100">
            {displayTransactions.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <Box size={24} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">Tidak ada aktivitas pada periode ini.</p>
                </div>
            ) : (
                displayTransactions.map((tx, index) => (
                    <div key={tx.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 hover:bg-slate-50 transition-colors duration-200">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl shadow-sm ${tx.type === TransactionType.DISTRIBUTION_STERILE ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                {tx.type === TransactionType.DISTRIBUTION_STERILE ? <Truck size={18} /> : <Recycle size={18} />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-slate-800 text-sm sm:text-base mb-0.5">
                                    {tx.type === TransactionType.DISTRIBUTION_STERILE ? 'Distribusi Steril' : 'Pengambilan Kotor'}
                                </p>
                                <p className="text-xs text-slate-500 flex items-center gap-2">
                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-600">{state.units.find(u => u.id === tx.unitId)?.name}</span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                    <span>{tx.items.length} item</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1 pl-14 sm:pl-0">
                             <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Clock size={12} />
                                {new Date(tx.timestamp).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                                <span className="hidden sm:inline">• {new Date(tx.timestamp).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</span>
                             </div>
                             <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold border ${
                                 tx.status === 'VALIDATED' 
                                 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                 : 'bg-amber-50 text-amber-700 border-amber-100'
                             }`}>
                                 {getStatusLabel(tx.status)}
                             </span>
                        </div>
                    </div>
                ))
            )}
        </div>
        {displayTransactions.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <Link to="/history" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                    Lihat Semua Riwayat &rarr;
                </Link>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;