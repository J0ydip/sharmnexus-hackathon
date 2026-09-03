import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MapPin, CheckCircle } from 'lucide-react';

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;
  const categoryId = resolvedParams.category;

  // Let's fetch workers for this category (mocking the join for now)
  // In a real app we would join workers with worker_skills
  const { data: workers } = await supabase
    .from('workers')
    .select('*, cooperative_societies(name)')
    .eq('is_verified', true);

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Available Workers</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workers?.map((worker) => (
          <Card key={worker.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    {worker.full_name}
                    <CheckCircle className="h-4 w-4 text-blue-500 ml-1" />
                  </CardTitle>
                  <CardDescription className="text-xs mt-1 text-emerald-600 font-medium">
                    {worker.cooperative_societies?.name || 'Independent Society'}
                  </CardDescription>
                </div>
                <div className="flex items-center bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  {worker.avg_rating || 'New'}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3 text-sm text-muted-foreground">
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                2.5 km away
              </div>
              <div className="mt-2">
                Completed {worker.total_jobs_completed} jobs
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/booking/confirm?worker=${worker.id}`} className={buttonVariants({ className: "w-full" })}>
                Book Now
              </Link>
            </CardFooter>
          </Card>
        ))}
        
        {(!workers || workers.length === 0) && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No workers available right now. Please check back later.
          </div>
        )}
      </div>
    </div>
  );
}
