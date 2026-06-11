/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  FileText,
  X,
  PlusCircle,
  Tag
} from 'lucide-react';
import { ServicePackage, UserRole } from '../types';

interface SystemPackagesProps {
  packages: ServicePackage[];
  activeRole: UserRole;
  onSavePackage: (pkg: ServicePackage) => void;
  onDeletePackage: (id: string) => void;
}

export default function SystemPackages({
  packages,
  activeRole,
  onSavePackage,
  onDeletePackage
}: SystemPackagesProps) {

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formDuration, setFormDuration] = useState(30);
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Tidak Aktif'>('Aktif');
  const [newFeature, setNewFeature] = useState('');
  const [featuresList, setFeaturesList] = useState<string[]>([]);

  // Open Add Form
  const handleAddNewPkg = () => {
    setIsEditing(false);
    setFormId('');
    setFormName('');
    setFormPrice(150000);
    setFormDuration(30);
    setFormStatus('Aktif');
    setFeaturesList(['Kecepatan simetris 1:1', 'Tanpa batasan kuota (FUP)', 'Router standar gratis']);
    setNewFeature('');
    setShowModal(true);
  };

  // Open Edit Form
  const handleEditPkg = (p: ServicePackage) => {
    setIsEditing(true);
    setFormId(p.id);
    setFormName(p.name);
    setFormPrice(p.price);
    setFormDuration(p.duration);
    setFormStatus(p.status);
    setFeaturesList([...p.features]);
    setNewFeature('');
    setShowModal(true);
  };

  // Append single features tag to current list
  const addFeatureItem = () => {
    if (!newFeature.trim()) return;
    setFeaturesList([...featuresList, newFeature.trim()]);
    setNewFeature('');
  };

  const removeFeatureItem = (idx: number) => {
    setFeaturesList(featuresList.filter((_, i) => i !== idx));
  };

  // Save changes
  const handleSubmitPkg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) {
      alert('Nama Paket wajib diisi.');
      return;
    }

    const uniqueId = formId || 'pkg-' + Date.now();
    
    const payload: ServicePackage = {
      id: uniqueId,
      name: formName,
      price: formPrice,
      duration: formDuration,
      features: featuresList,
      status: formStatus
    };

    onSavePackage(payload);
    setShowModal(false);
  };

  const rupiahFormat = (val: number) => {
    return 'Rp' + val.toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-50 p-2 text-red-600 rounded-xl">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-gray-950">Konfigurasi Sistem Paket Layanan</h2>
              <p className="text-xs text-gray-500">Buat, modifikasi, dan suspend ketersediaan paket internet langganan pada platform Anda.</p>
            </div>
          </div>
          {activeRole === 'Super Admin' && (
            <button
              id="add-package-btn"
              onClick={handleAddNewPkg}
              className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer self-start md:self-center"
            >
              <Plus className="h-4 w-4" />
              <span>Buat Paket Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid List Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        {packages.map((pkg) => {
          const isActive = pkg.status === 'Aktif';
          return (
            <div 
              id={`package-card-${pkg.id}`}
              key={pkg.id} 
              className={`bg-white rounded-3xl border shadow-xs p-6 flex flex-col justify-between space-y-5 transition duration-200
                ${isActive ? 'border-gray-150 hover:border-red-500 hover:shadow-lg hover:shadow-red-900/5' : 'border-gray-200 bg-gray-50/50 opacity-75'}`}
            >
              
              <div className="space-y-4">
                {/* Header card badge status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 p-1 bg-red-50 text-red-700 rounded-lg text-[10px] font-bold border border-red-100 px-2 uppercase font-mono">
                    <Tag className="h-3 w-3" />
                    <span>ISP PACKS</span>
                  </div>
                  <div>
                    {isActive ? (
                      <span className="inline-flex items-center space-x-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 py-0.5 px-2 rounded-full">
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                        <span>Aktif</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-[9px] font-bold text-gray-500 bg-gray-100 border border-gray-200 py-0.5 px-2 rounded-full">
                        <XCircle className="h-3 w-3 shrink-0" />
                        <span>Nonaktif</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Name Price */}
                <div className="space-y-1">
                  <h3 className="font-extrabold text-lg text-gray-950 truncate">{pkg.name}</h3>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-black text-red-700 leading-none">{rupiahFormat(pkg.price)}</span>
                    <span className="text-xs text-gray-500 font-mono">/ {pkg.duration} Hari</span>
                  </div>
                </div>

                {/* Features details Checklist */}
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block font-mono">Benefit Utama Paket:</span>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {pkg.features.map((feat, i) => (
                      <div key={i} className="flex items-start space-x-2 text-xs">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-gray-650 leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              {activeRole === 'Super Admin' && (
                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    id={`edit-pkg-btn-${pkg.id}`}
                    onClick={() => handleEditPkg(pkg)}
                    className="p-1 px-3 bg-gray-950 rounded-lg text-white font-bold text-[10px] hover:text-red-400 hover:bg-gray-800 transition shadow-xs cursor-pointer"
                  >
                    Edit Paket
                  </button>
                  <button
                    id={`delete-pkg-btn-${pkg.id}`}
                    onClick={() => {
                      if (confirm(`Apakah Anda yakin menghapus paket ${pkg.name}? Ini dapat merusak customer bering terdaftar.`)) {
                        onDeletePackage(pkg.id);
                      }
                    }}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Hapus Paket"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL FORM: ADD OR EDIT CARDS */}
      {showModal && (
        <div id="pkg-form-modal" className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-150 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-lg text-gray-900">
                {isEditing ? 'Ubah Data Paket' : 'Registrasi Paket Baru'}
              </h3>
              <button 
                id="close-pkg-form"
                onClick={() => setShowModal(false)} 
                className="p-1 text-gray-400 hover:text-red-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPkg} className="space-y-4 text-xs font-normal">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Nama Paket Layanan *</label>
                <input
                  id="pkg-name-input"
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Gamer Ultra (200 Mbps)"
                  className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Nominal Harga (Rp) *</label>
                  <input
                    id="pkg-price-input"
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Masa Aktif (Hari)</label>
                  <input
                    id="pkg-duration-input"
                    type="number"
                    required
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Status Ketersediaan</label>
                <select
                  id="pkg-status-select"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'Aktif' | 'Tidak Aktif')}
                  className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak-Aktif">Tidak Aktif</option>
                </select>
              </div>

              {/* Dynamic array input tags for features benefits list */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Tag Feature Keuntungan Paket</label>
                <div className="flex space-x-2">
                  <input
                    id="new-feature-input"
                    type="text"
                    placeholder="Contoh: Gratis Set Top Box"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeatureItem())}
                    className="flex-1 bg-gray-50 text-xs border border-gray-200 rounded-xl p-2 focus:bg-white focus:outline-none"
                  />
                  <button
                    id="add-feature-btn"
                    type="button"
                    onClick={addFeatureItem}
                    className="bg-gray-950 hover:bg-gray-800 text-white p-2 rounded-xl text-xs font-bold font-mono px-3 cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2 max-h-24 overflow-y-auto">
                  {featuresList.map((feat, idx) => (
                    <span key={idx} className="inline-flex items-center space-x-1 text-[10px] uppercase font-bold text-red-700 bg-red-50 border border-red-100 py-1 px-2.5 rounded-lg">
                      <span className="truncate max-w-[150px]">{feat}</span>
                      <button 
                        type="button"
                        onClick={() => removeFeatureItem(idx)}
                        className="text-red-400 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {featuresList.length === 0 && (
                    <span className="text-[10px] text-gray-400 italic font-medium">Belum ada benefit ditambahkan.</span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t flex space-x-2">
                <button
                  id="cancel-pkg"
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border rounded-xl hover:bg-gray-50 text-xs text-gray-700 font-bold"
                >
                  Batal
                </button>
                <button
                  id="submit-pkg"
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md font-bold text-xs transition cursor-pointer"
                >
                  Simpan Paket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
