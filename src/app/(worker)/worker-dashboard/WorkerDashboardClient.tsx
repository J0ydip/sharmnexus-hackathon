'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { updateWorkerAvailability } from '@/app/actions/workers';
import { updateBookingStatus, getWorkerDashboardData, rejectJobRequest } from '@/app/actions/worker-jobs';
import { getBookingOtp } from '@/lib/utils';
import { useBookingStore } from '@/lib/store/bookingStore';
import { createClient } from '@/lib/supabase/client';
import './worker.css';



type WorkerView =
  | 'view-dashboard'
  | 'view-requests'
  | 'view-jobs'
  | 'view-earnings'
  | 'view-reviews'
  | 'view-notifications'
  | 'view-profile'
  | 'view-verification';

type Lang = 'en' | 'hi' | 'bn' | 'mr' | 'ta' | 'te';

interface JobRequest {
  id: string;
  name: string;
  service: string;
  date: string;
  price: string;
  dist: string;
  desc: string;
  address?: string;
  otp?: string;
}

interface ActiveJob {
  id: string;
  name: string;
  service: string;
  date: string;
  price: string;
  address: string;
  status: string;
  otp?: string;
}

interface CompletedJob {
  id: string;
  name: string;
  service: string;
  date: string;
  price: string;
  amount?: number;
  workerPayout?: number;
  paymentStatus?: 'paid' | 'pending';
  paymentMethod?: string;
}

interface WorkerReview {
  id: string;
  customerName: string;
  service: string;
  score: number;
  review: string;
  date: string;
}

const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  en: {
    nav_dash: '🏠 Dashboard',
    nav_req: '📋 Job Requests',
    nav_jobs: '🔧 My Jobs',
    nav_earn: '💰 Earnings',
    nav_rev: '⭐ Reviews',
    nav_notif: '🔔 Notifications',
    nav_prof: '👤 My Profile',
    nav_verif: '✅ Verification',
    nav_logout: '🚪 Logout',
    avail_online: '🟢 Available for Work',
    avail_offline: '🔴 Not Available',
  },
  hi: {
    nav_dash: '🏠 डैशबोर्ड',
    nav_req: '📋 कार्य अनुरोध',
    nav_jobs: '🔧 मेरे कार्य',
    nav_earn: '💰 कमाई',
    nav_rev: '⭐ समीक्षाएं',
    nav_notif: '🔔 सूचनाएं',
    nav_prof: '👤 मेरी प्रोफ़ाइल',
    nav_verif: '✅ सत्यापन',
    nav_logout: '🚪 लॉग आउट',
    avail_online: '🟢 काम के लिए उपलब्ध',
    avail_offline: '🔴 उपलब्ध नहीं',
  },
  bn: {
    nav_dash: '🏠 ড্যাশবোর্ড',
    nav_req: '📋 কাজের অনুরোধ',
    nav_jobs: '🔧 আমার কাজ',
    nav_earn: '💰 উপার্জন',
    nav_rev: '⭐ রিভিউ',
    nav_notif: '🔔 বিজ্ঞপ্তি',
    nav_prof: '👤 আমার প্রোফাইল',
    nav_verif: '✅ যাচাইকরণ',
    nav_logout: '🚪 লগ আউট',
    avail_online: '🟢 কাজের জন্য উপলব্ধ',
    avail_offline: '🔴 উপলব্ধ নয়',
  },
  mr: {
    nav_dash: '🏠 डॅशबोर्ड',
    nav_req: '📋 नोकरीच्या विनंत्या',
    nav_jobs: '🔧 माझी कामे',
    nav_earn: '💰 कमाई',
    nav_rev: '⭐ पुनरावलोकने',
    nav_notif: '🔔 सूचना',
    nav_prof: '👤 माझी प्रोफाइल',
    nav_verif: '✅ पडताळणी',
    nav_logout: '🚪 लॉग आउट',
    avail_online: '🟢 कामासाठी उपलब्ध',
    avail_offline: '🔴 उपलब्ध नाही',
  },
  ta: {
    nav_dash: '🏠 டாஷ்போர்டு',
    nav_req: '📋 வேலை கோரிக்கைகள்',
    nav_jobs: '🔧 எனது வேலைகள்',
    nav_earn: '💰 வருமானம்',
    nav_rev: '⭐ விமர்சனங்கள்',
    nav_notif: '🔔 அறிவிப்புகள்',
    nav_prof: '👤 எனது சுயவிவரம்',
    nav_verif: '✅ சரிபார்ப்பு',
    nav_logout: '🚪 வெளியேறு',
    avail_online: '🟢 வேலைக்கு தயார்',
    avail_offline: '🔴 கிடைக்கவில்லை',
  },
  te: {
    nav_dash: '🏠 డాష్‌బోర్డ్',
    nav_req: '📋 ఉద్యోగ అభ్యర్థనలు',
    nav_jobs: '🔧 నా పనులు',
    nav_earn: '💰 ఆదాయం',
    nav_rev: '⭐ సమీక్షలు',
    nav_notif: '🔔 నోటిఫికేషన్‌లు',
    nav_prof: '👤 నా ప్రొఫైల్',
    nav_verif: '✅ ధృవీకరణ',
    nav_logout: '🚪 లాగ్ అవుట్',
    avail_online: '🟢 పనికి అందుబాటులో',
    avail_offline: '🔴 అందుబాటులో లేదు',
  },
};

