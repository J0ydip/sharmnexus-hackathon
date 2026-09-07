'use client';

import React from 'react';
import { WorkerProfile } from '@/lib/data/mockData';
import { StarRating } from '@/components/customer/StarRating';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  MapPin,
  Building2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkerCardProps {
  worker: WorkerProfile;
  onViewProfile: (worker: WorkerProfile) => void;
  onBookNow: (worker: WorkerProfile) => void;
  isSelected?: boolean;
  categoryName?: string;
  urgency?: 'normal' | 'urgent' | 'emergency';
}

export function WorkerCard({
  worker,
  onViewProfile,
  onBookNow,
  isSelected = false,
}: WorkerCardProps) {
  const matchScore = worker.match_score || 90;

  return (
    <div
      className={cn(
        'group bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#d96f4d]',
        isSelected ? 'border-[#e6aa3b] ring-2 ring-[#e6aa3b]/20 bg-[#fbf7ef]' : 'border-gray-200/90'
      )}
    >
      {/* Header: Avatar, Name, Verified Badge, Match Score */}
      <div className="p-4 sm:p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <img
                src={worker.profile_photo_url}
                alt={worker.full_name}
                className="w-14 h-14 rounded-2xl object-cover border border-gray-100 shadow-xs"
              />
              <span
                className="absolute -bottom-1 -right-1 bg-[#8ba58b] text-white p-0.5 rounded-full ring-2 ring-white"
                title="Verified Cooperative Worker"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-gray-900 text-base group-hover:text-[#d96f4d] transition-colors">
                  {worker.full_name}
                </h3>
                <span className="inline-flex items-center text-[10px] font-bold text-[#8ba58b] bg-[#e2eee4] px-2 py-0.5 rounded-full">
                  ✓ Verified Worker
                </span>
              </div>

              <div className="text-xs font-semibold text-gray-600 mt-0.5 flex items-center gap-1.5">
                <span>{worker.primary_skill}</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500 font-normal">{worker.years_experience} yrs exp</span>
              </div>

              <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[#d96f4d] shrink-0" />
                <span className="truncate max-w-[180px] sm:max-w-[220px]">{worker.society_name}</span>
              </div>
            </div>
          </div>

          {/* Match Score Badge */}
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1 bg-gradient-to-r from-[#24172f] to-[#3d2b48] text-white text-xs font-bold px-2.5 py-1 rounded-xl shadow-xs">
              <Sparkles className="w-3 h-3 text-[#e6aa3b]" />
              <span>{matchScore}%</span>
            </div>
            <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
              Fair Match
            </span>
          </div>
        </div>

        {/* Stats Row: Rating, Jobs, Distance, Availability */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100 text-xs items-start">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-gray-400 font-medium truncate">Rating & Jobs</span>
            <div className="flex items-center gap-1 font-bold text-gray-800 mt-0.5 whitespace-nowrap">
              <span className="text-amber-400 text-xs">★</span>
              <span className="text-xs">{worker.avg_rating ? worker.avg_rating.toFixed(1) : 'New'}</span>
              <span className="text-[10px] text-gray-400 font-normal">({worker.total_jobs_completed})</span>
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-gray-400 font-medium truncate">Proximity</span>
            <div className="flex items-center gap-1 font-bold text-gray-800 mt-0.5 whitespace-nowrap">
              <MapPin className="w-3 h-3 text-[#d96f4d] shrink-0" />
              <span className="text-xs">{worker.approx_distance_km.toFixed(1)} km</span>
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-gray-400 font-medium truncate">Availability</span>
            <div className="flex items-center gap-1 font-bold text-[#8ba58b] mt-0.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8ba58b] animate-pulse shrink-0" />
              <span className="text-xs truncate">Available</span>
            </div>
          </div>
        </div>

        {/* "Why this worker?" highlights */}
        {worker.why_recommended && worker.why_recommended.length > 0 && (
          <div className="mt-3 bg-[#fbf7ef] rounded-xl p-2.5 border border-[#e6dcd0]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#24172f] mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#d96f4d]" />
              Why this worker?
            </div>
            <div className="space-y-1">
              {worker.why_recommended.slice(0, 2).map((reason, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-gray-700 font-medium">
                  <span className="text-[#d96f4d] font-bold">✓</span>
                  <span className="truncate">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer: Price & Actions */}
      <div className="p-4 pt-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-gray-400 uppercase font-medium block">Starting Base</span>
          <div className="text-sm font-extrabold text-gray-900">
            ₹{worker.hourly_rate}
            <span className="text-[10px] font-normal text-gray-500 ml-0.5">/ service</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs h-8 px-3 border-gray-200 text-gray-700 hover:text-[#8ba58b] hover:border-[#d96f4d]"
            onClick={() => onViewProfile(worker)}
          >
            View Profile
          </Button>
          <Button
            type="button"
            size="sm"
            className="text-xs h-8 px-4 bg-[#24172f] hover:bg-[#3d2b48] text-white font-semibold shadow-xs"
            onClick={() => onBookNow(worker)}
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}
