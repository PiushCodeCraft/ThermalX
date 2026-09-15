import React, { useState } from 'react';
import {
  UserPlus,
  Shield,
  Search,
  CheckCircle2,
  Trash2,
  Edit
} from 'lucide-react';
import { AdminNavbar } from '../components/dashboard/AdminNavbar';

const initialUsers = [
  {
    id: 'usr-01',
    name: 'Admin User',
    email: 'admin.ops@thermalx.gov',
    role: 'ADMINISTRATOR',
    status: 'Active',
    sectorAccess: 'Global (All Sectors)',
    lastLogin: 'Today 07:05 UTC'
  },
  {
    id: 'usr-02',
    name: 'Sarah Connor',
    email: 's.connor@firewatch.org',
    role: 'LEAD INVESTIGATOR',
    status: 'Active',
    sectorAccess: 'South Asia & Australia',
    lastLogin: 'Yesterday 18:42 UTC'
  },
  {
    id: 'usr-03',
    name: 'Vikram Mehta',
    email: 'v.mehta@disaster.in',
    role: 'FIELD OPERATOR',
    status: 'Active',
    sectorAccess: 'Bengaluru Sector 4',
    lastLogin: 'Today 06:15 UTC'
  },
  {
    id: 'usr-04',
    name: 'Elena Rostova',
    email: 'e.rostova@satellite-firms.eu',
    role: 'ANALYST',
    status: 'Pending Verification',
    sectorAccess: 'Europe & Mediterranean',
    lastLogin: '3 days ago'
  }
];

export default function AdminUserMgmt({ onNavigate }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans select-none antialiased">
      {/* =========================================================================
          UNIFIED ADMIN HEADER BAR
          ========================================================================= */}
      <AdminNavbar activeNav="USER MANAGE" onNavigate={onNavigate} />

      {/* Main Content */}
      <main className="w-full flex-1 p-4 bg-white flex flex-col gap-4 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#00236F]" />
              <span>User Access & Security Credentials</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage operator dispatch permissions, investigator credentials, and agency authorization tiers.
            </p>
          </div>

          <button
            onClick={() => alert('Add User dialog initialized')}
            className="px-4 py-2 bg-[#00236F] hover:bg-[#1E3A8A] text-white text-xs font-bold uppercase rounded flex items-center gap-1.5 shadow-xs transition-colors self-start"
            type="button"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Operator</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md bg-slate-50 focus:outline-blue-600"
          />
        </div>

        {/* Users Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10.5px]">
              <tr>
                <th className="p-3">User & Email</th>
                <th className="p-3">Role Designation</th>
                <th className="p-3">Sector Access Scope</th>
                <th className="p-3">Status</th>
                <th className="p-3">Last Active</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <span className="font-bold text-slate-900 block">{user.name}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{user.email}</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[10px] uppercase">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700 font-medium">{user.sectorAccess}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        user.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {user.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 tabular-nums">{user.lastLogin}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => alert(`Edit ${user.name}`)}
                      className="p-1 text-slate-500 hover:text-blue-700 mr-2"
                      title="Edit"
                      type="button"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setUsers(users.filter((u) => u.id !== user.id))}
                      className="p-1 text-slate-500 hover:text-red-700"
                      title="Revoke"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
