/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Printer, 
  Send, 
  Smartphone, 
  Mail, 
  Check, 
  DollarSign, 
  Calendar,
  X,
  CreditCard,
  QrCode,
  Sparkles
} from 'lucide-react';
import { Invoice, Customer, UserRole } from '../types';

interface InvoiceManagementProps {
  invoices: Invoice[];
  customers: Customer[];
  activeRole: UserRole;
  selectedCabang: string;
  selectedPerusahaan: string;
  onSaveInvoice: (inv: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onAddNotification: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'danger') => void;
}

export default function InvoiceManagement({
  invoices,
  customers,
  activeRole,
  selectedCabang,
  selectedPerusahaan,
  onSaveInvoice,
  onDeleteInvoice,
  onAddNotification
}: InvoiceManagementProps) {

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');

  // Modals & Popups state
  const [showPayModal, setShowPayModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Form states for manual Invoicing
  const [invoiceCustomer, setInvoiceCustomer] = useState('');
  const [manualPrice, setManualPrice] = useState(0);
  const [manualDueDate, setManualDueDate] = useState('2026-07-11');

  // Paying states
  const [paymentMethod, setPaymentMethod] = useState('QRIS');
  const [payingInProcess, setPayingInProcess] = useState(false);

  // 1. Context Filtering
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Cross refer customer list to check branches & companies
      const cust = customers.find(c => c.id === inv.customerId);
      if (!cust) return false;

      // Role protection - Sales can't even see invoices tab in our nav, but let's secure it.
      if (activeRole === 'Sales' && cust.salesId !== 'sales-1') return false;

      const matchCabang = selectedCabang === 'Semua Cabang' || cust.cabang === selectedCabang;
      const matchPerusahaan = selectedPerusahaan === 'Semua Perusahaan' || cust.perusahaan === selectedPerusahaan;
      if (!matchCabang || !matchPerusahaan) return false;

      const matchesSearch = 
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.packageName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === 'Semua' || inv.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, customers, searchQuery, filterStatus, selectedCabang, selectedPerusahaan, activeRole]);

  // Open manual Billing Form
  const handleOpenGenerate = () => {
    const list = customers.filter(c => c.status === 'Aktif');
    if (list.length === 0) {
      alert('Tidak terdapat pelanggan aktif untuk dibuatkan invoice.');
      return;
    }
    setInvoiceCustomer(list[0].id);
    setManualPrice(list[0].price);
    const date = new Date();
    date.setDate(date.getDate() + 30);
    setManualDueDate(date.toISOString().split('T')[0]);
    setShowGenerateModal(true);
  };

  // Handle selected customer packaging changes in form
  const handleCustomerSelectedChange = (id: string) => {
    setInvoiceCustomer(id);
    const cust = customers.find(c => c.id === id);
    if (cust) {
      setManualPrice(cust.price);
    }
  };

  // Save manual Invoice
  const handleCreateInvoiceManual = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === invoiceCustomer);
    if (!cust) return;

    const code = Math.floor(100 + Math.random() * 900);
    const number = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInv: Invoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber: number,
      customerId: cust.id,
      customerName: cust.name,
      packageName: cust.packageName,
      amount: manualPrice,
      dueDate: manualDueDate,
      status: 'Belum Bayar',
      createdAt: new Date().toISOString()
    };

    onSaveInvoice(newInv);
    onAddNotification(
      'Tagihan Dibuat',
      `Invoice manual ${number} berhasil dibuat untuk ${cust.name} sebesar ${rupiahFormat(manualPrice)}.`,
      'info'
    );
    setShowGenerateModal(false);
  };

  // Simulating Payment processes
  const handlePay = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setShowPayModal(true);
  };

  const handleProcessPayment = () => {
    if (!selectedInvoice) return;
    setPayingInProcess(true);

    setTimeout(() => {
      const updated: Invoice = {
        ...selectedInvoice,
        status: 'Lunas',
        paidAt: new Date().toISOString(),
        paymentMethod: paymentMethod
      };

      onSaveInvoice(updated);
      onAddNotification(
        'Pembayaran Sukses',
        `Invoice ${selectedInvoice.invoiceNumber} sebesar ${rupiahFormat(selectedInvoice.amount)} oleh ${selectedInvoice.customerName} berhasil dibayar via ${paymentMethod}.`,
        'success'
      );
      
      setPayingInProcess(false);
      setShowPayModal(false);
      setSelectedInvoice(null);
    }, 1000);
  };

  // WA Notification Simulation
  const handleSimulateWhatsApp = (inv: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    const cust = customers.find(c => c.id === inv.customerId);
    const phone = cust ? cust.phone : '08123456789';
    
    const textMsg = `Halo Kak ${inv.customerName}, berikut adalah tagihan langganan internet Anda dari CustomerPro.\n\n` +
      `No Invoice: *${inv.invoiceNumber}*\n` +
      `Layanan: *${inv.packageName}*\n` +
      `Nominal: *${rupiahFormat(inv.amount)}*\n` +
      `Tanggal Jatuh Tempo: *${inv.dueDate}*\n` +
      `Status: *${inv.status} (Segera Lakukan Pembayaran)*\n\n` +
      `Silakan hubungi administrator kami untuk pembayaran virtual account atau QRIS. Terima kasih banyak.`;

    const encoded = encodeURIComponent(textMsg);
    // Open in mock popup or simulated success triggers
    alert(`⚡ [WHATSAPP API BLANKET INTENTS]\nKirim pesan ke: ${phone}\n\nIsi Pesan:\n${textMsg}`);
    
    // update invoice status waSent
    onSaveInvoice({ ...inv, whatsappSent: true });
  };

  // Email Notification Simulation
  const handleSimulateEmail = (inv: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    const cust = customers.find(c => c.id === inv.customerId);
    const email = cust ? cust.email : 'alamat@email.com';

    alert(`📨 [EMAIL API INTEGRATION - BREVO/RESEND]\nEmail dikirim ke: ${email}\n\nSubjek: Tagihan Berlangganan Aktif #${inv.invoiceNumber}\nSistem mengirimkan invoice digital terformat PDF.`);
    onSaveInvoice({ ...inv, emailSent: true });
  };

  const rupiahFormat = (val: number) => {
    return 'Rp' + val.toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-50 p-2 text-red-600 rounded-xl">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-gray-950">Buku Register Tagihan & Invoice</h2>
              <p className="text-xs text-gray-500">Kelola piutang berjalan, cetak PDF kuitansi fisik, dan jalankan blast pengingat jatuh tempo.</p>
            </div>
          </div>
          <button
            id="btn-open-create-manual-inv"
            onClick={handleOpenGenerate}
            className="flex items-center space-x-1.5 bg-gray-900 border text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-gray-800 transition cursor-pointer self-start md:self-center"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Invoice Manual</span>
          </button>
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Search by Invoice Number, Customer Name */}
          <div className="relative sm:col-span-2">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              id="inv-search-input"
              type="text"
              placeholder="Cari nomor invoice, nama pelanggan, paket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 focus:bg-white focus:ring-1 focus:ring-red-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Filtering Status */}
          <div>
            <select
              id="inv-status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
            >
              <option value="Semua">Status Pembayaran: Semua</option>
              <option value="Lunas">Lunas</option>
              <option value="Belum Bayar">Belum Bayar</option>
              <option value="Terlambat">Terlambat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoice Grid Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table id="invoices-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-100 font-mono">
                <th className="p-4 pl-6">No. Invoice</th>
                <th className="p-4">Pelanggan</th>
                <th className="p-4">Paket Langganan</th>
                <th className="p-4">Nominal</th>
                <th className="p-4">Jatuh Tempo</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Kirim Notif</th>
                <th className="p-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredInvoices.map((inv) => (
                <tr 
                  id={`inv-row-${inv.id}`}
                  key={inv.id}
                  onClick={() => { setSelectedInvoice(inv); setShowPrintModal(true); }}
                  className="hover:bg-red-50/10 active:bg-red-50/20 cursor-pointer transition"
                >
                  <td className="p-4 pl-6">
                    <span className="font-mono font-bold text-gray-900 bg-gray-100 py-1 px-2 rounded">
                      {inv.invoiceNumber}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-gray-950 text-sm block">{inv.customerName}</span>
                    <span className="text-[10px] text-gray-400 block font-mono">{inv.customerId}</span>
                  </td>

                  <td className="p-4 font-bold text-red-750">
                    {inv.packageName}
                  </td>

                  <td className="p-4 font-black text-gray-900">
                    {rupiahFormat(inv.amount)}
                  </td>

                  <td className="p-4 text-gray-500 font-semibold font-mono">
                    {inv.dueDate}
                  </td>

                  <td className="p-4 text-center">
                    {inv.status === 'Lunas' ? (
                      <span className="inline-flex items-center space-x-1 font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 py-0.5 px-2.5 rounded-full">
                        <Check className="h-3 w-3" />
                        <span>Lunas</span>
                      </span>
                    ) : inv.status === 'Terlambat' ? (
                      <span className="inline-flex items-center space-x-1 font-bold text-[10px] bg-red-50 text-red-700 border border-red-200 py-0.5 px-2.5 rounded-full animate-pulse">
                        <AlertCircle className="h-3 w-3" />
                        <span>Terlambat</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 font-bold text-[10px] bg-amber-50 text-amber-700 border border-amber-200 py-0.5 px-2.5 rounded-full">
                        <Clock className="h-3 w-3" />
                        <span>Belum Bayar</span>
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        id={`blast-wa-${inv.id}`}
                        onClick={(e) => handleSimulateWhatsApp(inv, e)}
                        className={`p-1.5 rounded-lg border transition ${inv.whatsappSent ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 text-gray-500'}`}
                        title="Simulasikan Kirim WhatsApp"
                      >
                        <Smartphone className="h-4 w-4" />
                      </button>
                      <button
                        id={`blast-email-${inv.id}`}
                        onClick={(e) => handleSimulateEmail(inv, e)}
                        className={`p-1.5 rounded-lg border transition ${inv.emailSent ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 text-gray-500'}`}
                        title="Simulasikan Kirim Email"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                    </div>
                  </td>

                  <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-2">
                      {inv.status !== 'Lunas' ? (
                        <button
                          id={`pay-inv-btn-${inv.id}`}
                          onClick={() => handlePay(inv)}
                          className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg shadow-md hover:shadow-red-500/10 transition cursor-pointer"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>Bayar</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-mono block">
                          Metode: {inv.paymentMethod || 'Tunai'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-400">
                    Tidak ditemukan data invoice yang cocok dengan kriteria filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM: Create Manual Invoice */}
      {showGenerateModal && (
        <div id="manual-inv-modal" className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3.5">
              <h3 className="font-extrabold text-lg text-gray-900">Buat Tagihan Manual</h3>
              <button 
                id="close-manual-inv"
                onClick={() => setShowGenerateModal(false)} 
                className="p-1 text-gray-450 hover:text-red-600 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceManual} className="space-y-4 text-xs font-normal">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Pilih Pelanggan Aktif</label>
                <select
                  id="man-inv-cust-select"
                  value={invoiceCustomer}
                  onChange={(e) => handleCustomerSelectedChange(e.target.value)}
                  className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5"
                >
                  {customers.filter(c => c.status === 'Aktif').map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.packageName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Nominal Tagihan (Rp)</label>
                <input
                  id="man-inv-price-input"
                  type="number"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(Number(e.target.value))}
                  className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Tanggal Jatuh Tempo</label>
                <input
                  id="man-inv-duedate-input"
                  type="date"
                  value={manualDueDate}
                  onChange={(e) => setManualDueDate(e.target.value)}
                  className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5"
                />
              </div>

              <div className="flex space-x-2 pt-4 justify-end border-t">
                <button
                  id="btn-cancel-manual-inv"
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  id="btn-save-manual-inv"
                  type="submit"
                  className="px-5 py-2 bg-gray-900 font-bold text-white rounded-xl hover:bg-gray-800 transition"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GATE: Pay Simulation Modal */}
      {showPayModal && selectedInvoice && (
        <div id="pay-simulation-modal" className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-150 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-lg text-gray-900">Simulasi Pembayaran Kolektif</h3>
              <button 
                id="close-pay-simulate"
                onClick={() => setShowPayModal(false)} 
                className="p-1 hover:text-red-600 text-gray-400 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-red-700">No Invoice:</span>
                <strong className="text-red-950 font-mono">{selectedInvoice.invoiceNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-red-700">Pelanggan:</span>
                <strong className="text-red-950">{selectedInvoice.customerName}</strong>
              </div>
              <div className="flex justify-between border-t border-red-200 pt-2 font-bold text-sm">
                <span className="text-red-900">Total Nominal:</span>
                <strong className="text-red-950">{rupiahFormat(selectedInvoice.amount)}</strong>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">PILIH METODE PEMBAYARAN</label>
              <div className="grid grid-cols-2 gap-2">
                {['QRIS Instant', 'Transfer BCA', 'Transfer Mandiri', 'ShopeePay'].map(m => (
                  <button
                    id={`pay-method-${m.replace(' ', '')}`}
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`p-3 border font-extrabold text-center rounded-xl transition ${paymentMethod === m ? 'bg-red-55 border-red-600 text-red-700 bg-red-50' : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t flex space-x-2">
              <button
                id="btn-cancel-payment"
                type="button"
                onClick={() => setShowPayModal(false)}
                className="flex-1 py-2.5 border rounded-xl hover:bg-gray-50 text-xs text-gray-700 font-bold"
              >
                Batal
              </button>
              <button
                id="btn-submit-payment"
                type="button"
                disabled={payingInProcess}
                onClick={handleProcessPayment}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md font-bold text-xs transition flex items-center justify-center space-x-1 cursor-pointer"
              >
                {payingInProcess ? (
                  <span className="animate-pulse">Memverifikasi...</span>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Lunas Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC HTML PRINT MODAL / PDF SIMULATOR */}
      {showPrintModal && selectedInvoice && (
        <div id="print-invoice-modal" className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border flex flex-col relative">
            
            {/* Toolbar row inside modal */}
            <div className="flex items-center justify-between border-b pb-4 mb-6 sticky top-0 bg-white z-10 no-print">
              <span className="font-extrabold text-sm uppercase text-gray-400 font-mono">Invoice Viewer Layout PDF</span>
              <div className="flex items-center space-x-2">
                <button
                  id="print-btn-trigger"
                  onClick={() => alert(`Sistem mengunduh PDF untuk Invoice ${selectedInvoice.invoiceNumber}`)}
                  className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md transition cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Cetak PDF</span>
                </button>
                <button
                  id="close-print-btn"
                  onClick={() => { setSelectedInvoice(null); setShowPrintModal(false); }}
                  className="p-1 px-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-black transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Invoce paper printable layer */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 font-mono text-xs text-gray-800 leading-normal">
              
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-black text-lg text-red-700 tracking-tight leading-none uppercase">CUSTOMERPRO SUITE</h3>
                  <span className="text-[10px] text-gray-400 block uppercase font-sans font-semibold">Internet Service Provider & SaaS Portal</span>
                  <p className="text-[10px] text-gray-500 max-w-xs uppercase font-sans font-medium">Jl. Raya Boulevard Barat No. 88, Kebayoran Baru, Jakarta Selatan, 12110 • support@customerpro.id</p>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block uppercase font-sans font-semibold">FAKTUR LANGGANAN</span>
                  <strong className="text-sm font-bold text-gray-950 block">{selectedInvoice.invoiceNumber}</strong>
                  <span className="text-[10px] text-gray-500 block">Dibuat: {selectedInvoice.createdAt.substring(0, 10)}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4">
                <div className="space-y-1 font-sans">
                  <span className="text-[10px] text-gray-400 uppercase font-mono tracking-widest font-bold">DITAGIHKAN KEPADA:</span>
                  <strong className="text-gray-950 block text-sm">{selectedInvoice.customerName}</strong>
                  <p className="text-gray-500 text-[11px] leading-tight max-w-[240px]">
                    Alamat Pemasangan: Alamat terdaftar di database CustomerPro ({selectedCabang} Region).
                  </p>
                </div>
                <div className="space-y-1 font-sans text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-mono tracking-widest font-bold block">STATUS TAGIHAN:</span>
                  <div className="mt-1">
                    {selectedInvoice.status === 'Lunas' ? (
                      <span className="bg-emerald-100 text-emerald-800 font-bold py-1 px-3.5 rounded text-[10px]">TUNTAS LUNAS</span>
                    ) : (
                      <span className="bg-red-100 text-red-800 font-bold py-1 px-3.5 rounded text-[10px] animate-pulse">MENUNGGAK</span>
                    )}
                  </div>
                  <span className="block text-[11px] text-gray-500 mt-2">Jatuh Tempo: {selectedInvoice.dueDate}</span>
                </div>
              </div>

              {/* Bill Details */}
              <table className="w-full text-left mt-6 font-sans">
                <thead>
                  <tr className="bg-gray-150 border-b-2 border-gray-300 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50">
                    <th className="p-2.5 pl-4">DESKRIPSI ITEM SIKLUS BILLING</th>
                    <th className="p-2.5 text-center">QUANTITY</th>
                    <th className="p-2.5 text-right pr-4">JUMLAH NOMINAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[12px] font-medium">
                  <tr>
                    <td className="p-3 pl-4">
                      <strong>Layanan {selectedInvoice.packageName}</strong>
                      <p className="text-xs text-gray-400 mt-0.5">Biaya bulanan periode aktif berlangganan internet RT RW Net.</p>
                    </td>
                    <td className="p-3 text-center">1 Bln</td>
                    <td className="p-3 text-right pr-4 font-bold">{rupiahFormat(selectedInvoice.amount)}</td>
                  </tr>
                  
                  {/* Total calculation */}
                  <tr className="bg-gray-50 font-bold border-t border-gray-200">
                    <td colSpan={2} className="p-3 text-right">TOTAL PIUTANG:</td>
                    <td className="p-3 text-right pr-4 text-red-750 text-base font-black">{rupiahFormat(selectedInvoice.amount)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Invoice footer */}
              <div className="border-t border-gray-200 pt-4 space-y-2 text-[10px] font-sans text-gray-500 leading-normal">
                <p><strong>Ketentuan Retribusi:</strong> Metode pembayaran instan QRIS dan Transfer Bank di-update secara otomatis oleh sistem CustomerPro. Simpan faktur fisik ini sebagai tanda lunas valid.</p>
                <div className="flex justify-between items-center pt-4 font-mono">
                  <span>Kuitansi Digital CustomerPro</span>
                  <span>Otorisasi Super Admin Radit's Suite</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
