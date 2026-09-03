'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, CalendarClock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  // Don't show on admin routes or auth routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/auth')) {
    return null;
  }

  const isWorker = pathname.startsWith('/worker');

  const customerLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/services', label: 'Services', icon: Search },
    { href: '/history', label: 'Bookings', icon: CalendarClock },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const workerLinks = [
    { href: '/worker', label: 'Dashboard', icon: Home },
    { href: '/worker/jobs', label: 'Jobs', icon: CalendarClock },
    { href: '/worker/earnings', label: 'Earnings', icon: Search }, // TODO: specific icon
    { href: '/worker/profile', label: 'Profile', icon: User },
  ];

  const links = isWorker ? workerLinks : customerLinks;

  return (
    <nav className="fixed bottom-0 z-50 w-full border-t bg-background pb-safe sm:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/' && link.href !== '/worker' && pathname.startsWith(link.href));
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1',
                isActive ? 'text-emerald-600' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
