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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session?.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session?.user);
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

  if (isMarketingRoot) {
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

