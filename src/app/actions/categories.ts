'use server';

import { createClient } from '@/lib/supabase/server';

export async function getCategories() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('is_active', true)
    .order('name');
    
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  return data;
}

export async function getCategoryById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }
  
  return data;
}
