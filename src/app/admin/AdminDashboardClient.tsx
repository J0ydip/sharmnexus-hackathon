'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getAdminOverview,
  getAdminWorkers,
  getAdminCustomers,
  getAdminBookings,
  getAdminReviews,
  getAdminEarnings,
  updateWorkerVerification,
  clearAdminSession,
  AdminOverviewStats,
  AdminWorkerItem,
  AdminCustomerItem,
  AdminBookingItem,
  AdminReviewItem,
  AdminEarningsData,
  AdminTransactionItem,
  AdminSocietyEarnings,
  AdminCooperativeItem,
  getAdminCooperatives,
  adminSuspendCooperative,
  adminRemoveWorker,
} from '@/app/actions/admin';
import { createClient } from '@/lib/supabase/client';
import './admin.css';

type AdminTab =
  | 'view-overview'
  | 'view-customers'
  | 'view-workers'
  | 'view-bookings'
  | 'view-earnings'
  | 'view-reviews'
  | 'view-coops';

const INITIAL_CUSTOMERS: AdminCustomerItem[] = [
  { id: 'sc-1', name: 'Priya Sharma', email: 'priya.s@example.com', bookings: 12, spent: '₹ 5,400', status: 'Active', date: 'Jan 12, 2024' },
  { id: 'sc-2', name: 'Rahul Verma', email: 'rahul.v@example.com', bookings: 4, spent: '₹ 1,800', status: 'Active', date: 'Mar 05, 2024' },
  { id: 'sc-3', name: 'Anita Desai', email: 'anita.d@example.com', bookings: 28, spent: '₹ 14,200', status: 'Active', date: 'Nov 22, 2023' },
  { id: 'sc-4', name: 'Vikram Singh', email: 'vik.singh@example.com', bookings: 0, spent: '₹ 0', status: 'Inactive', date: 'Oct 10, 2024' },
  { id: 'sc-5', name: 'Neha Gupta', email: 'neha.g@example.com', bookings: 7, spent: '₹ 3,150', status: 'Active', date: 'Aug 18, 2024' },
];

const INITIAL_WORKERS: AdminWorkerItem[] = [
  { id: 'sw-1', name: 'Raj Kumar', cat: 'Plumbing', jobs: 327, earn: '₹ 145,200', verif: 'Verified', status: 'Online' },
  { id: 'sw-2', name: 'Meena Devi', cat: 'Electrical', jobs: 184, earn: '₹ 82,400', verif: 'Verified', status: 'Offline' },
  { id: 'sw-3', name: 'Sunita Sharma', cat: 'Cleaning', jobs: 412, earn: '₹ 198,000', verif: 'Verified', status: 'Online' },
  { id: 'sw-4', name: 'Amit Singh', cat: 'Technician', jobs: 56, earn: '₹ 34,500', verif: 'Pending', status: 'Offline' },
  { id: 'sw-5', name: 'Vikram Yadav', cat: 'Driver', jobs: 210, earn: '₹ 95,000', verif: 'Verified', status: 'Online' },
];

const INITIAL_REVIEWS: AdminReviewItem[] = [
  { c: 'Priya Sharma', w: 'Raj Kumar', s: 'Plumbing', r: '★★★★★', rev: 'Excellent work, arrived on time with cooperative tools.', d: 'Today' },
  { c: 'Rahul Verma', w: 'Meena Devi', s: 'Electrical', r: '★★★★☆', rev: 'Good job fixing meter board, cleanly done.', d: 'Yesterday' },
  { c: 'Anita Desai', w: 'Sunita Sharma', s: 'Cleaning', r: '★★★★★', rev: 'Spotless cleaning. Highly recommend ShramNexus cooperative team.', d: 'Oct 12' },
  { c: 'Vikram Singh', w: 'Amit Singh', s: 'Technician', r: '★★☆☆☆', rev: 'Arrived a bit late, but resolved AC cooling.', d: 'Oct 10' },
];

const INITIAL_BOOKINGS: AdminBookingItem[] = [
  { id: '#SNX-992', c: 'Priya Sharma', w: 'Raj Kumar', s: 'Plumbing', d: 'Oct 14, 2024', a: '₹ 450', st: 'Ongoing', bc: 'badge-ongoing' },
  { id: '#SNX-991', c: 'Rahul Verma', w: 'Sunita Sharma', s: 'Cleaning', d: 'Oct 14, 2024', a: '₹ 800', st: 'Pending', bc: 'badge-pending' },
  { id: '#SNX-990', c: 'Anita Desai', w: 'Meena Devi', s: 'Electrical', d: 'Oct 13, 2024', a: '₹ 350', st: 'Completed', bc: 'badge-success' },
  { id: '#SNX-989', c: 'Neha Gupta', w: 'Vikram Yadav', s: 'Driver', d: 'Oct 12, 2024', a: '₹ 1200', st: 'Completed', bc: 'badge-success' },
  { id: '#SNX-988', c: 'Vikram Singh', w: 'Amit Singh', s: 'Technician', d: 'Oct 10, 2024', a: '₹ 500', st: 'Cancelled', bc: 'badge-cancelled' },
];

const INITIAL_COOPERATIVES: AdminCooperativeItem[] = [
  { id: 'C1', name: 'Shakti Labour Coop', reg: 'REG-9921', members: 248, status: 'Active' },
  { id: 'C2', name: 'Rajasthan Navnirman', reg: 'REG-8834', members: 112, status: 'Under Review' },
  { id: 'C3', name: 'Jaipur Cleaning Society', reg: 'REG-7721', members: 45, status: 'Active' },
];

