'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CategorySelector({ workerId, initialCategoryId }: { workerId: string, initialCategoryId: string | null }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState(initialCategoryId || '');
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('service_categories').select('id, name').order('name');
      if (data) setCategories(data);
    }
    fetchCategories();
  }, [supabase]);

  const handleUpdate = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedId(newId);
    setIsSaving(true);
    
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
        .update({ service_category_id: newId })
        .eq('worker_id', workerId);
      opError = res.error;
    } else {
      const res = await supabase
        .from('worker_skills')
        .insert({
          worker_id: workerId,
          service_category_id: newId,
          years_experience: 3,
          is_verified: true
        });
      opError = res.error;
    }
      
    setIsSaving(false);
    
    if (opError) {
      toast.error('Failed to update category: ' + opError.message);
    } else {
      toast.success('Professional trade category updated!');
      router.refresh();
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <label className="block text-sm font-bold text-gray-700 mb-2">Select Your Profession</label>
      <div className="relative">
        <select 
          value={selectedId}
          onChange={handleUpdate}
          disabled={isSaving}
          className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 appearance-none"
        >
          <option value="" disabled>Choose your profession...</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    </div>
  );
}
