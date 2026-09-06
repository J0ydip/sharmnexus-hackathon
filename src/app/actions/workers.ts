'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ---------------------------------------------------------------------------
// getWorkersByCategory — fetch verified, available workers (optionally by cat)
// ---------------------------------------------------------------------------
export async function getWorkersByCategory(categoryId?: string) {
  const supabase = await createClient();

  // If a categoryId is provided, join through worker_skills to filter
  if (categoryId) {
    const { data, error } = await supabase
      .from('worker_skills')
      .select(`
        worker:worker_id (
          id, full_name, phone, email, profile_photo_url,
          is_verified, is_available, avg_rating, total_jobs_completed, address
        )
      `)
      .eq('service_category_id', categoryId)
      .eq('is_verified', true);

    if (error) {
      console.error('Error fetching workers by category:', error);
      return [];
    }

    // Flatten the join and filter available workers, ensuring hourly_rate default
    return (data || [])
      .map((row: any) => ({
        ...row.worker,
        hourly_rate: row.worker?.hourly_rate || 300,
      }))
      .filter((w: any) => w && w.id && w.is_available !== false);
  }

  // No category filter — return all active workers
  const { data, error } = await supabase
    .from('workers')
    .select('id, full_name, phone, email, profile_photo_url, is_verified, is_available, avg_rating, total_jobs_completed, address')
    .eq('is_verified', true);

  if (error) {
    console.error('Error fetching workers:', error);
    return [];
  }

  return (data || []).map((w: any) => ({
    ...w,
    hourly_rate: w.hourly_rate || 300,
  }));
}

// ---------------------------------------------------------------------------
// getWorkerProfile — fetch a single worker's profile
// ---------------------------------------------------------------------------
export async function getWorkerProfile(workerId?: string) {
  const supabase = await createClient();

  let queryId = workerId;
  if (!queryId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    queryId = user.id;
  }

  const { data, error } = await supabase
    .from('workers')
    .select(`
      *,
      skills:worker_skills (
        id, service_category_id, years_experience, certification_name, is_verified,
        category:service_category_id (id, name, icon_url)
      ),
      society:society_id (id, name, district, state)
    `)
    .eq('id', queryId)
    .single();

  if (error) {
    console.error('Error fetching worker profile:', error);
    return null;
  }

  return data;
}

// ---------------------------------------------------------------------------
// createWorkerRegistration — full 3-step worker signup
// ---------------------------------------------------------------------------
export async function createWorkerRegistration(data: {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  aadhaarNumber?: string;
  address?: string;
  serviceCategoryId: string;
  yearsExperience?: number;
  certificationName?: string;
  hourlyRate?: number;
}) {
  const supabase = await createClient();

  // 1. Insert or update workers row
  const { error: workerError } = await supabase
    .from('workers')
    .upsert({
      id: data.id,
      full_name: data.fullName,
      phone: data.phone,
      email: data.email,
      aadhaar_number: data.aadhaarNumber || null,
      address: data.address || null,
      is_verified: true,
      is_available: true,
      verification_status: 'verified',
      avg_rating: 4.8,
      total_jobs_completed: 0,
      profile_photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName)}&background=24172f&color=fff`
    }, { onConflict: 'id' });

  if (workerError) {
    console.error('Error inserting worker record:', workerError);
    return { error: workerError.message };
  }

  // 2. Insert into worker_skills
  if (data.serviceCategoryId) {
    const { error: skillError } = await supabase
      .from('worker_skills')
      .upsert({
        worker_id: data.id,
        service_category_id: data.serviceCategoryId,
        years_experience: data.yearsExperience || 3,
        certification_name: data.certificationName || 'Certified Professional',
        is_verified: true
      }, { onConflict: 'worker_id,service_category_id' });

    if (skillError) {
      console.warn('Worker skill insert notice:', skillError);
    }
  }

  revalidatePath('/worker-dashboard');
  revalidatePath('/worker-profile');
  return { success: true };
}

// ---------------------------------------------------------------------------
// updateWorkerAvailability — toggle online/offline duty status
// ---------------------------------------------------------------------------
export async function updateWorkerAvailability(workerId: string, isAvailable: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('workers')
    .update({ is_available: isAvailable })
    .eq('id', workerId);

  if (error) {
    console.error('Error updating worker availability:', error);
    return { error: error.message };
  }

  revalidatePath('/worker-dashboard');
  revalidatePath('/worker-profile');
  return { success: true };
}

// ---------------------------------------------------------------------------
// updateWorkerCategory — change primary trade category
// ---------------------------------------------------------------------------
export async function updateWorkerCategory(workerId: string, newCategoryId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  // Check if worker already has a skill entry
  const { data: existing } = await supabase
    .from('worker_skills')
    .select('id')
    .eq('worker_id', workerId)
    .limit(1);

  let opError;
  if (existing && existing.length > 0) {
    const res = await supabase
      .from('worker_skills')
      .update({ service_category_id: newCategoryId })
      .eq('id', existing[0].id);
    opError = res.error;
  } else {
    const res = await supabase
      .from('worker_skills')
      .insert({
        worker_id: workerId,
        service_category_id: newCategoryId,
        years_experience: 3,
        is_verified: true
      });
    opError = res.error;
  }

  if (opError) {
    console.error('Error updating worker category:', opError);
    return { error: opError.message };
  }

  revalidatePath('/worker-dashboard');
  revalidatePath('/worker-profile');
  return { success: true };
}
