
import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Truck, Recycle, QrCode, Menu, X, Box, Building2, LogOut, Users, User, Activity, History } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
    name: string;
    path: string;
    icon: React.ReactNode;
    roles: UserRole[];
    badgeCount?: number;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout, getMaintenanceAlerts } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const maintenanceAlerts = getMaintenanceAlerts();
  const alertCount = maintenanceAlerts.length;

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'NURSE', 'TECHNICIAN'] },
    { name: 'Unit & Lokasi', path: '/units', icon: <Building2 size={20} />, roles: ['ADMIN'] },
    { 
      name: 'Inventaris', 
      path: '/inventory', 
      icon: <Box size={20} />, 
      roles: ['ADMIN', 'TECHNICIAN'],
      badgeCount: alertCount > 0 ? alertCount : undefined 
    },
    { name: 'Distribusi Steril', path: '/distribute', icon: <Truck size={20} />, roles: ['ADMIN', 'TECHNICIAN'] },
    { name: 'Ambil Kotor', path: '/collect', icon: <Recycle size={20} />, roles: ['ADMIN', 'TECHNICIAN'] },
    { name: 'Riwayat Transaksi', path: '/history', icon: <History size={20} />, roles: ['ADMIN', 'TECHNICIAN'] },
    { name: 'Validasi Scan', path: '/scan', icon: <QrCode size={20} />, roles: ['ADMIN', 'NURSE'] },
    { name: 'Kelola Pengguna', path: '/users', icon: <Users size={20} />, roles: ['ADMIN'] },
    { name: 'Profil Saya', path: '/profile', icon: <User size={20} />, roles: ['ADMIN', 'NURSE', 'TECHNICIAN'] },
  ];

  const getPageTitle = () => {
    const current = navItems.find(item => item.path === location.pathname);
    return current ? current.name : 'MediTrack CSSD';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter items based on user role
  const filteredNavItems = navItems.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  const getRoleLabel = (role?: UserRole) => {
    switch (role) {
        case 'ADMIN': return 'Administrator';
        case 'TECHNICIAN': return 'Teknisi CSSD';
        case 'NURSE': return 'Unit Staff';
        default: return '';
    }
  };

  const getRoleColor = (role?: UserRole) => {
    switch (role) {
        case 'ADMIN': return 'bg-emerald-500';
        case 'TECHNICIAN': return 'bg-amber-500';
        case 'NURSE': return 'bg-blue-500';
        default: return 'bg-slate-500';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative z-30 w-64 h-full bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="bg-emerald-600 text-white p-1 rounded">
              <Activity size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight">MediTrack CSSD</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-lg transition-colors font-medium ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.name}</span>
              </div>
              {item.badgeCount && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {item.badgeCount > 9 ? '9+' : item.badgeCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Info Footer in Sidebar */}
        <div className="p-4 border-t border-slate-100">
             <div className="flex items-center gap-3 mb-3 px-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${getRoleColor(currentUser?.role)}`}>
                  {currentUser?.name.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-slate-700 truncate">{currentUser?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{getRoleLabel(currentUser?.role)}</p>
                </div>
             </div>
             <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
             >
                <LogOut size={18} />
                <span>Keluar</span>
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-600 md:hidden hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-slate-800">{getPageTitle()}</h1>
          </div>
          <div className="flex items-center gap-4">
             <span className={`text-xs px-2 py-1 rounded-full font-bold bg-slate-100 text-slate-700`}>
                {currentUser?.role}
             </span>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
