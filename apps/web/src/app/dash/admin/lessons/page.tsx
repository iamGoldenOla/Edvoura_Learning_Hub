import Link from 'next/link';
import { CalendarClock, ShieldCheck, Video } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export default async function AdminLessonsPage() {
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    { count: lessonsToday },
    { count: liveSessions },
  ] = await Promise.all([
    supabase.from('lessons').select('*', { count: 'exact', head: true }).gte('scheduled_start_at', todayStart.toISOString()).lte('scheduled_start_at', todayEnd.toISOString()),
    supabase.from('lessons').select('*', { count: 'exact', head: true }).eq('status', 'live'),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-6 sm:p-8 pb-20">
      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 border-b-[4px] border-dark bg-sky-100">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
            Lesson Oversight
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
            Oversight for scheduled/live lessons, attendance integrity, and delivery compliance.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[28px] border-[4px] border-dark bg-blue-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <CalendarClock className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Lessons Today</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{lessonsToday ?? 0}</p>
          </div>
        </div>

        <div className="rounded-[28px] border-[4px] border-dark bg-purple-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <Video className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Live Sessions</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">{liveSessions ?? 0}</p>
          </div>
        </div>

        <div className="rounded-[28px] border-[4px] border-dark bg-emerald-100 p-6 shadow-[6px_6px_0px_#060E1C] flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-dark" />
            <p className="text-[10px] font-black uppercase tracking-widest text-dark/80">Compliance Score</p>
          </div>
          <div className="mt-6">
            <p className="text-5xl font-black text-dark">100%</p>
          </div>
        </div>
      </div>

      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-6 border-b-[4px] border-dark bg-amber-100 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-dark tracking-tight">Actions</h2>
        </div>
        <div className="p-6 sm:p-8 flex flex-wrap gap-4">
          <Link href="/dash/admin/lessons?action=live-monitor" className="bg-dark border-[3px] border-dark text-white font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 inline-flex items-center">
            Open Live Session Monitor
          </Link>
          <Link href="/dash/admin/lessons?action=missed-lessons" className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 inline-flex items-center">
            Review Missed Lessons
          </Link>
          <Link href="/dash/admin/notifications?action=lesson-reminders" className="bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 inline-flex items-center">
            Trigger Lesson Reminder Notifications
          </Link>
        </div>
      </div>
    </div>
  );
}
