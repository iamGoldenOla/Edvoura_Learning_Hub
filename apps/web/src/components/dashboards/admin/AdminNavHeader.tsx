'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ShieldCheck, BookOpenCheck, Gift, CreditCard, LifeBuoy, Video, ArrowLeft } from 'lucide-react';

const adminLinks = [
  { href: '/dash/admin', label: 'Command Center', icon: LayoutDashboard },
  { href: '/dash/admin/users', label: 'Users & Roles', icon: Users },
  { href: '/dash/admin/tutors', label: 'Tutors', icon: ShieldCheck },
  { href: '/dash/admin/academic', label: 'Academic', icon: BookOpenCheck },
  { href: '/dash/admin/lessons', label: 'Lesson Oversight', icon: Video },
  { href: '/dash/admin/engagement', label: 'Engagement', icon: Gift },
  { href: '/dash/admin/finance', label: 'Finance', icon: CreditCard },
  { href: '/dash/admin/support', label: 'Support', icon: LifeBuoy },
];

export function AdminNavHeader({ title, subtitle }: { title?: string; subtitle?: string }) {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Quick Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-[3px] border-dark rounded-2xl bg-white p-3 shadow-[4px_4px_0px_#060E1C]">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <Link
            href="/dash"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-off-white hover:bg-yellow/20 text-dark font-black text-xs border border-dark/20 transition-all shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Main Portal
          </Link>
          <div className="h-4 w-px bg-dark/20 mx-1 shrink-0" />
          {adminLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-[2px] text-xs font-black transition-all shrink-0 ${
                  isActive
                    ? 'bg-dark text-white border-dark shadow-[2px_2px_0px_#060E1C]'
                    : 'bg-white text-dark/70 border-transparent hover:border-dark/30 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      {title ? (
        <div className="border-[3px] sm:border-[4px] border-dark rounded-[20px] sm:rounded-[28px] bg-white shadow-[4px_4px_0px_#060E1C] sm:shadow-[10px_10px_0px_#060E1C] overflow-hidden min-w-0">
          <div className="p-6 sm:p-8 border-b-[4px] border-dark bg-yellow">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-3 text-sm md:text-base font-bold text-dark/70 max-w-2xl">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