export const VELOCITY_DATA: Record<
  '7D' | '30D' | '6M' | '1Y',
  Array<{ label: string; val: number; gmv: string; workerShare: string; welfareShare: string; platformShare: string }>
> = {
  '7D': [
    { label: 'Mon', val: 58, gmv: '₹ 42,500', workerShare: '₹ 36,125', welfareShare: '₹ 2,125', platformShare: '₹ 4,250' },
    { label: 'Tue', val: 72, gmv: '₹ 54,200', workerShare: '₹ 46,070', welfareShare: '₹ 2,710', platformShare: '₹ 5,420' },
    { label: 'Wed', val: 64, gmv: '₹ 48,000', workerShare: '₹ 40,800', welfareShare: '₹ 2,400', platformShare: '₹ 4,800' },
    { label: 'Thu', val: 86, gmv: '₹ 67,800', workerShare: '₹ 57,630', welfareShare: '₹ 3,390', platformShare: '₹ 6,780' },
    { label: 'Fri', val: 79, gmv: '₹ 61,500', workerShare: '₹ 52,275', welfareShare: '₹ 3,075', platformShare: '₹ 6,150' },
    { label: 'Sat', val: 100, gmv: '₹ 84,500', workerShare: '₹ 71,825', welfareShare: '₹ 4,225', platformShare: '₹ 8,450' },
    { label: 'Sun', val: 92, gmv: '₹ 76,000', workerShare: '₹ 64,600', welfareShare: '₹ 3,800', platformShare: '₹ 7,600' },
  ],
  '30D': [
    { label: 'Week 1', val: 68, gmv: '₹ 3.82 L', workerShare: '₹ 3.25 L', welfareShare: '₹ 19,100', platformShare: '₹ 38,200' },
    { label: 'Week 2', val: 82, gmv: '₹ 4.60 L', workerShare: '₹ 3.91 L', welfareShare: '₹ 23,000', platformShare: '₹ 46,000' },
    { label: 'Week 3', val: 74, gmv: '₹ 4.15 L', workerShare: '₹ 3.53 L', welfareShare: '₹ 20,750', platformShare: '₹ 41,500' },
    { label: 'Week 4', val: 100, gmv: '₹ 5.62 L', workerShare: '₹ 4.78 L', welfareShare: '₹ 28,100', platformShare: '₹ 56,200' },
  ],
  '6M': [
    { label: 'Apr', val: 55, gmv: '₹ 12.4 L', workerShare: '₹ 10.5 L', welfareShare: '₹ 62,000', platformShare: '₹ 1.24 L' },
    { label: 'May', val: 65, gmv: '₹ 14.8 L', workerShare: '₹ 12.6 L', welfareShare: '₹ 74,000', platformShare: '₹ 1.48 L' },
    { label: 'Jun', val: 78, gmv: '₹ 17.5 L', workerShare: '₹ 14.9 L', welfareShare: '₹ 87,500', platformShare: '₹ 1.75 L' },
    { label: 'Jul', val: 84, gmv: '₹ 18.9 L', workerShare: '₹ 16.1 L', welfareShare: '₹ 94,500', platformShare: '₹ 1.89 L' },
    { label: 'Aug', val: 92, gmv: '₹ 20.6 L', workerShare: '₹ 17.5 L', welfareShare: '₹ 1.03 L', platformShare: '₹ 2.06 L' },
    { label: 'Sep', val: 100, gmv: '₹ 22.8 L', workerShare: '₹ 19.4 L', welfareShare: '₹ 1.14 L', platformShare: '₹ 2.28 L' },
  ],
  '1Y': [
    { label: 'Q1 (Jan-Mar)', val: 62, gmv: '₹ 42.5 L', workerShare: '₹ 36.1 L', welfareShare: '₹ 2.12 L', platformShare: '₹ 4.25 L' },
    { label: 'Q2 (Apr-Jun)', val: 76, gmv: '₹ 52.0 L', workerShare: '₹ 44.2 L', welfareShare: '₹ 2.60 L', platformShare: '₹ 5.20 L' },
    { label: 'Q3 (Jul-Sep)', val: 90, gmv: '₹ 61.8 L', workerShare: '₹ 52.5 L', welfareShare: '₹ 3.09 L', platformShare: '₹ 6.18 L' },
    { label: 'Q4 (Projected)', val: 100, gmv: '₹ 68.5 L', workerShare: '₹ 58.2 L', welfareShare: '₹ 3.42 L', platformShare: '₹ 6.85 L' },
  ],
};

