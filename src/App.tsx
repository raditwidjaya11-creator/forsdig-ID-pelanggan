/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CustomerManagement from './components/CustomerManagement';
import InvoiceManagement from './components/InvoiceManagement';
import SalesManagement from './components/SalesManagement';
import SystemPackages from './components/SystemPackages';
import MarketingBlast from './components/MarketingBlast';
import Reports from './components/Reports';
import EmployeeManagement from './components/EmployeeManagement';

import { mockDB } from './db/mockDB';
import { Customer, Invoice, ServicePackage, SalesRepresentative, CommissionReceipt, AppNotification, UserRole, Employee, Attendance } from './types';
import { Bell, Wifi, WifiOff, RefreshCw, User, Smartphone } from 'lucide-react';

export default function App() {
  // Main Navigation state
  const [activeTab, setActiveTab] = useState<string>('Dashboard');

  // Context filtering states
  const [activeRole, setActiveRole] = useState<UserRole>('Super Admin');
  const [selectedCabang, setSelectedCabang] = useState<string>('Semua Cabang');
  const [selectedPerusahaan, setSelectedPerusahaan] = useState<string>('Semua Perusahaan');
  
  // App primary collections state synced with mockDB
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [sales, setSales] = useState<SalesRepresentative[]>([]);
  const [commissions, setCommissions] = useState<CommissionReceipt[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  
  // Real-time synchronization simulated states
  const [onlineMode, setOnlineMode] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState<boolean>(false);

  // Initialize data on application boot with Firestore support
  useEffect(() => {
    const initApp = async () => {
      // 1. Hook state inputs
      const isOnlineConfig = mockDB.getOnlineMode();
      setOnlineMode(isOnlineConfig);
      setActiveRole(mockDB.getActiveRole() as UserRole);
      setSelectedCabang(mockDB.getSelectedCabang());
      setSelectedPerusahaan(mockDB.getSelectedPerusahaan());

      // 2. Fetch live datasets if online
      if (isOnlineConfig) {
        setSyncing(true);
        await mockDB.pullFromFirestore();
        setSyncing(false);
      } else {
        // Run monthly billing generator in offline mode
        mockDB.generateMonthlyInvoices();
      }

      // 3. Populate state
      syncFromDatabase();
    };

    initApp();
  }, []);

  // Fetch / Sync core states from mockDB persistence
  const syncFromDatabase = () => {
    setCustomers(mockDB.getCustomers());
    setInvoices(mockDB.getInvoices());
    setPackages(mockDB.getPackages());
    setSales(mockDB.getSales());
    setCommissions(mockDB.getCommissions());
    setNotifications(mockDB.getNotifications());
    setEmployees(mockDB.getEmployees());
    setAttendances(mockDB.getAttendances());
  };

  // Trigger manual live cloud sync directly with Firestore
  const handleCloudSync = async () => {
    setSyncing(true);
    try {
      if (onlineMode) {
        await mockDB.pullFromFirestore();
      }
      mockDB.recalculateSalesMetrics();
      syncFromDatabase();
      triggerNotification(
        'Sinkronisasi Berhasil',
        onlineMode 
          ? 'Sinkronisasi real-time berhasil mengunduh pembaruan terbaru dari Firestore.' 
          : 'Database lokal berhasil disinkronkan dengan data server cloud utama.',
        'success'
      );
    } catch (e) {
      console.error(e);
      triggerNotification('Sinkronisasi Gagal', 'Gagal menyinkronkan data dengan Firebase Firestore.', 'danger');
    } finally {
      setSyncing(false);
    }
  };

  const triggerNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'danger') => {
    mockDB.addNotification(title, message, type);
    setNotifications(mockDB.getNotifications());
  };

  // State modification Handlers passing through DB to keep state persistence solid

  // 1. Customer actions
  const handleSaveCustomer = (cust: Customer) => {
    mockDB.saveCustomer(cust);
    syncFromDatabase();
  };

  const handleDeleteCustomer = (id: string) => {
    mockDB.deleteCustomer(id);
    syncFromDatabase();
    triggerNotification('Pelanggan Dihapus', 'Data instalasi pelanggan berhasil dihapus dari cloud database.', 'warning');
  };

  // 2. Invoice actions
  const handleSaveInvoice = (inv: Invoice) => {
    mockDB.saveInvoice(inv);
    syncFromDatabase();

    // If an invoice is paid (Lunas), let's automatically calculate and register a Commission Receipt!
    if (inv.status === 'Lunas') {
      const custObj = mockDB.getCustomers().find(c => c.id === inv.customerId);
      if (custObj && custObj.salesId) {
        const salesObj = mockDB.getSales().find(s => s.id === custObj.salesId);
        if (salesObj) {
          const repFee = Math.round((inv.amount * salesObj.commissionRate) / 100);
          const newComm: CommissionReceipt = {
            id: 'comm-' + Date.now(),
            salesId: salesObj.id,
            salesName: salesObj.name,
            customerId: custObj.id,
            customerName: custObj.name,
            invoiceId: inv.id,
            amount: repFee,
            percentage: salesObj.commissionRate,
            date: new Date().toISOString().split('T')[0],
            status: 'Pending'
          };
          mockDB.saveCommission(newComm);
          mockDB.recalculateSalesMetrics();
          syncFromDatabase();
          triggerNotification(
            'Komisi Terbentuk',
            `Komisi baru berhasil dicatatkan untuk ${salesObj.name} sebesar Rp ${repFee.toLocaleString('id-ID')}.`,
            'info'
          );
        }
      }
    }
  };

  const handleDeleteInvoice = (id: string) => {
    mockDB.deleteInvoice(id);
    syncFromDatabase();
  };

  // 3. Sales Actions
  const handleSaveSales = (rep: SalesRepresentative) => {
    mockDB.saveSales(rep);
    syncFromDatabase();
    triggerNotification('Sales Disimpan', `Profil representasi ${rep.name} berhasil diperbarui di server.`, 'success');
  };

  const handleDeleteSales = (id: string) => {
    mockDB.deleteSales(id);
    syncFromDatabase();
    triggerNotification('Sales Dihapus', 'Representasi sales berhasil dihapus dari penempatan wilayah.', 'danger');
  };

  // 4. Commission Actions
  const handlePayoutCommission = (commId: string) => {
    const comms = mockDB.getCommissions();
    const target = comms.find(c => c.id === commId);
    if (target) {
      target.status = 'Dibayarkan';
      mockDB.saveCommission(target);
      mockDB.recalculateSalesMetrics();
      syncFromDatabase();
      triggerNotification(
        'Komisi Cair',
        `Komisi ${target.salesName} sebesar Rp ${target.amount.toLocaleString('id-ID')} cair sukses!`,
        'success'
      );
    }
  };

  // 5. Upgrade/Edit Packages actions
  const handleSavePackage = (pkg: ServicePackage) => {
    mockDB.savePackage(pkg);
    syncFromDatabase();
    triggerNotification('Paket Disimpan', `Konfigurasi paket ${pkg.name} berhasil diperbarui.`, 'success');
  };

  const handleDeletePackage = (id: string) => {
    mockDB.deletePackage(id);
    syncFromDatabase();
  };

  // 6. Employee Actions
  const handleSaveEmployee = (emp: Employee) => {
    mockDB.saveEmployee(emp);
    syncFromDatabase();
  };

  const handleDeleteEmployee = (id: string) => {
    mockDB.deleteEmployee(id);
    syncFromDatabase();
  };

  // 7. Attendance Actions
  const handleSaveAttendance = (att: Attendance) => {
    mockDB.saveAttendance(att);
    syncFromDatabase();
  };

  const handleDeleteAttendance = (id: string) => {
    mockDB.deleteAttendance(id);
    syncFromDatabase();
  };

  // Context dropdown changing triggers
  const handleRoleChanged = (role: string) => {
    setActiveRole(role as UserRole);
    mockDB.setActiveRole(role);
  };

  const handleCabangChanged = (cabang: string) => {
    setSelectedCabang(cabang);
    mockDB.setSelectedCabang(cabang);
  };

  const handlePerusahaanChanged = (perusahaan: string) => {
    setSelectedPerusahaan(perusahaan);
    mockDB.setSelectedPerusahaan(perusahaan);
  };

  const toggleOnlineMode = async () => {
    const next = !onlineMode;
    setOnlineMode(next);
    mockDB.setOnlineMode(next);
    if (next) {
      setSyncing(true);
      await mockDB.pullFromFirestore();
      syncFromDatabase();
      setSyncing(false);
    }
    triggerNotification(
      next ? 'Model Cloud Online' : 'Model Lokal Offline',
      next ? 'Koneksi real-time cloud data sinkron telah diaktifkan.' : 'Mode hemat bandwidth luring aktif. Data dicadangkan ke localStorage kookies.',
      next ? 'success' : 'warning'
    );
  };

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex bg-gray-50 min-h-screen text-gray-850">
      
      {/* 1. SIDEBAR NAVIGATION CONTROLLERS */}
      <Sidebar 
        currentTab={activeTab.toLowerCase() === 'sistempaket' ? 'packages' : activeTab.toLowerCase() === 'tagihan' ? 'invoices' : activeTab.toLowerCase()} 
        setCurrentTab={(tabId) => {
          if (tabId === 'dashboard') setActiveTab('Dashboard');
          else if (tabId === 'customers') setActiveTab('Pelanggan');
          else if (tabId === 'pegawai') setActiveTab('Pegawai');
          else if (tabId === 'invoices') setActiveTab('Tagihan');
          else if (tabId === 'packages') setActiveTab('SistemPaket');
          else if (tabId === 'sales') setActiveTab('Sales');
          else if (tabId === 'premium') setActiveTab('Premium');
          else if (tabId === 'reports') setActiveTab('Laporan');
        }}
        activeRole={activeRole}
        setActiveRole={handleRoleChanged}
        selectedCabang={selectedCabang}
        setSelectedCabang={handleCabangChanged}
        selectedPerusahaan={selectedPerusahaan}
        setSelectedPerusahaan={handlePerusahaanChanged}
        isOnline={onlineMode}
        setIsOnline={toggleOnlineMode}
        notificationCount={unreadNotifCount}
        setShowNotifications={setShowNotifDropdown}
      />

      {/* 2. MAIN APPLICATION CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        
        {/* TOP STATUS HEADER & CORPORATE CONTEXT FILTERS */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 select-none shadow-sm shadow-slate-100">
          
          {/* Filtering Context inputs */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            
            {/* Cabang selector state */}
            <div className="flex flex-col text-[10px] font-bold text-slate-500">
              <span className="mb-1 uppercase tracking-wider font-mono text-slate-400">Kantor Wilayah Cabang</span>
              <select
                id="header-cabang-select"
                value={selectedCabang}
                onChange={(e) => handleCabangChanged(e.target.value)}
                className="bg-slate-50 text-slate-800 text-xs py-1.5 px-3 rounded-lg border border-slate-250 outline-none focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
              >
                <option value="Semua Cabang">Semua Regional Cabang</option>
                <option value="Jakarta">Jakarta Region</option>
                <option value="Bandung">Bandung Region</option>
                <option value="Surabaya">Surabaya Region</option>
                <option value="Yogyakarta">Yogyakarta Region</option>
              </select>
            </div>

            {/* Perusahaan selector state */}
            <div className="flex flex-col text-[10px] font-bold text-slate-500">
              <span className="mb-1 uppercase tracking-wider font-mono text-slate-400">Kepemilikan Perusahaan</span>
              <select
                id="header-perusahaan-select"
                value={selectedPerusahaan}
                onChange={(e) => handlePerusahaanChanged(e.target.value)}
                className="bg-slate-50 text-slate-800 text-xs py-1.5 px-3 rounded-lg border border-slate-250 outline-none focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
              >
                <option value="Semua Perusahaan">Semua Perusahaan</option>
                <option value="Sinergi Net">PT Sinergi Net Perkasa</option>
                <option value="Nusantara Corp">PT Nusantara Internet Corp</option>
              </select>
            </div>

            {/* Simulated Live Role Switcher */}
            <div className="flex flex-col text-[10px] font-bold text-slate-500">
              <span className="mb-1 uppercase tracking-wider font-mono text-slate-400">Masuk Mode Akses Role</span>
              <select
                id="header-role-select"
                value={activeRole}
                onChange={(e) => handleRoleChanged(e.target.value)}
                className="bg-red-50/70 text-red-700 text-xs py-1.5 px-3 rounded-lg border border-red-100 outline-none hover:bg-red-100/60 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-semibold"
              >
                <option value="Super Admin">💼 Super Admin</option>
                <option value="Admin">🛡️ Admin Cabang</option>
                <option value="Sales">📈 Agen Sales</option>
              </select>
            </div>

          </div>

          {/* Sync icons indicators, Online stats and Dynamic bell triggers */}
          <div className="flex items-center space-x-3.5 self-end sm:self-center">
            
            {/* Sync trigger button */}
            <button
              id="header-sync-btn"
              onClick={handleCloudSync}
              disabled={syncing}
              className={`p-2 rounded-xl text-slate-500 hover:text-red-700 hover:bg-slate-50 border border-slate-200/80 transition cursor-pointer relative ${syncing ? 'animate-spin text-red-500' : ''}`}
              title="Simulasikan Sinkronisasi Cloud"
            >
              <RefreshCw className="h-4.5 w-4.5" />
            </button>

            {/* Realtime Alert triggers */}
            <div className="relative">
              <button
                id="header-notif-btn"
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 rounded-xl text-gray-500 hover:text-red-700 hover:bg-gray-100 border transition cursor-pointer relative"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white font-mono font-bold text-[9px] h-4.5 w-4.5 flex items-center justify-center rounded-full border border-white animate-bounce">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Realtime alert notifications absolute popup window */}
              {showNotifDropdown && (
                <div id="notif-popup" className="absolute right-0 mt-3 bg-white max-w-sm w-80 text-xs rounded-2xl shadow-2xl border border-gray-150 py-3 z-50 text-gray-800 animate-fade-in space-y-2">
                  <div className="px-4 pb-2 border-b flex items-center justify-between">
                    <span className="font-extrabold text-sm">Pusat Notifikasi Aktif</span>
                    <button
                      id="notif-mark-read-all"
                      onClick={() => { mockDB.markAllNotificationsRead(); syncFromDatabase(); }}
                      className="text-[10px] text-red-600 hover:underline font-bold"
                    >
                      Tandai Dibaca Semua
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y font-normal">
                    {notifications.map((notif) => {
                      const isDanger = notif.type === 'danger';
                      const isWarning = notif.type === 'warning';
                      const isSuccess = notif.type === 'success';
                      return (
                        <div 
                          id={`notif-item-${notif.id}`}
                          key={notif.id} 
                          onClick={() => { mockDB.markNotificationRead(notif.id); syncFromDatabase(); }}
                          className={`p-3 text-[11px] leading-relaxed transition cursor-pointer flex space-x-2.5 hover:bg-gray-50
                            ${notif.isRead ? 'opacity-60' : 'bg-red-50/10 font-bold'}`}
                        >
                          <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0
                            ${isDanger ? 'bg-red-600' : isWarning ? 'bg-amber-500' : isSuccess ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                          />
                          <div>
                            <span className="block text-gray-900">{notif.title}</span>
                            <p className="text-gray-500 text-[10px] leading-tight mt-0.5">{notif.message}</p>
                          </div>
                        </div>
                      );
                    })}

                    {notifications.length === 0 && (
                      <div className="p-4 text-center text-gray-400 text-xs">
                        Tidak ada pemberitahuan baru hari ini.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Connected user widget bar */}
            <div className="flex items-center space-x-2.5 pl-3 border-l border-gray-100 text-xs">
              <div className="bg-red-650 bg-red-600 h-9 w-9 rounded-xl flex items-center justify-center text-white font-mono font-bold tracking-tight shadow-md shadow-red-900/10 shrink-0">
                RW
              </div>
              <div className="hidden md:block leading-none">
                <strong className="text-gray-950 font-extrabold">Radit Widjaya</strong>
                <span className="text-[10px] text-gray-500 block uppercase font-mono mt-0.5">{activeRole}</span>
              </div>
            </div>

          </div>

        </header>

        {/* 3. DOCK SUBTAB CONTEXT RENDERING ENGINES */}
        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {activeTab === 'Dashboard' && (
            <Dashboard 
              customers={customers} 
              invoices={invoices} 
              sales={sales} 
              packages={packages}
              activeRole={activeRole} 
              selectedCabang={selectedCabang} 
              selectedPerusahaan={selectedPerusahaan} 
              generateInvoices={() => {
                mockDB.generateMonthlyInvoices();
                syncFromDatabase();
              }}
            />
          )}

          {activeTab === 'Pelanggan' && (
            <CustomerManagement 
              customers={customers} 
              packages={packages} 
              sales={sales} 
              activeRole={activeRole} 
              selectedCabang={selectedCabang} 
              selectedPerusahaan={selectedPerusahaan} 
              onSave={handleSaveCustomer} 
              onDelete={handleDeleteCustomer} 
            />
          )}

          {activeTab === 'Pegawai' && (
            <EmployeeManagement 
              employees={employees} 
              attendances={attendances} 
              activeRole={activeRole} 
              selectedCabang={selectedCabang} 
              selectedPerusahaan={selectedPerusahaan} 
              onSaveEmployee={handleSaveEmployee} 
              onDeleteEmployee={handleDeleteEmployee} 
              onSaveAttendance={handleSaveAttendance} 
              onDeleteAttendance={handleDeleteAttendance} 
              isOnline={onlineMode} 
              onAddNotification={triggerNotification} 
            />
          )}

          {activeTab === 'Tagihan' && (
            <InvoiceManagement 
              invoices={invoices} 
              customers={customers} 
              activeRole={activeRole} 
              selectedCabang={selectedCabang} 
              selectedPerusahaan={selectedPerusahaan} 
              onSaveInvoice={handleSaveInvoice} 
              onDeleteInvoice={handleDeleteInvoice} 
              onAddNotification={triggerNotification}
            />
          )}

          {activeTab === 'Sales' && (
            <SalesManagement 
              sales={sales} 
              commissions={commissions} 
              customers={customers} 
              activeRole={activeRole} 
              selectedCabang={selectedCabang} 
              onSaveSales={handleSaveSales} 
              onDeleteSales={handleDeleteSales} 
              onPayoutCommission={handlePayoutCommission}
            />
          )}

          {activeTab === 'SistemPaket' && (
            <SystemPackages 
              packages={packages} 
              activeRole={activeRole} 
              onSavePackage={handleSavePackage} 
              onDeletePackage={handleDeletePackage} 
            />
          )}

          {activeTab === 'Premium' && (
            <MarketingBlast 
              customers={customers} 
              packages={packages} 
              activeRole={activeRole} 
              selectedCabang={selectedCabang} 
              selectedPerusahaan={selectedPerusahaan} 
            />
          )}

          {activeTab === 'Laporan' && (
            <Reports 
              customers={customers} 
              invoices={invoices} 
              sales={sales} 
              activeRole={activeRole} 
              selectedCabang={selectedCabang} 
              selectedPerusahaan={selectedPerusahaan} 
            />
          )}
        </main>

      </div>

    </div>
  );
}
