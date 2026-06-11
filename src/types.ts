/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Super Admin' | 'Admin' | 'Sales';

export interface Alamat {
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  desa: string;
  alamatLengkap: string;
  kodePos: string;
}

export interface Customer {
  id: string; // unique auth/firestore id
  customerId: string; // CP-XXXX auto ID
  name: string;
  phone: string;
  email: string;
  nik: string;
  gender: 'Laki-laki' | 'Perempuan';
  birthDate: string;
  photoUrl: string;
  status: 'Aktif' | 'Nonaktif';
  
  // Alamat
  alamat: Alamat;

  // Layanan
  packageName: string;
  price: number;
  startDate: string;
  dueDate: string;
  paymentStatus: 'Lunas' | 'Belum Bayar' | 'Terlambat';
  salesId: string; // references Sales
  createdAt: string;
  
  // Extra Premium Features
  notes: string[];
  packageHistory: { packageName: string; date: string; action: string }[];
  gpsLocation?: { lat: number; lng: number };
  cabang: string;
  perusahaan: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // INV-YYYYMMDD-XXXX
  customerId: string;
  customerName: string;
  packageName: string;
  amount: number;
  dueDate: string;
  status: 'Lunas' | 'Belum Bayar' | 'Terlambat';
  createdAt: string;
  paidAt?: string;
  paymentMethod?: string;
  whatsappSent?: boolean;
  emailSent?: boolean;
}

export interface ServicePackage {
  id: string;
  name: string;
  price: number;
  duration: number; // in days
  features: string[];
  status: 'Aktif' | 'Tidak Aktif';
}

export interface SalesRepresentative {
  id: string;
  name: string;
  phone: string;
  email: string;
  commissionRate: number; // e.g. 10 for 10%
  targetSales: number; // monthly target revenue
  totalCustomers: number;
  totalCommissionEarned: number;
  cabang: string;
}

export interface CommissionReceipt {
  id: string;
  salesId: string;
  salesName: string;
  customerId: string;
  customerName: string;
  invoiceId: string;
  amount: number; // commission amount
  percentage: number;
  date: string;
  status: 'Pending' | 'Dibayarkan';
}

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export type EmployeePosition = 
  | 'Direktur'
  | 'General Manager'
  | 'Manager'
  | 'Supervisor'
  | 'Sales Manager'
  | 'Sales Executive'
  | 'Admin'
  | 'Operator'
  | 'Staff'
  | 'Teknisi'
  | 'Security';

export interface Employee {
  id: string; // Firestore document ID (can be employeeId or random, let's keep consistent)
  employeeId: string; // EMP-XXXX auto-generated ID or NIP
  name: string;
  position: EmployeePosition;
  department: string;
  phone: string;
  email: string;
  photo: string; // Base64 or Unsplash URL
  status: 'Aktif' | 'Nonaktif';
  branch: string;
  address: string;
  joinDate: string;
  supervisor: string;
  qrCode: string; // QR code data or representation
  barcode: string; // Barcode value
  cardNumber: string; // Unique card serial, e.g. CR80-XXXXXX
  createdAt: string;
  
  // Template-specific metadata
  targetPenjualan?: number; // Only for Sales template
  masaBerlaku?: string; // e.g. June 2030, or 5 years join date
  emergencyContact?: string;
}

export interface Attendance {
  id: string; // unique record ID
  employeeId: string;
  employeeName?: string;
  position?: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // HH:mm:ss or null
  checkOut: string; // HH:mm:ss or null
  latitude: string;
  longitude: string;
  selfiePhoto: string; // Base64 or URL
}

