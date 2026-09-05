import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function EarningsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch all completed bookings for this worker
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, customers(full_name, phone), service_categories(name)')
    .eq('worker_id', user.id)
    .order('scheduled_at', { ascending: false });

  const completedJobs = bookings?.filter(b => b.status === 'completed') || [];
  const inProgressJobs = bookings?.filter(b => b.status === 'in_progress' || b.status === 'confirmed') || [];

  const grossEarnings = completedJobs.reduce((acc, curr) => acc + (curr.final_price || curr.estimated_price || 350), 0);
  const netEarnings = Math.round(grossEarnings * 0.85); // 85% to worker
  const welfareContribution = Math.round(grossEarnings * 0.05); // 5% cooperative welfare
  const platformFee = grossEarnings - netEarnings - welfareContribution; // 10% platform

  return (
    <div className="p-4 space-y-6 max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Earnings Dashboard</h1>
          <p className="text-xs text-gray-500">Transparent earnings and welfare splits powered by SharmNexus</p>
        </div>
        <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
          ● Payouts Active
        </span>
      </div>

      {/* Main Net Earnings Card */}
      <div className="bg-gradient-to-tr from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl">
        <p className="text-xs font-medium uppercase tracking-wider text-emerald-100">Take-Home Payouts (85% Net)</p>
        <div className="text-4xl font-extrabold mt-1">₹{netEarnings.toLocaleString('en-IN')}</div>
        <p className="text-xs text-emerald-200 mt-1">Gross billed: ₹{grossEarnings.toLocaleString('en-IN')}</p>

        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-emerald-500/40 text-center text-xs">
          <div>
            <p className="text-emerald-200">Jobs Done</p>
            <p className="text-lg font-bold text-white mt-0.5">{completedJobs.length}</p>
          </div>
          <div>
            <p className="text-emerald-200">Welfare Fund</p>
            <p className="text-lg font-bold text-white mt-0.5">₹{welfareContribution}</p>
          </div>
          <div>
            <p className="text-emerald-200">Pending</p>
            <p className="text-lg font-bold text-white mt-0.5">{inProgressJobs.length} active</p>
          </div>
        </div>
      </div>

      {/* Fair Share Breakdown Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-sm text-gray-800 mb-3">Cooperative Fair-Share Model</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-emerald-700">Worker Share (You)</span>
              <span className="text-emerald-700">85% (₹{netEarnings})</span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[85%] rounded-full"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-blue-700">Platform Maintenance</span>
              <span className="text-blue-700">10% (₹{platformFee})</span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[10%] rounded-full"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-purple-700">Cooperative Welfare & Health Pool</span>
              <span className="text-purple-700">5% (₹{welfareContribution})</span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full w-[5%] rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Jobs History */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-800">Completed Service Records</h2>
          <Link href="/jobs" className="text-xs text-blue-600 font-semibold hover:underline">
            View active jobs →
          </Link>
        </div>

        {completedJobs.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center space-y-2">
            <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ₹
            </div>
            <h3 className="font-semibold text-gray-800">No paid service payouts yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Once you accept and complete customer requests in the Jobs tab, your verified earnings and transparent payouts will appear right here.
            </p>
            <div className="pt-2">
              <Link href="/jobs" className="inline-block bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow hover:bg-blue-500 transition-colors">
                Check Incoming Requests
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {completedJobs.map(job => {
              const gross = job.final_price || job.estimated_price || 350;
              const net = Math.round(gross * 0.85);
              return (
                <div key={job.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-gray-800">{job.customers?.full_name || 'Customer Booking'}</h3>
                    <p className="text-xs text-gray-500">
                      {job.service_categories?.name || 'Service'} · {new Date(job.scheduled_at).toLocaleDateString()}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{job.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-extrabold text-emerald-600">+₹{net}</p>
                    <span className="inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Settled
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
