'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BandProvider } from '@/components/dashboards/BandContext';
import StudentSidebarNav from '@/components/dashboards/StudentSidebarNav';
import { LogoutButton } from '@/components/ui/logout-button';
import { 
  Calendar, CheckSquare, Users, PenTool, LayoutDashboard, MessageCircle, 
  Settings, ArrowLeft, Crown, Bell, Search, Zap, Activity, Clock as ClockIcon
} from 'lucide-react';

const NavItem = ({ href, icon: Icon, label, active }: { href: string, icon: any, label: string, active?: boolean }) => (
  <Link href={href} className="relative group block">
    <motion.div 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 overflow-hidden ${
        active 
          ? 'bg-yellow shadow-[0_0_20px_rgba(245,197,24,0.3)]' 
          : 'hover:bg-white/5'
      }`}
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Active Accent Glow */}
      {active && (
        <motion.div 
          layoutId="activeGlow"
          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none"
        />
      )}
      
      <Icon className={`w-4 h-4 shrink-0 transition-transform duration-500 ${active ? 'text-navy scale-110' : 'text-grey group-hover:text-yellow'}`} />
      <span className={`text-xs font-black uppercase tracking-widest ${active ? 'text-navy' : 'text-grey group-hover:text-white'}`}>
        {label}
      </span>

      {/* Status LED for active state */}
      {active && (
        <div className="ml-auto w-1.5 h-1.5 bg-navy rounded-full animate-pulse" />
      )}
    </motion.div>
  </Link>
);

const TelemetryItem = ({ icon: Icon, value, label }: { icon: any, value: string, label: string }) => (
  <div className="flex flex-col items-end">
    <div className="flex items-center gap-2">
       <span className="text-[10px] font-black text-white tracking-widest">{value}</span>
       <Icon className="w-3 h-3 text-yellow" />
    </div>
    <span className="telemetry-text">{label}</span>
  </div>
);

export default function DashboardClientShell({ role, initialBand, children }: { role: string; initialBand: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <BandProvider initialBand={initialBand}>
      <div className="min-h-screen bg-white flex font-body text-dark selection:bg-yellow selection:text-dark overflow-hidden uppercase font-black">
        
        {/* Navy Neo-Brutalist Sidebar */}
        <aside className="w-80 bg-navy border-r-[4px] border-dark sticky top-0 h-screen flex flex-col p-8 z-30 transition-all duration-500 shadow-[10px_0px_0px_#F5C518]">
          
          {/* BOLD BRANDING */}
          <div className="flex items-center gap-4 mb-16 p-2 group cursor-pointer brutalist-3d bg-yellow border-[3px] border-dark shadow-[4px_4px_0px_#060E1C] rounded-xl">
             <div className="relative">
                <div className="w-12 h-12 bg-white border-[3px] border-dark rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-transform">
                   <Crown className="w-6 h-6 text-navy" />
                </div>
             </div>
             <div>
                <h2 className="font-heading font-black text-2xl tracking-tighter leading-none mb-1 text-navy">EDVOURA</h2>
                <span className="text-[10px] font-black tracking-[0.2em] text-navy/60 uppercase">High-Tier Learning</span>
             </div>
          </div>

          <nav className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="px-4 py-2 mb-2 bg-white/5 border-l-[4px] border-yellow">
               <span className="text-[10px] font-black uppercase tracking-widest text-yellow">Main Navigation</span>
            </div>
            
            <NavItem 
              href="/dash" 
              icon={Activity} 
              label="Overview" 
              active={pathname === '/dash' || pathname === `/dash/${role}`} 
            />
            
            {role === 'student' && <StudentSidebarNav initialBand={initialBand} />}

            <div className="pt-12 px-4 opacity-40">
               <span className="text-[9px] font-black uppercase tracking-widest text-white">External Sites</span>
            </div>
            
            <NavItem href="/" icon={ArrowLeft} label="Exit Portal" />
          </nav>

          {/* User Profile Hook */}
          <div className="mt-auto pt-8 border-t-[3px] border-white/10 space-y-6">
             <div className="flex items-center gap-4 p-4 rounded-xl bg-white border-[3px] border-dark hover:shadow-[6px_6px_0px_#F5C518] transition-all group cursor-pointer transform hover:-translate-y-1">
                <div className="w-12 h-12 rounded-lg bg-yellow border-[2px] border-dark flex items-center justify-center p-1 overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=Explorer`} alt="Avatar" className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-[11px] font-black uppercase tracking-tight text-dark truncate">Elite Scholar</p>
                   <p className="text-[9px] font-black text-navy opacity-40 uppercase tracking-tighter">Level 24 • Pro</p>
                </div>
             </div>
             <LogoutButton variant="brutalist" />
          </div>
        </aside>

        {/* Action Layer */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white pattern-dots !bg-opacity-5">
           
           {/* High-Contrast Top Bar */}
           <header className="h-24 bg-white border-b-[4px] border-dark px-12 flex items-center justify-between z-20">
              <div className="flex items-center gap-12">
                 <div className="flex items-center gap-4 bg-white border-[3px] border-dark px-6 py-2 shadow-[4px_4px_0px_#22C55E] rounded-md">
                    <Activity className="w-5 h-5 text-success animate-pulse" />
                    <span className="text-[11px] font-black text-dark uppercase tracking-widest">Active Connection</span>
                 </div>
                 
                 <div className="flex items-center gap-4 group cursor-pointer bg-white border-[3px] border-dark px-8 py-2 shadow-[4px_4px_0px_#F5C518] rounded-md transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#F5C518]">
                    <Search className="w-5 h-5 text-dark" />
                    <input 
                      type="text" 
                      placeholder="SEARCH VAULT..." 
                      className="bg-transparent text-[11px] font-black text-dark outline-none placeholder:text-dark/20 w-48"
                    />
                 </div>
              </div>

              <div className="flex items-center gap-8">
                 <div className="bg-white border-[3px] border-dark px-6 py-2 shadow-[4px_4px_0px_#060E1C] rounded-md flex flex-col items-end">
                    <span className="text-xl font-black text-dark">{time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-[9px] font-black text-navy opacity-40 tracking-[0.2em] uppercase">Universal Time</span>
                 </div>
                 
                 <div className="relative cursor-pointer bg-white border-[4px] border-dark p-3 rounded-xl shadow-[6px_6px_0px_#EF4444] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#EF4444] transition-all">
                    <Bell className="w-6 h-6 text-dark" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full border-[2px] border-dark" />
                 </div>
              </div>
           </header>

           {/* Content Viewport */}
           <main className="flex-1 overflow-y-auto px-16 py-12 relative custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
           </main>
        </div>
      </div>
    </BandProvider>
  );
}



