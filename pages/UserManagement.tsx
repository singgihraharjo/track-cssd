import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';
import { Plus, Edit2, Trash2, X, Search, User as UserIcon, ShieldCheck, UserCircle, Save, Wrench } from 'lucide-react';

const UserManagement: React.FC = () => {
  const { users, currentUser, state, manageAddUser, manageUpdateUser, manageDeleteUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<User>>({
      name: '',
      email: '',
      password: '',
      role: 'NURSE',
      unitId: ''
  });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
      setEditingId(null);
      setFormData({
          name: '',
          email: '',
          password: '',
          role: 'NURSE',
          unitId: ''
      });
      setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
      setEditingId(user.id);
      setFormData({
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role,
          unitId: user.unitId || ''
      });
      setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name || !formData.email || !formData.password) {
          alert('Mohon lengkapi data wajib.');
          return;
      }

      const payload = {
          ...formData,
          unitId: formData.role === 'NURSE' ? formData.unitId : undefined
      };

      if (editingId) {
          await manageUpdateUser(editingId, payload);
      } else {
          const success = await manageAddUser(payload as Omit<User, 'id'>);
          if (!success) {
              alert('Email sudah digunakan user lain.');
              return;
          }
      }
      setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
      if (id === currentUser?.id) {
          alert('Anda tidak dapat menghapus akun sendiri.');
          return;
      }
      if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
          manageDeleteUser(id);
      }
  };

  const getUnitName = (unitId?: string) => {
      if (!unitId) return '-';
      return state.units.find(u => u.id === unitId)?.name || 'Unknown Unit';
  };

  const getRoleIcon = (role: UserRole) => {
      switch (role) {
          case 'ADMIN': return <ShieldCheck size={12}/>;
          case 'TECHNICIAN': return <Wrench size={12}/>;
          default: return <UserCircle size={12}/>;
      }
  };

  const getRoleColorClass = (role: UserRole) => {
      switch (role) {
          case 'ADMIN': return 'bg-emerald-100 text-emerald-700';
          case 'TECHNICIAN': return 'bg-amber-100 text-amber-700';
          default: return 'bg-blue-100 text-blue-700';
      }
  };

  const getAvatarBgClass = (role: UserRole) => {
    switch (role) {
        case 'ADMIN': return 'bg-emerald-500';
        case 'TECHNICIAN': return 'bg-amber-500';
        default: return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Manajemen Pengguna</h2>
           <p className="text-slate-500">Kelola akun Admin, Teknisi, dan Perawat Unit.</p>
        </div>
        
        <button 
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={20} />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Cari nama atau email..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Peran</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Unit (Jika Perawat)</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarBgClass(user.role)}`}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <span className="font-medium text-slate-800">{user.name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1 ${getRoleColorClass(user.role)}`}>
                                    {getRoleIcon(user.role)}
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600 text-sm">{user.email}</td>
                            <td className="px-6 py-4 text-slate-600 text-sm">{getUnitName(user.unitId)}</td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        onClick={() => handleOpenEdit(user)}
                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(user.id)}
                                        className={`p-1.5 text-slate-400 rounded transition-colors ${user.id === currentUser?.id ? 'opacity-30 cursor-not-allowed' : 'hover:text-red-600 hover:bg-red-50'}`}
                                        disabled={user.id === currentUser?.id}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">
                        {editingId ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input 
                            type="email" 
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input 
                            type="password" 
                            required={!editingId}
                            placeholder={editingId ? "Isi hanya jika ingin mengganti" : "Password akun"}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Peran (Role)</label>
                        <select 
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                        >
                            <option value="NURSE">Perawat Unit (Nurse)</option>
                            <option value="TECHNICIAN">Teknisi CSSD</option>
                            <option value="ADMIN">Admin CSSD</option>
                        </select>
                    </div>

                    {formData.role === 'NURSE' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Unit Bertugas</label>
                            <select 
                                required={formData.role === 'NURSE'}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                value={formData.unitId}
                                onChange={(e) => setFormData({...formData, unitId: e.target.value})}
                            >
                                <option value="">-- Pilih Unit --</option>
                                {state.units.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;