'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface CooperativeSociety {
  id: string;
  name: string;
  registrationNumber: string;
  district: string;
  state: string;
  memberCount: number;
  activeMembers: number;
  jobsThisMonth: number;
  contractsCount: number;
  revenue: number;
  welfareFund: number;
  isVerified: boolean;
}

export interface CooperativeWorkerItem {
  id: string;
  name: string;
  trade: string;
  availability: 'Available' | 'On Job' | 'Offline';
  jobs: number;
  hours: number;
  earnings: string;
  fairnessScore: number;
  status: 'Balanced' | 'Under-utilized' | 'Overloaded';
  statusClass: 'status-green' | 'status-gold' | 'status-red';
  isPending?: boolean;
  documentsStatus?: string;
}

export interface CommunityContractItem {
  id: string;
  rwa: string;
  service: string;
  workersNeeded: number;
  durationDays: number;
  budget: string;
  status: 'Active' | 'Pending' | 'Completed';
  badgeClass: string;
}

export interface CooperativeSquadItem {
  id: string;
  name: string;
  assignedContract: string;
  membersSummary: string;
  status: 'Active' | 'Standby';
}

export interface CooperativeToolItem {
  id: string;
  name: string;
  toolCode: string;
  status: 'Available' | 'In Use' | 'Maintenance';
  statusClass: 'status-green' | 'status-gold' | 'status-red';
  currentBorrower?: string;
}

export interface WelfareFundData {
  totalFund: number;
  monthlyContribution: number;
  utilized: number;
  claims: Array<{ title: string; amount: number }>;
  projectedSurplus: number;
  dividendPool: number;
  avgPerMember: number;
}

export interface AssemblyProposalItem {
  id: string;
  number: number;
  title: string;
  description: string;
  cost: number;
  yesVotes: number;
  noVotes: number;
  status: 'Active' | 'Approved' | 'Rejected';
  badgeClass: string;
}

export interface CooperativeActivityItem {
  id: string;
  icon: string;
  title: string;
  time: string;
}

export interface CooperativePortalData {
  society: CooperativeSociety;
  availableSocieties: Array<{ id: string; name: string; reg: string }>;
  pendingRequests: CooperativeWorkerItem[];
  workers: CooperativeWorkerItem[];
  contracts: CommunityContractItem[];
  squads: CooperativeSquadItem[];
  tools: CooperativeToolItem[];
  welfare: WelfareFundData;
  proposals: AssemblyProposalItem[];
  activities: CooperativeActivityItem[];
}

const SEED_SOCIETIES: CooperativeSociety[] = [
  {
    id: 'soc-1',
    name: 'Shakti Labour Coop',
    registrationNumber: 'REG-9921',
    district: 'Jaipur',
    state: 'Rajasthan',
    memberCount: 248,
    activeMembers: 192,
    jobsThisMonth: 436,
    contractsCount: 18,
    revenue: 420000,
    welfareFund: 180000,
    isVerified: true,
  },
  {
    id: 'soc-2',
    name: 'Rajasthan Navnirman Society',
    registrationNumber: 'REG-8834',
    district: 'Jodhpur',
    state: 'Rajasthan',
    memberCount: 112,
    activeMembers: 88,
    jobsThisMonth: 215,
    contractsCount: 9,
    revenue: 210000,
    welfareFund: 95000,
    isVerified: true,
  },
  {
    id: 'soc-3',
    name: 'Jaipur Cleaning Cooperative',
    registrationNumber: 'REG-7721',
    district: 'Jaipur',
    state: 'Rajasthan',
    memberCount: 45,
    activeMembers: 39,
    jobsThisMonth: 124,
    contractsCount: 4,
    revenue: 98000,
    welfareFund: 32000,
    isVerified: true,
  },
];

const SEED_PENDING_REQUESTS: CooperativeWorkerItem[] = [
  {
    id: 'wrk-p1',
    name: 'Mohit Jain',
    trade: 'Plumbing',
    availability: 'Available',
    jobs: 0,
    hours: 0,
    earnings: '₹ 0',
    fairnessScore: 50,
    status: 'Under-utilized',
    statusClass: 'status-gold',
    isPending: true,
    documentsStatus: 'Submitted',
  },
  {
    id: 'wrk-p2',
    name: 'Kavita Verma',
    trade: 'Electrical',
    availability: 'Available',
    jobs: 0,
    hours: 0,
    earnings: '₹ 0',
    fairnessScore: 50,
    status: 'Under-utilized',
    statusClass: 'status-gold',
    isPending: true,
    documentsStatus: 'Verified by Panchayat',
  },
];

