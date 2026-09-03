'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const supabase = createClient();
  const router = useRouter();

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success('Successfully logged in!');
      window.location.href = '/';
    } catch (err: any) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="mt-2">
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </div>
      </form>
    </div>
  );
}
