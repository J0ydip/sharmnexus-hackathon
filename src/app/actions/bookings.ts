'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ---------------------------------------------------------------------------
// createBooking — unified booking creation for wizard, emergency & direct book
// ---------------------------------------------------------------------------
export async function createBooking(data: {
  customer_id?: string;
  worker_id: string;
  service_category_id?: string;
  service_category_name?: string;
  service_id?: string;
  worker_name?: string;
  description?: string;
  address?: string;
  address_line1?: string;
  booking_date?: string;
  booking_time?: string;
  booking_type?: 'scheduled' | 'emergency' | 'on_demand';
  estimated_price?: number;
  scheduled_at?: string;       // ISO datetime
  latitude?: number;
  longitude?: number;
}) {
  const supabase = await createClient();

  // 1. Resolve customer ID from session or payload
  const { data: authData } = await supabase.auth.getUser();
  const customerId = authData?.user?.id || data.customer_id;

  if (!customerId) {
    return { error: 'Authentication required. Please log in.' };
  }

  // 2. Ensure customer row exists in the customers table
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

  const isUuid = (str?: string | null) =>
    !!str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  const rawCatId = data.service_category_id || data.service_id;
  let realCategoryId: string | null = null;
  if (rawCatId && isUuid(rawCatId)) {
    realCategoryId = rawCatId;
  } else {
    // Try to resolve by name or fallback to matching category
    const cleanName = (data.service_category_name || rawCatId || '').replace(/^cat-/, '').toLowerCase();
    const { data: catRows } = await supabase.from('service_categories').select('id, name');
    const matched = catRows?.find(c => c.name.toLowerCase().includes(cleanName) || cleanName.includes(c.name.toLowerCase()));
    realCategoryId = matched?.id || catRows?.[0]?.id || null;
  }

  let realWorkerId: string | null = null;
  if (data.worker_id && isUuid(data.worker_id)) {
    realWorkerId = data.worker_id;
  } else {
    // Try to find a worker for this category or fallback to any verified worker
    if (realCategoryId) {
      const { data: skillRows } = await supabase
        .from('worker_skills')
        .select('worker_id')
        .eq('service_category_id', realCategoryId)
        .limit(1);
      if (skillRows && skillRows.length > 0) {
        realWorkerId = skillRows[0].worker_id;
      }
    }
    if (!realWorkerId) {
      const { data: anyWorker } = await supabase.from('workers').select('id').limit(1).maybeSingle();
      realWorkerId = anyWorker?.id || null;
    }
  }

  const addressStr = data.address || data.address_line1 || '';
  let scheduledAt = data.scheduled_at;
  if (!scheduledAt && data.booking_date) {
    scheduledAt = data.booking_time
      ? `${data.booking_date}T${data.booking_time}:00Z`
      : `${data.booking_date}T10:00:00Z`;
  }
  if (!scheduledAt) {
    scheduledAt = new Date().toISOString();
  }

  // 3. Insert the booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert([
      {
        customer_id: customerId,
        worker_id: realWorkerId,
        service_category_id: realCategoryId,
        booking_type: data.booking_type || 'scheduled',
        description: data.description || null,
        address: addressStr,
        estimated_price: data.estimated_price || null,
        scheduled_at: scheduledAt,
        status: 'requested',
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating booking:', error);
    return { error: error.message };
  }

  revalidatePath('/history');
  revalidatePath('/jobs');
  revalidatePath('/worker-dashboard');
  revalidatePath('/bookings');
  return { data: booking };
}

// ---------------------------------------------------------------------------
// getCustomerBookings — fetch all bookings for the logged-in customer
// ---------------------------------------------------------------------------
export async function getCustomerBookings(customerId?: string) {
  const supabase = await createClient();

  // Resolve from session if not provided
  let resolvedId = customerId;
  if (!resolvedId) {
    const { data: { user } } = await supabase.auth.getUser();
    resolvedId = user?.id;
  }
  if (!resolvedId) {
    return { error: 'Authentication required', data: null };
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      worker:worker_id (id, full_name, phone, profile_photo_url, avg_rating),
      service:service_category_id (id, name, name_hi, icon_url, base_price)
    `)
    .eq('customer_id', resolvedId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookings:', error);
    return { error: error.message, data: null };
  }

  return { data: bookings, error: null };
}

// ---------------------------------------------------------------------------
// getBookingById — fetch a single booking by UUID (for tracking page)
// ---------------------------------------------------------------------------
export async function getBookingById(bookingId: string) {
  const supabase = await createClient();

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      worker:worker_id (id, full_name, phone, profile_photo_url, avg_rating),
      service:service_category_id (id, name, name_hi, icon_url, base_price)
    `)
    .eq('id', bookingId)
    .single();

  if (error) {
    console.error('Error fetching booking:', error);
    return null;
  }

  return booking;
}

// ---------------------------------------------------------------------------
// submitRating — rate a completed booking
// ---------------------------------------------------------------------------
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