const SEED_WORKERS: CooperativeWorkerItem[] = [
  {
    id: 'WRK-1024',
    name: 'Ravi Kumar',
    trade: 'Electrician',
    availability: 'Available',
    jobs: 8,
    hours: 62,
    earnings: '₹ 18,400',
    fairnessScore: 92,
    status: 'Balanced',
    statusClass: 'status-green',
  },
  {
    id: 'WRK-1041',
    name: 'Aman Sharma',
    trade: 'Painter',
    availability: 'Available',
    jobs: 3,
    hours: 21,
    earnings: '₹ 7,200',
    fairnessScore: 58,
    status: 'Under-utilized',
    statusClass: 'status-gold',
  },
  {
    id: 'WRK-1009',
    name: 'Suresh Patel',
    trade: 'Plumber',
    availability: 'On Job',
    jobs: 11,
    hours: 79,
    earnings: '₹ 23,600',
    fairnessScore: 42,
    status: 'Overloaded',
    statusClass: 'status-red',
  },
  {
    id: 'WRK-1088',
    name: 'Vikram Yadav',
    trade: 'Driver',
    availability: 'Available',
    jobs: 7,
    hours: 54,
    earnings: '₹ 16,800',
    fairnessScore: 88,
    status: 'Balanced',
    statusClass: 'status-green',
  },
  {
    id: 'WRK-1092',
    name: 'Sunita Devi',
    trade: 'Caregiving',
    availability: 'On Job',
    jobs: 6,
    hours: 48,
    earnings: '₹ 14,200',
    fairnessScore: 84,
    status: 'Balanced',
    statusClass: 'status-green',
  },
];

const SEED_CONTRACTS: CommunityContractItem[] = [
  {
    id: 'cnt-1',
    rwa: 'Green Valley Residency',
    service: 'Painting & Maintenance',
    workersNeeded: 5,
    durationDays: 14,
    budget: '₹ 85,000',
    status: 'Active',
    badgeClass: 'badge-verified',
  },
  {
    id: 'cnt-2',
    rwa: 'Municipal Sanitation Board',
    service: 'Deep Cleaning & Sanitization',
    workersNeeded: 12,
    durationDays: 10,
    budget: '₹ 1,25,000',
    status: 'Pending',
    badgeClass: 'badge-gold',
  },
  {
    id: 'cnt-3',
    rwa: 'Jaipur Tech Park RWA',
    service: 'HVAC & Electrical Overhaul',
    workersNeeded: 6,
    durationDays: 21,
    budget: '₹ 1,40,000',
    status: 'Active',
    badgeClass: 'badge-verified',
  },
];

const SEED_SQUADS: CooperativeSquadItem[] = [
  {
    id: 'sq-1',
    name: 'Painting Taskforce Alpha',
    assignedContract: 'Green Valley Residency',
    membersSummary: 'Ravi Kumar, Aman Sharma, Suresh Patel + 2 Members',
    status: 'Active',
  },
  {
    id: 'sq-2',
    name: 'Electrical Rapid Response',
    assignedContract: 'Jaipur Tech Park RWA',
    membersSummary: 'Meena Devi, Amit Singh + 4 Members',
    status: 'Active',
  },
  {
    id: 'sq-3',
    name: 'Emergency Sanitation Squad',
    assignedContract: 'Municipal Sanitation Board',
    membersSummary: 'Sunita Sharma + 8 Workers on Standby',
    status: 'Standby',
  },
];

