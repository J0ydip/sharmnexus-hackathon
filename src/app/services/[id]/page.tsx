import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function ServiceWorkersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch category details
  const { data: category } = await supabase
    .from('service_categories')
    .select('*')
    .eq('id', id)
    .single();

  // Fetch workers for this category via worker_skills
  const { data: workerSkills } = await supabase
    .from('worker_skills')
    .select('*, worker:worker_id(*)')
    .eq('service_category_id', id);

  const workers = workerSkills?.map(ws => ws.worker).filter(w => w?.is_verified) || [];

  if (!category) {
    return <div className="p-8">Category not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/services">
          <Button variant="outline" size="sm">← Back</Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{category.name} Professionals</h1>
          <p className="text-gray-600">{category.description}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {!workers || workers.length === 0 ? (
          <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900">No professionals available</h3>
            <p className="text-gray-500 mt-1">Check back later or try another category.</p>
          </div>
        ) : (
          workers.map((worker) => (
            <div key={worker.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-gray-300 transition-colors">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={worker.profile_image || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                    {worker.users?.full_name?.charAt(0) || 'W'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{worker.full_name || 'Worker'}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="flex items-center text-yellow-500 font-medium">
                      ★ {worker.rating?.toFixed(1) || '4.5'}
                    </span>
                    <span>•</span>
                    <span>₹{category.base_price}/hr</span>
                    <span>•</span>
                    <span>{workerSkills?.find(ws => ws.worker_id === worker.id)?.years_experience || 2} yrs exp</span>
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-auto mt-4 sm:mt-0">
                <Link href={`/book/${worker.id}?serviceId=${category.id}`}>
                  <Button className="w-full sm:w-auto">Book Now</Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
