/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Customer, Invoice, ServicePackage, SalesRepresentative, CommissionReceipt, AppNotification, Employee, Attendance } from '../types';
import { firestoreService } from './firestoreService';

// Standard Initial Seed Data for Instant SaaS Premium Visuals
const INITIAL_PACKAGES: ServicePackage[] = [
  {
    id: 'pkg-lite',
    name: 'Lite Home (10 Mbps)',
    price: 150000,
    duration: 30,
    features: ['Kecepatan hingga 10 Mbps', 'Kuota Tanpa Batas (FUP)', 'Layanan Bantuan 24/7', 'Ideal untuk 1-3 perangkat'],
    status: 'Aktif'
  },
  {
    id: 'pkg-standard',
    name: 'Standard Family (30 Mbps)',
    price: 250000,
    duration: 30,
    features: ['Kecepatan hingga 30 Mbps', 'Kuota Tanpa Batas (No FUP)', 'Dukungan Prioritas', 'Ideal untuk 4-8 perangkat', 'Gratis Router Standar'],
    status: 'Aktif'
  },
  {
    id: 'pkg-pro',
    name: 'Pro Premium (100 Mbps)',
    price: 450000,
    duration: 30,
    features: ['Kecepatan hingga 100 Mbps', 'Prioritas Bandwidth Utama', 'Dedicated SLA 99%', 'Ideal untuk Kantor & Smart Home', 'Gratis Router Dual Band'],
    status: 'Aktif'
  },
  {
    id: 'pkg-enterprise',
    name: 'Enterprise Giga (500 Mbps)',
    price: 1200000,
    duration: 30,
    features: ['Kecepatan hingga 500 Mbps', 'Dedicated Fiber Optic', 'Dukungan On-Site 4 Jam', 'IP Publik Statis', 'Router Kelas Bisnis'],
    status: 'Tidak Aktif'
  }
];

