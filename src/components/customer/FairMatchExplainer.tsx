'use client';

import React from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, Scale, Compass, Award, Clock } from 'lucide-react';
import { WorkerProfile } from '@/lib/data/mockData';
import { calculateFairMatchScore } from '@/lib/data/matchingAlgorithm';

interface FairMatchExplainerProps {
  worker: WorkerProfile;
  categoryName?: string;
  urgency?: 'normal' | 'urgent' | 'emergency';
}

export function FairMatchExplainer({
  worker,
  categoryName,
  urgency,
}: FairMatchExplainerProps) {
  const breakdown = calculateFairMatchScore(worker, {
    categoryName,
    urgency,
  });

  const factors = [
    {
      title: 'Skill Match',
      weight: '35%',
      score: `${breakdown.skillMatchScore}/35`,
      percentage: (breakdown.skillMatchScore / 35) * 100,
      icon: Award,
      desc: `Verified certification in ${worker.primary_skill}`,
      color: 'bg-emerald-500',
    },
    {
      title: 'Distance & Proximity',
      weight: '20%',
      score: `${breakdown.distanceScore}/20`,
      percentage: (breakdown.distanceScore / 20) * 100,
      icon: Compass,
      desc: `${worker.approx_distance_km.toFixed(1)} km from your service location (~${worker.response_time_mins} min ETA)`,
      color: 'bg-blue-500',
    },
    {
      title: 'Real-Time Availability',
      weight: '15%',
      score: `${breakdown.availabilityScore}/15`,
      percentage: (breakdown.availabilityScore / 15) * 100,
      icon: Clock,
      desc: worker.is_available ? 'Confirmed ready for immediate dispatch' : 'Scheduled assignment',
      color: 'bg-amber-500',
    },
    {
      title: 'Rating & Quality Record',
      weight: '10%',
      score: `${breakdown.ratingScore}/10`,
      percentage: (breakdown.ratingScore / 10) * 100,
      icon: ShieldCheck,
      desc: `${worker.avg_rating}★ across ${worker.total_jobs_completed} cooperative jobs`,
      color: 'bg-purple-500',
    },
    {
      title: 'Workload Balance',
      weight: '10%',
      score: `${breakdown.workloadScore}/10`,
      percentage: (breakdown.workloadScore / 10) * 100,
      icon: Scale,
      desc: 'Balanced hours ensuring rested, high-quality craft service',
      color: 'bg-teal-500',
    },
    {
      title: 'Opportunity Fairness',
      weight: '10%',
      score: `${breakdown.opportunityScore}/10`,
      percentage: (breakdown.opportunityScore / 10) * 100,
      icon: Sparkles,
      desc: `Fair allocation through ${worker.society_name}`,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/50 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            Cooperative Fair Allocation Score
          </div>
          <h4 className="text-base font-bold text-gray-900 mt-0.5">
            Why {worker.full_name} is recommended
          </h4>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-baseline gap-1 bg-emerald-700 text-white px-3 py-1 rounded-xl shadow-xs">
            <span className="text-lg font-black">{breakdown.totalScore}%</span>
            <span className="text-[10px] font-medium uppercase opacity-90">Match</span>
          </div>
          <span className="text-[10px] text-gray-500 mt-0.5 font-medium">SIH 26089 Algorithm</span>
        </div>
      </div>

      {/* Highlights checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 bg-white/80 p-3 rounded-xl border border-emerald-100">
        {breakdown.whyHighlights.map((hl, i) => (
          <div key={i} className="flex items-center gap-2 text-xs font-medium text-gray-700">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>{hl}</span>
          </div>
        ))}
      </div>

      {/* 6 Factors Progress Bars */}
      <div className="space-y-2.5">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          Multi-Factor Fairness Breakdown
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {factors.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-white/90 p-2.5 rounded-lg border border-gray-100 text-xs shadow-2xs">
                <div className="flex items-center justify-between font-semibold text-gray-800 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-gray-500" />
                    <span>{f.title} <span className="text-gray-400 font-normal">({f.weight})</span></span>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-700 font-bold">{f.score}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${f.color}`}
                    style={{ width: `${f.percentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 truncate">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