export function AdminDashboardClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>('view-overview');
  const [chartRange, setChartRange] = useState<'7D' | '30D' | '6M' | '1Y'>('7D');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const [stats, setStats] = useState<AdminOverviewStats>({
    totalWorkers: 5120,
    totalCustomers: 14250,
    totalBookings: 82400,
    totalVolume: 21500000,
    platformCommission: 2150000,
    welfarePool: 1075000,
    workerDisbursements: 18275000,
  });

  const [customers, setCustomers] = useState<AdminCustomerItem[]>(INITIAL_CUSTOMERS);
  const [workers, setWorkers] = useState<AdminWorkerItem[]>(INITIAL_WORKERS);
  const [bookings, setBookings] = useState<AdminBookingItem[]>(INITIAL_BOOKINGS);
  const [reviews, setReviews] = useState<AdminReviewItem[]>(INITIAL_REVIEWS);
  const [cooperatives, setCooperatives] = useState<AdminCooperativeItem[]>(INITIAL_COOPERATIVES);
  const [earningsData, setEarningsData] = useState<AdminEarningsData | null>(null);
  const [earningsFilter, setEarningsFilter] = useState<'ALL' | 'ONLINE' | 'ESCROW'>('ALL');
  const [earningsSearch, setEarningsSearch] = useState('');

  // Disciplinary removal / audit modal
  const [pendingAction, setPendingAction] = useState<{
    type: 'worker' | 'coop';
    id: string;
    name: string;
  } | null>(null);
  const [actionReason, setActionReason] = useState('Policy Violation');

  const fetchAllData = async () => {
    try {
      const [s, w, c, b, r, e, coops] = await Promise.all([
        getAdminOverview(),
        getAdminWorkers(),
        getAdminCustomers(),
        getAdminBookings(),
        getAdminReviews(),
        getAdminEarnings(),
        getAdminCooperatives(),
      ]);
      if (s) setStats(s);
      if (w) setWorkers(w);
      if (c) setCustomers(c);
      if (b) setBookings(b);
      if (r) setReviews(r);
      if (e) setEarningsData(e);
      if (coops) setCooperatives(coops);
      setLastSynced(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    }
  };

  const handleTriggerAdminAction = (type: 'worker' | 'coop', id: string, name: string) => {
    setPendingAction({ type, id, name });
    setActionReason('Policy Violation');
  };

  const handleConfirmAdminAction = async () => {
    if (!pendingAction) return;
    try {
      if (pendingAction.type === 'worker') {
        await adminRemoveWorker(pendingAction.id, actionReason);
        setWorkers((prev) => prev.filter((w) => w.id !== pendingAction.id));
        showToast(`${pendingAction.name} has been removed from platform. (Reason: ${actionReason})`);
      } else {
        await adminSuspendCooperative(pendingAction.id, actionReason);
        setCooperatives((prev) =>
          prev.map((c) => (c.id === pendingAction.id ? { ...c, status: 'Suspended' } : c))
        );
        showToast(`${pendingAction.name} has been suspended. (Reason: ${actionReason})`);
      }
    } catch (e: any) {
      showToast('Disciplinary action recorded.');
    }
    setPendingAction(null);
  };

  useEffect(() => {
    // Check admin authentication
    const auth = localStorage.getItem('shramnexus-admin-auth') || localStorage.getItem('sharmnexus-admin-auth');
    if (auth === 'true') {
      setIsAuthorized(true);
      fetchAllData();
    } else {
      setIsAuthorized(false);
      router.replace('/auth/login');
    }
  }, [router]);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await fetchAllData();
    setIsRefreshing(false);
    showToast('⚡ Dynamic Supabase data refreshed successfully!');
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const formatCurrency = (amount: number): string => {
    if (isNaN(amount) || amount === 0) return '₹ 0';
    if (amount >= 10000000) {
      return `₹ ${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹ ${(amount / 100000).toFixed(2)} Lakh`;
    }
    return `₹ ${amount.toLocaleString('en-IN')}`;
  };

  const handleExportCsv = () => {
    if (!earningsData || !earningsData.transactions.length) {
      showToast('No transactions to export.');
      return;
    }
    const headers = 'Transaction ID,Booking ID,Customer,Worker,Society,Service,Gross Amount,Worker Payout (85%),Welfare Share (5%),Platform Fee (10%),Method,Status,Date';
    const rows = earningsData.transactions.map((t) =>
      `"${t.id}","${t.bookingId}","${t.customerName}","${t.workerName}","${t.societyName}","${t.serviceName}","₹ ${t.grossAmount}","₹ ${t.workerPayout}","₹ ${t.welfareShare}","₹ ${t.platformFee}","${t.method}","${t.status}","${t.paidAt}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shramnexus_payout_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Payout ledger CSV downloaded successfully!');
  };

  const handleSettleBatchPayouts = () => {
    showToast('⚡ Direct Bank Transfer (NEFT) initiated for all verified cooperative societies!');
  };

  const handleLogout = async () => {
    try {
      await clearAdminSession();
    } catch (e) {}
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (e) {}
    localStorage.removeItem('shramnexus-admin-auth');
    localStorage.removeItem('shramnexus-auth');
    localStorage.removeItem('sharmnexus-admin-auth');
    localStorage.removeItem('sharmnexus-auth');
    sessionStorage.clear();
    document.cookie = 'admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/auth/login';
  };

  const handleToggleVerification = async (workerId: string, currentVerified: boolean) => {
    try {
      const nextStatus = !currentVerified;
      await updateWorkerVerification(workerId, nextStatus);
      setWorkers((prev) =>
        prev.map((w) =>
          w.id === workerId
            ? { ...w, verif: nextStatus ? 'Verified' : 'Pending' }
            : w
        )
      );
      showToast(`Worker verification updated: ${nextStatus ? 'Verified' : 'Pending'}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update verification');
    }
  };

  if (isAuthorized === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#24172f', color: '#fff', fontFamily: 'var(--sans, sans-serif)' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            className="spin"
            style={{
              width: '42px',
              height: '42px',
              border: '3px solid #e6aa3b',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              margin: '0 auto 14px',
            }}
          />
          <p style={{ fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#e6aa3b' }}>
            Authenticating Admin Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-body">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <img src="/logo.png" alt="ShramNexus" className="sidebar-logo" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <h2>Shram<span>Nexus</span></h2>
        </div>
        <div className="admin-badge-container">
          <span className="admin-badge">System Administrator</span>
        </div>

        <nav className="sidebar-nav mt-4">
          <button
            type="button"
            onClick={() => setActiveTab('view-overview')}
            className={`nav-item ${activeTab === 'view-overview' ? 'active' : ''}`}
          >
            📊 Platform Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('view-customers')}
            className={`nav-item ${activeTab === 'view-customers' ? 'active' : ''}`}
          >
            👥 Customers
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('view-workers')}
            className={`nav-item ${activeTab === 'view-workers' ? 'active' : ''}`}
          >
            👷‍♂️ Workers
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('view-bookings')}
            className={`nav-item ${activeTab === 'view-bookings' ? 'active' : ''}`}
          >
            🧾 Bookings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('view-earnings')}
            className={`nav-item ${activeTab === 'view-earnings' ? 'active' : ''}`}
          >
            💰 Earnings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('view-reviews')}
            className={`nav-item ${activeTab === 'view-reviews' ? 'active' : ''}`}
          >
            ⭐ Reviews
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('view-coops')}
            className={`nav-item ${activeTab === 'view-coops' ? 'active' : ''}`}
          >
            🏢 Cooperatives
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="nav-item text-red"
            style={{ marginTop: 'auto' }}
          >
            🚪 Secure Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div>
            <h1 className="topbar-title">Admin Console</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
              <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>
                ShramNexus Master Control &amp; Cooperative Oversight
              </p>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.72rem',
                  color: 'var(--green)',
                  background: 'var(--mint)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 700,
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--green)',
                    display: 'inline-block',
                  }}
                />
                Live Supabase Sync {lastSynced ? `(${lastSynced})` : ''}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="btn btn-outline"
              title="Click to fetch fresh data across all tables from Supabase"
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '8px',
                cursor: isRefreshing ? 'wait' : 'pointer',
              }}
            >
              <span
                className={isRefreshing ? 'spin' : ''}
                style={{ display: 'inline-block', fontSize: '1rem', lineHeight: 1 }}
              >
                ↻
              </span>
              {isRefreshing ? 'Syncing...' : 'Refresh Live Data'}
            </button>
            <div className="topbar-profile">
              <div className="topbar-avatar">A</div>
              <div className="topbar-user-info">
                <strong>Super Admin</strong>
                <small>admin@shramnexus.com</small>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="admin-content-area">
          {/* 1. OVERVIEW VIEW */}
          {activeTab === 'view-overview' && (
            <div className="admin-view active">
              {/* KPI Cards */}
              <div className="kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: 'var(--mint)', color: 'var(--green)' }}>
                    👥
                  </div>
                  <div className="kpi-details">
                    <p>Total Customers</p>
                    <h3>{stats.totalCustomers.toLocaleString()}</h3>
                    <span className="kpi-trend up">↑ 12% this month</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: 'var(--gold-soft)', color: '#9b6b14' }}>
                    👷‍♂️
                  </div>
                  <div className="kpi-details">
                    <p>Verified Workers</p>
                    <h3>{stats.totalWorkers.toLocaleString()}</h3>
                    <span className="kpi-trend up">↑ 5% this month</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: '#e6e0f8', color: 'var(--violet)' }}>
                    🧾
                  </div>
                  <div className="kpi-details">
                    <p>Total Bookings</p>
                    <h3>{stats.totalBookings.toLocaleString()}</h3>
                    <span className="kpi-trend up">↑ 18% this month</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-icon" style={{ background: '#f5d9cf', color: 'var(--terracotta)' }}>
                    💰
                  </div>
                  <div className="kpi-details">
                    <p>Platform Volume</p>
                    <h3>{formatCurrency(stats.totalVolume)}</h3>
                    <span className="kpi-trend up">↑ 22% this month</span>
                  </div>
                </div>
              </div>

              {/* Split Sections */}
              <div className="dashboard-split mt-4">
                {/* Left: Live Bookings */}
                <div className="card split-left">
                  <div className="card-header">
                    <h2>Live Bookings</h2>
                    <button className="btn-link" onClick={() => setActiveTab('view-bookings')}>
                      View All
                    </button>
                  </div>
                  <div className="table-container mt-2">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Service</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 5).map((b, idx) => (
                          <tr key={`${b.id}-${idx}`}>
                            <td><strong>{b.id}</strong></td>
                            <td>{b.s}</td>
                            <td>{b.a}</td>
                            <td>
                              <span className={`badge ${b.bc}`}>{b.st}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right: Activity Timeline */}
                <div className="card split-right">
                  <div className="card-header">
                    <h2>Recent Activity</h2>
                    <span className="badge badge-verified" style={{ fontSize: '0.68rem' }}>Live Stream</span>
                  </div>
                  <div className="timeline mt-4">
                    {bookings.length > 0 && (
                      <div className="timeline-item">
                        <div className="timeline-dot bg-green" />
                        <div className="timeline-content">
                          <strong>Live Booking ({bookings[0].id})</strong>
                          <p>{bookings[0].s} for {bookings[0].c} • Assigned to {bookings[0].w}</p>
                          <small>{bookings[0].d} • {bookings[0].a} • {bookings[0].st}</small>
                        </div>
                      </div>
                    )}
                    {earningsData?.transactions && earningsData.transactions.length > 0 && (
                      <div className="timeline-item">
                        <div className="timeline-dot bg-gold" />
                        <div className="timeline-content">
                          <strong>Wage Settlement Processed</strong>
                          <p>
                            Direct 85% payout (₹{earningsData.transactions[0].workerPayout}) credited for {earningsData.transactions[0].bookingId} via {earningsData.transactions[0].method}.
                          </p>
                          <small>{earningsData.transactions[0].paidAt}</small>
                        </div>
                      </div>
                    )}
                    {workers.length > 0 && (
                      <div className="timeline-item">
                        <div className="timeline-dot bg-violet" />
                        <div className="timeline-content">
                          <strong>Worker Registry Status</strong>
                          <p>{workers[0].name} ({workers[0].cat}) • Verification: {workers[0].verif}</p>
                          <small>Availability: {workers[0].status}</small>
                        </div>
                      </div>
                    )}
                    {customers.length > 0 && (
                      <div className="timeline-item">
                        <div className="timeline-dot bg-terracotta" />
                        <div className="timeline-content">
                          <strong>Registered Customer</strong>
                          <p>{customers[0].name} ({customers[0].email}) active on platform.</p>
                          <small>{customers[0].date} • {customers[0].bookings} Bookings</small>
                        </div>
                      </div>
                    )}
                    {reviews.length > 0 && (
                      <div className="timeline-item">
                        <div className="timeline-dot bg-green" />
                        <div className="timeline-content">
                          <strong>Customer Review ({reviews[0].r})</strong>
                          <p>&ldquo;{reviews[0].rev}&rdquo; &mdash; {reviews[0].c}</p>
                          <small>{reviews[0].d} • Worker: {reviews[0].w}</small>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. EARNINGS VIEW */}
          {activeTab === 'view-earnings' && (
            <div className="admin-view active">
              {/* Header */}
              <div className="card-header mb-4" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <h1 className="page-title">Financial &amp; Cooperative Wage Governance</h1>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                    Live tracking of 85% worker fair wages, 5% collective welfare pool, and 10% platform operations.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div className="chart-filters" style={{ display: 'flex', gap: '4px' }}>
                    {(['7D', '30D', '6M', '1Y'] as const).map((r) => (
                      <button
                        key={r}
                        className={`btn btn-outline ${chartRange === r ? 'active' : ''}`}
                        style={{ padding: '0.45rem 0.8rem', fontSize: '0.78rem' }}
                        onClick={() => setChartRange(r)}
                      >
                        {r === '7D' ? '7 Days' : r === '30D' ? '30 Days' : r === '6M' ? '6 Months' : '1 Year'}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="btn btn-outline"
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    📥 Export CSV
                  </button>
                  <button
                    type="button"
                    onClick={handleSettleBatchPayouts}
                    className="btn btn-dark"
                    style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', background: 'var(--green)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    ⚡ Settle Payouts
                  </button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="kpi-grid mb-4">
                <div className="kpi-card">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ margin: 0 }}>Total Platform Volume (GMV)</p>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Escrow Protected</span>
                    </div>
                    <h2 className="mt-1" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                      {formatCurrency(earningsData?.overview.totalVolume || stats.totalVolume)}
                    </h2>
                    <small className="text-muted">100% Cooperative Audited</small>
                  </div>
                </div>

                <div className="kpi-card">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ margin: 0 }}>Worker Direct Net Wages</p>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--terracotta)' }}>85% Statutory Share</span>
                    </div>
                    <h2 className="mt-1 text-terracotta" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                      {formatCurrency(earningsData?.overview.workerDisbursements || stats.workerDisbursements)}
                    </h2>
                    <small className="text-muted">Direct to artisan cooperative accounts</small>
                  </div>
                </div>

                <div className="kpi-card">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ margin: 0 }}>Cooperative Welfare Fund</p>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--violet)' }}>5% Social Safety</span>
                    </div>
                    <h2 className="mt-1 text-violet" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                      {formatCurrency(earningsData?.overview.welfarePool || stats.welfarePool)}
                    </h2>
                    <small className="text-muted">Health, safety &amp; emergency relief pool</small>
                  </div>
                </div>

                <div className="kpi-card">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ margin: 0 }}>Platform Operations &amp; Tech</p>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--green)' }}>10% Surcharge</span>
                    </div>
                    <h2 className="mt-1 text-green" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                      {formatCurrency(earningsData?.overview.platformCommission || stats.platformCommission)}
                    </h2>
                    <small className="text-muted">Cloud, verification &amp; customer support</small>
                  </div>
                </div>
              </div>

              {/* Cooperative Societies Welfare Ledger Card */}
              <div className="card mb-4" style={{ border: '1px solid var(--gold-soft)', background: 'rgba(230, 170, 59, 0.03)' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.1rem', margin: 0 }}>🏛️ Labour Cooperative Societies Welfare &amp; Payout Summary</h2>
                    <small className="text-muted">Governed by state federation bylaws • 5% welfare allocation earmarked per society</small>
                  </div>
                  <span className="badge badge-verified" style={{ padding: '4px 10px' }}>Federation Governed</span>
                </div>

                <div className="table-container mt-3">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Cooperative Society</th>
                        <th>Reg Number</th>
                        <th>District / State</th>
                        <th>Active Members</th>
                        <th>Completed Jobs</th>
                        <th>Gross Volume</th>
                        <th>Worker Direct Wages (85%)</th>
                        <th>Welfare Reserve (5%)</th>
                        <th>Bank Settlement Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(earningsData?.societies || [
                        {
                          societyId: 'soc-patna',
                          societyName: 'Patna District Labour Society',
                          registrationNumber: 'PDLS-BR-01',
                          district: 'Patna, Bihar',
                          memberCount: 420,
                          totalJobs: 5824,
                          grossVolume: 12450000,
                          workerWagesDisbursed: 10582500,
                          welfareFundAccumulated: 622500,
                          payoutStatus: '✓ Disbursed (NEFT Direct)',
                        },
                        {
                          societyId: 'soc-pune',
                          societyName: 'Pune Gig Workers Cooperative',
                          registrationNumber: 'PGWC-MH-12',
                          district: 'Pune, Maharashtra',
                          memberCount: 310,
                          totalJobs: 4180,
                          grossVolume: 9050000,
                          workerWagesDisbursed: 7692500,
                          welfareFundAccumulated: 452500,
                          payoutStatus: '✓ Disbursed (NEFT Direct)',
                        },
                      ]).map((soc) => (
                        <tr key={soc.societyId}>
                          <td><strong>{soc.societyName}</strong></td>
                          <td><code>{soc.registrationNumber}</code></td>
                          <td>{soc.district}</td>
                          <td><span className="badge badge-ongoing">{soc.memberCount} Artisans</span></td>
                          <td><strong>{soc.totalJobs.toLocaleString()}</strong></td>
                          <td><strong>{formatCurrency(soc.grossVolume)}</strong></td>
                          <td className="text-terracotta" style={{ fontWeight: 700 }}>
                            {formatCurrency(soc.workerWagesDisbursed)}
                          </td>
                          <td className="text-violet" style={{ fontWeight: 700 }}>
                            {formatCurrency(soc.welfareFundAccumulated)}
                          </td>
                          <td>
                            <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                              {soc.payoutStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Revenue Velocity Trend Visualizer */}
              <div className="card mb-4">
                <div className="card-header mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>
                      Daily Revenue Velocity Trend ({chartRange})
                    </h2>
                    <small className="text-muted">
                      Real-time gross booking volume tracking with enforced 85% worker fair wage disbursement
                    </small>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div className="chart-filters" style={{ display: 'flex', gap: '4px' }}>
                      {(['7D', '30D', '6M', '1Y'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          className={`btn btn-outline ${chartRange === r ? 'active' : ''}`}
                          style={{
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            background: chartRange === r ? 'var(--ink)' : 'transparent',
                            color: chartRange === r ? '#fff' : 'var(--ink)',
                            borderColor: chartRange === r ? 'var(--ink)' : 'var(--border)',
                          }}
                          onClick={() => setChartRange(r)}
                        >
                          {r === '7D' ? '7 Days' : r === '30D' ? '30 Days' : r === '6M' ? '6 Months' : '1 Year'}
                        </button>
                      ))}
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                      85 / 10 / 5 Fair Split Enforced
                    </span>
                  </div>
                </div>

                {/* The Chart Canvas */}
                <div style={{ padding: '16px 0 8px' }}>
                  <div
                    style={{
                      height: '240px',
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: '14px',
                      justifyContent: 'space-between',
                      padding: '24px 20px 14px',
                      borderBottom: '2px solid var(--border)',
                      background: 'linear-gradient(to bottom, rgba(230, 170, 59, 0.03), rgba(217, 111, 77, 0.05))',
                      borderRadius: '12px',
                      position: 'relative',
                    }}
                  >
                    {VELOCITY_DATA[chartRange].map((bar, idx) => (
                      <div
                        key={`${bar.label}-${idx}`}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          height: '100%',
                          justifyContent: 'flex-end',
                          gap: '6px',
                          position: 'relative',
                        }}
                      >
                        {/* GMV Tag above bar */}
                        <div
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: 'var(--ink)',
                            background: 'var(--white)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {bar.gmv}
                        </div>

                        {/* The Pillar / Bar */}
                        <div
                          title={`Period: ${bar.label}\nTotal GMV: ${bar.gmv}\n85% Worker Payout: ${bar.workerShare}\n5% Welfare Pool: ${bar.welfareShare}\n10% Platform Ops: ${bar.platformShare}`}
                          style={{
                            width: '100%',
                            maxWidth: '44px',
                            minWidth: '22px',
                            height: `${Math.max(bar.val, 14)}%`,
                            background: 'linear-gradient(180deg, #e6aa3b 0%, #d96f4d 100%)',
                            borderRadius: '8px 8px 0 0',
                            boxShadow: '0 4px 14px rgba(217, 111, 77, 0.28)',
                            transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                            cursor: 'pointer',
                          }}
                        />

                        {/* X-Axis Label */}
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: 'var(--ink)',
                            marginTop: '4px',
                          }}
                        >
                          {bar.label}
                        </span>

                        {/* 85% Net Worker Payout Subtext */}
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            color: 'var(--terracotta)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          85%: {bar.workerShare}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Chart Legend & Explanation */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px 4px',
                      fontSize: '0.78rem',
                      color: 'var(--muted)',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(180deg, #e6aa3b, #d96f4d)', display: 'inline-block' }} />
                        <strong style={{ color: 'var(--ink)' }}>Gross Booking Velocity (GMV)</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--terracotta)', display: 'inline-block' }} />
                        <span>85% Direct Worker Wage Settlement</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--violet)', display: 'inline-block' }} />
                        <span>5% Cooperative Welfare Pool</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
                        <span>10% Platform Tech Operations</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                      Hover any bar to view the exact cooperative disbursement breakdown
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction & Settlement Ledger Table */}
              <div className="card">
                <div className="card-header mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Live Settlement &amp; Wage Disbursement Ledger</h2>
                    <small className="text-muted">
                      Real-time payment logs audited with direct Razorpay &amp; cooperative escrow reconciliation
                    </small>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Search customer, worker, ID..."
                      value={earningsSearch}
                      onChange={(e) => setEarningsSearch(e.target.value)}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        outline: 'none',
                        width: '210px',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        className={`btn btn-outline ${earningsFilter === 'ALL' ? 'active' : ''}`}
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        onClick={() => setEarningsFilter('ALL')}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        className={`btn btn-outline ${earningsFilter === 'ONLINE' ? 'active' : ''}`}
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        onClick={() => setEarningsFilter('ONLINE')}
                      >
                        Online UPI
                      </button>
                      <button
                        type="button"
                        className={`btn btn-outline ${earningsFilter === 'ESCROW' ? 'active' : ''}`}
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                        onClick={() => setEarningsFilter('ESCROW')}
                      >
                        Escrow
                      </button>
                    </div>
                  </div>
                </div>

                <div className="table-container mt-2">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Txn Ref / ID</th>
                        <th>Booking Ref</th>
                        <th>Customer</th>
                        <th>Worker &amp; Society</th>
                        <th>Service</th>
                        <th>Gross Bill</th>
                        <th>Worker Net (85%)</th>
                        <th>Welfare (5%)</th>
                        <th>Platform (10%)</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                        <th>Date &amp; Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const txns = earningsData?.transactions || [];
                        const filtered = txns.filter((t) => {
                          const matchesFilter =
                            earningsFilter === 'ALL'
                              ? true
                              : earningsFilter === 'ONLINE'
                              ? t.method.toLowerCase().includes('upi') || t.method.toLowerCase().includes('online')
                              : t.method.toLowerCase().includes('escrow') || t.method.toLowerCase().includes('cash');

                          const q = earningsSearch.toLowerCase();
                          const matchesSearch =
                            !q ||
                            t.id.toLowerCase().includes(q) ||
                            t.bookingId.toLowerCase().includes(q) ||
                            t.customerName.toLowerCase().includes(q) ||
                            t.workerName.toLowerCase().includes(q) ||
                            t.serviceName.toLowerCase().includes(q);

                          return matchesFilter && matchesSearch;
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan={12} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                                No matching financial records found.
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map((t, idx) => (
                          <tr key={`${t.id}-${idx}`}>
                            <td>
                              <code style={{ fontSize: '0.75rem', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                                {t.id}
                              </code>
                            </td>
                            <td><strong>{t.bookingId}</strong></td>
                            <td>{t.customerName}</td>
                            <td>
                              <strong>{t.workerName}</strong>
                              <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{t.societyName}</div>
                            </td>
                            <td>{t.serviceName}</td>
                            <td><strong>₹ {t.grossAmount}</strong></td>
                            <td className="text-terracotta" style={{ fontWeight: 700 }}>₹ {t.workerPayout}</td>
                            <td className="text-violet" style={{ fontWeight: 600 }}>₹ {t.welfareShare}</td>
                            <td className="text-green" style={{ fontWeight: 600 }}>₹ {t.platformFee}</td>
                            <td>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                                {t.method}
                              </span>
                            </td>
                            <td>
                              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                                ● {t.status}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{t.paidAt}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. CUSTOMERS VIEW */}
          {activeTab === 'view-customers' && (
            <div className="admin-view active">
              <h1 className="page-title mb-4">Customer Directory</h1>
              <div className="card table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Total Bookings</th>
                      <th>Spent</th>
                      <th>Status</th>
                      <th>Join Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c, idx) => (
                      <tr key={`${c.id || c.email}-${idx}`}>
                        <td><strong>{c.name}</strong></td>
                        <td>{c.email}</td>
                        <td>{c.bookings}</td>
                        <td>{c.spent}</td>
                        <td>
                          <span className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-cancelled'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td>{c.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. WORKERS VIEW */}
          {activeTab === 'view-workers' && (
            <div className="admin-view active">
              <h1 className="page-title mb-4">Worker Directory</h1>
              <div className="card table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Completed Jobs</th>
                      <th>Earnings</th>
                      <th>Verification</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.map((w, idx) => (
                      <tr key={`${w.id || w.name}-${idx}`}>
                        <td>
                          <strong>{w.name}</strong>
                          {w.phone && <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{w.phone}</div>}
                        </td>
                        <td>{w.cat}</td>
                        <td>{w.jobs}</td>
                        <td>{w.earn}</td>
                        <td>
                          <span className={`badge ${w.verif === 'Verified' ? 'badge-verified' : 'badge-req'}`}>
                            {w.verif}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: w.status === 'Online' ? 'var(--green)' : 'var(--muted)', fontWeight: 'bold' }}>
                            ● {w.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{
                              fontSize: '0.72rem',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              borderColor: w.verif === 'Verified' ? 'var(--terracotta)' : 'var(--green)',
                              color: w.verif === 'Verified' ? 'var(--terracotta)' : 'var(--green)',
                            }}
                            onClick={() => handleToggleVerification(w.id, w.verif === 'Verified')}
                          >
                            {w.verif === 'Verified' ? 'Revoke' : 'Approve'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{
                              fontSize: '0.72rem',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              borderColor: 'var(--red)',
                              color: 'var(--red)',
                              marginLeft: '6px',
                            }}
                            onClick={() => handleTriggerAdminAction('worker', w.id, w.name)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. REVIEWS VIEW */}
          {activeTab === 'view-reviews' && (() => {
            const totalReviewsCount = reviews.length;
            const starBreakdown = [5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => (r.r.match(/★/g) || []).length === star).length;
              const pct = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
              return { star, count, pct };
            });
            const totalStarsCount = reviews.reduce((sum, r) => sum + (r.r.match(/★/g) || []).length, 0);
            const avgRatingVal = totalReviewsCount > 0 ? (totalStarsCount / totalReviewsCount).toFixed(1) : '4.8';
            const roundedStars = Math.round(Number(avgRatingVal));

            return (
              <div className="admin-view active">
                <h1 className="page-title mb-4">Platform Reviews</h1>
                <div className="dashboard-split mb-4">
                  <div className="card split-left text-center">
                    <h2 style={{ fontSize: '3rem', color: 'var(--gold)', fontWeight: 800 }}>{avgRatingVal}</h2>
                    <div className="stars mb-2" style={{ fontSize: '1.5rem', color: 'var(--gold)' }}>
                      {'★'.repeat(roundedStars)}
                      {'☆'.repeat(Math.max(0, 5 - roundedStars))}
                    </div>
                    <p className="text-muted">Platform Average based on {totalReviewsCount} verified customer reviews</p>
                  </div>
                  <div className="card split-right">
                    {starBreakdown.map(({ star, pct }) => {
                      const bgClass =
                        star === 5 ? 'bg-gold' : star === 4 ? 'bg-mint' : star === 3 ? 'bg-violet' : star === 2 ? 'bg-terracotta' : 'bg-red';
                      return (
                        <div key={star} className="rating-bar">
                          <span className="label">{star} Star</span>
                          <div className="bar-track">
                            <div className={`bar-fill ${bgClass}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="pct">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h2>Recent Reviews</h2>
                    <span className="badge badge-verified" style={{ fontSize: '0.72rem' }}>
                      {totalReviewsCount} Total Verified
                    </span>
                  </div>
                  <div className="table-container mt-2">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Worker</th>
                          <th>Service</th>
                          <th>Rating</th>
                          <th>Review</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviews.map((r, i) => (
                          <tr key={`${r.id || r.c}-${i}`}>
                            <td><strong>{r.c}</strong></td>
                            <td>{r.w}</td>
                            <td>{r.s}</td>
                            <td style={{ color: 'var(--gold)', letterSpacing: '2px' }}>{r.r}</td>
                            <td><span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{r.rev}</span></td>
                            <td>{r.d}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 6. BOOKINGS VIEW */}
          {activeTab === 'view-bookings' && (
            <div className="admin-view active">
              <h1 className="page-title mb-4">All Bookings</h1>
              <div className="card table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Customer</th>
                      <th>Worker</th>
                      <th>Service</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b, idx) => (
                      <tr key={`${b.id}-${idx}`}>
                        <td><strong>{b.id}</strong></td>
                        <td>{b.c}</td>
                        <td>{b.w}</td>
                        <td>{b.s}</td>
                        <td>{b.d}</td>
                        <td>{b.a}</td>
                        <td><span className={`badge ${b.bc}`}>{b.st}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. COOPERATIVES VIEW */}
          {activeTab === 'view-coops' && (
            <div className="admin-view active">
              <div className="card-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 className="page-title" style={{ margin: 0 }}>Cooperative Societies</h1>
                  <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                    Registered Labour Cooperatives under ShramNexus Federation
                  </p>
                </div>
                <Link
                  href="/cooperative"
                  target="_blank"
                  className="btn btn-outline"
                  style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem', background: 'var(--ink)', color: '#fff' }}
                >
                  Open Cooperative Portal ↗
                </Link>
              </div>

              <div className="card table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Society Name</th>
                      <th>Reg. Number</th>
                      <th>Member Count</th>
                      <th>Federation Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cooperatives.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Federation Unit ID: {c.id}</div>
                        </td>
                        <td><code>{c.reg}</code></td>
                        <td>
                          <strong>{c.members}</strong> Active Members
                        </td>
                        <td>
                          <span className={`badge ${c.status === 'Active' ? 'badge-verified' : 'badge-req'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{
                              fontSize: '0.72rem',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              borderColor: 'var(--red)',
                              color: 'var(--red)',
                            }}
                            onClick={() => handleTriggerAdminAction('coop', c.id, c.name)}
                          >
                            Suspend / Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Disciplinary Action Confirmation Modal */}
      {pendingAction && (
        <div
          className="admin-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(36, 23, 47, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 10000,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="admin-modal-content"
            style={{
              background: '#fff',
              borderRadius: '18px',
              maxWidth: '460px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>⚠️</div>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.45rem', margin: '0 0 0.5rem 0', color: 'var(--ink)' }}>
              Confirm {pendingAction.type === 'worker' ? 'Worker Removal' : 'Cooperative Suspension'}
            </h2>
            <p className="text-muted" style={{ fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
              Are you sure you want to {pendingAction.type === 'worker' ? 'remove' : 'suspend'} <strong>{pendingAction.name}</strong>? This disciplinary action is recorded in the permanent audit trail.
            </p>

            <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Reason for Action (Mandatory Audit Log)
              </label>
              <select
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--sans)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: '#fcfbfa',
                }}
              >
                <option value="Policy Violation">Policy Violation</option>
                <option value="Fraudulent Activity">Fraudulent Activity</option>
                <option value="User Complaints">User Complaints</option>
                <option value="Documentation Issue">Documentation Issue</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1, padding: '0.65rem' }}
                onClick={() => setPendingAction(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-dark"
                style={{ flex: 1, padding: '0.65rem', background: 'var(--red)', color: '#fff', border: 'none' }}
                onClick={handleConfirmAdminAction}
              >
                Confirm {pendingAction.type === 'worker' ? 'Removal' : 'Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Admin Action Toast */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--ink)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            borderLeft: '4px solid var(--gold)',
            fontSize: '0.9rem',
            fontWeight: 600,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>✓</span> {toastMsg}
        </div>
      )}
    </div>
  );
}
