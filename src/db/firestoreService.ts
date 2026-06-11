/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Customer, Invoice, ServicePackage, SalesRepresentative, CommissionReceipt, AppNotification, Employee, Attendance } from '../types';

// Generic fetcher with error wrapping
async function fetchCollection<T>(collectionName: string): Promise<T[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const items: T[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as unknown as T);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionName);
    return [];
  }
}

// Generic saver with error wrapping
async function saveDocument<T extends { id: string }>(collectionName: string, item: T): Promise<void> {
  const docRef = doc(db, collectionName, item.id);
  try {
    await setDoc(docRef, item, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${item.id}`);
  }
}

// Generic deleter with error wrapping
async function deleteDocument(collectionName: string, id: string): Promise<void> {
  const docRef = doc(db, collectionName, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
}

export const firestoreService = {
  // Customers
  getCustomers: () => fetchCollection<Customer>('customers'),
  saveCustomer: (customer: Customer) => saveDocument('customers', customer),
  deleteCustomer: (id: string) => deleteDocument('customers', id),

  // Invoices
  getInvoices: () => fetchCollection<Invoice>('invoices'),
  saveInvoice: (invoice: Invoice) => saveDocument('invoices', invoice),
  deleteInvoice: (id: string) => deleteDocument('invoices', id),

  // Service Packages
  getPackages: () => fetchCollection<ServicePackage>('servicePackages'),
  savePackage: (pkg: ServicePackage) => saveDocument('servicePackages', pkg),
  deletePackage: (id: string) => deleteDocument('servicePackages', id),

  // Sales Representatives
  getSales: () => fetchCollection<SalesRepresentative>('salesRepresentatives'),
  saveSales: (sales: SalesRepresentative) => saveDocument('salesRepresentatives', sales),
  deleteSales: (id: string) => deleteDocument('salesRepresentatives', id),

  // Commission Receipts
  getCommissions: () => fetchCollection<CommissionReceipt>('commissionReceipts'),
  saveCommission: (comm: CommissionReceipt) => saveDocument('commissionReceipts', comm),
  deleteCommission: (id: string) => deleteDocument('commissionReceipts', id),

  // Notifications
  getNotifications: () => fetchCollection<AppNotification>('notifications'),
  saveNotification: (notif: AppNotification) => saveDocument('notifications', notif),
  deleteNotification: (id: string) => deleteDocument('notifications', id),

  // Employees
  getEmployees: () => fetchCollection<Employee>('employees'),
  saveEmployee: (emp: Employee) => saveDocument('employees', emp),
  deleteEmployee: (id: string) => deleteDocument('employees', id),

  // Attendance
  getAttendances: () => fetchCollection<Attendance>('attendance'),
  saveAttendance: (att: Attendance) => saveDocument('attendance', att),
  deleteAttendance: (id: string) => deleteDocument('attendance', id),

  // Batch seed when Firestore database is empty
  seedDatabase: async (data: {
    customers: Customer[];
    invoices: Invoice[];
    packages: ServicePackage[];
    sales: SalesRepresentative[];
    commissions: CommissionReceipt[];
    notifications: AppNotification[];
    employees?: Employee[];
    attendance?: Attendance[];
  }) => {
    try {
      // Seed packages
      for (const p of data.packages) {
        await setDoc(doc(db, 'servicePackages', p.id), p);
      }
      // Seed sales
      for (const s of data.sales) {
        await setDoc(doc(db, 'salesRepresentatives', s.id), s);
      }
      // Seed customers
      for (const c of data.customers) {
        await setDoc(doc(db, 'customers', c.id), c);
      }
      // Seed invoices
      for (const i of data.invoices) {
        await setDoc(doc(db, 'invoices', i.id), i);
      }
      // Seed commissions
      for (const comm of data.commissions) {
        await setDoc(doc(db, 'commissionReceipts', comm.id), comm);
      }
      // Seed notifications
      for (const n of data.notifications) {
        await setDoc(doc(db, 'notifications', n.id), n);
      }
      // Seed employees if present
      if (data.employees) {
        for (const e of data.employees) {
          await setDoc(doc(db, 'employees', e.id), e);
        }
      }
      // Seed attendance if present
      if (data.attendance) {
        for (const a of data.attendance) {
          await setDoc(doc(db, 'attendance', a.id), a);
        }
      }
      console.log("Firestore Seeding complete!");
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }
};
