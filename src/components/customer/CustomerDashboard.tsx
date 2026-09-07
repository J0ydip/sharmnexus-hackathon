'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store/bookingStore';
import { useCustomerI18n } from '@/lib/i18n/customerTranslations';
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
  const { categories, workers, bookings, selectServiceForBooking, selectWorkerForBooking, setDraft } = useBookingStore();

  const [homeSearch, setHomeSearch] = useState('');

  // Check if there is an active booking
  const activeBooking = bookings.find((b) => b.status !== 'completed' && b.status !== 'cancelled');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeSearch.trim()) {
      const matched = categories.find((c) =>
        c.name.toLowerCase().includes(homeSearch.toLowerCase())
      ) || categories[0];
      if (matched) {
        selectServiceForBooking(matched);
        setDraft({ description: homeSearch });
        router.push(`/booking/${matched.id}`);
      } else {
        router.push(`/services?q=${encodeURIComponent(homeSearch)}`);
      }
    } else {
      router.push('/services');
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    const matched = categories.find((c) =>
      c.name.toLowerCase() === categoryId.toLowerCase() || c.id === categoryId
    ) || categories[0];
    if (matched) {
      selectServiceForBooking(matched);
      router.push(`/booking/${matched.id}`);
    } else {
      router.push(`/booking/${categoryId.toLowerCase()}`);
    }
  };

  const handleWorkerClick = (w: any) => {
    const matchedCat = categories.find((c) =>
      c.name.toLowerCase() === w.skill.toLowerCase()
    ) || categories[0];
    selectServiceForBooking(matchedCat);
    router.push(`/booking/${matchedCat.id}`);
  };

  return (
    <div className="bg-[#fbf7ef] text-[#342d39] min-h-screen flex flex-col font-sans">
      <main className="flex-1 pb-16">
        {/* Cinematic Luxury Hero Banner (Bugatti Style) */}
        <div className="relative h-[82vh] min-h-[520px] w-full overflow-hidden bg-[#24172f] flex items-center justify-center border-b border-[#3d2b48]">
          {/* Background Image with Slow Cinematic Zoom */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[#24172f]/60 z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#24172f]/80 via-transparent to-[#24172f] z-10" />
            <img
              src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=2069"
              className="w-full h-full object-cover animate-bg-zoom opacity-40 grayscale"
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
            <p className="text-[#c8bacb] text-[10px] sm:text-xs tracking-[0.3em] uppercase font-semibold animate-fade-up mb-8 max-w-2xl leading-relaxed whitespace-pre-line">
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

        {/* 10 Categories Grid & Recommended Workers */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-10 space-y-8 relative z-20">
          {/* Active Request Banner */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e6dcd0] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                    {t?.activeStatus || 'Worker Assigned'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#24172f] mt-0.5">
                  {activeBooking
                    ? `${activeBooking.service_name} • Booking ${activeBooking.id}`
                    : t?.activeTitle || 'Plumber • Booking SN-2026-8941'}
                </h4>
                <p className="text-xs text-[#776e79]">
                  {activeBooking?.worker
                    ? `Assigned to ${activeBooking.worker.full_name} (${activeBooking.worker.society_name || 'Labour Cooperative Society'})`
                    : t?.activeDesc || 'Assigned to Rajesh Kumar (Labour Cooperative Society)'}
                </p>
              </div>
            </div>
            <Link
              href={activeBooking ? `/track/${activeBooking.id}` : '/track'}
              className="bg-[#24172f] hover:bg-[#3d2b48] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs shrink-0 self-start sm:self-auto transition-transform hover:scale-[1.02] flex items-center gap-1.5"
            >
              <span>{t?.activeTrack || 'Track Live Status →'}</span>
            </Link>
          </div>

          {/* Categories Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-[#24172f] font-serif">
                {t?.tradesTitle || '10 Verified Trades'}
              </h2>
              <Link href="/services" className="text-xs font-bold text-[#d96f4d] hover:underline">
                View All Services ↗
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {categoriesData.map((c) => {
                const localizedName = c.names[lang] || c.names.en;
                const englishName = c.names.en;
                const IconComp = ICON_MAP[c.icon] || Sparkles;

                return (
                  <div
                    key={c.id}
                    onClick={() => handleCategoryClick(c.id)}
                    className="group cursor-pointer bg-white p-4 rounded-2xl border border-[#e6dcd0] hover:border-[#d96f4d] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col items-center justify-center relative overflow-hidden"
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

      {/* FOOTER */}
      <footer className="bg-[#24172f] border-t border-[#3d2b48] py-6 text-center text-xs text-[#c8bacb]">
        {t?.footerText || 'ShramNexus © 2026. Built for SIH Problem Statement 26089 (Cooperative Gig Services Platform).'}
      </footer>
    </div>
  );
}
