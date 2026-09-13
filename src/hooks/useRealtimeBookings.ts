'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeBookingEvent {
  id: string;
  status: string;
  customer_id: string;
  worker_id: string | null;
  service_category_id: string | null;
  description: string | null;
  address: string | null;
  estimated_price: number | null;
  booking_type: string;
  created_at: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

interface UseRealtimeBookingsOptions {
  /** Worker ID to filter bookings for */
  workerId?: string | null;
  /** Called when a new booking is created (job request) */
  onNewBooking?: (booking: RealtimeBookingEvent) => void;
  /** Called when a booking status changes */
  onBookingUpdate?: (booking: RealtimeBookingEvent) => void;
  /** Whether the hook is enabled */
  enabled?: boolean;
}

/**
 * Real-time booking subscription hook using Supabase Realtime.
 * Subscribes to INSERT and UPDATE events on the bookings table.
 *
 * - Workers get notified of new job requests targeting them
 * - Workers get notified when booking status changes (assigned, cancelled, etc.)
 */
export function useRealtimeBookings({
  workerId,
  onNewBooking,
  onBookingUpdate,
  enabled = true,
}: UseRealtimeBookingsOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeBookingEvent | null>(null);

  const handlePayload = useCallback(
    (payload: any) => {
      const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
      const record = payload.new as any;

      if (!record) return;

      const event: RealtimeBookingEvent = {
        id: record.id,
        status: record.status,
        customer_id: record.customer_id,
        worker_id: record.worker_id,
        service_category_id: record.service_category_id,
        description: record.description,
        address: record.address,
        estimated_price: record.estimated_price,
        booking_type: record.booking_type,
        created_at: record.created_at,
        eventType,
      };

      setLastEvent(event);

      if (eventType === 'INSERT') {
        onNewBooking?.(event);
      } else if (eventType === 'UPDATE') {
        onBookingUpdate?.(event);
      }
    },
    [onNewBooking, onBookingUpdate]
  );

  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();

    // Subscribe to all bookings — filter by worker_id if provided
    // For new job requests: worker_id might be null (unassigned) or matching
    const channelName = workerId
      ? `bookings-worker-${workerId}`
      : `bookings-all`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => handlePayload({ ...payload, eventType: 'INSERT' })
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          ...(workerId ? { filter: `worker_id=eq.${workerId}` } : {}),
        },
        (payload) => handlePayload({ ...payload, eventType: 'UPDATE' })
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        setIsConnected(false);
      }
    };
  }, [workerId, enabled, handlePayload]);

  return { isConnected, lastEvent };
}

/**
 * Real-time notification counter hook.
 * Tracks unread notifications for a user via Supabase Realtime.
 */
export function useRealtimeNotifications(userId?: string | null) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { unreadCount, resetCount: () => setUnreadCount(0) };
}
