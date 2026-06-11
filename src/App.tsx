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
import SuperAdminConsole from './components/SuperAdminConsole';

import { mockDB } from './db/mockDB';
import { Customer, Invoice, ServicePackage, SalesRepresentative, CommissionReceipt, AppNotification, UserRole, Employee, Attendance } from './types';
import { 
  Bell, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  User, 
  Smartphone, 
  Lock, 
  Unlock, 
  LogOut, 
  Check, 
  ChevronRight, 
  Monitor, 
  Laptop, 
  ShieldCheck, 
  CreditCard, 
  ArrowLeftCircle, 
  HelpCircle,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

export default function App() {
  // Authentication & Multi-user state structure
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true); // Logged in inside demo, but fully realistic logout/login portal supported
  const [users, setUsers] = useState([
    { id: 'usr-1', name: 'Radit Widjaya', email: 'superadmin@foresyndo.co.id', role: 'Super Admin' as UserRole, avatar: 'RW', joinDate: '2025-01-10', status: 'Aktif' as const },
    { id: 'usr-2', name: 'Andi Wijaya', email: 'andi.sales@foresyndo.co.id', role: 'Sales' as UserRole, avatar: 'AW', joinDate: '2025-03-24', status: 'Aktif' as const },
    { id: 'usr-3', name: 'Jakarta Admin', email: 'admin.jakarta@foresyndo.co.id', role: 'Admin' as UserRole, avatar: 'JA', joinDate: '2025-02-15', status: 'Aktif' as const }
  ]);
  const [currentUser, setCurrentUser] = useState(users[0]);
  const [mPinInput, setMPinInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Global Role Permissions set dynamically by Super Admin Console
  const [rolePermissions, setRolePermissions] = useState({
    'Super Admin': { canDeleteInvoice: true, canEditPackages: true, canMarketingBlast: true, canManageEmployees: true, canViewReports: true, canSimulateSync: true },
    'Admin': { canDeleteInvoice: true, canEditPackages: false, canMarketingBlast: true, canManageEmployees: true, canViewReports: true, canSimulateSync: true },
    'Sales': { canDeleteInvoice: false, canEditPackages: false, canMarketingBlast: false, canManageEmployees: false, canViewReports: false, canSimulateSync: false }
  });

  // Dual View Simulator Control: togglable physical smartphone view on desktop!
  const [isSimulatedMobile, setIsSimulatedMobile] = useState<boolean>(false);
  const [isRealMobile, setIsRealMobile] = useState<boolean>(false);
  const [showMobileBalance, setShowMobileBalance] = useState<boolean>(true);

  // Track responsive screen resize for automatic m-banking layout activation
  useEffect(() => {
    const handleResize = () => {
      setIsRealMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main Navigation state
  const [activeTab, setActiveTab] = useState<string>('Dashboard');

  // Context filtering states
  const [activeRole, setActiveRole] = useState<UserRole>('Super Admin');
  const [selectedCabang, setSelectedCabang] = useState<string>('Semua Cabang');
  const [selectedPerusahaan, setSelectedPerusahaan] = useState<string>('Semua Perusahaan');

  // Keep active role always synchronized with logged-in user profile role
  useEffect(() => {
    if (isLoggedIn) {
      setActiveRole(currentUser.role);
      mockDB.setActiveRole(currentUser.role);
    }
  }, [currentUser, isLoggedIn]);
  
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

  // Custom Handler: profile switching logs in or switches roles seamlessly
  const handleSelectUserProfile = (user: typeof users[0]) => {
    setCurrentUser(user);
    setMPinInput('112233'); // Auto-fill pin for instant bypass ease of use
    triggerNotification(
      'Profil Terpilih',
      `Menulis pin otomatis untuk akun ${user.name} (${user.role}). Klik Login untuk konfirmasi.`,
      'info'
    );
  };

  const handleManualLogin = () => {
    setIsLoggedIn(true);
    triggerNotification(
      'Login Berhasil',
      `Selamat datang kembali, harian aman ${currentUser.name}! Sesi didelegasikan sebagai ${currentUser.role}.`,
      'success'
    );
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setMPinInput('');
    triggerNotification('Sesi Berakhir', 'Anda telah sukses logout aman dari server PT. Foresyndo.', 'warning');
  };

  // State: mobile sub-tab views
  const [mobileView, setMobileView] = useState<'home' | 'customers' | 'invoices' | 'pegawai' | 'sales' | 'packages' | 'premium' | 'reports' | 'superadmin'>('home');

  // Trigger from mobile grid buttons
  const navigateMobile = (dest: typeof mobileView) => {
    setMobileView(dest);
    // Sync widescreen tab too just in case
    if (dest === 'home') setActiveTab('Dashboard');
    else if (dest === 'customers') setActiveTab('Pelanggan');
    else if (dest === 'invoices') setActiveTab('Tagihan');
    else if (dest === 'pegawai') setActiveTab('Pegawai');
    else if (dest === 'sales') setActiveTab('Sales');
    else if (dest === 'packages') setActiveTab('SistemPaket');
    else if (dest === 'premium') setActiveTab('Premium');
    else if (dest === 'reports') setActiveTab('Laporan');
    else if (dest === 'superadmin') setActiveTab('SuperAdmin');
  };

  // 1. VIEW ENGINE: NOT LOGGED IN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 select-none relative overflow-hidden font-sans">
        
        {/* Glow Ambient Circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-650 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />

        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative z-10 text-center space-y-6">
          
          {/* Logo Heading */}
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-gradient-to-tr from-red-600 to-red-800 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20 mb-3">
              <ShieldCheck className="h-8 w-8 text-white animate-pulse" />
            </div>
            <h1 className="text-white text-2xl font-black tracking-tight uppercase leading-none">PT. Foresyndo Global Indonesia</h1>
            <span className="text-[10px] text-red-500 font-mono tracking-widest mt-1.5 block uppercase">CustomerPro SaaS Secure Gateway</span>
          </div>

          <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/60 space-y-3">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-left">
              Pilih Akun Demo Instan (Sistem Multi-User):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {users.map((u) => {
                const isSelected = u.id === currentUser.id;
                return (
                  <button
                    id={`btn-login-preset-${u.id}`}
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectUserProfile(u)}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-between ${
                      isSelected 
                        ? 'bg-red-500/10 border-red-500 text-white' 
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs mb-1 text-white shadow">
                      {u.avatar}
                    </div>
                    <span className="text-[10px] font-extrabold truncate w-full block">{u.name.split(' ')[0]}</span>
                    <span className="text-[8px] opacity-70 block font-mono mt-0.5 uppercase tracking-tighter truncate w-full">{u.role}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Keypad pin controller */}
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              MASUKKAN KODE MPIN KEAMANAN (6 ANGKA)
            </label>
            
            {/* Visual Dots */}
            <div className="flex items-center justify-center space-x-3.5 py-2">
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const filled = mPinInput.length > index;
                return (
                  <span 
                    key={index} 
                    className={`h-3 w-3 rounded-full transition-all duration-200 border ${
                      filled 
                        ? 'bg-red-500 border-red-500 scale-125 shadow-md shadow-red-500/50' 
                        : 'bg-slate-950 border-slate-8 w-3 h-3 hover:border-slate-705'
                    }`} 
                  />
                );
              })}
            </div>

            {/* Custom pin keypad */}
            <div className="max-w-[190px] mx-auto grid grid-cols-3 gap-2 pt-1 select-none">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  id={`btn-keypad-${num}`}
                  key={num}
                  type="button"
                  onClick={() => mPinInput.length < 6 && setMPinInput(prev => prev + num)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs py-1.5 px-3 rounded-xl border border-slate-800 transition active:scale-90 font-mono font-bold cursor-pointer"
                >
                  {num}
                </button>
              ))}
              <button
                id="btn-keypad-clear"
                type="button"
                onClick={() => setMPinInput('')}
                className="bg-slate-900 hover:bg-slate-800 text-red-500 text-[10px] py-1.5 px-2 rounded-xl border border-slate-800 transition text-center font-bold uppercase cursor-pointer"
              >
                Hapus
              </button>
              <button
                id="btn-keypad-0"
                type="button"
                onClick={() => mPinInput.length < 6 && setMPinInput(prev => prev + '0')}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs py-1.5 px-3 rounded-xl border border-slate-800 transition font-mono font-bold cursor-pointer"
              >
                0
              </button>
              <button
                id="btn-keypad-biometric"
                type="button"
                onClick={() => {
                  setMPinInput('112233');
                  triggerNotification('Biometrics Valid', 'Sidik Jari / FaceID terdeteksi sah.', 'success');
                }}
                className="bg-slate-900 hover:bg-slate-800 text-emerald-500 text-xs py-1.5 px-3 rounded-xl border border-slate-850 transition flex items-center justify-center cursor-pointer"
                title="Bypass dengan FaceID / Sidik Jari"
              >
                <Smartphone className="h-4 w-4 shrink-0" />
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              id="btn-submit-secure-login"
              type="button"
              disabled={mPinInput.length < 6}
              onClick={handleManualLogin}
              className={`w-full font-extrabold text-xs py-3 rounded-xl transition-all shadow-md mt-1 cursor-pointer flex items-center justify-center space-x-1.5 leading-none
                ${mPinInput.length === 6 
                  ? 'bg-gradient-to-r from-red-650 to-red-750 bg-red-600 hover:from-red-500 hover:to-red-700 text-white' 
                  : 'bg-slate-850 text-slate-550 bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-850'}`}
            >
              <Lock className="h-4 w-4" />
              <span>MASUK SECURE PORTAL</span>
            </button>
          </div>

          <p className="text-[10.5px] text-slate-500 leading-snug font-normal text-left px-1 border-t border-slate-800 pt-3">
            Otoritas FGI dilindungi enkripsi TLS-256 tingkat perbankan. Silakan hubungi departemen HRD FGI jika Anda mengalami masalah pemulihan MPIN.
          </p>

        </div>
      </div>
    );
  }

  // 2. VIEW ENGINE: PHONE BANNER CAROUSELS & COMPONENT EMBED FOR MOBILE M-BANKING VIEW
  const totalJakartaPaid = invoices
    .filter(i => i.status === 'Lunas')
    .reduce((sum, current) => sum + current.amount, 0);

  const totalAllInvoicesAmount = invoices.reduce((sum, current) => sum + current.amount, 0);

  const renderMobileLayout = () => {
    return (
      <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden max-w-[420px] mx-auto border-x border-slate-900 shadow-2xl">
        
        {/* Dynamic Mobile Top Notification Bar */}
        <div className="bg-slate-950 px-5 pt-3 pb-1 flex justify-between items-center text-[10.5px] text-slate-400 font-mono select-none">
          <div className="font-black text-white text-[11.5px]">11:00</div>
          <div className="flex items-center space-x-1.5 shrink-0">
            <Wifi className="h-3 w-3 text-emerald-400 shrink-0" />
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded font-black border border-emerald-500/20">5G</span>
            <div className="h-3 w-5 border border-slate-500 rounded-sm relative p-0.5 flex items-center">
              <span className="h-full bg-slate-300 w-[90%] rounded-2xs" />
              <span className="h-1 bg-slate-500 w-0.5 absolute -right-1 rounded-r-xs" />
            </div>
          </div>
        </div>

        {/* Dynamic Inner Mobile App Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-20 pt-1.5 space-y-4">
          
          {/* Active view is Back home */}
          {mobileView === 'home' ? (
            <>
              {/* Header Profile / Sign out bar */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2.5">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-red-600 to-red-800 text-white font-mono font-bold flex items-center justify-center shadow-lg shadow-red-650/15">
                    {currentUser.avatar}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-widest leading-none">Selamat Datang</span>
                    <strong className="text-white text-xs font-black block mt-0.5 leading-none">{currentUser.name}</strong>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    id="btn-mobile-sync"
                    onClick={handleCloudSync}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin text-red-500' : ''}`} />
                  </button>
                  <button
                    id="btn-mobile-logout"
                    onClick={handleLogout}
                    className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:text-white transition cursor-pointer"
                    title="Logout Sesi"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* GORGEOUS PREMIUM CREDIT/DEBIT CARD */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-750 from-slate-900 via-red-950 to-slate-950 p-4 border border-slate-800 flex flex-col justify-between h-40 shadow-xl shadow-red-950/15">
                {/* Glow Overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/15 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex justify-between items-start z-10">
                  <div>
                    <span className="text-[9px] bg-red-600/20 text-red-400 px-2 py-0.5 rounded-full font-black border border-red-550/20 tracking-widest font-mono block uppercase max-w-max">
                      E-PASS CARD
                    </span>
                    <span className="block text-[8px] text-slate-450 uppercase font-mono tracking-wider mt-1.5">RADIT'S NETWORK CORPORATE</span>
                  </div>
                  <CreditCard className="h-6 w-6 text-red-400/80" />
                </div>

                <div className="z-10 mt-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-mono">
                    <span>Omset Regional (Semua Cabang)</span>
                    <button
                      id="btn-toggle-balance"
                      onClick={() => setShowMobileBalance(!showMobileBalance)}
                      className="text-slate-500 hover:text-white transition p-0.5"
                    >
                      {showMobileBalance ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <strong className="text-white text-base font-black font-mono tracking-tight leading-6 block">
                    {showMobileBalance ? `Rp ${totalJakartaPaid.toLocaleString('id-ID')},-` : 'Rp * * * * * * * *'}
                  </strong>
                </div>

                <div className="flex justify-between items-end border-t border-slate-800/60 pt-2 text-[8px] z-10 text-slate-400">
                  <div>
                    <span className="block uppercase text-slate-500 font-mono tracking-tighter">PERUSAHAAN INTERNET</span>
                    <span className="font-extrabold text-white">PT. FORESYNDO GLOBAL</span>
                  </div>
                  <div className="text-right">
                    <span className="block uppercase text-slate-500 font-mono tracking-tighter">ROLE AKSES</span>
                    <span className="font-extrabold text-red-400">{currentUser.role}</span>
                  </div>
                </div>
              </div>

              {/* GRID MENU - BENTO CIRCULES */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black tracking-widest text-slate-500 uppercase font-mono px-0.5">LAYANAN UTAMA M-BANKING</h4>
                
                <div className="grid grid-cols-4 gap-2.5">
                  <button
                    id="m-btn-customers"
                    onClick={() => navigateMobile('customers')}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <div className="h-11 w-11 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-600 transition flex items-center justify-center text-red-550 text-red-500 shadow-md">
                      <User className="h-5 w-5" />
                    </div>
                    <span className="text-[9.5px] font-bold text-slate-300 mt-1.5 text-center leading-tight">Pelanggan</span>
                  </button>

                  <button
                    id="m-btn-invoices"
                    onClick={() => navigateMobile('invoices')}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <div className="h-11 w-11 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-600 transition flex items-center justify-center text-red-550 text-red-500 shadow-md">
                      <Bell className="h-5 w-5 font-bold" />
                    </div>
                    <span className="text-[9.5px] font-bold text-slate-300 mt-1.5 text-center leading-tight">Tagihan</span>
                  </button>

                  <button
                    id="m-btn-pegawai"
                    onClick={() => {
                      if (rolePermissions[currentUser.role].canManageEmployees) {
                        navigateMobile('pegawai');
                      } else {
                        triggerNotification('Akses Ditolak', 'Peran Anda tidak diizinkan mengakses menu ini.', 'danger');
                      }
                    }}
                    className={`flex flex-col items-center cursor-pointer group ${!rolePermissions[currentUser.role].canManageEmployees ? 'opacity-40' : ''}`}
                  >
                    <div className="h-11 w-11 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-600 transition flex items-center justify-center text-red-550 text-red-500 shadow-md">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <span className="text-[9.5px] font-bold text-slate-300 mt-1.5 text-center leading-tight">ID Pegawai</span>
                  </button>

                  <button
                    id="m-btn-sales"
                    onClick={() => navigateMobile('sales')}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <div className="h-11 w-11 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-600 transition flex items-center justify-center text-red-550 text-red-500 shadow-md">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <span className="text-[9.5px] font-bold text-slate-300 mt-1.5 text-center leading-tight">Sales & Komisi</span>
                  </button>

                  <button
                    id="m-btn-packages"
                    onClick={() => {
                      if (rolePermissions[currentUser.role].canEditPackages || currentUser.role === 'Super Admin') {
                        navigateMobile('packages');
                      } else {
                        triggerNotification('Akses Terbatas', 'Peran Anda terbatas untuk mengedit Paket Layanan.', 'danger');
                      }
                    }}
                    className={`flex flex-col items-center cursor-pointer group ${!(rolePermissions[currentUser.role].canEditPackages || currentUser.role === 'Super Admin') ? 'opacity-40' : ''}`}
                  >
                    <div className="h-11 w-11 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-600 transition flex items-center justify-center text-red-550 text-red-500 shadow-md">
                      <HelpCircle className="h-5 w-5" />
                    </div>
                    <span className="text-[9.5px] font-bold text-slate-300 mt-1.5 text-center leading-tight">Sistem Paket</span>
                  </button>

                  <button
                    id="m-btn-premium"
                    onClick={() => navigateMobile('premium')}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <div className="h-11 w-11 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-600 transition flex items-center justify-center text-red-550 text-red-500 shadow-md">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <span className="text-[9.5px] font-bold text-slate-300 mt-1.5 text-center leading-tight">E-Broadcast</span>
                  </button>

                  <button
                    id="m-btn-reports"
                    onClick={() => {
                      if (rolePermissions[currentUser.role].canViewReports) {
                        navigateMobile('reports');
                      } else {
                        triggerNotification('Akses Terbatas', 'Peran Anda membutuhkan otorisasi Laporan Finansial.', 'danger');
                      }
                    }}
                    className={`flex flex-col items-center cursor-pointer group ${!rolePermissions[currentUser.role].canViewReports ? 'opacity-40' : ''}`}
                  >
                    <div className="h-11 w-11 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-600 transition flex items-center justify-center text-red-550 text-red-500 shadow-md">
                      <Monitor className="h-5 w-5" />
                    </div>
                    <span className="text-[9.5px] font-bold text-slate-300 mt-1.5 text-center leading-tight">E-Laporan</span>
                  </button>

                  {/* SUPER ADMIN CONSOLE LINK GRID */}
                  <button
                    id="m-btn-superadmin"
                    onClick={() => {
                      if (currentUser.role === 'Super Admin') {
                        navigateMobile('superadmin');
                      } else {
                        triggerNotification('Padlock Active', 'Konsol Hak Akses khusus untuk peran Super Admin.', 'danger');
                      }
                    }}
                    className={`flex flex-col items-center cursor-pointer group ${currentUser.role !== 'Super Admin' ? 'opacity-40' : ''}`}
                  >
                    <div className="h-11 w-11 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-600 transition flex items-center justify-center text-red-550 text-red-500 shadow-md">
                      <ShieldCheck className="h-5 w-5 text-amber-500 animate-pulse" />
                    </div>
                    <span className="text-[9.5px] font-bold text-amber-500 mt-1.5 text-center leading-tight">Hak Akses</span>
                  </button>
                </div>
              </div>

              {/* RECENT REVENUE ACTIVITY CARDS */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center px-0.5">
                  <h4 className="text-[10px] font-black tracking-widest text-slate-500 uppercase font-mono">Daftar Transaksi Tagihan</h4>
                  <button onClick={() => navigateMobile('invoices')} className="text-[9.5px] text-red-400 hover:underline">Semua</button>
                </div>

                <div className="space-y-1.5">
                  {invoices.slice(0, 3).map((inv) => (
                    <div key={inv.id} className="bg-slate-900 p-2.5 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2.5">
                        <div className="bg-emerald-500/10 text-emerald-400 h-7.5 w-7.5 rounded text-[10px] font-bold font-mono flex items-center justify-center shrink-0">
                          INV
                        </div>
                        <div>
                          <span className="font-extrabold text-white block leading-tight">{inv.customerName}</span>
                          <span className="text-[9px] text-slate-500 block font-mono uppercase mt-0.5">{inv.packageName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <strong className="text-emerald-400 text-xs font-mono font-bold block">+Rp {inv.amount.toLocaleString('id-ID')}</strong>
                        <span className="text-[7.5px] uppercase font-bold text-slate-500 block font-mono mt-0.5">{inv.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BANNER PROMOS CAROUSELS */}
              <div className="pt-2">
                <h4 className="text-[10px] font-black tracking-widest text-slate-500 uppercase font-mono mb-2 px-0.5">INFORMASI & PROMO AGENT</h4>
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-[11px] leading-relaxed relative overflow-hidden">
                  <div className="absolute right-[-10px] bottom-[-10px] w-24 h-24 bg-red-650/10 rounded-full blur-xl pointer-events-none" />
                  <span className="font-extrabold text-red-500 block mb-0.5">💰 Bonus Komisi 15% Untuk Cabang Penjualan Jakarta</span>
                  <p className="text-slate-450 text-[10px] font-normal">
                    Realisasikan di atas 10 pemasangan Standard Family bulan Juni ini dan klaim bonus kuartal dari admin super Foresyndo!
                  </p>
                </div>
              </div>
            </>
          ) : (
            // EMBED SUB-MODULE DIRECTLY IN SMARTPHONE WITH BACK BUTTON!
            <div className="space-y-4 pt-1 animate-fade-in select-text">
              <button
                id="btn-mobile-view-back"
                onClick={() => setMobileView('home')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center space-x-1.5 transition cursor-pointer sticky top-0 z-30"
              >
                <ArrowLeftCircle className="h-4.5 w-4.5 text-red-500" />
                <span>KEMBALI KE BERANDA</span>
              </button>

              <div className="text-slate-900 text-xs text-left bg-white rounded-3xl p-4 shadow-xl border border-slate-200">
                {mobileView === 'customers' && (
                  <CustomerManagement 
                    customers={customers} 
                    packages={packages} 
                    sales={sales} 
                    activeRole={currentUser.role} 
                    selectedCabang={selectedCabang} 
                    selectedPerusahaan={selectedPerusahaan} 
                    onSave={handleSaveCustomer} 
                    onDelete={handleDeleteCustomer} 
                  />
                )}

                {mobileView === 'invoices' && (
                  <InvoiceManagement 
                    invoices={invoices} 
                    customers={customers} 
                    activeRole={currentUser.role} 
                    selectedCabang={selectedCabang} 
                    selectedPerusahaan={selectedPerusahaan} 
                    onSaveInvoice={handleSaveInvoice} 
                    onDeleteInvoice={handleDeleteInvoice} 
                    onAddNotification={triggerNotification}
                  />
                )}

                {mobileView === 'pegawai' && (
                  <EmployeeManagement 
                    employees={employees} 
                    attendances={attendances} 
                    activeRole={currentUser.role} 
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

                {mobileView === 'sales' && (
                  <SalesManagement 
                    sales={sales} 
                    commissions={commissions} 
                    customers={customers} 
                    activeRole={currentUser.role} 
                    selectedCabang={selectedCabang} 
                    onSaveSales={handleSaveSales} 
                    onDeleteSales={handleDeleteSales} 
                    onPayoutCommission={handlePayoutCommission}
                  />
                )}

                {mobileView === 'packages' && (
                  <SystemPackages 
                    packages={packages} 
                    activeRole={currentUser.role} 
                    onSavePackage={handleSavePackage} 
                    onDeletePackage={handleDeletePackage} 
                  />
                )}

                {mobileView === 'premium' && (
                  <MarketingBlast 
                    customers={customers} 
                    packages={packages} 
                    activeRole={currentUser.role} 
                    selectedCabang={selectedCabang} 
                    selectedPerusahaan={selectedPerusahaan} 
                  />
                )}

                {mobileView === 'reports' && (
                  <Reports 
                    customers={customers} 
                    invoices={invoices} 
                    sales={sales} 
                    activeRole={currentUser.role} 
                    selectedCabang={selectedCabang} 
                    selectedPerusahaan={selectedPerusahaan} 
                  />
                )}

                {mobileView === 'superadmin' && (
                  <SuperAdminConsole 
                    users={users} 
                    setUsers={setUsers} 
                    rolePermissions={rolePermissions} 
                    setRolePermissions={setRolePermissions} 
                    onAddNotification={triggerNotification}
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                  />
                )}
              </div>
            </div>
          )}

        </div>

        {/* Sticky Banking Bottom Ribbons */}
        <div className="bg-slate-900 border-t border-slate-800 py-2.5 px-6 flex justify-between absolute bottom-0 left-0 right-0 z-40 text-[9px] text-slate-450 font-bold">
          <button
            id="bar-btn-mobile-home"
            onClick={() => navigateMobile('home')}
            className={`flex flex-col items-center transition cursor-pointer ${mobileView === 'home' ? 'text-red-500' : 'text-slate-400 hover:text-white'}`}
          >
            <User className="h-4.5 w-4.5 font-bold" />
            <span className="mt-1">Beranda</span>
          </button>

          <button
            id="bar-btn-mobile-inv"
            onClick={() => navigateMobile('invoices')}
            className={`flex flex-col items-center transition cursor-pointer ${mobileView === 'invoices' ? 'text-red-500' : 'text-slate-400 hover:text-white'}`}
          >
            <Bell className="h-4.5 w-4.5 font-bold" />
            <span className="mt-1">Tagihan</span>
          </button>

          <button
            id="bar-btn-mobile-sec"
            onClick={() => {
              if (currentUser.role === 'Super Admin') {
                navigateMobile('superadmin');
              } else {
                triggerNotification('Akses Terbatas', 'Konsol Hak Akses khusus untuk peran Super Admin.', 'danger');
              }
            }}
            className={`flex flex-col items-center transition cursor-pointer ${mobileView === 'superadmin' ? 'text-red-500' : 'text-slate-400 hover:text-white'} ${currentUser.role !== 'Super Admin' ? 'opacity-30' : ''}`}
          >
            <ShieldCheck className="h-4.5 w-4.5" />
            <span className="mt-1">Konsol Hak Peran</span>
          </button>

          <button
            id="bar-btn-mobile-out"
            onClick={handleLogout}
            className="flex flex-col items-center text-slate-400 hover:text-white cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5 text-red-550 text-red-500" />
            <span className="mt-1">Sign Out</span>
          </button>
        </div>

      </div>
    );
  };

  // 3. MAIN DUAL VIEW RENDER CONTROLLER
  const isMobileViewOn = isRealMobile || isSimulatedMobile;

  return (
    <div className="bg-gray-50 min-h-screen text-gray-850 select-none">
      
      {isMobileViewOn ? (
        // MOBILE RENDER MECHANICS: Native phone or Simulator wrap
        isSimulatedMobile ? (
          // DESKTOP RUNNING PHONE MOCKUP (iPhone 16 Pro Style)
          <div className="flex flex-col min-h-screen bg-slate-900 justify-center items-center py-8 px-4 font-sans border-t-4 border-red-650">
            
            {/* Simulation Header switch control */}
            <div className="max-w-md w-full mb-6 text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 text-red-500 font-extrabold text-xs">
                <Smartphone className="h-4.5 w-4.5 animate-bounce" />
                <span className="uppercase tracking-widest font-mono">FORESYNDO MOBILE BANKING SIMULATOR</span>
              </div>
              <h3 className="text-white text-lg font-black uppercase">Pratinjau Mobile Terintegrasi</h3>
              <p className="text-slate-400 text-xs">Aplikasi di dalam simulator adalah replika interaktif mobile banking milik PT Foresyndo.</p>
              
              <div className="pt-2 flex justify-center gap-3">
                <button
                  id="btn-simulator-back-desktop"
                  onClick={() => setIsSimulatedMobile(false)}
                  className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-1.5 px-4 rounded-xl cursor-pointer shadow flex items-center gap-1 leading-none"
                >
                  <Monitor className="h-3.5 w-3.5 text-white" />
                  <span>Kembali ke Widescreen Desktop</span>
                </button>
              </div>
            </div>

            {/* Simulated Smartphone Physical Mockup Chassis Container */}
            <div className="relative mx-auto border-[11px] border-slate-950 bg-slate-950 rounded-[48px] shadow-2xl h-[780px] w-[370px] flex flex-col overflow-hidden ring-4 ring-slate-800">
              
              {/* Top Speaker Notch / Dynamic Island bar */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-6 bg-slate-950 rounded-full z-50 flex items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-slate-900 mr-2 border border-slate-800" />
                <span className="h-1 w-8 rounded-full bg-slate-900 border" />
              </div>

              {/* Physical side key bumps simulated overlay */}
              <div className="absolute top-28 left-[-11px] w-1 h-12 bg-slate-800 rounded-r-xs" />
              <div className="absolute top-44 left-[-11px] w-1 h-16 bg-slate-800 rounded-r-xs" />
              <div className="absolute top-64 left-[-11px] w-1 h-16 bg-slate-800 rounded-r-xs" />
              <div className="absolute top-40 right-[-11px] w-1 h-20 bg-slate-800 rounded-l-xs" />

              {/* Render Native Mobile Inside */}
              <div className="flex-1 w-full bg-slate-950 rounded-[38px] overflow-hidden relative">
                {renderMobileLayout()}
              </div>

              {/* Bottom White Bar Gesture Indicator */}
              <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-700 rounded-full z-50 pointer-events-none" />

            </div>
          </div>
        ) : (
          // NATIVE MOBILE: FULL WIDTH ON CELL PHONES (No phone mockup frame wrapper)
          <div className="min-h-screen bg-slate-950">
            {renderMobileLayout()}
          </div>
        )
      ) : (
        // WIDESCREEN DESKTOP VIEW
        <div className="flex bg-gray-50 min-h-screen">
          
          {/* 1. SIDEBAR NAVIGATION CONTROLLERS */}
          <Sidebar 
            currentTab={activeTab.toLowerCase() === 'sistempaket' ? 'packages' : activeTab.toLowerCase() === 'tagihan' ? 'invoices' : activeTab.toLowerCase() === 'superadmin' ? 'superadmin' : activeTab.toLowerCase()} 
            setCurrentTab={(tabId) => {
              if (tabId === 'dashboard') setActiveTab('Dashboard');
              else if (tabId === 'customers') setActiveTab('Pelanggan');
              else if (tabId === 'pegawai') setActiveTab('Pegawai');
              else if (tabId === 'invoices') setActiveTab('Tagihan');
              else if (tabId === 'packages') setActiveTab('SistemPaket');
              else if (tabId === 'sales') setActiveTab('Sales');
              else if (tabId === 'premium') setActiveTab('Premium');
              else if (tabId === 'reports') setActiveTab('Laporan');
              else if (tabId === 'superadmin') setActiveTab('SuperAdmin');
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
                
                {/* PROMINENT DOCK TOGGLER: iPhone Sandbox Simulator */}
                <button
                  id="btn-simulator-toggle-desktop"
                  onClick={() => setIsSimulatedMobile(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2 px-3.5 rounded-xl border border-slate-700 transition cursor-pointer flex items-center space-x-1.5 shadow"
                  title="Simulasikan sebagai aplikasi mobile banking modern"
                >
                  <Smartphone className="h-4 w-4 text-red-500 animate-pulse" />
                  <span className="hidden lg:inline">Simulasi M-Banking</span>
                </button>

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
                <div className="flex items-center space-x-2.5 pl-3 border-l border-gray-105 text-xs">
                  <div className="bg-red-600 h-9 w-9 rounded-xl flex items-center justify-center text-white font-mono font-bold tracking-tight shadow-md shadow-red-900/10 shrink-0">
                    {currentUser.avatar}
                  </div>
                  <div className="hidden md:block leading-none">
                    <strong className="text-gray-950 font-extrabold">{currentUser.name}</strong>
                    <span className="text-[10px] text-gray-500 block uppercase font-mono mt-0.5">{activeRole}</span>
                  </div>
                  <button
                    id="btn-desktop-logout"
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg border hover:bg-red-50 hover:text-red-600 text-slate-400 transition cursor-pointer"
                    title="Sign Out Sesi"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
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

              {activeTab === 'SuperAdmin' && (
                <SuperAdminConsole 
                  users={users} 
                  setUsers={setUsers} 
                  rolePermissions={rolePermissions} 
                  setRolePermissions={setRolePermissions} 
                  onAddNotification={triggerNotification}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                />
              )}
            </main>

          </div>

        </div>
      )}

    </div>
  );
}
