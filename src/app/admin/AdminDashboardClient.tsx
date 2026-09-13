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
  adminReactivateCooperative,
  adminRemoveWorker,
  adminRestoreWorker,
  adminSettlePayoutsAction,
  updateBookingStatusAdmin,
  getAdminAuditLogs,
  AdminAuditLogItem,
  adminRegisterCooperative,
  getFederationTools,
  adminTransferFederationTool,
  adminAddFederationTool,
  adminDispatchSpillover,
  getAdminVelocityData,
  FederationToolItem,
  VelocityPoint,
} from '@/app/actions/admin';
import {
  getAdminSupportTickets,
  resolveSupportTicketAction,
  SupportTicketItem,
} from '@/app/actions/support';
import { createClient } from '@/lib/supabase/client';
import './admin.css';

type AdminTab =
  | 'view-overview'
  | 'view-customers'
  | 'view-workers'
  | 'view-bookings'
  | 'view-earnings'
  | 'view-reviews'
  | 'view-coops'
  | 'view-audit'
  | 'view-support';



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
    totalWorkers: 0,
    totalCustomers: 0,
    totalBookings: 0,
    totalVolume: 0,
    platformCommission: 0,
    welfarePool: 0,
    workerDisbursements: 0,
  });

  const [customers, setCustomers] = useState<AdminCustomerItem[]>([]);
  const [workers, setWorkers] = useState<AdminWorkerItem[]>([]);
  const [bookings, setBookings] = useState<AdminBookingItem[]>([]);
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [cooperatives, setCooperatives] = useState<AdminCooperativeItem[]>([]);
  const [earningsData, setEarningsData] = useState<AdminEarningsData | null>(null);
  const [earningsFilter, setEarningsFilter] = useState<'ALL' | 'ONLINE' | 'ESCROW'>('ALL');
  const [earningsSearch, setEarningsSearch] = useState('');

  // Interactive filters and searches
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogItem[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [workerSearch, setWorkerSearch] = useState('');
  const [workerFilter, setWorkerFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'ONLINE' | 'OFFLINE'>('ALL');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState<'ALL' | 'ONGOING' | 'PENDING' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewStarFilter, setReviewStarFilter] = useState<number | null>(null);
  const [coopSearch, setCoopSearch] = useState('');
  const [coopFilter, setCoopFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');

  // Payout settlement modal state
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [settleReceipt, setSettleReceipt] = useState<{
    batchId: string;
    amount: number;
    message: string;
    societies: string[];
    date: string;
  } | null>(null);

  // Support Tickets State
  const [supportTickets, setSupportTickets] = useState<SupportTicketItem[]>([]);
  const [supportSearch, setSupportSearch] = useState('');
  const [supportFilter, setSupportFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  // Dynamic Velocity Data
  const [velocityPoints, setVelocityPoints] = useState<VelocityPoint[]>([]);

  // Federation Console State
  const [federationTools, setFederationTools] = useState<FederationToolItem[]>([]);
  const [federationSubTab, setFederationSubTab] = useState<'societies' | 'spillover' | 'equipment' | 'welfare'>('societies');
  const [showRegisterCoopModal, setShowRegisterCoopModal] = useState(false);
  const [isRegisteringCoop, setIsRegisteringCoop] = useState(false);
  const [newCoopForm, setNewCoopForm] = useState({
    name: '',
    registration_number: '',
    district: '',
    state: '',
    member_count: 45,
    welfare_fund_balance: 80000,
    monthly_revenue: 180000,
  });

  // Spillover Dispatch State
  const [showSpilloverModal, setShowSpilloverModal] = useState(false);
  const [isDispatchingSpillover, setIsDispatchingSpillover] = useState(false);
  const [spilloverForm, setSpilloverForm] = useState({
    fromSocietyId: '',
    toSocietyId: '',
    workerCount: 5,
    trade: 'Electrician & Wiremen',
    reason: 'Inter-district surge load balance and spillover routing',
  });

  // Federation Shared Equipment State
  const [showAddToolModal, setShowAddToolModal] = useState(false);
  const [isAddingTool, setIsAddingTool] = useState(false);
  const [newToolForm, setNewToolForm] = useState({
    name: '',
    toolCode: '',
    category: 'Heavy Equipment',
    societyId: '',
  });
  const [toolTransferTarget, setToolTransferTarget] = useState<{ toolId: string; toolName: string } | null>(null);
  const [transferSocietyId, setTransferSocietyId] = useState('');
  const [isTransferringTool, setIsTransferringTool] = useState(false);

  // Disciplinary removal / audit modal
  const [pendingAction, setPendingAction] = useState<{
    type: 'worker' | 'coop';
    id: string;
    name: string;
  } | null>(null);
  const [actionReason, setActionReason] = useState('Policy Violation');

  const fetchAllData = async () => {
    try {
      const [s, w, c, b, r, e, coops, logs, tickets, tools, vel] = await Promise.all([
        getAdminOverview(),
        getAdminWorkers(),
        getAdminCustomers(),
        getAdminBookings(),
        getAdminReviews(),
        getAdminEarnings(),
        getAdminCooperatives(),
        getAdminAuditLogs(),
        getAdminSupportTickets(),
        getFederationTools(),
        getAdminVelocityData(chartRange),
      ]);
      if (s) setStats(s);
      if (w) setWorkers(w);
      if (c) setCustomers(c);
      if (b) setBookings(b);
      if (r) setReviews(r);
      if (e) setEarningsData(e);
      if (coops) setCooperatives(coops);
      if (logs) setAuditLogs(logs);
      if (tickets) setSupportTickets(tickets);
      if (tools) setFederationTools(tools);
      if (vel && vel.length > 0) setVelocityPoints(vel);
      setLastSynced(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    }
  };

  useEffect(() => {
    async function loadVelocity() {
      try {
        const vel = await getAdminVelocityData(chartRange);
        if (vel && vel.length > 0) setVelocityPoints(vel);
      } catch (e) {
        console.error('Error fetching velocity data for range:', chartRange, e);
      }
    }
    loadVelocity();
  }, [chartRange]);

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

  const handleResolveSupportTicket = async (ticketId: string) => {
    setIsResolving(true);
    try {
      const res = await resolveSupportTicketAction(ticketId);
      if (res.success) {
        setSupportTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: 'Resolved' } : t))
        );
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: 'Resolved' });
        }
        showToast(`✓ Ticket #${ticketId} marked as Resolved.`);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to resolve ticket');
    } finally {
      setIsResolving(false);
    }
  };

  const handleExportCsv = () => {
    if (!earningsData || !earningsData.transactions.length) {
      showToast('No transactions to export.');
      return;
    }
    const headers =
      'Transaction ID,Booking ID,Customer,Worker,Society,Service,Gross Amount,Worker Payout (85%),Welfare Share (5%),Platform Fee (10%),Method,Status,Date';
    const rows = earningsData.transactions.map(
      (t) =>
        `"${t.id}","${t.bookingId}","${t.customerName}","${t.workerName}","${t.societyName}","${t.serviceName}","₹ ${t.grossAmount}","₹ ${t.workerPayout}","₹ ${t.welfareShare}","₹ ${t.platformFee}","${t.method}","${t.status}","${t.paidAt}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `shramnexus_payout_ledger_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Payout ledger CSV downloaded successfully!');
  };

  useEffect(() => {
    // Check admin authentication
    const auth =
      localStorage.getItem('shramnexus-admin-auth') ||
      localStorage.getItem('sharmnexus-admin-auth');
    if (auth === 'true') {
      // Ensure customer-facing storage is clean and never contaminated by admin session
      try {
        const cust = localStorage.getItem('shramnexus-auth') || localStorage.getItem('sharmnexus-auth');
        if (cust) {
          const parsed = JSON.parse(cust);
          if (parsed.role === 'admin' || parsed.name === 'Super Admin' || parsed.email === 'admin@shramnexus.com') {
            localStorage.removeItem('shramnexus-auth');
            localStorage.removeItem('sharmnexus-auth');
          }
        }
      } catch (e) {}
      setIsAuthorized(true);
      fetchAllData();
    } else {
      setIsAuthorized(false);
      router.replace('/auth/login');
    }
  }, [router]);

  // Live dynamic synchronization (every 3 seconds and on Supabase changes)
  useEffect(() => {
    if (!isAuthorized) return;

    const interval = setInterval(() => {
      fetchAllData();
    }, 3000);

    const supabase = createClient();
    const channel = supabase
      .channel('admin-live-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          fetchAllData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => {
          fetchAllData();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [isAuthorized]);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await fetchAllData();
    setIsRefreshing(false);
    showToast('⚡ Dynamic Supabase data refreshed successfully!');
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
      getAdminAuditLogs().then((logs) => setAuditLogs(logs));
    } catch (e: any) {
      showToast('Disciplinary action recorded in audit log.');
    }
    setPendingAction(null);
  };

  const handleReactivateCoop = async (coopId: string, name: string) => {
    try {
      await adminReactivateCooperative(coopId);
      setCooperatives((prev) =>
        prev.map((c) => (c.id === coopId ? { ...c, status: 'Active' } : c))
      );
      showToast(`${name} has been reinstated and active.`);
      getAdminAuditLogs().then((logs) => setAuditLogs(logs));
    } catch (e: any) {
      showToast('Failed to reactivate cooperative');
    }
  };

  const handleRegisterCoop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoopForm.name || !newCoopForm.registration_number || !newCoopForm.district) {
      showToast('Please fill all required fields');
      return;
    }
    setIsRegisteringCoop(true);
    try {
      await adminRegisterCooperative(newCoopForm);
      showToast(`✓ Registered & accredited ${newCoopForm.name} into Federation!`);
      setShowRegisterCoopModal(false);
      setNewCoopForm({
        name: '',
        registration_number: '',
        district: '',
        state: '',
        member_count: 45,
        welfare_fund_balance: 80000,
        monthly_revenue: 180000,
      });
      await fetchAllData();
    } catch (err: any) {
      console.error(err);
      showToast('Error registering cooperative: ' + (err.message || 'Unknown error'));
    } finally {
      setIsRegisteringCoop(false);
    }
  };

  const handleDispatchSpillover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spilloverForm.fromSocietyId || !spilloverForm.toSocietyId) {
      showToast('Please select source and destination societies');
      return;
    }
    if (spilloverForm.fromSocietyId === spilloverForm.toSocietyId) {
      showToast('Source and destination cannot be the same');
      return;
    }
    setIsDispatchingSpillover(true);
    try {
      await adminDispatchSpillover(spilloverForm);
      showToast(`✓ Spillover dispatched: Mobilized ${spilloverForm.workerCount} artisans!`);
      setShowSpilloverModal(false);
      await fetchAllData();
    } catch (err: any) {
      console.error(err);
      showToast('Error dispatching spillover');
    } finally {
      setIsDispatchingSpillover(false);
    }
  };

  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToolForm.name || !newToolForm.toolCode || !newToolForm.societyId) {
      showToast('Please fill all equipment fields');
      return;
    }
    setIsAddingTool(true);
    try {
      await adminAddFederationTool(newToolForm);
      showToast(`✓ Registered ${newToolForm.name} to Federation Asset Bank!`);
      setShowAddToolModal(false);
      setNewToolForm({ name: '', toolCode: '', category: 'Heavy Equipment', societyId: '' });
      await fetchAllData();
    } catch (err: any) {
      console.error(err);
      showToast('Error registering equipment');
    } finally {
      setIsAddingTool(false);
    }
  };

  const handleTransferTool = async () => {
    if (!toolTransferTarget || !transferSocietyId) return;
    setIsTransferringTool(true);
    try {
      await adminTransferFederationTool(toolTransferTarget.toolId, transferSocietyId);
      showToast(`✓ Equipment ${toolTransferTarget.toolName} transferred successfully!`);
      setToolTransferTarget(null);
      setTransferSocietyId('');
      await fetchAllData();
    } catch (err: any) {
      console.error(err);
      showToast('Error transferring equipment');
    } finally {
      setIsTransferringTool(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await updateBookingStatusAdmin(bookingId, newStatus);
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id === bookingId) {
            let bc = 'badge-pending';
            if (newStatus === 'Ongoing') bc = 'badge-ongoing';
            if (newStatus === 'Completed') bc = 'badge-success';
            if (newStatus === 'Cancelled') bc = 'badge-cancelled';
            return { ...b, st: newStatus as any, bc };
          }
          return b;
        })
      );
      showToast(`Booking ${bookingId} status updated to ${newStatus}`);
      getAdminAuditLogs().then((logs) => setAuditLogs(logs));
    } catch (e: any) {
      showToast('Failed to update booking status');
    }
  };

  const handleSettleBatchPayouts = () => {
    setShowSettleModal(true);
  };

  const handleExecuteSettlePayouts = async () => {
    setIsSettling(true);
    try {
      const res = await adminSettlePayoutsAction();
      if (res.success) {
        setEarningsData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            overview: {
              ...prev.overview,
              escrowLockedVolume: 0,
              workerDisbursements: prev.overview.workerDisbursements + res.settledAmount,
            },
            societies: prev.societies.map((s) => ({
              ...s,
              payoutStatus: `✓ Disbursed (${res.batchId} Settled)`,
            })),
            transactions: prev.transactions.map((t) => ({
              ...t,
              status: 'Completed',
            })),
          };
        });

        setSettleReceipt({
          batchId: res.batchId,
          amount: res.settledAmount,
          message: res.message,
          societies: ['Patna District Labour Society', 'Pune Gig Workers Cooperative'],
          date: new Date().toLocaleString('en-IN', {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
        });

        showToast(`⚡ Batch ${res.batchId} settled: ₹${res.settledAmount.toLocaleString('en-IN')} transferred via NEFT!`);
        getAdminAuditLogs().then((logs) => setAuditLogs(logs));
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to settle batch payouts');
    } finally {
      setIsSettling(false);
    }
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
            🏢 Cooperative Federation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('view-audit')}
            className={`nav-item ${activeTab === 'view-audit' ? 'active' : ''}`}
          >
            📜 Audit Trail
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('view-support')}
            className={`nav-item ${activeTab === 'view-support' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span>💬 Support Queries</span>
            {supportTickets.filter((t) => t.status !== 'Resolved').length > 0 && (
              <span
                style={{
                  background: '#d96f4d',
                  color: '#fff',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '10px',
                }}
              >
                {supportTickets.filter((t) => t.status !== 'Resolved').length}
              </span>
            )}
          </button>

          <Link
            href="/"
            className="nav-item"
            style={{ marginTop: 'auto', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>🏠</span>
            <span>Back to Public Site</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="nav-item text-red"
            style={{ marginTop: '6px' }}
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
            <Link
              href="/"
              className="btn btn-outline"
              title="Return to Public Customer Landing Page"
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              ← Back to Public Site
            </Link>
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
                            <span
                              className={`badge ${
                                soc.payoutStatus.includes('Disbursed') ? 'badge-success' : 'badge-req'
                              }`}
                              style={{ fontSize: '0.72rem' }}
                            >
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
                    {(velocityPoints.length > 0 ? velocityPoints : VELOCITY_DATA[chartRange]).map((bar, idx) => (
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
          {activeTab === 'view-customers' && (() => {
            const filteredCustomers = customers.filter((c) => {
              const q = customerSearch.toLowerCase();
              const matchesSearch =
                !q ||
                c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q);
              const matchesFilter =
                customerFilter === 'ALL'
                  ? true
                  : customerFilter === 'ACTIVE'
                  ? c.status === 'Active'
                  : c.status !== 'Active';
              return matchesSearch && matchesFilter;
            });

            return (
              <div className="admin-view active">
                <div className="card-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h1 className="page-title" style={{ margin: 0 }}>Customer Directory</h1>
                    <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                      Registered consumer profiles with live booking volume &amp; spend history
                    </p>
                  </div>
                  <span className="badge badge-verified" style={{ padding: '6px 12px' }}>
                    {filteredCustomers.length} Consumers Found
                  </span>
                </div>

                <div className="card table-container">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <input
                      type="text"
                      placeholder="Search customer name or email..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      style={{
                        padding: '7px 14px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        outline: 'none',
                        width: '260px',
                        background: '#fcfbfa',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          className={`btn btn-outline ${customerFilter === f ? 'active' : ''}`}
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={() => setCustomerFilter(f)}
                        >
                          {f === 'ALL' ? 'All Customers' : f === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email / Contact</th>
                        <th>Total Bookings</th>
                        <th>Gross Spent</th>
                        <th>Account Status</th>
                        <th>Registered Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--muted)' }}>
                            No matching customer profiles found for &ldquo;{customerSearch}&rdquo;.
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((c, idx) => (
                          <tr key={`${c.id || c.email}-${idx}`}>
                            <td><strong>{c.name}</strong></td>
                            <td>{c.email}</td>
                            <td><strong>{c.bookings}</strong> Bookings</td>
                            <td style={{ fontWeight: 700, color: 'var(--green)' }}>{c.spent}</td>
                            <td>
                              <span className={`badge ${c.status === 'Active' ? 'badge-success' : 'badge-cancelled'}`}>
                                ● {c.status}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{c.date}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* 4. WORKERS VIEW */}
          {activeTab === 'view-workers' && (() => {
            const filteredWorkers = workers.filter((w) => {
              const q = workerSearch.toLowerCase();
              const matchesSearch =
                !q ||
                w.name.toLowerCase().includes(q) ||
                w.cat.toLowerCase().includes(q) ||
                (w.phone && w.phone.includes(q));
              const matchesFilter =
                workerFilter === 'ALL'
                  ? true
                  : workerFilter === 'VERIFIED'
                  ? w.verif === 'Verified'
                  : workerFilter === 'PENDING'
                  ? w.verif === 'Pending'
                  : workerFilter === 'ONLINE'
                  ? w.status === 'Online'
                  : w.status === 'Offline';
              return matchesSearch && matchesFilter;
            });

            return (
              <div className="admin-view active">
                <div className="card-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h1 className="page-title" style={{ margin: 0 }}>Worker Registry &amp; Verification</h1>
                    <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                      Federation labour verification, cooperative status, and disciplinary actions
                    </p>
                  </div>
                  <span className="badge badge-ongoing" style={{ padding: '6px 12px' }}>
                    {filteredWorkers.length} Artisans Displayed
                  </span>
                </div>

                <div className="card table-container">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <input
                      type="text"
                      placeholder="Search artisan name, skill, phone..."
                      value={workerSearch}
                      onChange={(e) => setWorkerSearch(e.target.value)}
                      style={{
                        padding: '7px 14px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        outline: 'none',
                        width: '260px',
                        background: '#fcfbfa',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {(['ALL', 'VERIFIED', 'PENDING', 'ONLINE', 'OFFLINE'] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          className={`btn btn-outline ${workerFilter === f ? 'active' : ''}`}
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          onClick={() => setWorkerFilter(f)}
                        >
                          {f === 'ALL' ? 'All' : f === 'VERIFIED' ? 'Verified' : f === 'PENDING' ? 'Pending' : f === 'ONLINE' ? 'Online' : 'Offline'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Worker Name</th>
                        <th>Trade / Category</th>
                        <th>Jobs Done</th>
                        <th>Wages Earned</th>
                        <th>Federation Verification</th>
                        <th>Availability</th>
                        <th>Disciplinary &amp; Verification</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWorkers.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--muted)' }}>
                            No workers found matching your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredWorkers.map((w, idx) => (
                          <tr key={`${w.id || w.name}-${idx}`}>
                            <td>
                              <strong>{w.name}</strong>
                              {w.phone && <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{w.phone}</div>}
                            </td>
                            <td><span className="badge badge-ongoing">{w.cat}</span></td>
                            <td><strong>{w.jobs}</strong></td>
                            <td className="text-terracotta" style={{ fontWeight: 700 }}>{w.earn}</td>
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
                                Disciplinary Remove
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

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

            const filteredReviews = reviews.filter((r) => {
              const starsCount = (r.r.match(/★/g) || []).length;
              const matchesStar = reviewStarFilter === null ? true : starsCount === reviewStarFilter;
              const q = reviewSearch.toLowerCase();
              const matchesSearch =
                !q ||
                r.c.toLowerCase().includes(q) ||
                r.w.toLowerCase().includes(q) ||
                r.s.toLowerCase().includes(q) ||
                r.rev.toLowerCase().includes(q);
              return matchesStar && matchesSearch;
            });

            return (
              <div className="admin-view active">
                <h1 className="page-title mb-4">Platform Reviews &amp; Feedback Quality</h1>
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
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h2 style={{ margin: 0 }}>Recent Verified Reviews</h2>
                      <small className="text-muted">{filteredReviews.length} feedback items shown</small>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="Search feedback, worker, customer..."
                        value={reviewSearch}
                        onChange={(e) => setReviewSearch(e.target.value)}
                        style={{
                          padding: '6px 12px',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          outline: 'none',
                          width: '220px',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          className={`btn btn-outline ${reviewStarFilter === null ? 'active' : ''}`}
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          onClick={() => setReviewStarFilter(null)}
                        >
                          All
                        </button>
                        {[5, 4, 3, 2, 1].map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={`btn btn-outline ${reviewStarFilter === s ? 'active' : ''}`}
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                            onClick={() => setReviewStarFilter(reviewStarFilter === s ? null : s)}
                          >
                            {s}★
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="table-container mt-3">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Worker</th>
                          <th>Service</th>
                          <th>Rating</th>
                          <th>Review Feedback</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReviews.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                              No reviews match the selected filter.
                            </td>
                          </tr>
                        ) : (
                          filteredReviews.map((r, i) => (
                            <tr key={`${r.id || r.c}-${i}`}>
                              <td><strong>{r.c}</strong></td>
                              <td>{r.w}</td>
                              <td>{r.s}</td>
                              <td style={{ color: 'var(--gold)', letterSpacing: '2px' }}>{r.r}</td>
                              <td><span style={{ fontSize: '0.85rem', color: 'var(--ink)' }}>&ldquo;{r.rev}&rdquo;</span></td>
                              <td style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{r.d}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 6. BOOKINGS VIEW */}
          {activeTab === 'view-bookings' && (() => {
            const filteredBookings = bookings.filter((b) => {
              const q = bookingSearch.toLowerCase();
              const matchesSearch =
                !q ||
                b.id.toLowerCase().includes(q) ||
                b.c.toLowerCase().includes(q) ||
                b.w.toLowerCase().includes(q) ||
                b.s.toLowerCase().includes(q);
              const matchesFilter =
                bookingFilter === 'ALL'
                  ? true
                  : bookingFilter === 'ONGOING'
                  ? b.st === 'Ongoing'
                  : bookingFilter === 'PENDING'
                  ? b.st === 'Pending'
                  : bookingFilter === 'COMPLETED'
                  ? b.st === 'Completed'
                  : b.st === 'Cancelled';
              return matchesSearch && matchesFilter;
            });

            return (
              <div className="admin-view active">
                <div className="card-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h1 className="page-title" style={{ margin: 0 }}>All Bookings &amp; Service Orders</h1>
                    <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                      Real-time booking dispatch with dynamic administrative status override
                    </p>
                  </div>
                  <span className="badge badge-ongoing" style={{ padding: '6px 12px' }}>
                    {filteredBookings.length} Active Bookings
                  </span>
                </div>

                <div className="card table-container">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <input
                      type="text"
                      placeholder="Search ID, customer, worker, service..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      style={{
                        padding: '7px 14px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        outline: 'none',
                        width: '260px',
                        background: '#fcfbfa',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {(['ALL', 'ONGOING', 'PENDING', 'COMPLETED', 'CANCELLED'] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          className={`btn btn-outline ${bookingFilter === f ? 'active' : ''}`}
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          onClick={() => setBookingFilter(f)}
                        >
                          {f === 'ALL' ? 'All' : f === 'ONGOING' ? 'Ongoing' : f === 'PENDING' ? 'Pending' : f === 'COMPLETED' ? 'Completed' : 'Cancelled'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Customer</th>
                        <th>Worker Assigned</th>
                        <th>Service</th>
                        <th>Scheduled Date</th>
                        <th>Total Amount</th>
                        <th>Status (Live Override)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--muted)' }}>
                            No bookings found matching filter &ldquo;{bookingSearch || bookingFilter}&rdquo;.
                          </td>
                        </tr>
                      ) : (
                        filteredBookings.map((b, idx) => (
                          <tr key={`${b.id}-${idx}`}>
                            <td><strong>{b.id}</strong></td>
                            <td>{b.c}</td>
                            <td><strong>{b.w}</strong></td>
                            <td>{b.s}</td>
                            <td style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{b.d}</td>
                            <td><strong>{b.a}</strong></td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className={`badge ${b.bc}`}>{b.st}</span>
                                <select
                                  value={b.st}
                                  onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                                  title="Change booking status in live database"
                                  style={{
                                    fontSize: '0.72rem',
                                    padding: '3px 6px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border)',
                                    background: '#fff',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    fontFamily: 'var(--sans)',
                                    color: 'var(--ink)',
                                  }}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Ongoing">Ongoing</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* 7. COOPERATIVE FEDERATION CONSOLE VIEW */}
          {activeTab === 'view-coops' && (() => {
            const filteredCooperatives = cooperatives.filter((c) => {
              const q = coopSearch.toLowerCase();
              const matchesSearch =
                !q ||
                c.name.toLowerCase().includes(q) ||
                c.reg.toLowerCase().includes(q) ||
                c.district?.toLowerCase().includes(q) ||
                c.id.toLowerCase().includes(q);
              const matchesFilter =
                coopFilter === 'ALL'
                  ? true
                  : coopFilter === 'ACTIVE'
                  ? c.status === 'Active'
                  : c.status === 'Suspended';
              return matchesSearch && matchesFilter;
            });

            const totalMembers = cooperatives.reduce((sum, c) => sum + (c.members || 0), 0);
            const totalWelfareFund = cooperatives.reduce((sum, c) => sum + (c.welfareBalance || 0), 0);
            const totalActiveBookings = cooperatives.reduce((sum, c) => sum + (c.activeBookingsCount || 0), 0);

            return (
              <div className="admin-view active">
                {/* Master Federation Header */}
                <div className="card-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', background: 'linear-gradient(135deg, #24172f 0%, #3a224c 100%)', color: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '1.3rem' }}>🏛️</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#f3c969' }}>
                        Apex Statutory Federation
                      </span>
                    </div>
                    <h1 className="page-title" style={{ margin: 0, color: '#fff', fontSize: '1.45rem' }}>
                      National Labour Cooperative Federation
                    </h1>
                    <p style={{ fontSize: '0.82rem', margin: '0.25rem 0 0 0', color: 'rgba(255,255,255,0.7)' }}>
                      Reg: <code>NLCF-1001-HQ</code> • Multi-State Inter-Cooperative Capacity Exchange &amp; Welfare Mesh
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn"
                      style={{ fontSize: '0.82rem', padding: '0.55rem 1.1rem', background: 'linear-gradient(135deg, #e6aa3b 0%, #d96f4d 100%)', color: '#fff', fontWeight: 700, border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(217,111,77,0.35)' }}
                      onClick={() => setShowRegisterCoopModal(true)}
                    >
                      + Register New Society
                    </button>
                    <button
                      type="button"
                      className="btn"
                      style={{ fontSize: '0.82rem', padding: '0.55rem 1.1rem', background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 600, border: '1px solid rgba(255,255,255,0.25)', borderRadius: '8px' }}
                      onClick={() => setShowSpilloverModal(true)}
                    >
                      ⚡ Mobilize Spillover
                    </button>
                    <Link
                      href="/cooperative"
                      target="_blank"
                      className="btn"
                      style={{ fontSize: '0.82rem', padding: '0.55rem 1.1rem', background: '#fff', color: 'var(--ink)', fontWeight: 700, borderRadius: '8px' }}
                    >
                      Open Portal ↗
                    </Link>
                  </div>
                </div>

                {/* 4 Master KPI Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '1.5rem' }}>
                  <div className="card" style={{ padding: '1.1rem', borderLeft: '4px solid #4f46e5' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>Affiliated Societies</div>
                    <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--ink)', margin: '4px 0' }}>{cooperatives.length}</div>
                    <small style={{ color: 'var(--green)', fontWeight: 600 }}>Jaipur, Jodhpur, Pune, Patna, Kolkata</small>
                  </div>

                  <div className="card" style={{ padding: '1.1rem', borderLeft: '4px solid #059669' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>Artisan Reserve</div>
                    <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--green)', margin: '4px 0' }}>{totalMembers}</div>
                    <small style={{ color: 'var(--muted)' }}>Verified democratic members</small>
                  </div>

                  <div className="card" style={{ padding: '1.1rem', borderLeft: '4px solid #d97706' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>Mutual Welfare Reserve</div>
                    <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--gold)', margin: '4px 0' }}>{formatCurrency(totalWelfareFund)}</div>
                    <small style={{ color: 'var(--muted)' }}>Central Emergency Pool</small>
                  </div>

                  <div className="card" style={{ padding: '1.1rem', borderLeft: '4px solid #0891b2' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>Spillover Capacity Mesh</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0891b2', margin: '6px 0 4px' }}>ACTIVE</div>
                    <small style={{ color: 'var(--muted)' }}>{totalActiveBookings} active live assignments</small>
                  </div>
                </div>

                {/* Sub-Tabs Nav Bar */}
                <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--border)', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '4px' }}>
                  {[
                    { id: 'societies', label: '🏛️ Affiliated Societies & Compliance' },
                    { id: 'spillover', label: '🔄 Inter-Cooperative Capacity Matrix' },
                    { id: 'equipment', label: `🛠️ Shared Equipment Bank (${federationTools.length})` },
                    { id: 'welfare', label: '🛡️ Mutual Aid & Welfare Pool' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setFederationSubTab(st.id as any)}
                      style={{
                        padding: '8px 16px',
                        fontSize: '0.84rem',
                        fontWeight: federationSubTab === st.id ? 700 : 500,
                        color: federationSubTab === st.id ? 'var(--ink)' : 'var(--muted)',
                        background: federationSubTab === st.id ? '#f3ede4' : 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {/* SUB-TAB 1: AFFILIATED SOCIETIES */}
                {federationSubTab === 'societies' && (
                  <div className="card table-container">
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                      <input
                        type="text"
                        placeholder="Search society name, district, registration..."
                        value={coopSearch}
                        onChange={(e) => setCoopSearch(e.target.value)}
                        style={{
                          padding: '7px 14px',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          outline: 'none',
                          width: '280px',
                          background: '#fcfbfa',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map((f) => (
                          <button
                            key={f}
                            type="button"
                            className={`btn btn-outline ${coopFilter === f ? 'active' : ''}`}
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                            onClick={() => setCoopFilter(f)}
                          >
                            {f === 'ALL' ? 'All Societies' : f === 'ACTIVE' ? 'Active' : 'Suspended'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Society &amp; District</th>
                          <th>Reg. Number &amp; State</th>
                          <th>Artisan Pool</th>
                          <th>Capacity Load</th>
                          <th>Spillover Status</th>
                          <th>Governance Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCooperatives.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--muted)' }}>
                              No cooperative societies found matching &ldquo;{coopSearch}&rdquo;.
                            </td>
                          </tr>
                        ) : (
                          filteredCooperatives.map((c) => (
                            <tr key={c.id}>
                              <td>
                                <strong>{c.name}</strong>
                                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                                  📍 {c.district}, {c.state}
                                </div>
                              </td>
                              <td>
                                <code>{c.reg}</code>
                                <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Unit: {c.id.substring(0, 8)}...</div>
                              </td>
                              <td>
                                <strong>{c.members}</strong> Members
                                <div style={{ fontSize: '0.72rem', color: 'var(--green)' }}>
                                  Fund: {formatCurrency(c.welfareBalance)}
                                </div>
                              </td>
                              <td>
                                <div style={{ width: '110px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '2px' }}>
                                    <span>{c.capacityUtilization}%</span>
                                    <span className="text-muted">{c.activeBookingsCount} jobs</span>
                                  </div>
                                  <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div
                                      style={{
                                        width: `${Math.min(c.capacityUtilization, 100)}%`,
                                        height: '100%',
                                        background: c.capacityUtilization > 70 ? '#ef4444' : c.capacityUtilization > 30 ? '#059669' : '#3b82f6',
                                      }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    c.spilloverStatus === 'Surplus Capacity'
                                      ? 'badge-verified'
                                      : c.spilloverStatus === 'Overloaded'
                                      ? 'badge-req'
                                      : 'badge-ongoing'
                                  }`}
                                  style={{ fontSize: '0.72rem' }}
                                >
                                  ● {c.spilloverStatus}
                                </span>
                              </td>
                              <td>
                                {c.status === 'Active' ? (
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
                                    Suspend
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn btn-outline"
                                    style={{
                                      fontSize: '0.72rem',
                                      padding: '4px 10px',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                      borderColor: 'var(--green)',
                                      color: 'var(--green)',
                                    }}
                                    onClick={() => handleReactivateCoop(c.id, c.name)}
                                  >
                                    ✓ Reactivate
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SUB-TAB 2: SPILLOVER & CAPACITY MATRIX */}
                {federationSubTab === 'spillover' && (
                  <div>
                    <div style={{ background: '#f8f6f2', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--ink)' }}>
                          ⚡ Dynamic Inter-District Labor Capacity Balancing
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--muted)', maxWidth: '650px', lineHeight: 1.4 }}>
                          When a high-density urban district experiences a sudden surge in emergency bookings (e.g. monsoon plumbing or construction spikes), the Federation router routes excess demand to affiliated neighboring societies with surplus labor reserves.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn"
                        style={{ padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg, #e6aa3b 0%, #d96f4d 100%)', color: '#fff', fontWeight: 700, borderRadius: '8px', border: 'none' }}
                        onClick={() => setShowSpilloverModal(true)}
                      >
                        + Mobilize Spillover Dispatch
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
                      {cooperatives.map((c) => (
                        <div key={c.id} className="card" style={{ padding: '1.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div>
                              <strong style={{ fontSize: '1rem', color: 'var(--ink)' }}>{c.name}</strong>
                              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>📍 {c.district}, {c.state}</div>
                            </div>
                            <span
                              className={`badge ${
                                c.spilloverStatus === 'Surplus Capacity'
                                  ? 'badge-verified'
                                  : c.spilloverStatus === 'Overloaded'
                                  ? 'badge-req'
                                  : 'badge-ongoing'
                              }`}
                            >
                              {c.spilloverStatus}
                            </span>
                          </div>

                          <div style={{ background: '#fcfbfa', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', margin: '10px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                              <span>Capacity Load:</span>
                              <strong>{c.capacityUtilization}%</strong>
                            </div>
                            <div style={{ height: '7px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
                              <div
                                style={{
                                  width: `${Math.min(c.capacityUtilization, 100)}%`,
                                  height: '100%',
                                  background: c.capacityUtilization > 70 ? '#ef4444' : c.capacityUtilization > 30 ? '#059669' : '#3b82f6',
                                }}
                              />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--muted)' }}>
                              <span>Active Artisans: <strong>{c.members}</strong></span>
                              <span>Live Jobs: <strong>{c.activeBookingsCount}</strong></span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                              Monthly Rev: <strong>₹ {c.monthlyRevenue.toLocaleString('en-IN')}</strong>
                            </span>
                            <button
                              type="button"
                              className="btn btn-outline"
                              style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                              onClick={() => {
                                setSpilloverForm((prev) => ({
                                  ...prev,
                                  fromSocietyId: c.spilloverStatus === 'Surplus Capacity' ? c.id : prev.fromSocietyId,
                                  toSocietyId: c.spilloverStatus === 'Overloaded' ? c.id : prev.toSocietyId,
                                }));
                                setShowSpilloverModal(true);
                              }}
                            >
                              Dispatch Router ↗
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUB-TAB 3: SHARED EQUIPMENT BANK */}
                {federationSubTab === 'equipment' && (
                  <div className="card table-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Central Federation Heavy Equipment Registry</h3>
                        <small className="text-muted">Capital-intensive machinery shared across cooperative units on-demand</small>
                      </div>
                      <button
                        type="button"
                        className="btn"
                        style={{ padding: '0.45rem 1rem', background: 'var(--ink)', color: '#fff', fontSize: '0.82rem', fontWeight: 600, borderRadius: '8px' }}
                        onClick={() => setShowAddToolModal(true)}
                      >
                        + Register Equipment to Bank
                      </button>
                    </div>

                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Equipment Name</th>
                          <th>Tool Code</th>
                          <th>Category</th>
                          <th>Holding Cooperative</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {federationTools.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                              No shared machinery registered in the Federation Tool Bank.
                            </td>
                          </tr>
                        ) : (
                          federationTools.map((t) => (
                            <tr key={t.id}>
                              <td>
                                <strong>{t.name}</strong>
                              </td>
                              <td><code>{t.toolCode}</code></td>
                              <td>{t.category}</td>
                              <td>
                                🏛️ <strong>{t.societyName}</strong>
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    t.status === 'Available'
                                      ? 'badge-verified'
                                      : t.status === 'In Use'
                                      ? 'badge-ongoing'
                                      : 'badge-req'
                                  }`}
                                >
                                  ● {t.status}
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="btn btn-outline"
                                  style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                                  onClick={() => {
                                    setToolTransferTarget({ toolId: t.id, toolName: t.name });
                                    setTransferSocietyId(cooperatives[0]?.id || '');
                                  }}
                                >
                                  Transfer Tool ↗
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* SUB-TAB 4: MUTUAL AID & WELFARE POOL */}
                {federationSubTab === 'welfare' && (
                  <div className="card table-container">
                    <div style={{ marginBottom: '1.25rem' }}>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>Federation Mutual Welfare &amp; Capital Solvency Pool</h3>
                      <small className="text-muted">Consolidated statutory social protection fund backed by enforced 5% booking allocation</small>
                    </div>

                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Cooperative Society</th>
                          <th>Location</th>
                          <th>Active Artisans</th>
                          <th>Welfare Capital Balance</th>
                          <th>Monthly Run-Rate</th>
                          <th>Compliance Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cooperatives.map((c) => (
                          <tr key={c.id}>
                            <td><strong>{c.name}</strong></td>
                            <td>{c.district}, {c.state}</td>
                            <td><strong>{c.members}</strong> members</td>
                            <td><strong style={{ color: 'var(--green)' }}>{formatCurrency(c.welfareBalance)}</strong></td>
                            <td>₹ {c.monthlyRevenue.toLocaleString('en-IN')}/mo</td>
                            <td>
                              <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                                ✓ 100% Solvency Compliant
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* 8. AUDIT TRAIL VIEW */}
          {activeTab === 'view-audit' && (
            <div className="admin-view active">
              <div className="card-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h1 className="page-title" style={{ margin: 0 }}>Administrative &amp; Statutory Audit Trail</h1>
                  <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                    Immutable compliance records logged in Supabase PostgreSQL (Section 12 Governance Compliance)
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="badge badge-verified" style={{ padding: '6px 12px' }}>
                    🔒 PostgreSQL Immutable Audit Trail
                  </span>
                </div>
              </div>

              <div className="card table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Admin</th>
                      <th>Target Type</th>
                      <th>Target Identifier</th>
                      <th>Action Executed</th>
                      <th>Statutory Justification / Audit Note</th>
                      <th>Audit Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                          No administrative actions recorded yet. Perform any disciplinary removal, cooperative suspension, booking status change, or batch payout settlement to generate live audit logs.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td style={{ fontSize: '0.78rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                            {new Date(log.created_at).toLocaleString('en-IN', {
                              month: 'short',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td>
                            <strong>{log.admin_email}</strong>
                          </td>
                          <td>
                            <span className="badge badge-ongoing" style={{ textTransform: 'capitalize' }}>
                              {log.target_type}
                            </span>
                          </td>
                          <td>
                            <code>{log.target_id}</code>
                          </td>
                          <td>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                color:
                                  log.action.includes('remove') || log.action.includes('suspend')
                                    ? 'var(--red)'
                                    : log.action.includes('settle')
                                    ? 'var(--green)'
                                    : 'var(--violet)',
                                textTransform: 'uppercase',
                              }}
                            >
                              {log.action.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.82rem' }}>{log.reason}</td>
                          <td>
                            <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>
                              ✓ Recorded in DB
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 9. VIEW: HELP & SUPPORT QUERIES ================= */}
          {activeTab === 'view-support' && (
            <div className="admin-view active">
              <div className="view-header">
                <div>
                  <h2 className="view-title font-serif">💬 Help &amp; Support Grievances</h2>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                    Live incoming queries submitted by customers, workers, and cooperative societies via the landing support desk.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={fetchAllData}
                    className="btn btn-outline"
                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
                  >
                    ↻ Refresh Tickets
                  </button>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  margin: '1rem 0 1.25rem 0',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(['ALL', 'OPEN', 'RESOLVED'] as const).map((filter) => {
                    const count =
                      filter === 'ALL'
                        ? supportTickets.length
                        : filter === 'OPEN'
                        ? supportTickets.filter((t) => t.status !== 'Resolved').length
                        : supportTickets.filter((t) => t.status === 'Resolved').length;

                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setSupportFilter(filter)}
                        className={`btn ${supportFilter === filter ? 'btn-dark' : 'btn-outline'}`}
                        style={{
                          fontSize: '0.78rem',
                          padding: '0.4rem 0.85rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>{filter === 'ALL' ? 'All Tickets' : filter === 'OPEN' ? 'Pending Review' : 'Resolved'}</span>
                        <span
                          style={{
                            background: supportFilter === filter ? '#e6aa3b' : '#eee',
                            color: supportFilter === filter ? '#24172f' : '#555',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '10px',
                          }}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ position: 'relative', minWidth: '260px', flex: 1, maxWidth: '400px' }}>
                  <input
                    type="text"
                    placeholder="Search queries by name, email, subject, ticket ID..."
                    value={supportSearch}
                    onChange={(e) => setSupportSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Tickets Table */}
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Submitted By</th>
                      <th>Role</th>
                      <th>Subject / Category</th>
                      <th>Message Preview</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const filtered = supportTickets.filter((t) => {
                        const matchFilter =
                          supportFilter === 'ALL'
                            ? true
                            : supportFilter === 'OPEN'
                            ? t.status !== 'Resolved'
                            : t.status === 'Resolved';

                        const q = supportSearch.toLowerCase().trim();
                        const matchSearch =
                          !q ||
                          t.id.toLowerCase().includes(q) ||
                          t.name.toLowerCase().includes(q) ||
                          t.email.toLowerCase().includes(q) ||
                          t.subject.toLowerCase().includes(q) ||
                          t.message.toLowerCase().includes(q);

                        return matchFilter && matchSearch;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                              No support queries found matching this filter.
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>
                            <strong><code>#{ticket.id}</code></strong>
                            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '2px' }}>
                              {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>
                          <td>
                            <strong>{ticket.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                              {ticket.email || ticket.phone || 'No direct contact'}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                ticket.role === 'Customer'
                                  ? 'badge-ongoing'
                                  : ticket.role === 'Worker'
                                  ? 'badge-pending'
                                  : 'badge-success'
                              }`}
                              style={{ fontSize: '0.72rem' }}
                            >
                              {ticket.role}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--ink)' }}>
                              {ticket.subject}
                            </span>
                            {ticket.bookingId && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--terracotta, #d96f4d)' }}>
                                Booking: {ticket.bookingId}
                              </div>
                            )}
                          </td>
                          <td style={{ maxWidth: '300px' }}>
                            <p
                              style={{
                                margin: 0,
                                fontSize: '0.82rem',
                                color: 'var(--text)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {ticket.message}
                            </p>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                ticket.status === 'Resolved' ? 'badge-success' : 'badge-pending'
                              }`}
                              style={{ fontSize: '0.72rem' }}
                            >
                              {ticket.status === 'Resolved' ? '✓ Resolved' : 'Pending Review'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedTicket(ticket)}
                                className="btn btn-outline"
                                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                              >
                                View Details
                              </button>
                              {ticket.status !== 'Resolved' && (
                                <button
                                  type="button"
                                  disabled={isResolving}
                                  onClick={() => handleResolveSupportTicket(ticket.id)}
                                  className="btn btn-dark"
                                  style={{
                                    fontSize: '0.75rem',
                                    padding: '0.3rem 0.65rem',
                                    background: 'var(--green)',
                                    borderColor: 'var(--green)',
                                    color: '#fff',
                                  }}
                                >
                                  ✓ Resolve
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ));
                    })()}
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

      {/* Payout Batch Settlement Modal */}
      {showSettleModal && (
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
              maxWidth: '500px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '2.8rem', marginBottom: '0.25rem' }}>⚡</div>
              <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.45rem', margin: '0 0 0.25rem 0', color: 'var(--ink)' }}>
                Direct Cooperative NEFT Batch Settlement
              </h2>
              <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>
                Disburse verified escrow funds directly to labour cooperative federation accounts via RBI NEFT.
              </p>
            </div>

            <div style={{ background: '#fbf7ef', border: '1px solid var(--gold-soft)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                <span className="text-muted">Total Escrow Volume to Release:</span>
                <strong style={{ fontSize: '1.15rem', color: 'var(--green)' }}>₹ 14,250</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                <span className="text-muted">Worker Direct Wages (85%):</span>
                <strong className="text-terracotta">₹ 12,112</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                <span className="text-muted">Cooperative Welfare Reserve (5%):</span>
                <strong className="text-violet">₹ 713</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span className="text-muted">Platform Operational Surcharge (10%):</span>
                <strong className="text-green">₹ 1,425</strong>
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              <strong>Credited Labour Societies:</strong>
              <ul style={{ margin: '4px 0 0 1.2rem', padding: 0 }}>
                <li>Patna District Labour Society (PDLS-BR-01)</li>
                <li>Pune Gig Workers Cooperative (PGWC-MH-12)</li>
              </ul>
              <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--ink)' }}>
                🏛️ <em>Compliant with State Cooperative Societies Bylaws and RBI Escrow Mandate.</em>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <button
                type="button"
                disabled={isSettling}
                className="btn btn-outline"
                style={{ flex: 1, padding: '0.65rem' }}
                onClick={() => setShowSettleModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSettling}
                className="btn btn-dark"
                style={{
                  flex: 1.4,
                  padding: '0.65rem',
                  background: 'var(--green)',
                  color: '#fff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
                onClick={async () => {
                  await handleExecuteSettlePayouts();
                  setShowSettleModal(false);
                }}
              >
                {isSettling ? (
                  <>
                    <span className="spin">↻</span> Transferring NEFT...
                  </>
                ) : (
                  '⚡ Confirm & Disburse Batch'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Settlement Receipt Modal */}
      {settleReceipt && (
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
            zIndex: 10001,
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
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ width: '56px', height: '56px', background: 'var(--mint)', color: 'var(--green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', margin: '0 auto 12px' }}>
              ✓
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.4rem', margin: '0 0 6px 0', color: 'var(--ink)' }}>
              NEFT Batch Settlement Completed
            </h2>
            <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0 0 1.25rem 0' }}>
              Escrow funds released and successfully credited to cooperative society bank accounts.
            </p>

            <div style={{ background: '#f8f7fa', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', textAlign: 'left', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="text-muted">Batch Reference ID:</span>
                <strong><code>{settleReceipt.batchId}</code></strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="text-muted">Total Disbursed:</span>
                <strong style={{ color: 'var(--green)' }}>₹ {settleReceipt.amount.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className="text-muted">Clearing Timestamp:</span>
                <span>{settleReceipt.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Supabase Audit Status:</span>
                <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>Permanent Logged</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-dark"
              style={{ width: '100%', padding: '0.75rem' }}
              onClick={() => setSettleReceipt(null)}
            >
              Done &amp; Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* Support Ticket Details Modal */}
      {selectedTicket && (
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
            zIndex: 10002,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="admin-modal-content"
            style={{
              background: '#fff',
              borderRadius: '18px',
              maxWidth: '540px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-ongoing" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  Ticket #{selectedTicket.id}
                </span>
                <h2 style={{ fontFamily: 'var(--display)', fontSize: '1.35rem', margin: '0.35rem 0 0 0', color: 'var(--ink)' }}>
                  {selectedTicket.subject}
                </h2>
              </div>
              <span
                className={`badge ${selectedTicket.status === 'Resolved' ? 'badge-success' : 'badge-pending'}`}
                style={{ fontSize: '0.72rem' }}
              >
                {selectedTicket.status === 'Resolved' ? '✓ Resolved' : 'Pending Review'}
              </span>
            </div>

            {/* Sender details */}
            <div style={{ background: '#f8f7fa', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="text-muted">Submitted By:</span>
                <strong>{selectedTicket.name} ({selectedTicket.role})</strong>
              </div>
              {selectedTicket.email && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span className="text-muted">Email:</span>
                  <span>{selectedTicket.email}</span>
                </div>
              )}
              {selectedTicket.phone && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span className="text-muted">Phone:</span>
                  <span>{selectedTicket.phone}</span>
                </div>
              )}
              {selectedTicket.bookingId && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span className="text-muted">Related Booking:</span>
                  <strong style={{ color: 'var(--terracotta, #d96f4d)' }}>{selectedTicket.bookingId}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted">Submitted At:</span>
                <span>{new Date(selectedTicket.createdAt).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Message Body */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Query / Grievance Details
              </label>
              <div
                style={{
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '1rem',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  color: 'var(--text)',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selectedTicket.message}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '0.6rem 1.25rem' }}
                onClick={() => setSelectedTicket(null)}
              >
                Close
              </button>
              {selectedTicket.status !== 'Resolved' && (
                <button
                  type="button"
                  disabled={isResolving}
                  className="btn btn-dark"
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: 'var(--green)',
                    borderColor: 'var(--green)',
                    color: '#fff',
                  }}
                  onClick={async () => {
                    await handleResolveSupportTicket(selectedTicket.id);
                  }}
                >
                  {isResolving ? 'Resolving...' : '✓ Mark as Resolved'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          FEDERATION MODAL 1: REGISTER COOPERATIVE SOCIETY
         ========================================================= */}
      {showRegisterCoopModal && (
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
            zIndex: 10001,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="admin-modal-content"
            style={{
              background: '#fff',
              borderRadius: '18px',
              maxWidth: '540px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--ink)' }}>
                  🏛️ Accredit New Cooperative Society
                </h2>
                <small className="text-muted">Direct database entry under Multi-State Cooperative Societies Act</small>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterCoopModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleRegisterCoop}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                    Society Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bhopal Artisan Welfare Society"
                    value={newCoopForm.name}
                    onChange={(e) => setNewCoopForm({ ...newCoopForm, name: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                    Statutory Reg. Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BAWS-MP-2026"
                    value={newCoopForm.registration_number}
                    onChange={(e) => setNewCoopForm({ ...newCoopForm, registration_number: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                    District *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bhopal"
                    value={newCoopForm.district}
                    onChange={(e) => setNewCoopForm({ ...newCoopForm, district: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Madhya Pradesh"
                    value={newCoopForm.state}
                    onChange={(e) => setNewCoopForm({ ...newCoopForm, state: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                    Initial Registered Members
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newCoopForm.member_count}
                    onChange={(e) => setNewCoopForm({ ...newCoopForm, member_count: Number(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                    Initial Welfare Fund (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={newCoopForm.welfare_fund_balance}
                    onChange={(e) => setNewCoopForm({ ...newCoopForm, welfare_fund_balance: Number(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                    Projected Monthly Rev (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={newCoopForm.monthly_revenue}
                    onChange={(e) => setNewCoopForm({ ...newCoopForm, monthly_revenue: Number(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '0.6rem 1.25rem' }}
                  onClick={() => setShowRegisterCoopModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRegisteringCoop}
                  className="btn"
                  style={{ padding: '0.6rem 1.5rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700 }}
                >
                  {isRegisteringCoop ? 'Registering...' : '✓ Accredit & Save to DB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          FEDERATION MODAL 2: MOBILIZE SPILLOVER DISPATCH
         ========================================================= */}
      {showSpilloverModal && (
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
            zIndex: 10001,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="admin-modal-content"
            style={{
              background: '#fff',
              borderRadius: '18px',
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--ink)' }}>
                  ⚡ Mobilize Inter-District Spillover
                </h2>
                <small className="text-muted">Route surge capacity between affiliated societies with audit logging</small>
              </div>
              <button
                type="button"
                onClick={() => setShowSpilloverModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleDispatchSpillover}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                    Source Society (Surplus Labor Pool) *
                  </label>
                  <select
                    required
                    value={spilloverForm.fromSocietyId}
                    onChange={(e) => setSpilloverForm({ ...spilloverForm, fromSocietyId: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}
                  >
                    <option value="">-- Select Source Cooperative Society --</option>
                    {cooperatives.map((c) => (
                      <option key={`src-${c.id}`} value={c.id}>
                        {c.name} ({c.district}) — {c.members} members [{c.spilloverStatus}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                    Destination Society (Surge / High Demand) *
                  </label>
                  <select
                    required
                    value={spilloverForm.toSocietyId}
                    onChange={(e) => setSpilloverForm({ ...spilloverForm, toSocietyId: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}
                  >
                    <option value="">-- Select Destination Society --</option>
                    {cooperatives.map((c) => (
                      <option key={`dst-${c.id}`} value={c.id}>
                        {c.name} ({c.district}) — {c.activeBookingsCount} active bookings
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                      Mobilized Artisans Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={spilloverForm.workerCount}
                      onChange={(e) => setSpilloverForm({ ...spilloverForm, workerCount: Number(e.target.value) || 1 })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                      Trade Specialty
                    </label>
                    <select
                      value={spilloverForm.trade}
                      onChange={(e) => setSpilloverForm({ ...spilloverForm, trade: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}
                    >
                      <option value="Electrician & Wiremen">Electrician & Wiremen</option>
                      <option value="Plumber & Sanitization">Plumber & Sanitization</option>
                      <option value="Carpenter & Joinery">Carpenter & Joinery</option>
                      <option value="Painter & Surface Finishing">Painter & Surface Finishing</option>
                      <option value="Mason & Construction">Mason & Construction</option>
                      <option value="Multi-Skill Emergency Squad">Multi-Skill Emergency Squad</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                    Justification / Operational Note *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={spilloverForm.reason}
                    onChange={(e) => setSpilloverForm({ ...spilloverForm, reason: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '0.6rem 1.25rem' }}
                  onClick={() => setShowSpilloverModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDispatchingSpillover}
                  className="btn"
                  style={{ padding: '0.6rem 1.5rem', background: 'linear-gradient(135deg, #e6aa3b 0%, #d96f4d 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700 }}
                >
                  {isDispatchingSpillover ? 'Mobilizing...' : '⚡ Confirm Dispatch & Log Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          FEDERATION MODAL 3: REGISTER EQUIPMENT TO TOOL BANK
         ========================================================= */}
      {showAddToolModal && (
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
            zIndex: 10001,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            className="admin-modal-content"
            style={{
              background: '#fff',
              borderRadius: '18px',
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--ink)' }}>
                  🛠️ Register Shared Equipment
                </h2>
                <small className="text-muted">Add machinery to Federation Capital Asset Bank</small>
              </div>
              <button
                type="button"
                onClick={() => setShowAddToolModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddTool}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                    Equipment Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rotary Core Drill 1200W"
                    value={newToolForm.name}
                    onChange={(e) => setNewToolForm({ ...newToolForm, name: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                      Tool Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. TB-008"
                      value={newToolForm.toolCode}
                      onChange={(e) => setNewToolForm({ ...newToolForm, toolCode: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                      Category
                    </label>
                    <select
                      value={newToolForm.category}
                      onChange={(e) => setNewToolForm({ ...newToolForm, category: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}
                    >
                      <option value="Heavy Equipment">Heavy Equipment</option>
                      <option value="Scaffolding">Scaffolding & Access</option>
                      <option value="Precision Measuring">Precision Measuring</option>
                      <option value="Diagnostics">Diagnostics & Thermal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                    Assigned Holding Cooperative *
                  </label>
                  <select
                    required
                    value={newToolForm.societyId}
                    onChange={(e) => setNewToolForm({ ...newToolForm, societyId: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}
                  >
                    <option value="">-- Select Cooperative Society --</option>
                    {cooperatives.map((c) => (
                      <option key={`tool-soc-${c.id}`} value={c.id}>
                        {c.name} ({c.district})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '0.6rem 1.25rem' }}
                  onClick={() => setShowAddToolModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingTool}
                  className="btn"
                  style={{ padding: '0.6rem 1.5rem', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700 }}
                >
                  {isAddingTool ? 'Saving...' : '✓ Add Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          FEDERATION MODAL 4: TRANSFER / REASSIGN EQUIPMENT
         ========================================================= */}
      {toolTransferTarget && (
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
            zIndex: 10001,
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
            }}
          >
            <h2 style={{ fontSize: '1.25rem', margin: '0 0 6px 0', color: 'var(--ink)' }}>
              Reassign Shared Equipment
            </h2>
            <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0 0 1.25rem 0' }}>
              Transferring <strong>{toolTransferTarget.toolName}</strong> to another federated cooperative society.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '6px' }}>
                Select Receiving Cooperative Society
              </label>
              <select
                value={transferSocietyId}
                onChange={(e) => setTransferSocietyId(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.88rem' }}
              >
                {cooperatives.map((c) => (
                  <option key={`xfer-${c.id}`} value={c.id}>
                    {c.name} ({c.district}, {c.state})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '0.6rem 1.25rem' }}
                onClick={() => setToolTransferTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isTransferringTool || !transferSocietyId}
                className="btn"
                style={{ padding: '0.6rem 1.5rem', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700 }}
                onClick={handleTransferTool}
              >
                {isTransferringTool ? 'Transferring...' : '✓ Confirm Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}

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
