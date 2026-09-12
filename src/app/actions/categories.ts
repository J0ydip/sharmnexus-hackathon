'use server';

import { createClient } from '@/lib/supabase/server';
import { cacheThrough, CACHE_KEYS } from '@/lib/redis';

export async function getCategories() {
  return cacheThrough(
    CACHE_KEYS.SERVICE_CATEGORIES,
    async () => {
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
    },
    300 // 5-minute TTL — categories rarely change
  );
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
