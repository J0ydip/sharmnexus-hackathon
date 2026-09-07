'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store/bookingStore';
import { CheckCircle2, ArrowRight, ShieldCheck, MapPin, Sparkles, X, Clock, Calendar, Phone, User, Home } from 'lucide-react';
import { getBookingOtp } from '@/lib/utils';

export interface ServiceModalData {
  id: string;
  title: string;
  desc: string;
  img: string;
  wName: string;
  wAvatar: string;
  wRating: string;
  wExp: string;
  wPrice: string;
  wLoc: string;
  society: string;
}

export const LANDING_SERVICES: Record<string, ServiceModalData> = {
  plumbing: {
    id: 'plumbing',
    title: 'Plumbing Service',
    desc: 'Leak repairs, pipe installations, drain cleaning, and bathroom fittings by certified cooperative plumbers.',
    img: '/plumbing.jfif',
    wName: 'Raj Kumar',
    wAvatar: 'RK',
    wRating: '★ 4.8 (327 jobs)',
    wExp: '6 Years Experience',
    wPrice: '₹450 base',
    wLoc: '1.8 km away',
    society: 'Patna District Labour Society',
  },
  electrical: {
    id: 'electrical',
    title: 'Electrical Service',
    desc: 'Safe, certified wiring, switchboard repairs, short circuit resolution, and appliance installation.',
    img: '/electral.jfif',
    wName: 'Meena Devi',
    wAvatar: 'MD',
    wRating: '★ 4.9 (412 jobs)',
    wExp: '8 Years Experience',
    wPrice: '₹350 base',
    wLoc: '2.5 km away',
    society: 'Bihar Labour Cooperative Union',
  },
  cleaning: {
    id: 'cleaning',
    title: 'Home & Office Cleaning',
    desc: 'Deep kitchen scrubbing, sanitization, floor buffing, sofa washing, and complete household hygiene.',
    img: '/cleaning.jfif',
    wName: 'Sunita Sharma',
    wAvatar: 'SS',
    wRating: '★ 4.7 (280 jobs)',
    wExp: '4 Years Experience',
    wPrice: '₹600 base',
    wLoc: '3.2 km away',
    society: 'Patna Mahila Shramik Swavalambi',
  },
  caregiving: {
    id: 'caregiving',
    title: 'Elder & Patient Caregiving',
    desc: 'Compassionate assistance with daily mobility, medication schedules, companionship, and post-op care.',
    img: '/caregiving.jfif',
    wName: 'Pooja Verma',
    wAvatar: 'PV',
    wRating: '★ 4.9 (195 jobs)',
    wExp: '10 Years Experience',
    wPrice: '₹800/day',
    wLoc: '4.1 km away',
    society: 'Arogya Shramik Cooperative',
  },
  carpentry: {
    id: 'carpentry',
    title: 'Carpentry & Woodwork',
    desc: 'Custom furniture building, door lock repair, cabinet fixing, wooden polishing, and modular setups.',
    img: '/carpentry.jfif',
    wName: 'Rakesh Meena',
    wAvatar: 'RM',
    wRating: '★ 4.6 (210 jobs)',
    wExp: '12 Years Experience',
    wPrice: '₹500 base',
    wLoc: '1.5 km away',
    society: 'Vishwakarma Shramik Union',
  },
  driving: {
    id: 'driving',
    title: 'Chauffeur & Safe Transport',
    desc: 'Verified licensed private driving, intercity travel, event transport, and safe family commute.',
    img: '/driving.jfif',
    wName: 'Vikram Yadav',
    wAvatar: 'VY',
    wRating: '★ 4.8 (530 jobs)',
    wExp: '7 Years Experience',
    wPrice: '₹400/trip',
    wLoc: '0.8 km away',
    society: 'Sarathi Cooperative Transport',
  },
  gardening: {
    id: 'gardening',
    title: 'Gardening & Landscaping',
    desc: 'Lawn mowing, seasonal trimming, plant nourishment, terrace garden setup, and soil preparation.',
    img: '/gardening.jfif',
    wName: 'Neha Gupta',
    wAvatar: 'NG',
    wRating: '★ 4.7 (165 jobs)',
    wExp: '5 Years Experience',
    wPrice: '₹350 base',
    wLoc: '2.9 km away',
    society: 'Harit Kranti Labour Society',
  },
  technician: {
    id: 'technician',
    title: 'Appliance & Tech Repair',
    desc: 'Quick diagnostic troubleshooting for AC, refrigerator, washing machine, and home appliances.',
    img: '/technician.jfif',
    wName: 'Amit Singh',
    wAvatar: 'AS',
    wRating: '★ 4.8 (340 jobs)',
    wExp: '9 Years Experience',
    wPrice: '₹700 base',
    wLoc: '3.5 km away',
    society: 'Kaushal Vikas Technical Coop',
  },
};

