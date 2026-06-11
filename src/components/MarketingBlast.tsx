/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  QrCode, 
  MapPin, 
  Send, 
  MessageSquare, 
  Users, 
  Search, 
  Check, 
  AlertCircle, 
  FileText,
  Sparkles,
  Wifi,
  Smartphone,
  Play
} from 'lucide-react';
import { Customer, ServicePackage, UserRole } from '../types';

interface MarketingBlastProps {
  customers: Customer[];
  packages: ServicePackage[];
  activeRole: UserRole;
  selectedCabang: string;
  selectedPerusahaan: string;
}

export default function MarketingBlast({
  customers,
  packages,
  activeRole,
  selectedCabang,
  selectedPerusahaan
}: MarketingBlastProps) {

  // Primary active visual view inside Premium
  const [activeSubTab, setActiveSubTab] = useState<'qr' | 'blast' | 'gps'>('qr');

  // 1. QR Member Scanner states
  const [scannedResult, setScannedResult] = useState<Customer | null>(null);
  const [scannedError, setScannedError] = useState('');
  const [scanTargetId, setScanTargetId] = useState('');

  // 2. WhatsApp Blast states
  const [msgCriteria, setMsgCriteria] = useState('All'); // 'All' | 'Aktif' | 'Nonaktif' | 'Terlambat'
  const [blastTemplate, setBlastTemplate] = useState(
    `PEMBERITAHUAN PELANGGAN CUSTOMERPRO\n\nYth, {NAME}\nID: {ID}\nLayanan: {PACKAGE}\n\nKami menginformasikan koneksi internet Anda sedang dalam performa optimal. Silakan lakukan pembayaran tagihan bulanan Anda sebelum jatuh tempo {DUE_DATE} sebesar {PRICE} agar dapat terus berselancar tanpa gangguan.\n\nTerima kasih atas kepercayaan Anda.`
  );
  const [blastLogs, setBlastLogs] = useState<string[]>([]);
  const [blastingState, setBlastingState] = useState(false);

  // 3. Filtering Customers for GPS & General
  const filteredMapCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchCabang = selectedCabang === 'Semua Cabang' || c.cabang === selectedCabang;
      const matchPerusahaan = selectedPerusahaan === 'Semua Perusahaan' || c.perusahaan === selectedPerusahaan;
      return matchCabang && matchPerusahaan;
    });
  }, [customers, selectedCabang, selectedPerusahaan]);

  // Handle scan action simulator
  const triggerScanSimulate = (id: string) => {
    setScannedResult(null);
    setScannedError('');
    if (!id) {
      setScannedError('ID Pelanggan tidak valid atau belum dipilih.');
      return;
    }
    
    const count = Math.random() * 1000;
    setTimeout(() => {
      const matched = customers.find(c => c.id === id);
      if (matched) {
        setScannedResult(matched);
      } else {
        setScannedError('Pelanggan tidak ditemukan di database.');
      }
    }, 800);
  };

  // Handle Blast simulation
  const triggerBlastSimulator = () => {
    if (blastingState) return;
    setBlastLogs([]);
    setBlastingState(true);

    const targets = customers.filter(c => {
      if (msgCriteria === 'All') return c.status === 'Aktif';
      if (msgCriteria === 'Aktif') return c.status === 'Aktif';
      if (msgCriteria === 'Nonaktif') return c.status === 'Nonaktif';
      if (msgCriteria === 'Terlambat') return c.paymentStatus === 'Terlambat';
      return true;
    });

    if (targets.length === 0) {
      setBlastLogs(['[ERROR] Tidak ditemukan nomor pelanggan yang cocok dengan kriteria filter.']);
      setBlastingState(false);
      return;
    }

    setBlastLogs(prev => [...prev, `[START] Memulai antrian WhatsApp Blast untuk ${targets.length} pelanggan...`]);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= targets.length) {
        clearInterval(interval);
        setBlastLogs(prev => [...prev, `[SUKSES] Seluruh ${targets.length} pesan broadcast berhasil dikirim ke WhatsApp Gateway!`]);
        setBlastingState(false);
        return;
      }

      const client = targets[idx];
      let personalizedMsg = blastTemplate
        .replace(/{NAME}/g, client.name)
        .replace(/{ID}/g, client.customerId)
        .replace(/{PACKAGE}/g, client.packageName)
        .replace(/{DUE_DATE}/g, client.dueDate)
        .replace(/{PRICE}/g, 'Rp ' + client.price.toLocaleString('id-ID'));

      setBlastLogs(prev => [
        ...prev,
        `[${idx + 1}/${targets.length}] Mengirim pesan WA ke ${client.name} (${client.phone}) - Berhasil!`
      ]);
      
      idx++;
    }, 400);
  };

  const rupiahFormat = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Tab Toggles */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-50 p-2 text-red-600 rounded-xl">
              <Sparkles className="h-5 w-5 animate-spin" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-gray-950">Fitur Premium & GPS Terintegrasi</h2>
              <p className="text-xs text-gray-500">Scan QR member card fisik, lakukan blast WhatsApp ke ratusan pengguna, dan tinjau sebaran koordinat Map GPS.</p>
            </div>
          </div>
        </div>

        {/* Navigation Selector subtabs */}
        <div className="flex border-b border-gray-100 pt-2 text-xs font-bold font-mono">
          <button
            id="subtab-qr"
            onClick={() => setActiveSubTab('qr')}
            className={`py-2 px-4 border-b-2 transition ${activeSubTab === 'qr' ? 'border-red-600 text-red-700' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
          >
            Digital QR Scanner
          </button>
          <button
            id="subtab-blast"
            onClick={() => setActiveSubTab('blast')}
            className={`py-2 px-4 border-b-2 transition ${activeSubTab === 'blast' ? 'border-red-600 text-red-700' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
          >
            WhatsApp Blast Engine
          </button>
          <button
            id="subtab-gps"
            onClick={() => setActiveSubTab('gps')}
            className={`py-2 px-4 border-b-2 transition ${activeSubTab === 'gps' ? 'border-red-600 text-red-700' : 'border-transparent text-gray-400 hover:text-gray-900'}`}
          >
            Peta Sebaran GPS
          </button>
        </div>
      </div>

      {/* SUBTAB 1: DIGITAL QR SCANNER CAMERA SIMULATOR */}
      {activeSubTab === 'qr' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          
          {/* Camera frame preview simulator */}
          <div className="bg-gray-950 rounded-2xl p-6 border border-gray-800 text-white flex flex-col justify-between h-96 relative overflow-hidden">
            <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 text-xs font-bold text-red-400">
              <Wifi className="h-4 w-4 animate-pulse" />
              <span>DIGITAL SCANNER CAM ENABLED</span>
            </div>

            {/* Simulated green camera scanner bounds */}
            <div className="absolute inset-0 p-12 flex items-center justify-center pointer-events-none">
              <div className="h-48 w-48 border-2 border-dashed border-emerald-500 rounded-2xl relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-x-0 h-0.5 bg-emerald-500 top-0 animate-bounce" />
                <QrCode className="h-16 w-16 text-emerald-500 opacity-20" />
              </div>
            </div>

            {/* Select customer client dropdown to scan */}
            <div className="z-10 mt-auto bg-gray-900/90 backdrop-blur-xs p-4 rounded-xl space-y-3 border border-gray-800">
              <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">Pilih Pelanggan Untuk Di-scan</span>
              <div className="flex space-x-2">
                <select
                  id="scan-target-select"
                  value={scanTargetId}
                  onChange={(e) => setScanTargetId(e.target.value)}
                  className="flex-1 bg-gray-950 text-xs border border-gray-800 p-2 text-gray-200 rounded-lg"
                >
                  <option value="">-- PILIH CLIENT --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.customerId})</option>
                  ))}
                </select>
                <button
                  id="scan-btn-simulate"
                  onClick={() => triggerScanSimulate(scanTargetId)}
                  className="bg-red-600 hover:bg-red-700 text-xs font-bold text-white py-2 px-4 rounded-lg transition shrink-0 cursor-pointer"
                >
                  Scan ID
                </button>
              </div>
            </div>
          </div>

          {/* Scanner Decoded Customer results details panel */}
          <div className="bg-white rounded-2xl p-6 border border-gray-150 flex flex-col justify-center min-h-[300px]">
            {scannedResult ? (
              <div id="scan-res-success" className="space-y-4 animate-fade-in-up">
                <div className="flex items-center space-x-3.5 pb-4 border-b">
                  <img 
                    src={scannedResult.photoUrl} 
                    alt={scannedResult.name} 
                    className="h-14 w-14 rounded-full object-cover border-2 border-red-500"
                  />
                  <div>
                    <h3 className="font-extrabold text-lg text-gray-950">{scannedResult.name}</h3>
                    <span className="inline-block mt-0.5 font-mono text-[10px] font-bold bg-gray-950 text-white rounded py-0.5 px-2 uppercase tracking-wide">
                      {scannedResult.customerId}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-sans pt-2">
                  <div className="space-y-0.5">
                    <span className="text-gray-400 font-mono text-[9px] uppercase block">WhatsApp</span>
                    <strong className="text-gray-800 block">{scannedResult.phone}</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-gray-400 font-mono text-[9px] uppercase block">Layanan Internet</span>
                    <strong className="text-red-700 block font-bold">{scannedResult.packageName}</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-gray-400 font-mono text-[9px] uppercase block">Kantor Cabang</span>
                    <strong className="text-gray-800 block">{scannedResult.cabang}</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-gray-400 font-mono text-[9px] uppercase block">Siklus Jatuh Tempo</span>
                    <strong className="text-gray-800 block font-mono">{scannedResult.dueDate}</strong>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-100 p-3.5 rounded-xl flex items-center justify-between text-xs mt-4">
                  <div className="flex items-center space-x-2">
                    {scannedResult.paymentStatus === 'Lunas' ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 block shrink-0" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500 block shrink-0 animate-pulse" />
                    )}
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase font-mono">STATUS BILLING</span>
                      <strong className="text-gray-800 block uppercase">{scannedResult.paymentStatus}</strong>
                    </div>
                  </div>
                  <strong className="text-red-750 font-black text-sm">{rupiahFormat(scannedResult.price)}</strong>
                </div>

                <div className="text-center font-mono text-[10px] text-emerald-600 bg-emerald-50 py-1 px-3 border border-emerald-100 rounded">
                  PELANGGAN TER-VERIFIKASI SAH DAN VALID
                </div>
              </div>
            ) : scannedError ? (
              <div className="text-center p-8 space-y-2">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                <p className="text-sm font-bold text-gray-800">{scannedError}</p>
                <p className="text-xs text-gray-500">Pilih ID pelanggan yang terdaftar untuk simulasi sukses scan.</p>
              </div>
            ) : (
              <div className="text-center p-8 space-y-3">
                <QrCode className="h-16 w-16 text-gray-300 mx-auto animate-pulse" />
                <h4 className="font-bold text-gray-700 text-sm">Menunggu Hasil Scan QR Code...</h4>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">Silakan pilih salah satu kode atau ID pelanggan di panel kamera sebelah kiri, kemudian tekan tombol "Scan ID" untuk membaca dekripsi metadata digital.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: WHATSAPP BLAST ENGINE SIMULATOR */}
      {activeSubTab === 'blast' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-xs">
          
          {/* Customizer Panel */}
          <div className="bg-white p-5 rounded-2xl border border-gray-150 space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-gray-950">WhatsApp Blast Template Engine</h3>
              <p className="text-xs text-gray-500">Gunakan tag dinamis seperti <strong className="font-mono text-xs">{'{NAME}'}</strong>, <strong className="font-mono text-xs">{'{ID}'}</strong>, <strong className="font-mono text-xs">{'{PACKAGE}'}</strong> untuk memformulasikan bulk SMS.</p>
            </div>

            <div className="space-y-3.5 font-normal">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Target Kirim Blast (Filter Status)</label>
                <select
                  id="blast-criteria-select"
                  value={msgCriteria}
                  onChange={(e) => setMsgCriteria(e.target.value)}
                  className="w-full bg-gray-50 text-xs border border-gray-200 rounded-xl p-2.5 focus:bg-white"
                >
                  <option value="All">Seluruh Pelanggan Aktif ({customers.filter(c => c.status === 'Aktif').length} orang)</option>
                  <option value="Aktif">Hanya Pelanggan Terbayar Lunas ({customers.filter(c => c.paymentStatus === 'Lunas').length} orang)</option>
                  <option value="Nonaktif">Hanya Pelanggan Nonaktif Suspend ({customers.filter(c => c.status === 'Nonaktif').length} orang)</option>
                  <option value="Terlambat">Hanya Pelanggan Menunggak Terlambat ({customers.filter(c => c.paymentStatus === 'Terlambat').length} orang)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Isi Pesan Blast Template (WA Gateway)</label>
                <textarea
                  id="blast-template-textarea"
                  rows={8}
                  value={blastTemplate}
                  onChange={(e) => setBlastTemplate(e.target.value)}
                  className="w-full bg-gray-50 text-xs font-mono border border-gray-200 rounded-xl p-3 focus:bg-white leading-relaxed"
                />
              </div>

              <button
                id="blast-submit-trigger"
                onClick={triggerBlastSimulator}
                disabled={blastingState}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold p-3 rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer shadow-md"
              >
                <Send className="h-4 w-4" />
                <span>{blastingState ? 'Broadcast Berjalan...' : 'Kirim WhatsApp Blast Massal'}</span>
              </button>
            </div>
          </div>

          {/* Broadcasting Terminal Logs */}
          <div className="bg-gray-950 rounded-2xl p-5 border border-gray-805 text-white flex flex-col justify-between min-h-[350px]">
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[320px] pr-1 font-mono text-[10px] leading-relaxed">
              <span className="block text-amber-400 text-[11px] uppercase font-bold border-b border-gray-800 pb-1.5 font-sans">
                BULK ENGINE BROADCAST LOGS TERMINAL
              </span>
              
              {blastLogs.map((log, index) => {
                const isError = log.includes('ERROR');
                const isSuccess = log.includes('SUKSES');
                const isStart = log.includes('START');
                return (
                  <p 
                    key={index} 
                    className={`
                      ${isError ? 'text-red-400 font-bold' : isSuccess ? 'text-emerald-400 font-bold' : isStart ? 'text-blue-400 font-bold' : 'text-gray-300'}
                    `}
                  >
                    {log}
                  </p>
                );
              })}

              {!blastingState && blastLogs.length === 0 && (
                <div className="h-full flex items-center justify-center py-20 text-center text-gray-500 italic font-sans text-xs">
                  Sistem idle... Siap meluncurkan kampanye broadcast massal.
                </div>
              )}
            </div>

            {blastingState && (
              <div className="mt-4 p-2 bg-gray-900 border border-gray-800 rounded text-center text-amber-400 font-mono text-[11px] animate-pulse">
                WHATSAPP GATEWAY BULK ENGINE BERJALAN... JANGAN TUTUP TAB INI!
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: GEOGRAPHIC MAPS SEBARAN COORDINATE SIMULATOR */}
      {activeSubTab === 'gps' && (
        <div className="bg-white p-5 rounded-2xl border border-gray-150 animate-fade-in space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-gray-950">Peta Sebaran Pelanggan (Regional Geographic GPS)</h3>
            <p className="text-xs text-gray-500">Visualisasi bintik koordinasi sebaran geografis instalasi Wi-Fi langganan di wilayah terpilih ({selectedCabang}).</p>
          </div>

          {/* Styled high quality Vector Map Sebaran */}
          <div className="h-96 w-full bg-slate-900 rounded-2xl relative border border-slate-950 flex overflow-hidden">
            
            {/* Dark futuristic cyber geographic vector board mockup */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M 0 10 Q 50 40 100 10 M 0 40 L 100 45 M 0 70 Q 30 80 100 65 M 20 0 L 25 L 100 M 50 0 Q 60 50 45 100 M 80 0 L 85 L 100" stroke="#FFF" strokeWidth="1" fill="none" />
                <circle cx="15" cy="15" r="1" fill="#FFF" />
                <circle cx="45" cy="55" r="1" fill="#FFF" />
                <circle cx="85" cy="75" r="1" fill="#FFF" />
              </svg>
            </div>

            {/* Simulated custom pins loop mapped */}
            {filteredMapCustomers.map((cust) => {
              // Map dynamic simulated local client styles from latent random/assigned coordinates for aesthetic grid layout
              const customLatOffset = Math.abs(cust.id.charCodeAt(2) || 120) % 70 + 15;
              const customLngOffset = Math.abs(cust.id.charCodeAt(3) || 100) % 70 + 15;

              return (
                <div 
                  id={`map-pin-${cust.id}`}
                  key={cust.id} 
                  className="absolute pointer-events-auto cursor-pointer group flex items-center justify-center transition"
                  style={{ top: `${customLatOffset}%`, left: `${customLngOffset}%` }}
                  title={`${cust.name} (${cust.packageName})`}
                >
                  {/* Radar ping ring */}
                  <div className={`absolute h-6 w-6 rounded-full animate-ping pointer-events-none opacity-40
                    ${cust.paymentStatus === 'Lunas' ? 'bg-emerald-500' : 'bg-red-500'}`} 
                  />
                  <div className={`relative h-3.5 w-3.5 rounded-full border border-white shrink-0 shadow-md transition group-hover:scale-130 duration-200
                    ${cust.paymentStatus === 'Lunas' ? 'bg-emerald-500' : 'bg-red-600'}`} 
                  />

                  {/* Bubble detail tooltip hover popup cards */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-950 text-white text-[10px] p-2.5 rounded-xl border border-gray-800 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-focus:opacity-100 transition whitespace-nowrap z-25">
                    <strong className="block text-white leading-none font-bold text-xs">{cust.name}</strong>
                    <span className="block text-[9px] text-red-400 mt-1">{cust.packageName}</span>
                    <span className="block text-[8px] text-gray-400 font-mono mt-0.5">{cust.cabang} • {cust.paymentStatus}</span>
                  </div>
                </div>
              );
            })}

            {filteredMapCustomers.length === 0 && (
              <div className="m-auto font-sans text-gray-500 text-xs text-medium">
                Sistem tidak mendeteksi koordinat GPS map pada region penyaringan terpilih.
              </div>
            )}

            {/* Map Legends */}
            <div className="absolute bottom-4 left-4 z-10 bg-slate-950/90 backdrop-blur-xs p-3.5 rounded-xl border border-slate-800 space-y-2 text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">
              <span className="block text-white mb-1 tracking-widest text-[11px]">PETUNJUK PETA</span>
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Pelanggan Aktif Lunas</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                <span>Pelanggan Menunggak (Terlambat)</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
