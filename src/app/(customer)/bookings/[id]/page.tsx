import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import BookingTrackerClient from '@/components/BookingTrackerClient';

export default async function BookingTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/auth/login');

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, workers(*), service_categories(*)')
    .eq('id', id)
    .single();

  if (!booking) return <div>Booking not found</div>;

  return <BookingTrackerClient initialBooking={booking} />;
}
