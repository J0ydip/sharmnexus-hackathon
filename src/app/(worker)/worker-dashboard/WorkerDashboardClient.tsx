'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { updateWorkerAvailability } from '@/app/actions/workers';
import { updateBookingStatus, getWorkerDashboardData } from '@/app/actions/worker-jobs';
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
  otp?: string;
}

interface CompletedJob {
  id: string;
  name: string;
  service: string;
  date: string;
  price: string;
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
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isAcceptingId, setIsAcceptingId] = useState<string | null>(null);

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
        if (res.requests) {
          const liveRequests: JobRequest[] = res.requests.map((r: any) => ({
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
          const liveActive: ActiveJob[] = res.activeJobs.map((j: any) => ({
            id: j.id,
            name: j.customers?.full_name || 'Customer',
            phone: j.customers?.phone || '',
            service: j.service_categories?.name || 'Cooperative Service',
            date: j.scheduled_at ? new Date(j.scheduled_at).toLocaleDateString() : 'Today',
            price: `₹ ${j.final_price || j.estimated_price || 400}`,
            address: j.address || 'Customer Location',
            otp: getBookingOtp(j.id),
          }));
          setActiveJobs(liveActive);
        }
        if (res.completedJobs) {
          const liveCompleted: CompletedJob[] = res.completedJobs.map((c: any) => ({
            id: c.id,
            name: c.customers?.full_name || 'Customer',
            service: c.service_categories?.name || 'Cooperative Service',
            date: c.completed_at ? new Date(c.completed_at).toLocaleDateString() : 'Recent',
            price: `₹ ${c.final_price || c.estimated_price || 400}`,
          }));
          setCompletedJobs(liveCompleted);
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
      const auth = JSON.parse(localStorage.getItem('shramnexus-auth') || localStorage.getItem('sharmnexus-auth') || '{}');
      if (auth?.id) {
        await updateWorkerAvailability(auth.id, newVal);
      }
    } catch (err) {}
    showToast(newVal ? 'You are now Online & Available' : 'You are now Offline');
  };

  const handleAcceptRequest = async (id: string) => {
    setIsAcceptingId(id);
    try {
      await updateBookingStatus(id, 'accepted');
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
            otp: found.otp,
          },
          ...prev,
        ]);
      }
      try {
        useBookingStore.getState().updateBookingStatus(id, 'accepted');
      } catch (err) {}
      showToast('✅ Job Accepted successfully! Moved to Active Jobs.');
    } catch (err: any) {
      console.error('Accept job error:', err);
      showToast(`❌ Could not accept job: ${err?.message || 'Server error'}`);
    } finally {
      setIsAcceptingId(null);
    }
  };

  const handleRejectRequest = async (id: string) => {
    setJobRequests((prev) => prev.filter((r) => r.id !== id));
    showToast('Job Request rejected.');
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
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('view-notifications'); setSidebarOpen(false); }}
            className={`nav-item ${activeView === 'view-notifications' ? 'active' : ''}`}
          >
            <span>{t.nav_notif}</span>
            <span className="badge badge-red">1</span>
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
                <div className="worker-stat-val">★ 4.8</div>
              </div>
              <div className="worker-stat-card">
                <h3>Completed Jobs</h3>
                <div className="worker-stat-val">
                  {126 + completedJobs.length}
                </div>
              </div>
              <div className="worker-stat-card">
                <h3>Today&apos;s Earnings (85%)</h3>
                <div className="worker-stat-val text-green">₹ 1,450</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }} className="mt-4">
              <h2 className="worker-page-title" style={{ fontSize: '1.3rem', margin: 0 }}>
                Recent Incoming Requests
              </h2>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '6px', border: '1px solid #fde68a' }}>
                🎯 Filtered for {workerSkill}
              </span>
            </div>
            <div className="worker-requests-grid mt-2">
              {isLoadingJobs && jobRequests.length === 0 ? (
                <p className="text-muted">Connecting to cooperative dispatch network...</p>
              ) : jobRequests.length === 0 ? (
                <p className="text-muted">No pending {workerSkill} requests right now. You are ready to accept new work in your trade.</p>
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
                        onClick={() => handleRejectRequest(req.id)}
                      >
                        Reject
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

        {/* ================= 2. VIEW: JOB REQUESTS ================= */}
        {activeView === 'view-requests' && (
          <div className="worker-dashboard-view active">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h1 className="worker-page-title" style={{ margin: 0 }}>Incoming Job Requests</h1>
                <p className="worker-page-subtitle">Review, accept, and schedule requests from your district cooperative cluster.</p>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '6px', border: '1px solid #fde68a' }}>
                🎯 Filtered for {workerSkill}
              </span>
            </div>
            <div className="worker-requests-grid mt-4">
              {isLoadingJobs && jobRequests.length === 0 ? (
                <p className="text-muted">Loading incoming {workerSkill} requests from cooperative dispatch...</p>
              ) : jobRequests.length === 0 ? (
                <p className="text-muted">No new {workerSkill} requests at the moment. New requests matching your profession will appear here automatically.</p>
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
                        onClick={() => handleRejectRequest(req.id)}
                      >
                        Reject
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
                Pending (0)
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
                        <span className="badge" style={{ background: 'var(--mint)', color: 'var(--green)' }}>
                          Active
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
                        <button
                          type="button"
                          className="worker-btn worker-btn-dark"
                          onClick={() => handleInitiateCompleteJob(job)}
                        >
                          Complete Job
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {jobsTab === 'pending' && (
              <p className="text-muted">No pending jobs awaiting confirmation.</p>
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
                <h3>This Week (85%)</h3>
                <div className="worker-stat-val">₹ 4,200</div>
              </div>
              <div className="worker-stat-card">
                <h3>This Month (85%)</h3>
                <div className="worker-stat-val">₹ 18,450</div>
              </div>
              <div className="worker-stat-card">
                <h3>Welfare Pool (5%)</h3>
                <div className="worker-stat-val text-green">₹ 1,085</div>
                <small className="text-muted">Cooperative health & tool fund</small>
              </div>
            </div>

            <h2 className="worker-page-title mt-4" style={{ fontSize: '1.4rem' }}>
              Recent Transactions
            </h2>
            <div className="worker-table-container mt-2">
              <table className="worker-data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Priya Sharma</td>
                    <td>Plumbing Repair</td>
                    <td>Today</td>
                    <td>₹ 450</td>
                    <td><span className="worker-status-badge success">Paid</span></td>
                  </tr>
                  <tr>
                    <td>Rahul Verma</td>
                    <td>Pipe Fitting</td>
                    <td>Yesterday</td>
                    <td>₹ 1,000</td>
                    <td><span className="worker-status-badge success">Paid</span></td>
                  </tr>
                  <tr>
                    <td>Amit Singh</td>
                    <td>Water Leak Inspection</td>
                    <td>Aug 22</td>
                    <td>₹ 850</td>
                    <td><span className="worker-status-badge warning">Pending</span></td>
                  </tr>
                </tbody>
              </table>
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
            <h1 className="worker-page-title">Customer Reviews</h1>
            <div className="worker-card mt-4 text-center py-6">
              <h2 style={{ fontSize: '2.5rem', color: 'var(--gold)' }}>⭐ 4.8 / 5</h2>
              <p className="text-muted">Based on 126 completed cooperative services</p>
            </div>

            <div className="mt-4">
              <div className="worker-review-card">
                <div className="worker-review-head">
                  <strong>Priya Sharma</strong>
                  <span style={{ color: 'var(--gold)' }}>★★★★★</span>
                </div>
                <small className="text-muted">Plumbing Repair • 2 days ago</small>
                <p className="mt-2 text-sm text-gray-700">Excellent work, very professional and arrived on time with complete tool kit.</p>
              </div>

              <div className="worker-review-card">
                <div className="worker-review-head">
                  <strong>Rahul Verma</strong>
                  <span style={{ color: 'var(--gold)' }}>★★★★☆</span>
                </div>
                <small className="text-muted">Pipe Fitting • 1 week ago</small>
                <p className="mt-2 text-sm text-gray-700">Good job fixing the pipes. Cleaned up thoroughly afterwards.</p>
              </div>
            </div>
          </div>
        )}

        {/* ================= 7. VIEW: NOTIFICATIONS ================= */}
        {activeView === 'view-notifications' && (
          <div className="worker-dashboard-view active">
            <h1 className="worker-page-title">Notifications</h1>
            <div className="mt-4">
              <div className="worker-notification-card unread">
                <div className="worker-notif-icon">💰</div>
                <div>
                  <strong>Payment Received</strong>
                  <p className="text-sm text-gray-600">You received ₹450 from Priya Sharma for #SNX-992.</p>
                  <small className="text-muted">2 hours ago</small>
                </div>
              </div>

              <div className="worker-notification-card">
                <div className="worker-notif-icon">⭐</div>
                <div>
                  <strong>New 5-Star Review</strong>
                  <p className="text-sm text-gray-600">Rahul Verma left a 4-star review for Pipe Fitting.</p>
                  <small className="text-muted">1 day ago</small>
                </div>
              </div>
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
