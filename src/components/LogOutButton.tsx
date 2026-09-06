'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LogOutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    localStorage.removeItem('shramnexus-auth');
    localStorage.removeItem('shramnexus-admin-auth');
    localStorage.removeItem('sharmnexus-auth');
    localStorage.removeItem('sharmnexus-admin-auth');
    sessionStorage.clear();
    document.cookie = 'admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  return (
    <button 
      onClick={handleLogout}
      className="text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors"
    >
      Log out
    </button>
  );
}
