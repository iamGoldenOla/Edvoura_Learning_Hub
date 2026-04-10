'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  variant?: 'default' | 'brutalist';
}

export function LogoutButton({ variant = 'default' }: LogoutButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (variant === 'brutalist') {
    return (
      <button 
        onClick={handleLogout}
        className="w-full py-4 rounded-xl bg-white/5 border border-white/10 hover:border-error hover:text-error transition-all flex items-center justify-between px-6 group"
      >
        <span className="text-[10px] font-black uppercase tracking-widest text-grey group-hover:text-error">Terminate Session</span>
        <LogOut className="w-4 h-4 text-grey group-hover:text-error group-hover:-translate-x-1 transition-all" />
      </button>
    );
  }

  return (
    <button 
      onClick={handleLogout}
      className="block text-slate-300 hover:text-white mt-12 w-full text-left"
    >
      Log out
    </button>
  );
}

