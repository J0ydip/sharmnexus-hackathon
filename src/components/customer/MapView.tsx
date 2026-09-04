'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { WorkerProfile } from '@/lib/data/mockData';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/customer/StarRating';
import { CheckCircle2, MapPin, Navigation, ShieldCheck } from 'lucide-react';

interface MapViewProps {
  workers: WorkerProfile[];
  onSelectWorker?: (worker: WorkerProfile) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  userLocation?: [number, number];
  addressName?: string;
}

// Internal map component rendered only on client
function LeafletMapInner({
  workers,
  onSelectWorker,
  center = [25.5941, 85.1376],
  zoom = 13,
  userLocation = [25.5941, 85.1376],
  addressName = 'Your Location (Kankarbagh, Patna)',
}: MapViewProps) {
  const [L, setL] = useState<any>(null);
  const [selectedMarkerWorker, setSelectedMarkerWorker] = useState<WorkerProfile | null>(null);

  useEffect(() => {
    // Dynamically load leaflet on client
    import('leaflet').then((leaflet) => {
      // Fix default leaflet marker icon issue in Next.js
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setL(leaflet);
    });
  }, []);

  if (!L) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-gray-100 rounded-2xl text-gray-400 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          Loading OpenStreetMap cooperative coverage...
        </div>
      </div>
    );
  }

  // Load React Leaflet components dynamically
  const { MapContainer, TileLayer, Marker, Popup, Circle } = require('react-leaflet');

  // Custom emerald worker icon
  const workerIcon = new L.DivIcon({
    className: 'custom-worker-pin',
    html: `
      <div style="background-color: #059669; color: white; border: 2px solid white; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); font-weight: bold; font-size: 13px;">
        🛠️
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });

  // User home icon
  const userIcon = new L.DivIcon({
    className: 'custom-user-pin',
    html: `
      <div style="background-color: #2563eb; color: white; border: 2px solid white; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); font-weight: bold; font-size: 13px;">
        📍
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });

  return (
    <div className="relative w-full h-full min-h-[380px] rounded-2xl overflow-hidden border border-gray-200 shadow-xs">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', minHeight: '380px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Service Location Marker */}
        <Marker position={userLocation} icon={userIcon}>
          <Popup>
            <div className="p-1 text-xs">
              <span className="font-bold text-blue-700 block">Service Address</span>
              <p className="text-gray-600 mt-0.5">{addressName}</p>
            </div>
          </Popup>
        </Marker>

        {/* Proximity Circle (5km service radius) */}
        <Circle
          center={userLocation}
          radius={5000}
          pathOptions={{ color: '#059669', fillColor: '#10b981', fillOpacity: 0.08, weight: 1.5, dashArray: '4' }}
        />

        {/* Worker Markers */}
        {workers.map((worker) => (
          <Marker
            key={worker.id}
            position={[worker.lat || center[0], worker.lng || center[1]]}
            icon={workerIcon}
            eventHandlers={{
              click: () => {
                setSelectedMarkerWorker(worker);
              },
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px] text-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <img
                    src={worker.profile_photo_url}
                    alt={worker.full_name}
                    className="w-9 h-9 rounded-lg object-cover"
                  />
                  <div>
                    <strong className="text-gray-900 block">{worker.full_name}</strong>
                    <span className="text-[10px] text-emerald-700 font-semibold">{worker.primary_skill}</span>
                  </div>
                </div>
                <div className="text-[11px] text-gray-500 mb-2">
                  {worker.society_name} • {worker.approx_distance_km.toFixed(1)} km away
                </div>
                <Button
                  size="sm"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7"
                  onClick={() => onSelectWorker?.(worker)}
                >
                  Select This Worker
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-gray-200/90 shadow-md text-[11px] space-y-1.5 z-[1000] pointer-events-auto">
        <div className="font-bold text-gray-700 mb-1">Coverage Map</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
          <span className="text-gray-600">Your Location</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
          <span className="text-gray-600">Verified Society Workers ({workers.length})</span>
        </div>
      </div>
    </div>
  );
}

export const MapView = dynamic(() => Promise.resolve(LeafletMapInner), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] bg-gray-100 rounded-2xl flex items-center justify-center text-xs text-gray-400">
      Loading OpenStreetMap Leaflet...
    </div>
  ),
});
