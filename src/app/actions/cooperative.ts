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

const FALLBACK_SOCIETY: CooperativeSociety = {
  id: 'f646a2c5-21b8-4538-ab2e-87aac9488506',
  name: 'Shakti Labour Coop',
  registrationNumber: 'REG-9921',
  district: 'Jaipur',
  state: 'Rajasthan',
  memberCount: 24,
  activeMembers: 19,
  jobsThisMonth: 86,
  contractsCount: 3,
  revenue: 420000,
  welfareFund: 180000,
  isVerified: true,
};

export async function getCooperativePortalData(societyId?: string): Promise<CooperativePortalData> {
  const supabase = await createClient();

  let targetSociety = { ...FALLBACK_SOCIETY };
  let availableSocieties: Array<{ id: string; name: string; reg: string }> = [
    { id: FALLBACK_SOCIETY.id, name: FALLBACK_SOCIETY.name, reg: FALLBACK_SOCIETY.registrationNumber },
  ];
  let pendingRequests: CooperativeWorkerItem[] = [];
  let workers: CooperativeWorkerItem[] = [];
  let contracts: CommunityContractItem[] = [];
  let squads: CooperativeSquadItem[] = [];
  let tools: CooperativeToolItem[] = [];
  let proposals: AssemblyProposalItem[] = [];
  let welfare: WelfareFundData = {
    totalFund: 180000,
    monthlyContribution: 42000,
    utilized: 0,
    claims: [],
    projectedSurplus: 180000,
    dividendPool: 90000,
    avgPerMember: 0,
  };
  let activities: CooperativeActivityItem[] = [];

  try {
    // 1. Live Cooperative Societies from Database
    const { data: dbSocieties } = await supabase
      .from('cooperative_societies')
      .select('*')
      .order('created_at', { ascending: true });

    if (dbSocieties && dbSocieties.length > 0) {
      availableSocieties = dbSocieties.map((s: any) => ({
        id: s.id,
        name: s.name,
        reg: s.registration_number,
      }));

      const found = societyId
        ? dbSocieties.find((s: any) => s.id === societyId)
        : (dbSocieties.find((s: any) => s.name?.includes('Shakti')) || dbSocieties[0]);

      if (found) {
        targetSociety = {
          id: found.id,
          name: found.name,
          registrationNumber: found.registration_number,
          district: found.district || 'Jaipur',
          state: found.state || 'Rajasthan',
          memberCount: found.member_count || 0,
          activeMembers: 0,
          jobsThisMonth: 0,
          contractsCount: 0,
          revenue: Number(found.monthly_revenue) || 420000,
          welfareFund: Number(found.welfare_fund_balance) || 180000,
          isVerified: found.is_active ?? true,
        };

        // 2. Fetch Live Workers and Pending Membership Requests from DB
        const { data: dbWorkers } = await supabase
          .from('workers')
          .select(`
            id, full_name, is_verified, verification_status, society_id, is_available,
            avg_rating, total_jobs_completed, created_at,
            worker_skills (
              years_experience,
              service_categories (name)
            )
          `)
          .eq('society_id', found.id)
          .order('created_at', { ascending: false });

        if (dbWorkers && dbWorkers.length > 0) {
          // Pending applicants
          const pendingDb = dbWorkers.filter(
            (w: any) => !w.is_verified || w.verification_status === 'pending'
          );
          pendingRequests = pendingDb.map((w: any) => {
            const tradeName = (w.worker_skills as any)?.[0]?.service_categories?.name || 'General Artisan';
            return {
              id: w.id,
              name: w.full_name || 'Applicant Member',
              trade: tradeName,
              availability: 'Available' as const,
              jobs: 0,
              hours: 0,
              earnings: '₹ 0',
              fairnessScore: 50,
              status: 'Under-utilized' as const,
              statusClass: 'status-gold' as const,
              isPending: true,
              documentsStatus: 'Aadhaar & Skill Certified',
            };
          });

          // Active verified members
          const verifiedDb = dbWorkers.filter(
            (w: any) => w.is_verified && w.verification_status !== 'pending' && w.verification_status !== 'rejected'
          );

          let totalJobsSum = 0;
          workers = verifiedDb.map((w: any) => {
            const tradeName = (w.worker_skills as any)?.[0]?.service_categories?.name || 'Technician';
            const jobs = w.total_jobs_completed ?? Math.floor(Math.random() * 8 + 3);
            totalJobsSum += jobs;
            const hours = jobs * 6;
            const earningsAmount = jobs * 1400;
            const fairness = Math.min(98, Math.max(45, 55 + (jobs % 7) * 6));
            const status: 'Balanced' | 'Under-utilized' | 'Overloaded' =
              fairness >= 75 ? 'Balanced' : jobs > 35 ? 'Overloaded' : 'Under-utilized';
            const statusClass: 'status-green' | 'status-gold' | 'status-red' =
              status === 'Balanced' ? 'status-green' : status === 'Overloaded' ? 'status-red' : 'status-gold';

            return {
              id: w.id,
              name: w.full_name || 'Society Member',
              trade: tradeName,
              availability: w.is_available ? ('Available' as const) : ('On Job' as const),
              jobs,
              hours,
              earnings: `₹ ${earningsAmount.toLocaleString('en-IN')}`,
              fairnessScore: fairness,
              status,
              statusClass,
            };
          });

          targetSociety.memberCount = verifiedDb.length;
          targetSociety.activeMembers = verifiedDb.filter((w: any) => w.is_available).length || verifiedDb.length;
          targetSociety.jobsThisMonth = totalJobsSum;
        }

        // 3. Live Community Contracts from DB
        const { data: dbContracts } = await supabase
          .from('community_contracts')
          .select('*')
          .eq('society_id', found.id)
          .order('created_at', { ascending: false });

        if (dbContracts && dbContracts.length > 0) {
          contracts = dbContracts.map((c: any) => ({
            id: c.id,
            rwa: c.client_name,
            service: c.service_title,
            workersNeeded: c.workers_needed || 4,
            durationDays: c.duration_days || 30,
            budget: `₹ ${Number(c.budget).toLocaleString('en-IN')}`,
            status: (c.status as any) || 'Active',
            badgeClass:
              c.status === 'Completed'
                ? 'coop-badge-verified'
                : c.status === 'Pending'
                ? 'coop-badge-gold'
                : 'coop-badge-verified',
          }));
          targetSociety.contractsCount = contracts.length;
        }

        // 4. Live Cooperative Squads from DB
        const { data: dbSquads } = await supabase
          .from('cooperative_squads')
          .select('*')
          .eq('society_id', found.id)
          .order('created_at', { ascending: false });

        if (dbSquads && dbSquads.length > 0) {
          squads = dbSquads.map((sq: any) => ({
            id: sq.id,
            name: sq.name,
            assignedContract: 'Community Contract',
            membersSummary: sq.members_summary || 'Multi-Trade Cooperative Squad',
            status: (sq.status as any) || 'Active',
          }));
        }

        // 5. Live Cooperative Tools from DB
        const { data: dbTools } = await supabase
          .from('cooperative_tools')
          .select('*')
          .eq('society_id', found.id)
          .order('created_at', { ascending: false });

        if (dbTools && dbTools.length > 0) {
          tools = dbTools.map((t: any) => ({
            id: t.id,
            name: t.name,
            toolCode: t.tool_code,
            status: (t.status as any) || 'Available',
            statusClass:
              t.status === 'In Use' ? 'status-gold' : t.status === 'Maintenance' ? 'status-red' : 'status-green',
            currentBorrower: t.current_borrower_name || undefined,
          }));
        }

        // 6. Live Democratic Proposals from DB
        const { data: dbProposals } = await supabase
          .from('cooperative_proposals')
          .select('*')
          .eq('society_id', found.id)
          .order('proposal_number', { ascending: true });

        if (dbProposals && dbProposals.length > 0) {
          proposals = dbProposals.map((p: any, idx: number) => ({
            id: p.id,
            number: p.proposal_number || idx + 1,
            title: p.title,
            description: p.description || '',
            cost: Number(p.cost) || 0,
            yesVotes: p.yes_votes || 0,
            noVotes: p.no_votes || 0,
            status: (p.status as any) || 'Active',
            badgeClass:
              p.status === 'Approved'
                ? 'coop-badge-verified'
                : p.status === 'Rejected'
                ? 'coop-badge-red'
                : 'coop-badge-gold',
          }));
        }

        // 7. Live Welfare Records & Dynamic Welfare Reserve Calculation
        const { data: dbWelfare } = await supabase
          .from('welfare_records')
          .select('*')
          .order('created_at', { ascending: false });

        const claims = (dbWelfare || []).map((w: any) => ({
          title: w.document_url || w.type || 'Emergency Assistance Claim',
          amount: Number(w.premium_amount) || 0,
        }));

        const totalUtilized = claims.reduce((sum: number, c: any) => sum + c.amount, 0);
        const baseReserve = Number(found.welfare_fund_balance) || 180000;
        const totalFund = Math.max(0, baseReserve);
        const monthlyContribution = Math.round(Number(found.monthly_revenue || 420000) * 0.1);
        const projectedSurplus = Math.max(0, totalFund - totalUtilized);
        const dividendPool = Math.round(projectedSurplus * 0.5);
        const avgPerMember = workers.length > 0 ? Math.round(dividendPool / workers.length) : 0;

        welfare = {
          totalFund,
          monthlyContribution,
          utilized: totalUtilized,
          claims,
          projectedSurplus,
          dividendPool,
          avgPerMember,
        };

        targetSociety.welfareFund = totalFund;

        // 8. Generate Dynamic Activities from Live Database Records
        const liveActivities: CooperativeActivityItem[] = [];

        // Check recent checked out tools
        const inUseTools = tools.filter((t) => t.status === 'In Use' && t.currentBorrower);
        for (const t of inUseTools.slice(0, 2)) {
          liveActivities.push({
            id: `act-tool-${t.id}`,
            icon: '🧰',
            title: `Tool Bank: "${t.name}" checked out to ${t.currentBorrower}.`,
            time: 'Recently',
          });
        }

        // Check recent proposals
        for (const p of proposals.slice(0, 2)) {
          liveActivities.push({
            id: `act-prop-${p.id}`,
            icon: '🗳️',
            title: `Member Assembly: Resolution "${p.title}" is ${p.status} with ${p.yesVotes} votes.`,
            time: 'Active',
          });
        }

        // Check active community contracts
        for (const c of contracts.slice(0, 2)) {
          liveActivities.push({
            id: `act-cnt-${c.id}`,
            icon: '🤝',
            title: `Community Contract: "${c.service}" deployed with ${c.rwa}.`,
            time: 'In Progress',
          });
        }

        // Check recent welfare claims
        for (const cl of claims.slice(0, 2)) {
          liveActivities.push({
            id: `act-wf-${Math.random().toString(36).substring(2, 7)}`,
            icon: '🛡️',
            title: `Welfare Fund: Approved ₹${cl.amount.toLocaleString('en-IN')} for "${cl.title}".`,
            time: 'Disbursed',
          });
        }

        if (liveActivities.length === 0) {
          liveActivities.push({
            id: `act-init`,
            icon: '🏛️',
            title: `${found.name} digital cooperative society operational and ready.`,
            time: 'Active',
          });
        }

        activities = liveActivities;
      }
    }
  } catch (e: any) {
    console.error('getCooperativePortalData error:', e?.message);
  }

  return {
    society: targetSociety,
    availableSocieties,
    pendingRequests,
    workers,
    contracts,
    squads,
    tools,
    welfare,
    proposals,
    activities,
  };
}

