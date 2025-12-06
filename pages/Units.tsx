import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Unit } from '../types';
import { Plus, Trash2, QrCode, X, Printer, Building2, Edit2, Scissors, Activity, Siren, Bed } from 'lucide-react';

const Units: React.FC = () => {
  const { state, addUnit, updateUnit, deleteUnit } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState<Unit | null>(null);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitType, setNewUnitType] = useState<Unit['type']>('WARD');

  const handleOpenAdd = () => {
    setEditingId(null);
    setNewUnitName('');
    setNewUnitType('WARD');
    setShowModal(true);
  };

  const handleOpenEdit = (unit: Unit) => {
    setEditingId(unit.id);
    setNewUnitName(unit.name);
    setNewUnitType(unit.type);
    setShowModal(true);
  };

  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName) return;

    if (editingId) {
      updateUnit(editingId, {
        name: newUnitName,
        type: newUnitType
      });
    } else {
      addUnit({
        name: newUnitName,
        type: newUnitType,
      });
    }

    // Reset and close
    setNewUnitName('');
    setNewUnitType('WARD');
    setEditingId(null);
    setShowModal(false);
  };

  const getTypeName = (type: string) => {
    const types: Record<string, string> = {
      'OR': 'Ruang Operasi (OK)',
      'ICU': 'ICU / ICCU',
      'ER': 'IGD (Gawat Darurat)',
      'WARD': 'Ruang Rawat Inap'
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'OR': 'bg-emerald-100 text-emerald-700',
      'ICU': 'bg-blue-100 text-blue-700',
      'ER': 'bg-red-100 text-red-700',
      'WARD': 'bg-slate-100 text-slate-700'
    };
    return colors[type] || 'bg-slate-100 text-slate-700';
  };

  const getUnitIcon = (type: string) => {
    switch (type) {
      case 'OR': return <Scissors size={24} />;
      case 'ICU': return <Activity size={24} />;
      case 'ER': return <Siren size={24} />;
      case 'WARD': return <Bed size={24} />;
      default: return <Building2 size={24} />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Unit & Lokasi</h2>
          <p className="text-slate-500">Kelola daftar unit rumah sakit dan cetak QR Code lokasi.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={20} />
          <span>Tambah Unit Baru</span>
        </button>
      </div>

      {/* Grid of Units */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.units.map((unit) => (
          <div key={unit.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getTypeColor(unit.type)}`}>
                  {getUnitIcon(unit.type)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{unit.name}</h3>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{getTypeName(unit.type)}</span>
                </div>
              </div>
              <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                 <button 
                    onClick={() => handleOpenEdit(unit)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit Unit"
                 >
                    <Edit2 size={18} />
                 </button>
                 <button 
                    onClick={() => deleteUnit(unit.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Hapus Unit"
                 >
                    <Trash2 size={18} />
                 </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                <QrCode size={16} className="text-slate-400" />
                <span className="font-mono">{unit.id}</span>
              </div>
              
              <button 
                onClick={() => setShowQRModal(unit)}
                className="w-full py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <QrCode size={16} />
                Lihat QR Code
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">
                        {editingId ? 'Edit Unit' : 'Tambah Unit Baru'}
                    </h3>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSaveUnit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nama Unit</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            value={newUnitName}
                            onChange={(e) => setNewUnitName(e.target.value)}
                            placeholder="Contoh: Ruang Operasi 1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Unit</label>
                        <select 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            value={newUnitType}
                            onChange={(e) => setNewUnitType(e.target.value as Unit['type'])}
                        >
                            <option value="WARD">Ruang Rawat Inap</option>
                            <option value="OR">Ruang Operasi (OK)</option>
                            <option value="ICU">ICU / ICCU</option>
                            <option value="ER">IGD (Gawat Darurat)</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setShowModal(false)}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Modal QR Code */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">QR Code Unit</h3>
                    <button onClick={() => setShowQRModal(null)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-8 flex flex-col items-center text-center space-y-4" id="print-area">
                    <div className={`p-3 rounded-full ${getTypeColor(showQRModal.type).split(' ')[0]} mb-2`}>
                       {getUnitIcon(showQRModal.type)}
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">{showQRModal.name}</h2>
                    <p className="text-sm text-slate-500">{getTypeName(showQRModal.type)}</p>
                    
                    <div className="p-4 bg-white border-4 border-slate-800 rounded-lg">
                         <img 
                           src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${showQRModal.qrCode}`} 
                           alt={`QR ${showQRModal.name}`}
                           className="w-48 h-48"
                         />
                    </div>
                    <p className="font-mono text-sm text-slate-400 bg-slate-100 px-3 py-1 rounded">{showQRModal.qrCode}</p>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <button 
                        onClick={handlePrint}
                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg font-medium transition-colors"
                    >
                        <Printer size={18} />
                        Cetak QR Code
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Units;
