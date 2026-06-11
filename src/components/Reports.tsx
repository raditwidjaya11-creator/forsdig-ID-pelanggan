/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  CheckCircle, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  Award,
  FileText,
  TrendingUp,
  Tag
} from 'lucide-react';
import { Customer, Invoice, SalesRepresentative, UserRole } from '../types';

interface ReportsProps {
  customers: Customer[];
  invoices: Invoice[];
  sales: SalesRepresentative[];
  activeRole: UserRole;
  selectedCabang: string;
  selectedPerusahaan: string;
}

export default function Reports({
  customers,
  invoices,
  sales,
  activeRole,
  selectedCabang,
  selectedPerusahaan
}: ReportsProps) {

  // Current selected active report category
  const [reportType, setReportType] = useState<'aktif' | 'baru' | 'pendapatan' | 'komisi' | 'menunggak'>('aktif');

  // Filter context logic
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchCabang = selectedCabang === 'Semua Cabang' || c.cabang === selectedCabang;
      const matchPerusahaan = selectedPerusahaan === 'Semua Perusahaan' || c.perusahaan === selectedPerusahaan;
      return matchCabang && matchPerusahaan;
    });
  }, [customers, selectedCabang, selectedPerusahaan]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const cust = customers.find(c => c.id === inv.customerId);
      if (!cust) return false;
      const matchCabang = selectedCabang === 'Semua Cabang' || cust.cabang === selectedCabang;
      const matchPerusahaan = selectedPerusahaan === 'Semua Perusahaan' || cust.perusahaan === selectedPerusahaan;
      return matchCabang && matchPerusahaan;
    });
  }, [invoices, customers, selectedCabang, selectedPerusahaan]);

  // Calculations based on tabs
  const reportData = useMemo(() => {
    switch (reportType) {
      case 'aktif':
        return filteredCustomers.filter(c => c.status === 'Aktif');
      case 'baru':
        // Filter June/May 2026 registered clients
        return filteredCustomers.filter(c => c.createdAt.includes('2026-06') || c.createdAt.includes('2026-05'));
      case 'menunggak':
        return filteredCustomers.filter(c => c.paymentStatus === 'Terlambat');
      default:
        return [];
    }
  }, [reportType, filteredCustomers]);

  // Aggregate monthly revenues
  const revenueSummary = useMemo(() => {
    const paid = filteredInvoices.filter(i => i.status === 'Lunas').reduce((sum, inv) => sum + inv.amount, 0);
    const unpaid = filteredInvoices.filter(i => i.status === 'Belum Bayar' || i.status === 'Terlambat').reduce((sum, inv) => sum + inv.amount, 0);
    return { paid, unpaid, total: paid + unpaid };
  }, [filteredInvoices]);

  // Aggregate commission metrics per Sales
  const salesCommissions = useMemo(() => {
    return sales.filter(s => selectedCabang === 'Semua Cabang' || s.cabang === selectedCabang);
  }, [sales, selectedCabang]);

  // Simulate exporting file outputs (triggers dynamic downloads warning popup)
  const handleExport = (format: 'PDF' | 'Excel' | 'CSV') => {
    let rowCount = 0;
    let fileName = `Laporan_CustomerPro_${reportType.toUpperCase()}_2026.${format.toLowerCase()}`;
    
    if (reportType === 'pendapatan') {
      rowCount = filteredInvoices.length;
    } else if (reportType === 'komisi') {
      rowCount = salesCommissions.length;
    } else {
      rowCount = reportData.length;
    }

    alert(`📥 [MOCK EXPORT GATEWAY - ${format}]\n\nFile Berhasil Digenerate:\nNama File: ${fileName}\nTotal Data Diekspor: ${rowCount} Baris\nStatus: Unduhan Berhasil Diluncurkan.`);
  };

  const rupiahFormat = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-50 p-2 text-red-600 rounded-xl">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-gray-950">Analisis Pendapatan & Ekspor Laporan</h2>
              <p className="text-xs text-gray-500">Tarik data tabular kinerja operasional, rekap komisi, serta tunggakan dalam format PDF, Excel, atau CSV.</p>
            </div>
          </div>
        </div>

        {/* Categories Tab selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-5 border-b border-gray-100 pt-2 text-xs font-bold font-mono text-center">
          <button
            id="rep-tab-aktif"
            onClick={() => setReportType('aktif')}
            className={`py-2 px-2.5 border-b-2 transition ${reportType === 'aktif' ? 'border-red-600 text-red-700' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
          >
            Pelanggan Aktif ({filteredCustomers.filter(c => c.status === 'Aktif').length})
          </button>
          <button
            id="rep-tab-baru"
            onClick={() => setReportType('baru')}
            className={`py-2 px-2.5 border-b-2 transition ${reportType === 'baru' ? 'border-red-600 text-red-700' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
          >
            Pelanggan Baru
          </button>
          <button
            id="rep-tab-pendapatan"
            onClick={() => setReportType('pendapatan')}
            className={`py-2 px-2.5 border-b-2 transition ${reportType === 'pendapatan' ? 'border-red-600 text-red-700' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
          >
            Pendapatan Bulanan
          </button>
          <button
            id="rep-tab-komisi"
            onClick={() => setReportType('komisi')}
            className={`py-2 px-2.5 border-b-2 transition ${reportType === 'komisi' ? 'border-red-600 text-red-700' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
          >
            Komisi Sales
          </button>
          <button
            id="rep-tab-menunggak"
            onClick={() => setReportType('menunggak')}
            className={`py-2 px-2.5 border-b-2 transition ${reportType === 'menunggak' ? 'border-red-600 text-red-700' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
          >
            Keuangan Terlambat ({filteredCustomers.filter(c => c.paymentStatus === 'Terlambat').length})
          </button>
        </div>
      </div>

      {/* Export Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-red-700 text-white p-4 rounded-xl shadow-md border">
        <span className="text-xs font-bold uppercase tracking-wider font-mono">PILIH FORMAT DOKUMEN EKSPOR:</span>
        <div className="flex items-center space-x-2">
          {['PDF', 'Excel', 'CSV'].map((format) => (
            <button
              id={`export-btn-${format}`}
              key={format}
              onClick={() => handleExport(format as any)}
              className="flex items-center space-x-1 border border-white/20 hover:bg-white hover:text-red-700 text-xs font-bold py-1.5 px-3.5 rounded-lg transition shrink-0 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{format}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Tables rendering */}
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden animate-fade-in text-xs font-normal">
        
        {/* TAB 1: CUSTOMERS RELATED REPORTS (Aktif, Baru, Menunggak) */}
        {(reportType === 'aktif' || reportType === 'baru' || reportType === 'menunggak') && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-100 font-mono">
                  <th className="p-3 pl-4">ID Pelanggan</th>
                  <th className="p-3">Nama Lengkap</th>
                  <th className="p-3">Kontak WA</th>
                  <th className="p-3">Paket Layanan</th>
                  <th className="p-3">Jatuh Tempo</th>
                  <th className="p-3">Cabang / Regional</th>
                  <th className="p-3 pr-4 text-right">Biaya Langganan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {reportData.map((cust) => (
                  <tr key={cust.id} className="hover:bg-gray-50/50">
                    <td className="p-3 pl-4">
                      <span className="font-mono bg-gray-100 py-0.5 px-2 font-bold text-gray-900 rounded">{cust.customerId}</span>
                    </td>
                    <td className="p-3 font-bold text-gray-950 text-sm">{cust.name}</td>
                    <td className="p-3 font-semibold text-gray-600">{cust.phone}</td>
                    <td className="p-3 font-bold text-red-750">{cust.packageName}</td>
                    <td className="p-3 font-mono text-gray-450 font-bold">{cust.dueDate}</td>
                    <td className="p-3 text-gray-500 font-medium">{cust.cabang} • {cust.perusahaan}</td>
                    <td className="p-3 pr-4 text-right font-black text-gray-900">{rupiahFormat(cust.price)}</td>
                  </tr>
                ))}
                {reportData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-400">
                      Sistem tidak mendeteksi baris data laporan yang memenuhi batasan wilayah saat ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: MONTHLY REVENUE DETAILS */}
        {reportType === 'pendapatan' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-emerald-100 bg-emerald-50/40 p-4 rounded-xl space-y-1">
                <span className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider font-mono">PENDAPATAN CAIR (LUNAS)</span>
                <strong className="text-2xl font-black text-emerald-700 block tracking-tight">{rupiahFormat(revenueSummary.paid)}</strong>
                <p className="text-[10px] text-emerald-600 font-medium">Berdasarkan total invoice terbayar sah.</p>
              </div>

              <div className="border border-amber-100 bg-amber-50/40 p-4 rounded-xl space-y-1">
                <span className="text-[10px] text-amber-700 uppercase font-bold tracking-wider font-mono">TAGIHAN OUTSTANDING (BEBAN UTANG)</span>
                <strong className="text-2xl font-black text-amber-700 block tracking-tight">{rupiahFormat(revenueSummary.ununpaid || revenueSummary.unpaid)}</strong>
                <p className="text-[10px] text-amber-605 text-amber-600 font-medium">Invoice terbuat tetapi belum lunas.</p>
              </div>

              <div className="border border-red-100 bg-red-50/40 p-4 rounded-xl space-y-1 text-red-900 font-bold">
                <span className="text-[10px] text-red-700 uppercase font-bold tracking-wider font-mono">TARGET OMSET RUNNING</span>
                <strong className="text-2xl font-black text-red-800 block tracking-tight">{rupiahFormat(revenueSummary.total)}</strong>
                <p className="text-[10px] text-red-600 font-medium">Total potensial operasional keseluruhan.</p>
              </div>
            </div>

            {/* List invoices compiled reports */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-gray-900">Pembukuan Aliran Keuangan Terlampir</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-100 font-mono">
                      <th className="p-2.5 pl-4">No. Faktur</th>
                      <th className="p-2.5">Pelanggan</th>
                      <th className="p-2.5">Nama Layanan</th>
                      <th className="p-2.5">Jumlah Nominal</th>
                      <th className="p-2.5">Status Slip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono">
                    {filteredInvoices.map(inv => (
                      <tr key={inv.id}>
                        <td className="p-2.5 pl-4 font-bold text-gray-900">{inv.invoiceNumber}</td>
                        <td className="p-2.5 font-sans font-bold">{inv.customerName}</td>
                        <td className="p-2.5 text-red-700 font-sans font-semibold">{inv.packageName}</td>
                        <td className="p-2.5 font-sans font-black">{rupiahFormat(inv.amount)}</td>
                        <td className="p-2.5">
                          {inv.status === 'Lunas' ? (
                            <span className="text-emerald-700 text-[10px] font-black uppercase">PAID</span>
                          ) : (
                            <span className="text-amber-600 text-[10px] font-black uppercase">UNPAID</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SALES COMMISSION TRACKER */}
        {reportType === 'komisi' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-100 font-mono">
                  <th className="p-3 pl-4">Nama Agen Sales</th>
                  <th className="p-3">Penempatan Cabang</th>
                  <th className="p-3">WhatsApp Sales</th>
                  <th className="p-3 text-center">Registrasi Member</th>
                  <th className="p-3 pr-4 text-right">Total Fee Komisi Cair</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {salesCommissions.map((s) => (
                  <tr key={s.id}>
                    <td className="p-3 pl-4 font-bold text-gray-950 text-sm">{s.name}</td>
                    <td className="p-3 font-bold text-red-700">{s.cabang}</td>
                    <td className="p-3 font-semibold text-gray-600 font-mono">{s.phone}</td>
                    <td className="p-3 text-center font-bold text-gray-700 font-mono">{s.totalCustomers} orang</td>
                    <td className="p-3 pr-4 text-right font-black text-emerald-600">{rupiahFormat(s.totalCommissionEarned)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
