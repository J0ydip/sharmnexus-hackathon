'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/lib/store/bookingStore';

export default function TrackIndexPage() {
  const router = useRouter();
  const bookings = useBookingStore((state) => state.bookings);

  useEffect(() => {
    // Find active booking or first booking
    const active = bookings.find((b) => b.status !== 'completed' && b.status !== 'cancelled') || bookings[0];
    if (active) {
      router.replace(`/track/${active.id}`);
    } else {
      router.replace('/track/SN-2026-8941');
    }
  }, [bookings, router]);

  return (
    <div className="min-h-screen bg-[#fbf7ef] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#24172f] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-[#776e79]">Loading booking tracking...</p>
      </div>
    </div>
  );
}
