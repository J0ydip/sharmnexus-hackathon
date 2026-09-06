import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Deterministically generates or retrieves a 4-digit verification OTP for a booking.
 * Used for in-person service completion verification between Customer and Worker.
 */
export function getBookingOtp(bookingId?: string | null, fallbackOtp?: string | null): string {
  // 1. If explicit 4-digit OTP provided on object, respect it
  if (fallbackOtp && /^\d{4}$/.test(fallbackOtp)) {
    return fallbackOtp;
  }

  // 2. Check localStorage cache if available in browser
  if (typeof window !== 'undefined' && bookingId) {
    try {
      const stored = localStorage.getItem(`shramnexus_otp_${bookingId}`) || localStorage.getItem(`sharmnexus_otp_${bookingId}`);
      if (stored && /^\d{4}$/.test(stored)) {
        return stored;
      }
    } catch {}
  }

  if (!bookingId) return '4829';

  // 3. Known demo presets
  if (bookingId === 'SN-2026-8941' || bookingId === 'JOB099' || bookingId === 'REQ001') {
    return '4829';
  }
  if (bookingId === 'SN-2026-7812' || bookingId === 'JOB098' || bookingId === 'REQ002') {
    return '1192';
  }

  // 4. Deterministic hash from bookingId
  let hash = 0;
  for (let i = 0; i < bookingId.length; i++) {
    const char = bookingId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const pin = (1000 + (Math.abs(hash) % 9000)).toString();

  // Cache to localStorage for seamless cross-component reading
  if (typeof window !== 'undefined' && bookingId) {
    try {
      localStorage.setItem(`shramnexus_otp_${bookingId}`, pin);
      localStorage.setItem(`sharmnexus_otp_${bookingId}`, pin);
    } catch {}
  }

  return pin;
}
