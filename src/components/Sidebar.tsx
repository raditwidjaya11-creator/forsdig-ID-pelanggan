/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Package, 
  DollarSign, 
  BarChart3, 
  QrCode, 
  Radio, 
  Bell, 
  ShieldCheck, 
  RefreshCw, 
  Map, 
  Laptop,
  CheckCircle2,
  XCircle,
  Menu,
  X,
  Contact
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  selectedCabang: string;
  setSelectedCabang: (cabang: string) => void;
  selectedPerusahaan: string;
  setSelectedPerusahaan: (perusahaan: string) => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  notificationCount: number;
  setShowNotifications: (show: boolean) => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  activeRole,
  setActiveRole,
  selectedCabang,
  setSelectedCabang,
  selectedPerusahaan,
  setSelectedPerusahaan,
  isOnline,
  setIsOnline,
  notificationCount,
  setShowNotifications
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const branches = ['Semua Cabang', 'Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta'];
  const companies = ['Semua Perusahaan', 'Sinergi Net', 'Nusantara Corp'];
  const roles: UserRole[] = ['Super Admin', 'Admin', 'Sales'];

  const triggerSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
    }, 1200);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'Admin', 'Sales'] },
    { id: 'customers', label: 'Pelanggan', icon: Users, roles: ['Super Admin', 'Admin', 'Sales'] },
    { id: 'pegawai', label: 'SDM & ID Card', icon: Contact, roles: ['Super Admin', 'Admin'] },
    { id: 'invoices', label: 'Tagihan & Invoice', icon: FileText, roles: ['Super Admin', 'Admin'] },
    { id: 'packages', label: 'Sistem Paket', icon: Package, roles: ['Super Admin', 'Admin'] },
    { id: 'sales', label: 'Sales & Komisi', icon: DollarSign, roles: ['Super Admin', 'Sales'] },
    { id: 'premium', label: 'Premium & GPS', icon: QrCode, roles: ['Super Admin', 'Admin', 'Sales'] },
    { id: 'reports', label: 'Laporan & Ekspor', icon: BarChart3, roles: ['Super Admin', 'Admin'] },
    { id: 'superadmin', label: 'Konsol Hak Akses', icon: ShieldCheck, roles: ['Super Admin'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(activeRole));

  return (
    <>
      {/* Mobile Top Bar */}
      <div id="mobile-header" className="md:hidden flex items-center justify-between bg-red-700 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-2">
          <div className="bg-white p-1 rounded">
            <Radio className="h-6 w-6 text-red-600 animate-pulse" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">Customer<span className="text-red-250 font-light">Pro</span></span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            id="notif-mobile-btn"
            onClick={() => setShowNotifications(true)} 
            className="relative p-2 rounded-full hover:bg-red-800 transition"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-red-700 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {notificationCount}
              </span>
            )}
          </button>
          
          <button 
            id="menu-toggle-btn"
            onClick={() => setMobileOpen(!mobileOpen)} 
            className="p-1 rounded hover:bg-red-800 transition"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Main Sidebar Wrapper */}
      <aside 
        id="sidebar-container"
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 md:translate-x-0 md:static md:h-screen
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-650/20">
                <Radio className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div>
                <span className="text-white font-bold text-xl tracking-tight block leading-none">CustomerPro</span>
                <span className="text-[9px] text-slate-400 font-mono tracking-widest mt-1 block">SUITE V2.6</span>
              </div>
            </div>
            {mobileOpen && (
              <button 
                id="close-mobile-menu"
                onClick={() => setMobileOpen(false)} 
                className="md:hidden text-slate-450 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Sync & Connectivity Widget */}
          <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-slate-400 uppercase font-bold tracking-wider font-mono">Sync & Connectivity</span>
              <button 
                id="sync-btn"
                onClick={triggerSync} 
                disabled={syncing} 
                className={`text-red-500 hover:text-red-400 transition ${syncing ? 'animate-spin' : ''}`}
                title="Sinkronisasi manual"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-amber-500" />
                )}
                <span className="text-[11px] font-semibold text-slate-250">
                  {isOnline ? 'Online & Sync' : 'Offline Mode'}
                </span>
              </div>
              <button
                id="offline-toggle"
                onClick={() => setIsOnline(!isOnline)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isOnline ? 'bg-red-600' : 'bg-slate-750 bg-slate-705'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isOnline ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {syncing && (
              <div className="mt-2 text-[10px] text-center text-red-400 font-mono animate-pulse">
                Sinkronisasi data dengan Firestore server...
              </div>
            )}
          </div>

          {/* Context Filter Switches */}
          <div className="px-6 py-4 space-y-3.5 border-b border-slate-800">
            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-450 tracking-wider font-mono mb-1">
                Cabang (Region)
              </label>
              <select
                id="branch-select"
                value={selectedCabang}
                onChange={(e) => setSelectedCabang(e.target.value)}
                className="w-full bg-slate-950 text-xs border border-slate-800 rounded-lg p-2 text-slate-300 focus:ring-1 focus:ring-red-500 focus:outline-none focus:border-red-500"
              >
                {branches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-slate-450 tracking-wider font-mono mb-1">
                Perusahaan / Tenant
              </label>
              <select
                id="company-select"
                value={selectedPerusahaan}
                onChange={(e) => setSelectedPerusahaan(e.target.value)}
                className="w-full bg-slate-950 text-xs border border-slate-800 rounded-lg p-2 text-slate-300 focus:ring-1 focus:ring-red-500 focus:outline-none focus:border-red-500"
              >
                {companies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  id={`nav-${item.id}`}
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition duration-200 group
                    ${isActive 
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-105 duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-red-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Role Selector Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="mb-3 px-2">
            <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-mono">HAK AKSES / AUTORITAS</span>
            <div className="grid grid-cols-3 gap-1 mt-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
              {roles.map((role) => (
                <button
                  id={`role-btn-${role.replace(' ', '')}`}
                  key={role}
                  onClick={() => {
                    setActiveRole(role);
                    triggerSync();
                  }}
                  className={`text-[9px] py-1 px-1 rounded font-bold text-center transition tracking-tighter truncate ${
                    activeRole === role 
                      ? 'bg-red-600 text-white' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title={`Ganti ke akses ${role}`}
                >
                  {role.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2 bg-slate-900 rounded-xl border border-slate-800">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
                alt="Profile photo" 
                className="h-10 w-10 rounded-full object-cover border-2 border-red-500"
              />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-slate-900" />
            </div>
            <div className="overflow-hidden">
              <span className="block text-xs font-bold text-white truncate">Radit's Admin</span>
              <span className="block text-[10px] text-red-500 truncate">{activeRole}</span>
            </div>
            <div className="ml-auto">
              <ShieldCheck className="h-5 w-5 text-slate-400 hover:text-red-500 transition" />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Backdrop */}
      {mobileOpen && (
        <div 
          id="menu-backdrop"
          onClick={() => setMobileOpen(false)} 
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
        />
      )}
    </>
  );
}