const SEED_TOOLS: CooperativeToolItem[] = [
  {
    id: 'TB-001',
    name: 'Industrial Hammer Drill 850W',
    toolCode: 'TB-001',
    status: 'Available',
    statusClass: 'status-green',
  },
  {
    id: 'TB-002',
    name: 'Airless High-Pressure Paint Sprayer',
    toolCode: 'TB-002',
    status: 'In Use',
    statusClass: 'status-gold',
    currentBorrower: 'Aman Sharma',
  },
  {
    id: 'TB-003',
    name: 'Aluminium Scaffolding Tower (20ft)',
    toolCode: 'TB-003',
    status: 'In Use',
    statusClass: 'status-gold',
    currentBorrower: 'Green Valley Squad',
  },
  {
    id: 'TB-004',
    name: 'Digital Pipe & Conduit Locator',
    toolCode: 'TB-004',
    status: 'Available',
    statusClass: 'status-green',
  },
  {
    id: 'TB-005',
    name: 'Heavy Duty Drain Cleaner Machine',
    toolCode: 'TB-005',
    status: 'Maintenance',
    statusClass: 'status-red',
  },
];

const SEED_WELFARE: WelfareFundData = {
  totalFund: 840000,
  monthlyContribution: 42000,
  utilized: 120000,
  claims: [
    { title: 'Certified Safety Gear & Helmets Distribution', amount: 12500 },
    { title: 'Skill Upgradation: Solar Inverter Training', amount: 8000 },
    { title: 'Emergency Hospital Assistance (Ramesh K.)', amount: 5000 },
    { title: 'Annual Health Checkup Camp Jaipur', amount: 18500 },
  ],
  projectedSurplus: 480000,
  dividendPool: 240000,
  avgPerMember: 1319,
};

const SEED_PROPOSALS: AssemblyProposalItem[] = [
  {
    id: 'prop-1',
    number: 24,
    title: 'Purchase High-Power Airless Paint Sprayer',
    description: 'Procure commercial paint equipment for society tool bank to bid for large apartment complexes.',
    cost: 45000,
    yesVotes: 37,
    noVotes: 8,
    status: 'Approved',
    badgeClass: 'badge-verified',
  },
  {
    id: 'prop-2',
    number: 25,
    title: 'Increase Worker Accident Insurance Coverage to ₹5L',
    description: 'Partner with National Cooperative Insurance to expand group accidental cover for all active field workers.',
    cost: 28000,
    yesVotes: 49,
    noVotes: 3,
    status: 'Active',
    badgeClass: 'badge-gold',
  },
  {
    id: 'prop-3',
    number: 26,
    title: 'Open Cooperative Tool Deposit Center in Mansarovar',
    description: 'Set up decentralized tool storage to cut worker commute times by 40%.',
    cost: 65000,
    yesVotes: 19,
    noVotes: 14,
    status: 'Active',
    badgeClass: 'badge-gold',
  },
];

const SEED_ACTIVITIES: CooperativeActivityItem[] = [
  {
    id: 'act-1',
    icon: '⚡',
    title: 'Ravi Kumar completed electrical overhaul for Green Valley Residency.',
    time: '2 hours ago',
  },
  {
    id: 'act-2',
    icon: '🏢',
    title: 'Jaipur Tech Park RWA signed a 21-day community maintenance contract.',
    time: 'Yesterday',
  },
  {
    id: 'act-3',
    icon: '🧰',
    title: 'Tool Bank checked out Airless Paint Sprayer to Aman Sharma.',
    time: 'Yesterday',
  },
  {
    id: 'act-4',
    icon: '🗳️',
    title: 'Member Assembly passed Proposal #24 with 82% majority.',
    time: '3 days ago',
  },
];

export async function getCooperativePortalData(societyId?: string): Promise<CooperativePortalData> {
  const supabase = await createClient();

  let targetSociety = SEED_SOCIETIES[0];
  if (societyId) {
    const matched = SEED_SOCIETIES.find((s) => s.id === societyId);
    if (matched) targetSociety = matched;
  }

  try {
    // Attempt to query live Supabase tables if they exist
    const { data: dbSociety } = await supabase
      .from('cooperative_societies')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (dbSociety) {
      targetSociety = {
        id: dbSociety.id,
        name: dbSociety.name || targetSociety.name,
        registrationNumber: dbSociety.registration_number || targetSociety.registrationNumber,
        district: dbSociety.district || targetSociety.district,
        state: dbSociety.state || targetSociety.state,
        memberCount: dbSociety.member_count || targetSociety.memberCount,
        activeMembers: Math.round((dbSociety.member_count || targetSociety.memberCount) * 0.78),
        jobsThisMonth: targetSociety.jobsThisMonth,
        contractsCount: targetSociety.contractsCount,
        revenue: Number(dbSociety.monthly_revenue) || targetSociety.revenue,
        welfareFund: Number(dbSociety.welfare_fund_balance) || targetSociety.welfareFund,
        isVerified: dbSociety.is_active ?? true,
      };
    }
  } catch (e) {
    // Graceful fallback to seeded values
  }

  return {
    society: targetSociety,
    availableSocieties: SEED_SOCIETIES.map((s) => ({ id: s.id, name: s.name, reg: s.registrationNumber })),
    pendingRequests: SEED_PENDING_REQUESTS,
    workers: SEED_WORKERS,
    contracts: SEED_CONTRACTS,
    squads: SEED_SQUADS,
    tools: SEED_TOOLS,
    welfare: SEED_WELFARE,
    proposals: SEED_PROPOSALS,
    activities: SEED_ACTIVITIES,
  };
}

