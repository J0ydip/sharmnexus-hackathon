'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store/bookingStore';
import { ServiceCard } from '@/components/customer/ServiceCard';
import { WorkerCard } from '@/components/customer/WorkerCard';
import { WorkerProfileModal } from '@/components/customer/WorkerProfileModal';
import { BookingStatusBadge } from '@/components/customer/BookingStatusBadge';
import { WorkerProfile } from '@/lib/data/mockData';
import { Button, buttonVariants } from '@/components/ui/button';
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
} from 'lucide-react';

export function CustomerDashboard() {
  const router = useRouter();
  const { categories, workers, bookings, selectServiceForBooking, selectWorkerForBooking, setDraft } =
    useBookingStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkerForModal, setSelectedWorkerForModal] = useState<WorkerProfile | null>(null);

  // Active / Upcoming booking preview
  const activeBooking = bookings.find((b) => b.status !== 'completed' && b.status !== 'cancelled');

  // Filter categories by search
  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.name_hi && c.name_hi.includes(searchQuery))
  );

  // Featured top recommended workers (e.g. Rajesh Kumar, Priya Das, Dr. Anita Rao)
  const topWorkers = workers.slice(0, 3);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Find matching category or go to services
      const matched = categories.find((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matched) {
        selectServiceForBooking(matched);
        setDraft({ description: searchQuery });
        router.push(`/booking/${matched.id}`);
      } else {
        router.push(`/services?q=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  const handleBookWorker = (worker: WorkerProfile) => {
    // Find matching category
    const cat = categories.find((c) => c.name.toLowerCase() === worker.primary_skill.toLowerCase()) || categories[0];
    selectServiceForBooking(cat);
    selectWorkerForBooking(worker);
    setDraft({
      selectedWorkerId: worker.id,
      selectedWorker: worker,
    });
    router.push(`/booking/${cat.id}?step=confirm&worker=${worker.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50/70 pb-20 sm:pb-12">
      {/* Top Welcome & Notification Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white pt-6 pb-12 sm:pb-16 px-4 sm:px-6 shadow-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-emerald-100 mb-2.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Cooperative-Owned Verified Workforce</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                What service do you need today?
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
                Find trusted, verified cooperative workers near you with transparent fair rates and guaranteed quality.
              </p>
            </div>

            {/* Quick Location Badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-2 rounded-2xl flex items-center gap-2.5 shrink-0 text-xs text-white">
              <MapPin className="w-4 h-4 text-emerald-300 shrink-0" />
              <div>
                <span className="text-[10px] text-emerald-200 block uppercase font-bold">Service Area</span>
                <span className="font-semibold">Patna Central & Kankarbagh</span>
              </div>
            </div>
          </div>

          {/* Prominent Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-6 sm:mt-8 bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl flex items-center gap-2 border border-gray-100"
          >
            <div className="pl-3 text-gray-400">
              <Search className="w-5 h-5 text-emerald-600" />
            </div>
            <input
              type="text"
              placeholder="Try searching “plumber for kitchen leak” or “electrician for fan”..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm text-gray-800 placeholder-gray-400 bg-transparent border-none outline-hidden focus:ring-0 px-2"
            />
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 sm:px-6 h-10 rounded-xl shadow-xs shrink-0"
            >
              Search
            </Button>
          </form>

          {/* Quick Suggestion Chips */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 text-xs text-emerald-100 scrollbar-none">
            <span className="text-[11px] opacity-80 shrink-0 font-medium">Popular:</span>
            {['Kitchen Pipe Leak', 'AC Service', 'Ceiling Fan Repair', 'Deep Cleaning', 'Door Lock Fix'].map(
              (tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    const cat = categories.find((c) =>
                      tag.toLowerCase().includes(c.name.toLowerCase())
                    ) || categories[0];
                    selectServiceForBooking(cat);
                    setDraft({ description: tag });
                    router.push(`/booking/${cat.id}`);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors shrink-0"
                >
                  {tag}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 -mt-6 space-y-8">
        {/* Active Booking Card (if customer has an active booking) */}
        {activeBooking && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200/90 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in-50 duration-300">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CalendarClock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Active Service Request
                  </span>
                  <BookingStatusBadge status={activeBooking.status} size="sm" />
                </div>
                <h4 className="text-base font-bold text-gray-900 mt-0.5">
                  {activeBooking.service_name} • {activeBooking.id}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                  Assigned to <strong className="text-gray-800">{activeBooking.worker?.full_name || 'Rajesh Kumar'}</strong> ({activeBooking.worker?.society_name || 'Patna District Labour Society'})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:shrink-0">
              <Link
                href={`/track/${activeBooking.id}`}
                className={buttonVariants({
                  className:
                    'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-xs',
                })}
              >
                Track Worker & Status
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Emergency SOS Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-2xl p-5 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-yellow-300 fill-current animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ⚡ Emergency SOS
                </span>
                <span className="text-xs text-red-100 font-medium">15–25 min dispatch</span>
              </div>
              <h3 className="text-lg font-extrabold text-white mt-0.5">
                Need urgent assistance right now?
              </h3>
              <p className="text-xs text-red-100 mt-0.5 max-w-lg">
                Burst pipe, electrical outage, or security lock failure? Immediate priority dispatch for local cooperative workers.
              </p>
            </div>
          </div>

          <Link
            href="/emergency"
            className="bg-white text-red-700 hover:bg-red-50 font-bold text-xs h-10 px-5 rounded-xl shadow-md flex items-center justify-center shrink-0 transition-transform hover:scale-105"
          >
            Instant Emergency Booking
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>

        {/* Service Categories Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Explore Verified Services
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                10 cooperative-backed trades with certified standards & transparent pricing
              </p>
            </div>
            <Link
              href="/services"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
            >
              <span>View All 10 Services</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredCategories.map((category) => (
              <ServiceCard
                key={category.id}
                category={category}
                compact={true}
                onSelect={(cat) => selectServiceForBooking(cat)}
              />
            ))}
          </div>
        </section>

        {/* Recommended Verified Workers */}
        <section className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Fair Matching Network
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Nearby Verified Cooperative Workers
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Allocated through registered Labour Cooperative Societies with balanced workloads
              </p>
            </div>

            <Link
              href="/services"
              className="text-xs font-semibold text-gray-600 hover:text-emerald-700 hidden sm:flex items-center gap-1"
            >
              <span>See more</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topWorkers.map((worker) => (
              <WorkerCard
                key={worker.id}
                worker={worker}
                onViewProfile={(w) => setSelectedWorkerForModal(w)}
                onBookNow={(w) => handleBookWorker(w)}
              />
            ))}
          </div>
        </section>

        {/* Cooperative Advantage & Welfare Strip */}
        <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 rounded-2xl p-5 sm:p-6 border border-emerald-200/80">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">100% Verified Identity</h4>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                  Every worker is verified by state cooperative federations with skills and background certification.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Cooperative-Owned Model</h4>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                  Not a middleman app. 90%+ of fees go directly to workers, funding health insurance and pensions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Transparent Fair Allocation</h4>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                  SIH 26089 algorithm distributes bookings evenly, preventing burnout and giving all skilled members fair income.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Worker Profile Modal */}
      <WorkerProfileModal
        worker={selectedWorkerForModal}
        isOpen={!!selectedWorkerForModal}
        onClose={() => setSelectedWorkerForModal(null)}
        onBook={(w) => handleBookWorker(w)}
      />
    </div>
  );
}
