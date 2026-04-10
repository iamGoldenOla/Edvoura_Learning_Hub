'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { BandProvider } from '@/components/dashboards/BandContext';
import StudentSidebarNav from '@/components/dashboards/StudentSidebarNav';
import { LogoutButton } from '@/components/ui/logout-button';
import { ArrowLeft } from 'lucide-react';
import { 
  Calendar, CheckSquare, Users, PenTool, LayoutDashboard, MessageCircle, 
  Baby, Eye, FileText, CreditCard, ShieldCheck, Video, DollarSign, Settings
} from 'lucide-react';

const NavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => (
  <Link href={href} className="flex items-center gap-3 text-slate-300 hover:text-white py-2 transition-colors">
    <Icon className="w-4 h-4 text-slate-400" />
    <span className="text-sm">{label}</span>
  </Link>
);

interface DashboardShellProps {
  role: string;
  initialBand: string;
  children: React.ReactNode;
}

export default function DashboardClientShell({ role, initialBand, children }: DashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine if we are on a sub-page (not the main dashboard home)
  const isSubPage = pathname !== '/dash' && pathname !== `/dash/${role}`;

  return (
    <BandProvider initialBand={initialBand}>
      <div className="min-h-screen bg-slate-50 flex">
        <aside className="w-64 bg-edvoura-navy text-white p-6 sticky top-0 h-screen flex flex-col overflow-y-auto">
          <h2 className="text-2xl font-black text-edvoura-gold mb-8 tracking-tight">EDVOURA</h2>
          <nav className="space-y-1 flex-1">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Main Menu</p>
            <NavItem href="/dash" icon={LayoutDashboard} label="Dashboard Home" />
            
            {role === 'student' && <StudentSidebarNav initialBand={initialBand} />}

            {role === 'tutor' && (
              <>
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-slate-400 hover:text-white py-2 mb-1 transition-colors text-xs uppercase tracking-widest font-bold"
                >
                  <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
                <NavItem href="/dash/tutor" icon={LayoutDashboard} label="Tutor Home" />
                <NavItem href="/dash/tutor/schedule" icon={Calendar} label="Session Schedule" />
                <NavItem href="/dash/tutor/grading" icon={CheckSquare} label="Assignments & Grading" />
                <NavItem href="/dash/tutor/roster" icon={Users} label="Student Roster" />
                <NavItem href="/dash/tutor/builder" icon={PenTool} label="Resource & Quiz Builder" />
                
                <div className="pt-4 mt-4 border-t border-slate-700/50 space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Account</p>
                  <NavItem href="/dash/tutor/earnings" icon={DollarSign} label="Earnings Dashboard" />
                  <NavItem href="/dash/tutor/messages" icon={MessageCircle} label="Message Center" />
                </div>
              </>
            )}

            {role === 'parent' && (
              <>
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-slate-400 hover:text-white py-2 mb-1 transition-colors text-xs uppercase tracking-widest font-bold"
                >
                  <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
                <NavItem href="/dash/parent" icon={LayoutDashboard} label="Parent Home" />
                <NavItem href="/dash/parent/children" icon={Baby} label="Enrolled Children" />
                <NavItem href="/dash/parent/monitor" icon={Eye} label="Live Session Monitor" />
                <NavItem href="/dash/parent/reports" icon={FileText} label="Progress Reports" />
                
                <div className="pt-4 mt-4 border-t border-slate-700/50 space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Administration</p>
                  <NavItem href="/dash/parent/billing" icon={CreditCard} label="Billing & Subscriptions" />
                  <NavItem href="/dash/parent/messages" icon={MessageCircle} label="Tutor Messages" />
                </div>
              </>
            )}

            {role === 'admin' && (
              <>
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-slate-400 hover:text-white py-2 mb-1 transition-colors text-xs uppercase tracking-widest font-bold"
                >
                  <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
                <NavItem href="/dash/admin" icon={LayoutDashboard} label="Admin Home" />
                <NavItem href="/dash/admin/users" icon={Users} label="User Management" />
                <NavItem href="/dash/admin/tutors" icon={ShieldCheck} label="Tutor Approvals" />
                <NavItem href="/dash/admin/sessions" icon={Video} label="Live Session Control" />
                
                <div className="pt-4 mt-4 border-t border-slate-700/50 space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Platform</p>
                  <NavItem href="/dash/admin/finance" icon={DollarSign} label="Revenue & Payouts" />
                  <NavItem href="/dash/admin/content" icon={FileText} label="Content Library" />
                  <NavItem href="/dash/admin/settings" icon={Settings} label="System Settings" />
                </div>
              </>
            )}
            
            <div className="pt-4 mt-4 border-t border-slate-700/50">
              <a href="/dash/profile" className="block text-slate-300 hover:text-white py-1">Profile Settings</a>
            </div>
          </nav>
          <div className="border-t border-slate-700 pt-4 pb-2 mt-4">
            <p className="text-sm text-slate-400 capitalize mb-2">{role} Account</p>
            <LogoutButton />
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </BandProvider>
  );
}
