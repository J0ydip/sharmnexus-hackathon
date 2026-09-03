'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/common/Navbar';
import { BottomNav } from '@/components/common/BottomNav';

export function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide the old Tailwind Navbar on the new SharmNexus landing page and auth pages
  const isMarketingOrAuth = pathname === '/' || pathname?.startsWith('/auth');

  return (
    <>
      {!isMarketingOrAuth && <Navbar />}
      <main className="flex-1 pb-16 sm:pb-0">
        {children}
      </main>
      {!isMarketingOrAuth && <BottomNav />}
    </>
  );
}
