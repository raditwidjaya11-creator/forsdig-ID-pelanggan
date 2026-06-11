import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Activity, 
  Plus, 
  Trash2, 
  Save, 
  Key, 
  Users, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Unlock,
  Sliders,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../types';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  joinDate: string;
  status: 'Aktif' | 'Ditangguhkan';
}

interface RolePermission {
  canDeleteInvoice: boolean;
  canEditPackages: boolean;
  canMarketingBlast: boolean;
  canManageEmployees: boolean;
  canViewReports: boolean;
  canSimulateSync: boolean;
}

interface SuperAdminConsoleProps {
  users: SystemUser[];
  setUsers: React.Dispatch<React.SetStateAction<SystemUser[]>>;
  rolePermissions: Record<UserRole, RolePermission>;
  setRolePermissions: React.Dispatch<React.SetStateAction<Record<UserRole, RolePermission>>>;
  onAddNotification: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'danger') => void;
  currentUser: SystemUser;
  setCurrentUser: (user: SystemUser) => void;
}

export default function SuperAdminConsole({
  users,
  setUsers,
  rolePermissions,
  setRolePermissions,
  onAddNotification,
  currentUser,
  setCurrentUser
}: SuperAdminConsoleProps) {
  // Input states for creating a new user
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Sales');
  const [showAddModal, setShowAddModal] = useState(false);

  // Active view: 'users' | 'rules' | 'logs'
  const [activeTab, setActiveTab] = useState<'users' | 'rules' | 'logs'>('users');

  // Security Audit Log State
  const [auditLogs, setAuditLogs] = useState<Array<{
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    target: string;
    severity: 'low' | 'medium' | 'high';
  }>>([
    { id: 'log-1', timestamp: '2026-06-11 10:45:12', actor: 'Radit Widjaya (Super Admin)', action: 'Mengubah struktur hak akses', target: 'Role: Admin Cabang', severity: 'medium' },
    { id: 'log-2', timestamp: '2026-06-11 09:20:00', actor: 'Radit Widjaya (Super Admin)', action: 'Menambahkan staf baru', target: 'Andi Wijaya (Sales)', severity: 'low' },
    { id: 'log-3', timestamp: '2026-06-11 08:05:44', actor: 'Sistem', action: 'Pembatasan Otomatis Akses API', target: 'Firebase Guard Ingress', severity: 'low' }
  ]);

  // Handler for adding a user
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const newUser: SystemUser = {
      id: 'usr-' + Date.now(),
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      avatar: newUserName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Aktif'
    };

    setUsers([...users, newUser]);
    
    // Log audit
    const newLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
      actor: `${currentUser.name} (${currentUser.role})`,
      action: 'Menambahkan Pengguna Baru',
      target: `${newUser.name} (${newUser.role})`,
      severity: 'low' as const
    };
    setAuditLogs([newLog, ...auditLogs]);

    onAddNotification(
      'Pengguna Ditambahkan',
      `Akun untuk ${newUser.name} berhasil didaftarkan sebagai ${newUser.role}.`,
      'success'
    );

    // Reset fields
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('Sales');
    setShowAddModal(false);
  };

  // Handler to update roles dynamically
  const handleUserRoleChange = (userId: string, newRole: UserRole) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        // Log changes
        const newLog = {
          id: 'log-' + Date.now(),
          timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
          actor: `${currentUser.name} (${currentUser.role})`,
          action: `Mengubah Role Pengguna dari ${u.role} ke ${newRole}`,
          target: u.name,
          severity: 'medium' as const
        };
        setAuditLogs(prev => [newLog, ...prev]);

        // If the modified user is currently logged in, update their active system state instantly!
        const updated = { ...u, role: newRole };
        if (u.id === currentUser.id) {
          setTimeout(() => {
            setCurrentUser(updated);
          }, 100);
        }
        return updated;
      }
      return u;
    });

    setUsers(updatedUsers);
    onAddNotification(
      'Otoritas Diperbarui',
      `Akses untuk pengguna berhasil dialihkan ke peran ${newRole} secara real-time.`,
      'info'
    );
  };

  // Toggle dynamic permissions per role
  const handleTogglePermission = (role: UserRole, permissionKey: keyof RolePermission) => {
    const currentPerms = rolePermissions[role];
    const newPerms = {
      ...rolePermissions,
      [role]: {
        ...currentPerms,
        [permissionKey]: !currentPerms[permissionKey]
      }
    };
    setRolePermissions(newPerms);

    // Log the change
    const newLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
      actor: `${currentUser.name} (${currentUser.role})`,
      action: `Mengubah Hak Akses ${permissionKey} menjadi ${!currentPerms[permissionKey]}`,
      target: `Peran: ${role}`,
      severity: 'high' as const
    };
    setAuditLogs(prev => [newLog, ...prev]);

    onAddNotification(
      'Kebijakan Diperbarui',
      `Hak akses global [${permissionKey}] untuk peran ${role} berhasil diperbarui.`,
      'warning'
    );
  };

  // Delete user account from listing
  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.id) {
      onAddNotification('Gagal Menghapus', 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.', 'danger');
      return;
    }

    const targetUser = users.find(u => u.id === userId);
    setUsers(users.filter(u => u.id !== userId));

    if (targetUser) {
      const newLog = {
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
        actor: `${currentUser.name} (${currentUser.role})`,
        action: 'Menghapus Akun Pengguna',
        target: targetUser.name,
        severity: 'high' as const
      };
      setAuditLogs(prev => [newLog, ...prev]);

      onAddNotification(
        'Akun Dihapus',
        `Staf ${targetUser.name} telah dicabut dari hak akses server.`,
        'danger'
      );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 overflow-hidden select-none animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2 text-red-650 text-red-600 mb-1">
            <ShieldCheck className="h-5 w-5 animate-pulse" />
            <span className="text-xs uppercase font-extrabold tracking-widest font-mono">Super Admin Security Console</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase">
            Pengaturan Hak Akses & Role Pengguna
          </h2>
          <p className="text-slate-500 text-xs mt-1 md:max-w-2xl font-normal leading-relaxed">
            Kelola secara instan kredensial login, lisensi hak cipta akses, dan penugasan role real-time untuk seluruh staf admin, kantor cabang, dan agen marketing PT. Foresyndo Global Indonesia.
          </p>
        </div>

        <button
          id="btn-superadmin-add-user"
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-black text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-650/10 cursor-pointer self-start md:self-center shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Staff Baru</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-100 gap-1 mt-4">
        <button
          id="tab-subadmin-users"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 font-semibold text-xs transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'users' 
              ? 'border-red-600 text-red-600' 
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Pengguna Terdaftar ({users.length})</span>
        </button>
        <button
          id="tab-subadmin-rules"
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-3 font-semibold text-xs transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'rules' 
              ? 'border-red-600 text-red-600' 
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Konfigurasi Izin Global ({Object.keys(rolePermissions).length})</span>
        </button>
        <button
          id="tab-subadmin-logs"
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-3 font-semibold text-xs transition border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'logs' 
              ? 'border-red-600 text-red-600' 
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Log Audit & Audit System</span>
        </button>
      </div>

      {/* VIEW 1: USER ACCOUNT ASSIGNMENT LIST */}
      {activeTab === 'users' && (
        <div className="mt-6 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-150">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-650 leading-relaxed max-w-xl">
                <span className="font-extrabold text-slate-900 block mb-0.5">Penting Tentang Hak Asosiasi:</span>
                Setiap perubahan pada list di bawah akan langsung merubah akses navigasi karyawan tersebut. Jika peran diubah menjadi <strong>Sales</strong>, personil tersebut otomatis dilarang masuk ke tab Tagihan, ID Pegawai, dan Laporan Keuangan secara real-time.
              </div>
            </div>
            <div className="text-slate-400 text-xs font-semibold shrink-0 bg-white px-3 py-1.5 rounded-lg border">
              System Session: Sec-v5.0
            </div>
          </div>

          <div className="border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 font-extrabold text-slate-600">
                <tr>
                  <th className="p-4">Staff Pengguna</th>
                  <th className="p-4">Email Instansi</th>
                  <th className="p-4">Peran Hak Akses</th>
                  <th className="p-4">Tgl Bergabung</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-normal">
                {users.map((u) => {
                  const isSelf = u.id === currentUser.id;
                  return (
                    <tr key={u.id} className={`hover:bg-slate-50/50 transition-colors ${isSelf ? 'bg-red-50/10' : ''}`}>
                      <td className="p-4 flex items-center space-x-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold font-mono text-[11px] text-white shrink-0 shadow-sm ${
                          u.role === 'Super Admin' ? 'bg-slate-900' : u.role === 'Admin' ? 'bg-red-650 bg-red-600' : 'bg-indigo-650 bg-indigo-650 bg-indigo-600'
                        }`}>
                          {u.avatar}
                        </div>
                        <div>
                          <span className="block font-black text-slate-900">{u.name} {isSelf && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black ml-1 uppercase">SAYA</span>}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500 font-mono text-[11px]">{u.email}</td>
                      <td className="p-4">
                        <select
                          id={`user-role-select-${u.id}`}
                          value={u.role}
                          onChange={(e) => handleUserRoleChange(u.id, e.target.value as UserRole)}
                          className="bg-slate-50 text-slate-800 text-[11px] py-1 px-2.5 rounded-lg border border-slate-250 outline-none font-bold"
                        >
                          <option value="Super Admin"> Super Admin </option>
                          <option value="Admin"> Admin Cabang </option>
                          <option value="Sales"> Agen Sales </option>
                        </select>
                      </td>
                      <td className="p-4 text-slate-500 font-mono text-[11px]">{u.joinDate}</td>
                      <td className="p-4">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-150">
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          id={`btn-user-delete-${u.id}`}
                          onClick={() => handleDeleteUser(u.id)}
                          className={`p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer inline-block ${
                            isSelf ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                          title={isSelf ? 'Tidak dapat menghapus diri sendiri' : 'Cabut akses staff'}
                          disabled={isSelf}
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: GLOBAL PERMISSIONS ACCORDING TO ROLES */}
      {activeTab === 'rules' && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['Super Admin', 'Admin', 'Sales'] as UserRole[]).map((role) => {
              const perms = rolePermissions[role];
              return (
                <div key={role} className="border border-slate-205 rounded-3xl p-5 shadow-sm bg-slate-50/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{role}</h4>
                        <span className="text-[10px] text-slate-500 font-mono uppercase block">Sistem Otoritas</span>
                      </div>
                      <div className={`p-1.5 rounded-xl ${
                        role === 'Super Admin' ? 'bg-slate-900 text-white' : role === 'Admin' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'
                      }`}>
                        <ShieldCheck className="h-4.5 w-4.5" />
                      </div>
                    </div>

                    {/* Permissions list toggle Switches */}
                    <div className="space-y-3">
                      
                      {/* Delete invoice toggle */}
                      <div className="flex items-center justify-between py-1 border-b border-slate-100 text-xs">
                        <div>
                          <span className="font-extrabold text-slate-800">Menghapus Invoice</span>
                          <span className="block text-[9.5px] text-slate-450 leading-tight">Izin menghapus tagihan</span>
                        </div>
                        <button
                          id={`toggle-${role}-delete-invoice`}
                          onClick={() => handleTogglePermission(role, 'canDeleteInvoice')}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${perms.canDeleteInvoice ? 'bg-red-600' : 'bg-slate-200'}`}
                        >
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${perms.canDeleteInvoice ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Edit packages toggle */}
                      <div className="flex items-center justify-between py-1 border-b border-slate-100 text-xs">
                        <div>
                          <span className="font-extrabold text-slate-800">Mengedit Sistem Paket</span>
                          <span className="block text-[9.5px] text-slate-450 leading-tight">Ubah harga / deskripsi paket</span>
                        </div>
                        <button
                          id={`toggle-${role}-edit-packages`}
                          onClick={() => handleTogglePermission(role, 'canEditPackages')}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${perms.canEditPackages ? 'bg-red-600' : 'bg-slate-200'}`}
                        >
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${perms.canEditPackages ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Marketing Blast */}
                      <div className="flex items-center justify-between py-1 border-b border-slate-100 text-xs">
                        <div>
                          <span className="font-extrabold text-slate-800">Uji Kampanye Marketing</span>
                          <span className="block text-[9.5px] text-slate-450 leading-tight">WhatsApp / SMS Blast</span>
                        </div>
                        <button
                          id={`toggle-${role}-marketing-blast`}
                          onClick={() => handleTogglePermission(role, 'canMarketingBlast')}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${perms.canMarketingBlast ? 'bg-red-600' : 'bg-slate-200'}`}
                        >
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${perms.canMarketingBlast ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Manage Employees */}
                      <div className="flex items-center justify-between py-1 border-b border-slate-100 text-xs">
                        <div>
                          <span className="font-extrabold text-slate-800">Manajemen Pegawai</span>
                          <span className="block text-[9.5px] text-slate-450 leading-tight">Buat ID-Card / edit profil sdm</span>
                        </div>
                        <button
                          id={`toggle-${role}-manage-employees`}
                          onClick={() => handleTogglePermission(role, 'canManageEmployees')}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${perms.canManageEmployees ? 'bg-red-600' : 'bg-slate-200'}`}
                        >
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${perms.canManageEmployees ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* View reports */}
                      <div className="flex items-center justify-between py-1 border-b border-slate-100 text-xs">
                        <div>
                          <span className="font-extrabold text-slate-800">Laporan Keuangan</span>
                          <span className="block text-[9.5px] text-slate-450 leading-tight">Grafik & kalkulator omset</span>
                        </div>
                        <button
                          id={`toggle-${role}-view-reports`}
                          onClick={() => handleTogglePermission(role, 'canViewReports')}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${perms.canViewReports ? 'bg-red-600' : 'bg-slate-200'}`}
                        >
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${perms.canViewReports ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Sync simulator */}
                      <div className="flex items-center justify-between py-1 text-xs text-xs">
                        <div>
                          <span className="font-extrabold text-slate-800">Sinkronisasi Cloud</span>
                          <span className="block text-[9.5px] text-slate-450 leading-tight">Manajemen pull/push Firestore</span>
                        </div>
                        <button
                          id={`toggle-${role}-simulate-sync`}
                          onClick={() => handleTogglePermission(role, 'canSimulateSync')}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${perms.canSimulateSync ? 'bg-red-600' : 'bg-slate-200'}`}
                        >
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ${perms.canSimulateSync ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                    </div>
                  </div>

                  <div className="bg-slate-200/50 rounded-xl p-2.5 mt-4 text-[9.5px] text-slate-500 font-mono text-center flex items-center justify-center gap-1">
                    <Sparkles className="h-3 w-3 text-red-500 shrink-0" />
                    <span>Real-time Secure Policy Engaged</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: SYSTEM AUDIT LOG TIMELINE */}
      {activeTab === 'logs' && (
        <div className="mt-6 space-y-4">
          <div className="bg-slate-900 text-slate-100 rounded-3xl p-5 font-mono text-xs border border-slate-950 shadow-inner select-text">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
              <span>PT FORESYNDO SYSTEM AUDIT INTERFACE</span>
              <span>LIVE FEED</span>
            </div>
            <div className="mt-4 space-y-3.5 divide-y divide-slate-800/50">
              {auditLogs.map((log) => {
                const isHigh = log.severity === 'high';
                const isMedium = log.severity === 'medium';
                return (
                  <div key={log.id} className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${isHigh ? 'bg-rose-500 animate-ping' : isMedium ? 'bg-amber-400' : 'bg-slate-500'}`} />
                        <span className="text-slate-400 font-bold">[{log.timestamp}]</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase text-white ${isHigh ? 'bg-rose-700' : isMedium ? 'bg-amber-600' : 'bg-slate-700'}`}>
                          {log.severity}
                        </span>
                      </div>
                      <p className="text-white mt-1">
                        Aktor: <span className="text-red-400 font-bold">{log.actor}</span>
                      </p>
                      <p className="text-slate-300">
                        Aksi: <span className="font-extrabold">{log.action}</span> &rarr; Target: <span className="text-indigo-300">{log.target}</span>
                      </p>
                    </div>
                    <div className="shrink-0 font-bold bg-slate-950 px-2 py-1 rounded text-red-300 border border-slate-800 text-[10px]">
                      STATUS: SUCCESS_SEC
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD STAF POPUP RECTANGLE */}
      {showAddModal && (
        <div id="superadmin-add-modal" className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border rounded-3xl p-6 max-w-md w-full shadow-2xl relative select-none animate-fade-in space-y-4">
            
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-black text-slate-900 text-sm uppercase">Pemberian Akses Staf Baru</h3>
              <button
                id="btn-add-modal-close"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-black cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs font-normal">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold">Nama Lengkap Karyawan</label>
                <input
                  id="add-username-input"
                  type="text"
                  required
                  placeholder="Mis: Dr. Andi Santoso"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 text-xs py-2 px-3 rounded-lg border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold">Alamat Email Karyawan</label>
                <input
                  id="add-email-input"
                  type="email"
                  required
                  placeholder="Mis: andi.santoso@foresyndo.co.id"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 text-xs py-2 px-3 rounded-lg border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold">Penugasan Peran Pertama (Role)</label>
                <select
                  id="add-role-select"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 text-slate-800 text-xs py-2 px-3 rounded-lg border border-slate-200 outline-none focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-bold"
                >
                  <option value="Super Admin">💼 Super Admin</option>
                  <option value="Admin">🛡️ Admin Cabang</option>
                  <option value="Sales">📈 Agen Sales</option>
                </select>
              </div>

              <div className="pt-3 border-t flex gap-2">
                <button
                  id="btn-add-modal-submit"
                  type="submit"
                  className="flex-1 bg-red-650 bg-red-600 hover:bg-red-700 text-white font-extrabold py-2.5 px-4 rounded-xl cursor-pointer shadow-md transition"
                >
                  Daftarkan Akun
                </button>
                <button
                  id="btn-add-modal-cancel"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
