import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Mail, Save, User as UserIcon, AlertCircle, CheckCircle } from 'lucide-react';

const Profile: React.FC = () => {
  const { currentUser, manageUpdateUser } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (currentUser) {
        setName(currentUser.name);
        setEmail(currentUser.email);
        setPassword(currentUser.password || '');
        setConfirmPassword(currentUser.password || '');
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (password !== confirmPassword) {
        setMsg({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
        return;
    }

    if (!name || !email) {
        setMsg({ type: 'error', text: 'Nama dan Email wajib diisi.' });
        return;
    }

    if (currentUser) {
        await manageUpdateUser(currentUser.id, {
            name,
            email,
            password: password || currentUser.password
        });
        setMsg({ type: 'success', text: 'Profil berhasil diperbarui.' });
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
         <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold ${currentUser.role === 'ADMIN' ? 'bg-emerald-500' : currentUser.role === 'TECHNICIAN' ? 'bg-amber-500' : 'bg-blue-500'}`}>
            {name.charAt(0)}
         </div>
         <div>
            <h2 className="text-2xl font-bold text-slate-800">{name}</h2>
            <p className="text-slate-500">
                {currentUser.role === 'ADMIN' ? 'Administrator CSSD' : currentUser.role === 'TECHNICIAN' ? 'Teknisi CSSD' : 'Staf Unit'}
            </p>
         </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-800">Edit Profil</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {msg && (
                <div className={`p-4 rounded-lg flex items-center gap-2 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {msg.text}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="email" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                    <h4 className="text-sm font-semibold text-slate-800 mb-4">Ganti Password</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Password Baru</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Kosongkan jika tidak diganti"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Konfirmasi Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Ulangi password"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button 
                    type="submit" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2"
                >
                    <Save size={18} />
                    Simpan Perubahan
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;