'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fcfbfa',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'var(--sans, system-ui, -apple-system, sans-serif)',
        color: '#24172f',
      }}
    >
      <div
        style={{
          width: '76px',
          height: '76px',
          background: '#fee2e2',
          color: '#ef4444',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.2rem',
          marginBottom: '1.25rem',
          boxShadow: '0 8px 24px rgba(239, 68, 68, 0.15)',
        }}
      >
        ⚠️
      </div>
      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 800,
          margin: '0 0 0.5rem 0',
          color: '#24172f',
        }}
      >
        Something went wrong
      </h1>
      <p
        style={{
          maxWidth: '480px',
          color: '#6b7280',
          fontSize: '0.95rem',
          lineHeight: 1.5,
          marginBottom: '1.75rem',
        }}
      >
        An unexpected state occurred while processing this request. Your data and bookings remain completely safe in the cooperative database.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            background: 'linear-gradient(135deg, #e6aa3b 0%, #d96f4d 100%)',
            color: '#fff',
            fontWeight: 700,
            padding: '0.75rem 1.75rem',
            borderRadius: '10px',
            border: 'none',
            fontSize: '0.92rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(217, 111, 77, 0.3)',
          }}
        >
          ↻ Try Again
        </button>
        <Link
          href="/"
          style={{
            background: '#fff',
            color: '#24172f',
            fontWeight: 600,
            padding: '0.75rem 1.5rem',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '0.92rem',
            border: '1px solid #e5e7eb',
          }}
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
