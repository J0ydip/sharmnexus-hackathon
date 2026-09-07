'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBookingStore } from '@/lib/store/bookingStore';
import { ServiceCard } from '@/components/customer/ServiceCard';
import { MapView } from '@/components/customer/MapView';
import { WorkerCard } from '@/components/customer/WorkerCard';
import { WorkerProfileModal } from '@/components/customer/WorkerProfileModal';
import { WorkerProfile, ServiceCategory } from '@/lib/data/mockData';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Search,
  LayoutGrid,
  Map,
  ShieldCheck,
  Zap,
  Filter,
  Flame,
  ArrowRight,
  Building2,
  CheckCircle2,
  Navigation,
  MapPin,
} from 'lucide-react';

const CITY_COORDINATES: Record<string, [number, number]> = {
  kolkata: [22.5726, 88.3639],
  patna: [25.5941, 85.1376],
  delhi: [28.6139, 77.2090],
  mumbai: [19.0760, 72.8777],
  bangalore: [12.9716, 77.5946],
  hyderabad: [17.3850, 78.4867],
  chennai: [13.0827, 80.2707],
  pune: [18.5204, 73.8567],
};

function ServicesContent() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const { categories, workers, selectServiceForBooking, selectWorkerForBooking, setDraft } =
    useBookingStore();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedWorkerModal, setSelectedWorkerModal] = useState<WorkerProfile | null>(null);

  // Dynamic user location for coverage map
  const [userCity, setUserCity] = useState('Kolkata');
  const [userCoords, setUserCoords] = useState<[number, number]>([22.5726, 88.3639]);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('shramnexus-customer-profile');
      if (savedProfile) {
        const p = JSON.parse(savedProfile);
        if (p.city) {
          setUserCity(p.city);
          const clean = p.city.trim().toLowerCase();
          if (CITY_COORDINATES[clean]) {
            setUserCoords(CITY_COORDINATES[clean]);
          }
        }
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
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const city = addr.city || addr.town || addr.municipality || addr.state_district || 'Local Area';
            setUserCity(city);
            setUserCoords([latitude, longitude]);
            toast.success(`Coverage centered on ${city}`);
          } else {
            setUserCoords([latitude, longitude]);
            toast.success('Coordinates centered on GPS');
          }
        } catch (e) {
          setUserCoords([latitude, longitude]);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        toast.error(`Location access: ${err.message}`);
      }
    );
  };

  // Filter categories
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.name_hi && cat.name_hi.includes(searchQuery));

    if (selectedTag === 'popular') return matchesSearch && cat.popular;
    if (selectedTag === 'emergency') return matchesSearch && cat.emergency_multiplier > 1;
    return matchesSearch;
  });

  const handleSelectCategory = async (cat: ServiceCategory) => {
    selectServiceForBooking(cat);
    const localAuth = typeof window !== 'undefined' ? (localStorage.getItem('shramnexus-auth') || localStorage.getItem('sharmnexus-auth')) : null;
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user && !localAuth) {
      toast.info(`Please sign in to book ${cat.name} service`);
      router.push(`/auth/login?redirect=${encodeURIComponent(`/booking/${cat.id}`)}`);
      return;
    }

    router.push(`/booking/${cat.id}`);
  };

  const handleBookWorker = async (worker: WorkerProfile) => {
    const cat =
      categories.find((c) => c.name.toLowerCase() === worker.primary_skill.toLowerCase()) ||
      categories[0];
    selectServiceForBooking(cat);
    selectWorkerForBooking(worker);
    setDraft({
      selectedWorkerId: worker.id,
      selectedWorker: worker,
    });

    const localAuth = typeof window !== 'undefined' ? (localStorage.getItem('shramnexus-auth') || localStorage.getItem('sharmnexus-auth')) : null;
    const { data: { session } } = await supabase.auth.getSession();
    const targetUrl = `/booking/${cat.id}?step=confirm&worker=${worker.id}`;

    if (!session?.user && !localAuth) {
      toast.info(`Please sign in to book ${worker.full_name}`);
      router.push(`/auth/login?redirect=${encodeURIComponent(targetUrl)}`);
      return;
    }

    router.push(targetUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50/60 pb-20 sm:pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#24172f] via-[#3d2b48] to-[#24172f] text-white pt-8 pb-12 px-4 sm:px-6 shadow-xs">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#24172f]/80 text-[#f5dfad] text-xs font-semibold px-3 py-1 rounded-full border border-[#e6aa3b]/30 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#e6aa3b]" />
                <span>Verified Cooperative Network</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold !text-white tracking-tight font-sans" style={{ color: '#ffffff' }}>
                Browse Available Services
              </h1>
              <p className="!text-[#c8bacb] text-xs sm:text-sm mt-1 max-w-xl font-sans" style={{ color: '#c8bacb' }}>
                Select a trade to schedule certified, background-verified craftsmen from local Labour Cooperative Societies.
              </p>
            </div>

            {/* View Mode Toggle: Grid | Map */}
            <div className="flex items-center bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20 self-start md:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-[#c8bacb] hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Categories</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-[#c8bacb] hover:text-white'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Coverage Map</span>
              </button>
            </div>
          </div>

          {/* Search & Tag Filter Strip */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by trade (e.g. Plumber, Electrician, Carpenter)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#e6aa3b] shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setSelectedTag('all')}
                className={`px-3 py-2 rounded-xl font-semibold transition-colors shrink-0 ${
                  selectedTag === 'all'
                    ? 'bg-[#e6aa3b] text-[#24172f] font-bold shadow-xs'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                All 10 Trades
              </button>
              <button
                type="button"
                onClick={() => setSelectedTag('popular')}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl font-semibold transition-colors shrink-0 ${
                  selectedTag === 'popular'
                    ? 'bg-white text-amber-700 font-bold shadow-xs'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-current" />
                Popular
              </button>
              <button
                type="button"
                onClick={() => setSelectedTag('emergency')}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl font-semibold transition-colors shrink-0 ${
                  selectedTag === 'emergency'
                    ? 'bg-white text-red-700 font-bold shadow-xs'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-red-400" />
                Emergency Ready
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 -mt-4">
        {viewMode === 'grid' ? (
          <div className="space-y-8">
            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredCategories.map((category) => (
                <ServiceCard
                  key={category.id}
                  category={category}
                  onSelect={handleSelectCategory}
                />
              ))}

              {filteredCategories.length === 0 && (
                <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-gray-200">
                  <p className="text-gray-500 text-sm">
                    No services matched &ldquo;{searchQuery}&rdquo;.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3 text-xs"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTag('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Emergency Callout */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-5 border border-red-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Need immediate emergency assistance?</h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Our 24/7 Cooperative Emergency SOS connects you with on-duty technicians within 15–25 mins.
                  </p>
                </div>
              </div>
              <Link
                href="/emergency"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs flex items-center shrink-0"
              >
                Go to Emergency SOS
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* Map View Mode */
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  Live Cooperative Service Coverage Map
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Showing verified workers in {userCity} Labour Society &amp; surrounding clusters
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="text-xs font-bold text-[#d96f4d] hover:text-[#b5583b] bg-[#fbf7ef] hover:bg-[#f5e9d4] px-3 py-1.5 rounded-xl border border-[#e6aa3b]/40 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#d96f4d]" />
                  <span>{isLocating ? 'Locating...' : 'My Location'}</span>
                </button>
                <span className="text-xs font-semibold text-[#d96f4d] bg-[#f5dfad]/30 px-3 py-1.5 rounded-xl border border-[#e6aa3b]/30">
                  {workers.length} Active Craftsmen
                </span>
              </div>
            </div>

            <div className="h-[450px] w-full rounded-xl overflow-hidden border border-gray-100">
              <MapView
                workers={workers}
                onSelectWorker={(w) => setSelectedWorkerModal(w)}
                center={userCoords}
                userLocation={userCoords}
                addressName={`${userCity} Central Cooperative Zone`}
                city={userCity}
                onLocationSelect={(coords, addr) => {
                  setUserCoords(coords);
                  if (addr) {
                    const parts = addr.split(',');
                    if (parts.length > 0) setUserCity(parts[0].trim());
                  }
                  toast.success('Centered map on selected point');
                }}
              />
            </div>

            {/* Quick List Below Map */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Click a pin on map or select below:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {workers.slice(0, 6).map((worker) => (
                  <div
                    key={worker.id}
                    onClick={() => setSelectedWorkerModal(worker)}
                    className="p-3 rounded-xl bg-gray-50 hover:bg-[#fbf7ef] border border-gray-200/80 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={worker.profile_photo_url}
                        alt={worker.full_name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <strong className="text-xs text-gray-900 block">{worker.full_name}</strong>
                        <span className="text-[11px] text-[#d96f4d] font-semibold">{worker.primary_skill}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-gray-600">
                      {worker.approx_distance_km.toFixed(1)} km
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Worker Profile Modal */}
      <WorkerProfileModal
        worker={selectedWorkerModal}
        isOpen={!!selectedWorkerModal}
        onClose={() => setSelectedWorkerModal(null)}
        onBook={handleBookWorker}
      />
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs text-gray-400">
          Loading services...
        </div>
      }
    >
      <ServicesContent />
    </Suspense>
  );
}
