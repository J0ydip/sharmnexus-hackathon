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
import { createBooking } from '@/app/actions/bookings';
import { getBookingOtp } from '@/lib/utils';
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
  Navigation,
} from 'lucide-react';

const CITY_COORDINATES: Record<string, [number, number]> = {
  kolkata: [22.5726, 88.3639],
  patna: [25.5941, 85.1376],
  delhi: [28.6139, 77.2090],
  'new delhi': [28.6139, 77.2090],
  mumbai: [19.0760, 72.8777],
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  hyderabad: [17.3850, 78.4867],
  chennai: [13.0827, 80.2707],
  pune: [18.5204, 73.8567],
  ahmedabad: [23.0225, 72.5714],
  jaipur: [26.9124, 75.7873],
  lucknow: [26.8467, 80.9462],
  chandigarh: [30.7333, 76.7794],
  ranchi: [23.3441, 85.3096],
  bhubaneswar: [20.2961, 85.8245],
  howrah: [22.5958, 88.2636],
};

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

  // GPS and Geocoding Detection
  const [isLocating, setIsLocating] = useState(false);

  // Initialize draft address from saved profile if available
  useEffect(() => {
    if (!draft.address || !draft.city) {
      try {
        const savedProfile = localStorage.getItem('shramnexus-customer-profile');
        if (savedProfile) {
          const p = JSON.parse(savedProfile);
          setDraft({
            address: draft.address || p.address || '',
            city: draft.city || p.city || 'Kolkata',
          });
        }
      } catch (e) {}
    }
  }, []);

  const handleDetectLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const city = addr.city || addr.town || addr.municipality || addr.state_district || addr.county || 'Local Area';
            const pincode = addr.postcode || '';
            const road = addr.road || addr.suburb || addr.neighbourhood || '';
            const house = addr.house_number ? `${addr.house_number}, ` : '';
            const fullAddr = data.display_name ? data.display_name.split(',').slice(0, 3).join(', ') : `${house}${road}, ${city}`;

            setDraft({
              lat: latitude,
              lng: longitude,
              address: fullAddr,
              city: city,
              pincode: pincode,
            });
            toast.success(`Location detected: ${city} ${pincode ? `(${pincode})` : ''}`);
          } else {
            setDraft({ lat: latitude, lng: longitude });
            toast.success('GPS coordinates detected!');
          }
        } catch (e) {
          setDraft({ lat: latitude, lng: longitude });
          toast.success('GPS coordinates detected!');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        toast.error(`Location access error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCityChange = (cityName: string) => {
    const cleanCity = cityName.trim().toLowerCase();
    const coords = CITY_COORDINATES[cleanCity];
    if (coords) {
      setDraft({ city: cityName, lat: coords[0], lng: coords[1] });
      toast.info(`Updated map network to ${cityName}`);
    } else {
      setDraft({ city: cityName });
    }
  };

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

  const handleConfirmBooking = async () => {
    const newBooking = createBookingFromDraft();
    setCreatedBooking(newBooking);
    setStep('success');
    toast.success(`Booking ${newBooking.id} created successfully!`);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Persist booking to Supabase
    try {
      await createBooking({
        worker_id: draft.selectedWorkerId || 'worker-rajesh-kumar',
        service_category_id: draft.serviceCategoryId,
        service_category_name: draft.serviceCategoryName,
        description: draft.description,
        address: draft.address,
        booking_type: draft.bookingType,
        estimated_price: draft.estimatedPrice,
        scheduled_at: `${draft.date}T10:00:00Z`,
        latitude: draft.lat,
        longitude: draft.lng,
      });
    } catch (err) {
      console.warn('Could not sync booking to Supabase:', err);
    }
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
              <div className="w-8 h-8 rounded-lg bg-[#f0e7d9] text-[#24172f] flex items-center justify-center">
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
                  ? 'bg-[#24172f] text-white'
                  : 'bg-[#f5dfad] text-[#24172f]'
              }`}
            >
              1. Request
            </span>
            <span className="text-gray-300">→</span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                step === 'match'
                  ? 'bg-[#24172f] text-white'
                  : step === 'confirm' || step === 'success'
                  ? 'bg-[#f5dfad] text-[#24172f]'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              2. Match Workers
            </span>
            <span className="text-gray-300">→</span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                step === 'confirm' || step === 'success'
                  ? 'bg-[#24172f] text-white'
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
                    <div className="w-12 h-12 rounded-2xl bg-[#f0e7d9] text-[#24172f] flex items-center justify-center shrink-0">
                      <ServiceCategoryIcon name={currentCategory.icon_url} className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{currentCategory.name}</h2>
                      <p className="text-xs text-gray-500 mt-0.5">{currentCategory.description}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Base Rate</span>
                    <span className="text-base font-extrabold text-[#d96f4d]">₹{currentCategory.base_price}</span>
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
                    className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e6aa3b] bg-gray-50/50"
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
                        className="text-[11px] bg-gray-100 hover:bg-[#fbf7ef] hover:text-[#d96f4d] text-gray-700 px-2.5 py-1 rounded-lg transition-colors border border-gray-200/60"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Input */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-gray-900 block">
                      Service Location / Address *
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={isLocating}
                        className="text-[11px] font-bold text-[#d96f4d] hover:text-[#b5583b] bg-[#fbf7ef] hover:bg-[#f5e9d4] px-2.5 py-1 rounded-lg border border-[#e6aa3b]/40 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isLocating ? (
                          <>
                            <div className="w-3 h-3 border-2 border-[#d96f4d] border-t-transparent rounded-full animate-spin" />
                            <span>Detecting GPS...</span>
                          </>
                        ) : (
                          <>
                            <Navigation className="w-3 h-3 text-[#d96f4d]" />
                            <span>Use Current Location</span>
                          </>
                        )}
                      </button>
                      <span className="text-[11px] text-[#24172f] font-semibold flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                        <MapPin className="w-3 h-3 text-[#d96f4d]" />
                        {draft.city ? `${draft.city} Network` : 'Verified Network'}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter flat/house no., building, street and area..."
                      value={draft.address}
                      onChange={(e) => setDraft({ address: e.target.value })}
                      required
                      className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e6aa3b] bg-gray-50/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City (e.g. Kolkata, Patna, Delhi)"
                      value={draft.city}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="text-xs sm:text-sm p-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#e6aa3b]"
                    />
                    <input
                      type="text"
                      placeholder="Pincode (e.g. 700001)"
                      value={draft.pincode || ''}
                      onChange={(e) => setDraft({ pincode: e.target.value })}
                      className="text-xs sm:text-sm p-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-[#e6aa3b]"
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
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-[#e6aa3b] outline-none"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-gray-500 font-medium block mb-1.5">
                        Select Time Window
                      </span>
                      <select
                        value={draft.timeSlot}
                        onChange={(e) => setDraft({ timeSlot: e.target.value })}
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-[#e6aa3b] outline-none"
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
                        color: 'border-gray-200 bg-white hover:border-[#d96f4d]',
                        activeColor: 'border-[#24172f] bg-[#f0e7d9] ring-2 ring-[#24172f]/20 text-[#24172f]',
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
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#24172f]">
                    <Receipt className="w-4 h-4 text-[#d96f4d]" />
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
                      <span className="text-[#d96f4d] font-medium">Included (Free)</span>
                    </div>

                    <div className="pt-3 border-t border-gray-200 flex items-baseline justify-between text-gray-900">
                      <div>
                        <span className="text-xs font-bold block">Estimated Total</span>
                        <span className="text-[10px] text-gray-400">Pay after job completion</span>
                      </div>
                      <span className="text-2xl font-black text-[#d96f4d]">
                        ₹{draft.estimatedPrice}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#24172f] hover:bg-[#3d2b48] text-white font-bold text-sm h-11 rounded-xl shadow-md transition-transform hover:scale-[1.01]"
                  >
                    <span>Find Verified Workers</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <div className="bg-[#fbf7ef] p-3 rounded-xl border border-[#e6dcd0] text-[11px] text-gray-600 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#24172f]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#d96f4d]" />
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
            <div className="bg-gradient-to-r from-[#24172f] via-[#3d2b48] to-[#24172f] rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-[#24172f]/80 text-[#f5dfad] border border-[#e6aa3b]/30 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#e6aa3b]" />
                  <span>Fair Opportunity &amp; Proximity Allocation</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Verified Workers Near You
                </h2>
                <p className="text-xs text-[#c8bacb] mt-1 max-w-lg">
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
                      : 'text-[#c8bacb] hover:text-white'
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
                      : 'text-[#c8bacb] hover:text-white'
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
                  <Filter className="w-3.5 h-3.5 text-[#d96f4d]" />
                  Filters:
                </span>
                <button
                  type="button"
                  onClick={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
                  className={`px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                    filterVerifiedOnly
                      ? 'bg-[#f0e7d9] text-[#24172f] border-[#e6aa3b]'
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">
                      Interactive Cooperative Dispatch Radius ({draft.city || 'Local Area'})
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Click anywhere on the map to relocate your service pin. Available craftsmen cluster dynamically around you.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="text-[11px] font-bold text-[#d96f4d] hover:text-[#b5583b] bg-[#fbf7ef] hover:bg-[#f5e9d4] px-2.5 py-1 rounded-lg border border-[#e6aa3b]/40 flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto shrink-0 disabled:opacity-50"
                  >
                    <Navigation className="w-3 h-3 text-[#d96f4d]" />
                    <span>{isLocating ? 'Locating...' : 'Center on GPS'}</span>
                  </button>
                </div>
                <div className="h-[450px] w-full rounded-xl overflow-hidden border border-gray-100">
                  <MapView
                    workers={filteredWorkers}
                    onSelectWorker={(w) => setSelectedWorkerModal(w)}
                    center={[draft.lat || 22.5726, draft.lng || 88.3639]}
                    userLocation={[draft.lat || 22.5726, draft.lng || 88.3639]}
                    addressName={draft.address || `${draft.city || 'Your Area'} Hub`}
                    city={draft.city || 'Kolkata'}
                    onLocationSelect={(coords, addr) => {
                      setDraft({
                        lat: coords[0],
                        lng: coords[1],
                        ...(addr ? { address: addr } : {}),
                      });
                      toast.success(`Service pin moved to ${addr || `${coords[0].toFixed(3)}, ${coords[1].toFixed(3)}`}`);
                    }}
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
                      className="w-14 h-14 rounded-2xl object-cover border border-[#e6dcd0] shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-gray-900">
                          {selectedWorker.full_name}
                        </h3>
                        <span className="text-[10px] font-bold text-[#8ba58b] bg-[#e2eee4] px-2 py-0.5 rounded-full">
                          ✓ Verified
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {selectedWorker.primary_skill} • {selectedWorker.years_experience} yrs exp • {selectedWorker.avg_rating}★ ({selectedWorker.total_jobs_completed} jobs)
                      </p>
                      <p className="text-[11px] text-[#d96f4d] font-medium flex items-center gap-1 mt-1">
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
                      <span className="text-[11px] text-[#d96f4d] font-semibold mt-0.5 block">
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
                      <span className="text-[#d96f4d] font-medium">Included</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-xs font-bold text-gray-900">Total Estimated Amount</span>
                    <span className="text-2xl font-black text-[#d96f4d]">
                      ₹{draft.estimatedPrice}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                      Payment Mode
                    </span>
                    <div className="p-3 rounded-xl border border-[#e6aa3b] bg-[#fbf7ef] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#d96f4d]" />
                        <div>
                          <strong className="text-gray-900 block">Pay After Service</strong>
                          <span className="text-[10px] text-gray-500">Cash, UPI, or Card upon completion</span>
                        </div>
                      </div>
                      <Check className="w-4 h-4 text-[#d96f4d]" />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleConfirmBooking}
                    className="w-full bg-[#24172f] hover:bg-[#3d2b48] text-white font-bold text-sm h-11 rounded-xl shadow-md transition-transform hover:scale-[1.01]"
                  >
                    Confirm Booking
                  </Button>

                  <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                    By confirming, you agree to ShramNexus Cooperative terms. Initial booking status will be set to <strong>Requested</strong>.
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
          <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-[#e6dcd0] shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-[#f0e7d9] text-[#e6aa3b] flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#24172f] bg-[#f0e7d9] px-3 py-1 rounded-full border border-[#e6dcd0]">
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
                <span className="font-semibold text-[#d96f4d]">{createdBooking.scheduled_at}</span>
              </div>
              <div className="flex justify-between items-center bg-[#e2eee4] p-2.5 rounded-xl border border-[#8ba58b]/30">
                <div>
                  <span className="text-xs font-bold text-[#24172f] block">Completion PIN (OTP):</span>
                  <span className="text-[10px] text-[#d96f4d]">Share with worker only after job completion</span>
                </div>
                <span className="font-mono font-black text-[#24172f] text-base bg-white px-3 py-1 rounded-lg border border-[#e6aa3b]/50 tracking-wider">
                  {createdBooking.otp || getBookingOtp(createdBooking.id)}
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
                className="w-full bg-[#24172f] hover:bg-[#3d2b48] text-white font-bold text-xs sm:text-sm h-11 rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.01]"
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
