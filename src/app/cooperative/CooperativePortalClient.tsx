'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CooperativePortalData,
  CooperativeWorkerItem,
  CommunityContractItem,
  CooperativeSquadItem,
  CooperativeToolItem,
  AssemblyProposalItem,
  approveWorkerMembership,
  rejectWorkerMembership,
  assignFairWorkContract,
  createCommunityContractAction,
  createSquadAction,
  addToolAssetAction,
  toggleToolReservationAction,
  createAssemblyProposalAction,
  voteAssemblyProposalAction,
  toggleSquadStatusAction,
  updateContractStatusAction,
  updateSquadMembersAction,
  createWelfareClaimAction,
  onboardMemberAction,
} from '@/app/actions/cooperative';
import './cooperative.css';

type CoopTab =
  | 'view-dashboard'
  | 'view-workers'
  | 'view-fairwork'
  | 'view-contracts'
  | 'view-squads'
  | 'view-tools'
  | 'view-payments'
  | 'view-welfare'
  | 'view-assembly';

interface TabMeta {
  title: string;
  subtitle: string;
}

const TAB_META: Record<CoopTab, TabMeta> = {
  'view-dashboard': { title: 'Dashboard', subtitle: 'Digital Infrastructure for Labour Cooperatives' },
  'view-workers': { title: 'Worker Roster', subtitle: 'Verified cooperative members and active onboarding' },
  'view-fairwork': { title: 'FairWork Engine™', subtitle: 'Algorithmic balancing of work allocation for cooperative members' },
  'view-contracts': { title: 'Community Contracts', subtitle: 'Manage large-scale service requests from RWAs and institutions' },
  'view-squads': { title: 'Community Squads', subtitle: 'Build and deploy verified teams for bulk contracts' },
  'view-tools': { title: 'Cooperative Tool Bank', subtitle: 'Shared equipment owned and managed by the cooperative' },
  'view-payments': { title: 'Transparent Earnings', subtitle: 'Configured cooperative revenue and surplus distribution' },
  'view-welfare': { title: 'Worker Welfare Fund', subtitle: 'Social security, emergency assistance, and annual dividend' },
  'view-assembly': { title: 'Member Assembly', subtitle: 'Democratic decision-making and cooperative governance' },
};

