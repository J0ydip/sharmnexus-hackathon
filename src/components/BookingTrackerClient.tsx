'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

const TrackingMapWrapper = dynamic(() => import('@/components/TrackingMapWrapper'), { ssr: false });

export default function BookingTrackerClient({ initialBooking }: { initialBooking: any }) {
  const [booking, setBooking] = useState(initialBooking);
  const supabase = createClient();

  useEffect(() => {
    // Listen to changes on this specific booking row
    const channel = supabase
      .channel('booking_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${booking.id}`
        },
        (payload) => {
          setBooking((prev: any) => ({ ...prev, ...payload.new }));
          toast.success(`Booking status updated to: ${payload.new.status}`);
        }
      )
      .subscribe();

    // Fallback: Poll every 3 seconds in case Realtime isn't enabled in the Dashboard
    const interval = setInterval(async () => {
      const { data } = await supabase.from('bookings').select('status').eq('id', booking.id).single();
      if (data) {
        setBooking((prev: any) => {
          if (data.status !== prev.status) {
            toast.success(`Booking status updated to: ${data.status}`);
            return { ...prev, status: data.status };
          }
          return prev;
        });
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [booking.id, supabase]);

  const steps = ['requested', 'confirmed', 'in_progress', 'completed'];
  const normalizedStatus = (booking.status === 'pending' || !booking.status) ? 'requested' : booking.status;
  const currentStepIndex = Math.max(0, steps.indexOf(normalizedStatus));

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl pb-24">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Track your Booking</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="h-64 w-full bg-gray-100">
          <TrackingMapWrapper lat={booking.latitude || 26.9124} lng={booking.longitude || 75.7873} status={booking.status} />
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold">{booking.service_categories?.name || 'Service'}</h2>
              <p className="text-gray-500">{isMounted ? new Date(booking.scheduled_at).toLocaleString() : 'Loading time...'}</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-xl text-blue-600">₹{booking.total_amount}</div>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="relative pt-4 mb-4">
            <div className="absolute top-6 w-full h-1 bg-gray-200 rounded"></div>
            <div 
              className="absolute top-6 h-1 bg-blue-600 rounded transition-all duration-500"
              style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
            ></div>
            <div className="relative flex justify-between">
              {['Requested', 'Accepted', 'On the way', 'Completed'].map((label, idx) => (
                <div key={label} className="flex flex-col items-center">
                  <div className={`w-5 h-5 rounded-full z-10 ${idx <= currentStepIndex ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-gray-300'}`}></div>
                  <span className={`text-xs mt-2 font-medium ${idx <= currentStepIndex ? 'text-blue-800' : 'text-gray-400'}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-lg mb-4">Worker Details</h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl rounded-full">
            {booking.workers?.full_name?.charAt(0) || 'W'}
          </div>
          <div>
            <div className="font-bold text-lg">{booking.workers?.full_name || 'Assigning worker...'}</div>
            {booking.workers?.phone && <div className="text-gray-500">{booking.workers.phone}</div>}
            <div className="flex items-center text-sm text-yellow-500 font-bold mt-1">
              ★ 4.8 <span className="text-gray-400 font-normal ml-1">(124 reviews)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
