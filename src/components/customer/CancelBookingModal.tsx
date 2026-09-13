'use client';	

import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  ShieldCheck,
  CalendarX2,
} from 'lucide-react';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bookingId?: string;
  serviceName?: string;
  workerName?: string;
  isCancelling?: boolean;
}

export function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  bookingId,
  serviceName = 'Service',
  workerName,
  isCancelling = false,
}: CancelBookingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isCancelling) onClose(); }}>
      <DialogContent className="max-w-md w-full p-0 rounded-3xl border-0 shadow-2xl bg-white overflow-hidden z-[10000]">
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-[#24172f] via-[#3d2b48] to-[#24172f] text-white p-6 relative overflow-hidden pr-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
              <CalendarX2 className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 block">
                Cancellation Notice
              </span>
              <h2 className="text-lg font-bold text-white leading-tight mt-0.5">
                Cancel Booking Request?
              </h2>
              {bookingId && (
                <span className="text-[11px] text-[#c8bacb] font-mono">
                  #{bookingId.slice(0, 8)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Requested Service</span>
              <strong className="text-gray-900 text-sm">{serviceName}</strong>
            </div>
            {workerName && (
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Assigned Worker</span>
                <span className="text-gray-800 font-semibold">{workerName}</span>
              </div>
            )}
          </div>

          {/* Cooperative Disclaimer Card */}
          <div className="bg-amber-50/80 rounded-2xl border border-amber-200/80 p-4 space-y-2.5 text-amber-950">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Cooperative Fair-Dispatch Notice</span>
            </div>
            <p className="text-[11px] text-amber-900/90 leading-relaxed">
              Our verified tradespersons reserve time exclusively for scheduled household requests. Please confirm only if you definitely need to cancel.
            </p>
            <div className="pt-1 border-t border-amber-200/60 flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Zero cancellation fee applies for uncommenced work.</span>
            </div>
          </div>

          <p className="text-gray-500 text-[11px] text-center">
            You can reschedule or book a new cooperative service at any time.
          </p>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isCancelling}
              onClick={onClose}
              className="w-full h-10 rounded-xl font-bold text-xs border-gray-300 hover:bg-gray-100 text-gray-700 cursor-pointer"
            >
              Keep Booking
            </Button>
            <Button
              type="button"
              disabled={isCancelling}
              onClick={onConfirm}
              className="w-full h-10 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer"
            >
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
