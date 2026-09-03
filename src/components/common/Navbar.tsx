'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, User, Globe } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function Navbar() {
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    }
    getUser();
  }, []);

  const isAdmin = pathname.startsWith('/admin');
  const isWorker = pathname.startsWith('/worker');
  
  let portalName = 'Customer Portal';
  let homeLink = '/';
  if (isAdmin) {
    portalName = 'Admin Dashboard';
    homeLink = '/admin';
  } else if (isWorker) {
    portalName = 'Worker App';
    homeLink = '/worker';
  }

  const switchLanguage = (lang: string) => {
    // Setting the googtrans cookie directly is the most reliable way to trigger Google Translate
    document.cookie = `googtrans=/en/${lang}; path=/`;
    document.cookie = `googtrans=/en/${lang}; path=/; domain=${window.location.hostname}`;
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-10 w-10">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-4 py-4">
                <Link href={homeLink} className="text-lg font-semibold">
                  SahayaK
                </Link>
                <Link href="/" className="text-sm">Customer Portal</Link>
                <Link href="/worker" className="text-sm">Worker Portal</Link>
              </nav>
            </SheetContent>
          </Sheet>
          
          <Link href={homeLink} className="flex items-center space-x-2">
            <span className="text-xl font-bold text-emerald-600 hidden sm:inline-block">SahayaK</span>
          </Link>
          <span className="text-sm text-muted-foreground ml-2 hidden sm:inline-block">| {portalName}</span>
        </div>

        <div className="flex items-center gap-4">
          <div id="google_translate_element" className="absolute opacity-0 pointer-events-none -z-10"></div>
          
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
              <Globe className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => switchLanguage('en')}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchLanguage('hi')}>
                हिंदी (Hindi)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className={buttonVariants({ variant: "outline", size: "sm" })}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.location.href = '/profile'} className="cursor-pointer">
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 cursor-pointer"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.reload();
                  }}
                >
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login" className={buttonVariants({ size: "sm" })}>
              Log In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
