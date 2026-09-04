'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function OnlineToggle({ workerId, initialStatus }: { workerId: string, initialStatus: boolean }) {
  const [isOnline, setIsOnline] = useState(initialStatus);
  const supabase = createClient();

  const toggleStatus = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    
    // Save to database
    const { error } = await supabase
      .from('workers')
      .update({ is_available: newStatus })
      .eq('id', workerId);

    if (error) {
      setIsOnline(isOnline); // Revert
      toast.error('Failed to update status');
      return;
    }

    toast.success(newStatus ? 'You are now Online and visible to customers!' : 'You are now Offline.');
  };

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div>
        <h3 className="font-bold text-gray-800">Duty Status</h3>
        <p className="text-sm text-gray-500">{isOnline ? 'Accepting new jobs' : 'Not accepting jobs'}</p>
      </div>
      <button 
        onClick={toggleStatus}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isOnline ? 'translate-x-6' : 'translate-x-1'}`}/>
      </button>
    </div>
  );
}
