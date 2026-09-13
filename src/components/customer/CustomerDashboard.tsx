'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBookingStore, Booking } from '@/lib/store/bookingStore';
import { useCustomerI18n } from '@/lib/i18n/customerTranslations';
import { HelpSupportSection } from '@/components/common/HelpSupportSection';
import { getCustomerBookings } from '@/app/actions/bookings';
import { createClient } from '@/lib/supabase/client';
import {
  Search,
  Zap,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  MapPin,
  CalendarClock,
  Phone,
  CheckCircle2,
  Users,
  ChevronRight,
  Droplet,
  Hammer,
  Paintbrush,
  Wrench,
  Car,
  Leaf,
  Heart,
  Home,
  Check,
  XCircle,
  AlertTriangle,
  X,
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  droplet: Droplet,
  zap: Zap,
  hammer: Hammer,
  paintbrush: Paintbrush,
  sparkles: Sparkles,
  wrench: Wrench,
  car: Car,
  leaf: Leaf,
  heart: Heart,
  home: Home,
};

export function CustomerDashboard() {
  const router = useRouter();
  const { lang, t, categoriesData, workersData } = useCustomerI18n();
  const { categories, workers, bookings, updateBookingStatus } = useBookingStore();

  const [homeSearch, setHomeSearch] = useState('');
  const [dbBookings, setDbBookings] = useState<Booking[]>([]);
  const [dismissedDeclinedIds, setDismissedDeclinedIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('shramnexus-dismissed-declined-ids') || '[]');
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const handleDismissDeclined = (bookingId: string) => {
    setDismissedDeclinedIds((prev) => {
      const next = Array.from(new Set([...prev, bookingId]));
      try {
        localStorage.setItem('shramnexus-dismissed-declined-ids', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Load bookings from Supabase, poll every 3 seconds, and subscribe to Realtime updates
  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function loadBookings() {
      try {
        const { data } = await getCustomerBookings();
        if (data && data.length > 0 && isMounted) {
          const mapped: Booking[] = data.map((b: any) => ({
            id: b.id,
            customer_id: b.customer_id,
            customer_name: 'Customer',
            customer_phone: '',
            worker_id: b.worker_id || 'unassigned',
            worker: b.worker ? {
              id: b.worker.id,
              full_name: b.worker.full_name,
              phone: b.worker.phone || '',
              society_name: b.worker.society?.name || 'Cooperative Society',
              profile_photo_url: b.worker.profile_photo_url || '',
              profession: b.service?.name || 'Service Professional',
              avg_rating: b.worker.avg_rating || 4.8,
              approx_distance_km: 2.5,
              hourly_rate: 300,
              is_verified: true,
              verification_status: 'verified',
              cooperative_member_id: `MEM-${(b.worker.id || '').slice(0, 4).toUpperCase()}`,
              total_jobs_completed: b.worker.total_jobs_completed || 12,
              skills: [b.service?.name || 'General'],
              badges: ['Verified'],
              availability: 'Immediate (within 45 mins)',
              experience_years: 4,
              rating_count: 15,
            } as any : undefined,
            service_category_id: b.service_category_id || '',
            service_name: b.service?.name || 'Home Service',
            service_icon: b.service?.icon_url || 'Droplet',
            booking_type: b.booking_type || 'scheduled',
            status: b.status || 'requested',
            urgency: 'normal',
            description: b.description || '',
            address: b.address || '',
            city: b.city || 'Kolkata',
            scheduled_at: b.scheduled_at ? new Date(b.scheduled_at).toLocaleString() : 'Scheduled',
            time_slot: 'Scheduled',
            estimated_price: b.estimated_price || 350,
            final_price: b.final_price || b.estimated_price || 350,
            created_at: b.created_at,
          }));

          setDbBookings(mapped);

          // Synchronize each booking status with global store
          mapped.forEach((b) => {
            updateBookingStatus(b.id, b.status as any);
          });
        }
      } catch (err) {
        console.warn('CustomerDashboard fetch bookings error:', err);
      }
    }

    loadBookings();
    const interval = setInterval(loadBookings, 3000);

    // Supabase Realtime channel for instant push updates
    const channel = supabase
      .channel('customer-dashboard-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          loadBookings();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [updateBookingStatus]);

  // Combine DB bookings with store bookings (DB takes precedence)
  const allMergedBookings = [
    ...dbBookings,
    ...bookings.filter((b) => !dbBookings.some((db) => db.id === b.id)),
  ];

  // Check if there is an active ongoing booking
  const activeBooking = allMergedBookings.find(
    (b) => b.status !== 'completed' && b.status !== 'cancelled'
  );

  // Check if the most recent booking was rejected / cancelled
  const latestCancelledBooking = allMergedBookings.find(
    (b) => b.status === 'cancelled' && !dismissedDeclinedIds.includes(b.id)
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeSearch.trim()) {
      router.push(`/services?q=${encodeURIComponent(homeSearch.trim())}`);
    } else {
      router.push('/services');
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    const matched = categories.find((c) =>
      c.name.toLowerCase() === categoryId.toLowerCase() || c.id === categoryId
    ) || categories[0];
    router.push(`/services?q=${encodeURIComponent(matched.name)}`);
  };

  const handleWorkerClick = (w: any) => {
    router.push(`/services?q=${encodeURIComponent(w.skill)}`);
  };

  return (
    <div className="bg-[#fbf7ef] text-[#342d39] min-h-screen flex flex-col font-sans">
      <main className="flex-1 pb-16">
        {/* Cinematic Luxury Hero Banner (Bugatti Style) */}
        <div className="relative h-[82vh] min-h-[520px] w-full overflow-hidden bg-[#24172f] flex items-center justify-center border-b border-[#3d2b48]">
          {/* Background Image with Slow Cinematic Zoom */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[#24172f]/35 z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#24172f]/65 via-[#24172f]/15 to-[#24172f]/85 z-10" />
            <img
              src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=2069"
              className="w-full h-full object-cover animate-bg-zoom opacity-80 brightness-95 contrast-105"
              alt="Craftsman Background"
            />
          </div>

          {/* Centered Elegant Content */}
          <div className="relative z-20 text-center flex flex-col items-center justify-center px-4 w-full pt-6 sm:pt-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#24172f]/80 backdrop-blur-md border border-[#e6aa3b]/30 px-5 py-2 rounded-full text-xs font-semibold text-[#f5dfad] mb-6 shadow-[0_0_15px_rgba(230,170,59,0.2)] animate-fade-up">
              <ShieldCheck className="w-4 h-4 text-[#e6aa3b]" />
              <span>{t?.badge || 'Cooperative-Owned Verified Gig Workforce'}</span>
            </div>

            {/* Script Title */}
            <h1 className="font-script text-[#fbf7ef] text-5xl sm:text-7xl md:text-[100px] leading-tight mb-4 animate-fade-up drop-shadow-2xl">
              What service do you need today?
            </h1>

            {/* Subtitle */}
            <p className="text-[#fbf7ef]/90 text-[10px] sm:text-xs tracking-[0.3em] uppercase font-semibold animate-fade-up mb-8 max-w-2xl leading-relaxed whitespace-pre-line drop-shadow-md">
              {t?.heroSub || 'A story of verified craftsmanship.\nCooperative-Owned Gig Workforce.'}
            </p>

            {/* Minimal Search Bar */}
            <div className="animate-fade-up w-full max-w-xl">
              <form
                onSubmit={handleSearchSubmit}
                className="bg-[#3d2b48]/80 backdrop-blur-md border border-[#e6dcd0]/20 p-1.5 rounded-full flex items-center shadow-2xl transition-all focus-within:border-[#e6aa3b] focus-within:bg-[#3d2b48]"
              >
                <div className="pl-5 text-[#c8bacb]">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={homeSearch}
                  onChange={(e) => setHomeSearch(e.target.value)}
                  placeholder={t?.searchPlaceholder || 'What service do you need today?'}
                  className="w-full bg-transparent text-[#fbf7ef] placeholder-[#c8bacb]/60 text-sm px-4 outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#e6aa3b] text-[#24172f] px-6 sm:px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#f5dfad] transition-colors shrink-0 shadow-md"
                >
                  {t?.bookBtn || 'Book Service'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Active Booking or Declined Alert Banners */}
        {(activeBooking || (latestCancelledBooking && !activeBooking)) && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 mb-6 relative z-20">
            {/* Active Request Banner - Shown when user has an active ongoing booking */}
            {activeBooking && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e6dcd0] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#e2eee4] text-[#8ba58b] flex items-center justify-center font-bold shrink-0">
                    <CalendarClock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#d96f4d]">
                        {t?.activeBadge || 'Active Request'}
                      </span>
                      <span className="text-[10px] font-bold bg-[#f5dfad] text-[#24172f] px-2 py-0.5 rounded-full border border-[#e6aa3b]/30">
                        {activeBooking.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#24172f] mt-0.5">
                      {activeBooking.service_name} • Booking #{activeBooking.id.slice(0, 8)}
                    </h4>
                    <p className="text-xs text-[#776e79]">
                      {activeBooking.worker
                        ? `Assigned to ${activeBooking.worker.full_name} (${activeBooking.worker.society_name || 'Labour Cooperative Society'})`
                        : 'Assigning nearest verified cooperative worker...'}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/track/${activeBooking.id}`}
                  className="bg-[#24172f] hover:bg-[#3d2b48] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs shrink-0 self-start sm:self-auto transition-transform hover:scale-[1.02] flex items-center gap-1.5"
                >
                  <span>{t?.activeTrack || 'Track Live Status →'}</span>
                </Link>
              </div>
            )}

            {/* Dynamic Rejection / Declined Alert Banner - Shown immediately when tradesperson declines */}
            {latestCancelledBooking && !activeBooking && (
              <div className="bg-gradient-to-r from-[#fff5f5] via-[#fef2f2] to-[#fff5f5] rounded-2xl p-4 sm:p-5 border-2 border-red-200/90 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold shrink-0 border border-red-200">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-red-600">
                        Request Declined by Tradesperson
                      </span>
                      <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
                        UNAVAILABLE / CANCELLED
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#24172f] mt-0.5">
                      {latestCancelledBooking.service_name} • Booking #{latestCancelledBooking.id.slice(0, 8)}
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5 max-w-xl">
                      The requested cooperative artisan was unavailable and declined this booking. <strong>No payment has been deducted.</strong> You can request another verified artisan immediately.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                  <Link
                    href="/services"
                    className="bg-[#d96f4d] hover:bg-[#b85435] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 hover:scale-[1.02]"
                  >
                    <span>Find Another Worker</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/history"
                    className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors"
                  >
                    History
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDismissDeclined(latestCancelledBooking.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 10 Categories Grid & Recommended Workers Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8 space-y-12 relative z-10">
          {/* Categories Section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#d96f4d] block mb-1">
                  Cooperative Marketplace
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#24172f] font-serif">
                  {t?.tradesTitle || '10 Verified Trades'}
                </h2>
                <p className="text-xs text-[#776e79] mt-1">
                  Book verified cooperative artisans at standardized fair wages
                </p>
              </div>
              <Link
                href="/services"
                className="text-xs font-bold text-[#d96f4d] hover:text-[#b85435] transition-colors flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#f0e7d9]/70 hover:bg-[#f0e7d9] border border-[#d96f4d]/25 self-start sm:self-auto shadow-2xs hover:shadow-xs"
              >
                <span>View All Services</span>
                <span>↗</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {categoriesData.map((c) => {
                const localizedName = c.names[lang] || c.names.en;
                const englishName = c.names.en;
                const IconComp = ICON_MAP[c.icon] || Sparkles;

                return (
                  <div
                    key={c.id}
                    onClick={() => handleCategoryClick(c.id)}
                    className="group cursor-pointer bg-white p-4 sm:p-5 rounded-2xl border border-[#e6dcd0] hover:border-[#d96f4d] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col items-center justify-center relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-[#fbf7ef] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-12 h-12 rounded-xl bg-[#f0e7d9] text-[#24172f] group-hover:bg-[#d96f4d] group-hover:text-white flex items-center justify-center font-bold mb-3 transition-colors duration-300 z-10">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold text-[#24172f] z-10 text-center">{localizedName}</span>
                    <span className="text-[10px] text-[#776e79] z-10 mb-1">
                      {lang === 'en' ? '' : englishName}
                    </span>
                    <span className="text-xs font-bold text-[#d96f4d] bg-[#f5dfad]/30 px-2 py-1 rounded-md z-10 mt-1 border border-[#d96f4d]/20">
                      ₹{c.price}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Workers Preview */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e6dcd0] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#d96f4d]">
                  {t?.recomAlgo || 'SIH 26089 Algorithm'}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#24172f] font-serif">
                  {t?.recommendedTitle || 'Recommended Verified Craftsmen'}
                </h3>
              </div>
              <Link
                href="/services"
                className="text-xs font-bold text-[#d96f4d] hover:underline"
              >
                {t?.viewAll || 'View All ↗'}
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {workersData.map((w, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-[#e6dcd0] bg-white shadow-2xs space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={w.img} alt={w.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <div className="flex items-center gap-1">
                        <strong className="text-sm text-[#24172f]">{w.name}</strong>
                        <span className="text-[10px] text-[#8ba58b] bg-[#e2eee4] font-bold px-1.5 py-0.2 rounded">
                          {t?.verifiedBadge || '✓ Verified'}
                        </span>
                      </div>
                      <span className="text-xs text-[#776e79]">
                        {w.skill} • {w.exp} yrs exp
                      </span>
                      <span className="text-[11px] text-[#d96f4d] block font-medium">{w.society}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-[#e6dcd0]">
                    <span className="font-bold text-[#24172f]">Match: {w.match}%</span>
                    <button
                      onClick={() => handleWorkerClick(w)}
                      className="bg-[#24172f] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-xs hover:bg-[#3d2b48] transition-colors"
                    >
                      {t?.bookNowBtn || 'Book Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* HELP & SUPPORT SECTION */}
      <HelpSupportSection />

      {/* FOOTER */}
      <footer className="bg-[#24172f] border-t border-[#3d2b48] py-6 text-center text-xs text-[#c8bacb]">
        <div className="flex items-center justify-center gap-4 mb-2">
          <a href="#support" className="text-[#e6aa3b] hover:underline font-semibold">
            Need Help? Contact Support ↗
          </a>
        </div>
        <span>{t?.footerText || 'ShramNexus © 2026. Built for SIH Problem Statement 26089 (Cooperative Gig Services Platform).'}</span>
      </footer>
    </div>
  );
}
