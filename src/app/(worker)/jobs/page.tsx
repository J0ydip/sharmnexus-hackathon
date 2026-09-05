'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateBookingStatus } from '@/app/actions/worker-jobs';
import { toast } from 'sonner';

export default function WorkerJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchJobs() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('bookings')
        .select('*, customers(full_name, phone)')
        .eq('worker_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setJobs(data);
      setLoading(false);
    }
    fetchJobs();
  }, [supabase]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateBookingStatus(id, status);
      setJobs(jobs.map(j => j.id === id ? { ...j, status } : j));
      toast.success(`Job ${status} successfully`);
    } catch (err) {
      toast.error('Failed to update job status');
    }
  };

  const pendingJobs = jobs.filter(j => j.status === 'requested' || j.status === 'pending');
  const activeJobs = jobs.filter(j => j.status === 'confirmed' || j.status === 'in_progress');
  const completedJobs = jobs.filter(j => j.status === 'completed');

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading jobs...</div>;

  return (
    <div className="p-4 space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Incoming Requests ({pendingJobs.length})</h2>
        {pendingJobs.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
            No new requests.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingJobs.map(job => (
              <div key={job.id} className="bg-white p-4 rounded-xl shadow border border-yellow-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{job.customers?.full_name || 'Customer'}</h3>
                    <p className="text-sm text-gray-500">{new Date(job.scheduled_at).toLocaleString()}</p>
                  </div>
                  <div className="text-lg font-bold text-green-600">₹{job.final_price || job.estimated_price || 350}</div>
                </div>
                <div className="text-sm text-gray-700 mb-4 bg-gray-50 p-2 rounded">
                  <span className="font-semibold block">Address:</span>
                  {job.address}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleStatusChange(job.id, 'confirmed')} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">
                    Accept
                  </button>
                  <button onClick={() => handleStatusChange(job.id, 'cancelled')} className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-medium hover:bg-red-200">
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Active Jobs ({activeJobs.length})</h2>
        {activeJobs.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
            No active jobs.
          </div>
        ) : (
          <div className="space-y-4">
            {activeJobs.map(job => (
              <div key={job.id} className="bg-white p-4 rounded-xl shadow border border-blue-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{job.customers?.full_name || 'Customer'}</h3>
                    <p className="text-sm text-gray-500">{new Date(job.scheduled_at).toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">{job.status}</div>
                </div>
                <div className="text-sm text-gray-700 mb-4 bg-gray-50 p-2 rounded">
                  <span className="font-semibold block">Address:</span>
                  {job.address}
                </div>
                {job.status === 'confirmed' && (
                  <button onClick={() => handleStatusChange(job.id, 'in_progress')} className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600">
                    Start Work
                  </button>
                )}
                {job.status === 'in_progress' && (
                  <button onClick={() => handleStatusChange(job.id, 'completed')} className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700">
                    Mark Completed
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {completedJobs.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Completed Jobs ({completedJobs.length})</h2>
          <div className="space-y-3">
            {completedJobs.map(job => (
              <div key={job.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-800">{job.customers?.full_name || 'Customer'}</h3>
                  <p className="text-xs text-gray-500">{new Date(job.scheduled_at).toLocaleDateString()} · {job.address}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-600">₹{job.final_price || job.estimated_price || 350}</span>
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Completed</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

