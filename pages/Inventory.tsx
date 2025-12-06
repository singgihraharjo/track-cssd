import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Filter, Plus, Edit2, Trash2, X, Save, Calendar, QrCode, Printer, AlertTriangle, MapPin, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Instrument, InstrumentStatus, CYCLE_THRESHOLD } from '../types';

const Inventory: React.FC = () => {
  const { state, addInstrument, updateInstrument, deleteInstrument, checkSerialNumber } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: keyof Instrument | 'status', direction: 'ascending' | 'descending' } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // QR Modal State
  const [qrInstrument, setQrInstrument] = useState<Instrument | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Instrument>>({
    name: '',
    serialNumber: '',
    batchNumber: '',
    status: InstrumentStatus.STERILE,
    currentLocationId: 'CSSD',
    cycleCount: 0,
    sterilizationDate: new Date().toISOString().split('T')[0]
  });

  const getLocationName = (locationId: string) => {
    if (locationId === 'CSSD') return 'Gudang CSSD';
    return state.units.find(u => u.id === locationId)?.name || 'Unknown';
  };

  const getStatusColor = (status: InstrumentStatus) => {
    switch (status) {
      case InstrumentStatus.STERILE: return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case InstrumentStatus.IN_USE: return 'bg-blue-100 text-blue-700 border border-blue-200';
      case InstrumentStatus.DIRTY: return 'bg-red-100 text-red-700 border border-red-200';
      case InstrumentStatus.DECONTAMINATION: return 'bg-orange-100 text-orange-700 border border-orange-200';
      case InstrumentStatus.STERILIZING: return 'bg-purple-100 text-purple-700 border border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const requestSort = (key: keyof Instrument) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  let filteredInstruments = state.instruments.filter(inst => {
    const matchesSearch = inst.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inst.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inst.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inst.status === statusFilter;
    
    let matchesLocation = true;
    if (locationFilter === 'CSSD') {
        matchesLocation = inst.currentLocationId === 'CSSD';
    } else if (locationFilter === 'UNITS') {
        matchesLocation = inst.currentLocationId !== 'CSSD';
    }

    const matchesAlert = showAlertsOnly ? inst.cycleCount >= CYCLE_THRESHOLD : true;

    return matchesSearch && matchesStatus && matchesLocation && matchesAlert;
  });

  if (sortConfig !== null) {
    filteredInstruments.sort((a, b) => {
      let aValue: any = a[sortConfig.key];
      let bValue: any = b[sortConfig.key];

      if (sortConfig.key === 'currentLocationId') {
          aValue = getLocationName(a.currentLocationId);
          bValue = getLocationName(b.currentLocationId);
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({
      name: '',
      serialNumber: '',
      batchNumber: `B-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      status: InstrumentStatus.STERILE,
      currentLocationId: 'CSSD',
      cycleCount: 0,
      sterilizationDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inst: Instrument) => {
    setIsEditMode(true);
    setCurrentId(inst.id);
    setFormData({ ...inst });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.batchNumber || !formData.serialNumber) {
        alert("Mohon lengkapi semua field wajib.");
        return;
    }

    const batchRegex = /^B-\d{4}-\d{3}$/;
    if (!batchRegex.test(formData.batchNumber)) {
        alert("Format Nomor Batch tidak valid. Gunakan format: B-YYYY-NNN (Contoh: B-2024-123).");
        return;
    }

    if ((formData.cycleCount ?? 0) < 0) {
        alert("Jumlah siklus harus berupa angka non-negatif.");
        return;
    }

    if (checkSerialNumber(formData.serialNumber, currentId || undefined)) {
        alert(`Nomor Seri "${formData.serialNumber}" sudah terdaftar pada instrumen lain.`);
        return;
    }

    if (isEditMode && currentId) {
        updateInstrument(currentId, formData);
    } else {
        addInstrument(formData as Omit<Instrument, 'id'>);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteInstrument(id);
  };

  const handlePrintQR = () => {
    window.print();
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof Instrument }) => {
      if (sortConfig?.key !== columnKey) return <ArrowUpDown size={14} className="text-slate-300 ml-1 opacity-50" />;
      return sortConfig.direction === 'ascending' 
        ? <ArrowUp size={14} className="text-emerald-600 ml-1" /> 
        : <ArrowDown size={14} className="text-emerald-600 ml-1" />;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-0">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: white; z-index: 9999; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Inventaris Instrumen</h2>
           <p className="text-slate-500">Kelola stok, lokasi, dan status sterilisasi instrumen.</p>
        </div>
        
        <button onClick={handleOpenAdd} className="btn-primary w-full md:w-auto">
          <Plus size={20} />
          <span>Tambah Instrumen</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Cari nama, no. batch, atau no. seri..." 
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex flex-col sm:flex-row gap-3">
             <div className="relative">
                 <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <select 
                    className="input-field pl-10 appearance-none min-w-[180px]"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                 >
                    <option value="ALL">Semua Lokasi</option>
                    <option value="CSSD">Gudang CSSD</option>
                    <option value="UNITS">Sedang di Unit</option>
                 </select>
             </div>
             <div className="relative">
                 <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <select 
                    className="input-field pl-10 appearance-none min-w-[180px]"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                 >
                    <option value="ALL">Semua Status</option>
                    {Object.values(InstrumentStatus).map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                 </select>
             </div>
             
             <button 
                onClick={() => setShowAlertsOnly(!showAlertsOnly)}
                className={`btn-secondary justify-between ${showAlertsOnly ? 'bg-orange-50 border-orange-200 text-orange-700' : ''}`}
             >
                <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className={showAlertsOnly ? "text-orange-600" : "text-slate-400"} />
                    <span className="hidden sm:inline">Perlu Maintenance</span>
                    <span className="sm:hidden">Maintenance</span>
                </div>
             </button>
         </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        {[{k:'name', l:'Nama Set'}, {k:'serialNumber', l:'No. Seri'}, {k:'batchNumber', l:'No. Batch'}, {k:'sterilizationDate', l:'Tgl Steril'}, {k:'currentLocationId', l:'Lokasi'}, {k:'cycleCount', l:'Siklus'}, {k:'status', l:'Status'}].map(col => (
                            <th 
                                key={col.k}
                                className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                                onClick={() => requestSort(col.k as keyof Instrument)}
                            >
                                <div className="flex items-center gap-1">{col.l} <SortIcon columnKey={col.k as keyof Instrument}/></div>
                            </th>
                        ))}
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right sticky right-0 bg-slate-50 z-10 shadow-[-5px_0_10px_rgba(0,0,0,0.02)]">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredInstruments.map(inst => (
                        <tr key={inst.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">{inst.name}</td>
                            <td className="px-6 py-4 text-slate-600 font-mono text-xs font-bold whitespace-nowrap">{inst.serialNumber}</td>
                            <td className="px-6 py-4 text-slate-600 font-mono text-xs whitespace-nowrap">{inst.batchNumber}</td>
                            <td className="px-6 py-4 text-slate-600 text-sm whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} className="text-slate-400" />
                                    {inst.sterilizationDate}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${inst.currentLocationId === 'CSSD' ? 'bg-orange-400' : 'bg-blue-400'}`}></span>
                                    {getLocationName(inst.currentLocationId)}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    <span className={inst.cycleCount >= CYCLE_THRESHOLD ? "text-orange-600 font-bold" : ""}>
                                        {inst.cycleCount}
                                    </span>
                                    {inst.cycleCount >= CYCLE_THRESHOLD && (
                                        <div className="relative group/tooltip">
                                            <AlertTriangle size={16} className="text-orange-500" />
                                            {/* Tooltip implementation can be purely CSS or via library, kept simple here */}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(inst.status)}`}>
                                    {inst.status.replace('_', ' ')}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right sticky right-0 bg-white group-hover:bg-slate-50 z-10 shadow-[-5px_0_10px_rgba(0,0,0,0.02)]">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => setQrInstrument(inst)}
                                        className="p-2 text-emerald-600 hover:bg-emerald-50 bg-emerald-50/30 border border-emerald-100 rounded-lg transition-colors"
                                        title="Lihat QR Code"
                                    >
                                        <QrCode size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleOpenEdit(inst)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(inst.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Hapus"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredInstruments.length === 0 && (
                        <tr>
                            <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <Search size={24} className="text-slate-300" />
                                    </div>
                                    <p className="font-medium">Tidak ada instrumen yang ditemukan.</p>
                                    <p className="text-sm text-slate-400 mt-1">Coba sesuaikan filter pencarian Anda.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-zoom-in">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">
                        {isEditMode ? 'Edit Instrumen' : 'Tambah Instrumen Baru'}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Set Instrumen</label>
                            <input 
                                type="text" 
                                required
                                className="input-field"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Contoh: Set Bedah Minor"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nomor Seri</label>
                            <input 
                                type="text" 
                                required
                                className="input-field font-mono"
                                value={formData.serialNumber}
                                onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                                placeholder="SN-XXXX"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nomor Batch</label>
                            <input 
                                type="text" 
                                required
                                className="input-field font-mono"
                                value={formData.batchNumber}
                                onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                                placeholder="B-YYYY-NNN"
                            />
                        </div>

                         <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tanggal Steril</label>
                            <input 
                                type="date" 
                                required
                                className="input-field"
                                value={formData.sterilizationDate}
                                onChange={(e) => setFormData({...formData, sterilizationDate: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jumlah Siklus</label>
                            <input 
                                type="number" 
                                min="0"
                                className="input-field"
                                value={formData.cycleCount}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    setFormData({...formData, cycleCount: isNaN(val) ? 0 : Math.max(0, val)});
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                            <select 
                                className="input-field"
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value as InstrumentStatus})}
                            >
                                {Object.values(InstrumentStatus).map(s => (
                                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Lokasi</label>
                            <select 
                                className="input-field"
                                value={formData.currentLocationId}
                                onChange={(e) => setFormData({...formData, currentLocationId: e.target.value})}
                            >
                                <option value="CSSD">Gudang CSSD</option>
                                {state.units.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3 border-t border-slate-50">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="btn-secondary flex-1"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            className="btn-primary flex-1"
                        >
                            <Save size={18} />
                            Simpan Data
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Modal QR Code */}
      {qrInstrument && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-zoom-in relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                <div className="px-6 py-4 flex justify-between items-center mt-2">
                    <h3 className="font-bold text-lg text-slate-800">QR Code Instrumen</h3>
                    <button onClick={() => setQrInstrument(null)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-8 flex flex-col items-center text-center space-y-6" id="print-area">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 leading-tight">{qrInstrument.name}</h2>
                        <p className="text-slate-500 text-sm mt-1">{getLocationName(qrInstrument.currentLocationId)}</p>
                    </div>
                    
                    <div className="p-4 bg-white border-4 border-slate-900 rounded-2xl shadow-xl">
                         <img 
                           src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({id: qrInstrument.id, name: qrInstrument.name, batchNumber: qrInstrument.batchNumber}))}`} 
                           alt={`QR ${qrInstrument.name}`}
                           className="w-48 h-48 mix-blend-multiply"
                         />
                    </div>
                    
                    <div className="w-full space-y-2">
                        <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                            <span className="text-slate-400">ID</span>
                            <span className="font-mono font-semibold text-slate-700">{qrInstrument.id}</span>
                        </div>
                        <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                            <span className="text-slate-400">SN</span>
                            <span className="font-mono font-semibold text-slate-700">{qrInstrument.serialNumber}</span>
                        </div>
                        <div className="flex justify-between text-xs pb-1">
                            <span className="text-slate-400">Batch</span>
                            <span className="font-mono font-semibold text-slate-700">{qrInstrument.batchNumber}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <button 
                        onClick={handlePrintQR}
                        className="w-full btn-primary bg-slate-800 hover:bg-slate-700 text-white"
                    >
                        <Printer size={18} />
                        Cetak Label
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;