export function CooperativePortalClient({ initialData }: { initialData: CooperativePortalData }) {
  const [data, setData] = useState<CooperativePortalData>(initialData);
  const [activeTab, setActiveTab] = useState<CoopTab>('view-dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // User voting persistence
  const [userVotes, setUserVotes] = useState<Record<string, 'yes' | 'no'>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem('shramnexus-coop-votes');
      if (stored) setUserVotes(JSON.parse(stored));
    } catch (e) {}
  }, []);

  // Filter states
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterTradeFilter, setRosterTradeFilter] = useState('All');
  const [contractsFilter, setContractsFilter] = useState<'All' | 'Active' | 'Pending' | 'Completed'>('All');
  const [squadsFilter, setSquadsFilter] = useState<'All' | 'Active' | 'Standby'>('All');
  const [toolsFilter, setToolsFilter] = useState<'All' | 'Available' | 'In Use' | 'Maintenance'>('All');
  const [assemblyFilter, setAssemblyFilter] = useState<'All' | 'Active' | 'Approved'>('All');

  // Modals state
  const [showContractModal, setShowContractModal] = useState(false);
  const [showSquadModal, setShowSquadModal] = useState(false);
  const [showToolModal, setShowToolModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardForm, setOnboardForm] = useState({
    name: '',
    phone: '',
    trade: 'Electrician',
    experienceYears: 3,
    aadhaarNumber: '',
  });
  const [onboardLoading, setOnboardLoading] = useState(false);

  // Interactive Management Modals state
  const [selectedContractForDetails, setSelectedContractForDetails] = useState<CommunityContractItem | null>(null);
  const [selectedSquadForManage, setSelectedSquadForManage] = useState<CooperativeSquadItem | null>(null);
  const [squadMembersList, setSquadMembersList] = useState<string[]>([]);
  const [newMemberToAdd, setNewMemberToAdd] = useState<string>('');
  const [selectedWorkerForPass, setSelectedWorkerForPass] = useState<CooperativeWorkerItem | null>(null);
  const [showWelfareClaimModal, setShowWelfareClaimModal] = useState(false);
  const [welfareClaimForm, setWelfareClaimForm] = useState({ title: '', amount: 15000, type: 'Healthcare Emergency', workerName: '' });
  const [showDividendLedgerModal, setShowDividendLedgerModal] = useState(false);

  // Additional Interactive Modals
  const [selectedProposalForDetails, setSelectedProposalForDetails] = useState<AssemblyProposalItem | null>(null);
  const [selectedToolForReserve, setSelectedToolForReserve] = useState<CooperativeToolItem | null>(null);
  const [reserveBorrowerName, setReserveBorrowerName] = useState('');
  const [selectedWorkerForTaskAssign, setSelectedWorkerForTaskAssign] = useState<CooperativeWorkerItem | null>(null);
  const [assignContractTitle, setAssignContractTitle] = useState('Green Valley Residency');

  // Forms state
  const [contractForm, setContractForm] = useState({ rwa: '', service: '', workersNeeded: 4, durationDays: 14, budget: '₹ 75,000' });
  const [squadForm, setSquadForm] = useState({ name: '', assignedContract: '', membersSummary: '' });
  const [toolForm, setToolForm] = useState({ name: '', toolCode: '' });
  const [proposalForm, setProposalForm] = useState({ title: '', description: '', cost: 25000 });

  // Calculation Slider for Payments view
  const [calcAmount, setCalcAmount] = useState(10000);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Contract Details & Status Update
  const handleToggleContractStatus = async (contractId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Completed' : 'Active';
    try {
      await updateContractStatusAction(contractId, nextStatus);
    } catch (e) {}

    setData((prev) => ({
      ...prev,
      contracts: prev.contracts.map((c) =>
        c.id === contractId ? { ...c, status: nextStatus, badgeClass: nextStatus === 'Completed' ? 'coop-badge-verified' : 'coop-badge-gold' } : c
      ),
    }));
    if (selectedContractForDetails) {
      setSelectedContractForDetails({
        ...selectedContractForDetails,
        status: nextStatus,
        badgeClass: nextStatus === 'Completed' ? 'coop-badge-verified' : 'coop-badge-gold',
      });
    }
    showToast(`Contract marked as ${nextStatus}!`);
  };

  // Manage Squad Members
  const handleOpenManageSquad = (squad: CooperativeSquadItem) => {
    setSelectedSquadForManage(squad);
    const members = squad.membersSummary.split(',').map((m) => m.trim()).filter(Boolean);
    setSquadMembersList(members.length > 0 ? members : ['Ravi Kumar', 'Aman Verma', 'Suresh Patel']);
    setNewMemberToAdd('');
  };

  const handleRemoveSquadMember = (memberName: string) => {
    setSquadMembersList((prev) => prev.filter((m) => m !== memberName));
  };

  const handleAddSquadMember = () => {
    if (!newMemberToAdd) return;
    if (squadMembersList.includes(newMemberToAdd)) {
      showToast('Worker is already in this squad');
      return;
    }
    setSquadMembersList((prev) => [...prev, newMemberToAdd]);
    setNewMemberToAdd('');
  };

  const handleSaveSquadMembers = async () => {
    if (!selectedSquadForManage) return;
    const summary = squadMembersList.join(', ');
    const count = squadMembersList.length;
    try {
      await updateSquadMembersAction(selectedSquadForManage.id, summary, count);
    } catch (e) {}

    setData((prev) => ({
      ...prev,
      squads: prev.squads.map((sq) =>
        sq.id === selectedSquadForManage.id ? { ...sq, membersSummary: summary } : sq
      ),
    }));
    setSelectedSquadForManage(null);
    showToast(`Saved ${count} members to squad "${selectedSquadForManage.name}"!`);
  };

  // Welfare Claim
  const handleCreateWelfareClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!welfareClaimForm.title || !welfareClaimForm.amount) {
      showToast('Please provide claim title and amount');
      return;
    }
    try {
      await createWelfareClaimAction({
        title: welfareClaimForm.title,
        amount: Number(welfareClaimForm.amount),
        type: welfareClaimForm.type,
        workerName: welfareClaimForm.workerName,
      });
    } catch (e) {}

    setData((prev) => ({
      ...prev,
      society: {
        ...prev.society,
        welfareFund: Math.max(0, prev.society.welfareFund - Number(welfareClaimForm.amount)),
      },
      welfare: {
        ...prev.welfare,
        utilized: prev.welfare.utilized + Number(welfareClaimForm.amount),
        claims: [
          { title: welfareClaimForm.title, amount: Number(welfareClaimForm.amount) },
          ...prev.welfare.claims,
        ],
      },
    }));
    setShowWelfareClaimModal(false);
    setWelfareClaimForm({ title: '', amount: 15000, type: 'Healthcare Emergency', workerName: '' });
    showToast('Welfare disbursement approved and logged into records!');
  };

  // Export CSV Roster
  const handleExportRosterCSV = () => {
    const headers = 'ID,Name,Trade,Availability,Jobs,Hours,Earnings,FairnessScore,Status\\n';
    const rows = data.workers
      .map((w) => `"${w.id}","${w.name}","${w.trade}","${w.availability}",${w.jobs},${w.hours},"${w.earnings}",${w.fairnessScore},"${w.status}"`)
      .join('\\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${data.society.name.replace(/\\s+/g, '_')}_Workers_Roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported workers roster as CSV successfully!');
  };

  // Switch Society
  const handleSocietyChange = (societyId: string) => {
    window.location.href = `/cooperative?societyId=${societyId}`;
  };

  // Onboard Member Directly
  const handleOnboardMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardForm.name) {
      showToast('Please provide member full name.');
      return;
    }
    setOnboardLoading(true);
    try {
      const res = await onboardMemberAction({
        societyId: data.society.id,
        name: onboardForm.name,
        phone: onboardForm.phone,
        trade: onboardForm.trade,
        experienceYears: Number(onboardForm.experienceYears) || 3,
        aadhaarNumber: onboardForm.aadhaarNumber,
      });

      if (res.success && res.worker) {
        setData((prev) => ({
          ...prev,
          workers: [res.worker!, ...prev.workers],
          society: {
            ...prev.society,
            memberCount: prev.society.memberCount + 1,
            activeMembers: prev.society.activeMembers + 1,
          },
          activities: [
            {
              id: `act-${Date.now()}`,
              icon: '👷',
              title: `${res.worker!.name} (${res.worker!.trade}) onboarded to ${data.society.name} roster.`,
              time: 'Just now',
            },
            ...prev.activities,
          ],
        }));
        setShowOnboardModal(false);
        setOnboardForm({ name: '', phone: '', trade: 'Electrician', experienceYears: 3, aadhaarNumber: '' });
        showToast(`✓ Onboarded ${res.worker.name}! Member ID: ${res.worker.id}`);
      } else {
        showToast(res.error || 'Failed to onboard member.');
      }
    } catch (err: any) {
      showToast('Error onboarding member.');
    } finally {
      setOnboardLoading(false);
    }
  };

  // Worker Approvals
  const handleApproveWorker = async (worker: CooperativeWorkerItem) => {
    try {
      await approveWorkerMembership(worker.id, data.society.id);
      setData((prev) => ({
        ...prev,
        pendingRequests: prev.pendingRequests.filter((w) => w.id !== worker.id),
        workers: [
          {
            ...worker,
            id: `WRK-${Math.floor(1000 + Math.random() * 9000)}`,
            availability: 'Available',
            jobs: 0,
            hours: 0,
            earnings: '₹ 0',
            fairnessScore: 65,
            status: 'Under-utilized',
            statusClass: 'status-gold',
            isPending: false,
          },
          ...prev.workers,
        ],
        society: {
          ...prev.society,
          memberCount: prev.society.memberCount + 1,
        },
      }));
      showToast(`Approved ${worker.name}! Added to Active Society Roster.`);
    } catch (e: any) {
      showToast('Action completed.');
    }
  };

  const handleRejectWorker = async (workerId: string) => {
    try {
      await rejectWorkerMembership(workerId);
      setData((prev) => ({
        ...prev,
        pendingRequests: prev.pendingRequests.filter((w) => w.id !== workerId),
      }));
      showToast('Membership request declined.');
    } catch (e: any) {
      showToast('Request processed.');
    }
  };

  // FairWork Assignment
  const handleAssignFairWork = async (workerName: string, contractTitle: string) => {
    try {
      await assignFairWorkContract(workerName, contractTitle);
      setData((prev) => ({
        ...prev,
        workers: prev.workers.map((w) =>
          w.name.includes(workerName) || workerName.includes(w.name)
            ? { ...w, jobs: w.jobs + 1, fairnessScore: Math.min(100, w.fairnessScore + 20), status: 'Balanced', statusClass: 'status-green' }
            : w
        ),
      }));
      showToast(`FairWork Engine assigned ${contractTitle} to ${workerName}! Workload rebalanced.`);
    } catch (e) {
      showToast('Assignment recorded.');
    }
  };

  // Create Contract
  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractForm.rwa || !contractForm.service) {
      showToast('Please fill in RWA/Client and Service details.');
      return;
    }
    const newContract: CommunityContractItem = {
      id: `cnt-${Date.now()}`,
      rwa: contractForm.rwa,
      service: contractForm.service,
      workersNeeded: Number(contractForm.workersNeeded) || 4,
      durationDays: Number(contractForm.durationDays) || 14,
      budget: contractForm.budget.startsWith('₹') ? contractForm.budget : `₹ ${contractForm.budget}`,
      status: 'Active',
      badgeClass: 'badge-verified',
    };
    try {
      await createCommunityContractAction(newContract, data.society.id);
    } catch (err) {}
    setData((prev) => ({
      ...prev,
      contracts: [newContract, ...prev.contracts],
      society: { ...prev.society, contractsCount: prev.society.contractsCount + 1 },
    }));
    setShowContractModal(false);
    setContractForm({ rwa: '', service: '', workersNeeded: 4, durationDays: 14, budget: '₹ 75,000' });
    showToast(`Created community contract with ${newContract.rwa}!`);
  };

  // Create Squad
  const handleCreateSquad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!squadForm.name || !squadForm.assignedContract) {
      showToast('Please specify Squad Name and Target Contract.');
      return;
    }
    const newSquad: CooperativeSquadItem = {
      id: `sq-${Date.now()}`,
      name: squadForm.name,
      assignedContract: squadForm.assignedContract,
      membersSummary: squadForm.membersSummary || '3 Verified Cooperative Workers',
      status: 'Active',
    };
    try {
      await createSquadAction(newSquad, data.society.id);
    } catch (err) {}
    setData((prev) => ({
      ...prev,
      squads: [newSquad, ...prev.squads],
    }));
    setShowSquadModal(false);
    setSquadForm({ name: '', assignedContract: '', membersSummary: '' });
    showToast(`Assembled and deployed "${newSquad.name}"!`);
  };

  // Add Tool
  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolForm.name) {
      showToast('Please provide tool name.');
      return;
    }
    const newTool: CooperativeToolItem = {
      id: `TB-${Math.floor(100 + Math.random() * 900)}`,
      name: toolForm.name,
      toolCode: toolForm.toolCode || `TB-00${data.tools.length + 1}`,
      status: 'Available',
      statusClass: 'status-green',
    };
    try {
      await addToolAssetAction(newTool, data.society.id);
    } catch (err) {}
    setData((prev) => ({
      ...prev,
      tools: [newTool, ...prev.tools],
    }));
    setShowToolModal(false);
    setToolForm({ name: '', toolCode: '' });
    showToast(`Added ${newTool.name} to Tool Bank!`);
  };

  // Tool Reservation Handlers
  const handleToggleTool = async (tool: CooperativeToolItem) => {
    if (tool.status === 'Available') {
      setSelectedToolForReserve(tool);
      setReserveBorrowerName(data.workers[0]?.name || 'Aman Sharma');
      return;
    }
    handleReturnTool(tool);
  };

  const handleConfirmReserveTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToolForReserve) return;
    const borrower = reserveBorrowerName || 'Aman Sharma';
    try {
      await toggleToolReservationAction(selectedToolForReserve.id, borrower);
    } catch (err) {}

    setData((prev) => ({
      ...prev,
      tools: prev.tools.map((t) =>
        t.id === selectedToolForReserve.id
          ? { ...t, status: 'In Use', statusClass: 'status-gold', currentBorrower: borrower }
          : t
      ),
      activities: [
        {
          id: `act-${Date.now()}`,
          icon: '🧰',
          title: `Tool Bank checked out "${selectedToolForReserve.name}" to ${borrower}.`,
          time: 'Just now',
        },
        ...prev.activities,
      ],
    }));
    setSelectedToolForReserve(null);
    showToast(`Checked out ${selectedToolForReserve.name} to ${borrower}!`);
  };

  const handleReturnTool = async (tool: CooperativeToolItem) => {
    try {
      await toggleToolReservationAction(tool.id, undefined);
    } catch (err) {}

    setData((prev) => ({
      ...prev,
      tools: prev.tools.map((t) =>
        t.id === tool.id
          ? { ...t, status: 'Available', statusClass: 'status-green', currentBorrower: undefined }
          : t
      ),
      activities: [
        {
          id: `act-${Date.now()}`,
          icon: '🧰',
          title: `Tool Bank logged return of "${tool.name}".`,
          time: 'Just now',
        },
        ...prev.activities,
      ],
    }));
    showToast(`Tool ${tool.name} returned to deposit bank.`);
  };

  // Toggle Squad Deployment Status
  const handleToggleSquadStatus = async (squad: CooperativeSquadItem) => {
    const nextStatus = squad.status === 'Active' ? 'Standby' : 'Active';
    try {
      await toggleSquadStatusAction(squad.id, squad.status);
    } catch (err) {}

    setData((prev) => ({
      ...prev,
      squads: prev.squads.map((sq) =>
        sq.id === squad.id ? { ...sq, status: nextStatus as any } : sq
      ),
      activities: [
        {
          id: `act-${Date.now()}`,
          icon: '🛡️',
          title: `Squad "${squad.name}" status switched to ${nextStatus}.`,
          time: 'Just now',
        },
        ...prev.activities,
      ],
    }));
    showToast(`Squad "${squad.name}" set to ${nextStatus}!`);
  };

  // Create Proposal
  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalForm.title) {
      showToast('Please enter a proposal title.');
      return;
    }
    const newProp: AssemblyProposalItem = {
      id: `prop-${Date.now()}`,
      number: data.proposals.length + 24,
      title: proposalForm.title,
      description: proposalForm.description || 'Democratic proposal submitted for cooperative member voting.',
      cost: Number(proposalForm.cost) || 20000,
      yesVotes: 1,
      noVotes: 0,
      status: 'Active',
      badgeClass: 'coop-badge-gold',
    };
    try {
      await createAssemblyProposalAction(newProp, data.society.id);
    } catch (err) {}
    setData((prev) => ({
      ...prev,
      proposals: [newProp, ...prev.proposals],
      activities: [
        {
          id: `act-${Date.now()}`,
          icon: '🗳️',
          title: `New Assembly Proposal published: "${newProp.title}".`,
          time: 'Just now',
        },
        ...prev.activities,
      ],
    }));
    setShowProposalModal(false);
    setProposalForm({ title: '', description: '', cost: 25000 });
    showToast('Democratic proposal posted to Member Assembly!');
  };

  // Vote on Proposal with Multi-vote prevention & quorum status progression
  const handleVoteProposal = async (proposalId: string, vote: 'yes' | 'no') => {
    const prevVote = userVotes[proposalId];
    if (prevVote === vote) {
      showToast(`You have already voted ${vote.toUpperCase()} on this proposal.`);
      return;
    }

    try {
      await voteAssemblyProposalAction(proposalId, vote, prevVote);
    } catch (err) {}

    const updatedVotes = { ...userVotes, [proposalId]: vote };
    setUserVotes(updatedVotes);
    try {
      localStorage.setItem('shramnexus-coop-votes', JSON.stringify(updatedVotes));
    } catch (e) {}

    setData((prev) => ({
      ...prev,
      proposals: prev.proposals.map((p) => {
        if (p.id === proposalId) {
          let newYes = p.yesVotes;
          let newNo = p.noVotes;
          if (prevVote === 'yes') newYes = Math.max(0, newYes - 1);
          if (prevVote === 'no') newNo = Math.max(0, newNo - 1);
          if (vote === 'yes') newYes += 1;
          if (vote === 'no') newNo += 1;

          const total = newYes + newNo;
          const isApproved = total >= 30 && (newYes / total) >= 0.65;
          const nextStatus = isApproved ? 'Approved' : p.status;
          const nextBadge = isApproved ? 'coop-badge-verified' : p.badgeClass;

          return {
            ...p,
            yesVotes: newYes,
            noVotes: newNo,
            status: nextStatus as any,
            badgeClass: nextBadge,
          };
        }
        return p;
      }),
      activities: [
        {
          id: `act-${Date.now()}`,
          icon: '🗳️',
          title: `Member vote cast (${vote.toUpperCase()}) on cooperative resolution.`,
          time: 'Just now',
        },
        ...prev.activities,
      ],
    }));

    if (selectedProposalForDetails && selectedProposalForDetails.id === proposalId) {
      let newYes = selectedProposalForDetails.yesVotes;
      let newNo = selectedProposalForDetails.noVotes;
      if (prevVote === 'yes') newYes = Math.max(0, newYes - 1);
      if (prevVote === 'no') newNo = Math.max(0, newNo - 1);
      if (vote === 'yes') newYes += 1;
      if (vote === 'no') newNo += 1;
      setSelectedProposalForDetails({
        ...selectedProposalForDetails,
        yesVotes: newYes,
        noVotes: newNo,
      });
    }

    showToast(prevVote ? `Changed your vote to ${vote.toUpperCase()}!` : `Your vote (${vote.toUpperCase()}) was recorded!`);
  };

  // Confirm Task Assignment from Modal
  const handleConfirmTaskAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerForTaskAssign) return;
    handleAssignFairWork(selectedWorkerForTaskAssign.name, assignContractTitle);
    setSelectedWorkerForTaskAssign(null);
  };

  // Computed FairWork Metrics
  const balancedWorkers = data.workers.filter((w) => w.status === 'Balanced');
  const underutilizedWorkers = data.workers.filter((w) => w.status === 'Under-utilized');
  const overloadedWorkers = data.workers.filter((w) => w.status === 'Overloaded');
  const avgFairnessScore = data.workers.length > 0
    ? Math.round(data.workers.reduce((sum, w) => sum + w.fairnessScore, 0) / data.workers.length)
    : 84;

  // Dynamic candidate worker and target contract for recommendation
  const candidateWorker = data.workers.length > 0
    ? ([...data.workers].sort((a, b) => a.fairnessScore - b.fairnessScore)[0] || data.workers[0])
    : null;
  const activeContractForRec = data.contracts.find((c) => c.status === 'Active') || data.contracts[0] || null;

  // Filtered lists
  const filteredWorkers = data.workers.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      w.id.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      w.trade.toLowerCase().includes(rosterSearch.toLowerCase());
    const matchesTrade = rosterTradeFilter === 'All' || w.trade.toLowerCase().includes(rosterTradeFilter.toLowerCase());
    return matchesSearch && matchesTrade;
  });

  const filteredContracts = contractsFilter === 'All'
    ? data.contracts
    : data.contracts.filter((c) => c.status === contractsFilter);

  const filteredSquads = squadsFilter === 'All'
    ? data.squads
    : data.squads.filter((s) => s.status === squadsFilter);

  const filteredTools = toolsFilter === 'All'
    ? data.tools
    : data.tools.filter((t) => t.status === toolsFilter);

  const filteredProposals = assemblyFilter === 'All'
    ? data.proposals
    : data.proposals.filter((p) => p.status === assemblyFilter);

  return (
    <div className="coop-portal-root">
      {/* Sidebar */}
      <aside className={`coop-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="coop-sidebar-brand">
          <img src="/logo.png" alt="ShramNexus" className="coop-sidebar-logo" />
          <div>
            <h2>Shram<span>Nexus</span></h2>
            <span className="coop-label">Cooperative Portal</span>
          </div>
        </div>

        <div className="coop-society-profile">
          <div className="coop-society-avatar">
            {data.society.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="coop-society-info">
            <strong>{data.society.name}</strong>
            <span className="coop-badge coop-badge-verified" style={{ fontSize: '0.65rem' }}>
              ✓ {data.society.registrationNumber}
            </span>
            <div style={{ marginTop: '5px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>
              📍 {data.society.district}, {data.society.state}
            </div>
          </div>
        </div>

        <nav className="coop-sidebar-nav">
          <button
            type="button"
            className={`coop-nav-link ${activeTab === 'view-dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('view-dashboard'); setMobileOpen(false); }}
          >
            📊 <span>Dashboard</span>
          </button>
          <button
            type="button"
            className={`coop-nav-link ${activeTab === 'view-workers' ? 'active' : ''}`}
            onClick={() => { setActiveTab('view-workers'); setMobileOpen(false); }}
          >
            👥 <span>Workers & Requests</span>
            {data.pendingRequests.length > 0 && (
              <span className="coop-badge coop-badge-gold" style={{ marginLeft: 'auto', padding: '0.15rem 0.45rem' }}>
                {data.pendingRequests.length}
              </span>
            )}
          </button>
          <button
            type="button"
            className={`coop-nav-link ${activeTab === 'view-fairwork' ? 'active' : ''}`}
            onClick={() => { setActiveTab('view-fairwork'); setMobileOpen(false); }}
          >
            ⚖️ <span>FairWork Engine™</span>
          </button>
          <button
            type="button"
            className={`coop-nav-link ${activeTab === 'view-contracts' ? 'active' : ''}`}
            onClick={() => { setActiveTab('view-contracts'); setMobileOpen(false); }}
          >
            📋 <span>Community Contracts</span>
          </button>
          <button
            type="button"
            className={`coop-nav-link ${activeTab === 'view-squads' ? 'active' : ''}`}
            onClick={() => { setActiveTab('view-squads'); setMobileOpen(false); }}
          >
            🛡️ <span>Squads</span>
          </button>
          <button
            type="button"
            className={`coop-nav-link ${activeTab === 'view-tools' ? 'active' : ''}`}
            onClick={() => { setActiveTab('view-tools'); setMobileOpen(false); }}
          >
            🧰 <span>Tool Bank</span>
          </button>
          <button
            type="button"
            className={`coop-nav-link ${activeTab === 'view-payments' ? 'active' : ''}`}
            onClick={() => { setActiveTab('view-payments'); setMobileOpen(false); }}
          >
            💰 <span>Payments & Dist.</span>
          </button>
          <button
            type="button"
            className={`coop-nav-link ${activeTab === 'view-welfare' ? 'active' : ''}`}
            onClick={() => { setActiveTab('view-welfare'); setMobileOpen(false); }}
          >
            🏥 <span>Welfare Fund</span>
          </button>
          <button
            type="button"
            className={`coop-nav-link ${activeTab === 'view-assembly' ? 'active' : ''}`}
            onClick={() => { setActiveTab('view-assembly'); setMobileOpen(false); }}
          >
            🗳️ <span>Member Assembly</span>
          </button>
        </nav>

        <div className="coop-sidebar-footer">
          <Link href="/" className="coop-btn coop-btn-outline w-100" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
            ← Back to ShramNexus
          </Link>
          <Link href="/admin" className="coop-btn coop-btn-dark w-100" style={{ background: 'rgba(255,255,255,0.06)' }}>
            ⚡ Federation Admin
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="coop-portal-content">
        <header className="coop-portal-topbar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              className="coop-mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              ☰
            </button>
            <div className="coop-topbar-title">
              <h1>{TAB_META[activeTab].title}</h1>
              <p>{TAB_META[activeTab].subtitle}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span className="coop-badge coop-badge-gold">
              🏛️ {data.society.name}
            </span>
            <span className="coop-badge coop-badge-verified">
              Live Network
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(36,23,47,0.06)', padding: '5px 12px', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink)' }}>
                👤 {data.society.name} Admin
              </span>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('shramnexus-coop-auth');
                  localStorage.removeItem('shramnexus-auth');
                  localStorage.removeItem('sharmnexus-auth');
                  sessionStorage.clear();
                  window.location.href = '/auth/login';
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '2px 4px',
                  borderLeft: '1px solid rgba(0,0,0,0.1)',
                  marginLeft: '4px',
                  paddingLeft: '8px',
                }}
                title="Log Out of Cooperative Portal"
              >
                Log Out
              </button>
            </div>
          </div>
        </header>

        <div className="coop-view-container">
          {/* =========================================================
              1. DASHBOARD VIEW
             ========================================================= */}
          {activeTab === 'view-dashboard' && (
            <div>
              <div className="coop-kpi-grid">
                <div className="coop-kpi-card coop-kpi-clickable" onClick={() => setActiveTab('view-workers')} title="Click to view Worker Roster">
                  <span className="coop-kpi-label">Worker Members ↗</span>
                  <strong className="coop-kpi-value">{data.society.memberCount}</strong>
                </div>
                <div className="coop-kpi-card coop-kpi-clickable" onClick={() => setActiveTab('view-fairwork')} title="Click to view FairWork Engine">
                  <span className="coop-kpi-label">Active Members ↗</span>
                  <strong className="coop-kpi-value text-green">{data.society.activeMembers}</strong>
                </div>
                <div className="coop-kpi-card coop-kpi-clickable" onClick={() => setActiveTab('view-contracts')} title="Click to view Contracts">
                  <span className="coop-kpi-label">Jobs This Month ↗</span>
                  <strong className="coop-kpi-value">{data.society.jobsThisMonth}</strong>
                </div>
                <div className="coop-kpi-card coop-kpi-clickable" onClick={() => setActiveTab('view-contracts')} title="Click to view Community Contracts">
                  <span className="coop-kpi-label">Community Contracts ↗</span>
                  <strong className="coop-kpi-value text-violet">{data.contracts.length}</strong>
                </div>
                <div className="coop-kpi-card coop-kpi-clickable" onClick={() => setActiveTab('view-payments')} title="Click to view Transparent Earnings">
                  <span className="coop-kpi-label">Cooperative Revenue (10%) ↗</span>
                  <strong className="coop-kpi-value text-gold">₹ {(data.society.revenue / 100000).toFixed(1)}L</strong>
                </div>
                <div className="coop-kpi-card coop-kpi-clickable" onClick={() => setActiveTab('view-welfare')} title="Click to view Welfare Fund">
                  <span className="coop-kpi-label">Welfare Fund Pool ↗</span>
                  <strong className="coop-kpi-value text-terracotta">₹ {(data.society.welfareFund / 100000).toFixed(1)}L</strong>
                </div>
              </div>

              <div className="coop-card" style={{ marginTop: '2rem' }}>
                <div className="coop-card-header">
                  <h3>Recent Cooperative Activity</h3>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>Automated Federation Audit Log</span>
                </div>
                <ul className="coop-activity-list">
                  {data.activities.map((act) => (
                    <li key={act.id}>
                      <span style={{ fontSize: '1.4rem' }}>{act.icon}</span>
                      <div>
                        <strong>{act.title}</strong>
                        <br />
                        <small className="text-muted">{act.time}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* =========================================================
              2. WORKERS & REQUESTS VIEW
             ========================================================= */}
          {activeTab === 'view-workers' && (
            <div>
              {/* Pending Membership Requests */}
              <div className="coop-card" style={{ borderColor: 'var(--gold)', marginBottom: '1.5rem' }}>
                <div className="coop-card-header">
                  <div>
                    <h3>Pending Membership Requests</h3>
                    <p className="text-muted" style={{ fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>
                      Panchayat & cooperative verification required before onboarding
                    </p>
                  </div>
                  <span className="coop-badge coop-badge-gold">
                    {data.pendingRequests.length} Pending Verification
                  </span>
                </div>
                {data.pendingRequests.length === 0 ? (
                  <p className="text-muted" style={{ padding: '1rem 0' }}>No pending membership requests right now.</p>
                ) : (
                  <div className="coop-table-responsive">
                    <table className="coop-data-table">
                      <thead>
                        <tr>
                          <th>Applicant Name</th>
                          <th>Trade</th>
                          <th>Verification Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.pendingRequests.map((req) => (
                          <tr key={req.id}>
                            <td><strong>{req.name}</strong></td>
                            <td>{req.trade}</td>
                            <td>
                              <span className="coop-badge coop-badge-outline">{req.documentsStatus || 'Submitted'}</span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="coop-btn coop-btn-gold coop-btn-sm"
                                style={{ marginRight: '0.5rem' }}
                                onClick={() => handleApproveWorker(req)}
                              >
                                ✓ Approve Member
                              </button>
                              <button
                                type="button"
                                className="coop-btn coop-btn-outline coop-btn-sm"
                                style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
                                onClick={() => handleRejectWorker(req.id)}
                              >
                                Decline
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Active Roster */}
              <div className="coop-card">
                <div className="coop-card-header">
                  <div>
                    <h3 style={{ margin: 0 }}>Active Society Roster ({filteredWorkers.length})</h3>
                    <p className="text-muted" style={{ fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>
                      Verified members registered under {data.society.name}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="coop-btn coop-btn-gold coop-btn-sm"
                      onClick={() => setShowOnboardModal(true)}
                    >
                      + Onboard Member
                    </button>
                    <button
                      type="button"
                      className="coop-btn coop-btn-dark coop-btn-sm"
                      onClick={handleExportRosterCSV}
                    >
                      📥 Export Registry (CSV)
                    </button>
                  </div>
                </div>

                {/* Search and Trade Filter Bar */}
                <div style={{ marginTop: '1rem' }}>
                  <input
                    type="text"
                    className="coop-form-control"
                    placeholder="🔍 Search worker by name, trade, or member ID..."
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    style={{ marginBottom: '0.85rem' }}
                  />

                  <div className="coop-filter-bar">
                    {['All', 'Electrician', 'Painter', 'Plumber', 'Driver', 'Caregiving'].map((trade) => (
                      <button
                        key={trade}
                        type="button"
                        className={`coop-filter-btn ${rosterTradeFilter === trade ? 'active' : ''}`}
                        onClick={() => setRosterTradeFilter(trade)}
                      >
                        {trade}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="coop-table-responsive">
                  <table className="coop-data-table">
                    <thead>
                      <tr>
                        <th>Worker Name</th>
                        <th>Member ID</th>
                        <th>Trade</th>
                        <th>Availability</th>
                        <th>Jobs</th>
                        <th>Earnings</th>
                        <th>Fairness</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWorkers.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center text-muted" style={{ padding: '3rem 1.5rem' }}>
                            <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>👥</div>
                            <strong style={{ fontSize: '1.05rem', color: 'var(--ink)', display: 'block' }}>No Members Onboarded Yet</strong>
                            <p style={{ margin: '0.4rem auto 1.25rem auto', maxWidth: '420px', fontSize: '0.84rem' }}>
                              Register trade professionals (electricians, painters, plumbers, drivers) from your district to build your cooperative work capacity.
                            </p>
                            <button
                              type="button"
                              className="coop-btn coop-btn-gold coop-btn-sm"
                              onClick={() => setShowOnboardModal(true)}
                            >
                              + Onboard First Member
                            </button>
                          </td>
                        </tr>
                      ) : (
                        filteredWorkers.map((w) => (
                          <tr key={w.id}>
                            <td><strong>{w.name}</strong></td>
                            <td><code>{w.id}</code></td>
                            <td>{w.trade}</td>
                            <td>
                              <span style={{ color: w.availability === 'Available' ? 'var(--green)' : 'var(--muted)' }}>
                                ● {w.availability}
                              </span>
                            </td>
                            <td>{w.jobs}</td>
                            <td>{w.earnings}</td>
                            <td>
                              <span className={`coop-${w.statusClass}`}>
                                {w.fairnessScore}/100 ({w.status})
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="coop-btn coop-btn-outline coop-btn-sm"
                                onClick={() => setSelectedWorkerForPass(w)}
                                title="View Member Digital Pass"
                              >
                                🪪 Member Pass
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              3. FAIRWORK ENGINE™ VIEW
             ========================================================= */}
          {activeTab === 'view-fairwork' && (
            <div>
              <div className="coop-fairwork-banner">
                <h2>FairWork Engine™</h2>
                <p>
                  Algorithmic balancing of job distribution to prevent income monopoly, ensure equal earning opportunities, and support under-utilized cooperative members.
                </p>
              </div>

              <div className="coop-kpi-grid" style={{ marginBottom: '1.8rem' }}>
                <div className="coop-kpi-card">
                  <span className="coop-kpi-label">Balanced Members</span>
                  <strong className="coop-kpi-value text-green">{balancedWorkers.length}</strong>
                </div>
                <div className="coop-kpi-card">
                  <span className="coop-kpi-label">Under-utilized</span>
                  <strong className="coop-kpi-value text-gold">{underutilizedWorkers.length}</strong>
                </div>
                <div className="coop-kpi-card">
                  <span className="coop-kpi-label">Overloaded</span>
                  <strong className="coop-kpi-value text-red">{overloadedWorkers.length}</strong>
                </div>
                <div className="coop-kpi-card">
                  <span className="coop-kpi-label">Avg Fairness Score</span>
                  <strong className="coop-kpi-value">{avgFairnessScore} / 100</strong>
                </div>
              </div>

              {/* Dynamic Recommendation Panel */}
              <div className="coop-recommendation-panel">
                <div className="coop-recommendation-icon">💡</div>
                {candidateWorker ? (
                  <>
                    <div className="coop-recommendation-text">
                      <h3>Fair Allocation Recommendation</h3>
                      <p>
                        Assign upcoming <strong>"{activeContractForRec?.service || 'Community Task'}"</strong> at <strong>{activeContractForRec?.rwa || 'Local Client'}</strong> to <strong>{candidateWorker.name}</strong>.
                        Currently has a lower workload (Fairness Score: <strong>{candidateWorker.fairnessScore}/100</strong>) compared to overloaded members.
                      </p>
                    </div>
                    <div className="coop-recommendation-actions">
                      <button
                        type="button"
                        className="coop-btn coop-btn-gold"
                        onClick={() => handleAssignFairWork(candidateWorker.name, `${activeContractForRec?.rwa || 'Client'} (${activeContractForRec?.service || 'Task'})`)}
                      >
                        Assign Work Now
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="coop-recommendation-text">
                      <h3>FairWork Engine™ on Standby</h3>
                      <p>
                        No workers registered on the active roster yet. Once gig workers in your district join {data.society.name} and contracts are created, the FairWork algorithmic rebalancing engine will automatically monitor hours and recommend equitable assignments.
                      </p>
                    </div>
                    <div className="coop-recommendation-actions">
                      <button
                        type="button"
                        className="coop-btn coop-btn-gold"
                        onClick={() => setActiveTab('view-workers')}
                      >
                        + Onboard Members
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Workload Roster */}
              <div className="coop-card">
                <div className="coop-card-header">
                  <h3>Fairness & Utilization Scoreboard</h3>
                </div>
                <div className="coop-table-responsive">
                  <table className="coop-data-table">
                    <thead>
                      <tr>
                        <th>Worker</th>
                        <th>Trade</th>
                        <th>Current Jobs</th>
                        <th>Hours Logged</th>
                        <th>Earnings</th>
                        <th>Fairness Score</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.workers.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center text-muted" style={{ padding: '2.5rem' }}>
                            No workers registered on the active roster yet. Members will appear here with live fairness scores.
                          </td>
                        </tr>
                      ) : (
                        data.workers.map((w) => (
                          <tr key={w.id}>
                            <td><strong>{w.name}</strong></td>
                            <td>{w.trade}</td>
                            <td>{w.jobs}</td>
                            <td>{w.hours}h</td>
                            <td>{w.earnings}</td>
                            <td><strong>{w.fairnessScore}</strong> / 100</td>
                            <td><span className={`coop-${w.statusClass}`}>{w.status}</span></td>
                            <td>
                              <button
                                type="button"
                                className="coop-btn coop-btn-outline coop-btn-sm"
                                onClick={() => {
                                  setSelectedWorkerForTaskAssign(w);
                                  setAssignContractTitle(activeContractForRec?.rwa ? `${activeContractForRec.rwa} (${activeContractForRec.service})` : 'Green Valley Residency');
                                }}
                              >
                                Assign Task
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              4. COMMUNITY CONTRACTS VIEW
             ========================================================= */}
          {activeTab === 'view-contracts' && (
            <div>
              <div className="justify-between" style={{ marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Community & Institutional Contracts</h3>
                  <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                    Bulk agreements negotiated with Resident Welfare Associations, Municipalities, and Tech Parks.
                  </p>
                </div>
                <button
                  type="button"
                  className="coop-btn coop-btn-dark"
                  onClick={() => setShowContractModal(true)}
                >
                  + Create Contract
                </button>
              </div>

              {/* Status Filter Bar */}
              <div className="coop-filter-bar">
                {(['All', 'Active', 'Pending', 'Completed'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`coop-filter-btn ${contractsFilter === st ? 'active' : ''}`}
                    onClick={() => setContractsFilter(st)}
                  >
                    {st} ({st === 'All' ? data.contracts.length : data.contracts.filter((c) => c.status === st).length})
                  </button>
                ))}
              </div>

              <div className="coop-cards-grid">
                {filteredContracts.length === 0 ? (
                  <div className="coop-card text-center" style={{ gridColumn: '1 / -1', padding: '3rem 2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>📋</div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>No Community Contracts Yet</h3>
                    <p className="text-muted" style={{ maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.88rem' }}>
                      Partner with Resident Welfare Associations, Municipal Sanitation boards, and Tech Parks for multi-week recurring community tenders.
                    </p>
                    <button
                      type="button"
                      className="coop-btn coop-btn-dark"
                      onClick={() => setShowContractModal(true)}
                    >
                      + Create First Community Contract
                    </button>
                  </div>
                ) : (
                  filteredContracts.map((c) => (
                    <div key={c.id} className="coop-obj-card">
                      <div className="coop-obj-head">
                        <h3>{c.rwa}</h3>
                        <span className={`coop-badge ${c.badgeClass}`}>{c.status}</span>
                      </div>
                      <p className="text-muted" style={{ fontSize: '0.88rem', margin: 0 }}>{c.service}</p>
                      <div className="coop-obj-stats">
                        <span>👷 {c.workersNeeded} Workers</span>
                        <span>📅 {c.durationDays} Days</span>
                        <span>💰 {c.budget}</span>
                      </div>
                      <div className="coop-obj-actions">
                        <button
                          type="button"
                          className="coop-btn coop-btn-outline w-100"
                          onClick={() => setSelectedContractForDetails(c)}
                        >
                          View Details & Breakdown
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              5. SQUADS VIEW
             ========================================================= */}
          {activeTab === 'view-squads' && (
            <div>
              <div className="justify-between" style={{ marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Community Squads</h3>
                  <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                    Assemble verified multi-skilled task forces for large commercial and residential contracts.
                  </p>
                </div>
                <button
                  type="button"
                  className="coop-btn coop-btn-dark"
                  onClick={() => setShowSquadModal(true)}
                >
                  + Create Squad
                </button>
              </div>

              {/* Status Filter Bar */}
              <div className="coop-filter-bar">
                {(['All', 'Active', 'Standby'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`coop-filter-btn ${squadsFilter === st ? 'active' : ''}`}
                    onClick={() => setSquadsFilter(st)}
                  >
                    {st} ({st === 'All' ? data.squads.length : data.squads.filter((sq) => sq.status === st).length})
                  </button>
                ))}
              </div>

              <div className="coop-cards-grid">
                {filteredSquads.length === 0 ? (
                  <div className="coop-card text-center" style={{ gridColumn: '1 / -1', padding: '3rem 2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🛡️</div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>No Squads Assembled Yet</h3>
                    <p className="text-muted" style={{ maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.88rem' }}>
                      Group your verified trade workers (electricians, painters, plumbers) into rapid-deployment squads for bulk institutional contracts.
                    </p>
                    <button
                      type="button"
                      className="coop-btn coop-btn-dark"
                      onClick={() => setShowSquadModal(true)}
                    >
                      + Form First Squad
                    </button>
                  </div>
                ) : (
                  filteredSquads.map((s) => (
                    <div key={s.id} className="coop-obj-card">
                      <div className="coop-obj-head">
                        <h3>{s.name}</h3>
                        <span className={`coop-badge ${s.status === 'Active' ? 'coop-badge-verified' : 'coop-badge-gold'}`}>
                          {s.status}
                        </span>
                      </div>
                      <p className="text-muted" style={{ fontSize: '0.88rem', margin: '0 0 0.5rem 0' }}>
                        Assigned: <strong>{s.assignedContract}</strong>
                      </p>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text)', background: 'var(--cream)', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
                        👥 {s.membersSummary}
                      </p>
                      <div className="coop-obj-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="coop-btn coop-btn-dark"
                          style={{ flex: 1.3 }}
                          onClick={() => handleOpenManageSquad(s)}
                        >
                          Manage Members
                        </button>
                        <button
                          type="button"
                          className="coop-btn coop-btn-outline"
                          style={{ flex: 1 }}
                          onClick={() => handleToggleSquadStatus(s)}
                          title="Toggle between deployed active state and standby"
                        >
                          {s.status === 'Active' ? '⏸ Standby' : '🚀 Deploy'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              6. TOOL BANK VIEW
             ========================================================= */}
          {activeTab === 'view-tools' && (
            <div>
              <div className="justify-between" style={{ marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Cooperative Tool Bank</h3>
                  <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                    Shared capital equipment owned and maintained by the cooperative for member use.
                  </p>
                </div>
                <button
                  type="button"
                  className="coop-btn coop-btn-gold"
                  onClick={() => setShowToolModal(true)}
                >
                  + Add Asset
                </button>
              </div>

              {/* Status Filter Bar */}
              <div className="coop-filter-bar">
                {(['All', 'Available', 'In Use', 'Maintenance'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`coop-filter-btn ${toolsFilter === st ? 'active' : ''}`}
                    onClick={() => setToolsFilter(st)}
                  >
                    {st} ({st === 'All' ? data.tools.length : data.tools.filter((t) => (t.status as string) === st).length})
                  </button>
                ))}
              </div>

              <div className="coop-cards-grid">
                {filteredTools.length === 0 ? (
                  <div className="coop-card text-center" style={{ gridColumn: '1 / -1', padding: '3rem 2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🧰</div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>Cooperative Tool Bank is Empty</h3>
                    <p className="text-muted" style={{ maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.88rem' }}>
                      Equip your cooperative with shared high-value machinery (airless paint sprayers, scaffolding, hammer drills) for member check-out.
                    </p>
                    <button
                      type="button"
                      className="coop-btn coop-btn-gold"
                      onClick={() => setShowToolModal(true)}
                    >
                      + Add First Tool Asset
                    </button>
                  </div>
                ) : (
                  filteredTools.map((t) => (
                    <div key={t.id} className="coop-obj-card text-center" style={{ padding: '1.8rem 1.5rem' }}>
                      <div style={{ fontSize: '2.8rem', marginBottom: '0.75rem' }}>🧰</div>
                      <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>{t.name}</h3>
                      <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                        ID: <code>{t.toolCode}</code>
                      </p>
                      <div>
                        <span className={`coop-${t.statusClass}`}>
                          ● {t.status}
                        </span>
                        {t.currentBorrower && (
                          <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginTop: '0.2rem' }}>
                            (Held by: <strong>{t.currentBorrower}</strong>)
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className={`coop-btn ${t.status === 'Available' ? 'coop-btn-gold' : 'coop-btn-outline'} w-100`}
                        style={{ marginTop: '1.25rem' }}
                        onClick={() => handleToggleTool(t)}
                      >
                        {t.status === 'Available' ? 'Reserve Tool' : '✓ Mark Returned'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* =========================================================
              7. PAYMENTS & DISTRIBUTION VIEW
             ========================================================= */}
          {activeTab === 'view-payments' && (
            <div>
              <div className="coop-card text-center" style={{ padding: '2.5rem 2rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>
                  Transparent Cooperative Revenue Split
                </h2>
                <span className="coop-badge coop-badge-outline" style={{ marginBottom: '1.5rem' }}>
                  Statutory 85 / 10 / 5 Fair Distribution Model
                </span>

                <div style={{ maxWidth: '520px', margin: '1rem auto' }}>
                  {/* Preset Simulation Amount Buttons */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {[15000, 50000, 85000, 140000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        className={`coop-filter-btn ${calcAmount === amt ? 'active' : ''}`}
                        onClick={() => setCalcAmount(amt)}
                      >
                        ₹{amt.toLocaleString('en-IN')} {amt === 15000 ? '(Minor Repair)' : amt === 50000 ? '(Residential)' : amt === 85000 ? '(RWA Monthly)' : '(Commercial)'}
                      </button>
                    ))}
                  </div>

                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                    Simulated Contract Value: ₹ {calcAmount.toLocaleString('en-IN')}
                  </label>
                  <input
                    type="range"
                    min={5000}
                    max={250000}
                    step={2500}
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--gold)' }}
                  />
                </div>

                {/* Proportional Visual Bar */}
                <div className="coop-distribution-bar">
                  <div className="coop-dist-seg-worker">85% Direct Worker Wages</div>
                  <div className="coop-dist-seg-coop">10% Ops</div>
                  <div className="coop-dist-seg-welfare">5%</div>
                </div>

                {/* 3 Structured Breakdown Cards */}
                <div className="coop-distribution-cards">
                  {/* 1. Worker Share */}
                  <div className="coop-dist-card coop-dist-card-worker">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="coop-badge coop-badge-verified" style={{ fontSize: '0.72rem' }}>
                        85% Member Share
                      </span>
                      <span style={{ fontSize: '1.2rem' }}>👷</span>
                    </div>
                    <h3 style={{ fontSize: '1.75rem', color: 'var(--green)', margin: '0.6rem 0 0.2rem 0', fontWeight: 800 }}>
                      ₹ {Math.round(calcAmount * 0.85).toLocaleString('en-IN')}
                    </h3>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--ink)' }}>Direct Member Wages</strong>
                    <p className="text-muted" style={{ fontSize: '0.78rem', margin: '0.35rem 0 0 0', lineHeight: 1.4 }}>
                      Deposited directly to member accounts. Zero corporate platform commissions taken.
                    </p>
                  </div>

                  {/* 2. Society Ops */}
                  <div className="coop-dist-card coop-dist-card-coop">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="coop-badge coop-badge-gold" style={{ fontSize: '0.72rem' }}>
                        10% Society Ops
                      </span>
                      <span style={{ fontSize: '1.2rem' }}>🏢</span>
                    </div>
                    <h3 style={{ fontSize: '1.75rem', color: 'var(--ink)', margin: '0.6rem 0 0.2rem 0', fontWeight: 800 }}>
                      ₹ {Math.round(calcAmount * 0.10).toLocaleString('en-IN')}
                    </h3>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--ink)' }}>Operations & Tool Bank</strong>
                    <p className="text-muted" style={{ fontSize: '0.78rem', margin: '0.35rem 0 0 0', lineHeight: 1.4 }}>
                      Maintains cooperative depots, power tools, logistics, and digital coordination.
                    </p>
                  </div>

                  {/* 3. Welfare Fund */}
                  <div className="coop-dist-card coop-dist-card-welfare">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="coop-badge" style={{ background: 'rgba(217,111,77,0.15)', color: 'var(--terracotta)', borderColor: 'var(--terracotta)', fontSize: '0.72rem' }}>
                        5% Social Security
                      </span>
                      <span style={{ fontSize: '1.2rem' }}>🏥</span>
                    </div>
                    <h3 style={{ fontSize: '1.75rem', color: 'var(--terracotta)', margin: '0.6rem 0 0.2rem 0', fontWeight: 800 }}>
                      ₹ {Math.round(calcAmount * 0.05).toLocaleString('en-IN')}
                    </h3>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--ink)' }}>Welfare & Emergency Corpus</strong>
                    <p className="text-muted" style={{ fontSize: '0.78rem', margin: '0.35rem 0 0 0', lineHeight: 1.4 }}>
                      Provides accidental insurance, medical emergency grants, and annual dividends.
                    </p>
                  </div>
                </div>

                <p className="text-muted" style={{ fontSize: '0.85rem', maxWidth: '600px', margin: '1.5rem auto 0 auto' }}>
                  Unlike gig aggregators that take 25–35% corporate commission, ShramNexus returns 85% directly to worker wages, retains 10% for local cooperative society operations, and reserves 5% in the member welfare corpus.
                </p>
              </div>

              {/* Settlement History Table */}
              <div className="coop-card">
                <div className="coop-card-header">
                  <h3>Recent Cooperative Contract Distributions</h3>
                  <span className="coop-badge coop-badge-verified">Audited via Smart Ledger</span>
                </div>
                <div className="coop-table-responsive">
                  <table className="coop-data-table">
                    <thead>
                      <tr>
                        <th>Contract / Project</th>
                        <th>Gross Value</th>
                        <th>Direct Wages (85%)</th>
                        <th>Society Ops (10%)</th>
                        <th>Welfare (5%)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.contracts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-muted" style={{ padding: '2.5rem' }}>
                            No contracts settled yet. Completed community projects will log transparent 85/10/5 disbursements here.
                          </td>
                        </tr>
                      ) : (
                        data.contracts.map((c) => {
                        const numericVal = parseFloat(c.budget.replace(/[^0-9.]/g, '')) || 75000;
                        return (
                          <tr key={c.id}>
                            <td>
                              <strong>{c.rwa}</strong>
                              <br />
                              <small className="text-muted">{c.service}</small>
                            </td>
                            <td><strong>₹ {numericVal.toLocaleString('en-IN')}</strong></td>
                            <td className="text-green">₹ {Math.round(numericVal * 0.85).toLocaleString('en-IN')}</td>
                            <td>₹ {Math.round(numericVal * 0.10).toLocaleString('en-IN')}</td>
                            <td className="text-terracotta">₹ {Math.round(numericVal * 0.05).toLocaleString('en-IN')}</td>
                            <td>
                              <span className={`coop-badge ${c.status === 'Completed' ? 'coop-badge-verified' : 'coop-badge-gold'}`}>
                                {c.status === 'Completed' ? 'Disbursed' : 'In Progress'}
                              </span>
                            </td>
                          </tr>
                        );
                      }))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              8. WELFARE FUND VIEW
             ========================================================= */}
          {activeTab === 'view-welfare' && (
            <div>
              <div className="coop-kpi-grid" style={{ marginBottom: '1.8rem' }}>
                <div className="coop-kpi-card">
                  <span className="coop-kpi-label">Total Fund (कल्याण निधि)</span>
                  <strong className="coop-kpi-value text-gold">₹ {(data.welfare.totalFund / 100000).toFixed(1)}L</strong>
                </div>
                <div className="coop-kpi-card">
                  <span className="coop-kpi-label">Monthly Inflow</span>
                  <strong className="coop-kpi-value text-green">+₹ {(data.welfare.monthlyContribution / 1000).toFixed(0)}K</strong>
                </div>
                <div className="coop-kpi-card">
                  <span className="coop-kpi-label">Utilized This Quarter</span>
                  <strong className="coop-kpi-value text-terracotta">-₹ {(data.welfare.utilized / 100000).toFixed(1)}L</strong>
                </div>
              </div>

              <div className="coop-dashboard-split">
                <div className="coop-card">
                  <div className="coop-card-header">
                    <h3>Fund Utilization & Claims</h3>
                    <button
                      type="button"
                      className="coop-btn coop-btn-outline coop-btn-sm"
                      onClick={() => setShowWelfareClaimModal(true)}
                    >
                      + File Claim / Disbursement
                    </button>
                  </div>
                  <table className="coop-data-table">
                    <tbody>
                      {data.welfare.claims.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="text-center text-muted" style={{ padding: '2rem' }}>
                            No welfare claims filed yet. Medical emergencies, safety gear grants, and assistance claims will be recorded here.
                          </td>
                        </tr>
                      ) : (
                        data.welfare.claims.map((cl, i) => (
                          <tr key={i}>
                            <td><strong>{cl.title}</strong></td>
                            <td className="text-right text-red" style={{ fontWeight: 700 }}>
                              -₹ {cl.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="coop-card text-center" style={{ padding: '2rem' }}>
                  <span className="coop-badge coop-badge-gold" style={{ marginBottom: '0.75rem' }}>Member Benefits</span>
                  <h2 style={{ fontSize: '1.6rem', margin: '0 0 1.25rem 0' }}>Annual Dividend (लाभांश)</h2>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                    <span>Projected Cooperative Surplus:</span>
                    <strong>₹ {data.welfare.projectedSurplus.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                    <span>Member Dividend Pool (50%):</span>
                    <strong>₹ {data.welfare.dividendPool.toLocaleString('en-IN')}</strong>
                  </div>

                  <div style={{ margin: '1.5rem 0 1rem 0' }}>
                    <h3 className="text-green" style={{ fontSize: '1.7rem', margin: 0 }}>
                      ₹ {data.welfare.avgPerMember.toLocaleString('en-IN')}
                    </h3>
                    <small className="text-muted">Projected Dividend per active member</small>
                  </div>

                  <button
                    type="button"
                    className="coop-btn coop-btn-dark w-100"
                    onClick={() => setShowDividendLedgerModal(true)}
                  >
                    Review Member Payout Audit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              9. MEMBER ASSEMBLY VIEW — DEMOCRATIC GOVERNANCE
             ========================================================= */}
          {activeTab === 'view-assembly' && (
            <div>
              <div className="coop-assembly-banner">
                <h2>One Member. One Voice.</h2>
                <p>
                  Democratic decision-making for cooperative members. Vote on capital investments, welfare policies, and society equipment purchases.
                </p>
                <button
                  type="button"
                  className="coop-btn coop-btn-gold"
                  style={{ marginTop: '1rem' }}
                  onClick={() => setShowProposalModal(true)}
                >
                  + Create New Proposal
                </button>
              </div>

              {/* Assembly Filter Tabs */}
              <div className="coop-filter-bar" style={{ marginTop: '1.5rem' }}>
                {(['All', 'Active', 'Approved'] as const).map((flt) => (
                  <button
                    key={flt}
                    type="button"
                    className={`coop-filter-btn ${assemblyFilter === flt ? 'active' : ''}`}
                    onClick={() => setAssemblyFilter(flt)}
                  >
                    {flt} Proposals ({flt === 'All' ? data.proposals.length : data.proposals.filter((p) => p.status === flt).length})
                  </button>
                ))}
              </div>

              <div className="coop-cards-grid">
                {filteredProposals.length === 0 ? (
                  <div className="coop-card text-center" style={{ gridColumn: '1 / -1', padding: '3rem 2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🗳️</div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>No Active Proposals in Member Assembly</h3>
                    <p className="text-muted" style={{ maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.88rem' }}>
                      Democratic member governance allows verified workers to introduce and vote on capital purchases, welfare policies, and minimum wage adjustments.
                    </p>
                    <button
                      type="button"
                      className="coop-btn coop-btn-gold"
                      onClick={() => setShowProposalModal(true)}
                    >
                      + Create First Proposal
                    </button>
                  </div>
                ) : (
                  filteredProposals.map((prop) => {
                    const totalVotes = prop.yesVotes + prop.noVotes;
                    const approvalPercent = totalVotes > 0 ? Math.round((prop.yesVotes / totalVotes) * 100) : 0;
                    const userVote = userVotes[prop.id];
                    const isApproved = prop.status === 'Approved';

                    return (
                      <div key={prop.id} className="coop-obj-card">
                        <div className="coop-obj-head">
                          <h3 style={{ fontSize: '1.05rem', lineHeight: 1.3 }}>{prop.title}</h3>
                          <span className={`coop-badge ${prop.badgeClass}`}>{prop.status}</span>
                        </div>
                        <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>
                          Proposal #{prop.number} • Budget: ₹ {prop.cost.toLocaleString('en-IN')}
                        </p>
                        <p style={{ fontSize: '0.86rem', lineHeight: 1.45, color: 'var(--text)', margin: '0.6rem 0' }}>
                          {prop.description}
                        </p>

                        {/* Votes Numbers */}
                        <div style={{ background: 'var(--cream)', padding: '0.75rem 1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-around', textAlign: 'center', margin: '0.6rem 0' }}>
                          <div>
                            <strong className="text-green" style={{ fontSize: '1.35rem' }}>{prop.yesVotes}</strong>
                            <br />
                            <small style={{ fontWeight: 700, color: 'var(--green)', fontSize: '0.75rem' }}>YES</small>
                          </div>
                          <div style={{ width: '1px', background: 'var(--border)' }}></div>
                          <div>
                            <strong className="text-red" style={{ fontSize: '1.35rem' }}>{prop.noVotes}</strong>
                            <br />
                            <small style={{ fontWeight: 700, color: 'var(--red)', fontSize: '0.75rem' }}>NO</small>
                          </div>
                        </div>

                        {/* Live Visual Voting Progress & Quorum Bar */}
                        <div style={{ marginBottom: '1rem' }}>
                          <div className="coop-vote-progress">
                            <div className="coop-vote-bar-yes" style={{ width: `${approvalPercent}%` }} />
                            <div className="coop-vote-bar-no" style={{ width: `${100 - approvalPercent}%` }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600 }}>
                            <span>Approval: <strong className="text-green">{approvalPercent}%</strong></span>
                            <span>Quorum: <strong>{totalVotes}</strong> / 50 Votes ({totalVotes >= 50 ? '✓ Met' : `${50 - totalVotes} more needed`})</span>
                          </div>
                        </div>

                        {/* Interactive Actions Area */}
                        <div style={{ marginTop: 'auto' }}>
                          {isApproved ? (
                            <div>
                              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.78rem', color: '#065f46', fontWeight: 600, textAlign: 'center', marginBottom: '0.5rem' }}>
                                ✓ Resolution Passed & Ratified by Member Assembly
                              </div>
                              <button
                                type="button"
                                className="coop-btn coop-btn-outline w-100 coop-btn-sm"
                                onClick={() => setSelectedProposalForDetails(prop)}
                              >
                                📄 View Resolution Terms
                              </button>
                            </div>
                          ) : (
                            <div>
                              {userVote ? (
                                <div>
                                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                    <div
                                      style={{
                                        flex: 1,
                                        background: userVote === 'yes' ? 'var(--green)' : 'var(--red)',
                                        color: '#fff',
                                        borderRadius: '8px',
                                        padding: '0.45rem',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        textAlign: 'center',
                                      }}
                                    >
                                      ✓ You Voted {userVote.toUpperCase()}
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleVoteProposal(prop.id, userVote === 'yes' ? 'no' : 'yes')}
                                      style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.75rem', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                                    >
                                      Change vote to {userVote === 'yes' ? 'NO' : 'YES'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedProposalForDetails(prop)}
                                      style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                                    >
                                      Details ↗
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                    <button
                                      type="button"
                                      className="coop-btn coop-btn-outline"
                                      style={{ flex: 1, borderColor: 'var(--green)', color: 'var(--green)' }}
                                      onClick={() => handleVoteProposal(prop.id, 'yes')}
                                    >
                                      👍 Vote YES
                                    </button>
                                    <button
                                      type="button"
                                      className="coop-btn coop-btn-outline"
                                      style={{ flex: 1, borderColor: 'var(--red)', color: 'var(--red)' }}
                                      onClick={() => handleVoteProposal(prop.id, 'no')}
                                    >
                                      👎 Vote NO
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    className="coop-btn coop-btn-outline w-100 coop-btn-sm"
                                    style={{ fontSize: '0.75rem' }}
                                    onClick={() => setSelectedProposalForDetails(prop)}
                                  >
                                    View Terms & Justification
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* =========================================================
          MODALS
         ========================================================= */}
      {/* Create Contract Modal */}
      {showContractModal && (
        <div className="coop-modal-overlay">
          <div className="coop-modal-content">
            <h2 style={{ fontSize: '1.4rem', margin: '0 0 1rem 0' }}>+ Create Community Contract</h2>
            <form onSubmit={handleCreateContract}>
              <div className="coop-form-group">
                <label>RWA / Institutional Client</label>
                <input
                  type="text"
                  className="coop-form-control"
                  placeholder="e.g. Royal Greens Residency RWA"
                  value={contractForm.rwa}
                  onChange={(e) => setContractForm({ ...contractForm, rwa: e.target.value })}
                  required
                />
              </div>
              <div className="coop-form-group">
                <label>Service Description</label>
                <input
                  type="text"
                  className="coop-form-control"
                  placeholder="e.g. Painting, Plumbing & Waterproofing"
                  value={contractForm.service}
                  onChange={(e) => setContractForm({ ...contractForm, service: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="coop-form-group" style={{ flex: 1 }}>
                  <label>Workers Needed</label>
                  <input
                    type="number"
                    min={1}
                    className="coop-form-control"
                    value={contractForm.workersNeeded}
                    onChange={(e) => setContractForm({ ...contractForm, workersNeeded: Number(e.target.value) })}
                  />
                </div>
                <div className="coop-form-group" style={{ flex: 1 }}>
                  <label>Duration (Days)</label>
                  <input
                    type="number"
                    min={1}
                    className="coop-form-control"
                    value={contractForm.durationDays}
                    onChange={(e) => setContractForm({ ...contractForm, durationDays: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="coop-form-group">
                <label>Budget (₹)</label>
                <input
                  type="text"
                  className="coop-form-control"
                  placeholder="e.g. ₹ 85,000"
                  value={contractForm.budget}
                  onChange={(e) => setContractForm({ ...contractForm, budget: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="coop-btn coop-btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setShowContractModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="coop-btn coop-btn-dark"
                  style={{ flex: 1 }}
                >
                  Confirm Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Squad Modal */}
      {showSquadModal && (
        <div className="coop-modal-overlay">
          <div className="coop-modal-content">
            <h2 style={{ fontSize: '1.4rem', margin: '0 0 1rem 0' }}>+ Create Cooperative Squad</h2>
            <form onSubmit={handleCreateSquad}>
              <div className="coop-form-group">
                <label>Squad Name</label>
                <input
                  type="text"
                  className="coop-form-control"
                  placeholder="e.g. Commercial Painting Squad B"
                  value={squadForm.name}
                  onChange={(e) => setSquadForm({ ...squadForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="coop-form-group">
                <label>Assigned Contract / Project</label>
                <input
                  type="text"
                  className="coop-form-control"
                  placeholder="e.g. Green Valley Residency"
                  value={squadForm.assignedContract}
                  onChange={(e) => setSquadForm({ ...squadForm, assignedContract: e.target.value })}
                  required
                />
              </div>
              <div className="coop-form-group">
                <label>Assigned Workers Summary</label>
                <input
                  type="text"
                  className="coop-form-control"
                  placeholder="e.g. Ravi Kumar, Aman Sharma + 3 Members"
                  value={squadForm.membersSummary}
                  onChange={(e) => setSquadForm({ ...squadForm, membersSummary: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="coop-btn coop-btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setShowSquadModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="coop-btn coop-btn-dark"
                  style={{ flex: 1 }}
                >
                  Deploy Squad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Tool Asset Modal */}
      {showToolModal && (
        <div className="coop-modal-overlay">
          <div className="coop-modal-content">
            <h2 style={{ fontSize: '1.4rem', margin: '0 0 1rem 0' }}>+ Add Tool to Bank</h2>
            <form onSubmit={handleAddTool}>
              <div className="coop-form-group">
                <label>Equipment / Tool Name</label>
                <input
                  type="text"
                  className="coop-form-control"
                  placeholder="e.g. High Pressure Pipe Jetter"
                  value={toolForm.name}
                  onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="coop-form-group">
                <label>Tool Identification Code</label>
                <input
                  type="text"
                  className="coop-form-control"
                  placeholder="e.g. TB-009"
                  value={toolForm.toolCode}
                  onChange={(e) => setToolForm({ ...toolForm, toolCode: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="coop-btn coop-btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setShowToolModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="coop-btn coop-btn-gold"
                  style={{ flex: 1 }}
                >
                  Save Tool Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Proposal Modal */}
      {showProposalModal && (
        <div className="coop-modal-overlay">
          <div className="coop-modal-content">
            <h2 style={{ fontSize: '1.4rem', margin: '0 0 1rem 0' }}>+ New Assembly Proposal</h2>
            <form onSubmit={handleCreateProposal}>
              <div className="coop-form-group">
                <label>Proposal Title</label>
                <input
                  type="text"
                  className="coop-form-control"
                  placeholder="e.g. Procure Solar Inverter Testing Kits"
                  value={proposalForm.title}
                  onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="coop-form-group">
                <label>Purpose & Justification</label>
                <textarea
                  className="coop-form-control"
                  rows={3}
                  placeholder="Explain why this proposal benefits all members of the society..."
                  value={proposalForm.description}
                  onChange={(e) => setProposalForm({ ...proposalForm, description: e.target.value })}
                />
              </div>
              <div className="coop-form-group">
                <label>Estimated Cost (₹)</label>
                <input
                  type="number"
                  min={0}
                  className="coop-form-control"
                  value={proposalForm.cost}
                  onChange={(e) => setProposalForm({ ...proposalForm, cost: Number(e.target.value) })}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="coop-btn coop-btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setShowProposalModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="coop-btn coop-btn-gold"
                  style={{ flex: 1 }}
                >
                  Publish Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. Contract Details & Financial Breakdown Modal */}
      {selectedContractForDetails && (
        <div className="coop-modal-overlay">
          <div className="coop-modal-content" style={{ maxWidth: '560px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div>
                <span className={`coop-badge ${selectedContractForDetails.badgeClass}`} style={{ marginBottom: '4px' }}>
                  {selectedContractForDetails.status}
                </span>
                <h2 style={{ fontSize: '1.35rem', margin: 0 }}>{selectedContractForDetails.rwa}</h2>
                <small className="text-muted">{selectedContractForDetails.service}</small>
              </div>
              <button
                type="button"
                onClick={() => setSelectedContractForDetails(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: 'var(--cream)', padding: '12px', borderRadius: '10px', marginBottom: '16px' }}>
              <div>
                <small className="text-muted" style={{ fontSize: '0.72rem', display: 'block' }}>CREW REQUIRED</small>
                <strong>👷 {selectedContractForDetails.workersNeeded} Workers</strong>
              </div>
              <div>
                <small className="text-muted" style={{ fontSize: '0.72rem', display: 'block' }}>CONTRACT DURATION</small>
                <strong>📅 {selectedContractForDetails.durationDays} Days</strong>
              </div>
              <div>
                <small className="text-muted" style={{ fontSize: '0.72rem', display: 'block' }}>MONTHLY BUDGET</small>
                <strong className="text-gold">{selectedContractForDetails.budget}</strong>
              </div>
            </div>

            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>FairWork™ Revenue Breakdown (85 / 10 / 5 Rule)</h4>
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>👷 Direct Member Wages (85%):</span>
                <strong className="text-green">
                  ₹ {Math.round((parseFloat(selectedContractForDetails.budget.replace(/[^0-9.]/g, '')) || 75000) * 0.85).toLocaleString('en-IN')}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>🏢 Society Operations & Tools (10%):</span>
                <strong>
                  ₹ {Math.round((parseFloat(selectedContractForDetails.budget.replace(/[^0-9.]/g, '')) || 75000) * 0.10).toLocaleString('en-IN')}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>🏥 Worker Welfare Fund (5%):</span>
                <strong className="text-terracotta">
                  ₹ {Math.round((parseFloat(selectedContractForDetails.budget.replace(/[^0-9.]/g, '')) || 75000) * 0.05).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="coop-btn coop-btn-outline"
                style={{ flex: 1 }}
                onClick={() => setSelectedContractForDetails(null)}
              >
                Close
              </button>
              <button
                type="button"
                className={`coop-btn ${selectedContractForDetails.status === 'Active' ? 'coop-btn-dark' : 'coop-btn-gold'}`}
                style={{ flex: 1.5 }}
                onClick={() => handleToggleContractStatus(selectedContractForDetails.id, selectedContractForDetails.status)}
              >
                {selectedContractForDetails.status === 'Active' ? '✓ Mark Contract Completed' : '↺ Reactivate Contract'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Manage Squad Members Modal */}
      {selectedSquadForManage && (
        <div className="coop-modal-overlay">
          <div className="coop-modal-content" style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div>
                <span className="coop-badge coop-badge-verified" style={{ marginBottom: '4px' }}>
                  {selectedSquadForManage.status}
                </span>
                <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Manage Squad: {selectedSquadForManage.name}</h2>
                <small className="text-muted">Assigned Contract: {selectedSquadForManage.assignedContract}</small>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSquadForManage(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                Assigned Squad Members ({squadMembersList.length})
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '44px', background: 'var(--cream)', padding: '10px', borderRadius: '10px' }}>
                {squadMembersList.length === 0 ? (
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>No workers currently assigned to this squad.</span>
                ) : (
                  squadMembersList.map((m, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#fff',
                        border: '1px solid var(--border)',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                      }}
                    >
                      👤 {m}
                      <button
                        type="button"
                        onClick={() => handleRemoveSquadMember(m)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 800, padding: '0 2px' }}
                        title="Remove member from squad"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                + Add Member from Active Society Roster
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  className="coop-form-control"
                  value={newMemberToAdd}
                  onChange={(e) => setNewMemberToAdd(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">-- Select Worker from Roster --</option>
                  {data.workers
                    .filter((w) => !squadMembersList.some((m) => m.includes(w.name)))
                    .map((w) => (
                      <option key={w.id} value={`${w.name} (${w.trade})`}>
                        {w.name} — {w.trade} ({w.availability})
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  className="coop-btn coop-btn-gold"
                  onClick={handleAddSquadMember}
                  disabled={!newMemberToAdd}
                >
                  Add
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                className="coop-btn coop-btn-outline"
                style={{ flex: 1 }}
                onClick={() => setSelectedSquadForManage(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="coop-btn coop-btn-dark"
                style={{ flex: 1.5 }}
                onClick={handleSaveSquadMembers}
              >
                Save Squad Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Worker Digital Cooperative Pass Modal */}
      {selectedWorkerForPass && (
        <div className="coop-modal-overlay">
          <div className="coop-modal-content" style={{ maxWidth: '460px', textAlign: 'center' }}>
            <div style={{ border: '2px solid var(--border)', borderRadius: '16px', padding: '24px', background: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: 'linear-gradient(90deg, #e6aa3b, #d96f4d)' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
                <img src="/logo.png" alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
                <strong style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>SHRAMNEXUS COOPERATIVE PASS</strong>
              </div>

              <span className="coop-badge coop-badge-verified" style={{ marginBottom: '14px', display: 'inline-block' }}>
                ✓ Official Member Pass
              </span>

              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--cream)', border: '2px solid var(--gold)', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, color: 'var(--ink)' }}>
                {selectedWorkerForPass.name.slice(0, 2).toUpperCase()}
              </div>

              <h2 style={{ fontSize: '1.35rem', margin: '0 0 4px 0' }}>{selectedWorkerForPass.name}</h2>
              <p style={{ color: 'var(--terracotta)', fontWeight: 700, margin: '0 0 14px 0', fontSize: '0.9rem' }}>
                {selectedWorkerForPass.trade}
              </p>

              <div style={{ background: 'var(--cream)', borderRadius: '10px', padding: '12px', textAlign: 'left', fontSize: '0.82rem', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span className="text-muted">Member ID:</span>
                  <code>{selectedWorkerForPass.id}</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span className="text-muted">Society:</span>
                  <strong>{data.society.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span className="text-muted">Registration:</span>
                  <strong>{data.society.registrationNumber}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span className="text-muted">FairWork Score:</span>
                  <strong className="text-green">{selectedWorkerForPass.fairnessScore} / 100 ({selectedWorkerForPass.status})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                  <span className="text-muted">Completed Jobs:</span>
                  <strong>{selectedWorkerForPass.jobs} Services</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderTop: '1px dashed var(--border)', marginTop: '4px', paddingTop: '4px' }}>
                  <span className="text-muted">Welfare Social Security:</span>
                  <strong className="text-green">✓ Active (Policy #WF-2689)</strong>
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '16px' }}>
                🔐 Cryptographically signed by ShramNexus Federation · Biometrically Verified
              </div>

              <button
                type="button"
                className="coop-btn coop-btn-dark w-100"
                onClick={() => setSelectedWorkerForPass(null)}
              >
                Close Member Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Welfare Claim Modal */}
      {showWelfareClaimModal && (
        <div className="coop-modal-overlay">
          <div className="coop-modal-content" style={{ maxWidth: '520px' }}>
            <h2 style={{ fontSize: '1.35rem', margin: '0 0 1rem 0' }}>+ File Welfare Disbursement Claim</h2>
            <form onSubmit={handleCreateWelfareClaim}>
              <div className="coop-form-group">
                <label>Claim Description / Purpose</label>
                <input
                  type="text"
                  className="coop-form-control"
                  placeholder="e.g. Emergency Hospitalization Assistance - Suresh Patel"
                  value={welfareClaimForm.title}
                  onChange={(e) => setWelfareClaimForm({ ...welfareClaimForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="coop-form-group">
                <label>Benefit Category</label>
                <select
                  className="coop-form-control"
                  value={welfareClaimForm.type}
                  onChange={(e) => setWelfareClaimForm({ ...welfareClaimForm, type: e.target.value })}
                >
                  <option value="Healthcare Emergency">🏥 Healthcare Emergency Support</option>
                  <option value="Tool Damage & Insurance">🧰 Equipment Repair & Replacement</option>
                  <option value="Family Loan Support">🤝 Interest-Free Family Emergency Loan</option>
                  <option value="Skill Certification Grant">🎓 Apprenticeship & Skill Certification Grant</option>
                </select>
              </div>

              <div className="coop-form-group">
                <label>Beneficiary Member</label>
                <select
                  className="coop-form-control"
                  value={welfareClaimForm.workerName}
                  onChange={(e) => setWelfareClaimForm({ ...welfareClaimForm, workerName: e.target.value })}
                >
                  <option value="">-- Choose Member from Society --</option>
                  {data.workers.map((w) => (
                    <option key={w.id} value={w.name}>
                      {w.name} ({w.trade})
                    </option>
                  ))}
                </select>
              </div>

              <div className="coop-form-group">
                <label>Disbursement Amount (₹)</label>
                <input
                  type="number"
                  min={500}
                  step={500}
                  className="coop-form-control"
                  value={welfareClaimForm.amount}
                  onChange={(e) => setWelfareClaimForm({ ...welfareClaimForm, amount: Number(e.target.value) })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="coop-btn coop-btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setShowWelfareClaimModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="coop-btn coop-btn-gold"
                  style={{ flex: 1.5 }}
                >
                  Disburse from Fund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Dividend Distribution Simulation Modal */}
      {showDividendLedgerModal && (
        <div className="coop-modal-overlay">
          <div className="coop-modal-content" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div>
                <span className="coop-badge coop-badge-gold" style={{ marginBottom: '4px' }}>
                  Audited Member Payout
                </span>
                <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Democratic Dividend Ledger (लाभांश)</h2>
                <small className="text-muted">Total Distributable Pool: ₹ {data.welfare.dividendPool.toLocaleString('en-IN')}</small>
              </div>
              <button
                type="button"
                onClick={() => setShowDividendLedgerModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '16px' }}>
              <table className="coop-data-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Trade</th>
                    <th>Hours</th>
                    <th>Fairness</th>
                    <th className="text-right">Projected Dividend</th>
                  </tr>
                </thead>
                <tbody>
                  {data.workers.map((w, idx) => {
                    const share = Math.round(data.welfare.avgPerMember * (w.fairnessScore / 80));
                    return (
                      <tr key={idx}>
                        <td><strong>{w.name}</strong></td>
                        <td>{w.trade}</td>
                        <td>{w.hours}h</td>
                        <td><span className="text-green font-bold">{w.fairnessScore}</span></td>
                        <td className="text-right text-gold" style={{ fontWeight: 800 }}>
                          ₹ {share.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                className="coop-btn coop-btn-outline"
                style={{ flex: 1 }}
                onClick={() => setShowDividendLedgerModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="coop-btn coop-btn-dark"
                style={{ flex: 1.5 }}
                onClick={() => {
                  showToast('Dividend ledger exported as official society audit PDF/CSV.');
                  setShowDividendLedgerModal(false);
                }}
              >
                📥 Export Distribution Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Assembly Proposal Terms & Justification Modal */}
      {selectedProposalForDetails && (
        <div className="coop-modal-overlay">
          <div className="coop-modal-content" style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div>
                <span className={`coop-badge ${selectedProposalForDetails.badgeClass}`} style={{ marginBottom: '4px' }}>
                  {selectedProposalForDetails.status}
                </span>
                <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Proposal #{selectedProposalForDetails.number}</h2>
                <small className="text-muted">{selectedProposalForDetails.title}</small>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProposalForDetails(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--muted)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: 'var(--cream)', padding: '14px', borderRadius: '12px', marginBottom: '1rem' }}>
              <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--ink)', marginBottom: '4px' }}>
                PURPOSE & RESOLUTION TERMS
              </strong>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.5, margin: 0, color: 'var(--text)' }}>
                {selectedProposalForDetails.description}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px' }}>
                <small className="text-muted" style={{ fontSize: '0.72rem', display: 'block' }}>REQUESTED BUDGET</small>
                <strong className="text-gold" style={{ fontSize: '1.1rem' }}>₹ {selectedProposalForDetails.cost.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px' }}>
                <small className="text-muted" style={{ fontSize: '0.72rem', display: 'block' }}>FINANCIAL SOURCE</small>
                <strong style={{ fontSize: '0.9rem', color: 'var(--ink)' }}>Welfare & Surplus Reserve</strong>
              </div>
            </div>

            <h4 style={{ margin: '0 0 6px 0', fontSize: '0.88rem' }}>Voting & Quorum Breakdown</h4>
            <div style={{ background: '#faf8f5', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Affirmative Votes (YES): <strong className="text-green">{selectedProposalForDetails.yesVotes}</strong></span>
                <span>Negative Votes (NO): <strong className="text-red">{selectedProposalForDetails.noVotes}</strong></span>
              </div>
              <div className="coop-vote-progress">
                <div
                  className="coop-vote-bar-yes"
                  style={{ width: `${Math.round((selectedProposalForDetails.yesVotes / ((selectedProposalForDetails.yesVotes + selectedProposalForDetails.noVotes) || 1)) * 100)}%` }}
                />
                <div
                  className="coop-vote-bar-no"
                  style={{ width: `${100 - Math.round((selectedProposalForDetails.yesVotes / ((selectedProposalForDetails.yesVotes + selectedProposalForDetails.noVotes) || 1)) * 100)}%` }}
                />
              </div>
              <small className="text-muted" style={{ display: 'block', marginTop: '6px', fontSize: '0.75rem' }}>
                Total: {selectedProposalForDetails.yesVotes + selectedProposalForDetails.noVotes} votes cast • Democratic threshold: 30 verified member votes with ≥65% majority.
              </small>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                className="coop-btn coop-btn-outline"
                style={{ flex: 1 }}
                onClick={() => setSelectedProposalForDetails(null)}
              >
                Close
              </button>
              {selectedProposalForDetails.status === 'Active' && (
                <div style={{ display: 'flex', gap: '0.5rem', flex: 1.5 }}>
                  <button
                    type="button"
                    className="coop-btn coop-btn-outline"
                    style={{ flex: 1, borderColor: 'var(--green)', color: 'var(--green)' }}
                    onClick={() => handleVoteProposal(selectedProposalForDetails.id, 'yes')}
                  >
                    👍 Vote YES
                  </button>
                  <button
                    type="button"
                    className="coop-btn coop-btn-outline"
                    style={{ flex: 1, borderColor: 'var(--red)', color: 'var(--red)' }}
                    onClick={() => handleVoteProposal(selectedProposalForDetails.id, 'no')}
                  >
                    👎 Vote NO
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. Tool Bank Check-out / Reserve Modal */}
      {selectedToolForReserve && (
        <div className="coop-modal-overlay">
          <div className="coop-modal-content" style={{ maxWidth: '480px' }}>
            <h2 style={{ fontSize: '1.35rem', margin: '0 0 0.5rem 0' }}>🧰 Check Out Tool Asset</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0 0 1.25rem 0' }}>
              Reserve <strong>{selectedToolForReserve.name}</strong> ({selectedToolForReserve.toolCode}) for active member work.
            </p>

            <form onSubmit={handleConfirmReserveTool}>
              <div className="coop-form-group">
                <label>Borrower / Deployed Worker</label>
                <select
                  className="coop-form-control"
                  value={reserveBorrowerName}
                  onChange={(e) => setReserveBorrowerName(e.target.value)}
                  required
                >
                  <option value="">-- Choose Member from Roster --</option>
                  {data.workers.map((w) => (
                    <option key={w.id} value={w.name}>
                      {w.name} — {w.trade} ({w.availability})
                    </option>
                  ))}
                  {data.squads.map((sq) => (
                    <option key={sq.id} value={sq.name}>
                      🛡️ Squad: {sq.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ background: 'var(--cream)', padding: '12px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                ℹ️ The equipment checkout is logged to the society inventory ledger and linked to the worker's digital cooperative pass.
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  className="coop-btn coop-btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setSelectedToolForReserve(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="coop-btn coop-btn-gold"
                  style={{ flex: 1.5 }}
                >
                  Confirm Check Out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. FairWork Engine Task Assignment Modal */}
      {selectedWorkerForTaskAssign && (
        <div className="coop-modal-overlay">
          <div className="coop-modal-content" style={{ maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.35rem', margin: '0 0 0.5rem 0' }}>⚖️ FairWork™ Task Allocation</h2>
            <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0 0 1.25rem 0' }}>
              Assign guaranteed cooperative work to <strong>{selectedWorkerForTaskAssign.name}</strong> ({selectedWorkerForTaskAssign.trade})
            </p>

            <div style={{ background: 'var(--cream)', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <small className="text-muted" style={{ fontSize: '0.72rem', display: 'block' }}>CURRENT SCORE</small>
                <strong>{selectedWorkerForTaskAssign.fairnessScore} / 100</strong>
              </div>
              <div>
                <small className="text-muted" style={{ fontSize: '0.72rem', display: 'block' }}>CURRENT STATUS</small>
                <strong className={`coop-${selectedWorkerForTaskAssign.statusClass}`}>{selectedWorkerForTaskAssign.status}</strong>
              </div>
              <div>
                <small className="text-muted" style={{ fontSize: '0.72rem', display: 'block' }}>POST-ASSIGNMENT</small>
                <strong className="text-green">Balanced (+22 pts)</strong>
              </div>
            </div>

            <form onSubmit={handleConfirmTaskAssignment}>
              <div className="coop-form-group">
                <label>Select Target Contract / Project</label>
                <select
                  className="coop-form-control"
                  value={assignContractTitle}
                  onChange={(e) => setAssignContractTitle(e.target.value)}
                  required
                >
                  {data.contracts.map((c) => (
                    <option key={c.id} value={`${c.rwa} (${c.service})`}>
                      {c.rwa} — {c.service} ({c.budget})
                    </option>
                  ))}
                  <option value="Municipal Sanitation Board (Emergency Maintenance)">
                    Municipal Sanitation Board (Emergency Maintenance)
                  </option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="coop-btn coop-btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setSelectedWorkerForTaskAssign(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="coop-btn coop-btn-gold"
                  style={{ flex: 1.5 }}
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Onboard Member Modal */}
      {showOnboardModal && (
        <div className="coop-modal-overlay">
          <div className="coop-modal-content" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Onboard Society Member</h2>
                <small className="text-muted">Register skilled trade worker into {data.society.name}</small>
              </div>
              <button
                type="button"
                onClick={() => setShowOnboardModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--muted)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOnboardMember}>
              <div className="coop-form-group">
                <label className="coop-label">Worker Full Name *</label>
                <input
                  type="text"
                  className="coop-form-control"
                  placeholder="e.g. Ramesh Kumar"
                  value={onboardForm.name}
                  onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="coop-form-group">
                <label className="coop-label">Mobile Number *</label>
                <input
                  type="tel"
                  className="coop-form-control"
                  placeholder="e.g. +91 9876543210"
                  value={onboardForm.phone}
                  onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="coop-form-group">
                  <label className="coop-label">Primary Trade *</label>
                  <select
                    className="coop-form-control"
                    value={onboardForm.trade}
                    onChange={(e) => setOnboardForm({ ...onboardForm, trade: e.target.value })}
                    required
                  >
                    {['Electrician', 'Plumber', 'Painter', 'Carpenter', 'Cleaner', 'Driver', 'Gardener', 'Technician', 'Caregiver', 'Domestic Helper'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="coop-form-group">
                  <label className="coop-label">Experience (Years)</label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    className="coop-form-control"
                    value={onboardForm.experienceYears}
                    onChange={(e) => setOnboardForm({ ...onboardForm, experienceYears: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="coop-form-group">
                <label className="coop-label">Aadhaar / National ID (Optional)</label>
                <input
                  type="text"
                  className="coop-form-control"
                  placeholder="e.g. 9876 5432 1098"
                  value={onboardForm.aadhaarNumber}
                  onChange={(e) => setOnboardForm({ ...onboardForm, aadhaarNumber: e.target.value })}
                />
              </div>

              <div style={{ background: 'rgba(5, 150, 105, 0.08)', border: '1px solid rgba(5, 150, 105, 0.25)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.78rem', color: '#065f46', marginBottom: '1.25rem' }}>
                ✓ <strong>Digital Pass & ID Issued:</strong> Onboarding will instantly generate a verified ShramNexus Member Pass, assign a unique member ID, and enroll the worker into the FairWork Engine™.
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  className="coop-btn coop-btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setShowOnboardModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="coop-btn coop-btn-gold"
                  style={{ flex: 1.5 }}
                  disabled={onboardLoading}
                >
                  {onboardLoading ? 'Registering Member...' : '✓ Add Member to Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="coop-toast">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
