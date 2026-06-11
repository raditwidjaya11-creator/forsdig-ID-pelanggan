/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { 
  Contact, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Printer, 
  QrCode, 
  CheckCircle, 
  Play, 
  Users, 
  FileText, 
  ShieldCheck, 
  MapPin, 
  Camera, 
  Smartphone, 
  Clock, 
  ArrowRight,
  Download,
  AlertTriangle,
  Mail,
  Phone,
  User,
  Activity,
  X,
  CreditCard,
  Grid,
  Sparkles,
  RefreshCw,
  Eye,
  Check,
  Building,
  Calendar
} from 'lucide-react';
import { Employee, Attendance, EmployeePosition } from '../types';

interface EmployeeManagementProps {
  employees: Employee[];
  attendances: Attendance[];
  activeRole: string;
  selectedCabang: string;
  selectedPerusahaan: string;
  onSaveEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onSaveAttendance: (att: Attendance) => void;
  onDeleteAttendance: (id: string) => void;
  isOnline: boolean;
  onAddNotification: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'danger') => void;
}

const AVAILABLE_BRANCHES = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Majalengka'];

const JABATAN_LIST: EmployeePosition[] = [
  'Direktur',
  'General Manager',
  'Manager',
  'Supervisor',
  'Sales Manager',
  'Sales Executive',
  'Admin',
  'Operator',
  'Staff',
  'Teknisi',
  'Security'
];

