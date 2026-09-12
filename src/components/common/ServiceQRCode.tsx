'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, QrCode, X, CheckCircle } from 'lucide-react';

interface ServiceQRCodeProps {
  bookingId: string;
  workerName?: string;
  customerName?: string;
  serviceTitle?: string;
  otp: string;
}

export function ServiceQRCode({
  bookingId,
  workerName,
  customerName,
  serviceTitle,
  otp,
}: ServiceQRCodeProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Encode structured payload for instant doorstep verification
  const qrPayload = JSON.stringify({
    app: 'ShramNexus',
    bookingId,
    otp,
    worker: workerName || 'Artisan',
    service: serviceTitle || 'Home Service',
    verifiedAt: new Date().toISOString(),
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all shadow-xs"
        title="Display Secure Doorstep QR Code"
      >
        <QrCode className="w-4 h-4 text-[#f5dfad]" />
        <span>Show Verification QR</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24172f]/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border border-gray-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#f5dfad]/40 text-[#d96f4d] flex items-center justify-center mx-auto mb-4 border border-[#e6aa3b]/30">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-extrabold text-[#24172f]">
              Doorstep Service Pass
            </h3>
            <p className="text-xs text-gray-500 mt-1 mb-6">
              Show this QR code to {workerName || 'the artisan'} upon arrival to verify booking integrity.
            </p>

            <div className="bg-gradient-to-b from-[#fcfbfa] to-[#f8f6f2] p-5 rounded-2xl border border-gray-200 shadow-inner flex flex-col items-center justify-center mx-auto">
              <QRCodeSVG
                value={qrPayload}
                size={180}
                level="H"
                includeMargin
                fgColor="#24172f"
              />
              <div className="mt-3 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                  Verification PIN
                </span>
                <span className="font-mono text-xl font-black tracking-widest text-[#d96f4d]">
                  {otp}
                </span>
              </div>
            </div>

            <div className="mt-5 text-left bg-gray-50 rounded-xl p-3.5 border border-gray-200 text-xs text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Booking ID:</span>
                <span className="font-mono font-semibold text-[#24172f]">#{bookingId.substring(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Service:</span>
                <span className="font-semibold text-[#24172f]">{serviceTitle || 'General Service'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cooperative Guarantee:</span>
                <span className="font-semibold text-emerald-600 inline-flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> 30-Day Warranty
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-6 w-full py-2.5 px-4 bg-[#24172f] text-white text-xs font-bold rounded-xl hover:bg-[#3d2b48] transition-colors"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