interface LandingServiceModalProps {
  service: ServiceModalData | null;
  onClose: () => void;
}

export function LandingServiceModal({ service, onClose }: LandingServiceModalProps) {
  const router = useRouter();
  const { categories, workers, addBooking } = useBookingStore();

  const [step, setStep] = useState<'details' | 'form' | 'success'>('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [requirements, setRequirements] = useState('');
  const [confirmedBookingId, setConfirmedBookingId] = useState<string>('');
  const [otp, setOtp] = useState('4821');

  const handleClose = () => {
    setStep('details');
    onClose();
  };

  useEffect(() => {
    if (!service) return;

    // Add modal-open class to document body to restore normal cursor and suppress custom cursor dot
    document.body.classList.add('landing-modal-open');
    const wasCustomCursor = document.body.classList.contains('has-custom-cursor');
    if (wasCustomCursor) {
      document.body.classList.remove('has-custom-cursor');
    }
    const cursorDot = document.querySelector('.cursor-dot') as HTMLElement | null;
    if (cursorDot) {
      cursorDot.style.display = 'none';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('landing-modal-open');
      if (wasCustomCursor) {
        document.body.classList.add('has-custom-cursor');
      }
      if (cursorDot) {
        cursorDot.style.display = '';
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [service]);

  if (!service) return null;

  const handleProceedToForm = () => {
    setStep('form');
  };

  const handleBackToDetails = () => {
    setStep('details');
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();

    const bookingId = `SNX-${Math.floor(1000 + Math.random() * 9000)}`;
    const bookingOtp = getBookingOtp(bookingId);
    setConfirmedBookingId(bookingId);
    setOtp(bookingOtp);

    // Also persist in Zustand store if matching category exists
    const matchedCategory = categories.find((c) =>
      c.name.toLowerCase().includes(service.id.toLowerCase())
    ) || categories[0];

    const matchedWorker = workers.find((w) =>
      w.full_name.toLowerCase().includes(service.wName.toLowerCase())
    ) || workers[0];

    const numericPrice = parseInt(service.wPrice.replace(/[^0-9]/g, ''), 10) || 450;

    addBooking({
      id: bookingId,
      customer_id: 'guest_customer_landing',
      customer_name: name || 'Guest Customer',
      customer_phone: phone || '+91 98765 43210',
      worker_id: matchedWorker?.id || 'w_raj_kumar',
      worker: matchedWorker,
      service_category_id: matchedCategory?.id || 'cat-plumber',
      service_name: service.title,
      service_icon: matchedCategory?.icon_url || 'Wrench',
      booking_type: 'scheduled',
      status: 'assigned',
      urgency: 'normal',
      description: requirements || `${service.title} booking from landing page`,
      address: address || 'Cooperative Enclave',
      city: 'Kolkata',
      lat: 22.5726,
      lng: 88.3639,
      scheduled_at: `${date} ${time}`,
      time_slot: time,
      estimated_price: numericPrice,
      final_price: numericPrice,
      otp: bookingOtp,
      payment_status: 'pending',
      payment_method: 'Pay after service (Cash / UPI)',
      created_at: new Date().toISOString(),
    });

    // Save to localStorage for quick compatibility with teammate scripts
    try {
      const stored = JSON.parse(localStorage.getItem('shramnexus-bookings') || localStorage.getItem('sharmnexus-bookings') || '[]');
      stored.push({
        id: bookingId,
        service: service.title,
        worker: service.wName,
        name,
        phone,
        address,
        date,
        time,
        requirements,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('shramnexus-bookings', JSON.stringify(stored));
      localStorage.setItem('sharmnexus-bookings', JSON.stringify(stored));
    } catch (err) {
      // ignore localstorage errors
    }

    setStep('success');
  };

  return (
    <div
      className="landing-service-modal fixed inset-0 z-[99999] bg-[#24172f]/70 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-in fade-in duration-200 cursor-default"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-[#fbf7ef] w-full max-w-[540px] rounded-3xl p-6 sm:p-8 relative shadow-2xl border border-[#e6dcd0] max-h-[92vh] overflow-y-auto cursor-default">
        {/* Close Button */}
        <button
          onClick={handleClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-[#24172f] font-bold flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ================= STEP 1: SERVICE & WORKER DETAILS ================= */}
        {step === 'details' && (
          <div>
            <div className="mb-5">
              <div className="w-full h-44 rounded-2xl overflow-hidden mb-4 border border-[#e6dcd0] shadow-xs">
                <img
                  src={service.img}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#24172f] text-white px-2.5 py-0.5 rounded-full">
                  Cooperative Certified
                </span>
                <span className="text-[11px] font-semibold text-[#d96f4d] flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {service.wLoc}
                </span>
              </div>
              <h2 className="text-2xl font-black text-[#24172f] tracking-tight">
                {service.title}
              </h2>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {service.desc}
              </p>
            </div>

            {/* Assigned Worker Profile Card */}
            <div className="bg-white p-4 rounded-2xl border border-[#e6dcd0] shadow-xs mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Allocated Cooperative Professional
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#7c5cf0] bg-[#7c5cf0]/10 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Member
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#24172f] text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                  {service.wAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-base text-[#24172f] leading-tight truncate">
                    {service.wName}
                  </h4>
                  <p className="text-xs text-[#e6aa3b] font-bold mt-0.5">
                    {service.wRating}
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {service.wExp} • {service.society}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-gray-400 block font-medium">Fair Rate</span>
                  <strong className="text-base font-black text-[#d96f4d] block">
                    {service.wPrice}
                  </strong>
                </div>
              </div>
            </div>

            <button
              onClick={handleProceedToForm}
              type="button"
              className="w-full bg-[#e6aa3b] hover:bg-[#d69828] text-[#24172f] font-black text-sm py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] cursor-pointer"
            >
              <span>Proceed to Booking</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================= STEP 2: BOOKING FORM ================= */}
        {step === 'form' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <button
                  type="button"
                  onClick={handleBackToDetails}
                  className="text-xs font-bold text-[#d96f4d] hover:underline flex items-center gap-1 mb-1 cursor-pointer"
                >
                  ← Back to details
                </button>
                <h2 className="text-2xl font-black text-[#24172f] tracking-tight">
                  Book {service.title}
                </h2>
              </div>
              <span className="text-xs font-bold bg-[#fbf7ef] border border-[#e6aa3b]/40 text-[#24172f] px-2.5 py-1 rounded-xl">
                {service.wName}
              </span>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#24172f] mb-1">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sen"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#e6dcd0] rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#d96f4d] cursor-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24172f] mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#e6dcd0] rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#d96f4d] cursor-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24172f] mb-1">
                  Service Address / Location
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 4B, Park Street, Kolkata"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#e6dcd0] rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#d96f4d] cursor-text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#24172f] mb-1">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-2 py-2 bg-white border border-[#e6dcd0] rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#d96f4d] cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#24172f] mb-1">
                    Preferred Time
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-9 pr-2 py-2 bg-white border border-[#e6dcd0] rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#d96f4d] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#24172f] mb-1">
                  Describe what you need fixed
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Kitchen tap has low pressure and leakage under the sink..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#e6dcd0] rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#d96f4d] cursor-text"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#24172f] hover:bg-[#1a1024] text-white font-black text-sm py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#e6aa3b]" />
                  <span>Confirm Cooperative Booking</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= STEP 3: SUCCESS CELEBRATION ================= */}
        {step === 'success' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-[#f0e7d9] text-[#e6aa3b] flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-[#24172f] bg-[#f0e7d9] px-3 py-1 rounded-full border border-[#e6dcd0]">
              Cooperative Dispatch Confirmed
            </span>

            <h2 className="text-2xl font-black text-[#24172f] mt-2 tracking-tight">
              Booking Confirmed!
            </h2>
            <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
              Your request for <strong>{service.title}</strong> has been received. <strong>{service.wName}</strong> has been notified.
            </p>

            {/* Slip Summary Box */}
            <div className="bg-white p-4 rounded-2xl border border-[#e6dcd0] shadow-xs my-5 text-left text-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Booking ID</span>
                <strong className="text-[#24172f] font-mono font-bold text-sm">{confirmedBookingId}</strong>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Security Start OTP</span>
                <span className="bg-[#fbf7ef] text-[#d96f4d] font-mono font-black px-2 py-0.5 rounded border border-[#e6aa3b]/40">
                  {otp}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Professional</span>
                <strong className="text-gray-900">{service.wName} ({service.wExp})</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-medium">Schedule</span>
                <strong className="text-gray-900">{date} at {time}</strong>
              </div>
            </div>

            <div className="space-y-2.5">
              <Link
                href={`/track/${confirmedBookingId}`}
                className="w-full bg-[#24172f] hover:bg-[#1a1024] text-white font-bold text-xs py-3 px-5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <span>Track Status & Live Map</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#e6aa3b]" />
              </Link>

              <button
                type="button"
                onClick={handleClose}
                className="w-full bg-transparent hover:bg-black/5 text-gray-600 font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Back to ShramNexus Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
