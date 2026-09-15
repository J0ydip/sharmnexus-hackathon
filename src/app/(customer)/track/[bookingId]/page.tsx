'use client';

import React, { useState, useEffect, use } from 'react';
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
import { updateBookingStatus as updateBookingStatusAction } from '@/app/actions/worker-jobs';
import { getBookingById as getBookingByIdAction, submitRating } from '@/app/actions/bookings';
import { RazorpayPaymentButton } from '@/components/customer/RazorpayPaymentButton';
import { recordCashPayment as recordCashPaymentAction } from '@/app/actions/payments';
import { CooperativeReceiptModal } from '@/components/customer/CooperativeReceiptModal';
import { CancelBookingModal } from '@/components/customer/CancelBookingModal';
import { getBookingOtp } from '@/lib/utils';
import { ServiceQRCode } from '@/components/common/ServiceQRCode';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowLeft,
  ArrowRight,
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
  Star,
  XCircle,
  Copy,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default function BookingTrackingPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const bookingId = resolvedParams.bookingId;
  const router = useRouter();

  const { bookings, updateBookingStatus, setBookingPaymentStatus, getBookingById, workers } = useBookingStore();
  const [mounted, setMounted] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [dbBooking, setDbBooking] = useState<Booking | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingReviewText, setRatingReviewText] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isOtpCopied, setIsOtpCopied] = useState(false);

  const handleCopyOtp = (pin: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(pin);
      setIsOtpCopied(true);
      toast.success(`Verification PIN ${pin} copied to clipboard!`);
      setTimeout(() => setIsOtpCopied(false), 2500);
    }
  };

  useEffect(() => {
    setMounted(true);
    let isMounted = true;

    async function loadDb() {
      try {
        const b = await getBookingByIdAction(bookingId);
        if (b && isMounted) {
          const hasPaid = Boolean(b.payments && b.payments.some((p: any) => p.status === 'completed' && p.method !== 'pin_verified' && p.method !== 'pay_after_work'));
          const latestPayment = b.payments && b.payments.length > 0 ? b.payments.find((p: any) => p.status === 'completed' && p.method !== 'pin_verified') || b.payments[0] : null;
          const userRating = (b.ratings && b.ratings.length > 0) ? b.ratings[0] : null;
          setDbBooking({
            id: b.id,
            customer_id: b.customer_id,
            customer_name: b.customers?.full_name || 'Customer',
            customer_phone: b.customers?.phone || '',
            worker_id: b.worker_id || 'unassigned',
            worker: b.worker ? {
              id: b.worker.id,
              full_name: b.worker.full_name,
              phone: b.worker.phone || '',
              society_name: b.worker.society?.name || 'Cooperative Society',
              profile_photo_url: b.worker.profile_photo_url || '',
              profession: b.service?.name || 'Service Professional',
              primary_skill: b.service?.name || 'Service Professional',
              avg_rating: b.worker.avg_rating || 4.8,
              approx_distance_km: 2.5,
              hourly_rate: 300,
              is_verified: true,
              verification_status: 'verified',
              cooperative_member_id: `MEM-${(b.worker.id || '').substring(0, 4).toUpperCase()}`,
              total_jobs_completed: b.worker.total_jobs_completed || 12,
              skills: [b.service?.name || 'General'],
              badges: ['Verified'],
              availability: 'Immediate (within 45 mins)',
              experience_years: 4,
              years_experience: 4,
              rating_count: 15,
            } : (workers[0] || ({} as any)),
            service_category_id: b.service_category_id || '',
            service_name: b.service?.name || 'Service',
            service_icon: b.service?.icon_url || 'Droplet',
            booking_type: b.booking_type || 'scheduled',
            status: b.status || 'requested',
            urgency: 'normal',
            description: b.description || '',
            address: b.address || '',
            city: b.city || 'Kolkata',
            lat: b.latitude || 22.5726,
            lng: b.longitude || 88.3639,
            scheduled_at: b.scheduled_at ? new Date(b.scheduled_at).toLocaleString() : 'Scheduled',
            time_slot: 'Scheduled',
            estimated_price: b.estimated_price || 350,
            final_price: b.final_price || b.estimated_price || 350,
            otp: getBookingOtp(b.id),
            rating: userRating?.score,
            review: userRating?.review,
            payment_status: hasPaid ? 'completed' : 'pending',
            payment_method: hasPaid
              ? (latestPayment?.method ? (latestPayment.method === 'cash' ? 'Cash Handover to Worker' : `Online (${latestPayment.method.toUpperCase()})`) : 'Online Razorpay / UPI')
              : (b.payment_method || 'Pay after service (Pending)'),
            created_at: b.created_at,
          } as any);

          if (b.status) {
            useBookingStore.getState().updateBookingStatus(b.id, b.status as any);
          }
        }
      } catch (err) {
        console.warn('Could not fetch Supabase booking:', err);
      }
    }

    loadDb();
    const interval = setInterval(loadDb, 2500);

    const supabase = createClient();
    const channel = supabase
      .channel(`booking-live-${bookingId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings', filter: `id=eq.${bookingId}` },
        () => {
          loadDb();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [bookingId, workers]);

  const booking =
    dbBooking ||
    getBookingById(bookingId) ||
    bookings.find((b) => b.id.toLowerCase() === bookingId.toLowerCase());

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

  const currentStepIdx = booking ? getStepIndex(booking.status) : 0;

  // Prototype Live Demo Status Simulator
  const handleSimulateNextStatus = async () => {
    if (!booking) return;
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

    // Sync status change to Supabase if it exists in backend
    try {
      await updateBookingStatusAction(booking.id, nextStatus);
    } catch (e) {
      // Graceful fallback for mock local IDs
    }
  };

  const handleCallWorker = () => {
    if (worker?.phone) {
      toast.info(`Calling verified cooperative worker: ${worker.phone}`);
    }
  };

  const handleChatWorker = () => {
    if (worker?.full_name) {
      toast.info(`Connecting to secure cooperative messenger with ${worker.full_name}`);
    }
  };

  const handleMarkCashPaid = async () => {
    try {
      const amount = booking?.final_price || booking?.estimated_price || 450;
      const res = await recordCashPaymentAction(bookingId, amount);
      if (res?.error) {
        toast.error(`Could not record cash payment: ${res.error}`);
        return;
      }
      if (dbBooking) {
        setDbBooking({
          ...dbBooking,
          payment_status: 'completed',
          payment_method: 'Cash Handover to Worker',
        });
      }
      setBookingPaymentStatus(bookingId, 'completed', 'Cash Handover to Worker');
      setIsReceiptOpen(true);
      toast.success('💵 Cash payment recorded! Official cooperative receipt generated.');
    } catch (e: any) {
      toast.error('Could not record cash payment: ' + (e?.message || 'Error'));
    }
  };

  const handleConfirmCancel = async () => {
    if (!booking) return;
    setIsCancelling(true);
    try {
      if (dbBooking) {
        setDbBooking({ ...dbBooking, status: 'cancelled' });
      }
      updateBookingStatus(booking.id, 'cancelled');
      await updateBookingStatusAction(booking.id, 'cancelled');
      toast.info('Booking has been cancelled.');
    } catch (err: any) {
      console.warn('Error cancelling booking:', err);
      toast.error(err?.message || 'Could not cancel booking');
    } finally {
      setIsCancelling(false);
      setIsCancelModalOpen(false);
    }
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    setIsSubmittingRating(true);
    try {
      await submitRating({
        bookingId: booking.id,
        workerId: booking.worker_id,
        score: ratingStars,
        review: ratingReviewText,
      });
      if (dbBooking) {
        setDbBooking({
          ...dbBooking,
          rating: ratingStars,
          review: ratingReviewText,
        });
      }
      toast.success('Thank you! Your verified rating was submitted to the cooperative.');
    } catch (err: any) {
      toast.error('Could not submit rating: ' + (err?.message || 'Error'));
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50/70 pb-20 sm:pb-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#24172f] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-500 font-medium">Loading tracking status...</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#fbf7ef] flex items-center justify-center p-4">
        <div className="bg-white border border-[#e6dcd0] rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <Clock className="w-12 h-12 text-gray-400 mx-auto" />
          <h2 className="text-lg font-bold text-[#24172f]">Booking Not Found</h2>
          <p className="text-xs text-gray-500">
            We couldn't locate booking <span className="font-mono font-bold text-gray-700">#{bookingId}</span>. It may have been completed, cancelled, or placed from another account.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/history"
              className="bg-[#24172f] hover:bg-[#3d2b48] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs"
            >
              View My Bookings
            </Link>
            <Link
              href="/services"
              className="bg-[#e6aa3b] hover:bg-[#d96f4d] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs"
            >
              Book a Service
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/70 pb-20 sm:pb-12">
      {/* Top Header - Senior UI/UX Engineered */}
      <div className="bg-white border-b border-gray-200/80 shadow-xs">
        <div className="container mx-auto max-w-5xl px-3 sm:px-6 py-3">
          {/* Main Top Row: Back button, Title & Clear ID on left, Status Badge on right */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Link
                href="/history"
                className="p-2 -ml-1 rounded-xl text-gray-600 hover:text-[#24172f] hover:bg-gray-100 active:bg-gray-200 transition-colors shrink-0"
                title="Back to Bookings"
                aria-label="Back to Bookings"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-extrabold text-[#24172f] tracking-tight whitespace-nowrap">
                    Track Service
                  </h1>
                  <span className="font-mono text-xs font-bold text-amber-900 bg-[#f5dfad]/60 border border-[#e6aa3b]/40 px-2 py-0.5 rounded-md shrink-0">
                    #{booking.id.length > 8 ? booking.id.slice(0, 8) : booking.id}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5 truncate" suppressHydrationWarning>
                  <span className="font-semibold text-gray-800">{booking.service_name}</span>
                  <span className="mx-1 text-gray-300">•</span>
                  <span>Scheduled {booking.scheduled_at}</span>
                </p>
              </div>
            </div>

            {/* Right: Prominent Status Badge */}
            <div className="shrink-0 flex items-center gap-2">
              <BookingStatusBadge status={booking.status} size="sm" />
            </div>
          </div>

          {/* Action Row for Active Bookings: Cleanly separated with zero clustering */}
          {booking.status !== 'completed' && booking.status !== 'cancelled' && (
            <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 active:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200 transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel Booking</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateNextStatus}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f5dfad] bg-[#24172f] hover:bg-[#3d2b48] active:scale-95 px-3.5 py-1.5 rounded-xl border border-[#e6aa3b]/30 shadow-xs transition-all cursor-pointer"
                title="Prototype simulator"
              >
                <Play className="w-3 h-3 text-[#e6aa3b] fill-current" />
                <span>Simulate Next Step</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-3 sm:px-6 pt-3 sm:pt-4 space-y-4 sm:space-y-6">
        {/* OTP Security Verification Strip / Rejection Alert / Completed Verification */}
        {booking.status === 'cancelled' ? (
          <div className="bg-gradient-to-br from-[#2b1111] via-[#3d1616] to-[#200c0c] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-md border border-red-500/30 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-300 flex items-center justify-center shrink-0 border border-red-500/30">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-300">
                      Request Declined by Tradesperson
                    </span>
                    <span className="text-[9px] font-bold bg-red-950/80 text-red-200 px-2 py-0.5 rounded-full border border-red-500/30">
                      CANCELLED
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                    Tradesperson was unavailable for this booking
                  </h3>
                  <p className="text-[11px] text-red-200/90 mt-0.5 max-w-xl leading-relaxed">
                    The cooperative tradesperson declined this request. <strong className="text-white">No payment was deducted.</strong> You can request another verified artisan immediately.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-red-500/20">
                <Link
                  href="/services"
                  className="bg-[#e6aa3b] hover:bg-[#d96f4d] text-[#24172f] hover:text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <span>Find Artisan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/history"
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-white/20 transition-all text-center"
                >
                  Bookings
                </Link>
              </div>
            </div>
          </div>
        ) : booking.status === 'completed' ? (
          <div className="bg-gradient-to-br from-[#24172f] via-[#331f42] to-[#1c1225] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-md border border-[#e6aa3b]/30 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#e6aa3b]">
                      Service Completed &amp; Verified
                    </span>
                    <span className="text-[9px] font-bold bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      WARRANTY ACTIVE
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                    Job verified via Customer Security PIN
                  </h3>
                  <p className="text-[11px] text-[#c8bacb] mt-0.5 leading-relaxed max-w-lg">
                    30-day cooperative workmanship warranty and escrow payout are active.
                  </p>
                </div>
              </div>

              {/* Verified PIN badge and QR Code */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-2 sm:p-2.5 rounded-2xl">
                <div className="flex items-center justify-between gap-2 px-3 py-1 bg-white/10 rounded-xl border border-[#e6aa3b]/30">
                  <div className="text-left">
                    <span className="text-[8px] uppercase font-bold text-[#f5dfad] block">
                      Verified PIN
                    </span>
                    <span className="font-mono text-lg sm:text-xl font-black tracking-widest text-[#f5dfad]" suppressHydrationWarning>
                      {getBookingOtp(booking.id, booking.otp)}
                    </span>
                  </div>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </div>
                <ServiceQRCode
                  bookingId={booking.id}
                  serviceTitle={booking.service_name || 'Cooperative Service'}
                  workerName={booking.worker?.full_name}
                  customerName={booking.customer_name}
                  otp={getBookingOtp(booking.id, booking.otp)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all shadow-xs cursor-pointer"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Active Ongoing Booking OTP Card */
          <div className="bg-gradient-to-br from-[#24172f] via-[#2f1f3d] to-[#1c1225] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-md border border-[#e6aa3b]/30 relative overflow-hidden">
            {/* Subtle background luxury glow */}
            <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-[#e6aa3b]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              {/* Left Info Column */}
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/10 border border-[#e6aa3b]/30 flex items-center justify-center shrink-0 text-[#f5dfad] shadow-inner mt-0.5">
                  <ShieldCheck className="w-5 h-5 text-[#e6aa3b]" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#f5dfad] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                      Doorstep Security PIN
                    </span>
                    <span className="text-[10px] text-[#c8bacb] bg-black/30 px-2 py-0.5 rounded-full border border-white/5">
                      Share at job end
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                    Share PIN only when physical work is completed
                  </h3>
                  <p className="text-xs text-[#c8bacb] max-w-xl leading-relaxed">
                    Worker enters this PIN on their dashboard to release verified cooperative wages.
                  </p>
                </div>
              </div>

              {/* Right OTP Action Card */}
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-white/10 flex flex-col items-center sm:items-end gap-2.5 w-full sm:w-auto shrink-0">
                <div className="w-full flex items-center justify-between gap-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c8bacb]">
                    Completion OTP
                  </span>
                  <span className="text-[10px] text-amber-300/90 font-medium">
                    Escrow Protected
                  </span>
                </div>

                {/* 4 Digit Boxes */}
                <div className="flex items-center justify-center gap-2 w-full">
                  {getBookingOtp(booking.id, booking.otp).split('').map((digit, idx) => (
                    <div
                      key={idx}
                      className="w-10 h-11 sm:w-11 sm:h-12 rounded-xl bg-white/15 border border-[#e6aa3b]/40 backdrop-blur-md flex items-center justify-center font-mono text-2xl font-black text-[#f5dfad] shadow-inner select-all"
                      suppressHydrationWarning
                    >
                      {digit}
                    </div>
                  ))}
                </div>

                {/* Action Buttons: Copy PIN + Show QR */}
                <div className="grid grid-cols-2 gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => handleCopyOtp(getBookingOtp(booking.id, booking.otp))}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/15 transition-all shadow-xs cursor-pointer"
                    title="Copy 4-digit PIN"
                  >
                    {isOtpCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#f5dfad]" />
                        <span>Copy PIN</span>
                      </>
                    )}
                  </button>

                  <ServiceQRCode
                    bookingId={booking.id}
                    serviceTitle={booking.service_name || 'Cooperative Service'}
                    workerName={booking.worker?.full_name}
                    customerName={booking.customer_name}
                    otp={getBookingOtp(booking.id, booking.otp)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/15 transition-all shadow-xs cursor-pointer w-full"
                    buttonText="Show QR"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

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
                <span className="text-[11px] font-semibold text-[#d96f4d] bg-[#f5dfad]/30 px-2 py-0.5 rounded-md border border-[#e6aa3b]/30">
                  SIH 26089 Workflow
                </span>
              </div>

              {booking.status === 'cancelled' && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <div>
                    <strong className="font-bold block text-red-900">Service Discontinued</strong>
                    This service request was declined by the tradesperson. Dispatch and execution have been concluded.
                  </div>
                </div>
              )}

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
                            ? 'bg-[#8ba58b] text-white shadow-xs'
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
                                ? 'text-[#d96f4d]'
                                : isDone
                                ? 'text-gray-900'
                                : 'text-gray-400'
                            }`}
                          >
                            {stepItem.title}
                          </h4>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#24172f] bg-[#f5dfad] px-2 py-0.5 rounded-full animate-pulse">
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
                <span className="text-xs font-bold text-[#d96f4d]">
                  ~{worker.approx_distance_km.toFixed(1)} km away
                </span>
              </div>

              <div className="h-[320px] w-full rounded-xl overflow-hidden border border-gray-100 relative isolate z-0">
                <MapView
                  workers={[worker]}
                  center={[booking.lat || worker.lat || 22.5726, booking.lng || worker.lng || 88.3639]}
                  userLocation={[booking.lat || 22.5726, booking.lng || 88.3639]}
                  addressName={booking.address}
                  city={booking.city}
                />
              </div>
            </div>
          </div>

          {/* Right Col: Worker Contact Card & Digital Receipt */}
          <div className="space-y-6">
            {/* Worker Contact Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                {worker.profile_photo_url && worker.profile_photo_url.trim() ? (
                  <img
                    src={worker.profile_photo_url}
                    alt={worker.full_name || 'Worker'}
                    className="w-14 h-14 rounded-2xl object-cover border border-[#e6dcd0] shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#24172f] to-[#b85435] text-white font-bold text-xl flex items-center justify-center border border-[#e6dcd0] shadow-xs shrink-0">
                    {worker.full_name?.charAt(0)?.toUpperCase() || 'W'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-gray-900 text-base">{worker.full_name}</h3>
                    <span className="text-[10px] font-bold text-[#8ba58b] bg-[#e2eee4] px-1.5 py-0.2 rounded">
                      ✓ Verified
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#d96f4d] block mt-0.5">
                    {(worker as any).primary_skill || (worker as any).profession || 'Service Professional'} ({(worker as any).years_experience || (worker as any).experience_years || 4} yrs exp)
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                    <Building2 className="w-3 h-3 text-[#d96f4d] shrink-0" />
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
                  <Phone className="w-3.5 h-3.5 text-[#e6aa3b]" />
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

            {/* Verified Rating Display */}
            {booking.status === 'completed' && (booking.rating || (dbBooking as any)?.ratings?.[0]) && (
              <div className="bg-amber-50/90 p-4 rounded-2xl border border-amber-200 text-xs space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5 text-sm">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                    Your Rating: {booking.rating || (dbBooking as any)?.ratings?.[0]?.score} / 5 Stars
                  </span>
                  <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
                {(booking.review || (dbBooking as any)?.ratings?.[0]?.review) && (
                  <p className="text-gray-700 text-xs italic mt-1">&ldquo;{booking.review || (dbBooking as any)?.ratings?.[0]?.review}&rdquo;</p>
                )}
              </div>
            )}

            {/* Rating & Review Form (if completed and not rated yet) */}
            {booking.status === 'completed' && !booking.rating && !(dbBooking as any)?.ratings?.[0] && (
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-[#e6aa3b] fill-current" />
                    Rate Worker Service
                  </h3>
                  <span className="text-[10px] text-gray-400">Cooperative Review</span>
                </div>
                <form onSubmit={handleRatingSubmit} className="space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRatingStars(s)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${s <= ratingStars ? 'text-[#e6aa3b] fill-current' : 'text-gray-300'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-gray-700 ml-2">{ratingStars} / 5 Stars</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Leave verified feedback for cooperative..."
                    value={ratingReviewText}
                    onChange={(e) => setRatingReviewText(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#e6aa3b]"
                  />
                  <Button
                    type="submit"
                    disabled={isSubmittingRating}
                    className="w-full bg-[#e6aa3b] hover:bg-[#d96f4d] text-white font-bold text-xs h-8 rounded-xl cursor-pointer"
                  >
                    {isSubmittingRating ? 'Submitting Rating...' : 'Submit Rating'}
                  </Button>
                </form>
              </div>
            )}

            {/* Digital Invoice / Transparent Price Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-[#e6aa3b]" />
                  Cooperative Receipt
                </h3>
                <span className="text-[10px] font-bold text-[#24172f] bg-[#f0e7d9] px-2 py-0.5 rounded">
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
                  <span className="text-[#e6aa3b] font-medium">Included (100%)</span>
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
                <span className="text-xl font-black text-[#d96f4d]">
                  ₹{booking.final_price || booking.estimated_price}
                </span>
              </div>

              {booking.payment_status === 'completed' ? (
                <div className="pt-2 space-y-2">
                  <Button
                    type="button"
                    onClick={() => setIsReceiptOpen(true)}
                    className="w-full bg-[#f0e7d9] hover:bg-[#e6dcd0] text-[#24172f] font-bold rounded-xl border border-[#e6dcd0] text-xs py-2 flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Receipt className="w-3.5 h-3.5 text-[#24172f]" />
                    View Official Cooperative Receipt & QR Code
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      if (dbBooking) {
                        setDbBooking({ ...dbBooking, payment_status: 'pending' });
                      }
                      setBookingPaymentStatus(booking.id, 'pending');
                      toast.info('Payment status reset to pending! You can now test the Pay button.');
                    }}
                    className="text-[11px] text-[#7c5cf0] hover:text-[#5b3fc9] font-semibold underline block mx-auto pt-1 cursor-pointer transition-colors"
                  >
                    ↺ Reset to Unpaid (Test Razorpay Button Again)
                  </button>
                </div>
              ) : (
                <div className="pt-2 space-y-2">
                  <RazorpayPaymentButton
                    bookingId={booking.id}
                    amount={booking.final_price || booking.estimated_price || 350}
                    customerName={booking.customer_name}
                    customerPhone={booking.customer_phone}
                    serviceName={booking.service_name}
                    className="w-full rounded-xl py-2.5 text-xs"
                    onPaymentSuccess={(data) => {
                      setPaymentData(data);
                      if (dbBooking) {
                        setDbBooking({
                          ...dbBooking,
                          payment_status: 'completed',
                          payment_method: data?.method || 'Online Razorpay / UPI',
                        });
                      }
                      setBookingPaymentStatus(booking.id, 'completed', data?.method || 'Online Razorpay / UPI');
                      setIsReceiptOpen(true);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleMarkCashPaid}
                    className="w-full rounded-xl py-2 text-xs font-semibold border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    💵 Paid Cash to Worker
                  </Button>
                  <p className="text-[10px] text-center text-gray-400">
                    UPI, Cards, NetBanking • Protected by Cooperative Fair-Share Guarantee
                  </p>
                </div>
              )}
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

      {/* Cancel Booking Disclaimer Modal */}
      <CancelBookingModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        bookingId={booking?.id}
        serviceName={booking?.service_name}
        workerName={worker?.full_name}
        isCancelling={isCancelling}
      />

      {/* Official Cooperative Receipt & Invoice Modal */}
      <CooperativeReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        booking={booking}
        paymentData={paymentData}
      />
    </div>
  );
}