export function WorkerDashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [activeView, setActiveView] = useState<WorkerView>('view-dashboard');
  const [lang, setLang] = useState<Lang>('en');
  const [isAvailable, setIsAvailable] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authenticated Worker state
  const [workerName, setWorkerName] = useState('Worker');
  const [workerPhone, setWorkerPhone] = useState('+91 98765 43210');
  const [workerSkill, setWorkerSkill] = useState('Trade Professional');
  const [workerExp, setWorkerExp] = useState('5');
  const [workerPrice, setWorkerPrice] = useState('350');
  const [workerLoc, setWorkerLoc] = useState('New Delhi');
  const [workerBio, setWorkerBio] = useState('Certified cooperative tradesperson dedicated to reliable community service.');
  const [workerSociety, setWorkerSociety] = useState('Labour Welfare Cooperative Society');
  const [workerLanguages, setWorkerLanguages] = useState('Hindi, English');

  // Job data - 100% Real Database Driven
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([]);
  const [workerReviews, setWorkerReviews] = useState<WorkerReview[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isAcceptingId, setIsAcceptingId] = useState<string | null>(null);
  const [isRejectingId, setIsRejectingId] = useState<string | null>(null);

  // Jobs tab state
  const [jobsTab, setJobsTab] = useState<'active' | 'pending' | 'completed'>('active');

  // Chat modal state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatCustomer, setChatCustomer] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'worker'; text: string }>>([
    { sender: 'user', text: 'Hello, are you available today?' },
    { sender: 'worker', text: 'Yes, I am available. I can reach your location with cooperative tools in 30 minutes.' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Complete Job & Settlement modal state
  const [completingJob, setCompletingJob] = useState<ActiveJob | null>(null);
  const [completionOtp, setCompletionOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [paymentMode, setPaymentMode] = useState<'online' | 'cash'>('online');
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);

  // Hydrate auth data if present in localStorage & Supabase
  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('shramnexus-auth') || localStorage.getItem('sharmnexus-auth') || '{}');
      if (auth && auth.name) {
        setWorkerName(auth.name);
      }
      if (auth && auth.phone) {
        setWorkerPhone(auth.phone);
      }
      if (auth && auth.skills && auth.skills[0]) {
        setWorkerSkill(auth.skills[0]);
      }
      if (auth && auth.location) {
        setWorkerLoc(auth.location);
      }
      const savedLang = (localStorage.getItem('shramnexus-lang') || localStorage.getItem('sharmnexus-lang') || 'en') as Lang;
      if (TRANSLATIONS[savedLang]) {
        setLang(savedLang);
      }
    } catch (e) {}

    // Verify worker access - strictly restrict customer accounts
    async function verifyWorkerAccess() {
      try {
        const localAuth = localStorage.getItem('shramnexus-auth') || localStorage.getItem('sharmnexus-auth');
        let currentRole = null;
        if (localAuth) {
          try {
            const parsed = JSON.parse(localAuth);
            currentRole = parsed.role;
          } catch (e) {}
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          currentRole = session.user.user_metadata?.user_type || currentRole;
        }

        if (currentRole === 'customer') {
          showToast('⚠️ Access restricted: Customer accounts cannot access the Worker Portal.');
          router.replace('/');
          return;
        }
      } catch (e) {}
    }
    verifyWorkerAccess();

    // Fetch live backend data directly from Supabase
    async function fetchDashboardData() {
      try {
        const res = await getWorkerDashboardData();
        if (!res) return;
        if (res.worker) {
          const w = res.worker as any;
          if (w.full_name) setWorkerName(w.full_name);
          if (w.phone) setWorkerPhone(w.phone);
          if (w.address) setWorkerLoc(w.address);
          if (w.is_available !== undefined) setIsAvailable(w.is_available);
          if (w.skills && w.skills.length > 0) {
            const firstSkill = w.skills[0];
            const cat = Array.isArray(firstSkill?.category) ? firstSkill.category[0] : firstSkill?.category;
            const skillTitle = cat?.name || firstSkill?.certification_name;
            if (skillTitle) setWorkerSkill(skillTitle);
            if (firstSkill?.years_experience) setWorkerExp(String(firstSkill.years_experience));
          }
          const soc = Array.isArray(w.society) ? w.society[0] : w.society;
          if (soc?.name) {
            setWorkerSociety(`${soc.name}${soc.district ? ` (${soc.district})` : ''}`);
          }
        }
        let rejectedIds: string[] = [];
        try {
          rejectedIds = JSON.parse(localStorage.getItem('shramnexus-rejected-requests') || '[]');
        } catch (e) {}
        const rejectedSet = new Set(rejectedIds);

        if (res.requests) {
          const liveRequests: JobRequest[] = res.requests
            .filter((r: any) => !rejectedSet.has(r.id) && r.status !== 'cancelled')
            .map((r: any) => ({
              id: r.id,
              name: r.customers?.full_name || 'Household Customer',
              phone: r.customers?.phone || '',
              service: r.service_categories?.name || 'General Maintenance',
              date: r.scheduled_at ? new Date(r.scheduled_at).toLocaleDateString() : 'Today',
              price: `₹ ${r.final_price || r.estimated_price || 400}`,
              dist: '1.2 km',
              desc: r.description || 'Verified job request through cooperative portal.',
              address: r.address || 'Address provided via dispatch',
              otp: getBookingOtp(r.id),
            }));
          setJobRequests(liveRequests);
        }
        if (res.activeJobs) {
          const liveActive: ActiveJob[] = res.activeJobs
            .filter((j: any) => !rejectedSet.has(j.id) && j.status !== 'cancelled')
            .map((j: any) => ({
              id: j.id,
              name: j.customers?.full_name || 'Customer',
              phone: j.customers?.phone || '',
              service: j.service_categories?.name || 'Cooperative Service',
              date: j.scheduled_at ? new Date(j.scheduled_at).toLocaleDateString() : 'Today',
              price: `₹ ${j.final_price || j.estimated_price || 400}`,
              address: j.address || 'Customer Location',
              status: j.status || 'accepted',
              otp: getBookingOtp(j.id),
            }));
          setActiveJobs(liveActive);
        }
        if (res.completedJobs) {
          const liveCompleted: CompletedJob[] = res.completedJobs.map((c: any) => {
            const rawPrice = c.final_price || c.estimated_price || 450;
            const pmts = c.payments || [];
            const completedPayment = pmts.find((p: any) => p.status === 'completed');
            const isPaid = Boolean(completedPayment);
            const payout = completedPayment?.worker_payout || Math.round(rawPrice * 0.85);
            const method = completedPayment?.method
              ? (completedPayment.method === 'cash' ? 'Cash in Hand' : `Online (${completedPayment.method.toUpperCase()})`)
              : 'Awaiting Settlement';

            return {
              id: c.id,
              name: c.customers?.full_name || 'Household Customer',
              service: c.service_categories?.name || 'Cooperative Service',
              date: c.completed_at ? new Date(c.completed_at).toLocaleDateString() : 'Recent',
              price: `₹ ${rawPrice}`,
              amount: rawPrice,
              workerPayout: payout,
              paymentStatus: isPaid ? 'paid' : 'pending',
              paymentMethod: method,
            };
          });
          setCompletedJobs(liveCompleted);
        }
        if (res.reviews) {
          const liveReviews: WorkerReview[] = res.reviews.map((r: any) => ({
            id: r.id,
            customerName: r.customer?.full_name || 'Verified Customer',
            service: r.booking?.service_categories?.name || 'Cooperative Service',
            score: r.score || 5,
            review: r.review || 'Service completed satisfactorily according to cooperative quality standards.',
            date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }) : 'Recent',
          }));
          setWorkerReviews(liveReviews);
        }
      } catch (err) {
        console.error('Error fetching worker dashboard data:', err);
      } finally {
        setIsLoadingJobs(false);
      }
    }

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 3000);

    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleLanguageChange = (newLang: Lang) => {
    setLang(newLang);
    try {
      localStorage.setItem('shramnexus-lang', newLang);
    } catch (e) {}
  };

  const handleAvailabilityToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.checked;
    setIsAvailable(newVal);
    try {
      const res = await updateWorkerAvailability(newVal);
      if (res?.error) {
        setIsAvailable(!newVal);
        showToast(`❌ Could not update availability: ${res.error}`);
        return;
      }
      showToast(newVal ? 'You are now Online & Available' : 'You are now Offline');
    } catch (err: any) {
      setIsAvailable(!newVal);
      showToast(`❌ Error: ${err?.message || 'Failed to update'}`);
    }
  };

  const handleAcceptRequest = async (id: string) => {
    setIsAcceptingId(id);
    try {
      await updateBookingStatus(id, 'accepted');
      try {
        useBookingStore.getState().updateBookingStatus(id, 'accepted');
      } catch (err) {}
      const found = jobRequests.find((r) => r.id === id);
      if (found) {
        setJobRequests((prev) => prev.filter((r) => r.id !== id));
        setActiveJobs((prev) => [
          {
            id: found.id,
            name: found.name,
            service: found.service,
            date: found.date,
            price: found.price,
            address: found.address || 'Address provided via cooperative dispatch',
            status: 'accepted',
            otp: found.otp,
          },
          ...prev.filter((j) => j.id !== id),
        ]);
      } else {
        setActiveJobs((prev) =>
          prev.map((j) => (j.id === id ? { ...j, status: 'accepted' } : j))
        );
      }
      showToast('✅ Job Accepted successfully! Confirmed appointment.');
    } catch (err: any) {
      console.error('Accept job error:', err);
      showToast(`❌ Could not accept job: ${err?.message || 'Server error'}`);
    } finally {
      setIsAcceptingId(null);
    }
  };

  const handleStartJob = async (id: string) => {
    try {
      await updateBookingStatus(id, 'in_progress');
      try {
        useBookingStore.getState().updateBookingStatus(id, 'in_progress');
      } catch (err) {}
      setActiveJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, status: 'in_progress' } : j))
      );
      showToast('🚗 You are now marked On the Way / Started!');
    } catch (err: any) {
      console.error('Start job error:', err);
      showToast(`❌ Could not update status: ${err?.message || 'Server error'}`);
    }
  };

  const handleRejectRequest = async (id: string) => {
    setIsRejectingId(id);
    // 1. Immediately remove from local state
    setJobRequests((prev) => prev.filter((r) => r.id !== id));
    setActiveJobs((prev) => prev.filter((j) => j.id !== id));

    // 2. Persist in localStorage so polling or refresh never restores it
    try {
      const stored: string[] = JSON.parse(localStorage.getItem('shramnexus-rejected-requests') || '[]');
      if (!stored.includes(id)) {
        stored.push(id);
        localStorage.setItem('shramnexus-rejected-requests', JSON.stringify(stored));
      }
    } catch (e) {}

    // 3. Update Zustand bookingStore
    try {
      useBookingStore.getState().updateBookingStatus(id, 'cancelled');
    } catch (err) {}

    // 4. Update Supabase backend
    try {
      await rejectJobRequest(id);
      showToast('❌ Job Request rejected.');
    } catch (err: any) {
      console.error('Error rejecting job request:', err);
      showToast('Job Request rejected.');
    } finally {
      setIsRejectingId(null);
    }
  };

  const handleInitiateCompleteJob = (job: ActiveJob) => {
    setCompletingJob(job);
    setCompletionOtp('');
    setOtpError(null);
    setCompletionNotes('Work completed as per household specifications and verified.');
  };

  const handleConfirmCompleteJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingJob) return;

    const trimmedOtp = completionOtp.trim();
    if (!trimmedOtp || trimmedOtp.length !== 4) {
      setOtpError('Please enter the 4-digit customer completion PIN.');
      showToast('⚠️ Please enter the 4-digit customer completion PIN.');
      return;
    }

    const expectedOtp = getBookingOtp(completingJob.id, completingJob.otp);
    if (trimmedOtp !== expectedOtp) {
      setOtpError(`Invalid PIN entered (${trimmedOtp}). Please enter the 4-digit code displayed on customer's tracking screen.`);
      showToast('❌ Incorrect PIN! Please check the customer\'s tracking screen.');
      return;
    }

    setOtpError(null);
    setIsSubmittingCompletion(true);
    const numPrice = parseInt(completingJob.price.replace(/[^0-9]/g, ''), 10) || 450;
    const workerEarning = Math.round(numPrice * 0.85);

    try {
      await updateBookingStatus(completingJob.id, 'completed');
      try {
        useBookingStore.getState().updateBookingStatus(completingJob.id, 'completed');
      } catch (err) {}

      setActiveJobs((prev) => prev.filter((j) => j.id !== completingJob.id));
      setCompletedJobs((prev) => [
        {
          id: completingJob.id,
          name: completingJob.name,
          service: completingJob.service,
          date: 'Just now',
          price: completingJob.price,
        },
        ...prev,
      ]);

      setCompletingJob(null);
      setJobsTab('completed');
      showToast(`🎉 Verified! Job completed. ₹${workerEarning} credited to your Cooperative Passbook.`);
    } catch (err: any) {
      console.error('Error completing job:', err);
      showToast(`❌ Could not complete job: ${err?.message || 'Database error'}`);
    } finally {
      setIsSubmittingCompletion(false);
    }
  };

  const handleOpenChat = (customerName: string) => {
    setChatCustomer(customerName);
    setChatOpen(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      setChatMessages((prev) => [...prev, { sender: 'worker', text: chatInput.trim() }]);
      setChatInput('');
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stored = JSON.parse(localStorage.getItem('shramnexus-auth') || localStorage.getItem('sharmnexus-auth') || '{}');
      stored.name = workerName;
      stored.phone = workerPhone;
      stored.skills = [workerSkill];
      localStorage.setItem('shramnexus-auth', JSON.stringify(stored));
      localStorage.removeItem('sharmnexus-auth');
    } catch (e) {}
    showToast('Cooperative Worker Profile Updated!');
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('shramnexus-auth');
      localStorage.removeItem('shramnexus-admin-auth');
      localStorage.removeItem('sharmnexus-auth');
      localStorage.removeItem('sharmnexus-admin-auth');
      sessionStorage.clear();
      document.cookie = 'admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error during worker logout:', err);
    }
    window.location.href = '/auth/login';
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS['en'];

  const paidCompletedJobs = completedJobs.filter((j) => j.paymentStatus === 'paid');
  const totalEarningsPaid = paidCompletedJobs.reduce(
    (acc, j) => acc + (j.workerPayout || Math.round((j.amount || 0) * 0.85)),
    0
  );
  const pendingEarnings = completedJobs
    .filter((j) => j.paymentStatus !== 'paid')
    .reduce((acc, j) => acc + (j.workerPayout || Math.round((j.amount || 0) * 0.85)), 0);
  const totalGrossPaid = paidCompletedJobs.reduce((acc, j) => acc + (j.amount || 0), 0);
  const welfareFund = Math.round(totalGrossPaid * 0.05);

  const averageRating = workerReviews.length > 0
    ? (workerReviews.reduce((acc, r) => acc + r.score, 0) / workerReviews.length).toFixed(1)
    : '4.8';
  const totalNotifs = workerReviews.length + paidCompletedJobs.length + jobRequests.length;

  return (
    <div className="worker-dashboard-container">
      {/* Sidebar */}
      <aside className={`worker-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="/logo.png" alt="Logo" className="sidebar-logo" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <h2>Shram<span>Nexus</span></h2>
        </div>
        <nav className="sidebar-nav">
          <button
            type="button"
            onClick={() => { setActiveView('view-dashboard'); setSidebarOpen(false); }}
            className={`nav-item ${activeView === 'view-dashboard' ? 'active' : ''}`}
          >
            <span>{t.nav_dash}</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('view-requests'); setSidebarOpen(false); }}
            className={`nav-item ${activeView === 'view-requests' ? 'active' : ''}`}
          >
            <span>{t.nav_req}</span>
            {jobRequests.length > 0 && <span className="badge">{jobRequests.length}</span>}
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('view-jobs'); setSidebarOpen(false); }}
            className={`nav-item ${activeView === 'view-jobs' ? 'active' : ''}`}
          >
            <span>{t.nav_jobs}</span>
            {activeJobs.length > 0 && <span className="badge" style={{ background: 'var(--mint)', color: 'var(--green)' }}>{activeJobs.length}</span>}
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('view-earnings'); setSidebarOpen(false); }}
            className={`nav-item ${activeView === 'view-earnings' ? 'active' : ''}`}
          >
            <span>{t.nav_earn}</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('view-reviews'); setSidebarOpen(false); }}
            className={`nav-item ${activeView === 'view-reviews' ? 'active' : ''}`}
          >
            <span>{t.nav_rev}</span>
            {workerReviews.length > 0 && <span className="badge" style={{ background: '#f59e0b', color: '#fff' }}>{workerReviews.length}</span>}
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('view-notifications'); setSidebarOpen(false); }}
            className={`nav-item ${activeView === 'view-notifications' ? 'active' : ''}`}
          >
            <span>{t.nav_notif}</span>
            {totalNotifs > 0 && <span className="badge" style={{ background: '#3b82f6', color: '#fff' }}>{totalNotifs}</span>}
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('view-profile'); setSidebarOpen(false); }}
            className={`nav-item ${activeView === 'view-profile' ? 'active' : ''}`}
          >
            <span>{t.nav_prof}</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('view-verification'); setSidebarOpen(false); }}
            className={`nav-item ${activeView === 'view-verification' ? 'active' : ''}`}
          >
            <span>{t.nav_verif}</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="nav-item text-red"
            style={{ marginTop: 'auto' }}
          >
            <span>{t.nav_logout}</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="worker-main-content">
        {/* Topbar */}
        <header className="worker-topbar">
          <button
            type="button"
            className="worker-mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <div className="worker-topbar-right">
            {/* Authenticated Worker Profile Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#b85435', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>
                {workerName ? workerName.charAt(0).toUpperCase() : 'W'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
                  {workerName}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  {workerSkill.split('&')[0].trim()}
                </span>
              </div>
            </div>

            {/* Language Selector */}
            <select
              value={lang}
              onChange={(e) => handleLanguageChange(e.target.value as Lang)}
              className="worker-lang-select"
              aria-label="Select language"
            >
              <option value="en">English (EN)</option>
              <option value="hi">हिंदी (HI)</option>
              <option value="bn">বাংলা (BN)</option>
              <option value="mr">मराठी (MR)</option>
              <option value="ta">தமிழ் (TA)</option>
              <option value="te">తెలుగు (TE)</option>
            </select>

            {/* Availability switch */}
            <div className="worker-availability-toggle">
              <span className={isAvailable ? 'worker-status-active' : 'worker-status-inactive'}>
                {isAvailable ? t.avail_online : t.avail_offline}
              </span>
              <label className="worker-switch">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={handleAvailabilityToggle}
                />
                <span className="worker-slider" />
              </label>
            </div>

            <div className="worker-topbar-user">
              <div className="worker-user-avatar">
                {workerName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* ================= 1. VIEW: DASHBOARD ================= */}
        {activeView === 'view-dashboard' && (
          <div className="worker-dashboard-view active">
            <div className="worker-welcome-banner">
              <div>
                <h1>Welcome back, {workerName.split(' ')[0]}!</h1>
                <p className="text-muted">Here is your live cooperative dispatch and earnings status for today.</p>
                <span className="text-xs font-bold text-gray-500 mt-1 inline-block">
                  🏛️ Member of: <strong>{workerSociety}</strong>
                </span>
              </div>
              <div className="worker-verification-badge verified">
                ✓ Cooperative Certified
              </div>
            </div>

            <div className="worker-stats-grid">
              <div className="worker-stat-card">
                <h3>Customer Rating</h3>
                <div className="worker-stat-val">★ {averageRating}</div>
              </div>
              <div className="worker-stat-card">
                <h3>Completed Jobs</h3>
                <div className="worker-stat-val">
                  {completedJobs.length}
                </div>
              </div>
              <div className="worker-stat-card">
                <h3>Earnings Received (85%)</h3>
                <div className="worker-stat-val text-green">₹ {totalEarningsPaid.toLocaleString()}</div>
              </div>
            </div>

            <h2 className="worker-page-title mt-4" style={{ fontSize: '1.4rem' }}>
              Recent Incoming Requests
            </h2>
            <div className="worker-requests-grid mt-2">
              {isLoadingJobs && jobRequests.length === 0 ? (
                <p className="text-muted">Connecting to cooperative dispatch network...</p>
              ) : jobRequests.length === 0 ? (
                <p className="text-muted">No pending job requests right now. You are ready to accept new work.</p>
              ) : (
                jobRequests.map((req, idx) => (
                  <div key={`${req.id}-${idx}`} className="worker-req-card">
                    <div className="worker-req-head">
                      <div>
                        <h3>{req.service}</h3>
                        <span>{req.name} • ⌖ {req.dist}</span>
                      </div>
                      <span className="badge">{req.date}</span>
                    </div>
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>{req.desc}</p>
                    <div className="worker-req-price">{req.price}</div>
                    <div className="worker-req-actions">
                      <button
                        type="button"
                        className="worker-btn worker-btn-outline"
                        disabled={isRejectingId === req.id || isAcceptingId === req.id}
                        onClick={() => handleRejectRequest(req.id)}
                      >
                        {isRejectingId === req.id ? 'Rejecting...' : 'Reject'}
                      </button>
                      <button
                        type="button"
                        className="worker-btn worker-btn-gold"
                        disabled={isAcceptingId === req.id}
                        onClick={() => handleAcceptRequest(req.id)}
                      >
                        {isAcceptingId === req.id ? 'Accepting...' : 'Accept Job'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {activeJobs.length > 0 && (
              <>
                <h2 className="worker-page-title mt-6" style={{ fontSize: '1.4rem' }}>
                  Current Active Jobs ({activeJobs.length})
                </h2>
                <div className="worker-requests-grid mt-2">
                  {activeJobs.map((job, idx) => (
                    <div key={`dash-${job.id}-${idx}`} className="worker-req-card">
                      <div className="worker-req-head">
                        <div>
                          <h3>{job.service}</h3>
                          <span>{job.name}</span>
                        </div>
                        <span
                          className="badge"
                          style={{
                            background:
                              job.status === 'in_progress'
                                ? '#fef3c7'
                                : job.status === 'accepted'
                                ? '#e0f2fe'
                                : 'var(--mint)',
                            color:
                              job.status === 'in_progress'
                                ? '#b45309'
                                : job.status === 'accepted'
                                ? '#0369a1'
                                : 'var(--green)',
                          }}
                        >
                          {job.status === 'in_progress'
                            ? '🚗 On the Way / Started'
                            : job.status === 'accepted'
                            ? '✓ Accepted'
                            : '📋 Assigned'}
                        </span>
                      </div>
                      <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                        📍 {job.address}<br />📅 {job.date}
                      </p>
                      <div className="worker-req-price">{job.price}</div>
                      <div className="worker-req-actions">
                        <button
                          type="button"
                          className="worker-btn worker-btn-outline"
                          onClick={() => handleOpenChat(job.name)}
                        >
                          Message
                        </button>
                        {job.status === 'assigned' && (
                          <button
                            type="button"
                            className="worker-btn worker-btn-gold"
                            onClick={() => handleAcceptRequest(job.id)}
                          >
                            Accept Job
                          </button>
                        )}
                        {job.status === 'accepted' && (
                          <button
                            type="button"
                            className="worker-btn"
                            style={{ background: '#2563eb', color: '#ffffff', borderColor: '#2563eb' }}
                            onClick={() => handleStartJob(job.id)}
                          >
                            On the Way / Start
                          </button>
                        )}
                        {job.status === 'in_progress' && (
                          <button
                            type="button"
                            className="worker-btn worker-btn-dark"
                            onClick={() => handleInitiateCompleteJob(job)}
                          >
                            Complete (Enter PIN)
                          </button>
                        )}
                        {(!job.status || (job.status !== 'assigned' && job.status !== 'accepted' && job.status !== 'in_progress')) && (
                          <button
                            type="button"
                            className="worker-btn worker-btn-dark"
                            onClick={() => handleInitiateCompleteJob(job)}
                          >
                            Complete Job
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ================= 2. VIEW: JOB REQUESTS ================= */}
        {activeView === 'view-requests' && (
          <div className="worker-dashboard-view active">
            <h1 className="worker-page-title">Incoming Job Requests</h1>
            <p className="worker-page-subtitle">Review, accept, and schedule requests from your district cooperative cluster.</p>
            <div className="worker-requests-grid mt-4">
              {isLoadingJobs && jobRequests.length === 0 ? (
                <p className="text-muted">Loading incoming job requests from cooperative dispatch...</p>
              ) : jobRequests.length === 0 ? (
                <p className="text-muted">No new requests at the moment.</p>
              ) : (
                jobRequests.map((req, idx) => (
                  <div key={`${req.id}-${idx}`} className="worker-req-card">
                    <div className="worker-req-head">
                      <div>
                        <h3>{req.service}</h3>
                        <span>{req.name} • ⌖ {req.dist}</span>
                      </div>
                      <span className="badge">{req.date}</span>
                    </div>
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>{req.desc}</p>
                    <div className="worker-req-price">{req.price}</div>
                    <div className="worker-req-actions">
                      <button
                        type="button"
                        className="worker-btn worker-btn-outline"
                        disabled={isRejectingId === req.id || isAcceptingId === req.id}
                        onClick={() => handleRejectRequest(req.id)}
                      >
                        {isRejectingId === req.id ? 'Rejecting...' : 'Reject'}
                      </button>
                      <button
                        type="button"
                        className="worker-btn worker-btn-gold"
                        disabled={isAcceptingId === req.id}
                        onClick={() => handleAcceptRequest(req.id)}
                      >
                        {isAcceptingId === req.id ? 'Accepting...' : 'Accept Job'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= 3. VIEW: MY JOBS ================= */}
        {activeView === 'view-jobs' && (
          <div className="worker-dashboard-view active">
            <h1 className="worker-page-title">My Jobs</h1>
            <div className="worker-tabs mt-4">
              <button
                type="button"
                className={`worker-tab-btn ${jobsTab === 'active' ? 'active' : ''}`}
                onClick={() => setJobsTab('active')}
              >
                Active ({activeJobs.length})
              </button>
              <button
                type="button"
                className={`worker-tab-btn ${jobsTab === 'pending' ? 'active' : ''}`}
                onClick={() => setJobsTab('pending')}
              >
                Pending ({jobRequests.length})
              </button>
              <button
                type="button"
                className={`worker-tab-btn ${jobsTab === 'completed' ? 'active' : ''}`}
                onClick={() => setJobsTab('completed')}
              >
                Completed ({completedJobs.length})
              </button>
            </div>

            {jobsTab === 'active' && (
              <div className="worker-requests-grid">
                {activeJobs.length === 0 ? (
                  <p className="text-muted">You have no active jobs in progress.</p>
                ) : (
                  activeJobs.map((job, idx) => (
                    <div key={`${job.id}-${idx}`} className="worker-req-card">
                      <div className="worker-req-head">
                        <div>
                          <h3>{job.service}</h3>
                          <span>{job.name}</span>
                        </div>
                        <span
                          className="badge"
                          style={{
                            background:
                              job.status === 'in_progress'
                                ? '#fef3c7'
                                : job.status === 'accepted'
                                ? '#e0f2fe'
                                : 'var(--mint)',
                            color:
                              job.status === 'in_progress'
                                ? '#b45309'
                                : job.status === 'accepted'
                                ? '#0369a1'
                                : 'var(--green)',
                          }}
                        >
                          {job.status === 'in_progress'
                            ? '🚗 On the Way / Started'
                            : job.status === 'accepted'
                            ? '✓ Accepted'
                            : '📋 Assigned'}
                        </span>
                      </div>
                      <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                        📍 {job.address}<br />📅 {job.date}
                      </p>
                      <div className="worker-req-price">{job.price}</div>
                      <div className="worker-req-actions">
                        <button
                          type="button"
                          className="worker-btn worker-btn-outline"
                          onClick={() => handleOpenChat(job.name)}
                        >
                          Message
                        </button>
                        {job.status === 'assigned' && (
                          <button
                            type="button"
                            className="worker-btn worker-btn-gold"
                            onClick={() => handleAcceptRequest(job.id)}
                          >
                            Accept Job
                          </button>
                        )}
                        {job.status === 'accepted' && (
                          <button
                            type="button"
                            className="worker-btn"
                            style={{ background: '#2563eb', color: '#ffffff', borderColor: '#2563eb' }}
                            onClick={() => handleStartJob(job.id)}
                          >
                            On the Way / Start
                          </button>
                        )}
                        {job.status === 'in_progress' && (
                          <button
                            type="button"
                            className="worker-btn worker-btn-dark"
                            onClick={() => handleInitiateCompleteJob(job)}
                          >
                            Complete (Enter PIN)
                          </button>
                        )}
                        {(!job.status || (job.status !== 'assigned' && job.status !== 'accepted' && job.status !== 'in_progress')) && (
                          <button
                            type="button"
                            className="worker-btn worker-btn-dark"
                            onClick={() => handleInitiateCompleteJob(job)}
                          >
                            Complete Job
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {jobsTab === 'pending' && (
              <div className="worker-requests-grid">
                {jobRequests.length === 0 ? (
                  <p className="text-muted">No pending jobs awaiting confirmation.</p>
                ) : (
                  jobRequests.map((req, idx) => (
                    <div key={`pending-tab-${req.id}-${idx}`} className="worker-req-card">
                      <div className="worker-req-head">
                        <div>
                          <h3>{req.service}</h3>
                          <span>{req.name} • ⌖ {req.dist}</span>
                        </div>
                        <span className="badge">{req.date}</span>
                      </div>
                      <p className="text-muted" style={{ fontSize: '0.85rem' }}>{req.desc}</p>
                      <div className="worker-req-price">{req.price}</div>
                      <div className="worker-req-actions">
                        <button
                          type="button"
                          className="worker-btn worker-btn-outline"
                          disabled={isRejectingId === req.id || isAcceptingId === req.id}
                          onClick={() => handleRejectRequest(req.id)}
                        >
                          {isRejectingId === req.id ? 'Rejecting...' : 'Reject'}
                        </button>
                        <button
                          type="button"
                          className="worker-btn worker-btn-gold"
                          disabled={isAcceptingId === req.id}
                          onClick={() => handleAcceptRequest(req.id)}
                        >
                          {isAcceptingId === req.id ? 'Accepting...' : 'Accept Job'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {jobsTab === 'completed' && (
              <div className="worker-requests-grid">
                {completedJobs.map((job, idx) => (
                  <div key={`${job.id}-${idx}`} className="worker-req-card" style={{ opacity: 0.85 }}>
                    <div className="worker-req-head">
                      <div>
                        <h3>{job.service}</h3>
                        <span>{job.name}</span>
                      </div>
                      <span className="badge">Completed</span>
                    </div>
                    <div className="worker-req-price">{job.price}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= 4. VIEW: EARNINGS ================= */}
        {activeView === 'view-earnings' && (
          <div className="worker-dashboard-view active">
            <h1 className="worker-page-title">Cooperative Earnings & Passbook</h1>
            <p className="worker-page-subtitle">Guaranteed 85% fair wage payout + 5% collective welfare fund.</p>
            <div className="worker-stats-grid mt-4">
              <div className="worker-stat-card">
                <h3>Total Paid Out (85%)</h3>
                <div className="worker-stat-val">₹ {totalEarningsPaid.toLocaleString()}</div>
                <small className="text-muted">{paidCompletedJobs.length} settled job{paidCompletedJobs.length === 1 ? '' : 's'}</small>
              </div>
              <div className="worker-stat-card">
                <h3>Pending Settlement</h3>
                <div className="worker-stat-val" style={{ color: '#d97706' }}>
                  ₹ {pendingEarnings.toLocaleString()}
                </div>
                <small className="text-muted">Awaiting customer payment</small>
              </div>
              <div className="worker-stat-card">
                <h3>Welfare Pool (5%)</h3>
                <div className="worker-stat-val text-green">₹ {welfareFund.toLocaleString()}</div>
                <small className="text-muted">Cooperative health & tool fund</small>
              </div>
            </div>

            <h2 className="worker-page-title mt-4" style={{ fontSize: '1.4rem' }}>
              Recent Transactions
            </h2>
            <div className="worker-table-container mt-2">
              {completedJobs.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', background: '#fff', borderRadius: '12px' }}>
                  <p className="text-muted">No service transactions recorded yet. Completed jobs and payments will appear here.</p>
                </div>
              ) : (
                <table className="worker-data-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Service</th>
                      <th>Date</th>
                      <th>Total Bill</th>
                      <th>Net Payout (85%)</th>
                      <th>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedJobs.map((txn) => {
                      const netPayout = txn.workerPayout || Math.round((txn.amount || 0) * 0.85);
                      const isPaid = txn.paymentStatus === 'paid';
                      return (
                        <tr key={txn.id}>
                          <td><strong>{txn.name}</strong></td>
                          <td>{txn.service}</td>
                          <td>{txn.date}</td>
                          <td>{txn.price}</td>
                          <td style={{ color: 'var(--green, #10b981)', fontWeight: 700 }}>
                            ₹ {netPayout.toLocaleString()}
                          </td>
                          <td>
                            <span className={`worker-status-badge ${isPaid ? 'success' : 'warning'}`}>
                              {isPaid ? `✓ Paid (${txn.paymentMethod || 'Settled'})` : '⏳ Awaiting Payment'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ================= 5. VIEW: PROFILE ================= */}
        {activeView === 'view-profile' && (
          <div className="worker-dashboard-view active">
            <h1 className="worker-page-title">My Member Profile</h1>
            <p className="worker-page-subtitle">Update your professional skills and service coverage area.</p>
            <div className="worker-card mt-4">
              <form onSubmit={handleSaveProfile}>
                <div className="worker-form-grid">
                  <div className="worker-form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={workerName}
                      onChange={(e) => setWorkerName(e.target.value)}
                    />
                  </div>
                  <div className="worker-form-group">
                    <label>Mobile Number</label>
                    <input
                      type="tel"
                      value={workerPhone}
                      onChange={(e) => setWorkerPhone(e.target.value)}
                    />
                  </div>
                  <div className="worker-form-group">
                    <label>Primary Skill / Trade</label>
                    <input
                      type="text"
                      value={workerSkill}
                      onChange={(e) => setWorkerSkill(e.target.value)}
                    />
                  </div>
                  <div className="worker-form-group">
                    <label>Years of Experience</label>
                    <input
                      type="number"
                      value={workerExp}
                      onChange={(e) => setWorkerExp(e.target.value)}
                    />
                  </div>
                  <div className="worker-form-group">
                    <label>Starting Base Price (₹)</label>
                    <input
                      type="number"
                      value={workerPrice}
                      onChange={(e) => setWorkerPrice(e.target.value)}
                    />
                  </div>
                  <div className="worker-form-group">
                    <label>Service City / Cluster</label>
                    <input
                      type="text"
                      value={workerLoc}
                      onChange={(e) => setWorkerLoc(e.target.value)}
                    />
                  </div>
                </div>

                <div className="worker-form-group mt-2">
                  <label>Professional Bio</label>
                  <textarea
                    rows={3}
                    value={workerBio}
                    onChange={(e) => setWorkerBio(e.target.value)}
                  />
                </div>

                <div className="worker-form-group mt-2">
                  <label>Languages Known</label>
                  <input
                    type="text"
                    value={workerLanguages}
                    onChange={(e) => setWorkerLanguages(e.target.value)}
                  />
                </div>

                <button type="submit" className="worker-btn worker-btn-gold mt-4">
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= 6. VIEW: REVIEWS ================= */}
        {activeView === 'view-reviews' && (
          <div className="worker-dashboard-view active">
            <h1 className="worker-page-title">Customer Reviews & Ratings</h1>
            <p className="worker-page-subtitle">Verified customer feedback and ratings submitted after completed jobs.</p>
            <div className="worker-card mt-4 text-center py-6">
              <h2 style={{ fontSize: '2.5rem', color: 'var(--gold, #e6aa3b)' }}>★ {averageRating} / 5</h2>
              <p className="text-muted">
                Based on {workerReviews.length} verified review{workerReviews.length === 1 ? '' : 's'}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {workerReviews.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', background: '#fff', borderRadius: '12px' }}>
                  <p className="text-muted">No customer reviews yet. Ratings and testimonials left after completed jobs will appear here.</p>
                </div>
              ) : (
                workerReviews.map((rev) => (
                  <div key={rev.id} className="worker-review-card">
                    <div className="worker-review-head">
                      <strong>{rev.customerName}</strong>
                      <span style={{ color: 'var(--gold, #e6aa3b)', fontSize: '1.1rem' }}>
                        {'★'.repeat(rev.score)}{'☆'.repeat(Math.max(0, 5 - rev.score))}
                      </span>
                    </div>
                    <small className="text-muted">{rev.service} • {rev.date}</small>
                    <p className="mt-2 text-sm text-gray-700">&ldquo;{rev.review}&rdquo;</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= 7. VIEW: NOTIFICATIONS ================= */}
        {activeView === 'view-notifications' && (
          <div className="worker-dashboard-view active">
            <h1 className="worker-page-title">Notifications</h1>
            <div className="mt-4">
              {completedJobs.length === 0 && activeJobs.length === 0 && jobRequests.length === 0 && workerReviews.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', background: '#fff', borderRadius: '12px' }}>
                  <p className="text-muted">No notifications yet. New service requests and payment receipts will appear here.</p>
                </div>
              ) : (
                <>
                  {workerReviews.map((rev) => (
                    <div key={`notif-rev-${rev.id}`} className="worker-notification-card unread">
                      <div className="worker-notif-icon">⭐</div>
                      <div>
                        <strong>New Customer Rating ({rev.score} Stars)</strong>
                        <p className="text-sm text-gray-600">
                          {rev.customerName} rated {rev.score} stars for {rev.service}: &ldquo;{rev.review}&rdquo;
                        </p>
                        <small className="text-muted">{rev.date}</small>
                      </div>
                    </div>
                  ))}
                  {completedJobs.filter((j) => j.paymentStatus === 'paid').map((j) => (
                    <div key={`notif-pay-${j.id}`} className="worker-notification-card unread">
                      <div className="worker-notif-icon">💰</div>
                      <div>
                        <strong>Payment Received</strong>
                        <p className="text-sm text-gray-600">
                          Settlement of ₹{(j.workerPayout || Math.round((j.amount || 0) * 0.85)).toLocaleString()} received for {j.service} from {j.name} ({j.paymentMethod}).
                        </p>
                        <small className="text-muted">{j.date}</small>
                      </div>
                    </div>
                  ))}
                  {activeJobs.map((j) => (
                    <div key={`notif-active-${j.id}`} className="worker-notification-card">
                      <div className="worker-notif-icon">🔧</div>
                      <div>
                        <strong>Service in Progress</strong>
                        <p className="text-sm text-gray-600">
                          Ongoing job: {j.service} for {j.name} at {j.address}.
                        </p>
                        <small className="text-muted">{j.date}</small>
                      </div>
                    </div>
                  ))}
                  {jobRequests.map((r) => (
                    <div key={`notif-req-${r.id}`} className="worker-notification-card">
                      <div className="worker-notif-icon">📋</div>
                      <div>
                        <strong>New Booking Request</strong>
                        <p className="text-sm text-gray-600">
                          {r.service} request from {r.name} ({r.price}).
                        </p>
                        <small className="text-muted">{r.date}</small>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* ================= 8. VIEW: VERIFICATION ================= */}
        {activeView === 'view-verification' && (
          <div className="worker-dashboard-view active">
            <h1 className="worker-page-title">Cooperative Worker Verification</h1>
            <div className="worker-card mt-4 text-center py-6">
              <div className="worker-verification-badge verified mx-auto mb-3">
                ✓ Status: Verified Professional
              </div>
              <h2 className="text-lg font-bold text-gray-900">Cooperative Society Endorsement Active</h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto mt-1">
                Your Aadhaar, Skill Certification (PMKVY Level 4), and Patna District Labour Society membership are fully active and verified.
              </p>

              <div className="border-t border-gray-200 mt-6 pt-6 text-left max-w-md mx-auto">
                <h3 className="font-bold text-sm text-gray-800 mb-2">Government ID Credentials</h3>
                <div className="worker-form-group">
                  <label>Aadhaar Number</label>
                  <input
                    type="text"
                    value="XXXX-XXXX-4912"
                    readOnly
                    disabled
                    style={{ background: '#f0f0f0' }}
                  />
                </div>
                <div className="worker-form-group">
                  <label>Cooperative Membership ID</label>
                  <input
                    type="text"
                    value="MEM-PAT-2024-042"
                    readOnly
                    disabled
                    style={{ background: '#f0f0f0' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Live Chat Modal */}
      {chatOpen && (
        <div className="worker-modal-overlay">
          <div className="worker-modal-content">
            <div className="worker-chat-header">
              <h3>Chat with {chatCustomer}</h3>
              <button
                type="button"
                className="worker-close-btn"
                onClick={() => setChatOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="worker-chat-body">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`worker-msg ${msg.sender === 'worker' ? 'sent' : 'received'}`}
                >
                  {msg.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="worker-chat-footer">
              <input
                type="text"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="worker-btn worker-btn-gold">
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Job Completion & Settlement Modal */}
      {completingJob && (
        <div className="worker-modal-overlay">
          <div
            className="worker-modal-content"
            style={{
              maxWidth: '520px',
              height: 'auto',
              maxHeight: '92vh',
              overflowY: 'auto',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: 'var(--ink)',
                color: 'white',
                padding: '1.2rem 1.4rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>✅</span> Complete Job & Settle Wages
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#ccc' }}>
                  Cooperative Verification & Immediate Payout
                </p>
              </div>
              <button
                type="button"
                className="worker-close-btn"
                onClick={() => setCompletingJob(null)}
                style={{ fontSize: '1.3rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmCompleteJob} style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Job summary card */}
              <div
                style={{
                  background: 'var(--cream)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--ink)', fontWeight: 700 }}>
                      {completingJob.service}
                    </h4>
                    <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--muted)' }}>
                      Customer: <strong>{completingJob.name}</strong> • 📍 {completingJob.address}
                    </p>
                  </div>
                  <span
                    style={{
                      background: 'var(--mint)',
                      color: 'var(--green)',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      padding: '4px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    In Progress
                  </span>
                </div>
              </div>

              {/* Customer OTP Verification */}
              <div style={{ background: '#fcfcfc', border: '1px solid #e5e7eb', padding: '14px', borderRadius: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                  Customer Completion PIN (OTP) <span style={{ color: 'var(--terracotta)' }}>*</span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      type="text"
                      maxLength={4}
                      value={completionOtp}
                      onChange={(e) => {
                        setCompletionOtp(e.target.value.replace(/[^0-9]/g, ''));
                        if (otpError) setOtpError(null);
                      }}
                      placeholder="••••"
                      required
                      autoFocus
                      style={{
                        width: '130px',
                        padding: '10px 12px',
                        border: otpError ? '2px solid #ef4444' : '2px solid var(--gold)',
                        borderRadius: '10px',
                        fontSize: '1.4rem',
                        fontWeight: 800,
                        letterSpacing: '6px',
                        textAlign: 'center',
                        background: '#fff',
                        outline: 'none',
                      }}
                    />
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.4 }}>
                      Ask customer for the 4-digit verification code shown on their tracking or bookings screen.
                    </div>
                  </div>

                  {/* Error display if invalid PIN */}
                  {otpError && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#b91c1c',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        background: '#fef2f2',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #fecaca',
                      }}
                    >
                      <span>⚠️</span>
                      <span>{otpError}</span>
                    </div>
                  )}

                  {/* Demo Helper Hint */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#f0fdf4',
                      border: '1px dashed #86efac',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      color: '#166534',
                    }}
                  >
                    <span>
                      💡 <strong>Customer PIN for this job:</strong> <code>{getBookingOtp(completingJob.id, completingJob.otp)}</code> (from Customer Tracking)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCompletionOtp(getBookingOtp(completingJob.id, completingJob.otp));
                        setOtpError(null);
                      }}
                      style={{
                        background: '#15803d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '3px 9px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        marginLeft: '8px',
                      }}
                    >
                      Fill PIN for Demo
                    </button>
                  </div>
                </div>
              </div>

              {/* Cooperative Wage & Split Box (85/10/5) */}
              {(() => {
                const total = parseInt(completingJob.price.replace(/[^0-9]/g, ''), 10) || 450;
                const workerShare = Math.round(total * 0.85);
                const welfareShare = Math.round(total * 0.05);
                const platformShare = Math.round(total * 0.10);

                return (
                  <div
                    style={{
                      border: '1px solid rgba(230, 170, 59, 0.4)',
                      background: 'rgba(230, 170, 59, 0.08)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink)' }}>
                        Cooperative Wage Distribution:
                      </span>
                      <span style={{ fontSize: '0.7rem', background: '#24172f', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        85 / 10 / 5 Fair Split
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--muted)' }}>Total Job Bill:</span>
                      <strong style={{ color: 'var(--ink)' }}>₹ {total}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--green)', fontWeight: 700 }}>
                        💰 Worker Direct Net Wages (85%):
                      </span>
                      <strong style={{ color: 'var(--green)', fontSize: '1.1rem' }}>+ ₹ {workerShare}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '3px' }}>
                      <span>🏛️ Society Welfare Pool (5%):</span>
                      <span>₹ {welfareShare}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--muted)' }}>
                      <span>⚙️ Platform Maintenance (10%):</span>
                      <span>₹ {platformShare}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Payment Mode Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                  Payment Method
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('online')}
                    style={{
                      padding: '8px 12px',
                      border: paymentMode === 'online' ? '2px solid var(--green)' : '1px solid var(--border)',
                      background: paymentMode === 'online' ? 'var(--mint)' : '#fff',
                      color: paymentMode === 'online' ? 'var(--green)' : 'var(--ink)',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    🟢 Online / Escrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('cash')}
                    style={{
                      padding: '8px 12px',
                      border: paymentMode === 'cash' ? '2px solid var(--gold)' : '1px solid var(--border)',
                      background: paymentMode === 'cash' ? 'var(--gold-soft)' : '#fff',
                      color: paymentMode === 'cash' ? '#9b6b14' : 'var(--ink)',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    💵 Cash Received
                  </button>
                </div>
              </div>

              {/* Work Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
                  Work Summary / Notes
                </label>
                <textarea
                  rows={2}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="e.g. Work performed, tested with household, satisfied."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '0.82rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'none',
                  }}
                />
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setCompletingJob(null)}
                  className="worker-btn worker-btn-outline"
                  style={{ flex: 1 }}
                  disabled={isSubmittingCompletion}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="worker-btn worker-btn-gold"
                  style={{ flex: 2, fontWeight: 700 }}
                  disabled={isSubmittingCompletion}
                >
                  {isSubmittingCompletion ? 'Finalizing...' : '✓ Confirm & Credit Wages'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div className={`worker-toast ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </div>
  );
}
