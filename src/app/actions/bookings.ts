'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createBooking(data: {
  customer_id: string;
  worker_id: string;
  service_id: string;
  booking_date: string;
  booking_time: string;
  address_line1: string;
  latitude: number;
  longitude: number;
}) {
  const supabase = await createClient();
  
  // 1. Resolve customer ID from session or payload
  const { data: authData } = await supabase.auth.getUser();
  const customerId = authData?.user?.id || data.customer_id;

  if (!customerId) {
    return { error: 'Authentication required. Please log in.' };
  }

  // 2. Ensure customer exists in the customers table
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('id')
    .eq('id', customerId)
    .maybeSingle();

  if (!existingCustomer) {
    const rawDigits = (customerId.replace(/[^0-9]/g, '') + Date.now().toString()).slice(0, 10);
    const uniquePhone = authData?.user?.phone || authData?.user?.user_metadata?.phone || `+91${rawDigits.padEnd(10, '0')}`;
    const custName = authData?.user?.user_metadata?.full_name || 'Customer';
    const custEmail = authData?.user?.email || null;

    const { error: insertErr } = await supabase.from('customers').insert({
      id: customerId,
      full_name: custName,
      phone: uniquePhone,
      email: custEmail,
    });

    if (insertErr) {
      console.warn('Customer insert error, retrying with random phone:', insertErr.message);
      const randomPhone = `+91${Math.floor(6000000000 + Math.random() * 3999999999)}`;
      await supabase.from('customers').insert({
        id: customerId,
        full_name: custName,
        phone: randomPhone,
        email: custEmail,
      });
    }
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert([
      {
        customer_id: data.customer_id,
        worker_id: data.worker_id,
        service_category_id: data.service_id,
        scheduled_at: `${data.booking_date}T${data.booking_time}:00Z`,
        address: data.address_line1,
        status: 'requested',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating booking:', error);
    return { error: error.message };
  }

  revalidatePath('/bookings', 'page');
  return { data: booking };
}

export async function getCustomerBookings(customerId: string) {
  const supabase = await createClient();
  
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      worker:worker_id (id, full_name, profile_photo_url),
      service:service_category_id (name, name_hi)
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookings:', error);
    return { error: error.message, data: null };
  }

  return { data: bookings, error: null };
}

export async function submitRating(data: {
  bookingId: string;
  workerId?: string;
  score: number;
  review?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Authentication required' };
  }

  const { data: rating, error } = await supabase
    .from('ratings')
    .insert([
      {
        booking_id: data.bookingId,
        customer_id: user.id,
        worker_id: data.workerId || null,
        score: data.score,
        review: data.review || null,
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error submitting rating:', error);
    return { error: error.message };
  }

  // Re-calculate and update worker avg_rating if workerId is present
  if (data.workerId) {
    const { data: workerRatings } = await supabase
      .from('ratings')
      .select('score')
      .eq('worker_id', data.workerId);

    if (workerRatings && workerRatings.length > 0) {
      const avg = workerRatings.reduce((acc, curr) => acc + curr.score, 0) / workerRatings.length;
      await supabase
        .from('workers')
        .update({ avg_rating: parseFloat(avg.toFixed(1)) })
        .eq('id', data.workerId);
    }
  }

  revalidatePath('/history');
  return { success: true, data: rating };
}
