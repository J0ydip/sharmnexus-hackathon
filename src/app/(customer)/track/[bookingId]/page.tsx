'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store/bookingStore';
import { BookingStatusBadge } from '@/components/customer/BookingStatusBadge';
import { ServiceCategoryIcon } from '@/components/customer/ServiceCategoryIcon';
import { MapView } from '@/components/customer/MapView';
import { StarRating } from '@/components/customer/StarRating';
import { Button } from '@/components/ui/button';
import { Booking } from '@/lib/data/mockData';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Receipt,
  Play,
  Check,
  AlertCircle,
  Truck,
  Wrench,
  Award,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default function BookingTrackingPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const bookingId = resolvedParams.bookingId;
  const router = useRouter();

  const { bookings, updateBookingStatus, getBookingById, workers } = useBookingStore();

  const booking =
    getBookingById(bookingId) ||
    bookings.find((b) => b.id.toLowerCase() === bookingId.toLowerCase()) ||
    bookings[0];

  const worker =
    booking?.worker ||
    workers.find((w) => w.id === booking?.worker_id) ||
    workers[0];

  // SIH 26089 Status Timeline Progression
  const TIMELINE_STEPS = [
    {
      key: 'requested',
      title: '1. Requested',
      desc: 'Service request broadcasted to cooperative society network.',
      icon: Clock,
      dbStatus: 'requested',
    },
    {
      key: 'assigned',
      title: '2. Assigned',
      desc: `Allocated to verified worker ${worker.full_name} by ${worker.society_name}.`,
      icon: Building2,
      dbStatus: 'assigned',
    },
    {
      key: 'accepted',
      title: '3. Accepted',
      desc: 'Worker verified availability and confirmed appointment.',
      icon: CheckCircle2,
      dbStatus: 'accepted',
    },
    {
      key: 'in_progress',
      title: '4. On the Way / Started',
      desc: 'Worker is dispatched to your service address.',
      icon: Truck,
      dbStatus: 'in_progress',
    },
    {
      key: 'completed',
      title: '5. Work Completed',
      desc: 'Task finished, inspected, and verified via OTP code.',
      icon: Sparkles,
      dbStatus: 'completed',
    },
  ];

  // Helper to determine active step index
  const getStepIndex = (status: Booking['status']) => {
    switch (status) {
      case 'requested':
        return 0;
      case 'assigned':
        return 1;
      case 'accepted':
        return 2;
      case 'in_progress':
        return 3;
      case 'completed':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(booking.status);

  // Prototype Live Demo Status Simulator
  const handleSimulateNextStatus = () => {
    const nextStatuses: Booking['status'][] = [
      'assigned',
      'accepted',
      'in_progress',
      'completed',
    ];
    const currentIndex = nextStatuses.indexOf(booking.status);
    const nextStatus = nextStatuses[currentIndex + 1] || 'completed';

    updateBookingStatus(booking.id, nextStatus);
    toast.success(`Demo status advanced to "${nextStatus.toUpperCase()}"!`);
  };

  const handleCallWorker = () => {
    toast.info(`Calling verified cooperative worker: ${worker.phone}`);
  };

  const handleChatWorker = () => {
    toast.info(`Connecting to secure cooperative messenger with ${worker.full_name}`);
  };

  return (
    <div className="min-h-screen bg-gray-50/70 pb-20 sm:pb-12">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200/90 py-4 px-4 sm:px-6 sticky top-16 z-40">
        <div className="container mx-auto max-w-5xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/history"
              className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-gray-900">
                  Track Service #{booking.id}
                </h1>
                <BookingStatusBadge status={booking.status} size="sm" />
              </div>
              <span className="text-[11px] text-gray-500 block">
                {booking.service_name} • Scheduled for {booking.scheduled_at}
              </span>
            </div>
          </div>

          {/* Prototype Demo Simulator Button */}
          {booking.status !== 'completed' && booking.status !== 'cancelled' && (
            <Button
              type="button"
              size="sm"
              onClick={handleSimulateNextStatus}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8 px-3 rounded-xl shadow-xs flex items-center gap-1.5 animate-pulse"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Simulate Next Status</span>
              <span className="sm:hidden">Next</span>
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 pt-6 space-y-6">
        {/* OTP Security Verification Strip */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                Cooperative Work Verification Code
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                Share this OTP with the worker only upon arrival
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Protects you from unverified dispatch and unlocks service guarantee.
              </p>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-2xl text-center self-start sm:self-auto shrink-0 border border-white/20">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">
              Security OTP
            </span>
            <span className="font-mono text-2xl font-black tracking-widest text-white">
              {booking.otp || '4829'}
            </span>
          </div>
        </div>

        {/* 2-Column Grid: Left (Timeline + Map), Right (Worker Card + Invoice) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Timeline & Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Service Lifecycle Timeline
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  SIH 26089 Workflow
                </span>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {TIMELINE_STEPS.map((stepItem, idx) => {
                  const isDone = currentStepIdx >= idx;
                  const isCurrent = currentStepIdx === idx;
                  const Icon = stepItem.icon;

                  return (
                    <div key={stepItem.key} className="relative flex items-start gap-3.5">
                      {/* Step Dot */}
                      <div
                        className={`absolute -left-6 top-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-gray-100 text-gray-400 border border-gray-300'
                        }`}
                      >
                        {isDone ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <span className="text-[10px] font-bold">{idx + 1}</span>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-bold ${
                              isCurrent
                                ? 'text-emerald-700'
                                : isDone
                                ? 'text-gray-900'
                                : 'text-gray-400'
                            }`}
                          >
                            {stepItem.title}
                          </h4>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full animate-pulse">
                              Active Stage
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          {stepItem.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prototype Map Visualization */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Service Route &amp; Dispatch Area
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {worker.society_name} dispatch cluster to {booking.address}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700">
                  ~{worker.approx_distance_km.toFixed(1)} km away
                </span>
              </div>

              <div className="h-[320px] w-full rounded-xl overflow-hidden border border-gray-100">
                <MapView
                  workers={[worker]}
                  center={[worker.lat || 25.5941, worker.lng || 85.1376]}
                  userLocation={[booking.lat || 25.594, booking.lng || 85.138]}
                  addressName={booking.address}
                />
              </div>
            </div>
          </div>

          {/* Right Col: Worker Contact Card & Digital Receipt */}
          <div className="space-y-6">
            {/* Worker Contact Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={worker.profile_photo_url}
                  alt={worker.full_name}
                  className="w-14 h-14 rounded-2xl object-cover border border-emerald-200 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-gray-900 text-base">{worker.full_name}</h3>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                      ✓ Verified
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 block mt-0.5">
                    {worker.primary_skill} ({worker.years_experience} yrs exp)
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                    <Building2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate max-w-[150px]">{worker.society_name}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs py-2 px-3 bg-gray-50 rounded-xl border border-gray-100">
                <StarRating rating={worker.avg_rating} size="sm" showNumber={true} />
                <span className="text-gray-500 font-medium">
                  {worker.total_jobs_completed} jobs completed
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCallWorker}
                  className="text-xs font-semibold h-9 rounded-xl border-gray-200 flex items-center justify-center gap-1.5 hover:bg-gray-50"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  Call Worker
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleChatWorker}
                  className="text-xs font-semibold h-9 rounded-xl border-gray-200 flex items-center justify-center gap-1.5 hover:bg-gray-50"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  Message
                </Button>
              </div>
            </div>

            {/* Digital Invoice / Transparent Price Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  Cooperative Receipt
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {booking.payment_status === 'completed' ? 'Paid' : 'Pay After Work'}
                </span>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3 text-gray-600">
                <div className="flex justify-between">
                  <span>Base Labor Fee</span>
                  <span className="font-semibold text-gray-800">
                    ₹{booking.final_price || booking.estimated_price}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Worker Welfare Guarantee</span>
                  <span className="text-emerald-600 font-medium">Included (100%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span className="font-medium text-gray-800">
                    {booking.payment_method || 'Cash / UPI'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-baseline justify-between text-gray-900 font-bold">
                <span className="text-xs">Total Amount</span>
                <span className="text-xl font-black text-emerald-700">
                  ₹{booking.final_price || booking.estimated_price}
                </span>
              </div>
            </div>

            {/* Safety & Help Note */}
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/60 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                Need Assistance with this Booking?
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Contact your society helpline at <strong>+91 11 2345 6789</strong> for immediate support or dispute resolution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
