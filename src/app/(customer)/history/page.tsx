'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';

export default function HistoryPage() {
  const { bookings, updateBookingStatus, setBookingPaymentStatus, rateBooking } = useBookingStore();
  const [mounted, setMounted] = useState(false);
  const [dbBookings, setDbBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);
  const [receiptPaymentData, setReceiptPaymentData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    async function loadDbBookings() {
      try {
        const { data } = await getCustomerBookings();
        if (data && data.length > 0) {
          const mapped: (Booking & { payment_id?: string; payment_record?: any })[] = data.map((b: any) => {
            const hasCompletedPayment =
              (b.payments && b.payments.some((p: any) => p.status === 'completed')) ||
              b.payment_status === 'completed';
            const latestPayment = b.payments && b.payments.length > 0 ? b.payments[0] : null;

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
              city: 'Patna',
              scheduled_at: b.scheduled_at ? new Date(b.scheduled_at).toLocaleString() : 'Scheduled',
              time_slot: 'Scheduled',
              estimated_price: b.estimated_price || 350,
              final_price: b.final_price || b.estimated_price || 350,
              otp: '4892',
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
        }
      } catch (err) {
        console.warn('Could not fetch Supabase bookings:', err);
      }
    }
    loadDbBookings();
  }, []);

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
      rateBooking(ratingBooking.id, userStars, userReviewText);
      try {
        await submitRating({
          bookingId: ratingBooking.id,
          workerId: ratingBooking.worker_id,
          score: userStars,
          review: userReviewText,
        });
      } catch (err) {
        // Fallback gracefully for local mock IDs
      }
      toast.success('Thank you! Your verified rating was submitted to the cooperative.');
      setRatingBooking(null);
      setUserReviewText('');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      updateBookingStatus(bookingId, 'cancelled');
      try {
        await updateBookingStatusAction(bookingId, 'cancelled');
      } catch (err) {
        // Fallback gracefully for local mock IDs
      }
      toast.info('Booking has been cancelled.');
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50/70 pb-20 sm:pb-12">
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white pt-8 pb-10 px-4 sm:px-6 shadow-xs">
          <div className="container mx-auto max-w-5xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Bookings</h1>
            <p className="text-xs text-emerald-100 mt-1">Track and manage your scheduled and past cooperative services.</p>
          </div>
        </div>
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 pt-16 flex justify-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/70 pb-20 sm:pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white pt-8 pb-10 px-4 sm:px-6 shadow-xs">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-700/60 text-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
                <CalendarClock className="w-3.5 h-3.5 text-emerald-300" />
                <span>Customer Bookings &amp; Service History</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                My Bookings
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
                Track live service status, view transparent invoices, and rate verified cooperative workers.
              </p>
            </div>

            <Link
              href="/services"
              className="bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold px-4 py-2 rounded-xl shadow-xs shrink-0 transition-transform hover:scale-105"
            >
              + Book New Service
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 -mt-4 space-y-6">
        {/* Navigation Tabs */}
        <div className="bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'upcoming'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span>Upcoming / Active</span>
            {upcomingBookings.length > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'upcoming' ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
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
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span>Completed</span>
            {completedBookings.length > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'completed' ? 'bg-white text-emerald-800' : 'bg-gray-200 text-gray-700'
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
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span>Cancelled</span>
            {cancelledBookings.length > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'cancelled' ? 'bg-white text-emerald-800' : 'bg-gray-200 text-gray-700'
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
              className="bg-white rounded-2xl border border-gray-200/90 hover:border-emerald-300 p-5 shadow-xs hover:shadow-md transition-all duration-200 space-y-4"
            >
              {/* Header: Service, Booking ID, Status Badge */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
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
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100/90 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
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
                      {booking.worker?.society_name || 'Patna District Labour Society'}
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

                <div className="flex items-center gap-2">
                  {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1 transition-colors"
                      >
                        Cancel
                      </button>
                      <Link
                        href={`/track/${booking.id}`}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs flex items-center gap-1"
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
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-xs h-9 px-3 rounded-xl flex items-center gap-1 shadow-xs"
                          >
                            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
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
                            className="text-[10px] text-gray-400 hover:text-emerald-700 underline px-1 cursor-pointer transition-colors"
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
                          className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs"
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
                    <Link
                      href={`/booking/${booking.service_category_id}`}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Rebook</span>
                    </Link>
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
              <Link
                href="/services"
                className="inline-flex bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs mt-2"
              >
                Browse Services
              </Link>
            </div>
          )}
        </div>
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
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" type="button" onClick={() => setRatingBooking(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                  Submit Verified Rating
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

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
