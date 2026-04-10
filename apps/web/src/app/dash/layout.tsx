import { ReactNode } from 'react';
import { createClient } from '@/utils/supabase/server';
import StudentSidebarNav from '@/components/dashboards/StudentSidebarNav';
import { LogoutButton } from '@/components/ui/logout-button';

export default async function DashboardLayout(props: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role || 'student';
  const initialBand = user?.user_metadata?.learner_band || '7-12';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-edvoura-navy text-white p-6 sticky top-0 h-screen flex flex-col overflow-y-auto">
        <h2 className="text-2xl font-black text-edvoura-gold mb-8 tracking-tight">EDVOURA</h2>
        <nav className="space-y-2 flex-1">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Main Menu</p>
          <a href="/dash" className="block text-slate-300 hover:text-white py-1">Dashboard Home</a>
          
          {role === 'student' && <StudentSidebarNav initialBand={initialBand} />}

          {role === 'tutor' && (
            <>
              <a href="/dash/tutor/schedule" className="block text-slate-300 hover:text-white py-1">Session Schedule</a>
              <a href="/dash/tutor/grading" className="block text-slate-300 hover:text-white py-1">Assignments & Grading</a>
              <a href="/dash/tutor/roster" className="block text-slate-300 hover:text-white py-1">Student Roster</a>
              <a href="/dash/tutor/builder" className="block text-slate-300 hover:text-white py-1">Resource & Quiz Builder</a>
              
              <div className="pt-4 mt-4 border-t border-slate-700/50">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Account</p>
                <a href="/dash/tutor/earnings" className="block text-slate-300 hover:text-white py-1">Earnings Dashboard</a>
                <a href="/dash/tutor/messages" className="block text-slate-300 hover:text-white py-1">Message Center</a>
              </div>
            </>
          )}

          {role === 'parent' && (
            <>
              <a href="/dash/parent/children" className="block text-slate-300 hover:text-white py-1">Enrolled Children</a>
              <a href="/dash/parent/monitor" className="block text-slate-300 hover:text-white py-1">Live Session Monitor</a>
              <a href="/dash/parent/reports" className="block text-slate-300 hover:text-white py-1">Progress Reports</a>
              
              <div className="pt-4 mt-4 border-t border-slate-700/50">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Administration</p>
                <a href="/dash/parent/billing" className="block text-slate-300 hover:text-white py-1">Billing & Subscriptions</a>
                <a href="/dash/parent/messages" className="block text-slate-300 hover:text-white py-1">Tutor Messages</a>
              </div>
            </>
          )}

          {role === 'admin' && (
            <>
              <a href="/dash/admin/users" className="block text-slate-300 hover:text-white py-1">User Management</a>
              <a href="/dash/admin/tutors" className="block text-slate-300 hover:text-white py-1">Tutor Approvals</a>
              <a href="/dash/admin/sessions" className="block text-slate-300 hover:text-white py-1">Live Session Control</a>
              
              <div className="pt-4 mt-4 border-t border-slate-700/50">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Platform</p>
                <a href="/dash/admin/finance" className="block text-slate-300 hover:text-white py-1">Revenue & Payouts</a>
                <a href="/dash/admin/content" className="block text-slate-300 hover:text-white py-1">Content Library</a>
                <a href="/dash/admin/settings" className="block text-slate-300 hover:text-white py-1">System Settings</a>
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
        {props.children}
      </main>
    </div>
  );
}
