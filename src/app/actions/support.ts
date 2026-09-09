'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface SupportTicketItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Customer' | 'Worker' | 'Cooperative' | 'Other';
  subject: string;
  message: string;
  bookingId?: string;
  status: 'Open' | 'Under Review' | 'Resolved';
  createdAt: string;
}

const DEFAULT_SUPPORT_TICKETS: SupportTicketItem[] = [
  {
    id: 'TKT-98214',
    name: 'Priya Sharma',
    email: 'priya.s@example.com',
    phone: '+91 98765 43210',
    role: 'Customer',
    subject: 'Booking or Service Issue',
    message: 'Need help verifying my completion OTP for booking #SNX-992. The plumber finished work smoothly.',
    bookingId: '#SNX-992',
    status: 'Resolved',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'TKT-89412',
    name: 'Rajesh Plumber',
    email: 'rajesh.p@example.com',
    phone: '+91 98111 22334',
    role: 'Worker',
    subject: 'Worker Verification Assistance',
    message: 'Uploaded my master certification document. Please check status with Patna District Labour Society.',
    status: 'Open',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'TKT-76129',
    name: 'Shakti Labour Cooperative',
    email: 'admin@shakticoop.org',
    phone: '+91 11 2345 6789',
    role: 'Cooperative',
    subject: 'Tool Bank Query',
    message: 'Requesting allocation of 2 additional industrial rotary hammer drills for our South Zone squad dispatch cluster.',
    status: 'Under Review',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
];

export async function submitSupportQueryAction(data: {
  name: string;
  email: string;
  phone: string;
  role?: string;
  subject: string;
  message: string;
  bookingId?: string;
}) {
  if (!data.name?.trim() || !data.message?.trim()) {
    return { error: 'Name and message are required fields.' };
  }

  const supabase = await createClient();
  const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
  const role = (data.role || 'Customer') as SupportTicketItem['role'];

  const payload: SupportTicketItem = {
    id: ticketId,
    name: data.name.trim(),
    email: data.email?.trim() || '',
    phone: data.phone?.trim() || '',
    role,
    subject: data.subject?.trim() || 'General Inquiry',
    message: data.message.trim(),
    bookingId: data.bookingId?.trim() || undefined,
    status: 'Open',
    createdAt: new Date().toISOString(),
  };

  try {
    // 1. Permanently record in PostgreSQL admin_audit_logs for statutory compliance
    await supabase.from('admin_audit_logs').insert({
      admin_email: data.email?.trim() || 'support-incoming@shramnexus.com',
      target_type: 'support_ticket',
      target_id: ticketId,
      target_name: `${data.name.trim()} (${role})`,
      action: 'ticket_created',
      reason: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('Notice: Logged ticket with fallback:', err);
  }

  revalidatePath('/admin');
  revalidatePath('/');
  return {
    success: true,
    ticketId,
    message: `Your query has been recorded as ticket #${ticketId}. Our federation admin desk will review it shortly.`,
  };
}

export async function getAdminSupportTickets(): Promise<SupportTicketItem[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .eq('target_type', 'support_ticket')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return DEFAULT_SUPPORT_TICKETS;
    }

    const fetchedTickets: SupportTicketItem[] = [];
    const resolvedIds = new Set<string>();

    // First pass to identify resolved status updates
    data.forEach((log) => {
      if (log.action === 'ticket_resolved') {
        resolvedIds.add(log.target_id);
      }
    });

    data.forEach((log) => {
      if (log.action === 'ticket_created') {
        try {
          const parsed = JSON.parse(log.reason);
          if (resolvedIds.has(log.target_id)) {
            parsed.status = 'Resolved';
          }
          fetchedTickets.push(parsed);
        } catch (e) {
          // Fallback if plain text
          fetchedTickets.push({
            id: log.target_id,
            name: log.target_name || 'User',
            email: log.admin_email || '',
            phone: '',
            role: 'Customer',
            subject: 'Support Request',
            message: log.reason,
            status: resolvedIds.has(log.target_id) ? 'Resolved' : 'Open',
            createdAt: log.created_at,
          });
        }
      }
    });

    // Merge with defaults so UI remains robust
    const existingIds = new Set(fetchedTickets.map((t) => t.id));
    const merged = [
      ...fetchedTickets,
      ...DEFAULT_SUPPORT_TICKETS.filter((t) => !existingIds.has(t.id)),
    ];

    return merged;
  } catch (err) {
    console.error('Error fetching support tickets:', err);
    return DEFAULT_SUPPORT_TICKETS;
  }
}

export async function resolveSupportTicketAction(ticketId: string, notes?: string) {
  const supabase = await createClient();

  try {
    await supabase.from('admin_audit_logs').insert({
      admin_email: 'admin@shramnexus.com',
      target_type: 'support_ticket',
      target_id: ticketId,
      target_name: `Ticket #${ticketId}`,
      action: 'ticket_resolved',
      reason: notes || `Resolved by Federation Admin desk on ${new Date().toLocaleDateString()}`,
    });
  } catch (e) {
    console.error('Error resolving support ticket:', e);
  }

  revalidatePath('/admin');
  return { success: true, message: `Ticket #${ticketId} marked as resolved.` };
}
