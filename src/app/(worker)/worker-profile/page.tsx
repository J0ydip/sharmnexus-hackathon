'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import CategorySelector from '@/components/CategorySelector';

export default function WorkerProfilePage() {
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('workers')
        .select('*, worker_skills(*, service_categories(name))')
        .eq('id', user.id)
        .single();

      if (data) setWorker(data);
      setLoading(false);
    }
    fetchProfile();
  }, [supabase]);

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading Profile...</div>;

  const primarySkill = worker?.worker_skills?.[0];
  const professionName = primarySkill?.service_categories?.name || 'Verified Professional';

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto pb-24">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Digital ID Card</h2>
      
      {/* ID Card Design */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden relative">
        <div className="bg-blue-600 h-24 absolute top-0 w-full left-0 z-0"></div>
        <div className="relative z-10 p-6 flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg mb-4 mt-8">
            <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-4xl font-bold text-blue-700">
              {worker?.full_name?.charAt(0) || 'W'}
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{worker?.full_name}</h3>
          <p className="text-blue-600 font-semibold">{professionName}</p>
          
          <div className="w-full mt-8 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Worker ID</p>
                <p className="font-medium text-gray-800">{worker?.id?.substring(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                <p className="font-medium text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Verified
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Phone</p>
                <p className="font-medium text-gray-800">{worker?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Joined</p>
                <p className="font-medium text-gray-800">{new Date(worker?.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 border-t pt-4 w-full text-center">
            <p className="text-xs text-gray-400">SharmNexus Official Worker Platform</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
        <h3 className="font-bold text-lg mb-4">Skill Profile</h3>
        <div className="flex flex-wrap gap-2">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">Background Checked</span>
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">5+ Years Exp</span>
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{professionName} Expert</span>
        </div>
        <CategorySelector workerId={worker?.id} initialCategoryId={primarySkill?.service_category_id || null} />
      </div>
    </div>
  );
}
