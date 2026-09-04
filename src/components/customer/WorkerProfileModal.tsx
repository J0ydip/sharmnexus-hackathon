'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/customer/StarRating';
import { FairMatchExplainer } from '@/components/customer/FairMatchExplainer';
import { WorkerProfile } from '@/lib/data/mockData';
import {
  CheckCircle2,
  MapPin,
  Clock,
  Award,
  Building2,
  ShieldCheck,
} from 'lucide-react';

interface WorkerProfileModalProps {
  worker: WorkerProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: (worker: WorkerProfile) => void;
  categoryName?: string;
  urgency?: 'normal' | 'urgent' | 'emergency';
}

export function WorkerProfileModal({
  worker,
  isOpen,
  onClose,
  onBook,
  categoryName,
  urgency,
}: WorkerProfileModalProps) {
  if (!worker) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border border-gray-200">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 pt-7">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative">
              <img
                src={worker.profile_photo_url}
                alt={worker.full_name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-white">{worker.full_name}</h3>
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Cooperative Craftsman
                </span>
              </div>

              <p className="text-emerald-100 text-xs mt-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {worker.society_name}
              </p>

              <div className="flex items-center gap-3 text-xs text-emerald-50 mt-2.5 flex-wrap">
                <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-md">
                  <StarRating rating={worker.avg_rating} size="sm" />
                </div>
                <span>•</span>
                <span className="font-medium">{worker.total_jobs_completed} jobs completed</span>
                <span>•</span>
                <span className="font-medium">{worker.years_experience} yrs experience</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
              <div className="text-[11px] text-gray-500 font-medium">Proximity</div>
              <div className="text-sm font-bold text-gray-900 mt-0.5 flex items-center justify-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {worker.approx_distance_km.toFixed(1)} km
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
              <div className="text-[11px] text-gray-500 font-medium">Response ETA</div>
              <div className="text-sm font-bold text-gray-900 mt-0.5 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                ~{worker.response_time_mins} mins
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
              <div className="text-[11px] text-gray-500 font-medium">Standard Rate</div>
              <div className="text-sm font-bold text-emerald-700 mt-0.5">
                ₹{worker.hourly_rate} base
              </div>
            </div>
          </div>

          {/* About / Bio */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Professional Background
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
              {worker.bio}
            </p>
          </div>

          {/* Verified Skills & Certifications */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
              Verified Skills & Certifications
            </h4>
            <div className="space-y-2">
              {worker.skills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-3 rounded-xl bg-white border border-gray-200/80 shadow-2xs"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {skill.service_name}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          {skill.years_experience} yrs exp
                        </span>
                      </div>
                      {skill.certification_name && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {skill.certification_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Fair Match Score Explainer */}
          <FairMatchExplainer
            worker={worker}
            categoryName={categoryName}
            urgency={urgency}
          />

          {/* Customer Reviews */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Cooperative Community Reviews
              </h4>
              <span className="text-xs text-emerald-600 font-semibold">
                {worker.reviews.length} Verified Reviews
              </span>
            </div>

            {worker.reviews.length > 0 ? (
              <div className="space-y-2.5">
                {worker.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800">{rev.customer_name}</span>
                      <span className="text-[11px] text-gray-400">{rev.date}</span>
                    </div>
                    <StarRating rating={rev.rating} size="sm" showNumber={false} />
                    <p className="text-gray-600 text-xs">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-xl text-center">
                Member of good standing with positive cooperative feedback.
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex items-center justify-between gap-3 shadow-lg">
          <div>
            <span className="text-xs text-gray-500 block font-medium">Estimated Rate</span>
            <span className="text-lg font-black text-gray-900">
              ₹{worker.hourly_rate} <span className="text-xs font-normal text-gray-500">/ service</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 shadow-xs"
              onClick={() => {
                onBook(worker);
                onClose();
              }}
            >
              Book This Worker
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
