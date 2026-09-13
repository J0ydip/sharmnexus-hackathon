'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  User,
  Globe,
  Bell,
  Zap,
  CalendarClock,
  Search,
  Home,
  ShieldCheck,
  Building2,
  LogOut,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useBookingStore } from '@/lib/store/bookingStore';
import { useCustomerI18n, CustomerLanguage } from '@/lib/i18n/customerTranslations';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [liveBookings, setLiveBookings] = useState<any[]>([]);
  const bookings = useBookingStore((state) => state.bookings);
  const activeBookings = bookings.filter((b) => b.status !== 'completed' && b.status !== 'cancelled');

  useEffect(() => {
    // 1. Check if notifications have been read
    try {
      const isRead = localStorage.getItem('shramnexus_notifications_read');
      if (!isRead) {
        setUnreadCount(1);
      } else {
        setUnreadCount(0);
      }
    } catch (e) {}

    // 2. Load authenticated user and their recent bookings immediately
    async function getUser() {
      try {
        const localAuth = localStorage.getItem('shramnexus-auth') || localStorage.getItem('sharmnexus-auth');
        let initialUser = null;
        if (localAuth) {
          try {
            const p = JSON.parse(localAuth);
            if (p.role === 'admin' || p.name === 'Super Admin' || p.email === 'admin@shramnexus.com') {
              localStorage.removeItem('shramnexus-auth');
              localStorage.removeItem('sharmnexus-auth');
            } else {
              initialUser = {
                email: p.email,
                user_metadata: { full_name: p.name }
              };
              setUser(initialUser);
            }
          } catch (e) {}
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userRole = session.user.user_metadata?.user_type || session.user.user_metadata?.role;
          const userName = session.user.user_metadata?.full_name || session.user.user_metadata?.name;
          const userEmail = session.user.email;
          if (userRole === 'admin' || userName === 'Super Admin' || userEmail === 'admin@shramnexus.com') {
            setUser(null);
            return;
          }
          setUser(session.user);
          const { data: bList } = await supabase
            .from('bookings')
            .select('id, status, scheduled_at, service_categories(name), worker:worker_id(full_name)')
            .eq('customer_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(5);
          if (bList && bList.length > 0) {
            setLiveBookings(bList);
          }
        } else if (!initialUser) {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      }
    }
    getUser();
  }, []);

  const handleMarkAllNotificationsRead = () => {
    setUnreadCount(0);
    try {
      localStorage.setItem('shramnexus_notifications_read', 'true');
    } catch (e) {}
  };

  const isAdmin = pathname.startsWith('/admin');
  const isWorker = pathname.startsWith('/worker');
  const isCoop = pathname.startsWith('/cooperative');

  let portalName = 'Customer Portal';
  let homeLink = '/';
  if (isAdmin) {
    portalName = 'Admin Dashboard';
    homeLink = '/admin';
  } else if (isCoop) {
    portalName = 'Cooperative Portal';
    homeLink = '/cooperative';
  } else if (isWorker) {
    portalName = 'Worker App';
    homeLink = '/worker-dashboard';
  }

  const { lang, changeLang, t } = useCustomerI18n();

  const switchLanguage = (newLang: CustomerLanguage) => {
    changeLang(newLang);
    document.cookie = `googtrans=/en/${newLang}; path=/`;
    document.cookie = `googtrans=/en/${newLang}; path=/; domain=${window.location.hostname}`;
  };

  const navLinks: Array<{
    href: string;
    label: string;
    icon: any;
    isEmergency?: boolean;
    badge?: string | number;
  }> = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/services', label: 'Services', icon: Search },
    {
      href: '/history',
      label: 'Bookings',
      icon: CalendarClock,
      badge: activeBookings.length > 0 ? activeBookings.length : undefined,
    },
    { href: '/#support', label: 'Help & Support', icon: HelpCircle },
    {
      href: '/emergency',
      label: 'Emergency SOS',
      icon: Zap,
      isEmergency: true,
    },
  ];

  const handleNavScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#') && pathname === '/') {
      e.preventDefault();
      const targetId = href.replace('/#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', href);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 shadow-2xs">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile Menu & Brand */}
        <div className="flex items-center gap-3">
          {/* Mobile Sheet Nav */}
          <Sheet>
            <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 h-10 w-10">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-6">
              <div className="flex items-center gap-2.5 mb-6">
                <img
                  src="/logo.png"
                  alt="ShramNexus Logo"
                  className="w-10 h-10 rounded-xl object-contain shadow-xs border border-amber-200/80 overflow-hidden"
                />
                <div>
                  <span className="font-extrabold text-gray-900 text-lg leading-tight block">
                    Shram<span className="text-[#e6aa3b]">Nexus</span>
                  </span>
                  <span className="text-[10px] block text-gray-500 font-medium">Cooperative Gig Platform</span>
                </div>
              </div>

              <nav className="space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleNavScroll(e, link.href)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        link.isEmergency
                          ? 'bg-red-50 text-red-700 hover:bg-red-100 font-bold'
                          : isActive
                          ? 'bg-[#fbf7ef] text-[#24172f]'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${link.isEmergency ? 'text-red-600' : 'text-gray-500'}`} />
                        <span>{link.label}</span>
                      </div>
                      {link.badge && (
                        <span className="bg-[#e6aa3b] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-100 space-y-2">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2">
                  Portal Switcher
                </div>
                <Link
                  href="/"
                  className="flex items-center gap-2 text-xs font-semibold text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#7c5cf0]" />
                  Customer Experience
                </Link>
                <Link
                  href="/worker-dashboard"
                  className="flex items-center gap-2 text-xs font-semibold text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  Worker Portal (PWA)
                </Link>
                <Link
                  href="/#cooperatives"
                  className="flex items-center gap-2 text-xs font-semibold text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  Cooperative Society Portal
                </Link>
                <Link
                  href="/admin"
                  className="flex items-center gap-2 text-xs font-semibold text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Federation Admin
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo & Brand */}
          <Link href={homeLink} className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="ShramNexus Logo"
              className="w-10 h-10 rounded-xl object-contain shadow-xs border border-amber-200/80 group-hover:scale-105 transition-transform overflow-hidden"
            />
            <div>
              <span className="text-lg font-black tracking-tight text-gray-900 leading-tight">
                Shram<span className="text-[#e6aa3b]">Nexus</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-[#24172f] bg-[#fbf7ef] px-2 py-0.5 rounded-md ml-2 border border-[#e6aa3b]/30">
                SIH 26089
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            if (link.isEmergency) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all shadow-2xs ml-2 animate-pulse"
                >
                  <Zap className="h-3.5 w-3.5 text-red-600" />
                  <span>{link.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavScroll(e, link.href)}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#fbf7ef] text-[#24172f] font-bold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#e6aa3b]' : 'text-gray-400'}`} />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="bg-[#e6aa3b] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Notifications, Language, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="relative inline-flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 h-9 w-9 transition-colors">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl shadow-xl border border-gray-200">
              <div className="p-3.5 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">Notifications</span>
                <button
                  type="button"
                  onClick={handleMarkAllNotificationsRead}
                  className="text-[10px] text-[#d96f4d] font-semibold hover:underline"
                >
                  Mark all as read
                </button>
              </div>
              <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                {liveBookings.length === 0 && bookings.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">
                    No active notifications. Service and booking updates will appear here.
                  </div>
                ) : (
                  (liveBookings.length > 0 ? liveBookings : bookings).map((b: any) => {
                    const srvName = b.service_categories?.name || b.service_name || 'Service';
                    const workerName = b.worker?.full_name || (b.worker as any)?.name;
                    const isDone = b.status === 'completed';
                    const isCancelled = b.status === 'cancelled';
                    return (
                      <Link
                        key={b.id}
                        href={`/track/${b.id}`}
                        className="p-3 hover:bg-gray-50 text-xs transition-colors flex items-start gap-2.5 block"
                      >
                        <div className={`p-1.5 rounded-lg mt-0.5 ${isDone ? 'bg-emerald-100 text-emerald-700' : isCancelled ? 'bg-red-100 text-red-700' : 'bg-[#fbf7ef] text-[#e6aa3b]'}`}>
                          {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : isCancelled ? <Clock className="w-3.5 h-3.5 text-red-500" /> : <Clock className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <strong className="text-gray-900 block text-[11px]">
                            {isDone ? `✓ Completed: ${srvName}` : isCancelled ? `Cancelled: ${srvName}` : `${srvName} (${b.status})`}
                          </strong>
                          <p className="text-gray-500 text-[11px] mt-0.5">
                            {isDone
                              ? 'Job completed! Click to view receipt or rate worker.'
                              : isCancelled
                              ? 'This booking has been cancelled.'
                              : workerName
                              ? `${workerName} assigned from cooperative.`
                              : 'Dispatch network matching verified tradesperson.'}
                          </p>
                          <span className="text-[10px] text-gray-400 mt-1 block">#{b.id.slice(0, 8)}</span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-xl text-gray-600 hover:bg-gray-100 h-9 px-2.5 text-xs font-semibold transition-colors">
              <Globe className="h-4 w-4 text-gray-500" />
              <span className="hidden sm:inline">{lang.toUpperCase()}</span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={() => switchLanguage('en')} className="text-xs cursor-pointer">
                English (Default)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchLanguage('hi')} className="text-xs cursor-pointer">
                हिंदी (Hindi)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchLanguage('bn')} className="text-xs cursor-pointer">
                বাংলা (Bengali)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchLanguage('mr')} className="text-xs cursor-pointer">
                मराठी (Marathi)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchLanguage('ta')} className="text-xs cursor-pointer">
                தமிழ் (Tamil)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchLanguage('te')} className="text-xs cursor-pointer">
                తెలుగు (Telugu)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/80 hover:bg-gray-100 h-9 px-3 text-xs font-semibold transition-colors">
                <div className="w-5 h-5 rounded-full bg-[#24172f] text-white flex items-center justify-center font-bold text-[10px]">
                  {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="max-w-[100px] truncate text-gray-800 font-medium">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'My Account'}
                </span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-xl border border-gray-200">
                <DropdownMenuLabel className="px-3 py-2">
                  <div className="font-bold text-gray-900 text-xs">
                    {user.user_metadata?.full_name || user.email?.split('@')[0] || (user.user_metadata?.user_type === 'worker' ? 'Worker Member' : 'Customer')}
                  </div>
                  <div className="text-[10px] text-gray-500 truncate font-normal">
                    {user.email || 'member@shramnexus.coop'}
                  </div>
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-bold text-[#24172f] bg-[#fbf7ef] px-2 py-0.5 rounded-full border border-[#e6aa3b]/30">
                    <ShieldCheck className="w-3 h-3 text-[#7c5cf0]" />
                    {user.user_metadata?.user_type === 'worker' ? 'Verified Worker' : 'Verified Customer'}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push('/history')}
                  className="text-xs cursor-pointer rounded-lg flex items-center gap-2"
                >
                  <CalendarClock className="w-3.5 h-3.5 text-gray-500" />
                  My Bookings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push('/profile')}
                  className="text-xs cursor-pointer rounded-lg flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-gray-500" />
                  Profile & Addresses
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-xs text-red-600 hover:text-red-700 cursor-pointer rounded-lg flex items-center gap-2"
                  onClick={async () => {
                    localStorage.removeItem('shramnexus-auth');
                    localStorage.removeItem('shramnexus-admin-auth');
                    localStorage.removeItem('sharmnexus-auth');
                    localStorage.removeItem('sharmnexus-admin-auth');
                    sessionStorage.clear();
                    document.cookie = 'admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    await supabase.auth.signOut();
                    window.location.href = '/';
                  }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/auth/login"
                className="text-xs font-bold text-gray-700 hover:text-[#24172f] px-3 py-2 rounded-xl transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/auth/login"
                className="text-xs font-bold bg-[#24172f] hover:bg-[#1a1024] text-white px-3.5 py-2 rounded-xl shadow-xs transition-all hover:shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
