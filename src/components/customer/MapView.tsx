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
  city?: string;
  onLocationSelect?: (coords: [number, number], address?: string) => void;
  interactive?: boolean;
}

// Internal map component rendered only on client
function LeafletMapInner({
  workers,
  onSelectWorker,
  center = [22.5726, 88.3639],
  zoom = 13,
  userLocation = [22.5726, 88.3639],
  addressName = 'Your Service Location',
  city,
  onLocationSelect,
  interactive = true,
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
          <div className="w-4 h-4 border-2 border-[#e6aa3b] border-t-transparent rounded-full animate-spin" />
          Loading interactive OpenStreetMap coverage...
        </div>
      </div>
    );
  }

  // Load React Leaflet components dynamically
  const { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } = require('react-leaflet');

  // Helper component to re-center map dynamically when props change
  function ChangeMapView({ targetCenter, targetZoom }: { targetCenter: [number, number]; targetZoom: number }) {
    const map = useMap();
    useEffect(() => {
      if (targetCenter && targetCenter[0] && targetCenter[1]) {
        map.flyTo(targetCenter, targetZoom, { duration: 1.2 });
      }
    }, [targetCenter[0], targetCenter[1], targetZoom, map]);
    return null;
  }

  // Helper component to handle user clicking on map to place pin
  function MapClickHandler({ onSelect }: { onSelect?: (coords: [number, number], address?: string) => void }) {
    useMapEvents({
      click: async (e: any) => {
        if (!onSelect || !interactive) return;
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
          const data = await res.json();
          const road = data.address?.road || data.address?.suburb || data.address?.neighbourhood || '';
          const detectedCity = data.address?.city || data.address?.town || data.address?.state_district || 'Local Area';
          const fullAddr = [road, detectedCity].filter(Boolean).join(', ') || data.display_name;
          onSelect([lat, lng], fullAddr);
        } catch (err) {
          onSelect([lat, lng]);
        }
      },
    });
    return null;
  }

  // Custom luxury worker icon
  const workerIcon = new L.DivIcon({
    className: 'custom-worker-pin',
    html: `
      <div style="background-color: #24172f; color: #f5dfad; border: 2px solid #e6aa3b; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); font-weight: bold; font-size: 13px;">
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
      <div style="background-color: #d96f4d; color: white; border: 2px solid white; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); font-weight: bold; font-size: 13px;">
        📍
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });

  // Dynamically cluster workers around active user location or center if user is not in Patna
  const isCustomLocation = Math.abs(userLocation[0] - 25.5941) > 0.1 || Math.abs(userLocation[1] - 85.1376) > 0.1;
  const displayWorkers = workers.map((w, idx) => {
    if (!isCustomLocation && w.lat && w.lng) return w;
    // Offset workers nicely around the user location (~1.2 to 4 km)
    const angle = (idx * (360 / Math.max(workers.length, 1))) * (Math.PI / 180);
    const dist = 0.012 + (idx % 3) * 0.01;
    const lat = userLocation[0] + Math.cos(angle) * dist;
    const lng = userLocation[1] + Math.sin(angle) * dist;
    const localSociety = city ? `${city} Labour Cooperative Federation` : 'Local Labour Cooperative Society';
    return {
      ...w,
      lat,
      lng,
      society_name: localSociety,
    };
  });

  return (
    <div className="relative isolate z-0 w-full h-full min-h-[380px] rounded-2xl overflow-hidden border border-gray-200 shadow-xs">
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

        <ChangeMapView targetCenter={center} targetZoom={zoom} />
        {onLocationSelect && <MapClickHandler onSelect={onLocationSelect} />}

        {/* User Service Location Marker */}
        <Marker position={userLocation} icon={userIcon}>
          <Popup>
            <div className="p-1 text-xs">
              <span className="font-bold text-[#d96f4d] block">Service Location</span>
              <p className="text-gray-600 mt-0.5">{addressName}</p>
              {interactive && (
                <span className="text-[10px] text-gray-400 mt-1 block italic">
                  Tap or click map to reposition pin
                </span>
              )}
            </div>
          </Popup>
        </Marker>

        {/* Proximity Circle (5km service radius) */}
        <Circle
          center={userLocation}
          radius={5000}
          pathOptions={{ color: '#d96f4d', fillColor: '#e6aa3b', fillOpacity: 0.1, weight: 1.5, dashArray: '4' }}
        />

        {/* Worker Markers */}
        {displayWorkers.map((worker) => (
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
                    <span className="text-[10px] text-[#d96f4d] font-semibold">{worker.primary_skill}</span>
                  </div>
                </div>
                <div className="text-[11px] text-gray-500 mb-2">
                  {worker.society_name} • {worker.approx_distance_km ? `${worker.approx_distance_km.toFixed(1)} km away` : 'Nearby'}
                </div>
                <Button
                  size="sm"
                  className="w-full bg-[#24172f] hover:bg-[#3d2b48] text-white text-[11px] h-7"
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
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-gray-200/90 shadow-md text-[11px] space-y-1.5 z-10 pointer-events-auto">
        <div className="font-bold text-gray-700 mb-1">
          {city ? `${city} Network` : 'Cooperative Coverage'}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#d96f4d] inline-block" />
          <span className="text-gray-600">Your Location</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#24172f] inline-block border border-[#e6aa3b]" />
          <span className="text-gray-600">Verified Society Workers ({displayWorkers.length})</span>
        </div>
        {interactive && (
          <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-100 italic">
            Click map to adjust pin
          </div>
        )}
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