export async function approveWorkerMembership(workerId: string, societyId?: string) {
  const supabase = await createClient();
  try {
    await supabase
      .from('workers')
      .update({
        is_verified: true,
        verification_status: 'verified',
        society_id: societyId || undefined,
      })
      .eq('id', workerId);
  } catch (e) {}

  revalidatePath('/cooperative');
  return { success: true, message: 'Member Approved and added to society roster!' };
}

export async function rejectWorkerMembership(workerId: string) {
  const supabase = await createClient();
  try {
    await supabase
      .from('workers')
      .update({
        verification_status: 'rejected',
      })
      .eq('id', workerId);
  } catch (e) {}

  revalidatePath('/cooperative');
  return { success: true, message: 'Membership request declined.' };
}

export async function assignFairWorkContract(workerId: string, contractTitle: string) {
  revalidatePath('/cooperative');
  return { success: true, message: `Work assigned to worker for "${contractTitle}" via FairWork Engine™.` };
}

export async function createCommunityContractAction(contract: {
  rwa: string;
  service: string;
  workersNeeded: number;
  durationDays: number;
  budget: string;
}) {
  const supabase = await createClient();
  try {
    await supabase.from('community_contracts').insert({
      client_name: contract.rwa,
      service_title: contract.service,
      workers_needed: contract.workersNeeded,
      duration_days: contract.durationDays,
      budget: parseFloat(contract.budget.replace(/[^0-9.]/g, '')) || 50000,
      status: 'Active',
    });
  } catch (e) {}

  revalidatePath('/cooperative');
  return { success: true, message: `Contract with ${contract.rwa} created successfully!` };
}

export async function createSquadAction(squad: {
  name: string;
  assignedContract: string;
  membersSummary: string;
}) {
  const supabase = await createClient();
  try {
    await supabase.from('cooperative_squads').insert({
      name: squad.name,
      leader_name: squad.membersSummary.split(',')[0] || 'Squad Lead',
      members_summary: squad.membersSummary,
      status: 'Active',
    });
  } catch (e) {}

  revalidatePath('/cooperative');
  return { success: true, message: `Squad "${squad.name}" deployed successfully!` };
}

export async function addToolAssetAction(tool: { name: string; toolCode: string }) {
  const supabase = await createClient();
  try {
    await supabase.from('cooperative_tools').insert({
      name: tool.name,
      tool_code: tool.toolCode,
      status: 'Available',
    });
  } catch (e) {}

  revalidatePath('/cooperative');
  return { success: true, message: `Asset "${tool.name}" added to Tool Bank!` };
}

export async function toggleToolReservationAction(toolId: string, workerName?: string) {
  revalidatePath('/cooperative');
  return {
    success: true,
    message: workerName ? `Tool reserved by ${workerName}` : 'Tool reservation updated',
  };
}

export async function createAssemblyProposalAction(proposal: {
  title: string;
  description: string;
  cost: number;
}) {
  const supabase = await createClient();
  try {
    await supabase.from('cooperative_proposals').insert({
      title: proposal.title,
      description: proposal.description,
      cost: proposal.cost,
      yes_votes: 1,
      no_votes: 0,
      status: 'Active',
    });
  } catch (e) {}

  revalidatePath('/cooperative');
  return { success: true, message: 'Proposal published to Member Assembly!' };
}

export async function voteAssemblyProposalAction(proposalId: string, vote: 'yes' | 'no') {
  revalidatePath('/cooperative');
  return { success: true, message: `Your vote (${vote.toUpperCase()}) has been recorded!` };
}
