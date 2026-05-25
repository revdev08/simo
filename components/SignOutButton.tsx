'use client';

import { useClerk } from '@clerk/nextjs';
import { LogOut } from 'lucide-react';

export default function SignOutButton() {
  const { signOut } = useClerk();

  const handleSignOut = () => {
    signOut({ redirectUrl: '/' });
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-slate-400 hover:text-red-500 p-2.5 transition-all cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-800/50 flex items-center justify-center"
      title="Cerrar sesión"
    >
      <LogOut className="w-5 h-5" />
    </button>
  );
}
