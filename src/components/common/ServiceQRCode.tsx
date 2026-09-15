'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, QrCode, X, CheckCircle } from 'lucide-react';

const emptySubscribe = () => () => {};

interface ServiceQRCodeProps {
  bookingId: string;
  workerName?: string;
  customerName?: string;
  serviceTitle?: string;
  otp: string;
  className?: string;
  buttonText?: string;
}

export function ServiceQRCode({
  bookingId,
  workerName,
  customerName,
  serviceTitle,
  otp,
  className,
  buttonText,
}: ServiceQRCodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Lock body scroll and close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Encode structured payload for instant doorstep verification
  const qrPayload = JSON.stringify({
    app: 'ShramNexus',
    bookingId,
    otp,
    worker: workerName || 'Artisan',
    customer: customerName || 'Customer',
    service: serviceTitle || 'Home Service',
    verifiedAt: new Date().toISOString(),
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          className ||
          "inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all shadow-xs"
        }
        title="Display Secure Doorstep QR Code"
      >
        <QrCode className="w-4 h-4 text-[#f5dfad] shrink-0" />
        <span>{buttonText || "Show Verification QR"}</span>
      </button>

      {isOpen && mounted && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full text-center shadow-2xl border border-gray-100 relative max-h-[85vh] overflow-y-auto flex flex-col my-auto animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prominent, accessible Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              title="Close QR Code Modal"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center justify-center gap-2.5 mb-2.5 pr-6">
              <div className="w-9 h-9 rounded-xl bg-[#f5dfad]/40 text-[#d96f4d] flex items-center justify-center border border-[#e6aa3b]/30 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm sm:text-base font-extrabold text-[#24172f] leading-tight">
                  Doorstep Verification Pass
                </h3>
                <span className="text-[11px] text-gray-500 block">
                  Show to {workerName || 'artisan'} upon arrival
                </span>
              </div>
            </div>

            {/* QR Card */}
            <div className="bg-gradient-to-b from-[#fcfbfa] to-[#f8f6f2] p-4 rounded-2xl border border-gray-200 shadow-inner flex flex-col items-center justify-center mx-auto my-1.5 w-full">
              <QRCodeSVG
                value={qrPayload}
                size={145}
                level="H"
                includeMargin
                fgColor="#24172f"
              />
              <div className="mt-2.5 text-center">
                <span className="text-[9px] uppercase font-extrabold text-gray-400 block tracking-wider">
                  Verification PIN
                </span>
                <span className="font-mono text-2xl font-black tracking-widest text-[#d96f4d]">
                  {otp}
                </span>
              </div>
            </div>

            {/* Summary Details */}
            <div className="mt-2 text-left bg-gray-50 rounded-xl p-3 border border-gray-200 text-xs text-gray-600 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Booking ID:</span>
                <span className="font-mono font-bold text-[#24172f]">#{bookingId.substring(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Service:</span>
                <span className="font-semibold text-[#24172f] truncate max-w-[180px]">{serviceTitle || 'General Service'}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-gray-200/60">
                <span className="text-gray-400">Cooperative Guarantee:</span>
                <span className="font-semibold text-emerald-600 inline-flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> 30-Day Warranty
                </span>
              </div>
            </div>

            {/* Exit/Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full py-2.5 px-4 bg-[#24172f] hover:bg-[#3d2b48] active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
            >
              <span>Done / Close Pass</span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
