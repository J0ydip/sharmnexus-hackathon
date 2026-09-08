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

  // Modals state
  const [showContractModal, setShowContractModal] = useState(false);
  const [showSquadModal, setShowSquadModal] = useState(false);
  const [showToolModal, setShowToolModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);

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

  // Switch Society
  const handleSocietyChange = (societyId: string) => {
    const matched = data.availableSocieties.find((s) => s.id === societyId);
    if (matched) {
      setData((prev) => ({
        ...prev,
        society: {
          ...prev.society,
          id: matched.id,
          name: matched.name,
          registrationNumber: matched.reg,
        },
      }));
      showToast(`Switched active cooperative society to ${matched.name}`);
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
      await createCommunityContractAction(newContract);
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
      await createSquadAction(newSquad);
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
      await addToolAssetAction(newTool);
    } catch (err) {}
    setData((prev) => ({
      ...prev,
      tools: [newTool, ...prev.tools],
    }));
    setShowToolModal(false);
    setToolForm({ name: '', toolCode: '' });
    showToast(`Added ${newTool.name} to Tool Bank!`);
  };

  // Tool Reservation Toggle
  const handleToggleTool = async (tool: CooperativeToolItem) => {
    const isNowAvailable = tool.status === 'In Use';
    const nextStatus: 'Available' | 'In Use' = isNowAvailable ? 'Available' : 'In Use';
    const nextClass = isNowAvailable ? 'status-green' : 'status-gold';
    const borrower = isNowAvailable ? undefined : 'Current Worker';

    try {
      await toggleToolReservationAction(tool.id, borrower);
    } catch (err) {}

    setData((prev) => ({
      ...prev,
      tools: prev.tools.map((t) =>
        t.id === tool.id
          ? { ...t, status: nextStatus, statusClass: nextClass, currentBorrower: borrower }
          : t
      ),
    }));
    showToast(isNowAvailable ? `Tool ${tool.name} returned to deposit bank.` : `Tool ${tool.name} checked out.`);
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
      badgeClass: 'badge-gold',
    };
    try {
      await createAssemblyProposalAction(newProp);
    } catch (err) {}
    setData((prev) => ({
      ...prev,
      proposals: [newProp, ...prev.proposals],
    }));
    setShowProposalModal(false);
    setProposalForm({ title: '', description: '', cost: 25000 });
    showToast('Democratic proposal posted to Member Assembly!');
  };

  // Vote on Proposal
  const handleVoteProposal = async (proposalId: string, vote: 'yes' | 'no') => {
    try {
      await voteAssemblyProposalAction(proposalId, vote);
    } catch (err) {}

    setData((prev) => ({
      ...prev,
      proposals: prev.proposals.map((p) => {
        if (p.id === proposalId) {
          return {
            ...p,
            yesVotes: vote === 'yes' ? p.yesVotes + 1 : p.yesVotes,
            noVotes: vote === 'no' ? p.noVotes + 1 : p.noVotes,
          };
        }
        return p;
      }),
    }));
    showToast(`Your vote (${vote.toUpperCase()}) was recorded!`);
  };

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
            <div>
              <select
                className="coop-society-select"
                value={data.society.id}
                onChange={(e) => handleSocietyChange(e.target.value)}
                title="Switch Society Demo"
              >
                {data.availableSocieties.map((s) => (
                  <option key={s.id} value={s.id} style={{ background: '#24172f', color: '#fff' }}>
                    Switch: {s.name}
                  </option>
                ))}
              </select>
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
          </div>
        </header>

        <div className="coop-view-container">
          {/* =========================================================
              1. DASHBOARD VIEW
             ========================================================= */}
          {activeTab === 'view-dashboard' && (
            <div>
              <div className="coop-kpi-grid">
                <div className="coop-kpi-card">
                  <span className="coop-kpi-label">Worker Members</span>
                  <strong className="coop-kpi-value">{data.society.memberCount}</strong>
                </div>
                <div className="coop-kpi-card">
                  <span className="coop-kpi-label">Active Members</span>
                  <strong className="coop-kpi-value text-green">{data.society.activeMembers}</strong>
                </div>
                <div className="coop-kpi-card">
                  <span className="coop-kpi-label">Jobs This Month</span>
                  <strong className="coop-kpi-value">{data.society.jobsThisMonth}</strong>
                </div>
                <div className="coop-kpi-card">
                  <span className="coop-kpi-label">Community Contracts</span>
                  <strong className="coop-kpi-value text-violet">{data.society.contractsCount}</strong>
                </div>
                <div className="coop-kpi-card">
                  <span className="coop-kpi-label">Cooperative Revenue (10%)</span>
                  <strong className="coop-kpi-value text-gold">₹ {(data.society.revenue / 100000).toFixed(1)}L</strong>
                </div>
                <div className="coop-kpi-card">
                  <span className="coop-kpi-label">Welfare Fund Pool</span>
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
              <div className="coop-card" style={{ borderColor: 'var(--gold)' }}>
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
                  <h3>Active Society Roster ({data.workers.length})</h3>
                  <button
                    type="button"
                    className="coop-btn coop-btn-dark coop-btn-sm"
                    onClick={() => showToast('Roster exported as CSV for district registrar')}
                  >
                    📥 Export Registry
                  </button>
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
                      {data.workers.map((w) => (
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
                              onClick={() => showToast(`Viewing digital cooperative pass for ${w.name}`)}
                            >
                              Profile
                            </button>
                          </td>
                        </tr>
                      ))}
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
                  <strong className="coop-kpi-value text-green">142</strong>
                </div>
                <div className="coop-kpi-card">
                  <span className="coop-kpi-label">Under-utilized</span>
                  <strong className="coop-kpi-value text-gold">38</strong>
                </div>
                <div className="coop-kpi-card">
                  <span className="coop-kpi-label">Overloaded</span>
                  <strong className="coop-kpi-value text-red">12</strong>
                </div>
                <div className="coop-kpi-card">
                  <span className="coop-kpi-label">Avg Fairness Score</span>
                  <strong className="coop-kpi-value">84 / 100</strong>
                </div>
              </div>

              {/* Recommendation Panel */}
              <div className="coop-recommendation-panel">
                <div className="coop-recommendation-icon">💡</div>
                <div className="coop-recommendation-text">
                  <h3>Fair Allocation Recommendation</h3>
                  <p>
                    Assign the upcoming <strong>"Green Valley Painting Contract"</strong> to <strong>Aman Sharma</strong>.
                    He currently has a lower workload (Fairness Score: 58) compared to overloaded members.
                  </p>
                </div>
                <div className="coop-recommendation-actions">
                  <button
                    type="button"
                    className="coop-btn coop-btn-gold"
                    onClick={() => handleAssignFairWork('Aman Sharma', 'Green Valley Painting Contract')}
                  >
                    Assign Work Now
                  </button>
                </div>
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
                      {data.workers.map((w) => (
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
                              onClick={() => handleAssignFairWork(w.name, 'Community Task')}
                            >
                              Assign Task
                            </button>
                          </td>
                        </tr>
                      ))}
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
              <div className="justify-between" style={{ marginBottom: '1.5rem' }}>
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

              <div className="coop-cards-grid">
                {data.contracts.map((c) => (
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
                        onClick={() => showToast(`Viewing contract terms and disbursements for ${c.rwa}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================
              5. SQUADS VIEW
             ========================================================= */}
          {activeTab === 'view-squads' && (
            <div>
              <div className="justify-between" style={{ marginBottom: '1.5rem' }}>
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

              <div className="coop-cards-grid">
                {data.squads.map((s) => (
                  <div key={s.id} className="coop-obj-card">
                    <div className="coop-obj-head">
                      <h3>{s.name}</h3>
                      <span className="coop-badge coop-badge-verified">{s.status}</span>
                    </div>
                    <p className="text-muted" style={{ fontSize: '0.88rem', margin: '0 0 0.5rem 0' }}>
                      Assigned: <strong>{s.assignedContract}</strong>
                    </p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text)', background: 'var(--cream)', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
                      👥 {s.membersSummary}
                    </p>
                    <div className="coop-obj-actions">
                      <button
                        type="button"
                        className="coop-btn coop-btn-dark w-100"
                        onClick={() => showToast(`Managing members of ${s.name}`)}
                      >
                        Manage Members
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================
              6. TOOL BANK VIEW
             ========================================================= */}
          {activeTab === 'view-tools' && (
            <div>
              <div className="justify-between" style={{ marginBottom: '1.5rem' }}>
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

              <div className="coop-cards-grid">
                {data.tools.map((t) => (
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
                          (Held by: {t.currentBorrower})
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className={`coop-btn ${t.status === 'Available' ? 'coop-btn-gold' : 'coop-btn-outline'} w-100`}
                      style={{ marginTop: '1.25rem' }}
                      onClick={() => handleToggleTool(t)}
                    >
                      {t.status === 'Available' ? 'Reserve Tool' : 'Mark as Returned'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================
              7. PAYMENTS & DISTRIBUTION VIEW
             ========================================================= */}
          {activeTab === 'view-payments' && (
            <div>
              <div className="coop-card text-center" style={{ padding: '2.5rem 2rem' }}>
                <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.5rem 0' }}>
                  Transparent Cooperative Revenue Split
                </h2>
                <span className="coop-badge coop-badge-outline" style={{ marginBottom: '1.5rem' }}>
                  Statutory 85 / 10 / 5 Fair Distribution Model
                </span>

                <div style={{ maxWidth: '480px', margin: '1.5rem auto' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                    Simulate Service / Contract Value: ₹ {calcAmount.toLocaleString('en-IN')}
                  </label>
                  <input
                    type="range"
                    min={1000}
                    max={100000}
                    step={1000}
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--gold)' }}
                  />
                </div>

                <div className="coop-distribution-visual">
                  <div className="coop-dist-block coop-worker-share">
                    <h2>85%</h2>
                    <strong>Worker Members</strong>
                    <span>₹ {Math.round(calcAmount * 0.85).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="coop-dist-block coop-coop-share">
                    <h2>10%</h2>
                    <strong>Cooperative Society</strong>
                    <span>₹ {Math.round(calcAmount * 0.10).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="coop-dist-block coop-welfare-share">
                    <h2>5%</h2>
                    <strong>Welfare Fund</strong>
                    <span>₹ {Math.round(calcAmount * 0.05).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <p className="text-muted" style={{ fontSize: '0.85rem', maxWidth: '600px', margin: '1.5rem auto 0 auto' }}>
                  Unlike gig aggregators that take 25–35% corporate commission, ShramNexus returns 85% directly to worker wages, retains 10% for local cooperative society operations, and reserves 5% in the member welfare corpus.
                </p>
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
                      onClick={() => showToast('Disbursement request logged')}
                    >
                      + File Claim
                    </button>
                  </div>
                  <table className="coop-data-table">
                    <tbody>
                      {data.welfare.claims.map((cl, i) => (
                        <tr key={i}>
                          <td><strong>{cl.title}</strong></td>
                          <td className="text-right text-red" style={{ fontWeight: 700 }}>
                            -₹ {cl.amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
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
                    onClick={() => showToast('Simulating dividend distribution ledger for members')}
                  >
                    Review Member Payout Audit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              9. MEMBER ASSEMBLY VIEW
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

              <div className="coop-cards-grid">
                {data.proposals.map((prop) => (
                  <div key={prop.id} className="coop-obj-card">
                    <div className="coop-obj-head">
                      <h3>{prop.title}</h3>
                      <span className={`coop-badge ${prop.badgeClass}`}>{prop.status}</span>
                    </div>
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                      Proposal #{prop.number} • Budget: ₹ {prop.cost.toLocaleString('en-IN')}
                    </p>
                    <p style={{ fontSize: '0.88rem', lineHeight: 1.45, color: 'var(--text)', margin: '0.5rem 0' }}>
                      {prop.description}
                    </p>

                    <div style={{ background: 'var(--cream)', padding: '0.85rem 1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-around', textAlign: 'center', margin: '1rem 0' }}>
                      <div>
                        <strong className="text-green" style={{ fontSize: '1.4rem' }}>{prop.yesVotes}</strong>
                        <br />
                        <small style={{ fontWeight: 700, color: 'var(--green)' }}>YES</small>
                      </div>
                      <div style={{ width: '1px', background: 'var(--border)' }}></div>
                      <div>
                        <strong className="text-red" style={{ fontSize: '1.4rem' }}>{prop.noVotes}</strong>
                        <br />
                        <small style={{ fontWeight: 700, color: 'var(--red)' }}>NO</small>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
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
                  </div>
                ))}
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

      {/* Toast */}
      {toastMsg && (
        <div className="coop-toast">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