const INITIAL_SALES: SalesRepresentative[] = [
  {
    id: 'sales-1',
    name: 'Andi Wijaya',
    phone: '081234567801',
    email: 'andi.wijaya@customerpro.id',
    commissionRate: 10, // 10%
    targetSales: 8000000,
    totalCustomers: 5,
    totalCommissionEarned: 450000,
    cabang: 'Jakarta'
  },
  {
    id: 'sales-2',
    name: 'Budi Santoso',
    phone: '081234567802',
    email: 'budi.santoso@customerpro.id',
    commissionRate: 12, // 12%
    targetSales: 5000000,
    totalCustomers: 3,
    totalCommissionEarned: 240000,
    cabang: 'Bandung'
  },
  {
    id: 'sales-3',
    name: 'Citra Dewi',
    phone: '081234567803',
    email: 'citra.dewi@customerpro.id',
    commissionRate: 15, // 15%
    targetSales: 10000000,
    totalCustomers: 4,
    totalCommissionEarned: 752500,
    cabang: 'Surabaya'
  }
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    customerId: 'CP-0001',
    name: 'Dr. Fauzan Ahmad',
    phone: '085299448811',
    email: 'fauzan.ahmad@gmail.com',
    nik: '3273012345670001',
    gender: 'Laki-laki',
    birthDate: '1988-04-12',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60',
    status: 'Aktif',
    alamat: {
      provinsi: 'DKI Jakarta',
      kabupaten: 'Jakarta Selatan',
      kecamatan: 'Kebayoran Baru',
      desa: 'Selong',
      alamatLengkap: 'Jl. Senopati No. 45, Kebayoran Baru',
      kodePos: '12110'
    },
    packageName: 'Pro Premium (100 Mbps)',
    price: 450000,
    startDate: '2026-01-10',
    dueDate: '2026-07-10',
    paymentStatus: 'Lunas',
    salesId: 'sales-1',
    createdAt: '2026-01-10T08:00:00Z',
    notes: ['Pelanggan minta pemasangan kabel rapi melalui pipa paralon.', 'Sangat responsif terhadap tagihan.'],
    packageHistory: [
      { packageName: 'Standard Family (30 Mbps)', date: '2026-01-10', action: 'Daftar Baru' },
      { packageName: 'Pro Premium (100 Mbps)', date: '2026-03-10', action: 'Upgrade Paket' }
    ],
    gpsLocation: { lat: -6.2297, lng: 106.8159 },
    cabang: 'Jakarta',
    perusahaan: 'Sinergi Net'
  },
  {
    id: 'cust-2',
    customerId: 'CP-0002',
    name: 'Indah Kusuma Wardani',
    phone: '081122334455',
    email: 'indah.kusuma@yahoo.com',
    nik: '3204015609910003',
    gender: 'Perempuan',
    birthDate: '1991-09-16',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60',
    status: 'Aktif',
    alamat: {
      provinsi: 'Jawa Barat',
      kabupaten: 'Bandung',
      kecamatan: 'Coblong',
      desa: 'Dago',
      alamatLengkap: 'Jl. Dago Elok Raya No. 12B',
      kodePos: '40135'
    },
    packageName: 'Standard Family (30 Mbps)',
    price: 250000,
    startDate: '2026-02-15',
    dueDate: '2026-07-15',
    paymentStatus: 'Lunas',
    salesId: 'sales-2',
    createdAt: '2026-02-15T09:30:00Z',
    notes: ['Router diletakkan di ruang keluarga lantai 2.', 'Sering minta cek sinyal Wi-Fi sudut kamar belakang.'],
    packageHistory: [
      { packageName: 'Standard Family (30 Mbps)', date: '2026-02-15', action: 'Daftar Baru' }
    ],
    gpsLocation: { lat: -6.8859, lng: 107.6136 },
    cabang: 'Bandung',
    perusahaan: 'Nusantara Corp'
  },
  {
    id: 'cust-3',
    customerId: 'CP-0003',
    name: 'Rian Hidayatullah',
    phone: '087855663322',
    email: 'rian.hidayat@outlook.com',
    nik: '3578011211750002',
    gender: 'Laki-laki',
    birthDate: '1975-11-12',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
    status: 'Aktif',
    alamat: {
      provinsi: 'Jawa Timur',
      kabupaten: 'Surabaya',
      kecamatan: 'Gubeng',
      desa: 'Airlangga',
      alamatLengkap: 'Kertajaya Indah Timur XI-A No. 56',
      kodePos: '60115'
    },
    packageName: 'Lite Home (10 Mbps)',
    price: 150000,
    startDate: '2026-03-01',
    dueDate: '2026-07-01',
    paymentStatus: 'Belum Bayar',
    salesId: 'sales-3',
    createdAt: '2026-03-01T10:15:00Z',
    notes: ['Minta reminder pembayaran H-3 jatuh tempo.', 'Koneksi digunakan untuk WFH.'],
    packageHistory: [
      { packageName: 'Lite Home (10 Mbps)', date: '2026-03-01', action: 'Daftar Baru' }
    ],
    gpsLocation: { lat: -7.2754, lng: 112.7533 },
    cabang: 'Surabaya',
    perusahaan: 'Sinergi Net'
  },
  {
    id: 'cust-4',
    customerId: 'CP-0004',
    name: 'Budi Hermawan',
    phone: '089922336677',
    email: 'budi.hermawan@gmail.com',
    nik: '3273051010800004',
    gender: 'Laki-laki',
    birthDate: '1980-10-10',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60',
    status: 'Aktif',
    alamat: {
      provinsi: 'DKI Jakarta',
      kabupaten: 'Jakarta Timur',
      kecamatan: 'Matraman',
      desa: 'Utan Kayu Utara',
      alamatLengkap: 'Jl. Utan Kayu Raya No. 89C',
      kodePos: '13120'
    },
    packageName: 'Lite Home (10 Mbps)',
    price: 150000,
    startDate: '2026-04-05',
    dueDate: '2026-06-05', // Terlambat
    paymentStatus: 'Terlambat',
    salesId: 'sales-1',
    createdAt: '2026-04-05T14:22:00Z',
    notes: ['Nomor sering tidak aktif jika ditagih.', 'Ada kendala finansial keluarga.'],
    packageHistory: [
      { packageName: 'Lite Home (10 Mbps)', date: '2026-04-05', action: 'Daftar Baru' }
    ],
    gpsLocation: { lat: -6.2081, lng: 106.8681 },
    cabang: 'Jakarta',
    perusahaan: 'Sinergi Net'
  },
  {
    id: 'cust-5',
    customerId: 'CP-0005',
    name: 'Siti Rahmawati',
    phone: '081344556699',
    email: 'siti.rahma@gmail.com',
    nik: '3471025512950005',
    gender: 'Perempuan',
    birthDate: '1995-12-15',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=60',
    status: 'Nonaktif',
    alamat: {
      provinsi: 'DI Yogyakarta',
      kabupaten: 'Sleman',
      kecamatan: 'Depok',
      desa: 'Caturtunggal',
      alamatLengkap: 'Ringroad Utara No. 220, Depok',
      kodePos: '55281'
    },
    packageName: 'Standard Family (30 Mbps)',
    price: 250000,
    startDate: '2026-01-20',
    dueDate: '2026-05-20',
    paymentStatus: 'Belum Bayar',
    salesId: 'sales-3',
    createdAt: '2026-01-20T11:00:00Z',
    notes: ['Pelanggan pindah domisili ke Luar Jawa.', 'Layanan di-suspend sementara per Mei 2026.'],
    packageHistory: [
      { packageName: 'Standard Family (30 Mbps)', date: '2026-01-20', action: 'Daftar Baru' }
    ],
    gpsLocation: { lat: -7.7713, lng: 110.3951 },
    cabang: 'Yogyakarta',
    perusahaan: 'Nusantara Corp'
  },
  {
    id: 'cust-6',
    customerId: 'CP-0006',
    name: 'Wahyudi Pratama',
    phone: '081299887755',
    email: 'wahyudi.pratama@mhs.id',
    nik: '3204121503990001',
    gender: 'Laki-laki',
    birthDate: '1999-03-15',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=60',
    status: 'Aktif',
    alamat: {
      provinsi: 'Jawa Barat',
      kabupaten: 'Bandung',
      kecamatan: 'Sumur Bandung',
      desa: 'Braga',
      alamatLengkap: 'Jl. Naripan No. 44',
      kodePos: '40111'
    },
    packageName: 'Standard Family (30 Mbps)',
    price: 250000,
    startDate: '2026-05-11',
    dueDate: '2026-06-11', // Hari ini jatuh tempo!
    paymentStatus: 'Belum Bayar',
    salesId: 'sales-2',
    createdAt: '2026-05-11T16:45:00Z',
    notes: ['Gamer aktif, ping stabil sangat krusial.', 'Gunakan router mikrotik pribadi.'],
    packageHistory: [
      { packageName: 'Standard Family (30 Mbps)', date: '2026-05-11', action: 'Daftar Baru' }
    ],
    gpsLocation: { lat: -6.9184, lng: 107.6094 },
    cabang: 'Bandung',
    perusahaan: 'Sinergi Net'
  },
  {
    id: 'cust-7',
    customerId: 'CP-0007',
    name: 'Mega Ayu Lestari',
    phone: '082155778844',
    email: 'mega.ayu@gmail.com',
    nik: '3578034506920008',
    gender: 'Perempuan',
    birthDate: '1992-06-05',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60',
    status: 'Aktif',
    alamat: {
      provinsi: 'Jawa Timur',
      kabupaten: 'Surabaya',
      kecamatan: 'Wonokromo',
      desa: 'Darmo',
      alamatLengkap: 'Jl. Raya Darmo Barat No. 104',
      kodePos: '60241'
    },
    packageName: 'Pro Premium (100 Mbps)',
    price: 450000,
    startDate: '2026-05-02',
    dueDate: '2026-07-02',
    paymentStatus: 'Lunas',
    salesId: 'sales-3',
    createdAt: '2026-05-02T13:00:00Z',
    notes: ['Digunakan untuk kantor startup rintisan.', 'Pelanggan minta kuintansi fisik dicetak.'],
    packageHistory: [
      { packageName: 'Pro Premium (100 Mbps)', date: '2026-05-02', action: 'Daftar Baru' }
    ],
    gpsLocation: { lat: -7.2917, lng: 112.7303 },
    cabang: 'Surabaya',
    perusahaan: 'Nusantara Corp'
  },
  {
    id: 'cust-8',
    customerId: 'CP-0008',
    name: 'Hendrik Hartono',
    phone: '081277665511',
    email: 'hendrik.hartono@outlook.com',
    nik: '3174020304720009',
    gender: 'Laki-laki',
    birthDate: '1972-04-03',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60',
    status: 'Aktif',
    alamat: {
      provinsi: 'DKI Jakarta',
      kabupaten: 'Jakarta Barat',
      kecamatan: 'Kembangan',
      desa: 'Meria Utara',
      alamatLengkap: 'Perum Kencana Indah Blok M4 No. A3',
      kodePos: '11610'
    },
    packageName: 'Standard Family (30 Mbps)',
    price: 250000,
    startDate: '2026-05-20',
    dueDate: '2026-06-20',
    paymentStatus: 'Belum Bayar',
    salesId: 'sales-1',
    createdAt: '2026-05-20T10:10:00Z',
    notes: ['Pintu masuk rumah agak ketat, instalasi berkala butuh surat izin RT.'],
    packageHistory: [
      { packageName: 'Standard Family (30 Mbps)', date: '2026-05-20', action: 'Daftar Baru' }
    ],
    gpsLocation: { lat: -6.1882, lng: 106.7441 },
    cabang: 'Jakarta',
    perusahaan: 'Sinergi Net'
  },
  {
    id: 'cust-9',
    customerId: 'CP-0009',
    name: 'Anisa Putri Maharani',
    phone: '085388992211',
    email: 'anisa.putri@yahoo.co.id',
    nik: '3173041908900002',
    gender: 'Perempuan',
    birthDate: '1990-08-19',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=60',
    status: 'Aktif',
    alamat: {
      provinsi: 'DKI Jakarta',
      kabupaten: 'Jakarta Selatan',
      kecamatan: 'Cilandak',
      desa: 'Cilandak Barat',
      alamatLengkap: 'Jl. Fatmawati No. 12, Kav 4',
      kodePos: '12430'
    },
    packageName: 'Lite Home (10 Mbps)',
    price: 150000,
    startDate: '2026-05-25',
    dueDate: '2026-06-25',
    paymentStatus: 'Lunas',
    salesId: 'sales-1',
    createdAt: '2026-05-25T15:30:00Z',
    notes: ['Sangat ramah, memasang Wi-Fi untuk kost putri.'],
    packageHistory: [
      { packageName: 'Lite Home (10 Mbps)', date: '2026-05-25', action: 'Daftar Baru' }
    ],
    gpsLocation: { lat: -6.2915, lng: 106.7972 },
    cabang: 'Jakarta',
    perusahaan: 'Sinergi Net'
  },
  {
    id: 'cust-10',
    customerId: 'CP-0010',
    name: 'David Christian',
    phone: '087822446688',
    email: 'david.christian@gmail.com',
    nik: '3578051212880010',
    gender: 'Laki-laki',
    birthDate: '1988-12-12',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=60',
    status: 'Aktif',
    alamat: {
      provinsi: 'Jawa Timur',
      kabupaten: 'Surabaya',
      kecamatan: 'Tegalsari',
      desa: 'Kedungdoro',
      alamatLengkap: 'Ruko Basuki Rahmat No. 78',
      kodePos: '60261'
    },
    packageName: 'Pro Premium (100 Mbps)',
    price: 450000,
    startDate: '2026-03-12',
    dueDate: '2026-07-12',
    paymentStatus: 'Lunas',
    salesId: 'sales-3',
    createdAt: '2026-03-12T11:20:00Z',
    notes: ['Sering komplain jika ada MT (maintenance) tengah malam.', 'Grup perusahaan restoran d\'david.'],
    packageHistory: [
      { packageName: 'Pro Premium (100 Mbps)', date: '2026-03-12', action: 'Daftar Baru' }
    ],
    gpsLocation: { lat: -7.2625, lng: 112.7381 },
    cabang: 'Surabaya',
    perusahaan: 'Nusantara Corp'
  }
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-20260601-0001',
    customerId: 'cust-1',
    customerName: 'Dr. Fauzan Ahmad',
    packageName: 'Pro Premium (100 Mbps)',
    amount: 450000,
    dueDate: '2026-07-10',
    status: 'Lunas',
    createdAt: '2026-06-10T08:00:00Z',
    paidAt: '2026-06-10T10:30:00Z',
    paymentMethod: 'Transfer Bank BCA',
    whatsappSent: true,
    emailSent: true
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-20260602-0002',
    customerId: 'cust-2',
    customerName: 'Indah Kusuma Wardani',
    packageName: 'Standard Family (30 Mbps)',
    amount: 250000,
    dueDate: '2026-07-15',
    status: 'Lunas',
    createdAt: '2026-06-15T09:30:00Z',
    paidAt: '2026-06-15T11:50:00Z',
    paymentMethod: 'Transfer Bank Mandiri',
    whatsappSent: true,
    emailSent: false
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-20260603-0003',
    customerId: 'cust-3',
    customerName: 'Rian Hidayatullah',
    packageName: 'Lite Home (10 Mbps)',
    amount: 150000,
    dueDate: '2026-07-01',
    status: 'Belum Bayar',
    createdAt: '2026-06-01T10:15:00Z',
    whatsappSent: true,
    emailSent: true
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-20260505-0004',
    customerId: 'cust-4',
    customerName: 'Budi Hermawan',
    packageName: 'Lite Home (10 Mbps)',
    amount: 150000,
    dueDate: '2026-06-05',
    status: 'Terlambat',
    createdAt: '2026-05-05T14:22:00Z',
    whatsappSent: true,
    emailSent: false
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-20260511-0006',
    customerId: 'cust-6',
    customerName: 'Wahyudi Pratama',
    packageName: 'Standard Family (30 Mbps)',
    amount: 250000,
    dueDate: '2026-06-11',
    status: 'Belum Bayar',
    createdAt: '2026-05-11T16:45:00Z',
    whatsappSent: false,
    emailSent: false
  },
  {
    id: 'inv-6',
    invoiceNumber: 'INV-20260605-0007',
    customerId: 'cust-7',
    customerName: 'Mega Ayu Lestari',
    packageName: 'Pro Premium (100 Mbps)',
    amount: 450000,
    dueDate: '2026-07-02',
    status: 'Lunas',
    createdAt: '2026-06-02T13:00:00Z',
    paidAt: '2026-06-02T14:00:00Z',
    paymentMethod: 'QRIS',
    whatsappSent: true,
    emailSent: true
  },
  {
    id: 'inv-7',
    invoiceNumber: 'INV-20260520-0008',
    customerId: 'cust-8',
    customerName: 'Hendrik Hartono',
    packageName: 'Standard Family (30 Mbps)',
    amount: 250000,
    dueDate: '2026-06-20',
    status: 'Belum Bayar',
    createdAt: '2026-05-20T10:10:00Z',
    whatsappSent: true,
    emailSent: false
  },
  {
    id: 'inv-8',
    invoiceNumber: 'INV-20260609-0009',
    customerId: 'cust-9',
    customerName: 'Anisa Putri Maharani',
    packageName: 'Lite Home (10 Mbps)',
    amount: 150000,
    dueDate: '2026-06-25',
    status: 'Lunas',
    createdAt: '2026-05-25T15:30:00Z',
    paidAt: '2026-05-26T09:12:00Z',
    paymentMethod: 'ShopeePay',
    whatsappSent: true,
    emailSent: false
  }
];

