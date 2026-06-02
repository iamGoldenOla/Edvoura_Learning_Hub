import Link from 'next/link';
import { Lock, LogOut, User } from 'lucide-react';
import { LogoutButton } from '@/components/ui/logout-button';

export const dynamic = 'force-dynamic';

export default function StudentSubscriptionInactivePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-10">
      <div className="border-[4px] border-dark rounded-[28px] bg-white p-8 sm:p-10 shadow-[10px_10px_0px_#060E1C] text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-dark bg-rose-300 shadow-[3px_3px_0px_#060E1C] text-dark">
          <Lock className="h-8 w-8" />
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-dark leading-none">
          Learning Portal Locked
        </h1>
        
        <div className="space-y-4 text-sm sm:text-base font-bold text-dark/70 normal-case leading-relaxed">
          <p>
            Your student workspace is temporarily locked because your family subscription is currently inactive.
          </p>
          <p className="bg-yellow/10 border-[2px] border-dashed border-dark/30 rounded-xl p-4 text-xs sm:text-sm text-dark font-black">
            💡 Please ask your parent to log in to their Parent Portal and renew the subscription under the "Billing" section.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href="/dash/profile"
            className="w-full sm:w-auto h-12 px-6 bg-white border-[3px] border-dark text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none inline-flex items-center justify-center gap-2"
          >
            <User className="h-4 w-4" /> Profile Settings
          </Link>
          <div className="w-full sm:w-auto">
            <LogoutButton variant="brutalist" />
          </div>
        </div>
      </div>
    </div>
  );
}
