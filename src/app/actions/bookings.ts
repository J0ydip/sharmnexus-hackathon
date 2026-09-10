'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ---------------------------------------------------------------------------
// createBooking — unified booking creation for wizard, emergency & direct book
// ---------------------------------------------------------------------------
export async function createBooking(data: {
  customer_id?: string;
  worker_id?: string;
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

  // 1. If explicit worker_id provided as UUID, verify their category matches if realCategoryId is present
    if (data.worker_id && isUuid(data.worker_id)) {
      if (realCategoryId) {
        const { data: hasSkill } = await supabase
          .from('worker_skills')
          .select('worker_id')
          .eq('worker_id', data.worker_id)
          .eq('service_category_id', realCategoryId)
          .limit(1);
        if (hasSkill && hasSkill.length > 0) {
          realWorkerId = data.worker_id;
        }
      } else {
        realWorkerId = data.worker_id;
      }
    }

    // 2. Try to match by explicit worker_name if provided and category matches
    if (!realWorkerId && data.worker_name) {
      const { data: matchedByName } = await supabase
        .from('workers')
        .select('id')
        .ilike('full_name', `%${data.worker_name.trim()}%`)
        .limit(5);

      if (matchedByName && matchedByName.length > 0) {
        if (realCategoryId) {
          // Find the one that actually belongs to this category
          for (const cand of matchedByName) {
            const { data: hasSkill } = await supabase
              .from('worker_skills')
              .select('worker_id')
              .eq('worker_id', cand.id)
              .eq('service_category_id', realCategoryId)
              .limit(1);
            if (hasSkill && hasSkill.length > 0) {
              realWorkerId = cand.id;
              break;
            }
          }
        }
        if (!realWorkerId && !realCategoryId) {
          realWorkerId = matchedByName[0].id;
        }
      }
    }

    // 3. Try to match by specific mock ID pattern if provided (only if category matches)
    if (!realWorkerId && data.worker_id && !isUuid(data.worker_id)) {
      const cleanTargetName = data.worker_id.replace(/^worker-/, '').replace(/-/g, ' ');
      const { data: matchedByIdSlug } = await supabase
        .from('workers')
        .select('id')
        .ilike('full_name', `%${cleanTargetName}%`)
        .limit(5);

      if (matchedByIdSlug && matchedByIdSlug.length > 0) {
        if (realCategoryId) {
          for (const cand of matchedByIdSlug) {
            const { data: hasSkill } = await supabase
              .from('worker_skills')
              .select('worker_id')
              .eq('worker_id', cand.id)
              .eq('service_category_id', realCategoryId)
              .limit(1);
            if (hasSkill && hasSkill.length > 0) {
              realWorkerId = cand.id;
              break;
            }
          }
        }
        if (!realWorkerId && !realCategoryId) {
          realWorkerId = matchedByIdSlug[0].id;
        }
      }
    }

    // 4. Strictly find a verified worker matching this category
    if (!realWorkerId && realCategoryId) {
      const { data: skillRows } = await supabase
        .from('worker_skills')
        .select('worker_id')
        .eq('service_category_id', realCategoryId)
        .limit(1);
      if (skillRows && skillRows.length > 0) {
        realWorkerId = skillRows[0].worker_id;
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

  const selectQuery = `
    *,
    worker:worker_id (id, full_name, phone, profile_photo_url, avg_rating, total_jobs_completed, society:society_id(name, district)),
    service:service_category_id (id, name, name_hi, icon_url, base_price),
    payments:payments (id, amount, status, razorpay_payment_id, method, paid_at),
    ratings:ratings (id, score, review, created_at)
  `;

  if (!resolvedId) {
    // Guest or unauthenticated demo mode: fetch recent bookings
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(selectQuery)
      .order('created_at', { ascending: false })
      .limit(25);

    if (error) {
      console.error('Error fetching fallback customer bookings:', error);
      return { error: error.message, data: null };
    }
    return { data: bookings || [], error: null };
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(selectQuery)
    .eq('customer_id', resolvedId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customer bookings:', error);
    return { error: error.message, data: null };
  }

  return { data: bookings || [], error: null };
}

// ---------------------------------------------------------------------------
// getBookingById — fetch a single booking by UUID (for tracking page)
// ---------------------------------------------------------------------------
export async function getBookingById(bookingId: string) {
  const supabase = await createClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookingId);

  const selectQuery = `
    *,
    worker:worker_id (id, full_name, phone, profile_photo_url, avg_rating, total_jobs_completed, society:society_id(name, district)),
    service:service_category_id (id, name, name_hi, icon_url, base_price),
    payments:payments (id, amount, status, razorpay_payment_id, method, paid_at),
    ratings:ratings (id, score, review, created_at)
  `;

  if (isUuid) {
    const { data: booking } = await supabase
      .from('bookings')
      .select(selectQuery)
      .eq('id', bookingId)
      .maybeSingle();

    if (booking) return booking;
  }

  // Fallback: If not a valid UUID or not found, try to fetch the latest booking for logged-in user
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: latestForUser } = await supabase
      .from('bookings')
      .select(selectQuery)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestForUser) return latestForUser;
  }

  // Fallback to most recent overall booking in system
  const { data: latestBooking } = await supabase
    .from('bookings')
    .select(selectQuery)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return latestBooking || null;
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

  // Verify the user owns this booking (or allow if legacy unassigned customer_id)
  const { data: booking } = await supabase
    .from('bookings')
    .select('customer_id, worker_id')
    .eq('id', data.bookingId)
    .maybeSingle();

  if (booking?.customer_id && booking.customer_id !== user.id) {
    return { error: 'You can only rate your own bookings' };
  }

  const resolvedWorkerId = data.workerId || booking?.worker_id || null;

  // Check if rating already exists for this booking
  const { data: existingRating } = await supabase
    .from('ratings')
    .select('id')
    .eq('booking_id', data.bookingId)
    .maybeSingle();

  let ratingResult;
  if (existingRating) {
    const { data: updated, error: updateError } = await supabase
      .from('ratings')
      .update({
        score: data.score,
        review: data.review || null,
        worker_id: resolvedWorkerId,
      })
      .eq('id', existingRating.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating rating:', updateError);
      return { error: updateError.message };
    }
    ratingResult = updated;
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from('ratings')
      .insert([
        {
          booking_id: data.bookingId,
          customer_id: user.id,
          worker_id: resolvedWorkerId,
          score: data.score,
          review: data.review || null,
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error submitting rating:', insertError);
      return { error: insertError.message };
    }
    ratingResult = inserted;
  }

  // Re-calculate and update worker avg_rating if resolvedWorkerId is present
  if (resolvedWorkerId) {
    const { data: workerRatings } = await supabase
      .from('ratings')
      .select('score')
      .eq('worker_id', resolvedWorkerId);

    if (workerRatings && workerRatings.length > 0) {
      const avg = workerRatings.reduce((acc, curr) => acc + curr.score, 0) / workerRatings.length;
      await supabase
        .from('workers')
        .update({ avg_rating: parseFloat(avg.toFixed(1)) })
        .eq('id', resolvedWorkerId);
    }
  }

  revalidatePath('/history');
  revalidatePath('/worker-dashboard');
  revalidatePath('/track');
  revalidatePath(`/track/${data.bookingId}`);
  return { success: true, data: ratingResult };
}