const INITIAL_COMMISSIONS: CommissionReceipt[] = [
  {
    id: 'comm-1',
    salesId: 'sales-1',
    salesName: 'Andi Wijaya',
    customerId: 'cust-1',
    customerName: 'Dr. Fauzan Ahmad',
    invoiceId: 'inv-1',
    amount: 45000, // 10% from 450k
    percentage: 10,
    date: '2026-06-10',
    status: 'Dibayarkan'
  },
  {
    id: 'comm-2',
    salesId: 'sales-2',
    salesName: 'Budi Santoso',
    phone: '081234567802',
    customerId: 'cust-2',
    customerName: 'Indah Kusuma Wardani',
    invoiceId: 'inv-2',
    amount: 30000, // 12% from 250k
    percentage: 12,
    date: '2026-06-15',
    status: 'Dibayarkan'
  } as any,
  {
    id: 'comm-3',
    salesId: 'sales-3',
    salesName: 'Citra Dewi',
    customerId: 'cust-7',
    customerName: 'Mega Ayu Lestari',
    invoiceId: 'inv-6',
    amount: 67500, // 15% from 450k
    percentage: 15,
    date: '2026-06-02',
    status: 'Dibayarkan'
  }
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'warning',
    title: 'Jatuh Tempo Pembayaran',
    message: 'Pelanggan Wahyudi Pratama (CP-0006) jatuh tempo hari ini sebesar Rp 250.000.',
    createdAt: '2026-06-11T08:00:00Z',
    isRead: false
  },
  {
    id: 'notif-2',
    type: 'danger',
    title: 'Tagihan Terlambat',
    message: 'Pelanggan Budi Hermawan (CP-0004) terlambat 6 hari untuk invoice INV-20260505-0004.',
    createdAt: '2026-06-10T12:00:00Z',
    isRead: false
  },
  {
    id: 'notif-3',
    type: 'success',
    title: 'Pembayaran Berhasil',
    message: 'Invoice INV-20260601-0001 (Rp 450.000) Fauzan Ahmad berhasil dilunasi via Transfer BCA.',
    createdAt: '2026-06-10T10:31:00Z',
    isRead: true
  },
  {
    id: 'notif-4',
    type: 'info',
    title: 'Pendaftaran Pelanggan Baru',
    message: 'Sales Andi Wijaya mendaftarkan pelanggan baru Anisa Putri Maharani (CP-0009).',
    createdAt: '2026-05-25T15:30:00Z',
    isRead: true
  }
];

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    employeeId: 'EMP001',
    name: 'Budi Santoso',
    position: 'Sales Executive',
    department: 'Sales & Marketing',
    phone: '08123456789',
    email: 'budi.santoso@foresyndo.co.id',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    status: 'Aktif',
    branch: 'Majalengka',
    address: 'Jl. Raya Kertajati No. 45, Majalengka, Jawa Barat',
    joinDate: '2024-03-15',
    supervisor: 'Susanti Rahayu',
    qrCode: 'EMP001_BudiSantoso',
    barcode: '9908123201',
    cardNumber: 'CR80-990812',
    createdAt: '2024-03-15T08:00:00Z',
    targetPenjualan: 15000000,
    masaBerlaku: '03/2029',
    emergencyContact: 'Siti Aminah (Istri) - 08123344556'
  },
  {
    id: 'emp-2',
    employeeId: 'EMP002',
    name: 'Susanti Rahayu',
    position: 'Sales Manager',
    department: 'Sales & Marketing',
    phone: '08129876543',
    email: 'susanti.rahayu@foresyndo.co.id',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    status: 'Aktif',
    branch: 'Jakarta',
    address: 'Apartemen Sudirman Park Tower B Lt. 10, Jakarta Pusat',
    joinDate: '2022-01-10',
    supervisor: 'Kevin Wijaya',
    qrCode: 'EMP002_SusantiRahayu',
    barcode: '4521788732',
    cardNumber: 'CR80-452178',
    createdAt: '2022-01-10T08:00:00Z',
    targetPenjualan: 50000000,
    masaBerlaku: '01/2027',
    emergencyContact: 'Toni Wijaya (Suami) - 08125566778'
  },
  {
    id: 'emp-3',
    employeeId: 'EMP003',
    name: 'Kevin Wijaya',
    position: 'General Manager',
    department: 'Operational',
    phone: '08112233445',
    email: 'kevin.wijaya@foresyndo.co.id',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80',
    status: 'Aktif',
    branch: 'Jakarta',
    address: 'Sektor 5 Bintaro Jaya, Tangerang Selatan',
    joinDate: '2020-05-20',
    supervisor: 'Direktur Utama',
    qrCode: 'EMP003_KevinWijaya',
    barcode: '1284759921',
    cardNumber: 'CR80-128475',
    createdAt: '2020-05-20T08:00:00Z',
    masaBerlaku: '05/2030',
    emergencyContact: 'Dewi Wijaya (Istri) - 0811889900'
  },
  {
    id: 'emp-4',
    employeeId: 'EMP004',
    name: 'Lukman Hakim',
    position: 'Teknisi',
    department: 'IT & Infrastructure',
    phone: '087855662244',
    email: 'lukman.hakim@foresyndo.co.id',
    photo: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=300&auto=format&fit=crop&q=80',
    status: 'Aktif',
    branch: 'Majalengka',
    address: 'Kost Wijaya Indah No. 5, Kadipaten, Majalengka',
    joinDate: '2025-02-01',
    supervisor: 'Kevin Wijaya',
    qrCode: 'EMP004_LukmanHakim',
    barcode: '6312451100',
    cardNumber: 'CR80-631245',
    createdAt: '2025-02-01T08:00:00Z',
    masaBerlaku: '02/2030',
    emergencyContact: 'H. Abdul Hakim (Ayah) - 08785566112'
  }
];

