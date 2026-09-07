import { getCustomerBookings } from '@/app/actions/bookings';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function BookingsPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  
  if (!authData.user) {
    redirect('/auth/login');
  }

  const { data: bookings } = await getCustomerBookings(authData.user.id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Your Bookings</h1>
      
      {!bookings || bookings.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <h3 className="text-lg font-medium text-gray-900">No bookings yet</h3>
          <p className="text-gray-500 mt-1 mb-4">You haven't requested any services yet.</p>
          <Link href="/services" className="text-primary font-medium hover:underline">
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    booking.status === 'pending' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                    booking.status === 'accepted' ? 'bg-[#f0e7d9] text-[#24172f] border border-[#e6dcd0]' :
                    booking.status === 'completed' ? 'bg-[#e2eee4] text-[#8ba58b] border border-[#8ba58b]/30' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">{new Date(booking.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="font-semibold text-lg">{booking.service?.name || 'Service'}</h3>
                <p className="text-gray-600">Professional: {booking.worker?.full_name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Scheduled for: {new Date(booking.scheduled_at).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Address: {booking.address}</p>
              </div>
              
              <div className="mt-4 sm:mt-0 text-left sm:text-right">
                <Link href={`/bookings/${booking.id}`} className="font-semibold text-lg text-primary hover:underline">Track Booking &rarr;</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
