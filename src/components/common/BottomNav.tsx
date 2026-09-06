'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, CalendarClock, User, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBookingStore } from '@/lib/store/bookingStore';

export function BottomNav() {
  const pathname = usePathname();
  const bookings = useBookingStore((state) => state.bookings);
  const activeCount = bookings.filter((b) => b.status !== 'completed' && b.status !== 'cancelled').length;

  // Don't show on admin routes or auth routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/auth')) {
    return null;
  }

  const isWorker = pathname.startsWith('/worker');

  interface NavItem {
    href: string;
    label: string;
    icon: any;
    badge?: number;
    isEmergency?: boolean;
  }

  const customerLinks: NavItem[] = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/services', label: 'Services', icon: Search },
    { href: '/emergency', label: 'Emergency', icon: Zap, isEmergency: true },
    {
      href: '/history',
      label: 'Bookings',
      icon: CalendarClock,
      badge: activeCount > 0 ? activeCount : undefined,
    },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const workerLinks: NavItem[] = [
    { href: '/worker-dashboard', label: 'Dashboard', icon: Home },
    { href: '/jobs', label: 'Jobs', icon: CalendarClock },
    { href: '/earnings', label: 'Earnings', icon: Search },
    { href: '/worker-profile', label: 'ID Card', icon: User },
  ];

  const links: NavItem[] = isWorker ? workerLinks : customerLinks;

  return (
    <nav className="fixed bottom-0 z-50 w-full border-t border-gray-200/90 bg-white/95 backdrop-blur-md pb-safe sm:hidden shadow-lg">
      <div className="flex h-16 items-center justify-around px-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            pathname === link.href ||
            (link.href !== '/' && link.href !== '/worker' && pathname.startsWith(link.href));

          if ((link as any).isEmergency) {
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center justify-center w-full h-full text-red-600 font-bold -mt-3"
              >
                <div className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md ring-4 ring-white animate-bounce">
                  <Zap className="h-5 w-5 fill-current" />
                </div>
                <span className="text-[10px] font-bold text-red-600 mt-0.5">SOS</span>
              </Link>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                isActive
                  ? 'text-[#24172f] font-bold'
                  : 'text-gray-500 hover:text-gray-900'
              )}
            >
              <div className="relative">
                <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
                {link.badge && (
                  <span className="absolute -top-1 -right-2 bg-[#e6aa3b] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {link.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