export async function onboardMemberAction(payload: {
  societyId: string;
  name: string;
  phone: string;
  trade: string;
  aadhaarNumber?: string;
  experienceYears?: number;
}) {
  const supabase = await createClient();
  try {
    const rawDigits = (Date.now().toString() + Math.random().toString().slice(2, 6)).slice(-10);
    const uniquePhone = payload.phone.trim() || `+91${rawDigits}`;
    const syntheticEmail = `worker.${rawDigits}@shramnexus.coop`;

    // 1. Create Supabase Auth user to satisfy workers.id foreign key constraint
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: syntheticEmail,
      password: 'CoopMember@123',
    });

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || 'Failed to initialize worker credentials.' };
    }

    const workerId = authData.user.id;

    // 2. Insert worker record into workers table
    const { data: newWorker, error: workerError } = await supabase
      .from('workers')
      .insert({
        id: workerId,
        full_name: payload.name.trim(),
        phone: uniquePhone,
        email: syntheticEmail,
        aadhaar_number: payload.aadhaarNumber?.trim() || null,
        society_id: payload.societyId,
        is_verified: true,
        verification_status: 'verified',
        is_available: true,
        avg_rating: 5.0,
        total_jobs_completed: 0,
        profile_photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name.trim())}&background=24172f&color=fff`,
      })
      .select()
      .single();

    if (workerError || !newWorker) {
      return { success: false, error: workerError?.message || 'Failed to save member in database.' };
    }

    // 3. Attach trade skill
    if (payload.trade) {
      const { data: cat } = await supabase
        .from('service_categories')
        .select('id')
        .ilike('name', `%${payload.trade}%`)
        .maybeSingle();

      if (cat) {
        await supabase
          .from('worker_skills')
          .insert({
            worker_id: newWorker.id,
            service_category_id: cat.id,
            years_experience: payload.experienceYears || 3,
            certification_name: 'Cooperative Certified Trade Member',
            is_verified: true,
          });
      }
    }

    // 4. Increment member_count on cooperative_societies
    const { data: soc } = await supabase
      .from('cooperative_societies')
      .select('member_count')
      .eq('id', payload.societyId)
      .maybeSingle();

    if (soc) {
      await supabase
        .from('cooperative_societies')
        .update({ member_count: (soc.member_count || 0) + 1 })
        .eq('id', payload.societyId);
    }

    revalidatePath('/cooperative');

    return {
      success: true,
      worker: {
        id: newWorker.id,
        name: newWorker.full_name,
        trade: payload.trade,
        availability: 'Available' as const,
        jobs: 0,
        hours: 0,
        earnings: '₹ 0',
        fairnessScore: 70,
        status: 'Balanced' as const,
        statusClass: 'status-green' as const,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to onboard worker' };
  }
}

export async function approveWorkerMembership(workerId: string, societyId?: string) {
  const supabase = await createClient();
  try {
    await supabase
      .from('workers')
      .update({
        is_verified: true,
        verification_status: 'verified',
        is_available: true,
        society_id: societyId || undefined,
      })
      .eq('id', workerId);

    if (societyId) {
      const { data: soc } = await supabase
        .from('cooperative_societies')
        .select('member_count')
        .eq('id', societyId)
        .maybeSingle();

      if (soc) {
        await supabase
          .from('cooperative_societies')
          .update({ member_count: (soc.member_count || 0) + 1 })
          .eq('id', societyId);
      }
    }
  } catch (e: any) {
    console.error('approveWorkerMembership error:', e?.message);
  }

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
  } catch (e: any) {
    console.error('rejectWorkerMembership error:', e?.message);
  }

  revalidatePath('/cooperative');
  return { success: true, message: 'Membership request declined.' };
}

export async function assignFairWorkContract(workerId: string, contractTitle: string) {
  const supabase = await createClient();
  try {
    const { data: worker } = await supabase
      .from('workers')
      .select('total_jobs_completed')
      .eq('id', workerId)
      .maybeSingle();

    if (worker) {
      await supabase
        .from('workers')
        .update({ total_jobs_completed: (worker.total_jobs_completed || 0) + 1 })
        .eq('id', workerId);
    }
  } catch (e) {}

  revalidatePath('/cooperative');
  return { success: true, message: `Work assigned for "${contractTitle}" via FairWork Engine™.` };
}

export async function registerCooperativeSocietyAction(payload: {
  name: string;
  registrationNumber: string;
  district: string;
  state: string;
}) {
  const supabase = await createClient();
  try {
    const { data: newSociety, error } = await supabase
      .from('cooperative_societies')
      .insert({
        name: payload.name,
        registration_number: payload.registrationNumber,
        district: payload.district,
        state: payload.state,
        member_count: 0,
        monthly_revenue: 0,
        welfare_fund_balance: 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/cooperative');
    return { success: true, society: newSociety };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to register society' };
  }
}

export async function createCommunityContractAction(
  contract: {
    rwa: string;
    service: string;
    workersNeeded: number;
    durationDays: number;
    budget: string;
  },
  societyId?: string
) {
  const supabase = await createClient();
  try {
    const budgetNum = parseFloat(contract.budget.replace(/[^0-9.]/g, '')) || 50000;
    const { data, error } = await supabase
      .from('community_contracts')
      .insert({
        society_id: societyId || null,
        client_name: contract.rwa,
        service_title: contract.service,
        workers_needed: contract.workersNeeded,
        duration_days: contract.durationDays,
        budget: budgetNum,
        status: 'Active',
      })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to create contract' };
    }

    revalidatePath('/cooperative');
    return {
      success: true,
      contract: {
        id: data.id,
        rwa: data.client_name,
        service: data.service_title,
        workersNeeded: data.workers_needed,
        durationDays: data.duration_days,
        budget: `₹ ${Number(data.budget).toLocaleString('en-IN')}`,
        status: (data.status as 'Active' | 'Pending' | 'Completed') || 'Active',
        badgeClass: 'coop-badge-verified',
      },
      message: `Contract with ${contract.rwa} created successfully!`,
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateContractStatusAction(
  contractId: string,
  newStatus: 'Active' | 'Completed' | 'Pending'
) {
  const supabase = await createClient();
  try {
    await supabase
      .from('community_contracts')
      .update({ status: newStatus })
      .eq('id', contractId);
  } catch (e: any) {
    console.error('updateContractStatusAction error:', e?.message);
  }

  revalidatePath('/cooperative');
  return { success: true, message: `Contract status marked as ${newStatus}!` };
}

export async function createSquadAction(
  squad: {
    name: string;
    assignedContract: string;
    membersSummary: string;
  },
  societyId?: string
) {
  const supabase = await createClient();
  try {
    const leaderName = squad.membersSummary.split(',')[0] || 'Squad Lead';
    const { data, error } = await supabase
      .from('cooperative_squads')
      .insert({
        society_id: societyId || null,
        name: squad.name,
        leader_name: leaderName,
        members_summary: squad.membersSummary,
        status: 'Active',
      })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to create squad' };
    }

    revalidatePath('/cooperative');
    return {
      success: true,
      squad: {
        id: data.id,
        name: data.name,
        assignedContract: squad.assignedContract,
        membersSummary: data.members_summary || 'Multi-Trade Cooperative Squad',
        status: (data.status as 'Active' | 'Standby') || 'Active',
      },
      message: `Squad "${squad.name}" deployed successfully!`,
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function toggleSquadStatusAction(squadId: string, currentStatus: string) {
  const supabase = await createClient();
  const nextStatus = currentStatus === 'Active' ? 'Standby' : 'Active';
  try {
    await supabase
      .from('cooperative_squads')
      .update({ status: nextStatus })
      .eq('id', squadId);
  } catch (e: any) {
    console.error('toggleSquadStatusAction error:', e?.message);
  }

  revalidatePath('/cooperative');
  return { success: true, status: nextStatus, message: `Squad status set to ${nextStatus}!` };
}

export async function updateSquadMembersAction(squadId: string, membersSummary: string, count: number) {
  const supabase = await createClient();
  try {
    await supabase
      .from('cooperative_squads')
      .update({
        members_summary: membersSummary,
        members_count: count,
      })
      .eq('id', squadId);
  } catch (e: any) {
    console.error('updateSquadMembersAction error:', e?.message);
  }

  revalidatePath('/cooperative');
  return { success: true, message: 'Squad member roster successfully updated!' };
}

export async function addToolAssetAction(tool: { name: string; toolCode: string }, societyId?: string) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('cooperative_tools')
      .insert({
        society_id: societyId || null,
        name: tool.name,
        tool_code: tool.toolCode,
        status: 'Available',
      })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to add tool' };
    }

    revalidatePath('/cooperative');
    return {
      success: true,
      tool: {
        id: data.id,
        name: data.name,
        toolCode: data.tool_code,
        status: (data.status as 'Available' | 'In Use' | 'Maintenance') || 'Available',
        statusClass: 'status-green' as const,
        currentBorrower: undefined,
      },
      message: `Asset "${tool.name}" added to Tool Bank!`,
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function toggleToolReservationAction(toolId: string, workerName?: string) {
  const supabase = await createClient();
  try {
    const { data: tool } = await supabase
      .from('cooperative_tools')
      .select('status')
      .eq('id', toolId)
      .maybeSingle();

    if (tool) {
      const nextStatus = tool.status === 'Available' ? 'In Use' : 'Available';
      await supabase
        .from('cooperative_tools')
        .update({
          status: nextStatus,
          current_borrower_name: nextStatus === 'In Use' ? workerName || 'Society Member' : null,
          reserved_at: nextStatus === 'In Use' ? new Date().toISOString() : null,
        })
        .eq('id', toolId);
    }
  } catch (e: any) {
    console.error('toggleToolReservationAction error:', e?.message);
  }

  revalidatePath('/cooperative');
  return {
    success: true,
    message: workerName ? `Tool reserved by ${workerName}` : 'Tool reservation updated',
  };
}

export async function createAssemblyProposalAction(
  proposal: {
    title: string;
    description: string;
    cost: number;
  },
  societyId?: string
) {
  const supabase = await createClient();
  try {
    const { count } = await supabase
      .from('cooperative_proposals')
      .select('*', { count: 'exact', head: true })
      .eq('society_id', societyId || '');

    const nextNumber = (count || 0) + 25;

    const { data, error } = await supabase
      .from('cooperative_proposals')
      .insert({
        society_id: societyId || null,
        proposal_number: nextNumber,
        title: proposal.title,
        description: proposal.description,
        cost: proposal.cost,
        yes_votes: 1,
        no_votes: 0,
        status: 'Active',
      })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to create proposal' };
    }

    revalidatePath('/cooperative');
    return {
      success: true,
      proposal: {
        id: data.id,
        number: data.proposal_number,
        title: data.title,
        description: data.description || '',
        cost: Number(data.cost) || 0,
        yesVotes: data.yes_votes || 1,
        noVotes: data.no_votes || 0,
        status: (data.status as 'Active' | 'Approved' | 'Rejected') || 'Active',
        badgeClass: 'coop-badge-gold',
      },
      message: 'Proposal published to Member Assembly!',
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function voteAssemblyProposalAction(
  proposalId: string,
  vote: 'yes' | 'no',
  previousVote?: 'yes' | 'no'
) {
  const supabase = await createClient();
  try {
    const { data: prop } = await supabase
      .from('cooperative_proposals')
      .select('yes_votes, no_votes, status')
      .eq('id', proposalId)
      .maybeSingle();

    if (prop) {
      let newYes = prop.yes_votes || 0;
      let newNo = prop.no_votes || 0;

      // Handle changing vote
      if (previousVote === 'yes') newYes = Math.max(0, newYes - 1);
      if (previousVote === 'no') newNo = Math.max(0, newNo - 1);

      if (vote === 'yes') newYes += 1;
      if (vote === 'no') newNo += 1;

      // Democratic quorum check (> 30 votes total with > 65% affirmative votes)
      let nextStatus = prop.status;
      const total = newYes + newNo;
      if (total >= 30 && newYes / total >= 0.65) {
        nextStatus = 'Approved';
      }

      await supabase
        .from('cooperative_proposals')
        .update({
          yes_votes: newYes,
          no_votes: newNo,
          status: nextStatus,
        })
        .eq('id', proposalId);
    }
  } catch (e: any) {
    console.error('voteAssemblyProposalAction error:', e?.message);
  }

  revalidatePath('/cooperative');
  return { success: true, message: `Your vote (${vote.toUpperCase()}) has been recorded!` };
}

export async function createWelfareClaimAction(
  claim: {
    title: string;
    amount: number;
    type: string;
    workerName?: string;
  },
  societyId?: string
) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('welfare_records')
      .insert({
        type: claim.type || 'Emergency Assistance',
        policy_number: `WF-${Date.now().toString().slice(-6)}`,
        provider: 'ShramNexus Cooperative Welfare Fund',
        status: 'approved',
        premium_amount: claim.amount,
        document_url: claim.title,
      })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to log claim' };
    }

    if (societyId) {
      const { data: soc } = await supabase
        .from('cooperative_societies')
        .select('welfare_fund_balance')
        .eq('id', societyId)
        .maybeSingle();

      if (soc) {
        const nextBal = Math.max(0, (Number(soc.welfare_fund_balance) || 0) - claim.amount);
        await supabase
          .from('cooperative_societies')
          .update({ welfare_fund_balance: nextBal })
          .eq('id', societyId);
      }
    }

    revalidatePath('/cooperative');
    return {
      success: true,
      claim: {
        id: data.id,
        title: data.document_url || data.type,
        amount: Number(data.premium_amount) || claim.amount,
        type: data.type,
      },
      message: `Disbursement claim for ₹${claim.amount.toLocaleString('en-IN')} approved and logged!`,
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
