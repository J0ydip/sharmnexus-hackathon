'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCustomerProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (error) {
    console.error('Error fetching customer profile:', error);
    return null;
  }
  
  return data;
}

export async function updateCustomerProfile(updateData: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');
  
  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', user.id);
    
  if (error) {
    console.error('Error updating customer profile:', error);
    return { success: false, error: error.message };
  }
  
  revalidatePath('/profile');
  return { success: true };
}
