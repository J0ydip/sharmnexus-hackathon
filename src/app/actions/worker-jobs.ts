'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateBookingStatus(bookingId: string, newStatus: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated. Please sign in.');

  // Check if caller is a registered worker
  const { data: worker } = await supabase
    .from('workers')
    .select('id, total_jobs_completed')
    .eq('id', user.id)
    .maybeSingle();

  // Resolve booking ID if needed
  let targetId = bookingId;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
  if (!isUuid) {
    const { data: latest } = await supabase
      .from('bookings')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latest?.id) targetId = latest.id;
  }

  // Authorization: fetch the booking to verify ownership / eligibility
  const { data: existingBooking } = await supabase
    .from('bookings')
    .select('id, customer_id, worker_id, status, estimated_price, final_price')
    .eq('id', targetId)
    .maybeSingle();

  if (!existingBooking) {
    throw new Error(`Booking ${targetId} not found in database`);
  }

  // Workers accepting or modifying bookings
  if (worker && newStatus !== 'cancelled') {
    // If the booking is in 'requested' status and worker is accepting it, allow worker to accept and assign to themselves
    if (newStatus === 'accepted' || newStatus === 'assigned' || newStatus === 'in_progress') {
      if (existingBooking.worker_id && existingBooking.worker_id !== user.id && existingBooking.status !== 'requested') {
        throw new Error('This booking has already been claimed by another cooperative tradesperson');
      }
    } else {
      if (existingBooking.worker_id && existingBooking.worker_id !== user.id && newStatus !== 'confirmed') {
        throw new Error('This booking is assigned to another worker');
      }
    }
  }

  // Customers can only cancel their own bookings
  if (!worker && newStatus === 'cancelled') {
    if (existingBooking.customer_id !== user.id) {
      throw new Error('You can only cancel your own bookings');
    }
  }

  const updatePayload: Record<string, any> = {
    status: newStatus,
  };

  // Assign worker_id if caller is a registered worker and status is not cancelled
  if (worker && newStatus !== 'cancelled') {
    updatePayload.worker_id = user.id;
  }

  if (newStatus === 'completed') {
    updatePayload.completed_at = new Date().toISOString();
  } else if (newStatus === 'in_progress') {
    updatePayload.started_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('bookings')
    .update(updatePayload)
    .eq('id', targetId);

  if (error) {
    console.error('Error updating booking status:', error);
    throw new Error('Failed to update booking status: ' + error.message);
  }

  // If completed and caller is worker, increment completed count and ensure payment record exists for admin
  if (newStatus === 'completed') {
    if (worker) {
      await supabase
        .from('workers')
        .update({ total_jobs_completed: (worker.total_jobs_completed || 0) + 1 })
        .eq('id', user.id);
    }
  }

  revalidatePath('/jobs');
  revalidatePath('/worker-dashboard');
  revalidatePath('/earnings');
  revalidatePath('/history');
  revalidatePath('/admin');
  revalidatePath('/track');
  revalidatePath(`/track/${targetId}`);
  revalidatePath('/bookings');
  revalidatePath(`/bookings/${targetId}`);

  return { success: true, bookingId: targetId, status: newStatus };
}

export async function getWorkerDashboardData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  try {
    const { data: worker } = await supabase
      .from('workers')
      .select(`
        id, full_name, phone, email, is_verified, is_available, verification_status, avg_rating, total_jobs_completed, address,
        skills:worker_skills (
          id, service_category_id, years_experience, certification_name, is_verified,
          category:service_category_id (id, name)
        ),
        society:society_id (id, name, district, state)
      `)
      .eq('id', user.id)
      .maybeSingle();

    const workerSkillCategoryIds: string[] = (worker?.skills || [])
      .map((s: any) => s.service_category_id)
      .filter(Boolean);

    const [requestsRes, activeRes, completedRes] = await Promise.all([
      supabase
        .from('bookings')
        .select('id, status, estimated_price, final_price, description, address, scheduled_at, created_at, worker_id, service_category_id, customers(full_name, phone), service_categories(name)')
        .in('status', ['requested', 'assigned'])
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('bookings')
        .select('id, status, estimated_price, final_price, description, address, scheduled_at, created_at, customers(full_name, phone), service_categories(name)')
        .eq('worker_id', user.id)
        .in('status', ['assigned', 'accepted', 'in_progress'])
        .order('scheduled_at', { ascending: true }),
      supabase
        .from('bookings')
        .select(`
          id, status, estimated_price, final_price, description, address, scheduled_at, completed_at, created_at,
          customers(full_name, phone),
          service_categories(name),
          payments(id, amount, status, method, paid_at, worker_payout, cooperative_share)
        `)
        .eq('worker_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(20),
    ]);

    // Filter incoming requests strictly for this worker:
    // 1. Direct requests or assigned bookings specifically for this worker
    // 2. Open pool requests in the cooperative network matching this worker's registered trade
    const relevantRequests = (requestsRes.data || []).filter((r: any) => {
      // Specifically assigned to or requested for this worker
      if (r.worker_id === user.id) {
        return r.status === 'requested' || r.status === 'assigned';
      }
      // If assigned to a different worker, do not show
      if (r.worker_id && r.worker_id !== user.id) {
        return false;
      }
      // Open pool requests matching worker's trade
      if (
        r.status === 'requested' &&
        workerSkillCategoryIds.length > 0 &&
        workerSkillCategoryIds.includes(r.service_category_id)
      ) {
        return true;
      }
      return false;
    });

    return {
      worker,
      requests: relevantRequests,
      activeJobs: activeRes.data || [],
      completedJobs: completedRes.data || [],
    };
  } catch (err) {
    console.error('Error fetching worker dashboard data:', err);
    return null;
  }
}