const INITIAL_ATTENDANCE: Attendance[] = [
  {
    id: 'att-1',
    employeeId: 'EMP001',
    employeeName: 'Budi Santoso',
    position: 'Sales Executive',
    date: '2026-06-11',
    checkIn: '07:55:12',
    checkOut: '17:02:45',
    latitude: '-6.8373',
    longitude: '108.2241',
    selfiePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=60'
  },
  {
    id: 'att-2',
    employeeId: 'EMP002',
    employeeName: 'Susanti Rahayu',
    position: 'Sales Manager',
    date: '2026-06-11',
    checkIn: '08:02:33',
    checkOut: null,
    latitude: '-6.2088',
    longitude: '106.8456',
    selfiePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60'
  }
];

const KEYS = {
  CUSTOMERS: 'custpro_customers',
  INVOICES: 'custpro_invoices',
  PACKAGES: 'custpro_packages',
  SALES: 'custpro_sales',
  COMMISSIONS: 'custpro_commissions',
  NOTIFICATIONS: 'custpro_notifications',
  EMPLOYEES: 'custpro_employees',
  ATTENDANCE: 'custpro_attendance',
  USER_ROLE: 'custpro_user_role',
  SELECTED_CABANG: 'custpro_sel_cabang',
  SELECTED_PERUSAHAAN: 'custpro_sel_perush',
  ONLINE_MODE: 'custpro_online_mode'
};

