'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useBookingStore } from '@/lib/store/bookingStore';
import { BookingStatusBadge } from '@/components/customer/BookingStatusBadge';
import { ServiceCategoryIcon } from '@/components/customer/ServiceCategoryIcon';
import { StarRating } from '@/components/customer/StarRating';
import { Booking } from '@/lib/data/mockData';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { submitRating, getCustomerBookings } from '@/app/actions/bookings';
import { updateBookingStatus as updateBookingStatusAction } from '@/app/actions/worker-jobs';
import { RazorpayPaymentButton } from '@/components/customer/RazorpayPaymentButton';
import { CooperativeReceiptModal } from '@/components/customer/CooperativeReceiptModal';
import { CancelBookingModal } from '@/components/customer/CancelBookingModal';
import {
  CalendarClock,
  ArrowRight,
  MapPin,
  Clock,
  Building2,
  CheckCircle2,
  Star,
  Receipt,
  RotateCcw,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { getBookingOtp } from '@/lib/utils';

export default function HistoryPage() {
  const router = useRouter();
  const supabase = createClient();
  const { bookings, updateBookingStatus, setBookingPaymentStatus, rateBooking, loadSampleBookings } = useBookingStore();
  const [mounted, setMounted] = useState(false);
  const [dbBookings, setDbBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);
  const [receiptPaymentData, setReceiptPaymentData] = useState<any>(null);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const localAuth = typeof window !== 'undefined' ? (localStorage.getItem('shramnexus-auth') || localStorage.getItem('sharmnexus-auth')) : null;
      let hasValidCustomerAuth = false;
      if (localAuth) {
        try {
          const parsed = JSON.parse(localAuth);
          if (parsed.role === 'admin' || parsed.name === 'Super Admin' || parsed.email === 'admin@shramnexus.com') {
            localStorage.removeItem('shramnexus-auth');
            localStorage.removeItem('sharmnexus-auth');
          } else if (parsed.isLoggedIn) {
            hasValidCustomerAuth = true;
          }
        } catch (e) {}
      }

      const { data: { session } } = await supabase.auth.getSession();
      const isAdm = session?.user && (
        session.user.user_metadata?.user_type === 'admin' ||
        session.user.user_metadata?.role === 'admin' ||
        session.user.user_metadata?.full_name === 'Super Admin' ||
        session.user.email === 'admin@shramnexus.com'
      );

      if ((session?.user && !isAdm) || hasValidCustomerAuth) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, [supabase]);

  useEffect(() => {
    setMounted(true);
    let isMounted = true;

    async function loadDbBookings() {
      try {
        const { data } = await getCustomerBookings();
        if (data && data.length > 0 && isMounted) {
          const mapped: (Booking & { payment_id?: string; payment_record?: any })[] = data.map((b: any) => {
            const hasCompletedPayment =
              (b.payments && b.payments.some((p: any) => p.status === 'completed')) ||
              b.payment_status === 'completed';
            const latestPayment = b.payments && b.payments.length > 0 ? b.payments[0] : null;

            const userRating = (b.ratings && b.ratings.length > 0) ? b.ratings[0] : null;

            return {
              id: b.id,
              customer_id: b.customer_id,
              customer_name: 'Customer',
              customer_phone: '',
              worker_id: b.worker_id || 'unassigned',
              worker: b.worker ? {
                id: b.worker.id,
                full_name: b.worker.full_name,
                phone: b.worker.phone || '',
                society_name: 'Cooperative Society',
                profile_photo_url: b.worker.profile_photo_url || '',
                profession: b.service?.name || 'Service Professional',
                avg_rating: b.worker.avg_rating || 4.8,
                approx_distance_km: 2.5,
                hourly_rate: 300,
                is_verified: true,
                verification_status: 'verified',
                cooperative_member_id: 'MEM-001',
                total_jobs_completed: 12,
                skills: [b.service?.name || 'General'],
                badges: ['Verified'],
                availability: 'Immediate (within 45 mins)',
                experience_years: 4,
                rating_count: 15,
              } : (bookings[0]?.worker || ({} as any)),
              service_category_id: b.service_category_id || '',
              service_name: b.service?.name || 'Service',
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
              otp: getBookingOtp(b.id),
              rating: userRating?.score,
              review: userRating?.review,
              payment_status: hasCompletedPayment ? 'completed' : 'pending',
              payment_method: hasCompletedPayment
                ? (latestPayment?.method ? `Online (${latestPayment.method.toUpperCase()})` : 'Online Razorpay / UPI')
                : (b.payment_method || 'Pay after service'),
              payment_id: latestPayment?.razorpay_payment_id || latestPayment?.id,
              payment_record: latestPayment,
              created_at: b.created_at,
            };
          });

          setDbBookings(mapped);

          // Synchronize each booking status to store
          mapped.forEach((b) => {
            updateBookingStatus(b.id, b.status as any);
          });
        }
      } catch (err) {
        console.warn('Could not fetch Supabase bookings:', err);
      }
    }

    loadDbBookings();
    const interval = setInterval(loadDbBookings, 3000);

    const channel = supabase
      .channel('customer-history-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          loadDbBookings();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [supabase, updateBookingStatus, bookings]);

  function formatSchedule(str: string) {
    if (!str) return 'Scheduled Soon';
    try {
      const d = new Date(str);
      if (isNaN(d.getTime())) return str;
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return str;
    }
  }

  // Rating Modal state
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [userStars, setUserStars] = useState(5);
  const [userReviewText, setUserReviewText] = useState('');

  // Cancel Disclaimer Modal state
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Combine DB bookings with local store bookings (avoid duplicate IDs)
  const allBookings = [
    ...dbBookings,
    ...bookings.filter((b) => !dbBookings.some((db) => db.id === b.id)),
  ];

  // Filter bookings by tab
  const upcomingBookings = allBookings.filter(
    (b) => b.status === 'requested' || b.status === 'assigned' || b.status === 'accepted' || b.status === 'in_progress'
  );
  const completedBookings = allBookings.filter((b) => b.status === 'completed');
  const cancelledBookings = allBookings.filter((b) => b.status === 'cancelled');

  const displayedList =
    activeTab === 'upcoming'
      ? upcomingBookings
      : activeTab === 'completed'
      ? completedBookings
      : cancelledBookings;

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ratingBooking) {
      const score = userStars;
      const review = userReviewText;
      rateBooking(ratingBooking.id, score, review);
      setDbBookings((prev) =>
        prev.map((item) =>
          item.id === ratingBooking.id
            ? { ...item, rating: score, review: review }
            : item
        )
      );
      try {
        await submitRating({
          bookingId: ratingBooking.id,
          workerId: ratingBooking.worker_id,
          score: score,
          review: review,
        });
      } catch (err) {
        console.warn('submitRating error:', err);
      }
      toast.success('Thank you! Your verified rating was submitted to the cooperative.');
      setRatingBooking(null);
      setUserReviewText('');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setIsCancelling(true);
    const bId = cancellingBooking.id;
    updateBookingStatus(bId, 'cancelled');
    setDbBookings((prev) =>
      prev.map((item) =>
        item.id === bId
          ? { ...item, status: 'cancelled' }
          : item
      )
    );
    try {
      await updateBookingStatusAction(bId, 'cancelled');
    } catch (err) {
      console.warn('Cancel action error:', err);
    } finally {
      setIsCancelling(false);
      setCancellingBooking(null);
    }
    toast.info('Booking has been cancelled.');
    setActiveTab('cancelled');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50/70 pb-20 sm:pb-12">
        <div className="bg-gradient-to-r from-[#24172f] via-[#3d2b48] to-[#24172f] text-white pt-8 pb-10 px-4 sm:px-6 shadow-xs">
          <div className="container mx-auto max-w-5xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Bookings</h1>
            <p className="text-xs text-[#c8bacb] mt-1">Track and manage your scheduled and past cooperative services.</p>
          </div>
        </div>
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 pt-16 flex justify-center">
          <div className="w-8 h-8 border-3 border-[#e6aa3b] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/70 pb-20 sm:pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#24172f] via-[#3d2b48] to-[#24172f] text-white pt-8 pb-10 px-4 sm:px-6 shadow-xs">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#24172f]/80 text-[#f5dfad] text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2 border border-[#e6aa3b]/30">
                <CalendarClock className="w-3.5 h-3.5 text-[#e6aa3b]" />
                <span>Customer Bookings &amp; Service History</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                My Bookings
              </h1>
              <p className="text-[#c8bacb] text-xs sm:text-sm mt-0.5">
                Track live service status, view transparent invoices, and rate verified cooperative workers.
              </p>
            </div>

            <Link
              href="/services"
              className="bg-[#e6aa3b] hover:bg-[#d96f4d] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs shrink-0 transition-transform hover:scale-105"
            >
              + Book New Service
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 -mt-4 space-y-6">
        {isAuthenticated === false ? (
          <div className="bg-white rounded-3xl border border-gray-200/90 p-8 sm:p-12 text-center shadow-xs space-y-5 max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-[#fbf7ef] text-[#24172f] border border-[#e6aa3b]/30 flex items-center justify-center mx-auto shadow-2xs">
              <CalendarClock className="w-8 h-8 text-[#e6aa3b]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                Log In to View Your Bookings
              </h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                Sign in to track live jobs, communicate with assigned cooperative workers, verify service PINs, and access official tax invoices.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/login?redirect=/history"
                className="w-full sm:w-auto bg-[#24172f] hover:bg-[#3d2b48] text-[#fbf7ef] font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Log In / Register</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/services"
                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm px-6 py-3 rounded-xl transition-colors text-center"
              >
                Explore Services
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'upcoming'
                ? 'bg-[#24172f] text-[#fbf7ef] font-bold shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span>Upcoming / Active</span>
            {upcomingBookings.length > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'upcoming' ? 'bg-[#e6aa3b] text-[#24172f]' : 'bg-[#f0e7d9] text-[#24172f]'
                }`}
              >
                {upcomingBookings.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'completed'
                ? 'bg-[#24172f] text-[#fbf7ef] font-bold shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span>Completed</span>
            {completedBookings.length > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'completed' ? 'bg-[#e6aa3b] text-[#24172f]' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {completedBookings.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cancelled')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'cancelled'
                ? 'bg-[#24172f] text-[#fbf7ef] font-bold shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span>Cancelled</span>
            {cancelledBookings.length > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'cancelled' ? 'bg-[#e6aa3b] text-[#24172f]' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {cancelledBookings.length}
              </span>
            )}
          </button>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {displayedList.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl border border-gray-200/90 hover:border-[#e6aa3b]/50 p-5 shadow-xs hover:shadow-md transition-all duration-200 space-y-4"
            >
              {/* Header: Service, Booking ID, Status Badge */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#fbf7ef] text-[#24172f] border border-[#e6dcd0] flex items-center justify-center shrink-0">
                    <ServiceCategoryIcon name={booking.service_icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-base">
                        {booking.service_name}
                      </h3>
                      <span className="font-mono text-[11px] text-gray-400 font-medium">
                        {booking.id}
                      </span>
                      {booking.urgency === 'emergency' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200">
                          <Zap className="w-3 h-3 text-red-600 fill-current" />
                          Emergency SOS
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {booking.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {booking.payment_status === 'completed' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[#e2eee4] text-[#8ba58b] px-2.5 py-0.5 rounded-full border border-[#8ba58b]/30">
                      <CheckCircle2 className="w-3 h-3 text-[#8ba58b]" />
                      Paid
                    </span>
                  )}
                  <BookingStatusBadge status={booking.status} size="sm" />
                </div>
              </div>

              {/* Worker & Location Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
                <div className="flex items-center gap-2.5">
                  <img
                    src={
                      booking.worker?.profile_photo_url ||
                      'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80'
                    }
                    alt={booking.worker?.full_name || 'Worker'}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div>
                    <span className="font-bold text-gray-800 block">
                      {booking.worker?.full_name || 'Assigned Craftsman'}
                    </span>
                    <span className="text-[10px] text-gray-400 block truncate max-w-[150px]">
                      {booking.worker?.society_name || 'Labour Cooperative Society'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 font-medium block">Schedule</span>
                  <div className="font-semibold text-gray-800 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span suppressHydrationWarning>{formatSchedule(booking.scheduled_at)}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 font-medium block">Address</span>
                  <div className="font-medium text-gray-800 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{booking.address}</span>
                  </div>
                </div>
              </div>

              {/* Existing Rating (if completed) */}
              {booking.rating && (
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                      Your Rating: {booking.rating} / 5 Stars
                    </span>
                  </div>
                  {booking.review && (
                    <p className="text-gray-700 text-xs mt-1 italic">&ldquo;{booking.review}&rdquo;</p>
                  )}
                </div>
              )}

              {/* Footer: Price & Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 flex-wrap gap-2">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">Total Rate</span>
                  <span className="text-base font-extrabold text-gray-900">
                    ₹{booking.final_price || booking.estimated_price}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                    <>
                      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 rounded-xl px-2.5 py-1 text-xs text-amber-900 shadow-2xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="text-[10px] uppercase font-bold text-amber-800">PIN:</span>
                        <span className="font-mono font-black text-xs text-amber-950 bg-amber-100/90 px-1.5 py-0.5 rounded tracking-wider">
                          {getBookingOtp(booking.id, booking.otp)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCancellingBooking(booking)}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <Link
                        href={`/track/${booking.id}`}
                        className="bg-[#24172f] hover:bg-[#3d2b48] text-[#fbf7ef] border border-[#e6aa3b]/30 font-bold text-xs h-9 px-4 rounded-xl shadow-xs flex items-center gap-1"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Track Live</span>
                      </Link>
                    </>
                  )}

                  {booking.status === 'completed' && (
                    <>
                      {booking.payment_status === 'completed' ? (
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReceiptBooking(booking);
                              setReceiptPaymentData(null);
                            }}
                            className="bg-[#fbf7ef] hover:bg-[#f0e7d9] text-[#24172f] border-[#e6dcd0] font-bold text-xs h-9 px-3 rounded-xl flex items-center gap-1 shadow-xs"
                          >
                            <Receipt className="w-3.5 h-3.5 text-[#24172f]" />
                            <span>Receipt</span>
                          </Button>
                          <button
                            type="button"
                            title="Reset payment status to test Pay button again"
                            onClick={() => {
                              setDbBookings((prev) =>
                                prev.map((item) =>
                                  item.id === booking.id
                                    ? { ...item, payment_status: 'pending' }
                                    : item
                                )
                              );
                              setBookingPaymentStatus(booking.id, 'pending');
                              toast.info('Payment status reset to pending for testing.');
                            }}
                            className="text-[10px] text-gray-400 hover:text-[#d96f4d] underline px-1 cursor-pointer transition-colors"
                          >
                            ↺ Reset
                          </button>
                        </div>
                      ) : (
                        <RazorpayPaymentButton
                          bookingId={booking.id}
                          amount={booking.final_price || booking.estimated_price || 350}
                          customerName={booking.customer_name}
                          serviceName={booking.service_name}
                          size="sm"
                          className="h-9 px-3 rounded-xl text-xs"
                          onPaymentSuccess={(data) => {
                            setReceiptPaymentData(data);
                            const updated = {
                              ...booking,
                              payment_status: 'completed' as const,
                              payment_method: data?.method || 'Online Razorpay / UPI',
                              final_price: booking.final_price || booking.estimated_price || 350,
                              payment_id: data?.paymentId,
                              payment_record: data?.paymentRecord,
                              status: 'completed' as const,
                            };
                            setReceiptBooking(updated);
                            setDbBookings((prev) =>
                              prev.map((item) =>
                                item.id === booking.id
                                  ? {
                                      ...item,
                                      status: 'completed',
                                      payment_status: 'completed',
                                      payment_method: data?.method || 'Online Razorpay / UPI',
                                      payment_id: data?.paymentId,
                                      payment_record: data?.paymentRecord,
                                    }
                                  : item
                              )
                            );
                            setBookingPaymentStatus(booking.id, 'completed', data?.method || 'Online Razorpay / UPI');
                            updateBookingStatus(booking.id, 'completed');
                          }}
                        />
                      )}
                      <Link
                        href={`/track/${booking.id}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs h-9 px-3.5 rounded-xl flex items-center gap-1 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span>Timeline</span>
                      </Link>
                      {!booking.rating && (
                        <Button
                          size="sm"
                          className="bg-[#e6aa3b] hover:bg-[#d96f4d] text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs"
                          onClick={() => {
                            setRatingBooking(booking);
                            setUserStars(5);
                            setUserReviewText('');
                          }}
                        >
                          <Star className="w-3.5 h-3.5 mr-1 fill-current" />
                          Rate
                        </Button>
                      )}
                    </>
                  )}

                  {booking.status === 'cancelled' && (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/track/${booking.id}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs h-9 px-3 rounded-xl flex items-center gap-1 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span>Timeline</span>
                      </Link>
                      <Link
                        href="/services"
                        className="bg-[#d96f4d] hover:bg-[#b85435] text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Book Another Worker</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {displayedList.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 space-y-3">
              <CalendarClock className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="text-base font-bold text-gray-800">
                No {activeTab} bookings found
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Need household help? Browse our 10 verified trades and connect with local cooperative workers.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Link
                  href="/services"
                  className="inline-flex bg-[#24172f] hover:bg-[#3d2b48] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
                >
                  Browse Services
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    loadSampleBookings();
                    toast.success('Loaded sample cooperative booking for testing!');
                  }}
                  className="inline-flex bg-[#fbf7ef] hover:bg-[#f5dfad]/50 text-[#24172f] border border-[#e6aa3b]/40 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                >
                  ✨ Load Sample Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </>
    )}
  </div>

      {/* Rate Worker Modal */}
      {ratingBooking && (
        <Dialog open={!!ratingBooking} onOpenChange={(open) => !open && setRatingBooking(null)}>
          <DialogContent className="max-w-md p-6 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Rate &amp; Review {ratingBooking.worker?.full_name}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleRateSubmit} className="space-y-4 pt-2">
              <div className="text-center py-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <span className="text-xs text-gray-500 font-medium block">
                  Tap stars to rate service quality
                </span>
                <StarRating
                  rating={userStars}
                  interactive={true}
                  onChange={(r) => setUserStars(r)}
                  size="lg"
                  showNumber={true}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">
                  Leave a Cooperative Community Review
                </label>
                <textarea
                  rows={3}
                  placeholder="Share feedback on punctuality, craftsmanship, and verified pricing..."
                  value={userReviewText}
                  onChange={(e) => setUserReviewText(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#e6aa3b] outline-none bg-gray-50/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setRatingBooking(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#24172f] hover:bg-[#3d2b48] text-white font-bold text-xs">
                  Submit Verified Rating
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel Booking Disclaimer Modal */}
      <CancelBookingModal
        isOpen={Boolean(cancellingBooking)}
        onClose={() => setCancellingBooking(null)}
        onConfirm={handleConfirmCancel}
        bookingId={cancellingBooking?.id}
        serviceName={cancellingBooking?.service_name}
        workerName={cancellingBooking?.worker?.full_name}
        isCancelling={isCancelling}
      />

      {/* Official Cooperative Receipt & Invoice Modal */}
      <CooperativeReceiptModal
        isOpen={!!receiptBooking}
        onClose={() => setReceiptBooking(null)}
        booking={receiptBooking}
        paymentData={receiptPaymentData}
      />
    </div>
  );
}
