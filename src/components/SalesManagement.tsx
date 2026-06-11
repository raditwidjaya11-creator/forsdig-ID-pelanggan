/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Edit, 
  Target, 
  Users, 
  Percent, 
  Award, 
  TrendingUp, 
  Check, 
  Clock, 
  Search,
  Mail,
  Phone,
  X
} from 'lucide-react';
import { SalesRepresentative, CommissionReceipt, Customer, UserRole } from '../types';

interface SalesManagementProps {
  sales: SalesRepresentative[];
  commissions: CommissionReceipt[];
  customers: Customer[];
  activeRole: UserRole;
  selectedCabang: string;
  onSaveSales: (rep: SalesRepresentative) => void;
  onDeleteSales: (id: string) => void;
  onPayoutCommission: (commId: string) => void;
}

export default function SalesManagement({
  sales,
  commissions,
  customers,
  activeRole,
  selectedCabang,
  onSaveSales,
  onDeleteSales,
  onPayoutCommission
}: SalesManagementProps) {

  // Search local state
  const [salesSearch, setSalesSearch] = useState('');
  
  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form states
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCommRate, setFormCommRate] = useState(10);
  const [formTarget, setFormTarget] = useState(5000000);
  const [formCabang, setFormCabang] = useState('Jakarta');

  // Filter Sales list based on Branch contexts
  const filteredSales = useMemo(() => {
    return sales.filter(rep => {
      // Role protection - if sales rep, can only see themselves
      if (activeRole === 'Sales' && rep.id !== 'sales-1') return false;

      const matchesBranch = selectedCabang === 'Semua Cabang' || rep.cabang === selectedCabang;
      const matchesSearch = 
        rep.name.toLowerCase().includes(salesSearch.toLowerCase()) ||
        rep.phone.includes(salesSearch) ||
        rep.email.toLowerCase().includes(salesSearch.toLowerCase());

      return matchesBranch && matchesSearch;
    });
  }, [sales, salesSearch, selectedCabang, activeRole]);

  // Filter commissions payout receipts
  const filteredCommissions = useMemo(() => {
    return commissions.filter(comm => {
      if (activeRole === 'Sales' && comm.salesId !== 'sales-1') return false;
      
      // Filter based on selected branch sales reps
      const rep = sales.find(s => s.id === comm.salesId);
      if (!rep) return false;
      return selectedCabang === 'Semua Cabang' || rep.cabang === selectedCabang;
    });
  }, [commissions, sales, selectedCabang, activeRole]);

  // Open Form to Add Sales
  const handleAddNewSales = () => {
    setIsEditing(false);
    setFormId('');
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormCommRate(10);
    setFormTarget(5000000);
    setFormCabang(selectedCabang !== 'Semua Cabang' ? selectedCabang : 'Jakarta');
    setShowFormModal(true);
  };

  // Open Form to Edit Sales
  const handleEditSales = (rep: SalesRepresentative) => {
    setIsEditing(true);
    setFormId(rep.id);
    setFormName(rep.name);
    setFormPhone(rep.phone);
    setFormEmail(rep.email);
    setFormCommRate(rep.commissionRate);
    setFormTarget(rep.targetSales);
    setFormCabang(rep.cabang);
    setShowFormModal(true);
  };

  // Submit Sales Form
  const handleSubmitSales = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone || !formEmail) {
      alert('Nama, Telepon, dan Email Sales wajib diisi.');
      return;
    }

    const uniqueId = formId || 'sales-' + Date.now();
    const isNew = !formId;

    const matchedCustomers = customers.filter(c => c.salesId === uniqueId);

    const payload: SalesRepresentative = {
      id: uniqueId,
      name: formName,
      phone: formPhone,
      email: formEmail,
      commissionRate: formCommRate,
      targetSales: formTarget,
      totalCustomers: isNew ? 0 : matchedCustomers.length,
      totalCommissionEarned: isNew ? 0 : (sales.find(s => s.id === formId)?.totalCommissionEarned || 0),
      cabang: formCabang
    };

    onSaveSales(payload);
    setShowFormModal(false);
  };

  const rupiahFormat = (val: number) => {
    return 'Rp' + val.toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Stats */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-50 p-2 text-red-600 rounded-xl">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-gray-950">Manajemen Sales & Komisi Pelanggan</h2>
              <p className="text-xs text-gray-500">Kelola kuota performa sales, targets, persentase bagi hasil, dan daftar komisi terbayar.</p>
            </div>
          </div>
          {activeRole === 'Super Admin' && (
            <button
              id="btn-add-sales"
              onClick={handleAddNewSales}
              className="flex items-center space-x-1.5 bg-red-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-red-700 transition cursor-pointer self-start md:self-center"
            >
              <Plus className="h-4 w-4" />
              <span>Registrasi Agen Sales</span>
            </button>
          )}
        </div>

        {/* Inputs */}
        <div className="relative pt-2">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="h-4 w-4 text-gray-400" />
          </span>
          <input
            id="sales-search-input"
            type="text"
            placeholder="Cari perwakilan sales berdasarkan nama, e-mail, telfon..."
            value={salesSearch}
            onChange={(e) => setSalesSearch(e.target.value)}
            className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 focus:bg-white focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* Grid of Sales Rep cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        {filteredSales.map((rep) => {
          // Average pricing package estimate for sales performance Rp250k
          const currentSalesRevenue = rep.totalCustomers * 250000;
          const percentageRatio = Math.min(100, Math.round((currentSalesRevenue / rep.targetSales) * 100));

          return (
            <div id={`sales-card-${rep.id}`} key={rep.id} className="bg-white rounded-2xl border border-gray-150 shadow-sm p-5 space-y-4 hover:border-red-500 transition duration-150 relative">
              <span className="absolute top-4 right-4 bg-red-50 border border-red-100 font-mono text-[10px] font-bold text-red-700 uppercase py-1 px-2.5 rounded-full">
                {rep.cabang}
              </span>

              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-mono">REPRESENTATIVE</span>
                <h3 className="font-extrabold text-base text-gray-950 block">{rep.name}</h3>
                <div className="flex flex-col text-[11px] text-gray-500 font-medium pt-1 space-y-1">
                  <span className="flex items-center space-x-1.5">
                    <Phone className="h-3 w-3 text-red-500" />
                    <span>{rep.phone}</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <Mail className="h-3 w-3 text-red-500" />
                    <span className="truncate max-w-[200px]">{rep.email}</span>
                  </span>
                </div>
              </div>

              {/* Grid detail stats inside the card */}
              <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100 text-center font-mono text-xs">
                <div>
                  <span className="text-gray-400 text-[9px] block">RATE %</span>
                  <strong className="text-gray-900 block font-black">{rep.commissionRate}%</strong>
                </div>
                <div>
                  <span className="text-gray-400 text-[9px] block">CLIENT</span>
                  <strong className="text-gray-900 block font-black">{rep.totalCustomers} org</strong>
                </div>
                <div>
                  <span className="text-gray-400 text-[9px] block">KOMISI</span>
                  <strong className="text-emerald-600 block font-black truncate">{rupiahFormat(rep.totalCommissionEarned)}</strong>
                </div>
              </div>

              {/* Progress target bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-gray-500 flex items-center space-x-1 font-sans">
                    <Target className="h-3 w-3 text-red-600" />
                    <span>Pencapaian Rp: {rupiahFormat(currentSalesRevenue)}</span>
                  </span>
                  <span className="text-red-700 font-mono">{percentageRatio}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${percentageRatio >= 100 ? 'bg-emerald-500' : 'bg-red-500'}`}
                    style={{ width: `${percentageRatio}%` }}
                  />
                </div>
                <div className="text-[9px] text-center text-gray-400 font-medium">Target Bulanan: {rupiahFormat(rep.targetSales)}</div>
              </div>

              {/* Action and Payout options */}
              {activeRole === 'Super Admin' && (
                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                  <button
                    id={`edit-sales-${rep.id}`}
                    onClick={() => handleEditSales(rep)}
                    className="p-1.5 text-xs font-bold text-gray-500 hover:text-red-600 rounded-lg transition hover:bg-gray-50"
                  >
                    Edit Agen
                  </button>
                  <button
                    id={`delete-sales-${rep.id}`}
                    onClick={() => {
                      if (confirm(`Apakah Anda yakin memulangkan dan menghapus agen sales ${rep.name}?`)) {
                        onDeleteSales(rep.id);
                      }
                    }}
                    className="p-1 px-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Hapus Sales"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filteredSales.length === 0 && (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed md:col-span-3 text-gray-400 text-xs text-medium">
            Tidak ditemukan perwakilan sales terdaftar pada region terpilih.
          </div>
        )}
      </div>

      {/* COMMISSION CASH LOGS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-gray-950">Histori Slip Penerimaan Komisi</h3>
          <p className="text-xs text-gray-500">Log pencairan insentif komisi sales divalidasi langsung dari lunas tagihan pelanggan terdaftar.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-100 font-mono">
                <th className="p-3 pl-4">Sales Representative</th>
                <th className="p-3">Pelanggan Kontrak</th>
                <th className="p-3">Tanggal Tagihan</th>
                <th className="p-3">Persentase</th>
                <th className="p-3">Nominal Komisi</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 pr-4 text-right">Otorisasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-xs">
              {filteredCommissions.map((comm) => (
                <tr id={`comm-row-${comm.id}`} key={comm.id} className="hover:bg-gray-50/50">
                  <td className="p-3 pl-4 font-bold text-gray-950">{comm.salesName}</td>
                  
                  <td className="p-3">
                    <span className="font-bold text-gray-900 block">{comm.customerName}</span>
                    <span className="text-[10px] text-gray-400 block font-mono">Invoice: {comm.id}</span>
                  </td>

                  <td className="p-3 font-mono font-medium text-gray-500">{comm.date}</td>
                  
                  <td className="p-3 font-semibold text-gray-800">{comm.percentage}%</td>

                  <td className="p-3 font-black text-gray-900">{rupiahFormat(comm.amount)}</td>

                  <td className="p-3 text-center">
                    {comm.status === 'Dibayarkan' ? (
                      <span className="bg-emerald-50 text-emerald-800 font-bold py-0.5 px-2 text-[10px] rounded-full border border-emerald-100">Cair Lunas</span>
                    ) : (
                      <span className="bg-amber-50 text-amber-800 font-bold py-0.5 px-2 text-[10px] rounded-full border border-amber-100 animate-pulse">Pending Verifikasi</span>
                    )}
                  </td>

                  <td className="p-3 pr-4 text-right">
                    {comm.status === 'Pending' && activeRole === 'Super Admin' ? (
                      <button
                        id={`payout-comm-btn-${comm.id}`}
                        onClick={() => {
                          if (confirm(`Setujui pencairan insentif komisi sebesar ${rupiahFormat(comm.amount)} untuk ${comm.salesName}?`)) {
                            onPayoutCommission(comm.id);
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3.5 rounded text-[10px] transition cursor-pointer"
                      >
                        Cairkan
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 block font-mono">Closed Success</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredCommissions.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    Tidak ditemukan slip komisi terbuat untuk saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Sales Registration Add / Edit */}
      {showFormModal && (
        <div id="sales-form-modal" className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-150 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-lg text-gray-950">
                {isEditing ? 'Ubah Profil Sales' : 'Registrasi Agen Sales'}
              </h3>
              <button 
                id="close-sales-form"
                onClick={() => setShowFormModal(false)} 
                className="p-1 hover:text-red-700 text-gray-400 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSales} className="space-y-4 text-xs font-normal">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Nama Lengkap Agen *</label>
                <input
                  id="sales-name-input"
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Kusuma Wardana"
                  className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">No WhatsApp Agen *</label>
                <input
                  id="sales-phone-input"
                  type="text"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="0811xxxxxxxx"
                  className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Email Agen *</label>
                <input
                  id="sales-email-input"
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="agen@customerpro.id"
                  className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Fee Komisi % *</label>
                  <input
                    id="sales-rate-input"
                    type="number"
                    required
                    value={formCommRate}
                    onChange={(e) => setFormCommRate(Number(e.target.value))}
                    placeholder="10"
                    className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Target Sales (Rp) *</label>
                  <input
                    id="sales-target-input"
                    type="number"
                    required
                    value={formTarget}
                    onChange={(e) => setFormTarget(Number(e.target.value))}
                    placeholder="5000000"
                    className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Lokasi Penempatan Cabang</label>
                <select
                  id="sales-cabang-select"
                  value={formCabang}
                  onChange={(e) => setFormCabang(e.target.value)}
                  className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                >
                  <option value="Jakarta">Jakarta</option>
                  <option value="Bandung">Bandung</option>
                  <option value="Surabaya">Surabaya</option>
                  <option value="Yogyakarta">Yogyakarta</option>
                </select>
              </div>

              <div className="pt-4 border-t flex space-x-2">
                <button
                  id="cancel-sales-modal"
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 py-2.5 border rounded-xl hover:bg-gray-50 font-bold"
                >
                  Batal
                </button>
                <button
                  id="submit-sales-modal"
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md transition cursor-pointer"
                >
                  Simpan Sales
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