// Initialize Storage if Empty
function getStored<T>(key: string, initial: T[]): T[] {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return initial;
  }
}

export const mockDB = {
  getCustomers: (): Customer[] => getStored<Customer>(KEYS.CUSTOMERS, INITIAL_CUSTOMERS),
  saveCustomer: (customer: Customer) => {
    const list = mockDB.getCustomers();
    const idx = list.findIndex(c => c.id === customer.id);
    if (idx >= 0) list[idx] = customer;
    else list.push(customer);
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(list));
    mockDB.recalculateSalesMetrics();
    if (mockDB.getOnlineMode()) {
      firestoreService.saveCustomer(customer).catch(console.error);
    }
  },
  deleteCustomer: (id: string) => {
    const list = mockDB.getCustomers().filter(c => c.id !== id);
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(list));
    mockDB.recalculateSalesMetrics();
    if (mockDB.getOnlineMode()) {
      firestoreService.deleteCustomer(id).catch(console.error);
    }
  },

  getEmployees: (): Employee[] => getStored<Employee>(KEYS.EMPLOYEES, INITIAL_EMPLOYEES),
  saveEmployee: (emp: Employee) => {
    const list = mockDB.getEmployees();
    const idx = list.findIndex(e => e.id === emp.id);
    if (idx >= 0) list[idx] = emp;
    else list.push(emp);
    localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(list));
    if (mockDB.getOnlineMode()) {
      firestoreService.saveEmployee(emp).catch(console.error);
    }
  },
  deleteEmployee: (id: string) => {
    const list = mockDB.getEmployees().filter(e => e.id !== id);
    localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(list));
    if (mockDB.getOnlineMode()) {
      firestoreService.deleteEmployee(id).catch(console.error);
    }
  },

  getAttendances: (): Attendance[] => getStored<Attendance>(KEYS.ATTENDANCE, INITIAL_ATTENDANCE),
  saveAttendance: (att: Attendance) => {
    const list = mockDB.getAttendances();
    const idx = list.findIndex(a => a.id === att.id);
    if (idx >= 0) list[idx] = att;
    else list.push(att);
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(list));
    if (mockDB.getOnlineMode()) {
      firestoreService.saveAttendance(att).catch(console.error);
    }
  },
  deleteAttendance: (id: string) => {
    const list = mockDB.getAttendances().filter(a => a.id !== id);
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(list));
    if (mockDB.getOnlineMode()) {
      firestoreService.deleteAttendance(id).catch(console.error);
    }
  },

  getInvoices: (): Invoice[] => getStored<Invoice>(KEYS.INVOICES, INITIAL_INVOICES),
  saveInvoice: (invoice: Invoice) => {
    const list = mockDB.getInvoices();
    const idx = list.findIndex(i => i.id === invoice.id);
    if (idx >= 0) list[idx] = invoice;
    else list.push(invoice);
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(list));
    mockDB.updateCustomerPaymentStatus(invoice.customerId);
    mockDB.recalculateSalesMetrics();
    if (mockDB.getOnlineMode()) {
      firestoreService.saveInvoice(invoice).catch(console.error);
    }
  },
  deleteInvoice: (id: string) => {
    const list = mockDB.getInvoices().filter(i => i.id !== id);
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(list));
    if (mockDB.getOnlineMode()) {
      firestoreService.deleteInvoice(id).catch(console.error);
    }
  },

  getPackages: (): ServicePackage[] => getStored<ServicePackage>(KEYS.PACKAGES, INITIAL_PACKAGES),
  savePackage: (pkg: ServicePackage) => {
    const list = mockDB.getPackages();
    const idx = list.findIndex(p => p.id === pkg.id);
    if (idx >= 0) list[idx] = pkg;
    else list.push(pkg);
    localStorage.setItem(KEYS.PACKAGES, JSON.stringify(list));
    if (mockDB.getOnlineMode()) {
      firestoreService.savePackage(pkg).catch(console.error);
    }
  },
  deletePackage: (id: string) => {
    const list = mockDB.getPackages().filter(p => p.id !== id);
    localStorage.setItem(KEYS.PACKAGES, JSON.stringify(list));
    if (mockDB.getOnlineMode()) {
      firestoreService.deletePackage(id).catch(console.error);
    }
  },

  getSales: (): SalesRepresentative[] => getStored<SalesRepresentative>(KEYS.SALES, INITIAL_SALES),
  saveSales: (rep: SalesRepresentative) => {
    const list = mockDB.getSales();
    const idx = list.findIndex(s => s.id === rep.id);
    if (idx >= 0) list[idx] = rep;
    else list.push(rep);
    localStorage.setItem(KEYS.SALES, JSON.stringify(list));
    if (mockDB.getOnlineMode()) {
      firestoreService.saveSales(rep).catch(console.error);
    }
  },
  deleteSales: (id: string) => {
    const list = mockDB.getSales().filter(s => s.id !== id);
    localStorage.setItem(KEYS.SALES, JSON.stringify(list));
    if (mockDB.getOnlineMode()) {
      firestoreService.deleteSales(id).catch(console.error);
    }
  },

  getCommissions: (): CommissionReceipt[] => getStored<CommissionReceipt>(KEYS.COMMISSIONS, INITIAL_COMMISSIONS),
  saveCommission: (comm: CommissionReceipt) => {
    const list = mockDB.getCommissions();
    const idx = list.findIndex(c => c.id === comm.id);
    if (idx >= 0) list[idx] = comm;
    else list.push(comm);
    localStorage.setItem(KEYS.COMMISSIONS, JSON.stringify(list));
    if (mockDB.getOnlineMode()) {
      firestoreService.saveCommission(comm).catch(console.error);
    }
  },

  getNotifications: (): AppNotification[] => getStored<AppNotification>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  addNotification: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'danger') => {
    const list = mockDB.getNotifications();
    const notif: AppNotification = {
      id: 'notif-' + Date.now(),
      type,
      title,
      message,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    list.unshift(notif);
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
    if (mockDB.getOnlineMode()) {
      firestoreService.saveNotification(notif).catch(console.error);
    }
  },
  markNotificationRead: (id: string) => {
    const list = mockDB.getNotifications();
    const idx = list.findIndex(n => n.id === id);
    if (idx >= 0) {
      list[idx].isRead = true;
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
      if (mockDB.getOnlineMode()) {
        firestoreService.saveNotification(list[idx]).catch(console.error);
      }
    }
  },
  markAllNotificationsRead: () => {
    const list = mockDB.getNotifications().map(n => ({ ...n, isRead: true }));
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(list));
    if (mockDB.getOnlineMode()) {
      for (const n of list) {
        firestoreService.saveNotification(n).catch(console.error);
      }
    }
  },

  getActiveRole: (): string => {
    return localStorage.getItem(KEYS.USER_ROLE) || 'Super Admin';
  },
  setActiveRole: (role: string) => {
    localStorage.setItem(KEYS.USER_ROLE, role);
  },

  getSelectedCabang: (): string => {
    return localStorage.getItem(KEYS.SELECTED_CABANG) || 'Semua Cabang';
  },
  setSelectedCabang: (cabang: string) => {
    localStorage.setItem(KEYS.SELECTED_CABANG, cabang);
  },

  getSelectedPerusahaan: (): string => {
    return localStorage.getItem(KEYS.SELECTED_PERUSAHAAN) || 'Semua Perusahaan';
  },
  setSelectedPerusahaan: (perusahaan: string) => {
    localStorage.setItem(KEYS.SELECTED_PERUSAHAAN, perusahaan);
  },

  getOnlineMode: (): boolean => {
    const stored = localStorage.getItem(KEYS.ONLINE_MODE);
    return stored ? stored === 'true' : false; // Default offline, simulate sync
  },
  setOnlineMode: (mode: boolean) => {
    localStorage.setItem(KEYS.ONLINE_MODE, String(mode));
  },

  // Helper sync actions
  recalculateSalesMetrics: () => {
    const customers = mockDB.getCustomers();
    const invoices = mockDB.getInvoices();
    const salesList = mockDB.getSales();
    const commissions: CommissionReceipt[] = mockDB.getCommissions();

    const updatedSales = salesList.map(sales => {
      const myCustomers = customers.filter(c => c.salesId === sales.id);
      
      // Calculate commissions earned via related invoices that are "Lunas"
      let earned = 0;
      myCustomers.forEach(cust => {
        const myPaidInvoices = invoices.filter(inv => inv.customerId === cust.id && inv.status === 'Lunas');
        myPaidInvoices.forEach(inv => {
          const existingComm = commissions.find(c => c.invoiceId === inv.id && c.salesId === sales.id);
          if (existingComm) {
            earned += existingComm.amount;
          } else {
            const commAmt = Math.round((inv.amount * sales.commissionRate) / 100);
            earned += commAmt;
          }
        });
      });

      return {
        ...sales,
        totalCustomers: myCustomers.length,
        totalCommissionEarned: earned
      };
    });

    localStorage.setItem(KEYS.SALES, JSON.stringify(updatedSales));
  },

  updateCustomerPaymentStatus: (customerId: string) => {
    const customers = mockDB.getCustomers();
    const invoices = mockDB.getInvoices().filter(i => i.customerId === customerId);
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const pending = invoices.filter(i => i.status === 'Belum Bayar');
    const late = invoices.filter(i => i.status === 'Terlambat');

    if (late.length > 0) {
      customer.paymentStatus = 'Terlambat';
    } else if (pending.length > 0) {
      customer.paymentStatus = 'Belum Bayar';
    } else {
      customer.paymentStatus = 'Lunas';
    }

    mockDB.saveCustomer(customer);
  },

  generateMonthlyInvoices: () => {
    const customers = mockDB.getCustomers();
    const invoices = mockDB.getInvoices();
    let generatedCount = 0;

    customers.forEach(cust => {
      const match = invoices.find(inv => inv.customerId === cust.id && inv.dueDate.substring(0, 7) === cust.dueDate.substring(0, 7));
      if (!match && cust.status === 'Aktif') {
        const invNum = `INV-202606-${Math.floor(1000 + Math.random() * 9000)}`;
        const newInv: Invoice = {
          id: 'inv-' + Date.now() + Math.random(),
          invoiceNumber: invNum,
          customerId: cust.id,
          customerName: cust.name,
          packageName: cust.packageName,
          amount: cust.price,
          dueDate: cust.dueDate,
          status: 'Belum Bayar',
          createdAt: new Date().toISOString()
        };
        invoices.push(newInv);
        generatedCount++;
      }
    });

    if (generatedCount > 0) {
      localStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));
      mockDB.addNotification(
        'Generate Tagihan Otomatis',
        `Sistem berhasil men-generate ${generatedCount} invoice tagihan baru untuk bulan ini.`,
        'success'
      );
    }
  },

  // Pulls records from Cloud Firestore and synchronizes localStorage
  pullFromFirestore: async () => {
    try {
      const [
        livePackages, 
        liveSales, 
        liveCustomers, 
        liveInvoices, 
        liveCommissions, 
        liveNotifications,
        liveEmployees,
        liveAttendance
      ] = await Promise.all([
        firestoreService.getPackages(),
        firestoreService.getSales(),
        firestoreService.getCustomers(),
        firestoreService.getInvoices(),
        firestoreService.getCommissions(),
        firestoreService.getNotifications(),
        firestoreService.getEmployees(),
        firestoreService.getAttendances()
      ]);

      // If online data is completely empty, seed standard assets automatically so workspace opens loaded
      if (livePackages.length === 0 && liveSales.length === 0 && liveCustomers.length === 0 && liveEmployees.length === 0) {
        console.log("Firestore empty. Seeding initial data...");
        await firestoreService.seedDatabase({
          customers: INITIAL_CUSTOMERS,
          invoices: INITIAL_INVOICES,
          packages: INITIAL_PACKAGES,
          sales: INITIAL_SALES,
          commissions: INITIAL_COMMISSIONS,
          notifications: INITIAL_NOTIFICATIONS,
          employees: INITIAL_EMPLOYEES,
          attendance: INITIAL_ATTENDANCE
        });
        return;
      }

      // Overwrite/sync state
      if (livePackages.length > 0) localStorage.setItem(KEYS.PACKAGES, JSON.stringify(livePackages));
      if (liveSales.length > 0) localStorage.setItem(KEYS.SALES, JSON.stringify(liveSales));
      if (liveCustomers.length > 0) localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(liveCustomers));
      if (liveInvoices.length > 0) localStorage.setItem(KEYS.INVOICES, JSON.stringify(liveInvoices));
      if (liveCommissions.length > 0) localStorage.setItem(KEYS.COMMISSIONS, JSON.stringify(liveCommissions));
      if (liveNotifications.length > 0) localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(liveNotifications));
      if (liveEmployees.length > 0) localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(liveEmployees));
      if (liveAttendance.length > 0) localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(liveAttendance));
    } catch (e) {
      console.error("Sync error during pullFromFirestore operation:", e);
    }
  }
};
