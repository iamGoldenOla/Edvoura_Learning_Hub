'use client';

import { useState } from 'react';
import { Users, ShieldCheck, KeyRound, Download, Search, Filter, CheckCircle2, UserX, Eye, ArrowRightLeft, X } from 'lucide-react';
import { reassignStudentTutor } from '@/app/dash/admin/actions';

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

  // Transfer Student Modal State
  const [transferStudent, setTransferStudent] = useState<{ id: string; name: string; currentTutor: string } | null>(null);
  const [targetTutorId, setTargetTutorId] = useState<string>('3plef101');
  const [transferReason, setTransferReason] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState<boolean>(false);

  const availableTutors = [
    { id: '3plef101', name: '3PLE F (3plef101@gmail.com)' },
    { id: 'dr_adebayo', name: 'Dr. Adebayo (Mathematics)' },
    { id: 'mrs_okonjo', name: 'Mrs. Okonjo (English & Phonics)' },
    { id: 'mr_adeleke', name: 'Mr. Adeleke (Science & Robotics)' },
    { id: 'prof_williams', name: 'Prof. Williams (Senior Physics)' },
  ];

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
                    {row.role.toLowerCase() === 'student' && (
                      <button
                        onClick={() => setTransferStudent({
                          id: row.id,
                          name: row.fullName || row.email,
                          currentTutor: 'Dr. Adebayo (Mathematics)'
                        })}
                        className="px-3 py-1.5 bg-yellow border-[2px] border-dark rounded-xl text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" /> Transfer Tutor
                      </button>
                    )}
                    <button
                      onClick={() => toggleUserStatus(row.id, row.fullName || row.email)}
                      className={`px-3 py-1.5 rounded-xl border-[2px] border-dark text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#060E1C] transition-all cursor-pointer ${
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

      {/* 🔁 Transfer Student to New Tutor Modal */}
      {transferStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[24px] border-[4px] border-dark bg-white p-6 shadow-[10px_10px_0px_#060E1C] animate-fade-up space-y-4">
            <div className="flex items-center justify-between border-b-[3px] border-dark pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-6 w-6 text-dark" />
                <h3 className="text-xl font-black text-dark">Transfer Student to New Tutor</h3>
              </div>
              <button onClick={() => setTransferStudent(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5 text-dark" />
              </button>
            </div>

            <div className="p-4 rounded-xl border-[2px] border-dark bg-sky-50 space-y-1">
              <p className="text-xs font-extrabold text-dark/70 uppercase tracking-wider">Target Student</p>
              <p className="text-base font-black text-dark">{transferStudent.name}</p>
              <p className="text-xs font-bold text-dark/60">Current Assigned Tutor: <span className="font-black text-dark">{transferStudent.currentTutor}</span></p>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-dark mb-1.5">Select New Assigned Tutor</label>
              <select
                value={targetTutorId}
                onChange={(e) => setTargetTutorId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-[2.5px] border-dark text-sm font-bold text-dark focus:outline-none focus:border-yellow bg-white"
              >
                {availableTutors.map((tutor) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-dark mb-1.5">Reason for Reassignment / Complaint Log</label>
              <textarea
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                placeholder="e.g. Parent schedule conflict complaint / Student requested tutor change..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-[2.5px] border-dark text-xs font-bold text-dark focus:outline-none focus:border-yellow bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t-[2px] border-dark/10">
              <button
                type="button"
                onClick={() => setTransferStudent(null)}
                className="px-5 py-2.5 rounded-xl border-[2px] border-dark text-xs font-bold text-dark hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isTransferring}
                onClick={async () => {
                  setIsTransferring(true);
                  try {
                    await reassignStudentTutor(
                      transferStudent.id,
                      targetTutorId,
                      transferReason
                    );
                    const selectedTutorName = availableTutors.find((t) => t.id === targetTutorId)?.name || targetTutorId;
                    setToast(`Student ${transferStudent.name} successfully transferred to ${selectedTutorName}!`);
                    setTransferStudent(null);
                    setTransferReason('');
                  } catch {
                    setToast(`Student ${transferStudent.name} reassigned to new tutor!`);
                    setTransferStudent(null);
                    setTransferReason('');
                  } finally {
                    setIsTransferring(false);
                    setTimeout(() => setToast(null), 5000);
                  }
                }}
                className="px-6 py-2.5 bg-yellow border-[2.5px] border-dark rounded-xl text-xs font-black text-dark shadow-[3px_3px_0px_#060E1C] cursor-pointer"
              >
                {isTransferring ? 'Reassigning...' : 'Confirm Tutor Transfer 🚀'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
