'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBookingStore, BookingDraft } from '@/lib/store/bookingStore';
import { WorkerCard } from '@/components/customer/WorkerCard';
import { WorkerProfileModal } from '@/components/customer/WorkerProfileModal';
import { FairMatchExplainer } from '@/components/customer/FairMatchExplainer';
import { ServiceCategoryIcon } from '@/components/customer/ServiceCategoryIcon';
import { FileUpload } from '@/components/customer/FileUpload';
import { MapView } from '@/components/customer/MapView';
import { WorkerProfile, Booking } from '@/lib/data/mockData';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Zap,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Building2,
  CheckCircle2,
  Filter,
  SlidersHorizontal,
  CreditCard,
  Check,
  Receipt,
  AlertTriangle,
  Flame,
  LayoutGrid,
  Map as MapIcon,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ serviceId: string }>;
}

function BookingFlowContent({ params }: PageProps) {
  const resolvedParams = use(params);
  const serviceId = resolvedParams.serviceId;
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialStep = (searchParams.get('step') as 'form' | 'match' | 'confirm') || 'form';
  const queryWorkerId = searchParams.get('worker') || '';

  const {
    categories,
    workers,
    draft,
    setDraft,
    selectServiceForBooking,
    selectWorkerForBooking,
    createBookingFromDraft,
    getMatchedWorkers,
  } = useBookingStore();

  const [step, setStep] = useState<'form' | 'match' | 'confirm' | 'success'>(initialStep);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [selectedWorkerModal, setSelectedWorkerModal] = useState<WorkerProfile | null>(null);
  const [matchViewMode, setMatchViewMode] = useState<'list' | 'map'>('list');

  // Filter and Sort states for Worker Matching
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(true);
  const [filterMaxDistance, setFilterMaxDistance] = useState<number>(10);
  const [filterMinRating, setFilterMinRating] = useState<number>(4.0);
  const [sortBy, setSortBy] = useState<'match' | 'distance' | 'rating' | 'price'>('match');

  // Find target service category
  const currentCategory =
    categories.find((c) => c.id === serviceId) ||
    categories.find((c) => c.name.toLowerCase() === serviceId.toLowerCase()) ||
    categories[0];

  // Initialize draft with category on load
  useEffect(() => {
    if (currentCategory && draft.serviceCategoryId !== currentCategory.id) {
      selectServiceForBooking(currentCategory);
    }

    if (queryWorkerId) {
      const foundWorker = workers.find((w) => w.id === queryWorkerId);
      if (foundWorker) {
        selectWorkerForBooking(foundWorker);
      }
    }
  }, [currentCategory, queryWorkerId]);

  // Dynamic matched workers
  const matchedWorkers = getMatchedWorkers(currentCategory?.id, draft.urgency);

  // Apply filters and sorting
  const filteredWorkers = matchedWorkers
    .filter((w) => {
      if (filterVerifiedOnly && !w.is_verified) return false;
      if (w.approx_distance_km > filterMaxDistance) return false;
      if (w.avg_rating < filterMinRating) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'distance') return a.approx_distance_km - b.approx_distance_km;
      if (sortBy === 'rating') return b.avg_rating - a.avg_rating;
      if (sortBy === 'price') return a.hourly_rate - b.hourly_rate;
      return (b.match_score || 0) - (a.match_score || 0); // Best Match
    });

  // Selected worker for confirm step
  const selectedWorker =
    draft.selectedWorker ||
    workers.find((w) => w.id === draft.selectedWorkerId) ||
    filteredWorkers[0] ||
    workers[0];

  // Handlers
  const handleFindWorkersSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.description.trim()) {
      toast.error('Please provide a brief problem description.');
      return;
    }
    if (!draft.address.trim()) {
      toast.error('Please enter your service address.');
      return;
    }

    setStep('match');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectWorkerForBooking = (worker: WorkerProfile) => {
    selectWorkerForBooking(worker);
    setStep('confirm');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmBooking = () => {
    const newBooking = createBookingFromDraft();
    setCreatedBooking(newBooking);
    setStep('success');
    toast.success(`Booking ${newBooking.id} created successfully!`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50/70 pb-20 sm:pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="bg-white border-b border-gray-200/90 py-4 px-4 sm:px-6 sticky top-16 z-40">
        <div className="container mx-auto max-w-5xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (step === 'confirm') setStep('match');
                else if (step === 'match') setStep('form');
                else router.push('/services');
              }}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <ServiceCategoryIcon name={currentCategory.icon_url} className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                  Book {currentCategory.name}
                </h1>
                <span className="text-[11px] text-gray-500 block">
                  Cooperative Verified Service
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-gray-500">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                step === 'form'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              1. Request
            </span>
            <span className="text-gray-300">→</span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                step === 'match'
                  ? 'bg-emerald-600 text-white'
                  : step === 'confirm' || step === 'success'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              2. Match Workers
            </span>
            <span className="text-gray-300">→</span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                step === 'confirm' || step === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              3. Confirm
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 pt-6">
        {/* ========================================================= */}
        {/* STEP 1: SERVICE REQUEST & BOOKING FORM                    */}
        {/* ========================================================= */}
        {step === 'form' && (
          <form onSubmit={handleFindWorkersSubmit} className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (2 Cols): Problem, Location, Time, Photos */}
              <div className="lg:col-span-2 space-y-6">
                {/* Service Overview Card */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <ServiceCategoryIcon name={currentCategory.icon_url} className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{currentCategory.name}</h2>
                      <p className="text-xs text-gray-500 mt-0.5">{currentCategory.description}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Base Rate</span>
                    <span className="text-base font-extrabold text-emerald-700">₹{currentCategory.base_price}</span>
                  </div>
                </div>

                {/* Problem Description */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                  <label className="text-xs font-bold text-gray-900 block">
                    Describe Your Problem / Service Requirement *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="E.g., Kitchen sink pipe is leaking under the counter, water dripping onto floor..."
                    value={draft.description}
                    onChange={(e) => setDraft({ description: e.target.value })}
                    required
                    className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
                  />
                  {/* Quick Suggestions */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="text-[11px] text-gray-400 font-medium">Suggestions:</span>
                    {[
                      'Kitchen sink pipe is leaking.',
                      'Bathroom tap won’t shut completely.',
                      'Main line drainage blocked.',
                      'Water tank overflow pipe repair.',
                    ].map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setDraft({ description: sug })}
                        className="text-[11px] bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 px-2.5 py-1 rounded-lg transition-colors border border-gray-200/60"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Input */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-900 block">
                      Service Location / Address *
                    </label>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Patna Network
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter flat/house no., building, street and area..."
                      value={draft.address}
                      onChange={(e) => setDraft({ address: e.target.value })}
                      required
                      className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City (e.g. Patna)"
                      value={draft.city}
                      onChange={(e) => setDraft({ city: e.target.value })}
                      className="text-xs sm:text-sm p-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Pincode (e.g. 800020)"
                      defaultValue="800020"
                      className="text-xs sm:text-sm p-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Date & Time Slot Selection */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                  <label className="text-xs font-bold text-gray-900 block">
                    Preferred Date &amp; Time Slot *
                  </label>

                  {/* Booking Type Toggle */}
                  <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          bookingType: 'scheduled',
                          timeSlot: 'Morning (09:00 AM - 12:00 PM)',
                          urgency: 'normal',
                        })
                      }
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        draft.bookingType === 'scheduled'
                          ? 'bg-white text-gray-900 shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      📅 Scheduled Booking
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          bookingType: 'on_demand',
                          timeSlot: 'Immediate (Next 30 Mins)',
                          urgency: 'emergency',
                        })
                      }
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        draft.bookingType === 'on_demand'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      ⚡ Immediate On-Demand
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[11px] text-gray-500 font-medium block mb-1.5">
                        Select Date
                      </span>
                      <input
                        type="date"
                        value={draft.date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDraft({ date: e.target.value })}
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-gray-500 font-medium block mb-1.5">
                        Select Time Window
                      </span>
                      <select
                        value={draft.timeSlot}
                        onChange={(e) => setDraft({ timeSlot: e.target.value })}
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="Morning (09:00 AM - 12:00 PM)">Morning (09:00 AM - 12:00 PM)</option>
                        <option value="Afternoon (12:00 PM - 04:00 PM)">Afternoon (12:00 PM - 04:00 PM)</option>
                        <option value="Evening (04:00 PM - 08:00 PM)">Evening (04:00 PM - 08:00 PM)</option>
                        <option value="Immediate (Emergency 30 min dispatch)">Immediate (Emergency 30 min dispatch)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Urgency Level */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                  <label className="text-xs font-bold text-gray-900 block">
                    Service Urgency Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        key: 'normal',
                        label: 'Normal',
                        sub: 'Standard schedule',
                        badge: 'Base Rate',
                        color: 'border-gray-200 bg-white hover:border-emerald-400',
                        activeColor: 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 text-emerald-900',
                      },
                      {
                        key: 'urgent',
                        label: 'Urgent',
                        sub: 'Priority slot (+25%)',
                        badge: '+25%',
                        color: 'border-gray-200 bg-white hover:border-amber-400',
                        activeColor: 'border-amber-600 bg-amber-50/40 ring-2 ring-amber-500/20 text-amber-900',
                      },
                      {
                        key: 'emergency',
                        label: 'Emergency',
                        sub: '1.5x SOS Dispatch',
                        badge: '1.5x Multiplier',
                        color: 'border-gray-200 bg-white hover:border-red-400',
                        activeColor: 'border-red-600 bg-red-50/40 ring-2 ring-red-500/20 text-red-900',
                      },
                    ].map((lvl) => {
                      const isSelected = draft.urgency === lvl.key;
                      return (
                        <button
                          key={lvl.key}
                          type="button"
                          onClick={() => setDraft({ urgency: lvl.key as any })}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isSelected ? lvl.activeColor : lvl.color
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{lvl.label}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-gray-100">
                              {lvl.badge}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-500 block mt-1">
                            {lvl.sub}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                  <FileUpload
                    value={draft.imageUrl}
                    onChange={(url) => setDraft({ imageUrl: url })}
                  />
                </div>
              </div>

              {/* Right Column (1 Col): Live Price Breakdown & Next Action */}
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm sticky top-36 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    Transparent Price Estimate
                  </div>

                  <div className="space-y-2.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                    <div className="flex justify-between">
                      <span>Base Service Fee</span>
                      <span className="font-semibold text-gray-800">₹{draft.basePrice}</span>
                    </div>
                    {draft.urgency === 'urgent' && (
                      <div className="flex justify-between text-amber-700">
                        <span>Urgent Priority Adjustment (+25%)</span>
                        <span className="font-semibold">+₹{Math.round(draft.basePrice * 0.25)}</span>
                      </div>
                    )}
                    {draft.urgency === 'emergency' && (
                      <div className="flex justify-between text-red-700">
                        <span>Emergency SOS Multiplier (1.5x)</span>
                        <span className="font-semibold">+₹{Math.round(draft.basePrice * 0.5)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-400 text-[11px]">
                      <span>Cooperative Society Guarantee</span>
                      <span className="text-emerald-600 font-medium">Included (Free)</span>
                    </div>

                    <div className="pt-3 border-t border-gray-200 flex items-baseline justify-between text-gray-900">
                      <div>
                        <span className="text-xs font-bold block">Estimated Total</span>
                        <span className="text-[10px] text-gray-400">Pay after job completion</span>
                      </div>
                      <span className="text-2xl font-black text-emerald-700">
                        ₹{draft.estimatedPrice}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm h-11 rounded-xl shadow-md transition-transform hover:scale-[1.01]"
                  >
                    <span>Find Verified Workers</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-[11px] text-gray-600 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Cooperative Trust Guarantee
                    </div>
                    <p className="text-[10px] leading-relaxed">
                      No advance payment needed. Transparent fixed rates directly credited to registered cooperative workers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* STEP 2: WORKER MATCHING & FAIR ALLOCATION RESULTS         */}
        {/* ========================================================= */}
        {step === 'match' && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            {/* Header Banner with SIH Multi-Factor Match Indicator */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-emerald-700/60 text-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1.5 border border-emerald-600/40">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Fair Opportunity &amp; Proximity Allocation</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Verified Workers Near You
                </h2>
                <p className="text-xs text-emerald-100 mt-1 max-w-lg">
                  Ranked by the SIH 26089 multi-factor score (Skills 35%, Proximity 20%, Availability 15%, Rating 10%, Workload 10%, Fairness 10%).
                </p>
              </div>

              {/* View Mode Toggle: List | Map */}
              <div className="flex items-center bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20 shrink-0">
                <button
                  type="button"
                  onClick={() => setMatchViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    matchViewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>List View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMatchViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    matchViewMode === 'map'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-emerald-100 hover:text-white'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map View</span>
                </button>
              </div>
            </div>

            {/* Filter and Sorting Controls */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-gray-700 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-emerald-600" />
                  Filters:
                </span>
                <button
                  type="button"
                  onClick={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
                  className={`px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                    filterVerifiedOnly
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  ✓ Verified Only
                </button>
                <select
                  value={filterMaxDistance}
                  onChange={(e) => setFilterMaxDistance(Number(e.target.value))}
                  className="px-2.5 py-1 rounded-lg border border-gray-200 text-gray-700 bg-white font-medium"
                >
                  <option value={3}>Distance: &lt; 3 km</option>
                  <option value={5}>Distance: &lt; 5 km</option>
                  <option value={10}>Distance: &lt; 10 km</option>
                  <option value={20}>Distance: All (&lt; 20 km)</option>
                </select>
                <select
                  value={filterMinRating}
                  onChange={(e) => setFilterMinRating(Number(e.target.value))}
                  className="px-2.5 py-1 rounded-lg border border-gray-200 text-gray-700 bg-white font-medium"
                >
                  <option value={4.0}>Rating: 4.0+ ★</option>
                  <option value={4.5}>Rating: 4.5+ ★</option>
                  <option value={4.8}>Rating: 4.8+ ★</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
                  Sort By:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1 rounded-lg border border-gray-200 text-gray-800 bg-white font-bold"
                >
                  <option value="match">✨ Best Fair Match (Recommended)</option>
                  <option value="distance">📍 Nearest Distance</option>
                  <option value="rating">★ Highest Rated</option>
                  <option value="price">₹ Starting Price</option>
                </select>
              </div>
            </div>

            {/* List View or Map View */}
            {matchViewMode === 'list' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredWorkers.map((worker) => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    categoryName={currentCategory.name}
                    urgency={draft.urgency}
                    onViewProfile={(w) => setSelectedWorkerModal(w)}
                    onBookNow={(w) => handleSelectWorkerForBooking(w)}
                  />
                ))}

                {filteredWorkers.length === 0 && (
                  <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-gray-200">
                    <p className="text-gray-500 text-sm">
                      No verified workers matched the chosen filters.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-3 text-xs"
                      onClick={() => {
                        setFilterMaxDistance(10);
                        setFilterMinRating(4.0);
                        setFilterVerifiedOnly(false);
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                <div className="h-[450px] w-full rounded-xl overflow-hidden">
                  <MapView
                    workers={filteredWorkers}
                    onSelectWorker={(w) => setSelectedWorkerModal(w)}
                    center={[25.5941, 85.1376]}
                    userLocation={[25.5941, 85.1376]}
                    addressName={draft.address}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: BOOKING CONFIRMATION                              */}
        {/* ========================================================= */}
        {step === 'confirm' && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary of Booking */}
              <div className="lg:col-span-2 space-y-5">
                {/* Selected Worker Header Card */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={selectedWorker.profile_photo_url}
                      alt={selectedWorker.full_name}
                      className="w-14 h-14 rounded-2xl object-cover border border-emerald-200 shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-gray-900">
                          {selectedWorker.full_name}
                        </h3>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          ✓ Verified
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {selectedWorker.primary_skill} • {selectedWorker.years_experience} yrs exp • {selectedWorker.avg_rating}★ ({selectedWorker.total_jobs_completed} jobs)
                      </p>
                      <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {selectedWorker.society_name}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => setStep('match')}
                  >
                    Change Worker
                  </Button>
                </div>

                {/* Service Details Breakdown */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Service &amp; Schedule Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                      <span className="text-gray-400 font-medium block">Trade &amp; Service</span>
                      <strong className="text-gray-900 text-sm mt-0.5 block">
                        {currentCategory.name}
                      </strong>
                      <span className="text-[11px] text-gray-500 mt-0.5 block">
                        {draft.urgency === 'emergency' ? '⚡ Emergency SOS Dispatch' : 'Standard Scheduled Booking'}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                      <span className="text-gray-400 font-medium block">Date &amp; Time Window</span>
                      <strong className="text-gray-900 text-sm mt-0.5 block">
                        {draft.date}
                      </strong>
                      <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">
                        {draft.timeSlot}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 sm:col-span-2">
                      <span className="text-gray-400 font-medium block">Service Address</span>
                      <strong className="text-gray-900 text-sm mt-0.5 block">
                        {draft.address}, {draft.city}
                      </strong>
                    </div>

                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 sm:col-span-2">
                      <span className="text-gray-400 font-medium block">Issue Description</span>
                      <p className="text-gray-800 text-xs mt-0.5 font-medium leading-relaxed">
                        {draft.description}
                      </p>
                      {draft.imageUrl && (
                        <div className="mt-2.5">
                          <img
                            src={draft.imageUrl}
                            alt="Attached issue"
                            className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fair Matching Algorithm Explainer Preview */}
                <FairMatchExplainer
                  worker={selectedWorker}
                  categoryName={currentCategory.name}
                  urgency={draft.urgency}
                />
              </div>

              {/* Right Column: Payment Method & Confirm Button */}
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Payment &amp; Pricing
                  </h3>

                  <div className="space-y-2 text-xs border-b border-gray-100 pb-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Base Service Charge</span>
                      <span>₹{draft.basePrice}</span>
                    </div>
                    {draft.urgency === 'urgent' && (
                      <div className="flex justify-between text-amber-700">
                        <span>Urgent Surcharge (+25%)</span>
                        <span>+₹{Math.round(draft.basePrice * 0.25)}</span>
                      </div>
                    )}
                    {draft.urgency === 'emergency' && (
                      <div className="flex justify-between text-red-700">
                        <span>Emergency 1.5x Multiplier</span>
                        <span>+₹{Math.round(draft.basePrice * 0.5)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[11px] text-gray-400">
                      <span>Cooperative Welfare Levy</span>
                      <span className="text-emerald-600 font-medium">Included</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-xs font-bold text-gray-900">Total Estimated Amount</span>
                    <span className="text-2xl font-black text-emerald-700">
                      ₹{draft.estimatedPrice}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                      Payment Mode
                    </span>
                    <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-700" />
                        <div>
                          <strong className="text-gray-900 block">Pay After Service</strong>
                          <span className="text-[10px] text-gray-500">Cash, UPI, or Card upon completion</span>
                        </div>
                      </div>
                      <Check className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleConfirmBooking}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm h-11 rounded-xl shadow-md transition-transform hover:scale-[1.01]"
                  >
                    Confirm Booking
                  </Button>

                  <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                    By confirming, you agree to SharmNexus Cooperative terms. Initial booking status will be set to <strong>Requested</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 4: CELEBRATION / BOOKING SUCCESS                     */}
        {/* ========================================================= */}
        {step === 'success' && createdBooking && (
          <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-emerald-200 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Booking Confirmed (Status: Requested)
              </span>
              <h2 className="text-2xl font-black text-gray-900 mt-3">
                Your Service Request is Live!
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md mx-auto">
                Assigned to <strong>{createdBooking.worker?.full_name}</strong> from <strong>{createdBooking.worker?.society_name}</strong>.
              </p>
            </div>

            {/* Booking Details Card */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-gray-400">Booking ID:</span>
                <span className="font-mono font-bold text-gray-900">{createdBooking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Service:</span>
                <span className="font-semibold text-gray-900">{createdBooking.service_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Scheduled Time:</span>
                <span className="font-semibold text-emerald-700">{createdBooking.scheduled_at}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">OTP Code:</span>
                <span className="font-mono font-extrabold text-emerald-700 text-sm bg-emerald-100/70 px-2 py-0.5 rounded">
                  {createdBooking.otp}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Estimated Price:</span>
                <span className="font-extrabold text-gray-900 text-sm">₹{createdBooking.estimated_price}</span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                href={`/track/${createdBooking.id}`}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm h-11 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.01]"
              >
                <span>Track Booking Status &amp; Timeline</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/history"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs sm:text-sm h-11 rounded-xl flex items-center justify-center transition-colors"
              >
                View in My Bookings
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Worker Profile Modal */}
      <WorkerProfileModal
        worker={selectedWorkerModal}
        isOpen={!!selectedWorkerModal}
        onClose={() => setSelectedWorkerModal(null)}
        onBook={(w) => handleSelectWorkerForBooking(w)}
        categoryName={currentCategory?.name}
        urgency={draft.urgency}
      />
    </div>
  );
}

export default function BookingFlowPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs text-gray-400">
          Loading booking flow...
        </div>
      }
    >
      <BookingFlowContent params={params} />
    </Suspense>
  );
}
