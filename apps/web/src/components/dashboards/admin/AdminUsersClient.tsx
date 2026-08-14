'use client';

import { useState } from 'react';
import { Users, ShieldCheck, KeyRound, Download, Search, Filter, CheckCircle2, UserX, Eye } from 'lucide-react';

type UserRow = {
  id: string;
  fullName: string | null;
  email: string;
  role: string;
  createdAt: string;
};

export function AdminUsersClient({
  totalUsers,
  pendingApprovals,
  recentSignups,
}: {
  totalUsers: number;
  pendingApprovals: number;
  recentSignups: UserRow[];
}) {
  const [activeTab, setActiveTab] = useState<'all' | 'student' | 'parent' | 'tutor' | 'admin'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusState, setStatusState] = useState<Record<string, 'active' | 'suspended'>>({});
  const [toast, setToast] = useState<string | null>(null);

  const filteredUsers = recentSignups.filter((user) => {
    const matchesRole = activeTab === 'all' || user.role.toLowerCase() === activeTab;
    const matchesQuery =
      !searchQuery.trim() ||
      (user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesQuery;
  });

  const handleExportCSV = () => {
    const headers = ['User ID', 'Full Name', 'Email', 'Role', 'Status', 'Date Joined'];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${u.fullName || 'User'}"`,
      u.email,
      u.role.toUpperCase(),
      statusState[u.id] || 'ACTIVE',
      new Date(u.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Edvoura-Users-Export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setToast('CSV User Export downloaded successfully!');
    setTimeout(() => setToast(null), 3000);
  };

  const toggleUserStatus = (userId: string, name: string) => {
    const current = statusState[userId] || 'active';
    const next = current === 'active' ? 'suspended' : 'active';
    setStatusState((prev) => ({ ...prev, [userId]: next }));
    setToast(`Account for ${name} marked as ${next.toUpperCase()}`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-8">
      {toast && (
        <div className="p-4 bg-emerald-100 border-[3px] border-dark text-emerald-950 font-black rounded-2xl shadow-[4px_4px_0px_#060E1C] flex items-center justify-between gap-3 animate-fade-up">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-800" />
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-blue-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Total Registered Users</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{totalUsers.toLocaleString()}</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-emerald-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Active Platform Roles</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">4</p>
            <p className="text-[10px] font-black text-dark/50 mt-2 uppercase tracking-wider">Students, Parents, Tutors, Admins</p>
          </div>
        </div>

        <div className="rounded-[20px] sm:rounded-[28px] border-[3px] sm:border-[4px] border-dark bg-amber-100 p-5 sm:p-6 shadow-[4px_4px_0px_#060E1C] sm:shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3">
            <KeyRound className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Pending Tutor Reviews</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{pendingApprovals}</p>
            <p className="text-[10px] font-black text-dark/50 mt-2 uppercase tracking-wider">Tutor profiles waiting</p>
          </div>
        </div>
      </div>

      {/* User Directory Table Container */}
      <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
        <div className="p-6 border-b-[4px] border-dark bg-rose-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-dark tracking-tight">User Operations Directory</h2>
            <p className="text-xs font-bold text-dark/70 mt-0.5">Filter, manage, or export account data.</p>
          </div>

          <button
            onClick={handleExportCSV}
            className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-4 py-2.5 inline-flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export CSV Data
          </button>
        </div>

        {/* Toolbar Filter & Search */}
        <div className="p-4 bg-slate-50 border-b-[3px] border-dark flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
            {(['all', 'student', 'parent', 'tutor', 'admin'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl border-[2px] border-dark text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-dark text-white shadow-[2px_2px_0px_#060E1C]'
                    : 'bg-white text-dark/70 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-dark/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user name or email..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border-[2px] border-dark bg-white text-xs font-bold text-dark focus:outline-none focus:border-yellow"
            />
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-4">
          {filteredUsers.length === 0 ? (
            <p className="text-sm font-bold text-dark/50 py-4 text-center">No users found matching filter.</p>
          ) : (
            filteredUsers.map((row) => {
              const status = statusState[row.id] || 'active';
              return (
                <div key={row.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C]">
                  <div>
                    <p className="font-black text-lg text-dark">{row.fullName || row.email}</p>
                    <p className="text-xs font-bold text-dark/60 mt-0.5">{row.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="uppercase text-[9px] tracking-wider font-black bg-dark text-white px-2 py-0.5 rounded">
                        {row.role}
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-dark ${
                        status === 'active' ? 'bg-emerald-200 text-emerald-950' : 'bg-rose-200 text-rose-950'
                      }`}>
                        {status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => toggleUserStatus(row.id, row.fullName || row.email)}
                      className={`px-3 py-1.5 rounded-xl border-[2px] border-dark text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] transition-all ${
                        status === 'active'
                          ? 'bg-rose-100 hover:bg-rose-200 text-rose-900'
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                      }`}
                    >
                      {status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
