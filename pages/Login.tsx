import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, UserCircle, QrCode, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';

type ViewState = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';

const Login: React.FC = () => {
  const { login, register, resetPassword } = useApp();
  const navigate = useNavigate();

  const [view, setView] = useState<ViewState>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('NURSE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
        if (view === 'LOGIN') {
            const success = await login(email, password);
            if (success) {
                navigate('/');
            } else {
                setError('Email atau password salah.');
            }
        } else if (view === 'REGISTER') {
            if (!name || !email || !password) {
                setError('Mohon lengkapi semua data.');
                setLoading(false);
                return;
            }
            const success = await register(name, email, password, role);
            if (success) {
                navigate('/');
            } else {
                setError('Email sudah terdaftar.');
            }
        } else if (view === 'FORGOT_PASSWORD') {
            if (!email) {
                setError('Masukkan email Anda.');
                setLoading(false);
                return;
            }
            const exists = await resetPassword(email);
            if (exists) {
                setSuccessMsg('Link reset password telah dikirim ke email Anda (Simulasi).');
                setTimeout(() => setView('LOGIN'), 3000);
            } else {
                setError('Email tidak ditemukan dalam sistem.');
            }
        }
    } catch (err) {
        setError('Terjadi kesalahan sistem.');
    } finally {
        setLoading(false);
    }
  };

  const switchView = (newView: ViewState) => {
    setView(newView);
    setError(null);
    setSuccessMsg(null);
    // Keep email populated if switching between
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in duration-300">
        <div className="bg-emerald-600 p-8 text-center relative">
           <div className="inline-flex bg-white/20 p-4 rounded-full mb-4 shadow-lg backdrop-blur-sm">
              <QrCode className="text-white" size={40} />
           </div>
           <h1 className="text-2xl font-bold text-white mb-1">MediTrack CSSD</h1>
           <p className="text-emerald-100 text-sm">Sistem Pelacakan Instrumen Steril</p>
        </div>
        
        <div className="p-8">
           <div className="text-center mb-6">
             <h2 className="text-xl font-bold text-slate-800">
                {view === 'LOGIN' && 'Masuk Akun'}
                {view === 'REGISTER' && 'Daftar Akun Baru'}
                {view === 'FORGOT_PASSWORD' && 'Reset Password'}
             </h2>
             <p className="text-slate-500 text-sm mt-1">
                {view === 'LOGIN' && 'Silakan masuk untuk melanjutkan'}
                {view === 'REGISTER' && 'Lengkapi data diri Anda'}
                {view === 'FORGOT_PASSWORD' && 'Masukkan email untuk reset password'}
             </p>
           </div>

           {error && (
               <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                   <AlertCircle size={16} />
                   {error}
               </div>
           )}

           {successMsg && (
               <div className="mb-4 bg-green-50 border border-green-200 text-green-600 text-sm p-3 rounded-lg flex items-center gap-2">
                   <ShieldCheck size={16} />
                   {successMsg}
               </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-4">
              {view === 'REGISTER' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Nama Lengkap</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Nama Anda"
                        />
                    </div>
                  </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="email" 
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="nama@rumahsakit.com"
                    />
                </div>
              </div>

              {view !== 'FORGOT_PASSWORD' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="••••••••"
                        />
                    </div>
                  </div>
              )}

              {view === 'REGISTER' && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Peran</label>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => setRole('ADMIN')}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${role === 'ADMIN' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 hover:border-slate-300 text-slate-500'}`}
                        >
                            <ShieldCheck size={18} className="mb-1" />
                            <span className="text-[10px] font-bold">Admin</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('TECHNICIAN')}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${role === 'TECHNICIAN' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-100 hover:border-slate-300 text-slate-500'}`}
                        >
                            <Wrench size={18} className="mb-1" />
                            <span className="text-[10px] font-bold">Teknisi</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('NURSE')}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${role === 'NURSE' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-slate-300 text-slate-500'}`}
                        >
                            <UserCircle size={18} className="mb-1" />
                            <span className="text-[10px] font-bold">Perawat</span>
                        </button>
                    </div>
                  </div>
              )}

              {view === 'LOGIN' && (
                  <div className="flex justify-end">
                      <button 
                        type="button"
                        onClick={() => switchView('FORGOT_PASSWORD')}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                          Lupa Password?
                      </button>
                  </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                        {view === 'LOGIN' && 'Masuk Aplikasi'}
                        {view === 'REGISTER' && 'Buat Akun'}
                        {view === 'FORGOT_PASSWORD' && 'Kirim Link Reset'}
                        {!loading && <ArrowRight size={18} />}
                    </>
                )}
              </button>
           </form>

           <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                {view === 'LOGIN' ? (
                    <p className="text-sm text-slate-500">
                        Belum punya akun?{' '}
                        <button onClick={() => switchView('REGISTER')} className="text-emerald-600 font-bold hover:underline">
                            Daftar Sekarang
                        </button>
                    </p>
                ) : (
                    <p className="text-sm text-slate-500">
                        Sudah punya akun?{' '}
                        <button onClick={() => switchView('LOGIN')} className="text-emerald-600 font-bold hover:underline">
                            Login di sini
                        </button>
                    </p>
                )}
           </div>

           {/* Default Credentials Hint */}
           {view === 'LOGIN' && (
               <div className="mt-6 p-3 bg-slate-50 rounded text-xs text-slate-400 text-center border border-slate-100">
                   <p className="font-semibold mb-1">Akun Demo:</p>
                   <p>admin@meditrack.com / admin123</p>
                   <p>tech@meditrack.com / tech123</p>
                   <p>nurse@meditrack.com / nurse123</p>
               </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Login;