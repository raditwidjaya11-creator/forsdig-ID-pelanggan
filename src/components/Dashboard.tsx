/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
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
  Play
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

    const COLORS = ['#DC2626', '#EA580C', '#2563EB', '#16A34A', '#9333EA', '#D97706'];
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
      
      {/* Title & Banner Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm shadow-red-900/5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-xs tracking-wider text-red-600 bg-red-50 py-1 px-2.5 rounded-full uppercase">SaaS Portal</span>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-500 font-mono">Lokasi: {selectedCabang} • {selectedPerusahaan}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
            Dashboard Utama
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Selamat datang kembali. Anda masuk dengan otorisasi <strong className="text-red-600">{activeRole}</strong>.
          </p>
        </div>

        {/* Action Quick Tools for Admins */}
        {activeRole !== 'Sales' && (
          <div className="flex items-center space-x-2 self-start md:self-center">
            <button
              id="dash-generate-invoices"
              onClick={generateInvoices}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-red-600/10 transition cursor-pointer"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Simulasikan Tagihan Bulanan</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Pelanggan */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group overflow-hidden relative">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:scale-110 duration-500">
            <Users className="h-28 w-28 text-red-600" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Total Pelanggan</span>
            <span className="text-3xl font-black text-gray-950 block tracking-tight">
              {stats.total}
            </span>
            <span className="text-[10px] text-gray-500 font-medium block">
              Filter Cabang & Company aktif
            </span>
          </div>
          <div className="bg-red-50 p-3 rounded-2xl text-red-600 shrink-0">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* KPI 2: Pelanggan Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group overflow-hidden relative">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:scale-110 duration-500">
            <UserCheck className="h-28 w-28 text-emerald-600" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Pelanggan Aktif</span>
            <span className="text-3xl font-black text-emerald-600 block tracking-tight">
              {stats.active}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 py-0.5 px-1.5 rounded inline-block mt-1">
              {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% Tingkat Keaktifan
            </span>
          </div>
          <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600 shrink-0">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        {/* KPI 3: Tagihan Berjalan */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group overflow-hidden relative">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:scale-110 duration-500">
            <CreditCard className="h-28 w-28 text-amber-600" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Piutang Berjalan</span>
            <span className="text-2xl font-black text-amber-600 block tracking-tight">
              {rupiahFormat(stats.runningBill)}
            </span>
            <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 py-0.5 px-1.5 rounded inline-block mt-1">
              Outstanding {filteredInvoices.filter(i => i.status !== 'Lunas').length} invoice
            </span>
          </div>
          <div className="bg-amber-50 p-3 rounded-2xl text-amber-500 shrink-0">
            <CreditCard className="h-6 w-6" />
          </div>
        </div>

        {/* KPI 4: Total Komisi / Total Pendapatan Terbayar */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group overflow-hidden relative">
          <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5 group-hover:scale-110 duration-500">
            {activeRole === 'Sales' ? <Award className="h-28 w-28 text-red-600" /> : <DollarSign className="h-28 w-28 text-red-600" />}
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              {activeRole === 'Sales' ? 'Komisi Anda' : 'Total Pendapatan'}
            </span>
            <span className="text-2xl font-black text-red-700 block tracking-tight">
              {rupiahFormat(activeRole === 'Sales' ? stats.totalSalesCommission : stats.totalCollected)}
            </span>
            <span className="text-[10px] text-red-700 font-semibold bg-red-50 py-0.5 px-1.5 rounded inline-block mt-1">
              {activeRole === 'Sales' ? 'Total insentif dicairkan' : `Komisi dibayar: ${rupiahFormat(stats.totalSalesCommission)}`}
            </span>
          </div>
          <div className="bg-red-50 p-3 rounded-2xl text-red-600 shrink-0">
            {activeRole === 'Sales' ? <Award className="h-6 w-6" /> : <DollarSign className="h-6 w-6" />}
          </div>
        </div>
      </div>

      {/* Secondary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center space-x-3 text-red-800">
          <UserPlus className="h-5 w-5 text-red-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-900">Pelanggan Baru Bulan Ini</h4>
            <p className="text-sm font-medium mt-0.5">Sistem mencatat <strong>{stats.newThisMonth} pelanggan baru</strong> terdaftar pada siklus ini.</p>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center space-x-3 text-orange-850">
          <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-950">Pelanggan Menunggak (Terlambat)</h4>
            <p className="text-sm font-medium mt-0.5">Ada <strong>{filteredCustomers.filter(c => c.paymentStatus === 'Terlambat').length} pelanggan terlambat</strong> membutuhkan follow up.</p>
          </div>
        </div>

        <div className="bg-gray-55 border border-gray-200 rounded-xl p-4 flex items-center space-x-3 text-gray-800 bg-white">
          <TrendingUp className="h-5 w-5 text-gray-500 shrink-0" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Rasio Kolektibilitas Tagihan</h4>
            <p className="text-sm font-medium mt-0.5">Rasio efisiensi penagihan berada pada level <strong>
              {filteredInvoices.length > 0 ? Math.round((filteredInvoices.filter(i => i.status === 'Lunas').length / filteredInvoices.length) * 100) : 0}%
            </strong> bulan ini.</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Growth Chart Area */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Pertumbuhan Tren Pelanggan & Pendapatan</h3>
              <p className="text-xs text-gray-500">Histori kumulatif pendaftaran dan penagihan lunas jangka waktu terpilih.</p>
            </div>
            <div className="bg-gray-100 p-1 rounded-lg flex space-x-1 text-[10px] font-bold">
              <span className="bg-white px-2.5 py-1 rounded text-gray-900 shadow-sm cursor-pointer">Realisasi</span>
              <span className="text-gray-500 px-2.5 py-1 rounded cursor-not-allowed">Proyeksi</span>
            </div>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={adjustedGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCust" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={11} tickLine={false} tickFormatter={(v) => `Rp${v/1000}k`} />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'Pendapatan') return [rupiahFormat(Number(value)), 'Pendapatan (Lunas)'];
                    return [value, 'Total Pelanggan'];
                  }}
                  contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', color: '#FFF', fontSize: '12px', border: 'none' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="Pelanggan" stroke="#DC2626" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCust)" />
                <Area yAxisId="right" type="monotone" dataKey="Pendapatan" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Legend iconType="circle" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Package Stat Box */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-gray-900">Statistik Kontribusi Paket</h3>
            <p className="text-xs text-gray-500 mb-4">Breakdown pelanggan berdasarkan paket langganan yang aktif.</p>
            
            {packageStats.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">Tidak ada data paket.</div>
            ) : (
              <div className="h-44 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={packageStats}
                      cx="55%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {packageStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v} Pelanggan`, 'Jumlah']} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Visual Label inside middle of donut */}
                <div className="absolute top-1/2 left-[55%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Aktif</span>
                  <span className="text-xl font-black text-gray-950 block leading-none">{stats.active}</span>
                </div>
              </div>
            )}
          </div>

          {/* Table Breakdown of Packages for Premium look */}
          <div className="space-y-2 mt-4 overflow-y-auto max-h-32 pr-1">
            {packageStats.map((pkg) => (
              <div key={pkg.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: pkg.color }} />
                  <span className="font-semibold text-gray-700 truncate max-w-40">{pkg.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900 block">{pkg.count} Pelanggan</span>
                  <span className="text-[10px] text-gray-400 block">{rupiahFormat(pkg.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3 - Revenue Billing charts & Sales performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Billing metrics details */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-gray-900">Performa Invoice</h3>
            <p className="text-xs text-gray-500 mb-4">Nominal tagihan di-kategorisasikan dalam ribu rupiah (k).</p>
            
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={invoiceStatusData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" fontSize={11} stroke="#9CA3AF" tickLine={false} />
                  <YAxis fontSize={11} stroke="#9CA3AF" tickLine={false} />
                  <Tooltip 
                    formatter={(v, name) => [name === 'Nominal' ? `${v}k` : v, name]}
                    contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', color: '#FFF' }}
                  />
                  <Bar dataKey="Nominal" fill="#DC2626" radius={[4, 4, 0, 0]}>
                    {invoiceStatusData.map((entry, index) => {
                      const colors = ['#10B981', '#F59E0B', '#EF4444'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mt-4">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
              <span>Collection Target:</span>
              <span className="font-bold text-gray-900">{rupiahFormat(stats.runningBill + stats.totalCollected)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full" 
                style={{ width: `${stats.runningBill + stats.totalCollected > 0 ? (stats.totalCollected / (stats.runningBill + stats.totalCollected)) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sales Representatives Target Board */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-gray-900">Target & Kinerja Sales HP Berlangganan</h3>
            <p className="text-xs text-gray-500 mb-4">Kinerja sales reps, jumlah pelanggan baru yang dibuat, komisi akumulatif dan status target bulanan.</p>

            <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
              {filteredSales.map((rep) => {
                // Calculate dynamic performance ratio based on registered active payments or list targets
                const currentSalesRevenue = rep.totalCustomers * 250000; // Average price package Rp250k
                const targetRatio = Math.min(100, Math.round((currentSalesRevenue / rep.targetSales) * 100));

                return (
                  <div key={rep.id} className="border border-gray-150 rounded-xl p-3.5 hover:border-red-200 transition duration-150">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 text-xs">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm flex items-center space-x-1.5">
                          <span>{rep.name}</span>
                          <span className="text-[10px] font-mono bg-red-50 text-red-700 border border-red-100 py-0.5 px-2 rounded-full font-bold">
                            {rep.cabang}
                          </span>
                        </h4>
                        <span className="text-gray-400 text-[10px] font-mono block mt-0.5">{rep.email} • {rep.phone}</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-bold text-gray-900">Komisi: {rupiahFormat(rep.totalCommissionEarned)}</span>
                        <span className="block text-[10px] font-semibold text-emerald-600">Pelanggan: {rep.totalCustomers} orang</span>
                      </div>
                    </div>
                    
                    {/* Linear Target Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-gray-500">
                        <span>Pencapaian: {rupiahFormat(currentSalesRevenue)} / Target {rupiahFormat(rep.targetSales)}</span>
                        <span className="text-red-600 font-mono">{targetRatio}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
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
                <div className="py-12 text-center text-gray-400 text-xs">Tidak ada perwakilan sales terdaftar pada cabang ini.</div>
              )}
            </div>
          </div>

          <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex items-center justify-between text-xs text-red-900 font-medium mt-4">
            <span>Formula Komisi:</span>
            <span className="text-[10px] font-semibold uppercase bg-white border border-red-200 py-1 px-2.5 rounded text-red-700 font-mono">
              Komisi = Harga Paket × Komisi % (Saat Pembayaran Sukses)
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
