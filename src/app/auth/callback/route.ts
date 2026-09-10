import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') || requestUrl.searchParams.get('redirect') || '/';

  if (error) {
    console.error('OAuth callback error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    );
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              // Ignored
            }
          },
        },
      }
    );

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError && data?.user) {
      const user = data.user;
      try {
        // Ensure customer record exists if user is not already a worker
        const { data: worker } = await supabase.from('workers').select('id').eq('id', user.id).maybeSingle();
        if (!worker) {
          const { data: customer } = await supabase.from('customers').select('id').eq('id', user.id).maybeSingle();
          if (!customer) {
            const rawDigits = (user.id.replace(/[^0-9]/g, '') + Date.now().toString()).slice(0, 10);
            const fallbackPhone = `+91${rawDigits.padEnd(10, '0')}`;
            const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Customer';
            await supabase.from('customers').upsert({
              id: user.id,
              full_name: fullName,
              email: user.email,
              phone: user.user_metadata?.phone || fallbackPhone,
            }, { onConflict: 'id' });
          }
        }
      } catch (dbErr) {
        console.warn('Could not auto-provision customer record from OAuth:', dbErr);
      }
    }
  }

  // Sanitize redirect target URL
  const cleanNext = next.startsWith('/') ? next : '/';
  return NextResponse.redirect(new URL(cleanNext, requestUrl.origin));
}
