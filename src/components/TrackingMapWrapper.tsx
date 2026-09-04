'use client';
import dynamic from 'next/dynamic';

const TrackingMap = dynamic(() => import('./TrackingMap'), { ssr: false });

export default function TrackingMapWrapper({ lat, lng, status }: { lat: number, lng: number, status: string }) {
  return <TrackingMap lat={lat} lng={lng} status={status} />;
}
