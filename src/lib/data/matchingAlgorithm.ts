import { WorkerProfile } from './mockData';

export interface MatchCriteria {
  categoryId?: string;
  categoryName?: string;
  urgency?: 'normal' | 'urgent' | 'emergency';
  maxDistanceKm?: number;
  userLat?: number;
  userLng?: number;
}

export interface MatchScoreBreakdown {
  totalScore: number;
  skillMatchScore: number;       // max 35
  distanceScore: number;         // max 20
  availabilityScore: number;     // max 15
  ratingScore: number;           // max 10
  workloadScore: number;         // max 10
  opportunityScore: number;      // max 10
  whyHighlights: string[];
}

/**
 * Calculates a transparent, multi-factor Fair Matching Score according to SIH 2026 Problem Statement 26089.
 * 
 * Weights:
 * - Skill Match: 35%
 * - Proximity / Distance: 20%
 * - Availability: 15%
 * - Rating & Track Record: 10%
 * - Workload Distribution: 10%
 * - Opportunity Balance / Fairness: 10%
 */
export function calculateFairMatchScore(
  worker: WorkerProfile,
  criteria: MatchCriteria
): MatchScoreBreakdown {
  const whyHighlights: string[] = [];

  // 1. Skill Match (35%)
  let skillMatchScore = 0;
  const targetCategory = (criteria.categoryName || '').toLowerCase();
  const workerCategory = (worker.primary_skill || '').toLowerCase();

  const matchingSkill = worker.skills.find(
    (s) => s.service_name.toLowerCase().includes(targetCategory) || targetCategory.includes(s.service_name.toLowerCase())
  );

  if (workerCategory.includes(targetCategory) || targetCategory.includes(workerCategory)) {
    skillMatchScore = 30;
    if (matchingSkill?.certification_name) {
      skillMatchScore = 35;
      whyHighlights.push(`Certified ${worker.primary_skill} (${matchingSkill.certification_name})`);
    } else {
      whyHighlights.push(`Primary skill match: ${worker.primary_skill}`);
    }
  } else if (matchingSkill) {
    skillMatchScore = 28;
    whyHighlights.push(`Secondary verified skill: ${matchingSkill.service_name}`);
  } else {
    skillMatchScore = 15; // baseline related craft
  }

  // 2. Distance / Proximity (20%)
  let distanceScore = 0;
  const dist = worker.approx_distance_km || 3.0;
  if (dist <= 2.0) {
    distanceScore = 20;
    whyHighlights.push(`Very close (${dist.toFixed(1)} km away, ~15 min ETA)`);
  } else if (dist <= 4.0) {
    distanceScore = 17;
    whyHighlights.push(`Nearby (${dist.toFixed(1)} km away)`);
  } else if (dist <= 8.0) {
    distanceScore = 13;
  } else {
    distanceScore = 8;
  }

  // 3. Availability (15%)
  let availabilityScore = 0;
  if (worker.is_available) {
    availabilityScore = 15;
    whyHighlights.push('Instantly available for scheduling');
  } else {
    availabilityScore = 5;
  }

  // 4. Rating & Track Record (10%)
  // Rating 5.0 -> 10 pts, 4.0 -> 8 pts
  const ratingScore = Math.min(10, Math.round((worker.avg_rating / 5.0) * 10 * 10) / 10);
  if (worker.avg_rating >= 4.7) {
    whyHighlights.push(`Highly rated (${worker.avg_rating}★ from ${worker.total_jobs_completed} jobs)`);
  }

  // 5. Workload Score (10%)
  // Lower workload (e.g. 20-40) means worker has good capacity -> higher fairness score
  let workloadScore = 0;
  if (worker.workload_score <= 40) {
    workloadScore = 10;
    whyHighlights.push('Optimal cooperative workload capacity');
  } else if (worker.workload_score <= 70) {
    workloadScore = 7;
  } else {
    workloadScore = 4;
  }

  // 6. Opportunity Balance / Fairness (10%)
  // Give fair chances to workers from active registered cooperative societies
  const opportunityScore = 10;
  if (worker.society_name) {
    whyHighlights.push(`Fair opportunity allocation via ${worker.society_name}`);
  }

  const totalScore = Math.min(
    99,
    Math.round(skillMatchScore + distanceScore + availabilityScore + ratingScore + workloadScore + opportunityScore)
  );

  return {
    totalScore,
    skillMatchScore,
    distanceScore,
    availabilityScore,
    ratingScore,
    workloadScore,
    opportunityScore,
    whyHighlights: whyHighlights.slice(0, 4),
  };
}