export default function EmployeeManagement({
  employees,
  attendances,
  activeRole,
  selectedCabang,
  selectedPerusahaan,
  onSaveEmployee,
  onDeleteEmployee,
  onSaveAttendance,
  onDeleteAttendance,
  isOnline,
  onAddNotification
}: EmployeeManagementProps) {
  // Navigation tabs within Module
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'pegawai' | 'idcard' | 'absensi'>('dashboard');

  // Filters & Searches
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJabatan, setFilterJabatan] = useState('Semua');
  const [filterBranch, setFilterBranch] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Modal Control States
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [bulkPrintIds, setBulkPrintIds] = useState<string[]>([]);
  const [singlePrintEmp, setSinglePrintEmp] = useState<Employee | null>(null);
  const [printLayout, setPrintLayout] = useState<'pvc' | 'a4'>('pvc');

  // ID Card Digital Modal Control States
  const [showDigitalIdModal, setShowDigitalIdModal] = useState(false);
  const [digitalIdEmployee, setDigitalIdEmployee] = useState<Employee | null>(null);
  const [digitalCardFlipped, setDigitalCardFlipped] = useState(false);
  const [digitalCardTemplate, setDigitalCardTemplate] = useState<'standard' | 'sales' | 'manager'>('standard');
  const [qrSecurityToken, setQrSecurityToken] = useState('');

  // Real-time dynamic security token update for the dynamic QR Code
  React.useEffect(() => {
    if (showDigitalIdModal && digitalIdEmployee) {
      const updateToken = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const date = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        // Dynamic dynamic qr code data indicating validation and secure timestamp
        const timeStr = `${year}-${month}-${date}_${hours}:${minutes}:${seconds}`;
        const token = `FGI_SECURE_AUTH|NIP:${digitalIdEmployee.employeeId}|VERIFIER:${digitalIdEmployee.name.replaceAll(' ', '_')}|TIME:${timeStr}|STATUS:ACTIVE`;
        setQrSecurityToken(token);
      };
      
      updateToken();
      const interval = setInterval(updateToken, 3000); // refresh every 3 seconds for active security simulation!
      return () => clearInterval(interval);
    }
  }, [showDigitalIdModal, digitalIdEmployee]);

  // ID Card Template Selector
  const [cardTemplate, setCardTemplate] = useState<'standard' | 'sales' | 'manager'>('standard');

  // Absensi simulation states
  const [selectedAbsenEmpId, setSelectedAbsenEmpId] = useState('');
  const [selfieOption, setSelfieOption] = useState('preset-1');
  const [gpsLocationStr, setGpsLocationStr] = useState('PT. Foresyndo Global Indonesia, Majalengka HQ');
  const [gpsLat, setGpsLat] = useState('-6.8373');
  const [gpsLng, setGpsLng] = useState('108.2241');
  const [absenType, setAbsenType] = useState<'in' | 'out'>('in');
  const [customSelfieBase64, setCustomSelfieBase64] = useState<string | null>(null);

  // File Upload Ref inside employee CRUD
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [employeePhotoBase64, setEmployeePhotoBase64] = useState<string | null>(null);

  // Local state form for Employee CRUD
  const [formId, setFormId] = useState('');
  const [formNip, setFormNip] = useState('');
  const [formName, setFormName] = useState('');
  const [formPosition, setFormPosition] = useState<EmployeePosition>('Staff');
  const [formDept, setFormDept] = useState('Operational');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [formBranch, setFormBranch] = useState('Majalengka');
  const [formAddress, setFormAddress] = useState('');
  const [formJoinDate, setFormJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [formSupervisor, setFormSupervisor] = useState('');
  const [formTargetSales, setFormTargetSales] = useState<number>(10000000);
  const [formEmergency, setFormEmergency] = useState('');
  const [formMasaBerlaku, setFormMasaBerlaku] = useState('12/2030');

  // Multi card print selection toggle helper
  const toggleBulkPrintSelection = (id: string) => {
    if (bulkPrintIds.includes(id)) {
      setBulkPrintIds(bulkPrintIds.filter(x => x !== id));
    } else {
      setBulkPrintIds([...bulkPrintIds, id]);
    }
  };

  const toggleAllEmployeesForPrint = () => {
    const activeAndFilteredIds = filteredEmployees.map(e => e.id);
    if (bulkPrintIds.length === activeAndFilteredIds.length) {
      setBulkPrintIds([]);
    } else {
      setBulkPrintIds(activeAndFilteredIds);
    }
  };

  // Convert files cleanly to base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'employee' | 'selfie') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (target === 'employee') {
        setEmployeePhotoBase64(reader.result as string);
      } else {
        setCustomSelfieBase64(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Setup/Reset CRUD states
  const openAddEmployeeForm = () => {
    // Determine next sequence NIP
    const count = employees.length + 1;
    const padding = count < 10 ? '00' : count < 100 ? '0' : '';
    const generatedNip = `FGI-${padding}${count}`;

    setCurrentEmployee(null);
    setFormId('emp_' + Date.now());
    setFormNip(generatedNip);
    setFormName('');
    setFormPosition('Staff');
    setFormDept('Operational');
    setFormPhone('');
    setFormEmail('');
    setFormStatus('Aktif');
    setFormBranch('Majalengka');
    setFormAddress('');
    setFormJoinDate(new Date().toISOString().split('T')[0]);
    setFormSupervisor('');
    setFormTargetSales(15000000);
    setFormEmergency('');
    setFormMasaBerlaku('12/2029');
    setEmployeePhotoBase64(null);
    setShowEmployeeModal(true);
  };

  const openEditEmployeeForm = (emp: Employee) => {
    setCurrentEmployee(emp);
    setFormId(emp.id);
    setFormNip(emp.employeeId);
    setFormName(emp.name);
    setFormPosition(emp.position);
    setFormDept(emp.department);
    setFormPhone(emp.phone);
    setFormEmail(emp.email);
    setFormStatus(emp.status);
    setFormBranch(emp.branch);
    setFormAddress(emp.address);
    setFormJoinDate(emp.joinDate);
    setFormSupervisor(emp.supervisor);
    setFormTargetSales(emp.targetPenjualan || 15000000);
    setFormEmergency(emp.emergencyContact || '');
    setFormMasaBerlaku(emp.masaBerlaku || '12/2029');
    setEmployeePhotoBase64(emp.photo);
    setShowEmployeeModal(true);
  };

  const handleSaveEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formPhone.trim() || !formEmail.trim()) {
      alert('Nama, Telepon, dan Email tidak boleh kosong!');
      return;
    }

    const savedPhoto = employeePhotoBase64 || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';

    const cleanEmployee: Employee = {
      id: formId,
      employeeId: formNip,
      name: formName,
      position: formPosition,
      department: formDept,
      phone: formPhone,
      email: formEmail,
      photo: savedPhoto,
      status: formStatus,
      branch: formBranch,
      address: formAddress,
      joinDate: formJoinDate,
      supervisor: formSupervisor || 'Direksi',
      qrCode: `FGI_ID_${formNip}_${formName.replaceAll(' ', '_')}`,
      barcode: formNip.replace(/[^0-9]/g, '') || String(Math.floor(10000000 + Math.random() * 90000000)),
      cardNumber: `CR80-${formNip.replace(/[^0-9]/g, '') || Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: currentEmployee ? currentEmployee.createdAt : new Date().toISOString(),
      targetPenjualan: formTargetSales,
      masaBerlaku: formMasaBerlaku,
      emergencyContact: formEmergency || '0812-9876-0000'
    };

    onSaveEmployee(cleanEmployee);
    setShowEmployeeModal(false);
    onAddNotification(
      currentEmployee ? 'Profil Diperbarui' : 'Pegawai Terdaftar',
      `Biodata & rekrutmen ${formName} (${formNip}) berhasil diintegrasikan ke sistem HRIS.`,
      'success'
    );
  };

  const handleDeleteEmployeeClick = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menonaktifkan/menghapus data pegawai "${name}"?`)) {
      onDeleteEmployee(id);
      onAddNotification(
        'Pegawai Dihapus',
        `Data identitas pegawai ${name} telah dikeluarkan dari database HRIS aktif.`,
        'danger'
      );
    }
  };

  // Dynamic deterministic high contrast SVG Barcode generator
  const generateBarcodeSVG = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '') || '0123456789';
    const bars = [];
    let x = 0;
    // Standard pseudo Code-39 / Code-128 barcode look fully modular and crisp
    for (let i = 0; i < clean.length; i++) {
      const charVal = parseInt(clean[i]) || 3;
      const widths = [1, 2, 3, 1.5];
      // interleaving black bars and white gaps
      const barWidth = widths[charVal % 4];
      const gapWidth = widths[(charVal + 1) % 4];
      bars.push({ x, width: barWidth, fill: true });
      x += barWidth;
      bars.push({ x, width: gapWidth, fill: false });
      x += gapWidth;
    }
    // append quiet starting and trailing bars
    const renderBars = [{ x: 0, width: 3, fill: true }, ...bars, { x: x + 3, width: 3, fill: true }];
    return (
      <svg viewBox={`0 0 ${x + 6} 45`} className="w-full h-10 select-none" preserveAspectRatio="none">
        {renderBars.map((bar, idx) => (
          bar.fill && (
            <rect key={idx} x={bar.x} y={0} width={bar.width} height={45} fill="currentColor" />
          )
        ))}
      </svg>
    );
  };

  // QR rendering using api.qrserver.com or elegant simulated svg pattern representing QR
  const getQRCodeUrl = (data: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;
  };

  // Filter Logic of Employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      // 1. Search Query text
      const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.department.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Tab filtering rules
      const matchesBranchHeader = selectedCabang === 'Semua Cabang' || e.branch === selectedCabang;
      const matchesBranchFilter = filterBranch === 'Semua' || e.branch === filterBranch;
      const matchesJabatan = filterJabatan === 'Semua' || e.position === filterJabatan;
      const matchesStatus = filterStatus === 'Semua' || e.status === filterStatus;

      return matchesSearch && matchesBranchHeader && matchesBranchFilter && matchesJabatan && matchesStatus;
    });
  }, [employees, searchQuery, filterJabatan, filterBranch, filterStatus, selectedCabang]);

  // Attendance filter logic (e.g. today logs vs all)
  const sortedAttendances = useMemo(() => {
    return [...attendances].sort((a, b) => b.date.localeCompare(a.date) || b.checkIn.localeCompare(a.checkIn));
  }, [attendances]);

  // Handle Absensi simulation submission
  const handleSimulateAbsen = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAbsenEmpId) {
      alert('Pilih Pegawai terlebih dahulu!');
      return;
    }

    const empObj = employees.find(e => e.id === selectedAbsenEmpId);
    if (!empObj) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const timeNowStr = new Date().toTimeString().split(' ')[0];

    // Determine selfie photo standard options
    let selfieSelected = '';
    if (selfieOption === 'preset-1') {
      selfieSelected = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60';
    } else if (selfieOption === 'preset-2') {
      selfieSelected = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60';
    } else {
      selfieSelected = customSelfieBase64 || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60';
    }

    // Look for existing attendance today
    const existingLogIdx = attendances.findIndex(a => a.employeeId === empObj.employeeId && a.date === todayStr);

    if (absenType === 'in') {
      if (existingLogIdx >= 0) {
        alert(`${empObj.name} sudah melakukan Check-in Hari ini!`);
        return;
      }

      // Generate check in
      const newCheckIn: Attendance = {
        id: 'att_' + Date.now(),
        employeeId: empObj.employeeId,
        employeeName: empObj.name,
        position: empObj.position,
        date: todayStr,
        checkIn: timeNowStr,
        checkOut: '',
        latitude: gpsLat,
        longitude: gpsLng,
        selfiePhoto: selfieSelected
      };

      onSaveAttendance(newCheckIn);
      const isLate = timeNowStr > '08:00:00';
      onAddNotification(
        isLate ? 'Keterlambatan Absensi' : 'Absensi Check-In Sukses',
        `Pegawai ${empObj.name} berhasil melakukan Check-In jam ${timeNowStr} di koordinat ${gpsLat}, ${gpsLng}. Status: ${isLate ? 'Terlambat' : 'Tepat Waktu'}.`,
        isLate ? 'warning' : 'success'
      );
    } else {
      // Check-out logic
      if (existingLogIdx === -1) {
        alert(`${empObj.name} belum memproses Check-in hari ini! Simulasikan Check-in terlebih dahulu.`);
        return;
      }

      const existingRecord = attendances[existingLogIdx];
      if (existingRecord.checkOut) {
        alert(`${empObj.name} sudah melakukan Check-out hari ini pada ${existingRecord.checkOut}!`);
        return;
      }

      const updatedRecord: Attendance = {
        ...existingRecord,
        checkOut: timeNowStr
      };

      onSaveAttendance(updatedRecord);
      onAddNotification(
        'Absensi Check-Out Sukses',
        `Pegawai ${empObj.name} telah check-out jam ${timeNowStr}. Shift kerja telah terhitung masuk arsip.`,
        'info'
      );
    }

    // Clear simulation states
    setCustomSelfieBase64(null);
  };

  // Helper Preset Selfie Pics
  const SELFIE_PRESETS = [
    { id: 'preset-1', name: 'Selfie Pria (Aris)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60' },
    { id: 'preset-2', name: 'Selfie Wanita (Santi)', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60' }
  ];

  // Dashboard Stats Calculations
  const stats = useMemo(() => {
    const total = employees.length;
    const sales = employees.filter(e => e.position === 'Sales Executive' || e.position === 'Sales Manager').length;
    const managers = employees.filter(e => e.position.toLowerCase().includes('manager') || e.position === 'Direktur').length;
    const active = employees.filter(e => e.status === 'Aktif').length;
    const inactive = total - active;

    const todayStr = new Date().toISOString().split('T')[0];
    const presentToday = attendances.filter(a => a.date === todayStr && a.checkIn).length;

    return { total, sales, managers, active, inactive, presentToday };
  }, [employees, attendances]);

  // CSS standard CR80 style layouts
  const cardBackStyle = {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
  };

  return (
    <div className="space-y-6">
      
      {/* 1. SECTION HEADLINE */}
      <div id="sdm-module-header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl shadow-xl shadow-indigo-950/20 select-none">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-650 bg-red-600 rounded-xl shadow-lg shrink-0">
            <Contact className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              HRIS & ID Card <span className="px-2 py-0.5 bg-yellow-500 text-slate-950 text-[10px] rounded-full font-bold animate-pulse">PRO</span>
            </h1>
            <p className="text-xs text-slate-300">
              Sistem Manajemen SDM, Desain & Cetak Kartu PVC Pegawai Digital QR Code/Barcode, dan Tracker Presensi Genggam.
            </p>
          </div>
        </div>
        
        {/* Sub Navigation Tabs */}
        <div className="flex bg-slate-950/60 p-1 rounded-xl self-start md:self-center border border-slate-800">
          <button
            id="subtab-dash"
            onClick={() => setActiveSubTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${activeSubTab === 'dashboard' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </button>
          <button
            id="subtab-pegawai"
            onClick={() => setActiveSubTab('pegawai')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${activeSubTab === 'pegawai' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Katalog Pegawai</span>
          </button>
          <button
            id="subtab-idcard"
            onClick={() => setActiveSubTab('idcard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${activeSubTab === 'idcard' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Studio Cetak PVC</span>
          </button>
          <button
            id="subtab-absensi"
            onClick={() => setActiveSubTab('absensi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${activeSubTab === 'absensi' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Sistem Presensi</span>
          </button>
        </div>
      </div>

      {/* 2. SUBTAB RENDERING: DASHBOARD */}
      {activeSubTab === 'dashboard' && (
        <div id="subtab-content-dashboard" className="space-y-6">
          
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono">Daftar Pegawai</span>
                <p className="text-3xl font-black text-slate-900 mt-1">{stats.total}</p>
                <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> {stats.active} Aktif - {stats.inactive} Nonaktif
                </span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-slate-50 border flex items-center justify-center text-slate-600 shadow-sm">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono">Divisi Keagenan Sales</span>
                <p className="text-3xl font-black text-slate-900 mt-1">{stats.sales}</p>
                <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1 mt-1">
                  Target & Templete Khusus PVC
                </span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono">Pimpinan / Managers</span>
                <p className="text-3xl font-black text-slate-900 mt-1">{stats.managers}</p>
                <span className="text-[10px] text-yellow-600 font-bold flex items-center gap-1 mt-1">
                  Navy Gold Premium Template
                </span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-yellow-50 border border-yellow-250 flex items-center justify-center text-yellow-600 shadow-md shadow-yellow-500/5">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono">Kehadiran Hari Ini</span>
                <p className="text-3xl font-black text-slate-900 mt-1">{stats.presentToday} <span className="text-xs text-slate-400 font-bold">Laporan</span></p>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1.5">
                  Tingkat Kehadiran: {stats.total > 0 ? Math.round((stats.presentToday / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>

          </div>

          {/* Quick Informative Info Banner */}
          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 flex items-start gap-3 text-slate-800">
            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-extrabold text-yellow-900">Ketentuan & Standar Kartu PVC (CR80):</p>
              <p className="text-slate-700 leading-relaxed font-normal">
                Setiap ID Card yang digenerate telah memenuhi rasio standar ISO/IEC 7810 ID-1 (CR80 PVC Card: 85.60 mm × 53.98 mm). Pastikan printer dikalibrasi pada resolusi tinggi jika ingin mencetak PVC sheet fisik secara modular. Kode QR di dalam kartu dapat langsung diautentikasi lewat tab <strong>"Sistem Presensi"</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Box: Quick Absensi Stats Tracker */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-1">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider font-mono block mb-4">Informasi Aturan Shift Perusahaan</span>
              <div className="space-y-4">
                <div className="border bg-slate-50 p-4 rounded-xl flex items-center space-x-3.5">
                  <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold">1</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Batas Waktu Datang</h4>
                    <span className="text-slate-500 font-semibold text-[11px] block">Pukul 08:00 WIB</span>
                  </div>
                </div>
                <div className="border bg-slate-50 p-4 rounded-xl flex items-center space-x-3.5">
                  <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold">2</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Shift Pulang Kantor</h4>
                    <span className="text-slate-500 font-semibold text-[11px] block">Pukul 17:00 WIB</span>
                  </div>
                </div>
                <div className="border bg-slate-50 p-4 rounded-xl flex items-center space-x-3.5">
                  <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold">3</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Koordinat Kantor Majalengka</h4>
                    <span className="text-slate-500 font-semibold text-[11px] block">Lat: -6.8373, Lng: 108.2241</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box: Today logs summary */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Aktivitas Presensi Terakhir</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Umpan log real-time absensi pegawai digital</p>
                </div>
                <button
                  id="dash-absensi-jump"
                  onClick={() => setActiveSubTab('absensi')}
                  className="text-xs font-bold text-red-600 hover:underline flex items-center space-x-1"
                >
                  <span>Selengkapnya</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-normal border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-600 font-semibold">
                      <th className="py-2.5 px-3">Pegawai</th>
                      <th className="py-2.5 px-3">Tanggal / Jam</th>
                      <th className="py-2.5 px-3">Lokasi Kantor</th>
                      <th className="py-2.5 px-3">Log Presensi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-normal">
                    {sortedAttendances.slice(0, 5).map((log) => {
                      const isLate = log.checkIn > '08:00:00';
                      return (
                        <tr key={log.id} className="hover:bg-slate-50 transition text-[11px]">
                          <td className="py-3 px-3 flex items-center space-x-2.5">
                            <img src={log.selfiePhoto} alt="Selfie Log" className="h-8 w-8 rounded-full border object-cover" />
                            <div>
                              <span className="block font-bold text-slate-900">{log.employeeName}</span>
                              <span className="text-[9px] text-slate-500 font-mono block">{log.employeeId} - {log.position}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-medium">
                            <span className="block text-slate-800">{log.date}</span>
                            <span className="text-[10px] text-slate-500 font-mono block">In: {log.checkIn} {log.checkOut ? `| Out: ${log.checkOut}` : ''}</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-500">
                            {log.latitude}, {log.longitude}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              log.checkOut ? 'bg-indigo-100 text-indigo-800' : isLate ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {log.checkOut ? 'Selesai Kerja' : isLate ? 'Masuk Terlambat' : 'Masuk Tepat'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {sortedAttendances.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400 font-normal">
                          Belum ada log absensi terdeteksi hari ini. Gunakan tab <strong>"Sistem Presensi"</strong> untuk absensi pertama.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 3. SUBTAB RENDERING: DAFTAR PEGAWAI (CRUD) */}
      {activeSubTab === 'pegawai' && (
        <div id="subtab-content-pegawai" className="space-y-4">
          
          {/* Action Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
            
            {/* Search Input */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="pegawai-search"
                type="text"
                placeholder="Cari Pegawai (NIP, Nama, Divisi)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 pl-9 pr-4 text-xs font-medium outline-none focus:bg-white focus:border-red-500 transition-all"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400 font-bold font-mono text-[10px] uppercase">Branch:</span>
                <select
                  id="pegawai-filter-branch"
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="bg-slate-50 border border-slate-250 py-1.5 px-2.5 rounded-lg text-xs font-semibold focus:outline-none"
                >
                  <option value="Semua">Semua Kantor</option>
                  {AVAILABLE_BRANCHES.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400 font-bold font-mono text-[10px] uppercase">Jabatan:</span>
                <select
                  id="pegawai-filter-jabatan"
                  value={filterJabatan}
                  onChange={(e) => setFilterJabatan(e.target.value)}
                  className="bg-slate-50 border border-slate-250 py-1.5 px-2.5 rounded-lg text-xs font-semibold focus:outline-none"
                >
                  <option value="Semua">Semua Pangkat</option>
                  {JABATAN_LIST.map(j => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400 font-bold font-mono text-[10px] uppercase">Status:</span>
                <select
                  id="pegawai-filter-status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-250 py-1.5 px-2.5 rounded-lg text-xs font-semibold focus:outline-none"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

              {/* Add Employee trigger button */}
              <button
                id="btn-tambah-pegawai"
                onClick={openAddEmployeeForm}
                className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-black shadow-md shadow-red-700/10 flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Pegawai</span>
              </button>

            </div>

          </div>

          {/* Grid Catalogue cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredEmployees.map((emp) => {
              const countAbsence = attendances.filter(a => a.employeeId === emp.employeeId).length;
              return (
                <div 
                  id={`employee-card-${emp.id}`}
                  key={emp.id} 
                  className={`bg-white border rounded-2xl p-5 shadow-sm transition hover:shadow-md relative overflow-hidden flex flex-col justify-between group
                    ${emp.status === 'Nonaktif' ? 'opacity-55' : ''}`}
                >
                  {/* Status Indicator bubble */}
                  <span className={`absolute top-4 right-4 h-2.5 w-2.5 rounded-full ${emp.status === 'Aktif' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />

                  <div className="space-y-4">
                    {/* Header Avatar card info */}
                    <div className="flex items-center space-x-3">
                      <img 
                        src={emp.photo} 
                        alt={emp.name} 
                        className="h-12 w-12 rounded-xl object-cover border border-slate-200 shadow-sm"
                      />
                      <div>
                        <h4 className="text-xs font-black text-slate-900 group-hover:text-red-700 transition leading-snug">{emp.name}</h4>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{emp.employeeId}</span>
                      </div>
                    </div>

                    {/* Meta specification list */}
                    <div className="space-y-2 border-t pt-3 text-[11px] leading-relaxed select-none">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pangkat/Jabatan:</span>
                        <span className="font-extrabold text-slate-800">{emp.position}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Divisi/Kantor:</span>
                        <span className="font-bold text-slate-800">{emp.department} ({emp.branch})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Telp / WA:</span>
                        <span className="font-mono text-slate-650 text-slate-600">{emp.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Kehadiran:</span>
                        <span className="font-mono font-bold text-slate-800">{countAbsence} kali</span>
                      </div>
                      {emp.position.includes('Sales') && emp.targetPenjualan && (
                        <div className="flex justify-between text-indigo-750 bg-indigo-50/50 p-1 px-1.5 rounded text-[10px]">
                          <span className="text-indigo-500 font-semibold">Target Sales:</span>
                          <span className="font-bold font-mono text-indigo-900">Rp {emp.targetPenjualan.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="mt-4 pt-3 border-t flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-2">
                      <button
                        id={`emp-card-preview-id-${emp.id}`}
                        onClick={() => {
                          setSinglePrintEmp(emp);
                          setCardTemplate(emp.position === 'Sales Executive' ? 'sales' : emp.position.toLowerCase().includes('manager') || emp.position === 'Direktur' ? 'manager' : 'standard');
                          setActiveSubTab('idcard');
                        }}
                        className="text-slate-600 hover:text-red-700 font-bold flex items-center space-x-1"
                        title="Lihat Desain Kartu PVC"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Desain</span>
                      </button>

                      <button
                        id={`emp-card-digital-id-${emp.id}`}
                        onClick={() => {
                          setDigitalIdEmployee(emp);
                          setDigitalCardTemplate(emp.position === 'Sales Executive' ? 'sales' : emp.position.toLowerCase().includes('manager') || emp.position === 'Direktur' ? 'manager' : 'standard');
                          setDigitalCardFlipped(false);
                          setShowDigitalIdModal(true);
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 font-black flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-red-100 hover:border-red-205 transition-all text-[10px] cursor-pointer"
                        title="Lihat ID Card Digital"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                        <span>ID Digital</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        id={`emp-card-edit-btn-${emp.id}`}
                        onClick={() => openEditEmployeeForm(emp)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition"
                        title="Edit Pegawai"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        id={`emp-card-del-btn-${emp.id}`}
                        onClick={() => handleDeleteEmployeeClick(emp.id, emp.name)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 rounded text-red-600 transition"
                        title="Keluarkan Pegawai"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}

            {filteredEmployees.length === 0 && (
              <div colSpan={4} className="col-span-full py-12 text-center text-slate-400 bg-white border rounded-2xl">
                Tidak ada pegawai aktif yang sesuai dengan kriteria filter masukan Anda.
              </div>
            )}
          </div>

        </div>
      )}

      {/* 4. SUBTAB RENDERING: STUDIO CETAK ID CARD & PVC DESIGNER */}
      {activeSubTab === 'idcard' && (
        <div id="subtab-content-idcard" className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Designer controls panel */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 lg:col-span-4 space-y-5">
              
              <div className="border-b pb-3.5">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Kustomisasi Preview ID Card</h3>
                <p className="text-[10px] text-slate-500 mt-1">Sesuaikan tema & template kartu untuk didownload atau dicetak.</p>
              </div>

              {/* Select Employee to custom */}
              <div className="space-y-2 select-none">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Pilih Data Pegawai</label>
                <select
                  id="designer-select-employee"
                  value={singlePrintEmp ? singlePrintEmp.id : ''}
                  onChange={(e) => {
                    const empObj = employees.find(x => x.id === e.target.value);
                    if (empObj) {
                      setSinglePrintEmp(empObj);
                      setCardTemplate(empObj.position === 'Sales Executive' ? 'sales' : empObj.position.toLowerCase().includes('manager') || empObj.position === 'Direktur' ? 'manager' : 'standard');
                    } else {
                      setSinglePrintEmp(null);
                    }
                  }}
                  className="w-full bg-slate-50 border text-xs font-semibold rounded-lg p-2 focus:outline-none"
                >
                  <option value="">-- Pilih Pegawai untuk Preview --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.position})</option>
                  ))}
                </select>
              </div>

              {/* Template Theme selectors */}
              {singlePrintEmp && (
                <div className="space-y-2 select-none">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Template Desain</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      id="tpl-btn-standard"
                      onClick={() => setCardTemplate('standard')}
                      className={`text-xs py-2 px-1 rounded-lg border font-bold text-center transition ${cardTemplate === 'standard' ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                    >
                      Standard
                    </button>
                    <button
                      id="tpl-btn-sales"
                      onClick={() => setCardTemplate('sales')}
                      className={`text-xs py-2 px-1 rounded-lg border font-bold text-center transition ${cardTemplate === 'sales' ? 'bg-indigo-600 border-indigo-600 text-white animate-pulse' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                      disabled={singlePrintEmp?.position !== 'Sales Executive' && singlePrintEmp?.position !== 'Sales Manager'}
                      title="Hanya untuk jabatan keagenan Sales"
                    >
                      Corporate Sales
                    </button>
                    <button
                      id="tpl-btn-manager"
                      onClick={() => setCardTemplate('manager')}
                      className={`text-xs py-2 px-1 rounded-lg border font-bold text-center transition ${cardTemplate === 'manager' ? 'bg-yellow-750 bg-yellow-600 border-yellow-750 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                      disabled={!singlePrintEmp?.position.toLowerCase().includes('manager') && singlePrintEmp?.position !== 'Direktur'}
                      title="Hanya untuk jabatan Managerial & Direksi"
                    >
                      Navy Gold Executive
                    </button>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1 leading-normal font-sans">
                    *Template Sales dan Executive hanya terbuka untuk jabatan struktural yang sesuai demi menjaga konsistensi visual instansi perusahaan.
                  </span>
                </div>
              )}

              {/* Form Actions for the designer */}
              {singlePrintEmp && (
                <div className="space-y-2 pt-3 border-t">
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-2">Simulasi & Ekspor</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="btn-designer-download"
                      onClick={() => {
                        alert(`Mengekspor berkas resolusi tinggi ID Card untuk: ${singlePrintEmp.name} (CR80 PVC-Standard Format...)\nPNG Berhasil Diunduh.`);
                        onAddNotification('Unduh File Berhasil', `Template PNG ID Card depan & belakang ${singlePrintEmp.name} berhasil diekspor.`, 'success');
                      }}
                      className="bg-slate-800 hover:bg-slate-950 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center space-x-1 transition cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Simpan PNG</span>
                    </button>
                    <button
                      id="btn-designer-print"
                      onClick={() => {
                        setPrintLayout('pvc');
                        setShowPrintModal(true);
                      }}
                      className="bg-red-650 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center space-x-1 transition cursor-pointer"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Cetak PVC</span>
                    </button>
                  </div>

                  <button
                    id="btn-designer-print-a4"
                    onClick={() => {
                      setPrintLayout('a4');
                      if (!bulkPrintIds.includes(singlePrintEmp.id)) {
                        setBulkPrintIds([singlePrintEmp.id]);
                      }
                      setShowPrintModal(true);
                    }}
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border text-xs font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer mt-2"
                  >
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span>Multi Cetak A4 / Pembuat PDF</span>
                  </button>

                  <button
                    id="btn-designer-view-digital-id"
                    onClick={() => {
                      setDigitalIdEmployee(singlePrintEmp);
                      setDigitalCardTemplate(cardTemplate);
                      setDigitalCardFlipped(false);
                      setShowDigitalIdModal(true);
                    }}
                    className="w-full bg-gradient-to-r from-red-600 to-red-750 hover:from-red-500 hover:to-red-700 text-white font-black py-2.5 px-4 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer mt-2.5 shadow-md shadow-red-600/10"
                  >
                    <QrCode className="h-4 w-4" />
                    <span>Buka ID Card Digital</span>
                  </button>
                </div>
              )}

              {!singlePrintEmp && (
                <div className="p-10 border border-dashed text-center text-slate-400 rounded-xl leading-normal select-none">
                  Pilih pegawai dari menu dropdown untuk mulai menyusun tata letak & visualisasi kartu PVC.
                </div>
              )}

            </div>

            {/* High visual CR80 Card displays (Front & Back) */}
            <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-6">
              
              {singlePrintEmp ? (
                <div className="w-full space-y-6">
                  
                  <div className="flex items-center justify-between border-b pb-3 w-full max-w-2xl mx-auto">
                    <span className="text-xs font-bold text-slate-600 block">Preview Layout CR80 (Standar PVC ISO)</span>
                    <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold font-mono">
                      {cardTemplate.toUpperCase()} TEMPLATE
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 max-w-2xl mx-auto">
                    
                    {/* FRONT OF THE CARD */}
                    <div id="idcard-front-preview" className="relative shrink-0 w-[241.2px] h-[352.8px] bg-white border border-slate-350 rounded-[12px] shadow-2xl overflow-hidden flex flex-col justify-between select-none">
                      
                      {/* Standard Template Header styling */}
                      {cardTemplate === 'standard' && (
                        <div className="bg-gradient-to-r from-red-600 to-red-800 p-2.5 text-center text-white">
                          <h4 className="text-[9px] font-black tracking-tight leading-tight uppercase font-sans">PT. FORESYNDO GLOBAL INDONESIA</h4>
                          <span className="text-[7px] text-red-100 font-mono tracking-widest block uppercase mt-0.5">SaaS & HRIS Pro-Software</span>
                        </div>
                      )}

                      {/* Sales Template Header styling (White / Silver / Blue badge style) */}
                      {cardTemplate === 'sales' && (
                        <div className="bg-slate-100 border-b border-indigo-200 p-2 text-center text-slate-800 flex justify-between items-center px-3">
                          <span className="text-[8px] font-extrabold text-blue-900 tracking-tight leading-tight uppercase text-left">PT. FORESYNDO<br/>GLOBAL INDONESIA</span>
                          <span className="text-[8px] uppercase bg-gradient-to-r from-indigo-500 to-indigo-800 text-white font-black px-1.5 py-0.5 rounded-full font-mono scale-95 origin-right">
                            SALES
                          </span>
                        </div>
                      )}

                      {/* Manager Template Header styling (Deep Navy & Rich Gold) */}
                      {cardTemplate === 'manager' && (
                        <div className="bg-slate-950 p-2.5 text-center border-b-2 border-yellow-500 text-white">
                          <h4 className="text-[9px] font-black tracking-tight leading-tight uppercase font-sans text-yellow-500">PT. FORESYNDO GLOBAL INDONESIA</h4>
                          <span className="text-[7px] text-yellow-100 font-serif tracking-widest block uppercase mt-0.5">EXECUTIVE SUITE LEAGUE</span>
                        </div>
                      )}

                      {/* Body Content area */}
                      <div className="p-3 text-center flex-1 flex flex-col justify-center items-center space-y-1.5">
                        
                        {/* Avatar */}
                        <div className="relative">
                          <div className={`p-0.5 rounded-full overflow-hidden ${cardTemplate === 'manager' ? 'bg-yellow-500' : cardTemplate === 'sales' ? 'bg-indigo-500' : 'bg-red-600'}`}>
                            <img 
                              src={singlePrintEmp.photo} 
                              alt="Front employee" 
                              className="h-14 w-14 rounded-full object-cover border-2 border-white"
                            />
                          </div>
                        </div>

                        {/* Employee Name & Position Title */}
                        <div>
                          <h3 className="text-xs font-black text-slate-900 leading-normal uppercase">{singlePrintEmp.name}</h3>
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                            cardTemplate === 'manager' ? 'bg-yellow-500/10 text-yellow-800 border border-yellow-250/50' : cardTemplate === 'sales' ? 'bg-indigo-50 text-indigo-800 border' : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {singlePrintEmp.position}
                          </span>
                        </div>

                        {/* ID and code logs */}
                        <div className="w-full bg-slate-50 border p-1 rounded text-[8px] space-y-0.5 leading-normal select-none">
                          <div className="flex justify-between px-1">
                            <span className="text-slate-400 font-mono">REG ID (NIP):</span>
                            <span className="font-bold text-slate-900 font-mono">{singlePrintEmp.employeeId}</span>
                          </div>
                          <div className="flex justify-between px-1">
                            <span className="text-slate-400 font-mono">CABANG (REGION):</span>
                            <span className="font-semibold text-slate-900">{singlePrintEmp.branch}</span>
                          </div>
                          {cardTemplate === 'sales' && singlePrintEmp.targetPenjualan && (
                            <div className="flex justify-between px-1">
                              <span className="text-blue-500 font-bold block leading-none select-none">TARGET:</span>
                              <span className="font-bold text-blue-900 font-mono">Rp {singlePrintEmp.targetPenjualan.toLocaleString('id-ID')}</span>
                            </div>
                          )}
                        </div>

                        {/* Small QR to keep authentic front card layout */}
                        <div className="flex items-center justify-center p-1 border rounded bg-white">
                          <img 
                            src={getQRCodeUrl(singlePrintEmp.qrCode)} 
                            alt="Front barcode QR" 
                            className="h-10 w-10 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                      </div>

                      {/* Card Footer info */}
                      <div className={`p-1.5 text-center text-[7px] leading-snug border-t select-none ${
                        cardTemplate === 'manager' ? 'bg-slate-950 border-slate-900 text-slate-500 text-yellow-100/60' : 'bg-slate-50 border-slate-150 text-slate-500'
                      }`}>
                        <span>Website: www.foresyndo.co.id | Telp: 021-990812-FGI</span>
                        <div className="text-[6px] tracking-tight opacity-75 mt-0.5 text-slate-400">Majalengka & Jakarta HQ, Indonesia</div>
                      </div>

                    </div>

                    {/* BACK OF THE CARD */}
                    <div id="idcard-back-preview" style={cardBackStyle} className="relative shrink-0 w-[241.2px] h-[352.8px] bg-slate-900 border border-slate-950 rounded-[12px] shadow-2xl overflow-hidden flex flex-col justify-between text-white select-none">
                      
                      {/* Accent strip top */}
                      <div className={`h-1.5 w-full ${cardTemplate === 'manager' ? 'bg-yellow-500' : cardTemplate === 'sales' ? 'bg-blue-500' : 'bg-red-600'}`} />

                      {/* Main back specifications body */}
                      <div className="p-4 text-center flex-1 flex flex-col justify-center items-center space-y-3.5">
                        
                        <div>
                          <p className={`text-[8px] font-bold uppercase tracking-widest ${cardTemplate === 'manager' ? 'text-yellow-500' : 'text-slate-400'}`}>KARTU AKSES PREFRAL</p>
                          <span className="text-[6px] text-slate-500 uppercase block font-mono">ISO/IEC STANDARD 7810 SYSTEMS</span>
                        </div>

                        {/* Large center QR Code scanning simulator targeting check-in */}
                        <div className="bg-white p-2.5 rounded-lg border-2 border-slate-700 shadow-md">
                          <img 
                            src={getQRCodeUrl(singlePrintEmp.qrCode)} 
                            alt="Large Back barcode QR" 
                            className="h-18 w-18 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Details specs */}
                        <div className="text-[8px] font-mono leading-relaxed space-y-0.5 border-t border-b border-slate-800 py-2 w-full select-none text-slate-300">
                          <p>Masa Berlaku: {singlePrintEmp.masaBerlaku || '12/2029'}</p>
                          <p>Kontak Darurat: {singlePrintEmp.emergencyContact || '0812-3344-556'}</p>
                        </div>

                        {/* Crisp SVG Barcode strip */}
                        <div className="w-full text-white/90">
                          {generateBarcodeSVG(singlePrintEmp.barcode)}
                          <span className="text-[6px] text-slate-500 block font-mono uppercase text-center mt-1">CARD SERIAL: {singlePrintEmp.cardNumber}</span>
                        </div>

                      </div>

                      {/* Legal & Corporate disclaimer */}
                      <div className="p-2 bg-slate-950 border-t border-slate-800 text-center text-[5.5px] text-slate-500 leading-snug font-normal select-none uppercase">
                        Kartu ini adalah milik PT. Foresyndo Global Indonesia. Jika menemukan kartu ini harap mengembalikan ke Bagian HRD atau pos polisi terdekat. Penggunaan ilegal akan dituntut hukum.
                      </div>

                    </div>

                  </div>

                </div>
              ) : (
                <div className="p-16 border rounded-2xl bg-white text-center text-slate-400 max-w-lg mx-auto w-full select-none shadow-sm leading-normal">
                  <Printer className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="font-bold text-slate-600">Studio Pembuatan ID Card PVC</p>
                  <p className="text-xs text-slate-500 mt-1">Pilih data pegawai dari menu samping kiri untuk merancang, mengaktifkan, mengunduh, serta mencetak kartu identitas CR80 digital.</p>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* 5. SUBTAB RENDERING: SISTEM ABSENSI & SCANNER SIMULATOR */}
      {activeSubTab === 'absensi' && (
        <div id="subtab-content-absensi" className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Attendance Scanner simulator */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 lg:col-span-5 space-y-4">
              
              <div className="border-b pb-3 flex items-center space-x-2.5 select-none">
                <Smartphone className="h-5 w-5 text-red-600 shrink-0" />
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase">Simulasi Scan QR Scanner</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Uji coba kehadiran pegangan HP digital pegawai.</p>
                </div>
              </div>

              <form onSubmit={handleSimulateAbsen} className="space-y-3">
                
                {/* Employee choice */}
                <div className="space-y-1.5 select-none text-xs">
                  <label className="block font-bold text-slate-450 uppercase tracking-widest font-mono text-[10px]">Identitas Pegawai QR</label>
                  <select
                    id="absen-select-employee"
                    value={selectedAbsenEmpId}
                    onChange={(e) => {
                      setSelectedAbsenEmpId(e.target.value);
                      const empObj = employees.find(x => x.id === e.target.value);
                      if (empObj) {
                        // Autofill GPS and other coordinate defaults
                        if (empObj.branch === 'Majalengka') {
                          setGpsLocationStr('PT. Foresyndo Global Indonesia, Majalengka HQ');
                          setGpsLat('-6.8373');
                          setGpsLng('108.2241');
                        } else if (empObj.branch === 'Jakarta') {
                          setGpsLocationStr('FGI Office Jakarta, Sudirman Central Business District');
                          setGpsLat('-6.2088');
                          setGpsLng('106.8456');
                        } else {
                          setGpsLocationStr(`Kantor Region FGI ${empObj.branch}`);
                          setGpsLat('-7.2504');
                          setGpsLng('112.7688');
                        }
                      }
                    }}
                    className="w-full bg-slate-50 border text-xs font-semibold rounded-lg p-2.5 focus:outline-none"
                  >
                    <option value="">-- Pilih Pegawai yg Melakukan Scan --</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.employeeId} - {e.name} ({e.branch})</option>
                    ))}
                  </select>
                </div>

                {/* Log type radio option */}
                <div className="space-y-1.5 select-none text-xs">
                  <label className="block font-bold text-slate-450 uppercase tracking-widest font-mono text-[10px]">Metode Log Presensi</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="absen-type-in-btn"
                      type="button"
                      onClick={() => setAbsenType('in')}
                      className={`py-2 px-3 rounded-lg border font-bold text-center transition ${absenType === 'in' ? 'bg-emerald-600 border-none text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                    >
                      Check-In Masuk
                    </button>
                    <button
                      id="absen-type-out-btn"
                      type="button"
                      onClick={() => setAbsenType('out')}
                      className={`py-2 px-3 rounded-lg border font-bold text-center transition ${absenType === 'out' ? 'bg-indigo-650 bg-indigo-600 border-none text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                    >
                      Check-Out Pulang
                    </button>
                  </div>
                </div>

                {/* Simulated GPS Location */}
                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-slate-450 uppercase tracking-widest font-mono text-[10px]">Verifikasi GPS Kantor Wilayah</label>
                  <input
                    id="gps-label-input"
                    type="text"
                    value={gpsLocationStr}
                    onChange={(e) => setGpsLocationStr(e.target.value)}
                    className="w-full bg-slate-50 border text-xs font-semibold rounded-lg p-2"
                  />
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-mono">LATITUDE LOKASI</span>
                      <input
                        id="gps-lat-input"
                        type="text"
                        value={gpsLat}
                        onChange={(e) => setGpsLat(e.target.value)}
                        className="w-full bg-slate-50 border font-mono text-[10px] rounded-lg p-1.5"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-mono">LONGITUDE LOKASI</span>
                      <input
                        id="gps-lng-input"
                        type="text"
                        value={gpsLng}
                        onChange={(e) => setGpsLng(e.target.value)}
                        className="w-full bg-slate-50 border font-mono text-[10px] rounded-lg p-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Camera Selfie simulation upload */}
                <div className="space-y-2 select-none text-xs">
                  <label className="block font-bold text-slate-450 uppercase tracking-widest font-mono text-[10px]">Selfie Verifikasi Wajah (Face Lock)</label>
                  
                  {/* Preset Selector */}
                  <div className="grid grid-cols-3 gap-2">
                    {SELFIE_PRESETS.map((preset) => (
                      <button
                        id={`selfie-preset-${preset.id}`}
                        type="button"
                        key={preset.id}
                        onClick={() => {
                          setSelfieOption(preset.id);
                          setCustomSelfieBase64(null);
                        }}
                        className={`p-1.5 border rounded-lg flex flex-col items-center justify-center space-y-1 transition text-[10px] ${selfieOption === preset.id ? 'border-red-650 bg-red-50 border-red-600' : 'border-slate-200 hover:bg-slate-50'}`}
                      >
                        <img src={preset.url} className="h-8 w-8 rounded-full border object-cover" />
                        <span className="truncate w-full text-center font-semibold text-slate-700">{preset.name}</span>
                      </button>
                    ))}
                    
                    <button
                      id="selfie-preset-custom"
                      type="button"
                      onClick={() => {
                        setSelfieOption('custom');
                        // Simulation file trigger
                        document.getElementById('selfie-file-picker')?.click();
                      }}
                      className={`p-1.5 border rounded-lg flex flex-col items-center justify-center space-y-1 transition text-[10px] ${selfieOption === 'custom' ? 'border-red-650 bg-red-50 border-red-600' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      {customSelfieBase64 ? (
                        <img src={customSelfieBase64} className="h-8 w-8 rounded-full border object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border text-slate-400">
                          <Camera className="h-4 w-4" />
                        </div>
                      )}
                      <span className="truncate w-full text-center font-semibold text-slate-700">Custom Upload</span>
                    </button>
                  </div>
                  
                  <input
                    id="selfie-file-picker"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'selfie')}
                    className="hidden"
                  />
                  <p className="text-[9px] text-slate-400 font-normal leading-normal">
                    *HRIS profesional mendeteksi keaslian selfie menggunakan algoritma pengenalan liveness face lock biometrik untuk meminimalisir titip absen.
                  </p>
                </div>

                {/* Submit simulation */}
                <button
                  id="btn-presensi-submit"
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-lg text-xs tracking-wide uppercase transition flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-red-700/10 mt-3"
                >
                  <QrCode className="h-4 w-4 text-white animate-pulse" />
                  <span>Simulasikan Scan QR & Kirim Absen</span>
                </button>

              </form>

            </div>

            {/* Attendance Log listings */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-7 space-y-4">
              
              <div className="flex items-center justify-between border-b pb-3 select-none">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase">Riwayat & Log Kehadiran Pegawai</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Seluruh arsip check-in dari scan QR code PVC.</p>
                </div>
                <div className="px-2 py-0.5 bg-slate-100 rounded-full text-[10px] font-mono text-slate-500 font-semibold">
                  Today Date: {new Date().toISOString().split('T')[0]}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-normal border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b text-slate-600 font-semibold select-none">
                      <th className="py-2.5 px-3">Pegawai Profil</th>
                      <th className="py-2.5 px-3">Tanggal / Jam</th>
                      <th className="py-2.5 px-3">Koordinat GPS / Posisi</th>
                      <th className="py-2.5 px-3">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-normal">
                    {sortedAttendances.map((log) => {
                      const isLate = log.checkIn > '08:00:00';
                      return (
                        <tr id={`attendance-log-row-${log.id}`} key={log.id} className="hover:bg-slate-50 transition text-[11px]">
                          <td className="py-3 px-3 flex items-center space-x-2.5">
                            <img src={log.selfiePhoto} alt="Selfie Log" className="h-9 w-9 rounded-full border object-cover" />
                            <div>
                              <span className="block font-bold text-slate-900">{log.employeeName}</span>
                              <span className="text-[9px] text-slate-500 font-mono block mt-0.5">{log.employeeId} - {log.position}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="block text-slate-800 font-medium">{log.date}</span>
                            <span className="text-[10px] text-slate-500 font-semibold font-mono block mt-0.5">
                              Check-In: {log.checkIn} {log.checkOut ? `| Check-Out: ${log.checkOut}` : ''}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500">
                            <span className="block font-mono text-[10px]">{log.latitude}, {log.longitude}</span>
                            <span className="text-[9.5px] text-slate-400 block mt-0.5 max-w-[150px] truncate" title="Soreang Region FGI Office">PT. FGI Regional Office</span>
                          </td>
                          <td className="py-3 px-3">
                            <button
                              id={`btn-del-log-absen-${log.id}`}
                              onClick={() => {
                                if (confirm('Keluarkan baris log presensi ini?')) {
                                  onDeleteAttendance(log.id);
                                  onAddNotification('Absensi Baris Terhapus', 'Baris log waktu scan QR dihapus.', 'warning');
                                }
                              }}
                              className="text-red-650 text-red-600 hover:text-red-700 font-bold"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {sortedAttendances.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400 font-normal">
                          Belum ada aktivitas presensi harian terekam. Gunakan form simulator sebelah kiri untuk mulai menguji coba scan QR Code Pegawai.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* 6. MODAL: CRUD FORM FOR EMPLOYEE CATALOGUE */}
      {showEmployeeModal && (
        <div id="employee-crud-modal" className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10 select-none">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                {currentEmployee ? 'Perbarui Profil Pegawai' : 'Daftarkan Rekrutmen Pegawai Baru'}
              </h3>
              <button
                id="modal-employee-close"
                onClick={() => setShowEmployeeModal(false)}
                className="text-slate-450 hover:text-slate-900 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body form */}
            <form onSubmit={handleSaveEmployeeSubmit} className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4 text-xs font-normal">
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">NIP / ID Pegawai</label>
                  <input
                    id="form-employee-nip"
                    type="text"
                    required
                    value={formNip}
                    disabled
                    className="w-full bg-slate-50 text-slate-500 font-bold border rounded-lg p-2 font-mono outline-none"
                    title="NIP digenerate otomatis berdasarkan urutan database"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Nama Lengkap</label>
                  <input
                    id="form-employee-name"
                    type="text"
                    required
                    placeholder="Contoh: Raditya Wijaksana, S.Kom."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-50 border rounded-lg p-2 outline-none focus:bg-white focus:border-red-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Jabatan Struktural</label>
                  <select
                    id="form-employee-position"
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value as EmployeePosition)}
                    className="w-full bg-slate-50 border rounded-lg p-2 outline-none focus:bg-white focus:border-red-500 transition-all font-semibold"
                  >
                    {JABATAN_LIST.map(j => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Kantor Region Cabang</label>
                  <select
                    id="form-employee-branch"
                    value={formBranch}
                    onChange={(e) => setFormBranch(e.target.value)}
                    className="w-full bg-slate-50 border rounded-lg p-2 outline-none"
                  >
                    {AVAILABLE_BRANCHES.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Divisi / Bagian</label>
                  <input
                    id="form-employee-dept"
                    type="text"
                    required
                    placeholder="Contoh: IT Support; Marketing"
                    value={formDept}
                    onChange={(e) => setFormDept(e.target.value)}
                    className="w-full bg-slate-50 border rounded-lg p-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Tanggal Bergabung</label>
                  <input
                    id="form-employee-joindate"
                    type="date"
                    required
                    value={formJoinDate}
                    onChange={(e) => setFormJoinDate(e.target.value)}
                    className="w-full bg-slate-50 border rounded-lg p-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Nomor WhatsApp HP</label>
                  <input
                    id="form-employee-phone"
                    type="tel"
                    required
                    placeholder="Contoh: 0812345678"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-slate-50 border rounded-lg p-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Email Perusahaan</label>
                  <input
                    id="form-employee-email"
                    type="email"
                    required
                    placeholder="Contoh: pegawai@foresyndo.co.id"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-slate-50 border rounded-lg p-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Status Pegawai</label>
                  <select
                    id="form-employee-status"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'Aktif' | 'Nonaktif')}
                    className="w-full bg-slate-50 border rounded-lg p-2 outline-none"
                  >
                    <option value="Aktif">Aktif Bekerja</option>
                    <option value="Nonaktif">Keluar / Rumah / Cuti</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Masa Berlaku ID Card</label>
                  <input
                    id="form-employee-expiry"
                    type="text"
                    placeholder="Contoh: 12/2030"
                    value={formMasaBerlaku}
                    onChange={(e) => setFormMasaBerlaku(e.target.value)}
                    className="w-full bg-slate-50 border rounded-lg p-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Atasan Langsung</label>
                  <input
                    id="form-employee-supervisor"
                    type="text"
                    placeholder="Contoh: Kevin Wijaya (General Manager)"
                    value={formSupervisor}
                    onChange={(e) => setFormSupervisor(e.target.value)}
                    className="w-full bg-slate-50 border rounded-lg p-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1 font-sans">Kontak Darurat (Telp)</label>
                  <input
                    id="form-employee-emergency"
                    type="text"
                    placeholder="Contoh: H. Abdul (Ayah) - 0811..."
                    value={formEmergency}
                    onChange={(e) => setFormEmergency(e.target.value)}
                    className="w-full bg-slate-50 border rounded-lg p-2 outline-none"
                  />
                </div>

              </div>

              {formPosition.includes('Sales') && (
                <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl space-y-1">
                  <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wider font-mono">Target Penjualan khusus Agen Sales</label>
                  <input
                    id="form-employee-target"
                    type="number"
                    value={formTargetSales}
                    onChange={(e) => setFormTargetSales(Number(e.target.value))}
                    className="w-full bg-white border border-indigo-200 text-indigo-900 rounded-lg p-2 text-xs font-mono font-bold"
                  />
                </div>
              )}

              {/* Photo Upload layout */}
              <div className="space-y-1.5 select-none text-xs">
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider font-mono">Unggah Foto Pegawai Resmi</label>
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-350 hover:border-red-600 transition p-4 rounded-xl text-center bg-slate-50 cursor-pointer text-slate-500">
                  {employeePhotoBase64 ? (
                    <div className="flex items-center justify-center space-x-3 text-xs text-slate-800">
                      <img src={employeePhotoBase64} className="h-10 w-10 rounded object-cover border" />
                      <span className="font-bold">Foto Dipasang. Klik untuk mengganti.</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Plus className="h-5 w-5 mx-auto text-slate-400" />
                      <p className="font-semibold text-slate-600">Klik atau seret file gambar resmi ke sini</p>
                      <p className="text-[10px] text-slate-400">Dimensi ideal 1:1 / Background Putih/Merah/Biru resmi (Max 2MB)</p>
                    </div>
                  )}
                  <input
                    id="form-employee-photo-picker"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'employee')}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Home Address */}
              <div className="space-y-1.5 text-xs">
                <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider font-mono">Alamat Tinggal / Domisili Lengkap</label>
                <textarea
                  id="form-employee-address"
                  required
                  rows={2}
                  placeholder="Isi alamat lengkap sesuai KTP..."
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full bg-slate-50 border rounded-lg p-2.5 outline-none focus:bg-white focus:border-red-500 transition-all font-normal"
                />
              </div>

              {/* Form buttons */}
              <div className="pt-4 border-t flex items-center justify-end space-x-2.5">
                <button
                  id="btn-form-employee-cancel"
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="text-xs font-bold text-slate-600 hover:underline px-4 py-2"
                >
                  Batal
                </button>
                <button
                  id="btn-form-employee-submit"
                  type="submit"
                  className="bg-red-650 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-lg text-xs tracking-wider uppercase transition shadow-md shadow-red-700/10 cursor-pointer"
                >
                  {currentEmployee ? 'Simpan Pembaruan' : 'Daftarkan & Rilis ID Card'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 7. MODAL: FULLSCREEN PRINT AREA FOR PVC OR A4 SHEETS */}
      {showPrintModal && (
        <div id="print-layout-modal" className="fixed inset-0 bg-slate-900 z-50 overflow-y-auto flex flex-col justify-between">
          
          {/* Print Controller Topbar */}
          <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 text-white flex items-center justify-between select-none print:hidden">
            <div className="flex items-center space-x-3">
              <Printer className="h-5 w-5 text-red-500 animate-pulse" />
              <div>
                <h4 className="text-sm font-black uppercase">Studio Layanan Antarmuka Cetak Kartu</h4>
                <p className="text-[10px] text-slate-400">Gunakan pintasan browser Anda <strong>Ctrl+P (Cmd+P)</strong> untuk mengirim ke printer.</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 text-xs font-bold">
              <div className="flex bg-slate-850 bg-slate-900 border border-slate-800 p-1 rounded-lg">
                <button
                  id="layout-btn-pvc"
                  onClick={() => setPrintLayout('pvc')}
                  className={`py-1.5 px-3 rounded-lg flex items-center space-x-1 transition ${printLayout === 'pvc' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>CR80 PVC Standar</span>
                </button>
                <button
                  id="layout-btn-a4"
                  onClick={() => setPrintLayout('a4')}
                  className={`py-1.5 px-3 rounded-lg flex items-center space-x-1 transition ${printLayout === 'a4' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>A4 Multi-Card (Cetak Massal)</span>
                </button>
              </div>

              <button
                id="do-print-btn"
                onClick={() => window.print()}
                className="bg-red-650 bg-red-600 hover:bg-red-700 text-white py-1.5 px-4 rounded-lg flex items-center space-x-1.5 transition uppercase tracking-wide cursor-pointer text-xs font-black shadow-md shadow-red-700/20"
              >
                <Printer className="h-4 w-4" />
                <span>Mulai Cetak</span>
              </button>

              <button
                id="print-modal-exit"
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-white text-xs py-1.5 px-3 border border-slate-800 rounded-lg"
              >
                Tutup Studio
              </button>
            </div>
          </div>

          {/* Printable Layout Sheet */}
          <div className="flex-1 bg-slate-800 flex items-center justify-center p-6 print:p-0 print:bg-white overflow-x-auto">
            
            {/* PRINT OPTION 1: CR80 PVC Standard layout dimensions in real world scale */}
            {printLayout === 'pvc' && singlePrintEmp && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 print:border-none p-6 bg-slate-900 rounded-2xl border border-slate-700 print:bg-white print:p-0">
                
                {/* ID Front */}
                <div id="print-pvc-front" className="print-card relative w-[241.2px] h-[352.8px] bg-white border border-slate-400 rounded-[12px] overflow-hidden flex flex-col justify-between shadow-2xl print:shadow-none shrink-0 print:m-0">
                  {/* Header */}
                  {cardTemplate === 'standard' ? (
                    <div className="bg-red-700 p-2 text-center text-white">
                      <h4 className="text-[9px] font-black tracking-tight leading-tight uppercase font-sans">PT. FORESYNDO GLOBAL INDONESIA</h4>
                    </div>
                  ) : cardTemplate === 'sales' ? (
                    <div className="bg-slate-100 border-b p-2 text-center text-slate-800 flex justify-between items-center px-3">
                      <span className="text-[8px] font-extrabold text-blue-900 leading-tight uppercase font-sans">PT. FORESYNDO<br/>GLOBAL INDONESIA</span>
                      <span className="text-[8px] uppercase bg-gradient-to-r from-indigo-500 to-indigo-800 text-white font-black px-1.5 py-0.5 rounded-full font-mono">SALES</span>
                    </div>
                  ) : (
                    <div className="bg-slate-950 p-2.5 text-center border-b-2 border-yellow-500 text-white">
                      <h4 className="text-[9px] font-black tracking-tight uppercase text-yellow-500">PT. FORESYNDO GLOBAL INDONESIA</h4>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-3 text-center flex-1 flex flex-col justify-center items-center space-y-1.5">
                    <img src={singlePrintEmp.photo} className="h-14 w-14 rounded-full object-cover border-2 border-slate-200" />
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase leading-none">{singlePrintEmp.name}</h3>
                      <span className="text-[8px] font-bold text-slate-500 uppercase mt-1 block">{singlePrintEmp.position}</span>
                    </div>

                    <div className="w-full bg-slate-50 border p-1 rounded text-[8px] space-y-0.5 text-slate-800">
                      <div className="flex justify-between px-1"><span>NIP (REG ID):</span><span className="font-mono font-bold">{singlePrintEmp.employeeId}</span></div>
                      <div className="flex justify-between px-1"><span>CABANG (REGION):</span><span className="font-bold">{singlePrintEmp.branch}</span></div>
                    </div>

                    <img src={getQRCodeUrl(singlePrintEmp.qrCode)} className="h-10 w-10 border rounded" referrerPolicy="no-referrer" />
                  </div>

                  {/* Footer */}
                  <div className="p-1.5 text-center text-[7px] border-t bg-slate-50 text-slate-500">
                    www.foresyndo.co.id | 021-990812-FGI
                  </div>
                </div>

                {/* ID Back */}
                <div id="print-pvc-back" style={cardBackStyle} className="print-card relative w-[241.2px] h-[352.8px] bg-slate-900 border border-slate-950 rounded-[12px] overflow-hidden flex flex-col justify-between text-white shadow-2xl print:shadow-none shrink-0 print:m-0">
                  <div className={`h-1.5 w-full ${cardTemplate === 'manager' ? 'bg-yellow-500' : 'bg-red-600'}`} />

                  <div className="p-4 text-center flex-1 flex flex-col justify-center items-center space-y-3.5">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">KARTU AKSES PREFRAL</p>
                    <div className="bg-white p-2 rounded">
                      <img src={getQRCodeUrl(singlePrintEmp.qrCode)} className="h-18 w-18 shrink-0" referrerPolicy="no-referrer" />
                    </div>
                    <div className="text-[8px] font-mono uppercase text-slate-300">
                      <p>Masa Berlaku: {singlePrintEmp.masaBerlaku || '12/2029'}</p>
                    </div>
                    <div className="w-full text-white/95">{generateBarcodeSVG(singlePrintEmp.barcode)}</div>
                  </div>

                  <div className="p-2 bg-slate-950 text-center text-[5.5px] text-slate-500 uppercase">
                    Milik PT. Foresyndo Global Indonesia. Harap kembalikan ke bagian HRD jika ditemukan.
                  </div>
                </div>

              </div>
            )}

            {/* PRINT OPTION 2: A4 Sheet for Bulk printing multiple cards on single sheet */}
            {printLayout === 'a4' && (
              <div className="bg-white p-[1.0cm] w-[21.0cm] h-[29.7cm] shadow-xl text-slate-900 flex flex-col justify-between font-sans print:shadow-none print:p-[0.5cm] select-none scale-90 md:scale-100">
                
                <div className="space-y-4">
                  
                  {/* Sheet Header indicator */}
                  <div className="border-b-2 pb-2 mb-4 flex items-center justify-between text-xs font-bold text-slate-500 print:hidden select-none">
                    <span>LEMBAR CETAK MASSAL PVC PEGAWAI (KERTAS A4 - POTRAIT)</span>
                    <span>Terdapat {bulkPrintIds.length} Kartu Terpilih</span>
                  </div>

                  {/* Cards Grid layout matching exactly A4 fit slots (3 columns, typically 3 or 4 rows of CR80) */}
                  <div className="grid grid-cols-2 gap-4">
                    
                    {employees.filter(e => bulkPrintIds.includes(e.id)).map((emp) => (
                      <div key={emp.id} className="border border-slate-300 p-2 rounded-xl flex items-center space-x-3 bg-slate-50 print:bg-white shrink-0">
                        
                        {/* Compact Front PVC print slot */}
                        <div className="relative w-[140px] h-[200px] bg-white border border-slate-400 rounded-lg overflow-hidden flex flex-col justify-between shrink-0">
                          <div className="bg-red-700 text-white text-[6px] py-1 text-center font-bold">PT. FORESYNDO GLOBAL INDONESIA</div>
                          <div className="p-1 flex flex-col items-center space-y-1 text-center">
                            <img src={emp.photo} className="h-8 w-8 rounded-full object-cover border" />
                            <h5 className="text-[8px] font-black leading-tight uppercase max-w-[130px] truncate">{emp.name}</h5>
                            <span className="text-[6.5px] text-slate-500 uppercase block">{emp.position}</span>
                            <span className="text-[6.5px] font-mono text-slate-400 block">ID: {emp.employeeId}</span>
                            <img src={getQRCodeUrl(emp.qrCode)} className="h-6 w-6" referrerPolicy="no-referrer" />
                          </div>
                          <div className="bg-slate-100 text-[5px] text-slate-500 py-0.5 text-center">www.foresyndo.co.id</div>
                        </div>

                        {/* Compact Back PVC print slot */}
                        <div style={cardBackStyle} className="relative w-[140px] h-[200px] bg-slate-900 border border-slate-950 rounded-lg overflow-hidden flex flex-col justify-between shrink-0 text-white">
                          <div className="h-1 w-full bg-red-600" />
                          <div className="p-2 text-center flex flex-col items-center space-y-1">
                            <span className="text-[6px] font-mono tracking-wider text-slate-400 block uppercase">KARTU AKSES PREFRAL</span>
                            <img src={getQRCodeUrl(emp.qrCode)} className="h-10 w-10 mt-1" referrerPolicy="no-referrer" />
                            <span className="text-[5.5px] font-mono text-slate-500 block">SERIAL: {emp.cardNumber}</span>
                          </div>
                          <div className="bg-slate-950 text-[4px] text-slate-500 text-center py-1 select-none">MILIK PT. FORESYNDO GLOBAL INDONESIA</div>
                        </div>

                      </div>
                    ))}

                  </div>

                </div>

                <div className="text-[10px] text-slate-400 border-t pt-2 mt-4 text-center leading-normal font-mono uppercase">
                  PT. Foresyndo Global Indonesia - Dokumen Sistem Rilis ID Card Otomatis Terverifikasi HRIS Cloud.
                </div>

              </div>
            )}

          </div>

          {/* Bottom helper */}
          <div className="bg-slate-950 px-6 py-3 border-t border-slate-900 text-center text-[10px] text-slate-400 font-mono uppercase select-none print:hidden">
            Tip: Untuk hasil terbaik pada kertas PVC Card, atur "Margins: None" dan nyalakan opsi "Background Graphics" pada setelan halaman cetak browser Anda.
          </div>

        </div>
      )}

      {/* 8. STYLE INJECTIONS FOR INTERACTIVE 3D EFFECTS & PORTRAIT PDF PRINTING OUTPUT */}
      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        @media print {
          /* Hide everything except the printable container block */
          body > *, #root, header, main, footer, .print\\:hidden, #employee-crud-modal, #digital-id-card-modal, #print-layout-modal {
            display: none !important;
            visibility: hidden !important;
          }
          /* Override browser layout for high resolution portrait PDF prints */
          @page {
            size: portrait;
            margin: 0;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .digital-id-print-area {
            display: flex !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            align-items: center !important;
            justify-content: center !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            gap: 40px !important;
          }
          .digital-id-print-area * {
            visibility: visible !important;
          }
        }
      `}} />

      {/* 9. MODAL: DYNAMIC / INTERACTIVE DIGITAL ID CARD & PDF EXPORTER */}
      {showDigitalIdModal && digitalIdEmployee && (
        <div id="digital-id-card-modal" className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto select-none print:hidden animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl relative flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-stretch">
            
            {/* Modal Exit */}
            <button
              id="btn-digital-id-close"
              onClick={() => setShowDigitalIdModal(false)}
              className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-full transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Left Column: Interactive 3D Card Display */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-5 py-4">
              
              <div className="text-center">
                <span className="text-[10px] text-red-550 text-red-500 uppercase font-black tracking-widest font-mono">ID Card Digital Indonesia</span>
                <h4 className="text-white text-base font-black mt-1">Interaktif 3D Card View</h4>
                <p className="text-slate-400 text-xs mt-0.5">Ketuk/klik kartu atau gunakan tombol di bawah untuk membalik kartu</p>
              </div>

              {/* 3D Flip Container */}
              <div 
                className="perspective-1000 w-[241.2px] h-[352.8px] cursor-pointer group"
                onClick={() => setDigitalCardFlipped(!digitalCardFlipped)}
              >
                <div className={`relative w-full h-full duration-700 transform-style-3d transition-transform ${digitalCardFlipped ? 'rotate-y-180' : ''}`}>
                  
                  {/* CARD FRONT SIDE */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rounded-[12px] overflow-hidden bg-white border border-slate-300 shadow-2xl flex flex-col justify-between">
                    
                    {/* Header custom styles */}
                    {digitalCardTemplate === 'standard' && (
                      <div className="bg-gradient-to-r from-red-650 to-red-800 bg-red-600 p-2.5 text-center text-white">
                        <h4 className="text-[9px] font-black tracking-tight leading-tight uppercase font-sans">PT. FORESYNDO GLOBAL INDONESIA</h4>
                        <span className="text-[7px] text-red-100 font-mono tracking-widest block uppercase mt-0.5">SaaS & HRIS Pro-Software</span>
                      </div>
                    )}
                    {digitalCardTemplate === 'sales' && (
                      <div className="bg-slate-100 border-b border-indigo-200 p-2 text-center text-slate-800 flex justify-between items-center px-4">
                        <span className="text-[8px] font-extrabold text-blue-900 tracking-tight leading-tight uppercase text-left">PT. FORESYNDO<br/>GLOBAL INDONESIA</span>
                        <span className="text-[7.5px] uppercase bg-gradient-to-r from-indigo-500 to-indigo-800 text-white font-black px-1.5 py-0.5 rounded-full font-mono scale-95 origin-right">
                          SALES
                        </span>
                      </div>
                    )}
                    {digitalCardTemplate === 'manager' && (
                      <div className="bg-slate-950 p-2.5 text-center border-b-2 border-yellow-500 text-white">
                        <h4 className="text-[9px] font-black tracking-tight leading-tight uppercase font-sans text-yellow-500">PT. FORESYNDO GLOBAL INDONESIA</h4>
                        <span className="text-[7px] text-yellow-105 text-yellow-100 font-serif tracking-widest block uppercase mt-0.5">EXECUTIVE SUITE LEAGUE</span>
                      </div>
                    )}

                    {/* Content area */}
                    <div className="p-3 text-center flex-1 flex flex-col justify-center items-center space-y-1.5">
                      
                      <div className="relative">
                        <div className={`p-0.5 rounded-full overflow-hidden ${digitalCardTemplate === 'manager' ? 'bg-yellow-500' : digitalCardTemplate === 'sales' ? 'bg-indigo-500' : 'bg-red-600'}`}>
                          <img src={digitalIdEmployee.photo} alt="Digital Front avatar" className="h-16 w-16 rounded-full object-cover border-2 border-white" />
                        </div>
                        <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                      </div>

                      <div>
                        <h3 className="text-xs font-black text-slate-900 leading-normal uppercase">{digitalIdEmployee.name}</h3>
                        <span className={`text-[8px] font-bold px-2.5 py-0.5 rounded-full inline-block mt-0.5 ${
                          digitalCardTemplate === 'manager' ? 'bg-yellow-500/10 text-yellow-800 border border-yellow-250/50' : digitalCardTemplate === 'sales' ? 'bg-indigo-50 text-indigo-800 border' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {digitalIdEmployee.position}
                        </span>
                      </div>

                      <div className="w-full bg-slate-50 border p-1 rounded text-[8px] space-y-0.5 leading-normal text-slate-800">
                        <div className="flex justify-between px-1">
                          <span className="text-slate-400 font-mono">REG ID (NIP):</span>
                          <span className="font-bold text-slate-900 font-mono">{digitalIdEmployee.employeeId}</span>
                        </div>
                        <div className="flex justify-between px-1">
                          <span className="text-slate-400 font-mono">CABANG (REGION):</span>
                          <span className="font-semibold text-slate-900">{digitalIdEmployee.branch}</span>
                        </div>
                        <div className="flex justify-between px-1">
                          <span className="text-slate-400 font-mono">STATUS KERJA:</span>
                          <span className="font-extrabold text-emerald-600 font-sans">AKTIF</span>
                        </div>
                      </div>

                      {/* Small dynamic validation QR */}
                      <div className="flex items-center justify-center p-1 border rounded bg-white mt-1">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrSecurityToken)}`} 
                          alt="Dynamic SECURE Token QR" 
                          className="h-10 w-10 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                    </div>

                    {/* Card front bottom footer */}
                    <div className={`p-1.5 text-center text-[7px] border-t ${
                      digitalCardTemplate === 'manager' ? 'bg-slate-950 border-slate-900 text-yellow-100/60' : 'bg-slate-50 border-slate-150 text-slate-500'
                    }`}>
                      <span>Official Web: www.foresyndo.co.id</span>
                    </div>

                  </div>

                  {/* CARD BACK SIDE */}
                  <div style={cardBackStyle} className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[12px] overflow-hidden bg-slate-900 border border-slate-950 shadow-2xl flex flex-col justify-between text-white text-center">
                    
                    <div className={`h-1.5 w-full ${digitalCardTemplate === 'manager' ? 'bg-yellow-500' : digitalCardTemplate === 'sales' ? 'bg-blue-500' : 'bg-red-600'}`} />

                    <div className="p-4 text-center flex-1 flex flex-col justify-center items-center space-y-3.5 text-white">
                      <div>
                        <p className={`text-[8px] font-bold uppercase tracking-widest ${digitalCardTemplate === 'manager' ? 'text-yellow-500' : 'text-slate-400'}`}>KARTU AKSES PREFRAL</p>
                        <span className="text-[6px] text-slate-505 text-slate-400 uppercase block font-mono mt-0.5">HRIS SECURITY VERIFIED</span>
                      </div>

                      {/* Rotating high-res QR Container */}
                      <div className="bg-white p-2 text-slate-900 rounded-lg border border-slate-700 shadow-md">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrSecurityToken)}`} 
                          alt="Back validation QR" 
                          className="h-18 w-18 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="text-[8px] font-mono leading-relaxed space-y-0.5 border-t border-b border-slate-800 py-1.5 w-full text-slate-300">
                        <p>MASA BERLAKU: {digitalIdEmployee.masaBerlaku || '12/2029'}</p>
                        <p className="text-emerald-400 font-extrabold flex items-center justify-center gap-1">
                          <CheckCircle className="h-2 w-2 text-emerald-400" /> STATUS AKTIF
                        </p>
                      </div>

                      <div className="w-full text-slate-300">
                        {generateBarcodeSVG(digitalIdEmployee.barcode)}
                        <span className="text-[6px] text-slate-500 block font-mono mt-1">SERIAL NUMBER: {digitalIdEmployee.cardNumber}</span>
                      </div>

                    </div>

                    <div className="p-2 bg-slate-950 border-t border-slate-800 text-center text-[5.5px] text-slate-500 leading-snug uppercase">
                      Sah milik PT. Foresyndo Global Indonesia.
                    </div>

                  </div>

                </div>
              </div>

              {/* Balik Button */}
              <button
                id="btn-digital-id-flip-card"
                onClick={() => setDigitalCardFlipped(!digitalCardFlipped)}
                className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white text-xs font-black py-2 px-5 rounded-xl flex items-center space-x-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 rounded animate-spin-slow text-red-500" />
                <span>Balik Sisi Kartu</span>
              </button>

            </div>

            {/* Right Column: Metas, QR Token Status, and PDF print actions */}
            <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-800 md:pl-8 flex flex-col justify-between space-y-6 py-2">
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] rounded font-bold border border-emerald-550/30">SERVER OK</span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">DIGITAL BADGE</span>
                  </div>
                  <h3 className="text-white text-lg font-black uppercase mt-1">Katalog ID Digital Pegawai</h3>
                  <p className="text-slate-400 text-xs font-normal">Identitas digital instan terintegrasi dengan logger biometrik kehadiran FGI.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs leading-tight font-normal">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block mb-1">NIP (REG ID)</span>
                    <span className="text-white font-extrabold font-mono text-xs">{digitalIdEmployee.employeeId}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block mb-1">NAMA LENGKAP</span>
                    <span className="text-white font-black text-xs block truncate" title={digitalIdEmployee.name}>{digitalIdEmployee.name}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block mb-1">PANGKAT JABATAN</span>
                    <span className="text-white font-bold text-xs">{digitalIdEmployee.position}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block mb-1">WILAYAH BEKERJA</span>
                    <span className="text-white font-semibold text-xs">{digitalIdEmployee.branch} Region</span>
                  </div>
                </div>

                {/* Secure Rolling Token Visualizer */}
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-red-500 font-black flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-600 animate-ping inline-block" />
                      Dynamic secure-token QR:
                    </span>
                    <span className="text-slate-400 font-mono text-[9px] uppercase">Auto-Refresh (3s)</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-2 text-[9px] font-mono text-slate-300 break-all leading-normal select-text selection:bg-red-650/40">
                    {qrSecurityToken}
                  </div>
                  <p className="text-[9.5px] text-slate-400 font-normal leading-relaxed">
                    Kode QR di atas memiliki pengaman otentikasi liveness terenkripsi yang terus diperbarui. Hal ini menjamin keamanan log dan mencegah kecurangan presensi pegawai FGI.
                  </p>
                </div>

                {/* Quick select template */}
                <div className="space-y-1 text-xs select-none">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Modifikasi Tampilan Layout</label>
                  <div className="grid grid-cols-3 gap-1 px-0.5">
                    <button
                      id="dig-btn-standard"
                      onClick={() => setDigitalCardTemplate('standard')}
                      className={`text-[9.5px] py-1 px-1.5 rounded-lg border font-bold text-center transition ${digitalCardTemplate === 'standard' ? 'bg-slate-800 border-slate-500 text-white' : 'border-slate-800 hover:bg-slate-850 text-slate-400'}`}
                    >
                      Standard
                    </button>
                    <button
                      id="dig-btn-sales"
                      onClick={() => setDigitalCardTemplate('sales')}
                      className={`text-[9.5px] py-1 px-1.5 rounded-lg border font-bold text-center transition ${digitalCardTemplate === 'sales' ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-800 hover:bg-slate-850 text-slate-400'}`}
                      disabled={digitalIdEmployee.position !== 'Sales Executive' && digitalIdEmployee.position !== 'Sales Manager'}
                    >
                      Corporate Sales
                    </button>
                    <button
                      id="dig-btn-manager"
                      onClick={() => setDigitalCardTemplate('manager')}
                      className={`text-[9.5px] py-1 px-1.5 rounded-lg border font-bold text-center transition ${digitalCardTemplate === 'manager' ? 'bg-yellow-600 border-yellow-500 text-white' : 'border-slate-800 hover:bg-slate-850 text-slate-400'}`}
                      disabled={!digitalIdEmployee.position.toLowerCase().includes('manager') && digitalIdEmployee.position !== 'Direktur'}
                    >
                      Executive Suite
                    </button>
                  </div>
                </div>

              </div>

              {/* Modal footer print action */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
                <button
                  id="btn-digital-id-print"
                  onClick={() => {
                    onAddNotification('Export PDF Berhasil', `Halaman PDF kartu pegawai ${digitalIdEmployee.name} siap dicetak.`, 'success');
                    window.print();
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center space-x-1.5 transition-all text-center uppercase tracking-wider cursor-pointer shadow-lg shadow-red-700/20 active:scale-95"
                >
                  <Printer className="h-4 w-4 text-white" />
                  <span>Cetak ke PDF / Print</span>
                </button>
                <button
                  id="btn-digital-id-modal-cancel"
                  onClick={() => setShowDigitalIdModal(false)}
                  className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-black text-xs py-3 px-5 rounded-xl transition cursor-pointer"
                >
                  Tutup Portal
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 10. HIDDEN PRINT AREA FOR PDF PRINTS ON WINDOW.PRINT() */}
      {digitalIdEmployee && (
        <div className="digital-id-print-area hidden print:flex flex-row items-center justify-center gap-12 p-30 bg-white text-black h-screen w-screen absolute left-0 top-0">
          
          {/* Printable Front Side preview */}
          <div className="relative w-[241.2px] h-[352.8px] border border-slate-400 rounded-2xl overflow-hidden flex flex-col justify-between shrink-0 bg-white shadow-none">
            {digitalCardTemplate === 'standard' && (
              <div className="bg-red-700 text-white p-2.5 text-center">
                <h4 className="text-[9px] font-black tracking-tight leading-tight uppercase font-sans">PT. FORESYNDO GLOBAL INDONESIA</h4>
                <p className="text-[6.5px] tracking-wider font-mono">SaaS & HRIS Pro-Software</p>
              </div>
            )}
            {digitalCardTemplate === 'sales' && (
              <div className="bg-slate-100 border-b border-indigo-250 p-2 text-center flex justify-between items-center px-4">
                <span className="text-[8px] font-extrabold text-blue-900 leading-tight uppercase font-sans text-left">PT. FORESYNDO<br/>GLOBAL INDONESIA</span>
                <span className="text-[7.5px] uppercase bg-gradient-to-r from-indigo-500 to-indigo-800 text-white font-black px-2 py-0.5 rounded-full font-mono">SALES</span>
              </div>
            )}
            {digitalCardTemplate === 'manager' && (
              <div className="bg-slate-950 p-2.5 text-center border-b border-yellow-500 text-white">
                <h4 className="text-[9px] font-black tracking-tight uppercase text-yellow-500">PT. FORESYNDO GLOBAL INDONESIA</h4>
                <p className="text-[6.5px] text-yellow-101 text-yellow-100 tracking-wider">EXECUTIVE SUITE LEAGUE</p>
              </div>
            )}

            <div className="p-3 flex-1 flex flex-col justify-center items-center space-y-1.5 text-center">
              <img src={digitalIdEmployee.photo} className="h-14 w-14 rounded-full object-cover border-2 border-slate-200" />
              <div>
                <h3 className="text-xs font-black text-slate-900 leading-none uppercase">{digitalIdEmployee.name}</h3>
                <span className="text-[8.5px] font-bold text-slate-500 uppercase mt-1 block">{digitalIdEmployee.position}</span>
              </div>
              <div className="w-full bg-slate-50 border p-1 rounded text-[8px] space-y-0.5 leading-normal text-slate-850">
                <div className="flex justify-between px-1"><span>REG ID (NIP):</span><span className="font-mono font-bold">{digitalIdEmployee.employeeId}</span></div>
                <div className="flex justify-between px-1"><span>CABANG (REGION):</span><span className="font-semibold">{digitalIdEmployee.branch}</span></div>
              </div>
              <div className="p-1 border rounded bg-white">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrSecurityToken)}`} className="h-10 w-10 shrink-0" referrerPolicy="no-referrer" />
              </div>
            </div>

            <div className="p-1.5 border-t text-[7.5px] text-center text-slate-500 bg-slate-50">
              www.foresyndo.co.id
            </div>
          </div>

          {/* Printable Back Side preview */}
          <div style={cardBackStyle} className="relative w-[241.2px] h-[352.8px] border border-slate-950 rounded-2xl overflow-hidden flex flex-col justify-between shrink-0 bg-slate-900 text-white text-center shadow-none">
            <div className={`h-1.5 w-full ${digitalCardTemplate === 'manager' ? 'bg-yellow-500' : 'bg-red-650'}`} />

            <div className="p-4 text-center flex-1 flex flex-col justify-center items-center space-y-3.5">
              <div>
                <p className={`text-[8.5px] font-bold uppercase tracking-widest ${digitalCardTemplate === 'manager' ? 'text-yellow-500' : 'text-slate-400'}`}>KARTU AKSES PREFRAL</p>
                <span className="text-[6.5px] text-slate-500 uppercase block font-mono mt-0.5">HRIS SYSTEM SECURITY PRO</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border-2 border-slate-700">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrSecurityToken)}`} className="h-18 w-18 shrink-0" referrerPolicy="no-referrer" />
              </div>

              <div className="text-[8.5px] font-mono leading-relaxed space-y-0.5 border-t border-b border-slate-800 py-2 w-full text-slate-300">
                <p>MASA BERLAKU: {digitalIdEmployee.masaBerlaku || '12/2029'}</p>
                <p className="text-[7.5px] text-emerald-400 font-extrabold block">STATUS: AKTIF TERVERIFIKASI</p>
              </div>

              <div className="w-full text-slate-300">
                {generateBarcodeSVG(digitalIdEmployee.barcode)}
                <span className="text-[6px] text-slate-500 block font-mono mt-1">CARD SERIAL: {digitalIdEmployee.cardNumber}</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950 text-[5.5px] text-slate-550 block font-sans text-slate-500 uppercase leading-normal">
              MILIK PT. FORESYNDO GLOBAL INDONESIA. HARAP KEMBALIKAN KE BAGIAN HRD JIKA DITEMUKAN.
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
