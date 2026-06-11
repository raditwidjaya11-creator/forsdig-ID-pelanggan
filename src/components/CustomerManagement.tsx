/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  Check, 
  X, 
  Calendar, 
  Phone, 
  Mail, 
  FileText, 
  MapPin, 
  ChevronRight,
  TrendingUp,
  CreditCard,
  QrCode,
  UserCheck,
  UserX,
  MessageSquare,
  Sparkles,
  Camera
} from 'lucide-react';
import { Customer, ServicePackage, SalesRepresentative, UserRole } from '../types';

interface CustomerManagementProps {
  customers: Customer[];
  packages: ServicePackage[];
  sales: SalesRepresentative[];
  activeRole: UserRole;
  selectedCabang: string;
  selectedPerusahaan: string;
  onSave: (cust: Customer) => void;
  onDelete: (id: string) => void;
}

export default function CustomerManagement({
  customers,
  packages,
  sales,
  activeRole,
  selectedCabang,
  selectedPerusahaan,
  onSave,
  onDelete
}: CustomerManagementProps) {
  
  // Local active state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterPackage, setFilterPackage] = useState('Semua');
  const [filterCabang, setFilterCabang] = useState('Semua');
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [customNote, setCustomNote] = useState('');

  // Form states
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formNik, setFormNik] = useState('');
  const [formGender, setFormGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [formBirthDate, setFormBirthDate] = useState('1995-01-01');
  const [formPhoto, setFormPhoto] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  
  // Alamat Alamat Form
  const [formProvinsi, setFormProvinsi] = useState('Jawa Barat');
  const [formKabupaten, setFormKabupaten] = useState('Bandung');
  const [formKecamatan, setFormKecamatan] = useState('Coblong');
  const [formDesa, setFormDesa] = useState('Dago');
  const [formAlamatLengkap, setFormAlamatLengkap] = useState('Jl. Dago Raya');
  const [formKodePos, setFormKodePos] = useState('40135');

  // Layanan Form
  const [formPackage, setFormPackage] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formStartDate, setFormStartDate] = useState('2026-06-11');
  const [formDueDate, setFormDueDate] = useState('2026-07-11');
  const [formSales, setFormSales] = useState('');
  const [formCabang, setFormCabang] = useState('Jakarta');
  const [formPerusahaan, setFormPerusahaan] = useState('Sinergi Net');

  // 1. Filtered Pelanggan
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      // Role protection - Sales can only see their own customer list
      if (activeRole === 'Sales' && c.salesId !== 'sales-1') return false;

      // Sidebar Dropdowns Filter
      const matchBranchContext = selectedCabang === 'Semua Cabang' || c.cabang === selectedCabang;
      const matchCompanyContext = selectedPerusahaan === 'Semua Perusahaan' || c.perusahaan === selectedPerusahaan;
      if (!matchBranchContext || !matchCompanyContext) return false;

      // Inner Table Search / Filters
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.alamat.kabupaten.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === 'Semua' || c.status === filterStatus;
      const matchesPkg = filterPackage === 'Semua' || c.packageName === filterPackage;
      const matchesCabang = filterCabang === 'Semua' || c.cabang === filterCabang;

      return matchesSearch && matchesStatus && matchesPkg && matchesCabang;
    });
  }, [customers, searchQuery, filterStatus, filterPackage, filterCabang, selectedCabang, selectedPerusahaan, activeRole]);

  // Open Form to Add
  const handleAddNew = () => {
    setIsEditing(false);
    // Set auto customer code
    const count = customers.length + 1;
    const padding = count.toString().padStart(4, '0');
    
    setFormId('');
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormNik('');
    setFormGender('Laki-laki');
    setFormBirthDate('1990-01-01');
    setFormPhoto([
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
    ][Math.floor(Math.random() * 5)] + '&auto=format&fit=crop&q=85');
    setFormStatus('Aktif');
    
    // Address defaults
    setFormProvinsi('DKI Jakarta');
    setFormKabupaten(selectedCabang !== 'Semua Cabang' ? selectedCabang : 'Jakarta Selatan');
    setFormKecamatan('Kebayoran Baru');
    setFormDesa('Gandaria');
    setFormAlamatLengkap('');
    setFormKodePos('12140');

    // Packages defaults
    const activePkg = packages.filter(p => p.status === 'Aktif')[0];
    setFormPackage(activePkg ? activePkg.name : '');
    setFormPrice(activePkg ? activePkg.price : 0);
    setFormStartDate(new Date().toISOString().split('T')[0]);
    // set due date to exactly H+30 days
    const future = new Date();
    future.setDate(future.getDate() + 30);
    setFormDueDate(future.toISOString().split('T')[0]);

    // Sales defaults
    setFormSales(sales[0] ? sales[0].id : 'sales-1');
    setFormCabang(selectedCabang !== 'Semua Cabang' ? selectedCabang : 'Jakarta');
    setFormPerusahaan(selectedPerusahaan !== 'Semua Perusahaan' ? selectedPerusahaan : 'Sinergi Net');

    setShowFormModal(true);
  };

  // Open Form to Edit
  const handleEdit = (c: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setFormId(c.id);
    setFormName(c.name);
    setFormPhone(c.phone);
    setFormEmail(c.email);
    setFormNik(c.nik);
    setFormGender(c.gender);
    setFormBirthDate(c.birthDate);
    setFormPhoto(c.photoUrl);
    setFormStatus(c.status);
    
    setFormProvinsi(c.alamat.provinsi);
    setFormKabupaten(c.alamat.kabupaten);
    setFormKecamatan(c.alamat.kecamatan);
    setFormDesa(c.alamat.desa);
    setFormAlamatLengkap(c.alamat.alamatLengkap);
    setFormKodePos(c.alamat.kodePos);

    setFormPackage(c.packageName);
    setFormPrice(c.price);
    setFormStartDate(c.startDate);
    setFormDueDate(c.dueDate);
    setFormSales(c.salesId);
    setFormCabang(c.cabang);
    setFormPerusahaan(c.perusahaan);

    setShowFormModal(true);
  };

  // Helper when selecting package to automatically populate pricing
  const selectActivePackage = (pkgName: string) => {
    setFormPackage(pkgName);
    const matched = packages.find(p => p.name === pkgName);
    if (matched) {
      setFormPrice(matched.price);
    }
  };

  // Save changes
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone || !formEmail) {
      alert('Nama Kompleks, Nomer WhatsApp, dan Email wajib diisi.');
      return;
    }

    const uniqueId = formId || 'cust-' + Date.now();
    const isNew = !formId;

    // Build custom sequential Customer ID
    let finalCustId = '';
    if (isNew) {
      const year = new Date().getFullYear();
      const code = Math.floor(1000 + Math.random() * 9000);
      finalCustId = `CP-${code}`;
    } else {
      const matchObj = customers.find(c => c.id === formId);
      finalCustId = matchObj ? matchObj.customerId : 'CP-' + Math.floor(1000 + Math.random() * 9000);
    }

    const oldProps = customers.find(c => c.id === formId);

    // Dynamic History Logs
    const history = oldProps ? [...oldProps.packageHistory] : [];
    if (isNew) {
      history.push({ packageName: formPackage, date: formStartDate, action: 'Daftar Baru' });
    } else if (oldProps && oldProps.packageName !== formPackage) {
      history.push({ 
        packageName: formPackage, 
        date: new Date().toISOString().split('T')[0], 
        action: `Upgrade Paket (${oldProps.packageName} ➔ ${formPackage})` 
      });
    }

    const payload: Customer = {
      id: uniqueId,
      customerId: finalCustId,
      name: formName,
      phone: formPhone,
      email: formEmail,
      nik: formNik || 'N/A',
      gender: formGender,
      birthDate: formBirthDate,
      photoUrl: formPhoto,
      status: formStatus,
      alamat: {
        provinsi: formProvinsi,
        kabupaten: formKabupaten,
        kecamatan: formKecamatan,
        desa: formDesa,
        alamatLengkap: formAlamatLengkap,
        kodePos: formKodePos
      },
      packageName: formPackage,
      price: formPrice,
      startDate: formStartDate,
      dueDate: formDueDate,
      paymentStatus: oldProps ? oldProps.paymentStatus : 'Belum Bayar',
      salesId: formSales,
      createdAt: oldProps ? oldProps.createdAt : new Date().toISOString(),
      notes: oldProps ? oldProps.notes : ['Pelanggan ditambahkan ke sistem.'],
      packageHistory: history,
      gpsLocation: oldProps ? oldProps.gpsLocation : {
        lat: -6.2 + (Math.random() - 0.5) * 0.1,
        lng: 106.8 + (Math.random() - 0.5) * 0.1
      },
      cabang: formCabang,
      perusahaan: formPerusahaan
    };

    onSave(payload);
    setShowFormModal(false);
  };

  // Open Full Detail Modal
  const handleOpenDetail = (c: Customer) => {
    setSelectedCust(c);
    setCustomNote('');
    setShowDetailModal(true);
  };

  // Add Dynamic Note
  const handleAddNote = () => {
    if (!customNote.trim() || !selectedCust) return;
    const updated: Customer = {
      ...selectedCust,
      notes: [...selectedCust.notes, `${new Date().toLocaleDateString('id-ID')} - ${customNote}`]
    };
    onSave(updated);
    setSelectedCust(updated);
    setCustomNote('');
  };

  const rupiahFormat = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Layout Dashboard */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-50 p-2 text-red-600 rounded-xl">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-gray-950">Manajemen Database Pelanggan</h2>
              <p className="text-xs text-gray-500">Kelola informasi berlangganan, biodata, lokasi, dan upgrade paket sales.</p>
            </div>
          </div>
          <button
            id="btn-add-customer"
            onClick={handleAddNew}
            className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer self-start md:self-center"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Pelanggan Baru</span>
          </button>
        </div>

        {/* Filters and Inputs bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          {/* Main search bar */}
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              id="cust-search-input"
              type="text"
              placeholder="Cari nama, WhatsApp, ID pelanggan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 focus:bg-white focus:ring-1 focus:ring-red-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Status Select */}
          <div>
            <select
              id="filter-status-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:border-red-500"
            >
              <option value="Semua">Status: Semua</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>

          {/* Package Select */}
          <div>
            <select
              id="filter-package-select"
              value={filterPackage}
              onChange={(e) => setFilterPackage(e.target.value)}
              className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:border-red-500"
            >
              <option value="Semua">Semua Paket</option>
              {packages.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Dynamic Regional Cabang */}
          <div>
            <select
              id="filter-cabang-select"
              value={filterCabang}
              onChange={(e) => setFilterCabang(e.target.value)}
              className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:border-red-500"
            >
              <option value="Semua">Semua Wilayah</option>
              <option value="Jakarta">Jakarta</option>
              <option value="Bandung">Bandung</option>
              <option value="Surabaya">Surabaya</option>
              <option value="Yogyakarta">Yogyakarta</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Content / Table layout */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table id="customers-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-100 font-mono">
                <th className="p-4 pl-6 text-center">Profil / ID</th>
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4">WhatsApp & Kontak</th>
                <th className="p-4">Jenis Layanan</th>
                <th className="p-4">Status & Cabang</th>
                <th className="p-4 text-center">Pembayaran</th>
                <th className="p-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredCustomers.map((cust) => (
                <tr 
                  id={`cust-row-${cust.id}`}
                  key={cust.id} 
                  onClick={() => handleOpenDetail(cust)}
                  className="hover:bg-red-50/20 active:bg-red-50/40 cursor-pointer transition duration-150"
                >
                  <td className="p-4 pl-6 text-center space-y-1">
                    <img 
                      src={cust.photoUrl} 
                      alt={cust.name} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                      }}
                      className="h-9 w-9 rounded-full object-cover mx-auto border-2 border-red-500"
                    />
                    <span className="inline-block mt-1 font-mono text-[10px] font-bold bg-gray-950 text-white rounded py-0.5 px-1.5 shrink-0 uppercase tracking-tight">
                      {cust.customerId}
                    </span>
                  </td>
                  
                  <td className="p-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-gray-950 text-sm block">{cust.name}</span>
                      <span className="text-[10px] text-gray-400 block font-mono">NIK: {cust.nik}</span>
                    </div>
                  </td>

                  <td className="p-4 space-y-1">
                    <div className="flex items-center space-x-1.5 text-gray-700">
                      <Phone className="h-3 w-3 text-red-500" />
                      <span className="font-semibold">{cust.phone}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-gray-400 text-[10px]">
                      <Mail className="h-3 w-3" />
                      <span>{cust.email}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-red-700 block">{cust.packageName}</span>
                      <span className="text-[10px] text-gray-400 block font-mono">{rupiahFormat(cust.price)} / Bln</span>
                    </div>
                  </td>

                  <td className="p-4 space-y-1">
                    <div>
                      {cust.status === 'Aktif' ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 py-0.5 px-2 rounded-full">
                          <Check className="h-2.5 w-2.5" />
                          <span>Aktif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-200 py-0.5 px-2 rounded-full">
                          <X className="h-2.5 w-2.5" />
                          <span>Nonaktif</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 flex items-center space-x-1">
                      <MapPin className="h-2.5 w-2.5" />
                      <span>{cust.cabang} • {cust.perusahaan}</span>
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    {cust.paymentStatus === 'Lunas' ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold py-1 px-3 rounded-full">
                        LUNAS
                      </span>
                    ) : cust.paymentStatus === 'Terlambat' ? (
                      <span className="text-[10px] bg-red-100 text-red-800 font-bold py-1 px-3 rounded-full animate-pulse">
                        MENUNGGAK
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold py-1 px-3 rounded-full">
                        BELUM BAYAR
                      </span>
                    )}
                    <span className="block text-[9px] text-gray-400 font-mono mt-1.5">Jatuh Tempo: {cust.dueDate}</span>
                  </td>

                  <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        id={`edit-cust-btn-${cust.id}`}
                        onClick={(e) => handleEdit(cust, e)}
                        className="p-1 px-2.5 hover:bg-gray-100 text-gray-600 rounded-lg hover:text-red-600 transition flex items-center space-x-1"
                        title="Edit Data Pelanggan"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold">Edit</span>
                      </button>
                      
                      {activeRole === 'Super Admin' && (
                        <button
                          id={`del-cust-btn-${cust.id}`}
                          onClick={() => {
                            if (confirm(`Apakah Anda yakin menghapus pelanggan ${cust.name}? Semua billing dan history terkait akan terisolasi.`)) {
                              onDelete(cust.id);
                            }
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus Pelanggan"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-400">
                    Tidak ditemukan data pelanggan yang memenuhi kriteria pencarian dan batasan regional Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Form Add / Edit Customer */}
      {showFormModal && (
        <div id="cust-form-modal" className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 bg-red-700 text-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center space-x-2.5">
                <Users className="h-6 w-6" />
                <div>
                  <h3 className="font-extrabold text-xl text-white">
                    {isEditing ? 'Ubah Data Pelanggan' : 'Form Registrasi Baru'}
                  </h3>
                  <p className="text-[11px] text-red-100">Sistem CustomerPro Premium SaaS Suite</p>
                </div>
              </div>
              <button 
                id="close-cust-form"
                onClick={() => setShowFormModal(false)} 
                className="p-1 rounded-lg hover:bg-red-800 text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-6 flex-1">
              
              {/* SECTION A: Profil Personal */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-extrabold text-red-600 tracking-wider font-mono border-b border-red-100 pb-1.5 flex items-center space-x-2">
                  <Sparkles className="h-3 w-3" />
                  <span>Data Pribadi Pelanggan</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Photo Profile Simulation */}
                  <div className="flex flex-col items-center justify-center space-y-2 p-3 bg-gray-50 rounded-2xl border border-gray-150">
                    <img 
                      src={formPhoto} 
                      alt="Preview Avatar" 
                      className="h-20 w-20 rounded-full object-cover border-2 border-red-500 shadow-md"
                    />
                    <div className="flex items-center space-x-1.5">
                      <Camera className="h-3 w-3 text-red-600" />
                      <span className="text-[9px] font-bold text-gray-500">Avatar Otomatis</span>
                    </div>
                  </div>

                  {/* Name and Phone */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Nama Lengkap *</label>
                        <input
                          id="form-name-input"
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="Dr. Rahmat Kartolo, M.Si"
                          className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Nomor WhatsApp *</label>
                        <input
                          id="form-phone-input"
                          type="text"
                          required
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          placeholder="6281234567xx"
                          className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Email Aktif *</label>
                        <input
                          id="form-email-input"
                          type="email"
                          required
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          placeholder="alamat.nama@email.com"
                          className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">NIK (KTP) *</label>
                        <input
                          id="form-nik-input"
                          type="text"
                          required
                          value={formNik}
                          onChange={(e) => setFormNik(e.target.value)}
                          placeholder="3273xxxxxxxxxxxx"
                          className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Jenis Kelamin</label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setFormGender('Laki-laki')}
                        className={`flex-1 py-2 text-xs rounded-xl border font-bold transition ${
                          formGender === 'Laki-laki' 
                            ? 'bg-red-50 text-red-700 border-red-300' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        Laki-laki
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormGender('Perempuan')}
                        className={`flex-1 py-2 text-xs rounded-xl border font-bold transition ${
                          formGender === 'Perempuan' 
                            ? 'bg-red-50 text-red-700 border-red-300' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        Perempuan
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Tanggal Lahir</label>
                    <input
                      id="form-birthdate-input"
                      type="date"
                      value={formBirthDate}
                      onChange={(e) => setFormBirthDate(e.target.value)}
                      className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Status Keanggotaan</label>
                    <select
                      id="form-status-select"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as 'Aktif' | 'Nonaktif')}
                      className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                    >
                      <option value="Aktif">Aktif (Berlangganan)</option>
                      <option value="Nonaktif">Nonaktif (Suspend / Berhenti)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION B: Alamat Alamat Lengkap */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-extrabold text-red-600 tracking-wider font-mono border-b border-red-100 pb-1.5 flex items-center space-x-2">
                  <MapPin className="h-3 w-3" />
                  <span>Informasi Alamat & Lokasi Domisili</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Provinsi</label>
                    <input
                      id="form-prov-input"
                      type="text"
                      value={formProvinsi}
                      onChange={(e) => setFormProvinsi(e.target.value)}
                      placeholder="Jawa Barat"
                      className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Kabupaten / Kota</label>
                    <input
                      id="form-kab-input"
                      type="text"
                      value={formKabupaten}
                      onChange={(e) => setFormKabupaten(e.target.value)}
                      placeholder="Bandung"
                      className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Kecamatan</label>
                    <input
                      id="form-kec-input"
                      type="text"
                      value={formKecamatan}
                      onChange={(e) => setFormKecamatan(e.target.value)}
                      placeholder="Coblong"
                      className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Desa / Kelurahan</label>
                    <input
                      id="form-desa-input"
                      type="text"
                      value={formDesa}
                      onChange={(e) => setFormDesa(e.target.value)}
                      placeholder="Dago"
                      className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Kode Pos</label>
                    <input
                      id="form-pos-input"
                      type="text"
                      value={formKodePos}
                      onChange={(e) => setFormKodePos(e.target.value)}
                      placeholder="40135"
                      className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Alamat Lengkap (Blok, Rumah, RT/RW)</label>
                  <textarea
                    id="form-alamat-full-textarea"
                    rows={2}
                    value={formAlamatLengkap}
                    onChange={(e) => setFormAlamatLengkap(e.target.value)}
                    placeholder="Jl. Raya Boulevard No. 49, RT 03 RW 09, Cluster Dago Hills"
                    className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* SECTION C: Informasi Layanan Layanan Paket */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-extrabold text-red-600 tracking-wider font-mono border-b border-red-100 pb-1.5 flex items-center space-x-2">
                  <TrendingUp className="h-3 w-3" />
                  <span>Binding Layanan Langganan</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Pilih Paket Layanan</label>
                    <select
                      id="form-package-service-select"
                      value={formPackage}
                      onChange={(e) => selectActivePackage(e.target.value)}
                      className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                    >
                      {packages.map(p => (
                        <option key={p.id} value={p.name}>{p.name} - ({rupiahFormat(p.price)})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Harga Paket Custom (Rp)</label>
                    <input
                      id="form-price-input"
                      type="number"
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Tanggal Mulai Daftar</label>
                    <input
                      id="form-startdate-input"
                      type="date"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Tanggal Jatuh Tempo</label>
                    <input
                      id="form-duedate-input"
                      type="date"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Sales Yang Mendaftarkan</label>
                    <select
                      id="form-sales-select"
                      value={formSales}
                      onChange={(e) => setFormSales(e.target.value)}
                      className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 text-gray-700"
                    >
                      {sales.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.cabang})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Kantor Cabang</label>
                    <select
                      id="form-cabang-select"
                      value={formCabang}
                      onChange={(e) => setFormCabang(e.target.value)}
                      className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 text-gray-700"
                    >
                      <option value="Jakarta">Cabang Jakarta</option>
                      <option value="Bandung">Cabang Bandung</option>
                      <option value="Surabaya">Cabang Surabaya</option>
                      <option value="Yogyakarta">Cabang Yogyakarta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Entitas Perusahaan</label>
                    <select
                      id="form-perusahaan-select"
                      value={formPerusahaan}
                      onChange={(e) => setFormPerusahaan(e.target.value)}
                      className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 text-gray-700"
                    >
                      <option value="Sinergi Net">Sinergi Net</option>
                      <option value="Nusantara Corp">Nusantara Corp</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons sticky */}
              <div className="pt-4 border-t border-gray-150 flex items-center justify-end space-x-3.5 sticky bottom-0 bg-white">
                <button
                  id="cancel-form-btn"
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-5 py-2.5 border border-gray-200 text-xs rounded-xl hover:bg-gray-150 text-gray-700 font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  id="submit-form-btn"
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-xs text-white rounded-xl shadow-md font-bold transition cursor-pointer"
                >
                  Simpan Pelanggan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Full Detailed View Customer (profiling, digital card, gps, change reports, notes app) */}
      {showDetailModal && selectedCust && (
        <div id="cust-detail-modal" className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-150 flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-150 bg-gray-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img 
                  src={selectedCust.photoUrl} 
                  alt={selectedCust.name} 
                  className="h-12 w-12 rounded-full object-cover border-2 border-red-500 shadow-lg"
                />
                <div>
                  <h3 className="font-extrabold text-xl text-white flex items-center space-x-2">
                    <span>{selectedCust.name}</span>
                    <span className="text-[10px] font-mono bg-red-650 text-white rounded py-0.5 px-2 bg-red-600">
                      {selectedCust.customerId}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400">Terdaftar sejak: {selectedCust.startDate} ({selectedCust.cabang} • {selectedCust.perusahaan})</p>
                </div>
              </div>
              <button 
                id="close-cust-detail"
                onClick={() => setShowDetailModal(false)} 
                className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content Bento Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">
              
              {/* Inside Left Panel: Personal Info & PII */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Information Card Block */}
                <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-red-600 font-mono">Informasi Identitas & Kontak</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-gray-400 block font-mono text-[10px] uppercase">NAMA LENGKAP</span>
                      <strong className="text-gray-800 block text-sm">{selectedCust.name}</strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-400 block font-mono text-[10px] uppercase">NOMOR INDUK KEPENDUDUKAN (NIK)</span>
                      <strong className="text-gray-800 block font-mono text-sm">{selectedCust.nik}</strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-400 block font-mono text-[10px] uppercase">WHATSAPP</span>
                      <strong className="text-gray-800 block flex items-center space-x-1.5 font-bold">
                        <Phone className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{selectedCust.phone}</span>
                      </strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-400 block font-mono text-[10px] uppercase">EMAIL ELEKTRONIK</span>
                      <strong className="text-gray-800 block flex items-center space-x-1.5">
                        <Mail className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        <span>{selectedCust.email}</span>
                      </strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-400 block font-mono text-[10px] uppercase">BIODATA LAHIR</span>
                      <strong className="text-gray-800 block">{selectedCust.gender} • Lahir pada {selectedCust.birthDate}</strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-400 block font-mono text-[10px] uppercase">STATUS SIKLUS PAY</span>
                      <div className="mt-1">
                        {selectedCust.status === 'Aktif' ? (
                          <span className="bg-emerald-50 text-emerald-700 font-bold py-1 px-3 text-[10px] rounded-full border border-emerald-100">PELANGGAN AKTIF</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-500 font-bold py-1 px-3 text-[10px] rounded-full border border-gray-200">NONAKTIF/SUSPENDED</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* DOMISILI FULL ADDRESS */}
                <div className="bg-gray-55 p-5 rounded-2xl border border-gray-200 space-y-3.5 bg-white">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-red-600 font-mono flex items-center space-x-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Detail Alamat Pemasangan</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase">PROVINSI</span>
                      <strong className="text-gray-800 block mt-0.5">{selectedCust.alamat.provinsi}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase">KABUPATEN/KOTA</span>
                      <strong className="text-gray-800 block mt-0.5">{selectedCust.alamat.kabupaten}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase">KECAMATAN</span>
                      <strong className="text-gray-800 block mt-0.5">{selectedCust.alamat.kecamatan}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase">DESA / KELURAHAN</span>
                      <strong className="text-gray-800 block mt-0.5">{selectedCust.alamat.desa}</strong>
                    </div>
                  </div>

                  <div className="pt-2 text-xs">
                    <span className="text-gray-400 block font-mono text-[9px] uppercase">ALAMAT LENGKAP</span>
                    <p className="text-gray-800 font-semibold bg-gray-50 p-2.5 rounded-lg border mt-1">{selectedCust.alamat.alamatLengkap} (Kode Pos: {selectedCust.alamat.kodePos})</p>
                  </div>
                </div>

                {/* LOGS CHANGE / PACKAGES HISTORY */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-700 font-mono">Riwayat Perubahan Paket & Registrasi</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {selectedCust.packageHistory.map((h, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-gray-50 last:border-0 font-mono">
                        <div className="flex items-center space-x-2">
                          <span className="h-2 w-2 rounded-full bg-red-600" />
                          <span className="text-gray-700 font-bold">{h.packageName}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-700 font-bold bg-emerald-50 py-0.5 px-1.5 rounded uppercase text-[10px]">{h.action}</span>
                          <span className="block text-[10px] text-gray-400 mt-0.5">{h.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PREMIUM NOTES APP */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-150 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-red-600 font-mono">Catatan Internal & Troubleshooting</h4>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 bg-white p-3.5 rounded-xl border border-gray-100">
                    {selectedCust.notes.map((note, index) => (
                      <div key={index} className="text-xs p-2 rounded bg-gray-50 text-gray-700 border-l-2 border-red-500 font-normal">
                        {note}
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-2 pt-1.5">
                    <input
                      id="detail-note-input"
                      type="text"
                      placeholder="Tambahkan catatan keluhan/update router..."
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                      className="flex-1 bg-white text-xs border border-gray-200 rounded-xl p-2 focus:ring-1 focus:ring-red-500 focus:outline-none"
                    />
                    <button
                      id="detail-note-submit"
                      onClick={handleAddNote}
                      className="bg-gray-900 border font-bold text-xs text-white rounded-xl px-4 py-2 hover:bg-gray-800 hover:text-red-400 transition cursor-pointer"
                    >
                      Kirim
                    </button>
                  </div>
                </div>

              </div>

              {/* Inside Right Panel: Digital Card with QR, and GPS Map coordinate visualization */}
              <div className="space-y-6">
                
                {/* DIGITAL MEMBER CARD */}
                <div className="bg-gradient-to-br from-red-800 to-red-950 p-5 rounded-3xl border border-red-950 shadow-xl relative overflow-hidden flex flex-col justify-between h-80 text-white select-none">
                  <div className="absolute top-0 right-0 p-4 translate-x-4 -translate-y-4 text-white/5 pointer-events-none">
                    <Users className="h-44 w-44" />
                  </div>

                  <div className="flex items-center justify-between z-10">
                    <div className="flex items-center space-x-2">
                      <div className="bg-white p-1 rounded">
                        <QrCode className="h-5 w-5 text-red-800" />
                      </div>
                      <span className="font-extrabold text-xs tracking-wider">CUSTPRO CARD</span>
                    </div>
                    <span className="text-[9px] font-bold uppercase font-mono tracking-widest text-red-200 bg-red-900/40 py-1 px-2.5 rounded-full border border-red-800">Digital ID</span>
                  </div>

                  {/* QR Code and Info block */}
                  <div className="flex items-center justify-between gap-4 mt-6 z-10">
                    <div className="space-y-2">
                      <span className="text-[10px] text-red-300 font-mono uppercase tracking-widest block leading-none">MEMBER DETAIL</span>
                      <strong className="text-base font-black tracking-tight leading-tight block truncate max-w-[140px]">{selectedCust.name}</strong>
                      <span className="font-mono text-xs text-red-200 block">{selectedCust.customerId}</span>
                      <span className="text-[9px] font-bold text-white uppercase block mt-1 py-0.5 px-2 bg-red-650 rounded-full border border-red-800/40 w-max">{selectedCust.packageName.split(' ')[0]} Pack</span>
                    </div>

                    {/* QR Code visual simulation */}
                    <div className="bg-white p-2.5 rounded-2xl flex flex-col items-center justify-center shadow-lg shrink-0 border border-red-900/30">
                      <div className="grid grid-cols-5 gap-1 h-14 w-14">
                        {/* Custom visual patterns for QR */}
                        <div className="bg-gray-900 rounded-sm" />
                        <div className="bg-gray-900 rounded-sm" />
                        <div className="bg-gray-100" />
                        <div className="bg-gray-900 rounded-sm" />
                        <div className="bg-gray-900 rounded-sm" />

                        <div className="bg-gray-900 rounded-sm" />
                        <div className="bg-gray-100" />
                        <div className="bg-gray-900 rounded-sm" />
                        <div className="bg-gray-100" />
                        <div className="bg-gray-900 rounded-sm" />

                        <div className="bg-gray-100" />
                        <div className="bg-gray-900 rounded-sm" />
                        <div className="bg-gray-900 rounded-sm" />
                        <div className="bg-gray-900 rounded-sm" />
                        <div className="bg-gray-100" />

                        <div className="bg-gray-900 rounded-sm" />
                        <div className="bg-gray-100" />
                        <div className="bg-gray-100" />
                        <div className="bg-gray-900 rounded-sm" />
                        <div className="bg-gray-900 rounded-sm" />

                        <div className="bg-gray-900 rounded-sm" />
                        <div className="bg-gray-900 rounded-sm" />
                        <div className="bg-gray-100" />
                        <div className="bg-gray-900 rounded-sm" />
                        <div className="bg-gray-900 rounded-sm" />
                      </div>
                      <span className="text-[8px] font-mono text-gray-500 font-bold mt-1.5 uppercase">SCAN PAS</span>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="border-t border-red-750 pt-2.5 mt-4 flex items-center justify-between text-[9px] font-mono text-red-200 z-10">
                    <span>Masa Aktif S/d:</span>
                    <span className="font-bold text-white">{selectedCust.dueDate}</span>
                  </div>
                </div>

                <div className="text-center font-mono text-xs">
                  <button
                    id="download-card-btn"
                    onClick={() => alert(`Berhasil mendownload Kartu Member Digital dalam format PDF untuk pelanggan: ${selectedCust.name}`)}
                    className="w-full text-center bg-gray-900 hover:bg-gray-800 text-white font-bold p-2.5 rounded-xl transition cursor-pointer"
                  >
                    Cetak Kartu Member Digital
                  </button>
                </div>

                {/* GPS COORDINATE WIDGET SIMULATION */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-700 font-mono">Peta Lokasi GPS</h4>
                    {selectedCust.gpsLocation && (
                      <span className="text-[9px] font-mono text-red-600 bg-red-50 py-0.5 px-2 rounded-full font-bold">
                        {selectedCust.gpsLocation.lat.toFixed(4)}, {selectedCust.gpsLocation.lng.toFixed(4)}
                      </span>
                    )}
                  </div>

                  {/* Styled Map Canvas block */}
                  <div className="relative h-44 bg-slate-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
                    
                    {/* SVG Roadmap representation */}
                    <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M 0 20 L 100 25 M 0 50 L 100 45 M 0 80 Q 50 60 100 85 M 30 0 L 33 100 M 70 0 Q 60 50 72 100" stroke="#CBD5E1" strokeWidth="2.5" fill="none" />
                      <circle cx="20" cy="40" r="1.5" fill="#3B82F6" />
                      <circle cx="50" cy="70" r="1.5" fill="#3B82F6" />
                      <circle cx="80" cy="30" r="1.5" fill="#3B82F6" />
                    </svg>

                    {/* Ping Radar */}
                    <div className="absolute h-8 w-8 bg-red-500/20 rounded-full animate-ping pointer-events-none" />
                    <div className="z-10 bg-red-650 text-red-600 bg-red-100 p-2 rounded-full border-2 border-red-600 shadow-md">
                      <MapPin className="h-5 w-5" />
                    </div>

                    <div className="absolute bottom-2 left-2 z-10 bg-white/95 backdrop-blur-xs p-1.5 rounded border text-[9px] font-bold font-mono">
                      {selectedCust.alamat.kabupaten}, {selectedCust.alamat.kelurahan || selectedCust.alamat.desa}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
