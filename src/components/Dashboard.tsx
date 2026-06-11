/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  UserPlus, 
  CreditCard, 
  TrendingUp, 
  Percent, 
  Award,
  DollarSign,
  AlertTriangle,
  Play,
  Calendar,
  ShieldAlert,
  ArrowUpRight,
  TrendingDown,
  Building2,
  Clock,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Customer, Invoice, ServicePackage, SalesRepresentative, UserRole } from '../types';

interface DashboardProps {
  customers: Customer[];
  invoices: Invoice[];
  sales: SalesRepresentative[];
  packages: ServicePackage[];
  activeRole: UserRole;
  selectedCabang: string;
  selectedPerusahaan: string;
  generateInvoices: () => void;
}

export default function Dashboard({
  customers,
  invoices,
  sales,
  packages,
  activeRole,
  selectedCabang,
  selectedPerusahaan,
  generateInvoices
}: DashboardProps) {
  
  // Demo Sales User ID is sales-1 (Andi Wijaya)
  const currentSalesId = 'sales-1';

  // Live ticking clock in Indonesian WIB style
  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      
      const dayName = days[now.getDay()];
      const day = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();
      
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      setTimeStr(`${dayName}, ${day} ${monthName} ${year} • ${hours}:${minutes}:${seconds} WIB`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 1. Context Filtering
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      // Role-based security bounds
      if (activeRole === 'Sales' && c.salesId !== currentSalesId) return false;

      // Dropdown Context
      const matchCabang = selectedCabang === 'Semua Cabang' || c.cabang === selectedCabang;
      const matchPerusahaan = selectedPerusahaan === 'Semua Perusahaan' || c.perusahaan === selectedPerusahaan;
      return matchCabang && matchPerusahaan;
    });
  }, [customers, activeRole, selectedCabang, selectedPerusahaan]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Find related customer to verify branch & company context
      const cust = customers.find(c => c.id === inv.customerId);
      if (!cust) return false;

      if (activeRole === 'Sales' && cust.salesId !== currentSalesId) return false;

      const matchCabang = selectedCabang === 'Semua Cabang' || cust.cabang === selectedCabang;
      const matchPerusahaan = selectedPerusahaan === 'Semua Perusahaan' || cust.perusahaan === selectedPerusahaan;
      return matchCabang && matchPerusahaan;
    });
  }, [invoices, customers, activeRole, selectedCabang, selectedPerusahaan]);

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      if (activeRole === 'Sales' && s.id !== currentSalesId) return false;
      return selectedCabang === 'Semua Cabang' || s.cabang === selectedCabang;
    });
  }, [sales, activeRole, selectedCabang]);

  // 2. Calculations
  const stats = useMemo(() => {
    const total = filteredCustomers.length;
    const active = filteredCustomers.filter(c => c.status === 'Aktif').length;
    const inactive = filteredCustomers.filter(c => c.status === 'Nonaktif').length;
    
    // New Customers this month (June 2026 and May 2026 are "new" in our current time)
    const newThisMonth = filteredCustomers.filter(c => {
      return c.createdAt.includes('2026-06') || c.createdAt.includes('2026-05');
    }).length;

    // Billing metrics
    const unpaidInvoices = filteredInvoices.filter(i => i.status === 'Belum Bayar' || i.status === 'Terlambat');
    const runningBill = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    // Total paid revenue
    const paidInvoices = filteredInvoices.filter(i => i.status === 'Lunas');
    const totalCollected = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    // Commission Metrics for Sales
    let totalSalesCommission = 0;
    if (activeRole === 'Sales') {
      const mySalesInfo = sales.find(s => s.id === currentSalesId);
      totalSalesCommission = mySalesInfo ? mySalesInfo.totalCommissionEarned : 0;
    } else {
      // Sum of all sales commissions
      totalSalesCommission = sales.reduce((sum, s) => sum + s.totalCommissionEarned, 0);
    }

    return {
      total,
      active,
      inactive,
      newThisMonth,
      runningBill,
      totalCollected,
      totalSalesCommission
    };
  }, [filteredCustomers, filteredInvoices, sales, activeRole]);

  // 3. Package Stat density details
  const packageStats = useMemo(() => {
    const counts: { [name: string]: { count: number; value: number } } = {};
    filteredCustomers.forEach(c => {
      const name = c.packageName || 'Lainnya';
      if (!counts[name]) counts[name] = { count: 0, value: 0 };
      counts[name].count += 1;
      counts[name].value += c.price;
    });

    const COLORS = ['#EF4444', '#EC4899', '#6366F1', '#10B981', '#8B5CF6', '#F59E0B'];
    return Object.keys(counts).map((name, index) => ({
      name,
      count: counts[name].count,
      revenue: counts[name].value,
      color: COLORS[index % COLORS.length]
    }));
  }, [filteredCustomers]);

  // 4. Growth Chart over historic registration dates (Pre-aggregated for visualization beauty)
  const growthData = [
    { name: 'Jan 26', Pelanggan: 1, Pendapatan: 150000 },
    { name: 'Feb 26', Pelanggan: 2, Pendapatan: 400000 },
    { name: 'Mar 26', Pelanggan: 4, Pendapatan: 1000000 },
    { name: 'Apr 26', Pelanggan: 4, Pendapatan: 1000000 },
    { name: 'Mei 26', Pelanggan: 7, Pendapatan: 1950000 },
    { name: 'Jun 26 (Kini)', Pelanggan: 10, Pendapatan: 2650000 },
  ];

  // Map to correct filtered numbers if everything is filtered down
  const adjustedGrowthData = useMemo(() => {
    if (filteredCustomers.length === 0) {
      return growthData.map(g => ({ ...g, Pelanggan: 0, Pendapatan: 0 }));
    }
    const ratio = filteredCustomers.length / 10;
    return growthData.map((g, idx) => {
      const val = Math.max(1, Math.round(g.Pelanggan * ratio));
      return {
        ...g,
        Pelanggan: idx === growthData.length - 1 ? filteredCustomers.length : val,
        Pendapatan: idx === growthData.length - 1 ? stats.totalCollected : Math.round(g.Pendapatan * ratio)
      };
    });
  }, [filteredCustomers, stats.totalCollected]);

  // 5. Invoicing Status Data for BarChart (Lunas vs Belum Bayar vs Terlambat)
  const invoiceStatusData = useMemo(() => {
    const lunas = filteredInvoices.filter(i => i.status === 'Lunas').length;
    const belumBayar = filteredInvoices.filter(i => i.status === 'Belum Bayar').length;
    const terlambat = filteredInvoices.filter(i => i.status === 'Terlambat').length;

    return [
      { name: 'Lunas', Jumlah: lunas, Nominal: filteredInvoices.filter(i => i.status === 'Lunas').reduce((s, i) => s + i.amount, 0) / 1000 },
      { name: 'Belum Bayar', Jumlah: belumBayar, Nominal: filteredInvoices.filter(i => i.status === 'Belum Bayar').reduce((s, i) => s + i.amount, 0) / 1000 },
      { name: 'Terlambat', Jumlah: terlambat, Nominal: filteredInvoices.filter(i => i.status === 'Terlambat').reduce((s, i) => s + i.amount, 0) / 1000 },
    ];
  }, [filteredInvoices]);

  const rupiahFormat = (val: number) => {
    return 'Rp' + val.toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Live Clock Banner - Deep Premium Tech Style */}
      <div 
        id="dashboard-gold-header" 
        className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-950/20 border border-slate-850 select-none"
      >
        {/* Subtle decorative circles for grid layout feel */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-indigo-650 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-red-650 to-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm shadow-red-600/20">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span>Enterprise Portal</span>
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
              <span className="text-xs text-slate-400 font-mono tracking-tight flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                <span>{selectedCabang} • {selectedPerusahaan}</span>
              </span>
            </div>

            <h1 className="text-2xl md:text-3.5xl font-black text-white tracking-tight leading-none mt-1">
              Dasbor Manajemen Utama
            </h1>
            <p className="text-slate-400 text-xs md:text-sm max-w-xl font-normal leading-relaxed">
              Pantau matrik keaktifan pelanggan, status tagihan, serta evaluasi operasional keagenan. Otorisasi akun Anda: <strong className="text-red-500 font-bold">{activeRole}</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-3.5 shrink-0">
            {/* Live Indonesian WIB Clock Wrapper */}
            <div className="flex items-center space-x-2.5 bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl text-emerald-400 shadow-inner">
              <Clock className="h-4 w-4 animate-spin-slow shrink-0 text-emerald-400" />
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block font-mono">Waktu Sistem Terenkripsi</span>
                <span className="font-mono text-xs font-black tracking-wide block">{timeStr || 'Memuat waktu...'}</span>
              </div>
            </div>

            {/* Quick Simulate Button */}
            {activeRole !== 'Sales' && (
              <button
                id="btn-simulate-invoices-dashboard"
                onClick={generateInvoices}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-95 text-white font-black text-xs px-5 py-3 rounded-xl shadow-md shadow-red-600/20 border border-red-500/20 transition-all cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Simulasikan Tagihan Bulanan</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics Grid - Elegantly styled as Premium Glass Bento Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Pelanggan */}
        <div className="group relative bg-white p-5 rounded-2xl border border-slate-200/85 hover:border-red-300 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-5 translate-y-5 opacity-5 group-hover:scale-125 group-hover:opacity-10 transition-all duration-500">
            <Users className="h-28 w-28 text-red-650" />
          </div>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Total Pelanggan</span>
              <span className="text-3.5xl font-black text-slate-900 block leading-none tracking-tight">
                {stats.total}
              </span>
              <span className="text-[9.5px] text-slate-500 font-medium block pt-1.5">
                Konfigurasi filter aktif
              </span>
            </div>
            <div className="bg-red-50 border border-red-100 p-3 rounded-2xl text-red-650 shrink-0 group-hover:bg-red-500 group-hover:text-white transition duration-300 shadow-sm">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Card 2: Pelanggan Aktif */}
        <div className="group relative bg-white p-5 rounded-2xl border border-slate-200/85 hover:border-emerald-300 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-5 translate-y-5 opacity-5 group-hover:scale-125 group-hover:opacity-10 transition-all duration-500">
            <UserCheck className="h-28 w-28 text-emerald-500" />
          </div>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Pelanggan Aktif</span>
              <span className="text-3.5xl font-black text-emerald-600 block leading-none tracking-tight">
                {stats.active}
              </span>
              <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 py-0.5 px-2 rounded-full mt-2">
                <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                <span>{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% Rasio Aktif</span>
              </span>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl text-emerald-600 shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition duration-300 shadow-sm">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Card 3: Piutang Berjalan */}
        <div className="group relative bg-white p-5 rounded-2xl border border-slate-200/85 hover:border-amber-300 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-5 translate-y-5 opacity-5 group-hover:scale-125 group-hover:opacity-10 transition-all duration-500">
            <CreditCard className="h-28 w-28 text-amber-500" />
          </div>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">Sisa Piutang</span>
              <span className="text-2xl font-black text-amber-600 block leading-tight tracking-tight mt-1">
                {rupiahFormat(stats.runningBill)}
              </span>
              <span className="inline-flex items-center space-x-1 text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-100 py-0.5 px-2 rounded-full mt-2">
                <span>{filteredInvoices.filter(i => i.status !== 'Lunas').length} Invoice Menunggu</span>
              </span>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl text-amber-600 shrink-0 group-hover:bg-amber-500 group-hover:text-white transition duration-300 shadow-sm">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Card 4: Total Pendapatan / Komisi */}
        <div className="group relative bg-white p-5 rounded-2xl border border-slate-200/85 hover:border-indigo-300 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-5 translate-y-5 opacity-5 group-hover:scale-125 group-hover:opacity-10 transition-all duration-500">
            <DollarSign className="h-28 w-28 text-indigo-505" />
          </div>
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">
                {activeRole === 'Sales' ? 'Total Komisi' : 'Pendapatan Bersih'}
              </span>
              <span className="text-2xl font-black text-indigo-600 block leading-tight tracking-tight mt-1">
                {rupiahFormat(activeRole === 'Sales' ? stats.totalSalesCommission : stats.totalCollected)}
              </span>
              <span className="inline-flex items-center space-x-1 text-[10px] text-indigo-700 font-bold bg-indigo-50 border border-indigo-150 py-0.5 px-2 rounded-full mt-2">
                <span>{activeRole === 'Sales' ? 'Insentif Cair' : `Siklus Tagihan Berlangsung`}</span>
              </span>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition duration-300 shadow-sm">
              {activeRole === 'Sales' ? <Award className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
            </div>
          </div>
        </div>

      </div>

      {/* 3. Secondary KPI/Notices Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-none">
        
        <div className="bg-gradient-to-r from-red-50 to-white border border-red-100/70 rounded-2xl p-4 flex items-center space-x-4 hover:shadow-sm transition">
          <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center text-red-650 shrink-0">
            <UserPlus className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-red-900 font-mono">Pelanggan Baru</h4>
            <p className="text-xs text-slate-600 font-medium">Sistem mencatat <strong className="text-slate-900 font-bold">{stats.newThisMonth} pelanggan baru</strong> pada bulan ini.</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-white border border-orange-100/70 rounded-2xl p-4 flex items-center space-x-4 hover:shadow-sm transition">
          <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-655 text-orange-600 shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-orange-950 font-mono">Arsip Menunggak</h4>
            <p className="text-xs text-slate-600 font-medium">Ada <strong className="text-slate-900 font-bold">{filteredCustomers.filter(c => c.paymentStatus === 'Terlambat').length} kontrak terlambat</strong> butuh follow-up.</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-white border border-emerald-100/70 rounded-2xl p-4 flex items-center space-x-4 hover:shadow-sm transition">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-900 font-mono">Rasio Efisiensi</h4>
            <p className="text-xs text-slate-600 font-medium">Kolektibilitas tagihan berhasil mencapai: <strong className="text-slate-900 font-bold">{filteredInvoices.length > 0 ? Math.round((filteredInvoices.filter(i => i.status === 'Lunas').length / filteredInvoices.length) * 100) : 0}%</strong></p>
          </div>
        </div>

      </div>

      {/* 4. Charts Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Growth Chart Area */}
        <div className="bg-white p-5 rounded-3xl border border-slate-205 border-slate-200/85 shadow-sm lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 select-none">
            <div>
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight">Tren Registrasi & Keuangan</h3>
              <p className="text-[11px] text-slate-500">Histori pertumbuhan jumlah pelanggan kumulatif & pendapatan terbayar.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 p-0.5 rounded-xl flex text-[10px] font-black uppercase">
              <span className="bg-white text-slate-900 px-3 py-1.5 rounded-lg shadow-sm border border-slate-200">Realisasi</span>
              <span className="text-slate-400 px-3 py-1.5 rounded-lg cursor-not-allowed">Proyeksi</span>
            </div>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={adjustedGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCust" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} className="font-mono" />
                <YAxis yAxisId="left" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `Rp${v/1000}k`} />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'Pendapatan') return [rupiahFormat(Number(value)), 'Pendapatan Terbayar'];
                    return [value, 'Total Pelanggan'];
                  }}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '14px', color: '#FFF', fontSize: '11px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="Pelanggan" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCust)" />
                <Area yAxisId="right" type="monotone" dataKey="Pendapatan" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Legend iconType="circle" iconSize={8} className="text-xs font-semibold" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Package Stat Box */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/85 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1.5 select-none">
              <Layers className="h-4 w-4 text-slate-505 text-slate-500" />
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight">Dominasi Paket Layanan</h3>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">Breakdown keanggotaan pelanggan berdasarkan paket langganan saat ini.</p>
            
            {packageStats.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">Belum ada statistik paket layan terpilih.</div>
            ) : (
              <div className="h-44 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={packageStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {packageStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} Pelanggan`, 'Kuantitas']} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Visual Label inside middle of donut */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none select-none">
                  <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest block font-mono">Aktif</span>
                  <span className="text-2.5xl font-black text-slate-900 block leading-tight font-mono">{stats.active}</span>
                </div>
              </div>
            )}
          </div>

          {/* Table Breakdown of Packages for Premium look */}
          <div className="space-y-2 mt-4 overflow-y-auto max-h-32 pr-1 divide-y divide-slate-100">
            {packageStats.map((pkg) => (
              <div key={pkg.name} className="flex items-center justify-between text-xs pt-2">
                <div className="flex items-center space-x-2 truncate">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: pkg.color }} />
                  <span className="font-extrabold text-slate-700 truncate max-w-[120px]">{pkg.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-900 block">{pkg.count} Pelanggan</span>
                  <span className="text-[10px] text-slate-400 block font-mono">{rupiahFormat(pkg.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Invoicing Performance (BarChart) & Sales agent targets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Invoice Performance Area */}
        <div className="bg-white p-5 rounded-3xl border border-slate-205 border-slate-200/85 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight">Kategori Invoice Jaringan</h3>
            <p className="text-[11px] text-slate-500 mb-4 font-normal">Representasi nominal tagihan diposisikan dalam ribuan rupiah (k).</p>
            
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={invoiceStatusData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F7" />
                  <XAxis dataKey="name" fontSize={10} stroke="#94A3B8" tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} stroke="#94A3B8" tickLine={false} axisLine={false} />
                  <Tooltip 
                    formatter={(v, name) => [name === 'Nominal' ? `${v}k` : v, name]}
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#FFF' }}
                  />
                  <Bar dataKey="Nominal" fill="#EF4444" radius={[6, 6, 0, 0]}>
                    {invoiceStatusData.map((entry, index) => {
                      const colors = ['#10B981', '#F59E0B', '#EF4444'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 mt-4 select-none">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Target Collection Bulan Ini:</span>
              <span className="font-black text-slate-900 font-mono">{rupiahFormat(stats.runningBill + stats.totalCollected)}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${stats.runningBill + stats.totalCollected > 0 ? (stats.totalCollected / (stats.runningBill + stats.totalCollected)) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sales Representatives Board */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/85 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight">Kinerja & Pencapaian Agen Sales</h3>
            <p className="text-[11px] text-slate-500 mb-4">Total pencapaian omset dibanding target bulanan, komisi, dan jumlah pendaftaran kontrak.</p>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {filteredSales.map((rep) => {
                const currentSalesRevenue = rep.totalCustomers * 250000; // Expected package value Rp250k
                const targetRatio = Math.min(100, Math.round((currentSalesRevenue / rep.targetSales) * 100));

                return (
                  <div key={rep.id} className="border border-slate-150 border-slate-200/80 rounded-2xl p-3.5 hover:border-red-200/80 transition duration-150">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 text-xs">
                      <div>
                        <h4 className="font-black text-slate-900 text-sm flex items-center space-x-1.5 select-none">
                          <span>{rep.name}</span>
                          <span className="text-[9px] font-bold font-mono bg-red-50 text-red-650 border border-red-100/70 py-0.5 px-2 rounded-full">
                            {rep.cabang}
                          </span>
                        </h4>
                        <span className="text-slate-400 text-[10px] font-mono block mt-0.5">{rep.email} • {rep.phone}</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-black text-slate-900 font-mono">Komisi: {rupiahFormat(rep.totalCommissionEarned)}</span>
                        <span className="block text-[10px] font-bold text-emerald-600">Pelanggan: {rep.totalCustomers} orang</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar of Target */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 select-none">
                        <span>Pencapaian: {rupiahFormat(currentSalesRevenue)} / Target {rupiahFormat(rep.targetSales)}</span>
                        <span className="text-red-600 font-mono font-black">{targetRatio}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            targetRatio >= 100 ? 'bg-emerald-500' : targetRatio >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${targetRatio}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredSales.length === 0 && (
                <div colSpan={2} className="py-12 text-center text-slate-400 text-xs">Tidak ada perwakilan sales terdaftar pada segmentasi filter saat ini.</div>
              )}
            </div>
          </div>

          <div className="bg-red-50 border border-red-100/70 p-3 rounded-xl flex items-center justify-between text-xs text-red-900 font-extrabold mt-4 select-none">
            <span>Sistem Komisi Keagenan:</span>
            <span className="text-[9px] font-black uppercase bg-white border border-red-200/80 py-1 px-2.5 rounded-lg text-red-700 font-mono">
              Komisi = Harga Paket × Komisi % (Pembayaran Terverifikasi)
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
