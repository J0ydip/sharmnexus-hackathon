import Link from 'next/link';

export default function NotFound() {
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
          width: '80px',
          height: '80px',
          background: '#fef3c7',
          color: '#d97706',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 24px rgba(217, 119, 6, 0.15)',
        }}
      >
        🧭
      </div>
      <h1
        style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          margin: '0 0 0.5rem 0',
          color: '#24172f',
        }}
      >
        404 — Page Not Found
      </h1>
      <p
        style={{
          maxWidth: '460px',
          color: '#6b7280',
          fontSize: '1rem',
          lineHeight: 1.5,
          marginBottom: '2rem',
        }}
      >
        The page or resource you are looking for does not exist or has been relocated within the ShramNexus Cooperative Federation platform.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            background: 'linear-gradient(135deg, #e6aa3b 0%, #d96f4d 100%)',
            color: '#fff',
            fontWeight: 700,
            padding: '0.75rem 1.75rem',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '0.92rem',
            boxShadow: '0 4px 14px rgba(217, 111, 77, 0.3)',
          }}
        >
          Return to Home
        </Link>
        <Link
          href="/admin"
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
          Admin Console
        </Link>
        <Link
          href="/cooperative"
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
          Cooperative Portal
        </Link>
      </div>
    </div>
  );
}
