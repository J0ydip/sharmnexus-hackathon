'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useBookingStore } from '@/lib/store/bookingStore';

export type UserRole = 'customer' | 'worker' | 'cooperative' | 'admin' | 'guest';

export interface PageMetadata {
  title: string;
  summary: string;
  suggestedPrompts: string[];
}

const ROUTE_INFO_MAP: Record<string, PageMetadata> = {
  '/': {
    title: 'Marketplace Home',
    summary: 'Platform overview, 10 verified trades, cooperative fairness, and fast booking.',
    suggestedPrompts: [
      'What is ShramNexus?',
      'How does the 85/10/5 split work?',
      'How do I book an electrician?',
      'What is Emergency SOS?',
    ],
  },
  '/services': {
    title: 'Services Directory',
    summary: 'Browse verified trades: Plumber, Electrician, Carpenter, Painter, Cleaner, Technician, Driver, Gardener.',
    suggestedPrompts: [
      'Show me standard service rates',
      'How do I select my location?',
      'What is the emergency multiplier?',
      'Who verifies these artisans?',
    ],
  },
  '/emergency': {
    title: 'Priority SOS Emergency',
    summary: 'Urgent priority dispatch for electrical hazards, short circuits, burst pipes, and critical repairs.',
    suggestedPrompts: [
      'How fast does an emergency worker arrive?',
      'What is covered in emergency repairs?',
      'Is there an extra emergency charge?',
      'Call emergency helpline',
    ],
  },
  '/track': {
    title: 'Live Service Tracking',
    summary: 'Real-time worker GPS tracking, ETA status, and the 4-digit completion OTP.',
    suggestedPrompts: [
      'Where do I find my completion OTP?',
      'When does the worker arrive?',
      'What happens if I cancel now?',
      'How does the OTP release payment?',
    ],
  },
  '/history': {
    title: 'Bookings & Orders',
    summary: 'All previous and ongoing bookings, digital invoices, and completion status.',
    suggestedPrompts: [
      'Where can I see my receipt?',
      'How do I report a service issue?',
      'Can I re-book the same worker?',
      'View active job OTP',
    ],
  },
  '/profile': {
    title: 'Customer Profile',
    summary: 'Personal details, address manager, and preferred cooperative society.',
    suggestedPrompts: [
      'How do I update my phone number?',
      'How do I add a new address?',
      'Can I switch my role to worker?',
    ],
  },
  '/worker-dashboard': {
    title: 'Artisan Command Center',
    summary: 'Duty status (Online/Offline), incoming job broadcast, and performance highlights.',
    suggestedPrompts: [
      'How do I go online for jobs?',
      'How does the matching engine pick me?',
      'Where do I see today’s earnings?',
      'How do I view my digital ID card?',
    ],
  },
  '/jobs': {
    title: 'Artisan Jobs & Handshake',
    summary: 'Review incoming requests, accept jobs, navigate to client, and enter 4-digit OTP upon completion.',
    suggestedPrompts: [
      'How do I enter the customer OTP?',
      'What happens after I enter the OTP?',
      'How do I navigate to the customer address?',
      'Can I reject a job if unavailable?',
    ],
  },
  '/earnings': {
    title: 'Worker Earnings Passbook',
    summary: 'Transparent ledger of 85% direct payout, 10% welfare allocation, and 5% platform fee.',
    suggestedPrompts: [
      'Explain the 85/10/5 revenue split',
      'When is money sent to my bank account?',
      'What is the 10% welfare fund used for?',
      'Download my monthly passbook',
    ],
  },
  '/worker-profile': {
    title: 'Artisan Digital ID & Badges',
    summary: 'Desk-verified credentials, QR code for customer inspection, and cooperative society affiliation.',
    suggestedPrompts: [
      'How do I get my skills verified?',
      'How can customers scan my QR code?',
      'How do I add another trade skill?',
    ],
  },
  '/cooperative': {
    title: 'Cooperative Society Desk',
    summary: 'Desk verification of new artisans, tool bank inventory, district dispatch clusters, and welfare fund.',
    suggestedPrompts: [
      'How do I verify a new worker application?',
      'How does the tool bank inventory work?',
      'What is the current welfare fund balance?',
      'How do democratic resolutions work?',
    ],
  },
  '/admin': {
    title: 'Federation Administration',
    summary: 'Statutory compliance, audit logs, dispute arbitration, and incoming support tickets.',
    suggestedPrompts: [
      'Where are statutory audit logs stored?',
      'How do I resolve a customer support ticket?',
      'View platform commission analytics',
    ],
  },
  '/auth/login': {
    title: 'Sign In',
    summary: 'Single portal sign-in for Customers, Workers, Cooperatives, and Administrators.',
    suggestedPrompts: [
      'How do I log in with demo accounts?',
      'Where do I register as a worker?',
      'Forgot my password',
    ],
  },
  '/auth/worker-register': {
    title: 'Worker Registration',
    summary: 'Sign up as an artisan, upload trade proof, and request cooperative verification.',
    suggestedPrompts: [
      'What documents do I need to register?',
      'How long does cooperative desk verification take?',
      'Which trades can I register for?',
    ],
  },
};

export function useAppContext() {
  const pathname = usePathname() || '/';
  const bookings = useBookingStore((state) => state.bookings);
  const activeBookingsCount = bookings.filter(
    (b) => b.status !== 'completed' && b.status !== 'cancelled'
  ).length;

  const [role, setRole] = useState<UserRole>('guest');
  const [userName, setUserName] = useState<string>('Guest');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    try {
      const local =
        localStorage.getItem('shramnexus-auth') ||
        localStorage.getItem('sharmnexus-auth');

      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.isLoggedIn) {
          const rawRole = (parsed.role || '').toLowerCase();
          if (rawRole.includes('worker')) setRole('worker');
          else if (rawRole.includes('coop')) setRole('cooperative');
          else if (rawRole.includes('admin')) setRole('admin');
          else setRole('customer');

          setUserName(parsed.name || 'Valued User');
          setUserEmail(parsed.email || '');
          return;
        }
      }

      // Infer role from route if not logged in
      if (
        pathname.startsWith('/worker-dashboard') ||
        pathname === '/jobs' ||
        pathname === '/earnings' ||
        pathname === '/worker-profile'
      ) {
        setRole('worker');
      } else if (pathname.startsWith('/cooperative')) {
        setRole('cooperative');
      } else if (pathname.startsWith('/admin')) {
        setRole('admin');
      } else {
        setRole('guest');
      }
    } catch (e) {
      setRole('guest');
    }
  }, [pathname]);

  // Determine closest route metadata
  let pageMetadata: PageMetadata = {
    title: 'ShramNexus Marketplace',
    summary: 'Decentralized cooperative platform for household trades and community services.',
    suggestedPrompts: [
      'What is ShramNexus?',
      'How do I book a verified worker?',
      'How does the 85% worker payout work?',
      'Emergency SOS assistance',
    ],
  };

  if (ROUTE_INFO_MAP[pathname]) {
    pageMetadata = ROUTE_INFO_MAP[pathname];
  } else {
    // Prefix match
    const matchingKey = Object.keys(ROUTE_INFO_MAP).find(
      (key) => key !== '/' && pathname.startsWith(key)
    );
    if (matchingKey) {
      pageMetadata = ROUTE_INFO_MAP[matchingKey];
    }
  }

  return {
    pathname,
    role,
    userName,
    userEmail,
    pageTitle: pageMetadata.title,
    pageSummary: pageMetadata.summary,
    suggestedPrompts: pageMetadata.suggestedPrompts,
    activeBookingsCount,
  };
}
