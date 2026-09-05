'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import {
  Receipt,
  ShieldCheck,
  CheckCircle2,
  Download,
  Printer,
  Building2,
  HeartHandshake,
  Sparkles,
} from 'lucide-react';

interface CooperativeReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  paymentData?: any;
}

export function CooperativeReceiptModal({
  isOpen,
  onClose,
  booking,
  paymentData,
}: CooperativeReceiptModalProps) {
  if (!booking) return null;

  const totalAmount =
    paymentData?.amount ||
    booking.final_price ||
    booking.estimated_price ||
    350;

  const workerPayout =
    paymentData?.split?.workerPayout ||
    Math.round(totalAmount * 0.85);

  const cooperativeWelfare =
    paymentData?.split?.cooperativeShare ||
    Math.round(totalAmount * 0.05);

  const platformFee = totalAmount - workerPayout - cooperativeWelfare;

  const transactionId =
    paymentData?.paymentId ||
    booking.payment_id ||
    booking.payment_record?.razorpay_payment_id ||
    `pay_sn_${booking.id.replace(/[^a-zA-Z0-9]/g, '').slice(-8)}_${Date.now().toString().slice(-4)}`;

  const verificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/track/${booking.id}?verify=${transactionId}`
    : `https://sharmnexus.org/track/${booking.id}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full max-h-[88vh] flex flex-col p-0 rounded-3xl border-0 shadow-2xl bg-white overflow-hidden z-[10000]">
        {/* Receipt Header Banner (Pinned at top) */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 shrink-0 relative overflow-hidden pr-14">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold tracking-widest uppercase bg-emerald-900/60 px-2.5 py-1 rounded-full text-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Cooperative Certified
              </span>
              <span className="text-xs font-semibold text-emerald-100">
                SIH 26089
              </span>
            </div>
            <h2 className="text-xl font-black mt-2 tracking-tight">
              Official Service Receipt
            </h2>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              SharmNexus Labour Cooperative Federation
            </p>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Receipt Body (Scrollable interior) */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 print:p-0 print:overflow-visible">
          {/* Status Badge & Summary */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <p className="text-[11px] text-gray-500 font-medium">Receipt ID</p>
              <p className="text-xs font-mono font-bold text-gray-800">{transactionId}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Payment Settled
              </span>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {new Date().toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Service & Worker Details */}
          <div className="bg-gray-50/80 rounded-2xl p-4 space-y-2 text-xs border border-gray-100">
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Service Trade</span>
              <span className="font-bold text-gray-900">{booking.service_name || 'Home Maintenance'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Service Professional</span>
              <span className="font-semibold text-gray-800">{booking.worker?.full_name || 'Assigned Professional'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Cooperative Society</span>
              <span className="font-semibold text-emerald-800">
                {booking.worker?.society_name || 'District Labour Cooperative'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Booking Code</span>
              <span className="font-mono text-gray-700 font-semibold">{booking.id}</span>
            </div>
          </div>

          {/* Transparent Fair-Share Breakdown Table */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
              Transparent Cooperative Split
            </h4>

            <div className="space-y-2 text-xs border border-gray-100 rounded-2xl p-3.5">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-gray-800 block">Worker Direct Wage</span>
                  <span className="text-[10px] text-gray-500">85% direct fair-share compensation</span>
                </div>
                <span className="font-bold text-gray-900">₹{workerPayout}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div>
                  <span className="font-semibold text-emerald-800 block">Worker Welfare & Healthcare</span>
                  <span className="text-[10px] text-emerald-600">5% pension, accident & health fund</span>
                </div>
                <span className="font-bold text-emerald-700">₹{cooperativeWelfare}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div>
                  <span className="font-semibold text-gray-800 block">Cooperative Federation Operations</span>
                  <span className="text-[10px] text-gray-500">10% tech maintenance & dispute support</span>
                </div>
                <span className="font-bold text-gray-900">₹{platformFee}</span>
              </div>
            </div>

            {/* Total Paid */}
            <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-4 flex items-baseline justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-950 block">Total Paid via Razorpay / UPI</span>
                <span className="text-[10px] text-emerald-700">All applicable cooperative taxes included</span>
              </div>
              <span className="text-2xl font-black text-emerald-800">
                ₹{totalAmount}
              </span>
            </div>
          </div>

          {/* QR Code & Verification Note */}
          <div className="flex items-center gap-4 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
            <div className="p-1.5 bg-white rounded-xl shadow-xs border border-gray-200">
              <QRCodeSVG value={verificationUrl} size={64} level="M" />
            </div>
            <div className="text-[11px] text-gray-600 leading-relaxed">
              <p className="font-bold text-gray-900">Digital Seal & Verification</p>
              <p className="text-gray-500 text-[10px]">
                Scan QR code to verify this transaction on the public cooperative ledger.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 print:hidden">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              className="flex-1 rounded-xl text-xs font-bold border-gray-200 flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-gray-600" />
              Print Receipt
            </Button>
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
