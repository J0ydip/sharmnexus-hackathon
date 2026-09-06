# 👷 ShramNexus Worker Portal — Frontend Architecture & Developer Guide

> **Smart India Hackathon (SIH 2026) — Problem Statement 26089**  
> A dedicated, mobile-first Progressive Web App (PWA) for skilled cooperative gig workers (electricians, plumbers, carpenters, cleaners, caregivers, etc.) to manage job dispatches, live duty availability, on-site service lifecycles, and fair cooperative earnings.

---

## 📌 1. Quick Overview for Frontend Developers

The Worker Portal is designed as an app-like mobile experience with:
- **Duty Toggle (Online/Offline)**: Instantly marks the worker as available or unavailable in the matching algorithm.
- **Job Dispatch Pipeline**: Receive incoming requests, view customer address and job notes, accept/decline, and mark progress.
- **Fair-Share Financials**: Complete visibility into the **85% Worker Net / 10% Platform / 5% Cooperative Welfare Pool** split.
- **Digital Worker Credential**: Verified digital ID card displaying cooperative society affiliation, rating, and verified skills.

---

## 🚀 2. Getting Started & Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### How to Access the Worker Section:
- Direct Route: [`http://localhost:3000/worker-dashboard`](http://localhost:3000/worker-dashboard)
- If not logged in, you will be redirected to `/auth/login` or you can register a new worker account at `/auth/worker-register`.
- During login, accounts with metadata `user_type: "worker"` are automatically redirected to `/worker-dashboard`.

---

## 🗺️ 3. Route Map & File Structure

All worker pages are located under the Next.js `(worker)` route group in `src/app/(worker)/`:

```
src/app/(worker)/
├── layout.tsx                # Master worker layout (Top header + Bottom PWA nav bar)
├── worker-dashboard/
│   └── page.tsx              # Home dashboard: Duty toggle, earnings teaser, pending request alert
├── jobs/
│   └── page.tsx              # Job management: Incoming requests, active jobs, accept/decline/complete
├── earnings/
│   └── page.tsx              # Earnings breakdown: 85/10/5 split, net take-home, completed receipts
└── worker-profile/
    └── page.tsx              # Digital ID Card, verification badges, trade/profession switcher
```

### Supporting Routes:
- **Worker Registration Wizard**: `src/app/auth/worker-register/page.tsx`  
  *3-step registration wizard for new workers (Personal info → Profession & Hourly Rate → Aadhaar & Area).*

---

## 🧱 4. Layout Architecture (`src/app/(worker)/layout.tsx`)

The worker layout wraps all worker routes and provides:

```tsx
WorkerLayout (src/app/(worker)/layout.tsx)
├── Server Auth Guard: Checks user session and user_metadata.user_type === 'worker'
├── Sticky Top Header:
│   ├── Platform title ("ShramNexus Worker")
│   ├── User avatar circle with first initial
│   └── Logout button (<LogOutButton />)
├── Main Content Container:
│   └── <main className="flex-1 overflow-y-auto pb-24"> {children} </main>
└── Fixed Bottom Navigation Bar:
    ├── Home (/worker-dashboard)
    ├── Jobs (/jobs)
    ├── Earnings (/earnings)
    └── ID Card (/worker-profile)
```

> **Zero Navigation Collision**: The customer layout wrapper (`src/components/common/NavigationWrapper.tsx`) automatically suppresses the customer navbar and bottom nav when navigating to `/worker*`, `/jobs`, or `/earnings`.

---

## 🗄️ 5. Database Schema & Data Models

### 1. `workers` Table
```typescript
export interface Worker {
  id: string;                   // UUID matching auth.users.id
  full_name: string;            // Worker's full name
  phone: string;                // Contact mobile number
  avatar_url?: string;          // Profile picture URL
  is_available: boolean;        // Duty switch (true = Online, false = Offline)
  is_verified: boolean;         // Verified by cooperative society
  avg_rating: number;           // e.g., 4.8
  total_jobs_completed: number; // Incremented on completion
  hourly_rate: number;          // Default rate (e.g. ₹350)
  cooperative_id?: string;      // FK to cooperative_societies
  latitude?: number;            // Current coordinates for matching
  longitude?: number;
  created_at: string;
}
```

### 2. `bookings` Table (Jobs assigned to Worker)
```typescript
export type BookingStatus = 
  | 'requested'    // Customer created booking; waiting for worker acceptance
  | 'confirmed'    // Worker accepted; scheduled for service
  | 'in_progress'  // Worker arrived on site and started work
  | 'completed'    // Work completed; payment released
  | 'cancelled';   // Cancelled or declined

export interface Booking {
  id: string;
  customer_id: string;
  worker_id: string;
  service_category_id: string;
  status: BookingStatus;
  total_amount: number;         // Gross bill amount (e.g., ₹500)
  scheduled_at: string;         // ISO timestamp
  address: string;              // Customer location
  description?: string;         // Problem notes from customer
  customers?: {
    full_name: string;
    phone: string;
  };
  service_categories?: {
    name: string;
  };
  created_at: string;
}
```

### 3. `worker_skills` Table
```typescript
export interface WorkerSkill {
  id: string;
  worker_id: string;            // FK to workers.id
  service_category_id: string;  // FK to service_categories.id
  years_experience: number;
  is_verified: boolean;
}
```

---

## ⚡ 6. Server Actions & Backend APIs Ready for Use

Do **not** write raw database mutations directly in UI components. Use the pre-built server actions:

### A. Update Job Status & Complete Services
**File**: `src/app/actions/worker-jobs.ts`

```typescript
import { updateBookingStatus } from '@/app/actions/worker-jobs';

// 1. Accept incoming booking:
await updateBookingStatus(jobId, 'confirmed');

// 2. Start service at customer location:
await updateBookingStatus(jobId, 'in_progress');

// 3. Mark completed (automatically increments worker.total_jobs_completed and triggers payouts):
await updateBookingStatus(jobId, 'completed');

// 4. Decline/cancel:
await updateBookingStatus(jobId, 'cancelled');
```

### B. Toggle Online / Offline Availability
**File**: `src/components/OnlineToggle.tsx`

```tsx
import OnlineToggle from '@/components/OnlineToggle';

// Renders the duty switch and persists to workers.is_available:
<OnlineToggle workerId={user.id} initialStatus={worker.is_available} />
```

### C. Update Primary Trade / Profession
**File**: `src/components/CategorySelector.tsx`

```tsx
import CategorySelector from '@/components/CategorySelector';

<CategorySelector workerId={worker.id} initialCategoryId={primarySkillId} />
```

---

## 🎨 7. Suggested Components to Build (`src/components/worker/`)

Your team can build reusable UI components under `src/components/worker/`:

```
src/components/worker/
├── JobCard.tsx                 # Standardized card displaying customer, time, price, status badge
├── JobStatusBadge.tsx          # Pill badge with matching colors for each status
├── JobActionButtons.tsx        # Contextual buttons (Accept/Decline vs Start Work vs Complete)
├── JobDetailModal.tsx          # Modal displaying full customer problem description & photos
├── EarningsSplitBar.tsx        # 85% Net Worker / 10% Platform / 5% Cooperative Welfare visual bar
├── DigitalIDCard.tsx           # Official worker credential with badge, QR code, and verify check
├── DirectCallButton.tsx        # <a href="tel:..."> button to call customer directly
└── LiveDirectionsMap.tsx       # Leaflet mini-map opening Google Maps directions to customer address
```

### Example: Recommended `JobStatusBadge.tsx`
```tsx
import React from 'react';

const statusStyles: Record<string, { label: string; className: string }> = {
  requested: { label: 'New Request', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  in_progress: { label: 'In Progress', className: 'bg-purple-100 text-purple-800 border-purple-200 animate-pulse' },
  completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  cancelled: { label: 'Declined', className: 'bg-red-100 text-red-800 border-red-200' },
};

export function JobStatusBadge({ status }: { status: string }) {
  const config = statusStyles[status] || { label: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };
  return (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${config.className}`}>
      {config.label}
    </span>
  );
}
```

---

## 💰 8. Cooperative Fair-Share Formula

When displaying earnings on any worker page, use the official SIH 26089 formula:

- **Gross Total** = Sum of completed booking amounts
- **Worker Net (85%)** = `Math.round(grossEarnings * 0.85)`
- **Platform Fee (10%)** = `Math.round(grossEarnings * 0.10)`
- **Cooperative Welfare Pool (5%)** = `Math.round(grossEarnings * 0.05)`

```typescript
const grossEarnings = completedJobs.reduce((acc, job) => acc + (job.total_amount || 350), 0);
const netEarnings = Math.round(grossEarnings * 0.85);
const welfareContribution = Math.round(grossEarnings * 0.05);
const platformFee = grossEarnings - netEarnings - welfareContribution;
```

---

## 🔔 9. Real-time Incoming Job Subscriptions (Supabase)

To listen for incoming booking dispatches in real-time on client components:

```tsx
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function useRealtimeWorkerJobs(workerId: string) {
  const [jobs, setJobs] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    supabase
      .from('bookings')
      .select('*, customers(full_name, phone)')
      .eq('worker_id', workerId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setJobs(data);
      });

    // Realtime channel
    const channel = supabase
      .channel(`worker-jobs-${workerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `worker_id=eq.${workerId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            toast.success('🔔 New Job Request received!');
            setJobs((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setJobs((prev) => prev.map((j) => (j.id === payload.new.id ? payload.new : j)));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workerId, supabase]);

  return jobs;
}
```

---

## 📱 10. Design & Styling Conventions

1. **Mobile First**:
   - Wrap views inside `max-w-md sm:max-w-2xl mx-auto px-4`.
   - Always include `pb-24` or `pb-28` on the bottom of pages so the fixed bottom bar never hides primary buttons or total amounts.
2. **Color Palette**:
   - **Primary Action & Net Earnings**: Emerald (`bg-emerald-600`, `text-emerald-700`, `from-emerald-600 to-teal-700`).
   - **Worker Theme / Badges**: Blue (`bg-blue-600`, `text-blue-700`) for ID headers and verified checks.
   - **Backgrounds**: Soft light gray (`bg-gray-50/70`) with white card surfaces (`bg-white border border-gray-100 shadow-sm rounded-2xl`).
3. **Accessibility**:
   - Touch targets must be at least `44px` high (`py-3` on mobile buttons).
   - High contrast text for outdoor sunlight viewing.

---

## 📋 11. Teammate Feature Checklist

- [x] Worker authentication & 3-step registration wizard
- [x] Worker dashboard with duty toggle & metrics
- [x] Incoming request alerts & accept/decline actions
- [x] Job lifecycle progression (`requested` → `confirmed` → `in_progress` → `completed`)
- [x] 85/10/5 fair share earnings ledger
- [x] Digital ID card with verified trade tags
- [ ] **Next**: Add Customer address map / Google Maps directions link on active jobs
- [ ] **Next**: Add customer phone quick-call button (`tel:${job.customers?.phone}`)
- [ ] **Next**: Add job completion OTP / confirmation check
- [ ] **Next**: Add downloadable/shareable Digital ID Card (PNG export)
