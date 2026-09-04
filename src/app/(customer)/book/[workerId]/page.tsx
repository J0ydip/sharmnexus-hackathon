'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createBooking } from '@/app/actions/bookings';
import dynamic from 'next/dynamic';

// Dynamically import map to avoid SSR window errors
const MapPicker = dynamic(() => import('@/components/MapPicker'), { ssr: false });

export default function BookWorkerPage({ params }: { params: Promise<{ workerId: string }> }) {
  const { workerId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('serviceId');
  
  const [userId, setUserId] = useState<string | null>(null);
  const [workerName, setWorkerName] = useState('Worker');
  const [serviceName, setServiceName] = useState('Service');
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      // Get logged in user
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        toast.error('You must be logged in to book');
        router.push('/auth/login');
        return;
      }
      setUserId(authData.user.id);

      // Fetch worker name
      if (workerId) {
        const { data: workerData } = await supabase
          .from('workers')
          .select('full_name')
          .eq('id', workerId)
          .single();
        if (workerData) setWorkerName(workerData.full_name);
      }

      // Fetch service name
      if (serviceId) {
        const { data: serviceData } = await supabase
          .from('service_categories')
          .select('name')
          .eq('id', serviceId)
          .single();
        if (serviceData) setServiceName(serviceData.name);
      }
    }
    loadData();
  }, [workerId, serviceId, supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !serviceId) return;
    
    if (!date || !time || !address || !lat || !lng) {
      toast.error('Please complete all fields and select a location on the map');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await createBooking({
        customer_id: userId,
        worker_id: workerId,
        service_id: serviceId,
        booking_date: date,
        booking_time: time,
        address_line1: address,
        latitude: lat,
        longitude: lng,
      });

      if (error) {
        toast.error('Failed to book: ' + error);
        setIsSubmitting(false);
        return;
      }

      toast.success('Booking confirmed!');
      router.push('/bookings');
    } catch (err) {
      toast.error('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Book {serviceName}</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h2 className="font-semibold text-lg mb-1">Professional: {workerName}</h2>
        <p className="text-gray-500 text-sm mb-6">Please provide your booking details below.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                type="date" 
                min={new Date().toISOString().split('T')[0]} 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input 
                id="time" 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Full Address (House, Street, Area)</Label>
            <Input 
              id="address" 
              placeholder="e.g. 123 Main St, Apartment 4B" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required 
            />
          </div>

          <div className="space-y-2">
            <Label>Pinpoint Location on Map</Label>
            <p className="text-xs text-gray-500 mb-2">Click on the map to accurately place your booking location.</p>
            <MapPicker 
              onLocationSelect={(latitude, longitude) => {
                setLat(latitude);
                setLng(longitude);
              }} 
            />
            {lat && lng && (
              <p className="text-xs text-green-600 mt-1">✓ Location selected successfully.</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Confirming Booking...' : 'Confirm Booking'}
          </Button>
        </form>
      </div>
    </div>
  );
}
