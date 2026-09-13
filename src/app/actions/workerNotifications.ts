'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface WorkerNotificationItem {
  id: string;
  user_id: string;
  user_type: string;
  title: string;
  body: string;
  type: string;
  data: Record<string, any> | null;
  is_read: boolean;
  created_at: string;
}

export interface WorkerNotificationsResponse {
  notifications: WorkerNotificationItem[];
  unreadNotifsCount: number;
  unreadReviewsCount: number;
}

/**
 * Ensures all worker events (ratings, payments, bookings) are synced
 * into public.notifications idempotently and returns the current list.
 */
export async function syncAndGetWorkerNotifications(workerIdOverride?: string): Promise<WorkerNotificationsResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const targetWorkerId = user?.id || workerIdOverride;
  if (!targetWorkerId) {
    return { notifications: [], unreadNotifsCount: 0, unreadReviewsCount: 0 };
  }

  try {
    // 1. Fetch ratings for this worker
    const { data: ratings } = await supabase
      .from('ratings')
      .select('id, score, review, created_at, customer:customer_id(full_name), booking:booking_id(service_categories(name))')
      .eq('worker_id', targetWorkerId);

    // 2. Fetch completed bookings with payments
    const { data: completedBookings } = await supabase
      .from('bookings')
      .select(`
        id, status, final_price, estimated_price, completed_at, created_at,
        customers(full_name),
        service_categories(name),
        payments(id, amount, status, method, paid_at, worker_payout)
      `)
      .eq('worker_id', targetWorkerId)
      .eq('status', 'completed');

    // 3. Fetch existing notifications in Supabase to prevent duplicate inserts
    const { data: existingRows } = await supabase
      .from('notifications')
      .select('id, user_id, user_type, title, body, type, data, is_read, created_at')
      .eq('user_id', targetWorkerId);

    const existingSourceIds = new Set<string>();
    if (existingRows) {
      for (const row of existingRows) {
        const sourceId = row.data?.source_id;
        if (sourceId) {
          existingSourceIds.add(String(sourceId));
        }
      }
    }

    const toInsert: Array<{
      user_id: string;
      user_type: string;
      title: string;
      body: string;
      type: string;
      data: Record<string, any>;
      is_read: boolean;
      created_at: string;
    }> = [];

    // Check ratings
    if (ratings) {
      for (const r of ratings as any[]) {
        if (!existingSourceIds.has(String(r.id))) {
          const customerName = r.customer?.full_name || 'Customer';
          const serviceName = r.booking?.service_categories?.name || 'Cooperative Service';
          const reviewText = r.review || 'Service completed satisfactorily according to cooperative quality standards.';

          toInsert.push({
            user_id: targetWorkerId,
            user_type: 'worker',
            title: `New Customer Rating (${r.score} Stars)`,
            body: `${customerName} rated ${r.score} stars for ${serviceName}: "${reviewText}"`,
            type: 'rating',
            data: {
              source_id: r.id,
              source_type: 'rating',
              score: r.score,
              customerName,
              service: serviceName,
              review: reviewText,
            },
            is_read: false,
            created_at: r.created_at || new Date().toISOString(),
          });
        }
      }
    }

    // Check completed jobs payments
    if (completedBookings) {
      for (const b of completedBookings as any[]) {
        const pmts = b.payments || [];
        const completedPayment = pmts.find((p: any) => p.status === 'completed');
        if (completedPayment && !existingSourceIds.has(String(b.id))) {
          const rawPrice = b.final_price || b.estimated_price || 350;
          const payout = completedPayment.worker_payout || Math.round(rawPrice * 0.85);
          const method = completedPayment.method === 'cash'
            ? 'Cash in Hand'
            : `Online (${(completedPayment.method || 'UPI').toUpperCase()})`;
          const customerName = b.customers?.full_name || 'Customer';
          const serviceName = b.service_categories?.name || 'Cooperative Service';

          toInsert.push({
            user_id: targetWorkerId,
            user_type: 'worker',
            title: 'Payment Received',
            body: `Settlement of ₹${payout.toLocaleString()} received for ${serviceName} from ${customerName} (${method}).`,
            type: 'payment',
            data: {
              source_id: b.id,
              source_type: 'payment',
              amount: payout,
              service: serviceName,
              customerName,
              paymentMethod: method,
            },
            is_read: false,
            created_at: completedPayment.paid_at || b.completed_at || b.created_at || new Date().toISOString(),
          });
        }
      }
    }

    // Insert new notification rows if any
    if (toInsert.length > 0) {
      await supabase.from('notifications').insert(toInsert);
    }

    // Fetch all up-to-date notifications for this worker
    const { data: allNotifs, error } = await supabase
      .from('notifications')
      .select('id, user_id, user_type, title, body, type, data, is_read, created_at')
      .eq('user_id', targetWorkerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return { notifications: [], unreadNotifsCount: 0, unreadReviewsCount: 0 };
    }

    const items: WorkerNotificationItem[] = (allNotifs || []).map((n) => ({
      id: n.id,
      user_id: n.user_id,
      user_type: n.user_type,
      title: n.title,
      body: n.body,
      type: n.type,
      data: n.data,
      is_read: Boolean(n.is_read),
      created_at: n.created_at,
    }));

    const unreadNotifsCount = items.filter((n) => !n.is_read).length;
    const unreadReviewsCount = items.filter((n) => n.type === 'rating' && !n.is_read).length;

    return {
      notifications: items,
      unreadNotifsCount,
      unreadReviewsCount,
    };
  } catch (err) {
    console.error('Error in syncAndGetWorkerNotifications:', err);
    return { notifications: [], unreadNotifsCount: 0, unreadReviewsCount: 0 };
  }
}

/**
 * Mark a single notification as read in Supabase
 */
export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Failed to mark notification read:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/worker-dashboard');
  return { success: true };
}

/**
 * Mark all notifications for this worker as read
 */
export async function markAllNotificationsAsRead(workerId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', workerId);

  if (error) {
    console.error('Failed to mark all notifications read:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/worker-dashboard');
  return { success: true };
}

/**
 * Mark a specific review as read via its rating source_id in notifications
 */
export async function markReviewAsRead(workerId: string, ratingId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', workerId)
    .contains('data', { source_id: ratingId });

  if (error) {
    console.error('Failed to mark review as read:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/worker-dashboard');
  return { success: true };
}

/**
 * Mark all reviews for this worker as read
 */
export async function markAllReviewsAsRead(workerId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', workerId)
    .eq('type', 'rating');

  if (error) {
    console.error('Failed to mark all reviews read:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/worker-dashboard');
  return { success: true };
}
