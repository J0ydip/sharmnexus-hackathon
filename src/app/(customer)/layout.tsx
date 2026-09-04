import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogOutButton from '@/components/LogOutButton';

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Workers shouldn't access the customer portal
  if (user.user_metadata?.user_type === 'worker') {
    redirect('/worker-dashboard');
  }

  return <>{children}</>;
}

