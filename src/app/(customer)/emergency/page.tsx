'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store/bookingStore';
import { ServiceCategoryIcon } from '@/components/customer/ServiceCategoryIcon';
import { WorkerCard } from '@/components/customer/WorkerCard';
import { WorkerProfileModal } from '@/components/customer/WorkerProfileModal';
import { FileUpload } from '@/components/customer/FileUpload';
import { MapView } from '@/components/customer/MapView';
import { WorkerProfile, ServiceCategory } from '@/lib/data/mockData';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { createBooking } from '@/app/actions/bookings';
import {
  Zap,
  Clock,
  MapPin,
  ShieldCheck,
  Flame,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Navigation,
} from 'lucide-react';

export default function EmergencyBookingPage() {
  const router = useRouter();
  const supabase = createClient();
  const { categories, workers, selectServiceForBooking, selectWorkerForBooking, setDraft, createBookingFromDraft } =
    useBookingStore();

  const [selectedCategoryId, setSelectedCategoryId] = useState('cat-plumber');
  const [description, setDescription] = useState('Urgent pipe burst under kitchen counter. Water leaking heavily.');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Kolkata');
  const [coords, setCoords] = useState<[number, number]>([22.5726, 88.3639]);
  const [isLocating, setIsLocating] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);
  const [selectedWorkerModal, setSelectedWorkerModal] = useState<WorkerProfile | null>(null);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('shramnexus-customer-profile');
      if (savedProfile) {
        const p = JSON.parse(savedProfile);
        if (p.address && !p.address.includes('Green Valley')) setAddress(p.address);
        if (p.city) setCity(p.city);
      }
    } catch (e) {}
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
        setCoords([latitude, longitude]);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const detCity = addr.city || addr.town || addr.municipality || addr.state_district || 'Local Area';
            const road = addr.road || addr.suburb || addr.neighbourhood || '';
            const house = addr.house_number ? `${addr.house_number}, ` : '';
            const fullAddr = data.display_name ? data.display_name.split(',').slice(0, 3).join(', ') : `${house}${road}, ${detCity}`;

            setAddress(fullAddr);
            setCity(detCity);
            toast.success(`Location detected: ${detCity}`);
          } else {
            toast.success('GPS coordinates detected!');
          }
        } catch (e) {
          toast.success('GPS coordinates detected!');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        toast.error(`Location error: ${err.message}`);
      }
    );
  };

  // Selected category object
  const selectedCategory =
    categories.find((c) => c.id === selectedCategoryId) || categories[0];

  // Emergency multiplier (1.5x)
  const basePrice = selectedCategory.base_price;
  const emergencyMultiplier = selectedCategory.emergency_multiplier || 1.5;
  const estimatedPrice = Math.round(basePrice * emergencyMultiplier);

  // Filter emergency-available workers prioritizing proximity (< 4 km) and skill
  const emergencyWorkers = workers
    .filter((w) => w.is_available)
    .sort((a, b) => a.approx_distance_km - b.approx_distance_km);

  const handleSearchEmergencyWorkers = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !address.trim()) {
      toast.error('Please enter problem details and location.');
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
      toast.success(`Found ${emergencyWorkers.length} emergency on-duty workers nearby!`);
    }, 600);
  };

  const handleDirectEmergencyBook = async (worker: WorkerProfile) => {
    const localAuth = typeof window !== 'undefined' ? (localStorage.getItem('shramnexus-auth') || localStorage.getItem('sharmnexus-auth')) : null;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user && !localAuth) {
      toast.info('Please sign in to dispatch an Emergency SOS request');
      router.push('/auth/login?redirect=/emergency');
      return;
    }

    selectServiceForBooking(selectedCategory);
    selectWorkerForBooking(worker);
    setDraft({
      serviceCategoryId: selectedCategory.id,
      serviceCategoryName: selectedCategory.name,
      serviceIcon: selectedCategory.icon_url,
      basePrice: selectedCategory.base_price,
      emergencyMultiplier: emergencyMultiplier,
      estimatedPrice: Math.round(selectedCategory.base_price * emergencyMultiplier),
      description: description,
      address: address || 'Emergency Dispatch Location',
      city: city || 'Kolkata',
      lat: coords[0],
      lng: coords[1],
      date: new Date().toISOString().split('T')[0],
      timeSlot: 'Immediate (Emergency SOS)',
      bookingType: 'emergency',
      urgency: 'emergency',
      imageUrl: imageUrl,
      selectedWorkerId: worker.id,
      selectedWorker: worker,
    });

    let realBookingId: string | null = null;
    try {
      const res = await createBooking({
        worker_id: worker.id,
        service_category_id: selectedCategory.id,
        service_category_name: selectedCategory.name,
        description: `[EMERGENCY SOS] ${description}`,
        address: address,
        booking_type: 'emergency',
        estimated_price: Math.round(selectedCategory.base_price * emergencyMultiplier),
        scheduled_at: new Date().toISOString(),
      });
      if (res?.data?.id) {
        realBookingId = res.data.id;
      }
    } catch (err) {
      console.warn('Emergency booking sync warning:', err);
    }

    const newBooking = createBookingFromDraft();
    if (realBookingId) {
      newBooking.id = realBookingId;
      try {
        useBookingStore.setState((state) => ({
          bookings: [newBooking, ...state.bookings.filter((b) => b.id !== newBooking.id)],
        }));
      } catch (e) {}
    }

    toast.success(`Emergency SOS dispatched! Worker assigned.`);
    router.push(`/track/${realBookingId || newBooking.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50/70 pb-20 sm:pb-12">
      {/* High Urgency Header */}
      <div className="bg-gradient-to-r from-red-800 via-rose-800 to-amber-900 text-white pt-8 pb-12 px-4 sm:px-6 shadow-md">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-600/60 border border-red-400/40 text-white text-xs font-bold px-3 py-1 rounded-full mb-2.5 animate-pulse">
                <Zap className="w-4 h-4 fill-current text-yellow-300" />
                <span>24/7 Cooperative Priority Dispatch</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Need help right now?
              </h1>
              <p className="text-red-100 text-xs sm:text-sm mt-1 max-w-xl">
                Immediate on-duty dispatch for burst pipes, electrical short-circuits, and critical home emergencies.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl flex items-center gap-3 shrink-0 text-white">
              <Clock className="w-5 h-5 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
              <div>
                <span className="text-[10px] text-red-200 block uppercase font-bold">Estimated ETA</span>
                <span className="font-black text-base">15 – 25 Minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 -mt-6 space-y-6">
        {/* Instant 1-Click SOS Dispatch Cards from Teammates */}
        <div className="bg-white p-6 rounded-2xl border border-[#c94b3e]/30 shadow-md space-y-4">
          <h3 className="text-base font-bold text-[#24172f] font-serif">
            Need Immediate Emergency Plumber / Electrician?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[#c94b3e]/30 bg-[#f5d8d1]/30 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-[#24172f] text-sm">Emergency Plumber</h4>
                <span className="text-xs text-[#776e79] block">ETA: ~15 mins • 2.4 km away</span>
                <span className="block text-xs font-black text-[#c94b3e] mt-1">₹450 (1.5x Multiplier)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const plumberWorker = emergencyWorkers.find(w => w.primary_skill.toLowerCase().includes('plumb')) || emergencyWorkers[0];
                  if (plumberWorker) handleDirectEmergencyBook(plumberWorker);
                }}
                className="animated-border-btn rounded-xl shadow-lg w-32 h-10 transition-transform hover:scale-105 shrink-0"
              >
                <span className="animated-border-btn-inner flex items-center justify-center text-[#c94b3e] font-bold text-xs hover:bg-[#f5d8d1] transition-colors">
                  Dispatch Now
                </span>
              </button>
            </div>
            <div className="p-4 rounded-xl border border-[#c94b3e]/30 bg-[#f5d8d1]/30 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-[#24172f] text-sm">Emergency Electrician</h4>
                <span className="text-xs text-[#776e79] block">ETA: ~20 mins • 3.1 km away</span>
                <span className="block text-xs font-black text-[#c94b3e] mt-1">₹525 (1.5x Multiplier)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const elecWorker = emergencyWorkers.find(w => w.primary_skill.toLowerCase().includes('elec')) || emergencyWorkers[0];
                  if (elecWorker) handleDirectEmergencyBook(elecWorker);
                }}
                className="animated-border-btn rounded-xl shadow-lg w-32 h-10 transition-transform hover:scale-105 shrink-0"
              >
                <span className="animated-border-btn-inner flex items-center justify-center text-[#c94b3e] font-bold text-xs hover:bg-[#f5d8d1] transition-colors">
                  Dispatch Now
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Emergency Dispatch Form */}
        <form
          onSubmit={handleSearchEmergencyWorkers}
          className="bg-white rounded-2xl p-5 sm:p-6 border border-red-200 shadow-md space-y-5"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Emergency Request Details
            </h2>
            <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
              Emergency Rate: 1.5x Multiplier
            </span>
          </div>

          {/* Service Selector Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 block">
              Select Required Emergency Service *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {categories.slice(0, 5).map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'border-red-600 bg-red-50/50 ring-2 ring-red-500/20 text-red-900 font-bold'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <ServiceCategoryIcon
                      name={cat.icon_url}
                      className={`w-5 h-5 ${isSelected ? 'text-red-600' : 'text-gray-500'}`}
                    />
                    <span className="text-xs">{cat.name}</span>
                    <span className="text-[10px] text-gray-400">
                      ₹{Math.round(cat.base_price * cat.emergency_multiplier)} SOS
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Problem & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">
                Emergency Situation / Problem *
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none bg-gray-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 block">
                  Your Exact Location / Landmark *
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Navigation className="w-3 h-3" />
                  <span>{isLocating ? 'Locating...' : 'Use Current GPS'}</span>
                </button>
              </div>
              <textarea
                rows={2}
                placeholder="Enter street address, flat no, landmark..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none bg-gray-50/50"
              />
            </div>
          </div>

          {/* Photo Attachment (Optional) */}
          <FileUpload
            value={imageUrl}
            onChange={(url) => setImageUrl(url)}
            label="Attach Damage Photo (Optional)"
            hint="Helps the on-duty worker bring necessary emergency pipes, sealants, or fuses."
          />

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100">
            <div>
              <span className="text-[11px] text-gray-500 font-medium block">
                Estimated Emergency Rate (1.5x Multiplier):
              </span>
              <span className="text-xl font-black text-red-700">
                ₹{estimatedPrice}{' '}
                <span className="text-xs font-normal text-gray-400">
                  (Includes ₹{Math.round(basePrice * 0.5)} priority dispatch)
                </span>
              </span>
            </div>

            <Button
              type="submit"
              disabled={isSearching}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm h-11 px-6 rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{isSearching ? 'Locating Nearest Workers...' : 'Find On-Duty Emergency Workers'}</span>
            </Button>
          </div>
        </form>

        {/* Matched On-Duty Emergency Workers List */}
        {hasSearched && (
          <div className="space-y-4 animate-in fade-in-50 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  On-Duty Cooperative Emergency Workers Nearby
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Prioritized by immediate availability and shortest driving distance
                </p>
              </div>
              <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
                {emergencyWorkers.length} Workers Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emergencyWorkers.map((worker) => (
                <div
                  key={worker.id}
                  className="bg-white rounded-2xl border border-red-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={worker.profile_photo_url}
                          alt={worker.full_name}
                          className="w-12 h-12 rounded-xl object-cover border border-red-100"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-gray-900 text-sm">
                              {worker.full_name}
                            </h4>
                            <span className="text-[10px] font-bold text-[#8ba58b] bg-[#e2eee4] px-1.5 py-0.2 rounded">
                              ✓ Verified
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 block">
                            {worker.primary_skill} • {worker.years_experience} yrs exp
                          </span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-red-100 text-red-800 px-2 py-0.5 rounded-full shrink-0">
                        <Clock className="w-3 h-3" />
                        ~{worker.response_time_mins} min ETA
                      </span>
                    </div>

                    <div className="mt-3 bg-red-50/50 p-2.5 rounded-xl text-xs space-y-1 text-gray-700">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Distance:</span>
                        <strong className="text-gray-900">{worker.approx_distance_km.toFixed(1)} km away</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Cooperative Society:</span>
                        <span className="font-semibold text-[#d96f4d] truncate max-w-[150px]">
                          {worker.society_name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-9 flex-1"
                      onClick={() => setSelectedWorkerModal(worker)}
                    >
                      View Profile
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-9 flex-1 shadow-xs"
                      onClick={() => handleDirectEmergencyBook(worker)}
                    >
                      Dispatch Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Worker Profile Modal */}
      <WorkerProfileModal
        worker={selectedWorkerModal}
        isOpen={!!selectedWorkerModal}
        onClose={() => setSelectedWorkerModal(null)}
        onBook={handleDirectEmergencyBook}
        categoryName={selectedCategory.name}
        urgency="emergency"
      />
    </div>
  );
}
