'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateBookingStatus(bookingId: string, newStatus: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  // Update status and ensure this worker is assigned
  const { error } = await supabase
    .from('bookings')
    .update({ 
      status: newStatus,
      worker_id: user.id
    })
    .eq('id', bookingId);

  if (error) {
    console.error(error);
    throw new Error('Failed to update booking status: ' + error.message);
  }

  // If completed, increment worker's completed jobs
  if (newStatus === 'completed') {
    const { data: worker } = await supabase
      .from('workers')
      .select('total_jobs_completed')
      .eq('id', user.id)
      .single();

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
}

