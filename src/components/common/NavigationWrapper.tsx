'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/common/Navbar';
import { BottomNav } from '@/components/common/BottomNav';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hasSession, setHasSession] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkLocal = () => {
      try {
        const localAuth = localStorage.getItem('shramnexus-auth') || localStorage.getItem('sharmnexus-auth');
        if (localAuth) {
          const parsed = JSON.parse(localAuth);
          if (parsed.isLoggedIn) return true;
        }
      } catch (e) {}
      return false;
    };

    const syncUser = (user: any) => {
      try {
        const local = localStorage.getItem('shramnexus-auth') || localStorage.getItem('sharmnexus-auth');
        if (!local) {
          const role = user.user_metadata?.user_type || 'customer';
          const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
          const payload = JSON.stringify({
            id: user.id,
            isLoggedIn: true,
            role,
            name,
            email: user.email,
          });
          localStorage.setItem('shramnexus-auth', payload);
          localStorage.setItem('sharmnexus-auth', payload);
        }
      } catch (e) {}
    };

    if (checkLocal()) {
      setHasSession(true);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setHasSession(true);
        syncUser(session.user);
      } else if (!checkLocal()) {
        setHasSession(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setHasSession(true);
        syncUser(session.user);
      } else if (!checkLocal()) {
        setHasSession(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Auth pages have their own self-contained layouts
  const isAuth = pathname?.startsWith('/auth');

  // Dedicated worker app routes have their own worker layout & navigation
  const isWorkerRoute =
    pathname?.startsWith('/worker-dashboard') ||
    pathname === '/jobs' ||
    pathname === '/earnings' ||
    pathname === '/worker-profile' ||
    pathname?.startsWith('/worker');

  // Admin pages have their own layout
  const isAdminRoute = pathname?.startsWith('/admin');

  // Cooperative portal has its own dedicated portal layout & topbar
  const isCooperativeRoute = pathname?.startsWith('/cooperative');

  // Marketing page at root (when not logged in) renders dedicated landing navbar
  const isMarketingRoot = pathname === '/' && !hasSession;

  if (isMarketingRoot || isAuth) {
    return <>{children}</>;
  }

  const hideNav = isAuth || isWorkerRoute || isAdminRoute || isCooperativeRoute;

  return (
    <>
      {!hideNav && <Navbar />}
      <main className="flex-1 pb-16 sm:pb-0">
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </>
  );
}

