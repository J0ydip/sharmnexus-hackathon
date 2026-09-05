import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import OnlineToggle from '@/components/OnlineToggle';

export default async function WorkerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get total earnings and completed jobs
  const { data: worker } = await supabase
    .from('workers')
    .select('*')
    .eq('id', user?.id)
    .single();

  const { data: jobs } = await supabase
    .from('bookings')
    .select('*')
    .eq('worker_id', user?.id)
    .order('created_at', { ascending: false });

  const pendingJobs = jobs?.filter(j => j.status === 'requested' || j.status === 'pending') || [];
  const activeJobs = jobs?.filter(j => j.status === 'confirmed' || j.status === 'in_progress') || [];
  const completedJobs = jobs?.filter(j => j.status === 'completed') || [];
  
  const totalEarnings = completedJobs.reduce((acc, curr) => acc + (curr.final_price || curr.estimated_price || 350), 0);

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto pb-24">
      {pendingJobs.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
            <div>
              <p className="font-bold text-amber-900 text-sm">{pendingJobs.length} New Booking Request{pendingJobs.length > 1 ? 's' : ''}</p>
              <p className="text-xs text-amber-700">Customers are waiting for your acceptance</p>
            </div>
          </div>
          <Link href="/jobs" className="bg-amber-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow hover:bg-amber-600 transition-colors">
            Review Jobs →
          </Link>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-sm font-medium opacity-80 mb-1">Total Earnings</h2>
        <div className="text-4xl font-bold mb-4">₹{totalEarnings}</div>
        <div className="flex justify-between items-center text-sm border-t border-blue-500/30 pt-4 mt-4">
          <div>
            <div className="opacity-80">Jobs Completed</div>
            <div className="font-semibold text-lg">{completedJobs.length}</div>
          </div>
          <div>
            <div className="opacity-80">Current Rating</div>
            <div className="font-semibold text-lg flex items-center">
              {worker?.avg_rating || '4.8'} <span className="text-yellow-400 ml-1">★</span>
            </div>
          </div>
        </div>
      </div>

      <OnlineToggle workerId={user?.id || ''} initialStatus={worker?.is_available || false} />

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Active Jobs ({activeJobs.length})</h2>
          <Link href="/jobs" className="text-sm text-blue-600 font-medium">View all</Link>
        </div>
        
        {activeJobs.length === 0 ? (
          <div className="bg-white p-6 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
            No active jobs right now.
          </div>
        ) : (
          <div className="space-y-3">
            {activeJobs.map(job => (
              <div key={job.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-800">{new Date(job.scheduled_at).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-500 line-clamp-1">{job.address}</div>
                </div>
                <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-medium">
                  {job.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

