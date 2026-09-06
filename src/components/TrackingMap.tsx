'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function TrackingMap({ lat, lng, status }: { lat: number, lng: number, status: string }) {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('tracking-map').setView([lat, lng], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapRef.current);

      // Customer Location
      const customerIcon = L.divIcon({
        className: 'custom-div-icon',
        html: '<div style="background-color:#4F46E5;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 0 5px rgba(0,0,0,0.3);"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      L.marker([lat, lng], { icon: customerIcon }).addTo(mapRef.current).bindPopup('Your Location').openPopup();

      // Worker Simulated Location
      if (status === 'confirmed' || status === 'in_progress') {
        const workerIcon = L.divIcon({
          className: 'custom-div-icon',
          html: '<div style="background-color:#EAB308;width:30px;height:30px;border-radius:50%;border:3px solid white;box-shadow:0 0 5px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;">W</div>',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });
        
        // Offset worker slightly
        const wLat = lat + 0.005;
        const wLng = lng + 0.005;
        L.marker([wLat, wLng], { icon: workerIcon }).addTo(mapRef.current).bindPopup('Worker is on the way!');
        
        // Draw polyline
        L.polyline([[lat, lng], [wLat, wLng]], { color: '#EAB308', dashArray: '5, 10' }).addTo(mapRef.current);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lng, status]);

  return <div id="tracking-map" className="w-full h-full rounded-xl z-0" />;
}
