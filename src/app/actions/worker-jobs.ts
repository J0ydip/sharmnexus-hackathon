'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateBookingStatus(bookingId: string, newStatus: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Check if caller is a registered worker
  const { data: worker } = await supabase
    .from('workers')
    .select('id, total_jobs_completed')
    .eq('id', user.id)
    .maybeSingle();

  // Authorization: fetch the booking to verify ownership / eligibility
  const { data: existingBooking } = await supabase
    .from('bookings')
    .select('id, customer_id, worker_id, status')
    .eq('id', bookingId)
    .maybeSingle();

  if (!existingBooking) {
    throw new Error('Booking not found');
  }

  // Workers can only modify bookings assigned to them (or accept unassigned ones)
  if (worker && newStatus !== 'cancelled') {
    if (existingBooking.worker_id && existingBooking.worker_id !== user.id && newStatus !== 'confirmed') {
      throw new Error('This booking is assigned to another worker');
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

  // Only assign worker_id if caller is a registered worker and status is not cancelled
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
    .eq('id', bookingId);

  if (error) {
    console.error('Error updating booking status:', error);
    throw new Error('Failed to update booking status: ' + error.message);
  }

  // If completed and caller is worker, increment completed count
  if (newStatus === 'completed' && worker) {
    await supabase
      .from('workers')
      .update({ total_jobs_completed: (worker.total_jobs_completed || 0) + 1 })
      .eq('id', user.id);
  }

  revalidatePath('/jobs');
  revalidatePath('/worker-dashboard');
  revalidatePath('/earnings');
  revalidatePath('/history');
}
