'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getWorkersByCategory(categoryId?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from('workers')
    .select('*, users!inner(full_name, phone, avatar_url), cooperative_societies(name)')
    .eq('is_verified', true)
    .eq('is_active', true);
    
  // If we had a junction table for worker_skills, we'd join here. 
  // For MVP, we will just return all active workers or mock it.
  
  const { data, error } = await query;
    
  if (error) {
    console.error('Error fetching workers:', error);
    return [];
  }
  
  return data;
}

export async function getWorkerProfile(workerId?: string) {
  const supabase = await createClient();
  
  // If no workerId provided, get the logged-in worker's profile
  let queryId = workerId;
  
  if (!queryId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    queryId = user.id;
  }
  
  const { data, error } = await supabase
    .from('workers')
    .select('*, users(*), cooperative_societies(*)')
    .eq('id', queryId)
    .single();
    
  if (error) {
    console.error('Error fetching worker profile:', error);
    return null;
  }
  
  return data;
}

export async function registerWorker(workerData: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');
  
  // Update user type to worker
  await supabase
    .from('users')
    .update({ user_type: 'worker' })
    .eq('id', user.id);
    
  // Insert worker record
  const { data, error } = await supabase
    .from('workers')
    .insert({
      id: user.id, // 1:1 relation with users table
      society_id: workerData.society_id,
      worker_role: workerData.worker_role || 'member',
      experience_years: workerData.experience_years || 0,
      base_hourly_rate: workerData.base_hourly_rate || 100,
      is_verified: false, // Requires admin verification
      is_active: true
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error registering worker:', error);
    return { success: false, error: error.message };
  }
  
  revalidatePath('/worker');
  return { success: true, data };
}
