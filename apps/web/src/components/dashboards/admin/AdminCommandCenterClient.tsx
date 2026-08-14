'use client';

import { useState } from 'react';
import { ShieldAlert, Megaphone, Cpu, Building2, CheckCircle2, AlertTriangle, Play, Pause, Send, X, RefreshCw } from 'lucide-react';

export function AdminCommandCenterClient() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showAiConfigModal, setShowAiConfigModal] = useState(false);
  const [showSchoolModal, setShowSchoolModal] = useState(false);

  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [broadcastType, setBroadcastType] = useState<'info' | 'urgent' | 'reward'>('info');

  const [dailyQuota, setDailyQuota] = useState('50');
  const [aiProvider, setAiProvider] = useState('openrouter');

  const [toast, setToast] = useState<string | null>(null);

  const handleToggleMaintenance = () => {
    const nextState = !maintenanceMode;
    setMaintenanceMode(nextState);
    setToast(
      nextState
        ? '⚠️ MAINTENANCE MODE ACTIVATED! Platform sign-ins are restricted to Admins only.'
        : '✅ MAINTENANCE MODE DEACTIVATED. Platform opened for all Students, Parents, & Tutors.'
    );
    setTimeout(() => setToast(null), 5000);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setToast(`📢 Live Announcement Broadcast sent to ${broadcastTarget.toUpperCase()} dashboards!`);
    setBroadcastTitle('');
    setBroadcastMessage('');
    setShowBroadcastModal(false);
    setTimeout(() => setToast(null), 5000);
  };

  const handleSaveAiConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setToast(`🤖 AI Quota updated: ${dailyQuota} tokens/day via ${aiProvider.toUpperCase()} provider.`);
    setShowAiConfigModal(false);
    setTimeout(() => setToast(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="p-4 bg-yellow border-[3px] border-dark text-dark font-black rounded-2xl shadow-[4px_4px_0px_#060E1C] flex items-center justify-between gap-3 animate-fade-up">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-dark" />
            <span>{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="p-1 hover:bg-dark/10 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* World-Class Enterprise Control Bar */}
      <div className="border-[3px] sm:border-[4px] border-dark rounded-[24px] bg-white shadow-[6px_6px_0px_#060E1C] overflow-hidden">
        <div className="p-4 sm:p-6 bg-slate-900 text-white border-b-[3px] border-dark flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-yellow rounded-xl border-[2px] border-white flex items-center justify-center text-dark">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white">Enterprise Platform Governance</h2>
              <p className="text-xs font-bold text-white/70">Top 10 Global EdTech Admin Controls & Safeguards</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Maintenance Mode Toggle */}
            <button
              onClick={handleToggleMaintenance}
              className={`px-4 py-2 rounded-xl border-[2px] border-dark text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#ffffff] transition-all active:scale-95 flex items-center gap-2 cursor-pointer ${
                maintenanceMode
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-emerald-400 text-dark hover:bg-emerald-300'
              }`}
            >
              {maintenanceMode ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {maintenanceMode ? 'Maintenance ACTIVE' : 'Platform ONLINE'}
            </button>

            {/* Broadcast Button */}
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="px-4 py-2 bg-yellow text-dark border-[2px] border-dark rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#ffffff] transition-all hover:bg-yellow-light active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Megaphone className="h-4 w-4" /> Send Live Broadcast
            </button>

            {/* AI Control Button */}
            <button
              onClick={() => setShowAiConfigModal(true)}
              className="px-4 py-2 bg-sky-300 text-dark border-[2px] border-dark rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#ffffff] transition-all hover:bg-sky-200 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Cpu className="h-4 w-4" /> AI Quota Governance
            </button>

            {/* Partner Schools Button */}
            <button
              onClick={() => setShowSchoolModal(true)}
              className="px-4 py-2 bg-purple-300 text-dark border-[2px] border-dark rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#ffffff] transition-all hover:bg-purple-200 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Building2 className="h-4 w-4" /> Partner Schools
            </button>
          </div>
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[24px] border-[4px] border-dark bg-white p-6 shadow-[10px_10px_0px_#060E1C] animate-fade-up">
            <div className="flex items-center justify-between border-b-[3px] border-dark pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-dark" />
                <h3 className="text-xl font-black text-dark">Platform-Wide Live Announcement</h3>
              </div>
              <button onClick={() => setShowBroadcastModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5 text-dark" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-dark mb-1">Target Audience</label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-[2.5px] border-dark text-sm font-bold text-dark focus:outline-none focus:border-yellow bg-white"
                >
                  <option value="all">All Users (Students, Parents, Tutors)</option>
                  <option value="students">Students Only</option>
                  <option value="parents">Parents Only</option>
                  <option value="tutors">Tutors Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-dark mb-1">Notice Priority Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'info', label: 'Info Banner', bg: 'bg-sky-100' },
                    { id: 'urgent', label: 'Urgent Alert', bg: 'bg-rose-100' },
                    { id: 'reward', label: 'Reward / Event', bg: 'bg-yellow' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setBroadcastType(t.id as any)}
                      className={`p-2.5 rounded-xl border-[2px] border-dark text-xs font-black text-dark transition-all ${t.bg} ${
                        broadcastType === t.id ? 'ring-2 ring-dark shadow-[2px_2px_0px_#060E1C]' : 'opacity-70'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-dark mb-1">Headline Title (Optional)</label>
                <input
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Scheduled System Maintenance"
                  className="w-full px-4 py-3 rounded-xl border-[2.5px] border-dark text-sm font-bold text-dark focus:outline-none focus:border-yellow"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-dark mb-1">Broadcast Message Content</label>
                <textarea
                  required
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Type the announcement message to display live on user dashboards..."
                  className="w-full px-4 py-3 rounded-xl border-[2.5px] border-dark text-sm font-bold text-dark focus:outline-none focus:border-yellow"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2.5 rounded-xl border-[2px] border-dark text-xs font-bold text-dark hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-yellow border-[2.5px] border-dark rounded-xl text-xs font-black text-dark shadow-[3px_3px_0px_#060E1C] flex items-center gap-2"
                >
                  <Send className="h-4 w-4" /> Broadcast Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Quota Config Modal */}
      {showAiConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[24px] border-[4px] border-dark bg-white p-6 shadow-[10px_10px_0px_#060E1C] animate-fade-up">
            <div className="flex items-center justify-between border-b-[3px] border-dark pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-dark" />
                <h3 className="text-xl font-black text-dark">AI Token Quota Governance</h3>
              </div>
              <button onClick={() => setShowAiConfigModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5 text-dark" />
              </button>
            </div>

            <form onSubmit={handleSaveAiConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-dark mb-1">Active Primary AI Engine</label>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-[2.5px] border-dark text-sm font-bold text-dark focus:outline-none focus:border-yellow bg-white"
                >
                  <option value="openrouter">OpenRouter API (DeepSeek V3 / Claude 3.5)</option>
                  <option value="gemini">Google Gemini 2.5 Flash (Recommended)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-dark mb-1">Max Daily AI Generations Per Student</label>
                <input
                  type="number"
                  min="5"
                  max="500"
                  value={dailyQuota}
                  onChange={(e) => setDailyQuota(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-[2.5px] border-dark text-sm font-bold text-dark focus:outline-none focus:border-yellow"
                />
                <p className="text-[11px] font-bold text-dark/60 mt-1">Prevents API key depletion while maintaining high student engagement.</p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAiConfigModal(false)}
                  className="px-4 py-2.5 rounded-xl border-[2px] border-dark text-xs font-bold text-dark hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-yellow border-[2.5px] border-dark rounded-xl text-xs font-black text-dark shadow-[3px_3px_0px_#060E1C]"
                >
                  Save Governance Rules
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Partner Schools Modal */}
      {showSchoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-[24px] border-[4px] border-dark bg-white p-6 shadow-[10px_10px_0px_#060E1C] animate-fade-up">
            <div className="flex items-center justify-between border-b-[3px] border-dark pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-dark" />
                <h3 className="text-xl font-black text-dark">Partner Schools Directory</h3>
              </div>
              <button onClick={() => setShowSchoolModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5 text-dark" />
              </button>
            </div>

            <p className="text-xs font-bold text-dark/70 mb-4">
              Manage institutional accounts, bulk student imports, and school partner licenses.
            </p>

            <div className="space-y-3">
              {[
                { name: 'St. Gregory International School', students: 142, status: 'Active' },
                { name: 'Corona Secondary School', students: 98, status: 'Active' },
                { name: 'Lekki British International', students: 215, status: 'Active' },
              ].map((sch) => (
                <div key={sch.name} className="p-3.5 rounded-xl border-[2px] border-dark bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="font-black text-xs text-dark">{sch.name}</p>
                    <p className="text-[10px] font-bold text-dark/60">{sch.students} enrolled students</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-dark rounded text-[10px] font-black">
                    {sch.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSchoolModal(false)}
                className="px-6 py-2.5 bg-dark text-white border-[2.5px] border-dark rounded-xl text-xs font-black shadow-[3px_3px_0px_#060E1C]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
