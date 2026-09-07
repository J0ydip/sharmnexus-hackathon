'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Booking } from '@/lib/data/mockData';
import {
  Clock,
  UserCheck,
  CheckCircle2,
  Truck,
  Wrench,
  Sparkles,
  XCircle,
} from 'lucide-react';

interface BookingStatusBadgeProps {
  status: Booking['status'];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BookingStatusBadge({
  status,
  className,
  size = 'md',
}: BookingStatusBadgeProps) {
  const configs: Record<
    Booking['status'],
    { label: string; icon: React.FC<{ className?: string }>; bg: string; text: string; border: string }
  > = {
    requested: {
      label: 'Requested',
      icon: Clock,
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    assigned: {
      label: 'Worker Assigned',
      icon: UserCheck,
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    accepted: {
      label: 'Accepted',
      icon: CheckCircle2,
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
    },
    in_progress: {
      label: 'In Progress / On Way',
      icon: Wrench,
      bg: 'bg-[#f5dfad]/30',
      text: 'text-[#d96f4d]',
      border: 'border-[#e6aa3b]/30',
    },
    completed: {
      label: 'Completed',
      icon: Sparkles,
      bg: 'bg-[#e2eee4]',
      text: 'text-[#8ba58b]',
      border: 'border-[#8ba58b]/40',
    },
    cancelled: {
      label: 'Cancelled',
      icon: XCircle,
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
    },
  };

  const current = configs[status] || configs.requested;
  const Icon = current.icon;

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border shadow-xs transition-colors',
        current.bg,
        current.text,
        current.border,
        sizeStyles[size],
        className
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      {current.label}
    </span>
  );
}
