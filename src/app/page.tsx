'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { Languages, Compass, MousePointerClick, Mic, Shapes, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { CustomerDashboard } from '@/components/customer/CustomerDashboard';
import { HelpSupportSection } from '@/components/common/HelpSupportSection';
import './landing.css';

const HERO_PHOTOS = [
  '/images/hero-workers/plumber.jpg',
  '/images/hero-workers/logistics.jpg',
  '/images/hero-workers/healthcare.jpg',
  '/images/hero-workers/delivery.jpg',
  '/images/hero-workers/carpenter.jpg',
];

export default function LandingPage() {
  const [lang, setLang] = useState('en');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isPhotoHovered, setIsPhotoHovered] = useState(false);
  const supabase = createClient();

  // Auto-slide hero photos smoothly
  useEffect(() => {
    if (isPhotoHovered) return;
    const interval = setInterval(() => {
      setActivePhotoIndex((prev) => (prev + 1) % HERO_PHOTOS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isPhotoHovered]);

  useEffect(() => {
    async function checkAuth() {
      try {
        const localAuth = localStorage.getItem('shramnexus-auth') || localStorage.getItem('sharmnexus-auth');
        if (localAuth) {
          try {
            const parsed = JSON.parse(localAuth);
            if (parsed.role === 'admin' || parsed.name === 'Super Admin' || parsed.email === 'admin@shramnexus.com') {
              localStorage.removeItem('shramnexus-auth');
              localStorage.removeItem('sharmnexus-auth');
              setIsAuthenticated(false);
              setUserType(null);
            } else if (parsed.isLoggedIn) {
              setIsAuthenticated(true);
              const type = parsed.role || 'customer';
              setUserType(type);
              if (type === 'worker') {
                window.location.href = '/worker-dashboard';
              }
              return;
            }
          } catch (e) {}
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const type = session.user.user_metadata?.user_type || session.user.user_metadata?.role;
          const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name;
          const email = session.user.email;
          if (type === 'admin' || fullName === 'Super Admin' || email === 'admin@shramnexus.com') {
            setIsAuthenticated(false);
            setUserType(null);
            return;
          }
          setIsAuthenticated(true);
          const customerOrWorker = type || 'customer';
          setUserType(customerOrWorker);
          if (customerOrWorker === 'worker') {
            window.location.href = '/worker-dashboard';
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (e) {
        setIsAuthenticated(false);
      }
    }
    checkAuth();

    // Read saved language preference
    const saved = (() => {
      try { return localStorage.getItem('shramnexus-lang'); } catch { return null; }
    })();
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
    const initialLang = saved || (match ? match[1] : null) || 'en';
    setLang(initialLang);

    // If a non-English language was saved, trigger Google Translate once the widget loads
    if (initialLang !== 'en') {
      const applyTranslation = () => {
        const gtCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (gtCombo) {
          gtCombo.value = initialLang;
          gtCombo.dispatchEvent(new Event('change'));
          // Hide the Google Translate toolbar
          setTimeout(() => {
            const bar = document.querySelector('.skiptranslate') as HTMLElement | null;
            if (bar) bar.style.display = 'none';
            document.body.style.top = '0px';
          }, 500);
        }
      };
      // Try immediately, then retry after a short delay (widget may still be loading)
      setTimeout(applyTranslation, 1000);
      setTimeout(applyTranslation, 2500);
    }

    // Always hide the GT toolbar on mount if present
    setTimeout(() => {
      const bar = document.querySelector('.skiptranslate') as HTMLElement | null;
      if (bar) bar.style.display = 'none';
      document.body.style.top = '0px';
    }, 2000);
  }, []);

  // When logged in as a customer, render the rich Customer Dashboard & Service Discovery Experience
  if (isAuthenticated === true && userType !== 'worker') {
    return <CustomerDashboard />;
  }

  // If still checking authentication, show a clean loader instead of flashing the landing page
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#fbf7ef] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#e6aa3b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>

    <div className="cursor-dot" aria-hidden="true"></div>
    <nav className={`navbar ${isNavOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
      <a className="brand" href="#home" aria-label="ShramNexus home" onClick={() => setIsNavOpen(false)}>
        <img src="/logo.png" alt="ShramNexus" className="nav-logo-img" />
        <span className="brand-text">Shram<span>Nexus</span></span>
      </a>
      <div className="nav-collapse">
        <div className="nav-links">
          <a href="#how-it-works" data-i18n="nav_how" onClick={() => setIsNavOpen(false)}>How it works</a>
          <a href="#services" data-i18n="nav_services" onClick={() => setIsNavOpen(false)}>Services</a>
          <a href="#communities" data-i18n="nav_communities" onClick={() => setIsNavOpen(false)}>For communities</a>
          <a href="#cooperatives" data-i18n="nav_cooperatives" onClick={() => setIsNavOpen(false)}>For cooperatives</a>
          <a href="#support" data-i18n="nav_support" onClick={() => setIsNavOpen(false)}>Help &amp; Support</a>
        </div>
        <div className="nav-actions">
          <select
            id="nav-language-select"
            aria-label="Choose language"
            value={lang}
            onChange={(e) => {
              const newLang = e.target.value;
              setLang(newLang);

              // 1. Instant client-side dictionary translation
              if (typeof window !== 'undefined') {
                try { localStorage.setItem('shramnexus-lang', newLang); } catch (err) {}
                if (typeof (window as any).applyShramNexusLanguage === 'function') {
                  (window as any).applyShramNexusLanguage(newLang);
                }
                window.dispatchEvent(new CustomEvent('shramnexus-lang-change', { detail: newLang }));
              }

              // 2. Optional Google Translate fallback/cookie sync
              const gtCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
              if (gtCombo && gtCombo.value !== newLang) {
                gtCombo.value = newLang;
                gtCombo.dispatchEvent(new Event('change'));
              }

              // Hide Google Translate toolbar
              setTimeout(() => {
                const bar = document.querySelector('.skiptranslate') as HTMLElement | null;
                if (bar) bar.style.display = 'none';
                document.body.style.top = '0px';
              }, 400);
            }}
          >
            <option value="en">EN</option>
            <option value="hi">हिंदी</option>
            <option value="bn">বাংলা</option>
            <option value="mr">मराठी</option>
            <option value="ta">தமிழ்</option>
            <option value="te">తెలుగు</option>
          </select>
          <a className="text-link" href="/auth/login" data-i18n="nav_login" onClick={() => setIsNavOpen(false)}>Log in</a>
        </div>
      </div>
      <button 
        className={`menu-toggle ${isNavOpen ? 'is-active' : ''}`} 
        aria-label={isNavOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isNavOpen}
        onClick={() => setIsNavOpen(!isNavOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>

    <main>
        <section className="hero" id="home">
            <div className="hero-copy">
                <div className="eyebrow"><span className="eyebrow-dot"></span> <span data-i18n="hero_eyebrow">COOPERATIVE-POWERED SERVICE NETWORK</span></div>
                <h1 data-i18n-html="hero_h1">Trusted help for every home.<br /><em>Stronger opportunities</em> for every worker.</h1>
                <p className="hero-lede" data-i18n="hero_lede">ShramNexus connects households with verified local professionals while helping labour cooperatives manage work, earnings, and welfare from one platform.</p>
                <div className="hero-actions">
                    <a className="button button-gold" href="/services"><span data-i18n="hero_cta_find">Find a service</span> <span>↗</span></a>
                    <a className="button button-ghost" href="/auth/worker-register"><span data-i18n="hero_cta_join">Join as a worker</span> <span>↗</span></a>
                </div>
                <div className="hero-proof">
                    <div className="avatar-stack"><span>PS</span><span>MK</span><span>RK</span><span>+</span></div>
                    <div><strong data-i18n="hero_proof_title">Built around local trust</strong><small data-i18n="hero_proof_sub">5,000+ skilled workers already in the network</small></div>
                </div>
            </div>
            <div className="hero-product" aria-label="ShramNexus verified worker showcase">
                <div className="product-glow"></div>
                <div className="product-window" style={{ width: 'min(100%, 540px)', background: '#ffffff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(36, 23, 47, 0.14)' }}>
                    <div className="window-top" style={{ height: '40px', padding: '0 1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f5f2ee', color: '#9b929c', fontSize: '0.65rem' }}>
                      <span className="window-dots" style={{ display: 'flex', gap: '5px' }}>
                        <i style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f87171', display: 'inline-block' }}></i>
                        <i style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24', display: 'inline-block' }}></i>
                        <i style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }}></i>
                      </span>
                      <span className="window-title" style={{ fontWeight: 600, letterSpacing: '0.02em', color: '#64748b' }}>ShramNexus</span>
                      <span style={{ color: '#cbd5e1' }}>•••</span>
                    </div>
                    <div className="window-body" style={{ padding: '1.2rem' }}>
                        {/* Pure Photo Slider - Auto-sliding the provided worker photos, no writing or text */}
                        <div
                          className="match-card hero-photo-slider"
                          onMouseEnter={() => setIsPhotoHovered(true)}
                          onMouseLeave={() => setIsPhotoHovered(false)}
                          style={{
                            position: 'relative',
                            height: '380px',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            padding: 0,
                            border: '1px solid rgba(0, 0, 0, 0.08)',
                            boxShadow: '0 12px 32px rgba(20, 12, 28, 0.12)',
                            background: '#150d1e',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              width: `${HERO_PHOTOS.length * 100}%`,
                              height: '100%',
                              transform: `translateX(-${activePhotoIndex * (100 / HERO_PHOTOS.length)}%)`,
                              transition: 'transform 0.7s cubic-bezier(0.25, 1, 0.5, 1)',
                            }}
                          >
                            {HERO_PHOTOS.map((src, idx) => (
                              <div
                                key={idx}
                                style={{
                                  width: `${100 / HERO_PHOTOS.length}%`,
                                  height: '100%',
                                  flexShrink: 0,
                                  position: 'relative',
                                }}
                              >
                                <img
                                  src={src}
                                  alt={`Worker ${idx + 1}`}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    display: 'block',
                                  }}
                                />
                              </div>
                            ))}
                          </div>

                          {/* Subtle arrow navigation on hover */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePhotoIndex((prev) => (prev - 1 + HERO_PHOTOS.length) % HERO_PHOTOS.length);
                            }}
                            aria-label="Previous"
                            style={{
                              position: 'absolute',
                              left: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'rgba(20, 12, 28, 0.55)',
                              backdropFilter: 'blur(6px)',
                              border: '1px solid rgba(255, 255, 255, 0.25)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.95rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              zIndex: 3,
                              opacity: isPhotoHovered ? 1 : 0,
                              transition: 'opacity 0.25s ease, background 0.2s ease',
                            }}
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePhotoIndex((prev) => (prev + 1) % HERO_PHOTOS.length);
                            }}
                            aria-label="Next"
                            style={{
                              position: 'absolute',
                              right: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'rgba(20, 12, 28, 0.55)',
                              backdropFilter: 'blur(6px)',
                              border: '1px solid rgba(255, 255, 255, 0.25)',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.95rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              zIndex: 3,
                              opacity: isPhotoHovered ? 1 : 0,
                              transition: 'opacity 0.25s ease, background 0.2s ease',
                            }}
                          >
                            ›
                          </button>

                          {/* Minimal sleek pagination dots */}
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '12px',
                              left: 0,
                              right: 0,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: '6px',
                              zIndex: 3,
                            }}
                          >
                            {HERO_PHOTOS.map((_, dotIdx) => (
                              <button
                                key={dotIdx}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActivePhotoIndex(dotIdx);
                                }}
                                aria-label={`Slide ${dotIdx + 1}`}
                                style={{
                                  width: dotIdx === activePhotoIndex ? '22px' : '6px',
                                  height: '5px',
                                  borderRadius: '999px',
                                  background: dotIdx === activePhotoIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                                  boxShadow: dotIdx === activePhotoIndex ? '0 1px 4px rgba(0,0,0,0.5)' : 'none',
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                  transition: 'all 0.35s ease',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className="trust-strip" aria-label="ShramNexus network statistics"><div className="metric-calculate"><strong><span className="count-up" data-target="5000">0</span>+</strong><span data-i18n="trust_workers">skilled workers</span></div><div className="metric-calculate"><strong><span className="count-up" data-target="25000">0</span>+</strong><span data-i18n="trust_services">services completed</span></div><div className="metric-calculate"><strong><span className="count-up" data-target="50">0</span>+</strong><span data-i18n="trust_coops">cooperatives</span></div><div className="metric-calculate"><strong><span className="count-up count-decimal" data-target="4.8">0</span><span>★</span></strong><span data-i18n="trust_rating">average rating</span></div><p data-i18n="trust_tagline">One network. Many ways to belong.</p></section>

        <section className="problem-solution section-pad" id="about">
          <div className="section-kicker-row">
            <span className="section-badge">
              <span className="badge-dot pulse"></span> WHY SHRAMNEXUS • THE PARADIGM SHIFT
            </span>
          </div>

          <div className="split-heading why-split-heading">
            <div className="heading-copy">
              <h2>
                Skilled workers are everywhere.<br />
                <em>Opportunity is not.</em>
              </h2>
            </div>
            <div className="why-mission-card">
              <div className="mission-header">
                <span className="mission-tag">✦ COOPERATIVE DIGITAL INFRASTRUCTURE</span>
              </div>
              <p className="mission-text">
                <strong>Local talent should not stay invisible.</strong> We are building the sovereign digital layer that transforms informal, precarious labour into verified, cooperative-backed local prosperity.
              </p>
              <div className="mission-badges">
                <span className="mission-chip">⚡ 0% Middleman Cut</span>
                <span className="mission-chip">🛡️ 100% Cooperative Owned</span>
                <span className="mission-chip">⚖️ Fair Algorithm Guarantee</span>
              </div>
            </div>
          </div>

          <div className="transformation">
            {/* Before Card */}
            <div className="before-card transform-module">
              <div className="transform-card-header">
                <span className="card-badge tag-today">
                  <span className="tag-icon">⚠️</span> TODAY • THE INFORMAL REALITY
                </span>
                <span className="card-status-pill">Unorganized & Isolated</span>
              </div>
              <h3 className="transform-card-title">Great skills, disconnected</h3>
              <p className="transform-card-subtitle">
                Individual tradespeople navigating an erratic, fragmented market with zero institutional protection.
              </p>

              <div className="transform-items">
                <div className="transform-item problem-item">
                  <div className="item-icon-box danger-icon">✕</div>
                  <div className="item-content">
                    <strong>Unpredictable Job Opportunities</strong>
                    <p>Erratic word-of-mouth reliance and seasonal income droughts with predatory cut-offs.</p>
                  </div>
                </div>

                <div className="transform-item problem-item">
                  <div className="item-icon-box danger-icon">✕</div>
                  <div className="item-content">
                    <strong>No Portable Digital Reputation</strong>
                    <p>Years of hard-earned craftsmanship vanish when shifting localities or neighborhoods.</p>
                  </div>
                </div>

                <div className="transform-item problem-item">
                  <div className="item-icon-box danger-icon">✕</div>
                  <div className="item-content">
                    <strong>Households Unsure Whom to Trust</strong>
                    <p>Unvetted strangers, arbitrary price haggling, and no verified background checks.</p>
                  </div>
                </div>

                <div className="transform-item problem-item">
                  <div className="item-icon-box danger-icon">✕</div>
                  <div className="item-content">
                    <strong>Limited Access to Welfare Support</strong>
                    <p>No health cover, emergency medical buffer, accidental insurance, or pension pool.</p>
                  </div>
                </div>
              </div>

              <div className="card-impact-bar problem-footer">
                <span className="impact-label">Market Friction</span>
                <span className="impact-value">Up to 30% lost to commercial commission middlemen</span>
              </div>
            </div>

            {/* Center Transformation Node */}
            <div className="transform-connector">
              <div className="connector-icon-glow" aria-label="Transformation forward">
                <ArrowRight size={26} strokeWidth={2.5} />
              </div>
            </div>

            {/* After Card */}
            <div className="after-card transform-module">
              <div className="transform-card-header">
                <span className="card-badge tag-tomorrow">
                  <span className="tag-icon">✦</span> WITH SHRAMNEXUS
                </span>
                <span className="card-status-pill success-pill">Verified Cooperative Network</span>
              </div>
              <h3 className="transform-card-title">A stronger local network</h3>
              <p className="transform-card-subtitle">
                A sovereign digital ecosystem empowering workers with equity, lifelong reputation, and collective security.
              </p>

              <div className="transform-items">
                <div className="transform-item solution-item">
                  <div className="item-icon-box success-icon">✓</div>
                  <div className="item-content">
                    <strong>Fair, Transparent Bookings</strong>
                    <p>Dynamic job routing with 0% platform commission and guaranteed minimum wage tariffs.</p>
                  </div>
                </div>

                <div className="transform-item solution-item">
                  <div className="item-icon-box success-icon">✓</div>
                  <div className="item-content">
                    <strong>Verified Worker Profiles & Ratings</strong>
                    <p>Government ID & trade credential checks with permanent, verifiable customer reviews.</p>
                  </div>
                </div>

                <div className="transform-item solution-item">
                  <div className="item-icon-box success-icon">✓</div>
                  <div className="item-content">
                    <strong>Cooperative-Owned Workforce Data</strong>
                    <p>Workers own their own data and federation governance—never exploited by corporate algorithms.</p>
                  </div>
                </div>

                <div className="transform-item solution-item">
                  <div className="item-icon-box success-icon">✓</div>
                  <div className="item-content">
                    <strong>Training, Insurance & Welfare Access</strong>
                    <p>Automated welfare fund contributions, subsidized tool kits, skill certs, and healthcare safety nets.</p>
                  </div>
                </div>
              </div>

              <div className="card-impact-bar solution-footer">
                <span className="impact-label">Collective Empowerment</span>
                <span className="impact-value">88% Fairness Score • 100% Cooperative Owned</span>
              </div>
            </div>
          </div>
        </section>

        <section className="services section-pad" id="services">
          <div className="section-kicker" data-i18n="services_kicker">EVERYDAY HELP, CLOSE TO HOME</div>
          <div className="section-heading-row">
            <h2 data-i18n-html="services_h2">Whatever you need,<br /><em>someone nearby can help.</em></h2>
            <a className="arrow-link" href="/services"><span data-i18n="services_explore">Explore all services</span> ↗</a>
          </div>
          <div className="service-grid">
            <a 
              href="/services?q=Plumber"
              className="service-card service-featured cursor-pointer" 
            >
              <img src="/plumbing.jfif" alt="Plumbing repair service" />
              <div className="service-overlay">
                <span>01</span>
                <h3 data-i18n="svc_plumbing_t">Plumbing</h3>
                <p data-i18n="svc_plumbing_d">Repairs, fittings & maintenance</p>
              </div>
            </a>

            <a 
              href="/services?q=Electrician"
              className="service-card cursor-pointer" 
            >
              <img src="/electral.jfif" alt="Electrical repair service" />
              <div className="service-overlay">
                <span>02</span>
                <h3 data-i18n="svc_electrical_t">Electrical</h3>
                <p data-i18n="svc_electrical_d">Repairs & installation</p>
              </div>
            </a>

            <a 
              href="/services?q=Cleaning"
              className="service-card cursor-pointer" 
            >
              <img src="/cleaning.jfif" alt="Home cleaning service" />
              <div className="service-overlay">
                <span>03</span>
                <h3 data-i18n="svc_cleaning_t">Cleaning</h3>
                <p data-i18n="svc_cleaning_d">Home & office care</p>
              </div>
            </a>

            <a 
              href="/services?q=Elderly Care"
              className="service-card cursor-pointer" 
            >
              <img src="/caregiving.jfif" alt="Caregiving service" />
              <div className="service-overlay">
                <span>04</span>
                <h3 data-i18n="svc_caregiving_t">Caregiving</h3>
                <p data-i18n="svc_caregiving_d">Support when it matters</p>
              </div>
            </a>

            <a 
              href="/services?q=Carpenter"
              className="service-card cursor-pointer" 
            >
              <img src="/carpentry.jfif" alt="Carpentry and furniture service" />
              <div className="service-overlay">
                <span>05</span>
                <h3 data-i18n="svc_carpentry_t">Carpentry</h3>
                <p data-i18n="svc_carpentry_d">Furniture & repairs</p>
              </div>
            </a>

            <a 
              href="/services?q=Driving"
              className="service-card cursor-pointer" 
            >
              <img src="/driving.jfif" alt="Driving and delivery service" />
              <div className="service-overlay">
                <span>06</span>
                <h3 data-i18n="svc_driving_t">Driving</h3>
                <p data-i18n="svc_driving_d">Transport & delivery</p>
              </div>
            </a>

            <a 
              href="/services?q=Gardener"
              className="service-card cursor-pointer" 
            >
              <img src="/gardening.jfif" alt="Gardening and landscaping service" />
              <div className="service-overlay">
                <span>07</span>
                <h3 data-i18n="svc_gardening_t">Gardening</h3>
                <p data-i18n="svc_gardening_d">Landscaping & maintenance</p>
              </div>
            </a>

            <a 
              href="/services?q=Technician"
              className="service-card cursor-pointer" 
            >
              <img src="/technician.jfif" alt="Technical repair and support service" />
              <div className="service-overlay">
                <span>08</span>
                <h3 data-i18n="svc_technician_t">Technician</h3>
                <p data-i18n="svc_technician_d">Tech repair & support</p>
              </div>
            </a>
          </div>
        </section>

        <section className="service-map-section section-pad" id="nearby-services">
          <div className="map-heading">
            <div>
              <div className="section-kicker" data-i18n="map_kicker">LIVE LOCAL NETWORK</div>
              <h2 data-i18n="map_h2">Services around you.</h2>
              <p data-i18n="map_p">Explore verified workers, active bookings, and areas with rising demand.</p>
            </div>
            <button className="map-location-button" id="use-location" type="button">
              ⌖ <span data-i18n="map_locbtn">Use my location</span>
            </button>
          </div>

          <div className="map-layout">
            <div className="map-card">
              <div id="service-map" aria-label="Interactive map showing ShramNexus services around Jaipur"></div>
              <div className="map-attribution-note">
                Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors
              </div>
            </div>
            <div className="map-legend" aria-label="Map filters">
              <button className="legend-item is-active" data-category="worker" type="button">
                <i className="legend-dot dot-green"></i>
                <span data-i18n="legend_workers">Available workers</span>
                <b>12</b>
              </button>
              <button className="legend-item is-active" data-category="booking" type="button">
                <i className="legend-dot dot-terracotta"></i>
                <span data-i18n="legend_bookings">Active bookings</span>
                <b>8</b>
              </button>
              <button className="legend-item is-active" data-category="demand" type="button">
                <i className="legend-dot dot-red"></i>
                <span data-i18n="legend_demand">High-demand zones</span>
                <b>3</b>
              </button>
              <button className="legend-item is-active" data-category="request" type="button">
                <i className="legend-dot dot-orange"></i>
                <span data-i18n="legend_requests">Customer requests</span>
                <b>6</b>
              </button>
            </div>
          </div>

          {/* Streamlined Live Demand Zones */}
          <div className="demand-zones-wrap">
            <div className="demand-zones-header">
              <span className="live-pill">
                <span className="pulse-dot"></span>
                <span>Live Demand Zones</span>
              </span>
              <span className="demand-zones-note">Click a zone to view on map</span>
            </div>

            <div className="demand-zones-grid">
              <div className="demand-card" data-lat="26.9120" data-lng="75.7700" role="button" tabIndex={0}>
                <div className="demand-card-header">
                  <span className="zone-tag">📍 Zone A · Central</span>
                  <span className="surge-tag high">+23% demand</span>
                </div>
                <div className="demand-card-service">Plumbing &amp; Repairs</div>
                <div className="demand-card-footer">
                  <span><b>8</b> verified workers</span>
                  <span className="arrow-icon">↗</span>
                </div>
              </div>

              <div className="demand-card" data-lat="26.8850" data-lng="75.7750" role="button" tabIndex={0}>
                <div className="demand-card-header">
                  <span className="zone-tag">📍 Zone B · South</span>
                  <span className="surge-tag peak">+17% demand</span>
                </div>
                <div className="demand-card-service">Electrical &amp; Wiring</div>
                <div className="demand-card-footer">
                  <span><b>6</b> verified workers</span>
                  <span className="arrow-icon">↗</span>
                </div>
              </div>

              <div className="demand-card" data-lat="26.9450" data-lng="75.8420" role="button" tabIndex={0}>
                <div className="demand-card-header">
                  <span className="zone-tag">📍 Zone C · North</span>
                  <span className="surge-tag rising">+19% demand</span>
                </div>
                <div className="demand-card-service">Home Deep Cleaning</div>
                <div className="demand-card-footer">
                  <span><b>9</b> verified workers</span>
                  <span className="arrow-icon">↗</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="platform-features section-pad" id="platform-features"><div className="section-kicker" data-i18n="features_kicker">THE SHRAMNEXUS DIFFERENCE</div><h2 data-i18n-html="features_h2">Everything you need.<br /><em>One simple platform.</em></h2><div className="feature-grid"><a className="feature-card" href="/auth/login"><span className="feature-icon" aria-hidden="true">⌕</span><h3 data-i18n-html="feat_1">Find verified<br />professionals</h3><span className="feature-arrow">↗</span></a><a className="feature-card" href="/auth/login"><span className="feature-icon" aria-hidden="true">⌖</span><h3 data-i18n-html="feat_2">Location-based<br />matching</h3><span className="feature-arrow">↗</span></a><a className="feature-card" href="/auth/login"><span className="feature-icon" aria-hidden="true">▦</span><h3 data-i18n="feat_3">Easy scheduling</h3><span className="feature-arrow">↗</span></a><a className="feature-card" href="/auth/login"><span className="feature-icon" aria-hidden="true">▣</span><h3 data-i18n-html="feat_4">Secure digital<br />payments</h3><span className="feature-arrow">↗</span></a><a className="feature-card" href="/auth/login"><span className="feature-icon" aria-hidden="true">▤</span><h3 data-i18n="feat_5">Digital invoices</h3><span className="feature-arrow">↗</span></a><a className="feature-card" href="/auth/login"><span className="feature-icon" aria-hidden="true">★</span><h3 data-i18n-html="feat_6">Ratings &amp;<br />reviews</h3><span className="feature-arrow">↗</span></a><a className="feature-card" href="/auth/login"><span className="feature-icon" aria-hidden="true">⌁</span><h3 data-i18n="feat_7">Service tracking</h3><span className="feature-arrow">↗</span></a><a className="feature-card" href="/auth/login"><span className="feature-icon" aria-hidden="true">!</span><h3 data-i18n-html="feat_8">Emergency<br />booking</h3><span className="feature-arrow">↗</span></a></div></section>

        <section className="accessibility section-pad" id="accessibility">
            <div className="section-kicker" data-i18n="access_kicker">DESIGNED FOR EVERYONE</div>
            <h2 data-i18n-html="access_h2">Technology that speaks<br /><em>your language.</em></h2>
            <div className="lang-pill-row" role="group" aria-label="Choose language">
                <button className={`lang-pill ${lang === 'en' ? 'is-active' : ''}`} type="button" data-lang="en" onClick={() => setLang('en')}>English</button>
                <button className={`lang-pill ${lang === 'hi' ? 'is-active' : ''}`} type="button" data-lang="hi" onClick={() => setLang('hi')}>हिंदी</button>
                <button className={`lang-pill ${lang === 'bn' ? 'is-active' : ''}`} type="button" data-lang="bn" onClick={() => setLang('bn')}>বাংলা</button>
                <button className={`lang-pill ${lang === 'mr' ? 'is-active' : ''}`} type="button" data-lang="mr" onClick={() => setLang('mr')}>मराठी</button>
                <button className={`lang-pill ${lang === 'ta' ? 'is-active' : ''}`} type="button" data-lang="ta" onClick={() => setLang('ta')}>தமிழ்</button>
                <button className={`lang-pill ${lang === 'te' ? 'is-active' : ''}`} type="button" data-lang="te" onClick={() => setLang('te')}>తెలుగు</button>
            </div>
            <div className="accessibility-grid">
                <div className="accessibility-item">
                    <div className="accessibility-icon icon-lang" aria-hidden="true">
                        <Languages size={26} strokeWidth={2} />
                    </div>
                    <p>Multilingual interface</p>
                </div>
                <div className="accessibility-item">
                    <div className="accessibility-icon icon-nav" aria-hidden="true">
                        <Compass size={26} strokeWidth={2} />
                    </div>
                    <p>Simple navigation</p>
                </div>
                <div className="accessibility-item">
                    <div className="accessibility-icon icon-touch" aria-hidden="true">
                        <MousePointerClick size={26} strokeWidth={2} />
                    </div>
                    <p>Large touch-friendly controls</p>
                </div>
                <div className="accessibility-item">
                    <div className="accessibility-icon icon-voice" aria-hidden="true">
                        <Mic size={26} strokeWidth={2} />
                    </div>
                    <p>Voice-assisted service search</p>
                </div>
                <div className="accessibility-item">
                    <div className="accessibility-icon icon-visual" aria-hidden="true">
                        <Shapes size={26} strokeWidth={2} />
                    </div>
                    <p>Easy-to-understand icons</p>
                </div>
            </div>
            <a className="button button-dark" href="/auth/login"><span data-i18n="access_explore">Explore ShramNexus</span> <span>↗</span></a>
        </section>

        <section className="worker-opportunities section-pad" id="worker-opportunities"><div className="worker-opportunities-heading"><div className="section-kicker" data-i18n="worker_kicker">FOR SKILLED WORKERS</div><h2 data-i18n-html="worker_h2">Your skills deserve more<br /><em>opportunities.</em></h2><p data-i18n="worker_p">Build your professional identity, discover jobs, grow your reputation, and access cooperative welfare benefits — all from one platform.</p></div><div className="worker-platform"><div className="worker-profile-card"><div className="profile-top"><div className="profile-avatar">RK</div><div><h3>Raj Kumar</h3><p>✓ Verified Plumber</p><strong>★ 4.8 Rating</strong></div></div><div className="profile-divider"></div><div className="profile-stats"><div><strong>3</strong><span>Today’s Jobs</span></div><div><strong>₹18,450</strong><span>This Month</span></div><div><strong>327</strong><span>Completed</span></div></div><a className="profile-link" href="/auth/login">View professional profile <span>↗</span></a></div><div className="worker-benefits"><a href="/auth/login"><span>▤</span>Digital skill profile<i>↗</i></a><a href="/auth/login"><span>✓</span>Certification verification<i>↗</i></a><a href="/auth/login"><span>▣</span>Job opportunities<i>↗</i></a><a href="/auth/login"><span>₹</span>Earnings tracking<i>↗</i></a><a href="/auth/login"><span>▥</span>Work history<i>↗</i></a><a href="/auth/login"><span>★</span>Ratings &amp; reputation<i>↗</i></a><a href="/auth/login"><span>♧</span>Welfare benefits<i>↗</i></a><a href="/auth/login"><span>✦</span>Skills growth<i>↗</i></a></div></div></section>

        <section className="how section-pad" id="how-it-works">
          <div className="section-kicker" data-i18n="how_kicker">SIMPLE BY DESIGN</div>
          <h2 data-i18n-html="how_h2">From “I need help”<br /><em>to “all sorted.”</em></h2>
          <div className="steps">
            <div className="step">
              <span>01</span>
              <div>
                <h3 data-i18n="step1_t">Tell us what you need</h3>
                <p data-i18n="step1_d">Describe a service in your own words, in your own language.</p>
              </div>
            </div>

            <div className="step">
              <span>02</span>
              <div>
                <h3 data-i18n="step2_t">Get intelligently matched</h3>
                <p data-i18n="step2_d">We find verified nearby workers by skill, rating, location, and availability.</p>
              </div>
            </div>

            <div className="step">
              <span>03</span>
              <div>
                <h3 data-i18n="step3_t">Book with confidence</h3>
                <p data-i18n="step3_d">Choose a time, track the service, pay securely, and leave a rating.</p>
              </div>
            </div>

            <div className="step">
              <span>04</span>
              <div>
                <h3 data-i18n="step4_t">Help the network grow</h3>
                <p data-i18n="step4_d">Every booking supports local workers and strengthens the cooperative behind them.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="communities section-pad" id="communities"><div className="section-kicker" data-i18n="communities_kicker">ONE PLATFORM. THREE COMMUNITIES.</div><h2 data-i18n-html="communities_h2">Shared prosperity,<br /><em>designed into every booking.</em></h2><div className="community-grid"><article className="community-card customer"><div className="community-number" data-i18n="comm1_num">01 / FOR HOUSEHOLDS</div><div className="community-icon">⌕</div><h3 data-i18n="comm1_h3">Find trusted help nearby.</h3><p data-i18n="comm1_p">Book skilled professionals you can trust, with transparent ratings, secure payments, and support when you need it most.</p><a href="/services"><span data-i18n="comm1_link">Find a service</span> <span>↗</span></a></article><article className="community-card worker"><div className="community-number" data-i18n="comm2_num">02 / FOR WORKERS</div><div className="community-icon">✦</div><h3 data-i18n="comm2_h3">Turn your skills into opportunity.</h3><p data-i18n="comm2_p">Build a professional identity, discover better jobs, grow your reputation, and access cooperative welfare benefits.</p><a href="/auth/worker-register"><span data-i18n="comm2_link">Join as a worker</span> <span>↗</span></a></article><article className="community-card cooperative" id="cooperatives"><div className="community-number" data-i18n="comm3_num">03 / FOR COOPERATIVES</div><div className="community-icon">◒</div><h3 data-i18n="comm3_h3">Coordinate with intelligence.</h3><p data-i18n="comm3_p">Manage your workforce, anticipate demand, allocate jobs, and measure impact from one cooperative-owned platform.</p><a href="/auth/login?redirect=/cooperative"><span data-i18n="comm3_link">Explore cooperatives</span> <span>↗</span></a></article></div></section>

        <section className="dashboard-section section-pad"><div className="dashboard-intro"><div className="section-kicker">FOR LABOUR COOPERATIVES</div><h2>Power your cooperative<br /><em>with a clearer view.</em></h2><p>Turn scattered activity into useful insight. ShramNexus gives federations and societies the tools to coordinate people, demand, and welfare more effectively.</p><a className="button button-gold" href="/auth/login?redirect=/cooperative">Explore the dashboard <span>↗</span></a></div><div className="dashboard"><div className="dashboard-top"><span>COOPERATIVE OVERVIEW</span><span className="live"><i></i> LIVE NETWORK</span></div><div className="metric-row"><div><small>WORKERS</small><strong>2,450</strong><span className="up">↑ 12.4%</span></div><div><small>JOBS TODAY</small><strong>734</strong><span className="up">↑ 8.1%</span></div><div><small>COMPLETION</small><strong>94.3%</strong><span className="up">↑ 3.6%</span></div></div><div className="dashboard-main"><div className="forecast"><div className="chart-heading"><div><small>DEMAND FORECAST</small><h3>Services this week</h3></div><span>Week 34⌄</span></div><div className="chart"><div className="chart-labels"><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span></div><div className="chart-bars"><i style={{ height: '48%' }}></i><i style={{ height: '61%' }}></i><i style={{ height: '42%' }}></i><i style={{ height: '78%' }}></i><i style={{ height: '66%' }}></i><i style={{ height: '88%' }}></i><i style={{ height: '72%' }}></i></div></div><div className="chart-days"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span></div></div><div className="recommendation"><span className="rec-label">✦ AI RECOMMENDATION</span><h3>Prepare for higher demand in Zone A.</h3><p>Plumbing requests are expected to rise <b>23%</b> between 6–9 PM.</p><div className="rec-action"><span>12 additional plumbers recommended</span><span>→</span></div></div></div></div></section>

        <section className="worker-story section-pad"><div className="story-visual"><div className="id-card"><div className="idc-brand-row"><span className="idc-brand">SHRAMNEXUS</span></div><span className="idc-brand-line"></span><div className="idc-avatar">RK</div><h3 className="idc-name">Raj Kumar</h3><p className="idc-role">Verified Plumber</p><div className="idc-divider"></div><ul className="idc-checks"><li>✓ Identity Verified</li><li>✓ Skills Verified</li><li>✓ Certificate Verified</li></ul><div className="idc-divider"></div><div className="idc-stats"><span className="idc-rating">★ 4.8</span><span className="idc-jobs">327 Jobs Completed</span></div><div className="idc-divider"></div><div className="idc-number">SNX-W-10294</div><div className="idc-qr" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div></div><div className="story-copy"><div className="section-kicker">THE PEOPLE BEHIND THE PLATFORM</div><h2>A better platform for the people behind <em>every service.</em></h2><p>Before ShramNexus, Raj relied on word-of-mouth referrals and had no reliable way to prove his skills. Now he has a verified professional profile, predictable job opportunities, transparent earnings, and access to cooperative welfare benefits.</p><div className="story-quote">“My work speaks for itself now — and the right people can finally find it.”<small>— Raj Kumar, Verified Plumber</small></div></div></section>

        <section className="testimonials section-pad"><div className="section-kicker">REAL PEOPLE. REAL IMPACT.</div><div className="section-heading-row"><h2>Trust is something<br /><em>we build together.</em></h2><div className="testimonial-count">01 <span>/</span> 04</div></div><div className="testimonial-grid">
            <article className="tilt-1"><div className="stars">★★★★★</div><blockquote>“Finding a verified plumber took less than two minutes. The booking and payment process was simple and transparent.”</blockquote><strong>Priya Sharma</strong><small>Customer · Jaipur</small></article>
            <article className="tilt-2"><div className="stars">★★★★★</div><blockquote>“As a worker, ShramNexus has given me consistent job opportunities and a fairer way to build my reputation.”</blockquote><strong>Manoj Kumar</strong><small>Verified Electrician · Delhi</small></article>
            <article className="tilt-3"><div className="stars">★★★★★</div><blockquote>“The AI forecasting helps our cooperative plan better and put the right people where they are needed.”</blockquote><strong>Rajasthan Labour Cooperative</strong><small>Cooperative partner</small></article>
            <article className="tilt-4"><div className="stars">★★★★★</div><blockquote>“Cooperative welfare benefits used to feel out of reach. Now I get insurance and training access through the same app I use for jobs.”</blockquote><strong>Sunita Devi</strong><small>Verified Caregiver · Lucknow</small></article>
            </div></section>

        <section className="final-cta"><div className="cta-sun"></div><div className="section-kicker" data-i18n="final_kicker">READY WHEN YOU ARE</div><h2 data-i18n-html="final_h2">Your next service is just<br /><em>a few clicks away.</em></h2><p data-i18n="final_p">Find trusted professionals. Support skilled workers. Strengthen local cooperatives.</p><div className="hero-actions"><a className="button button-dark" href="/auth/login"><span data-i18n="hero_cta_find">Find a service</span> <span>↗</span></a><a className="button button-outline-dark" href="/auth/login"><span data-i18n="hero_cta_join">Join as a worker</span> <span>↗</span></a></div></section>

        <HelpSupportSection />
    </main>

    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand-col">
          <a className="brand brand-light" href="#home" aria-label="ShramNexus home">
            <img src="/logo.png" alt="ShramNexus" className="nav-logo-img" />
            <span className="brand-text">Shram<span>Nexus</span></span>
          </a>
          <p className="footer-tagline" data-i18n-html="footer_tagline">
            Connecting skills.<br />Creating opportunities.
          </p>
          <p className="footer-mission">
            Empowering skilled workers and cooperatives across communities through trusted, dignified digital connections.
          </p>
          <div className="footer-social">
            <strong>Follow Us</strong>
            <div className="social-row">
              <a className="social-icon" href="#" aria-label="Facebook">f</a>
              <a className="social-icon" href="#" aria-label="X (Twitter)">𝕏</a>
              <a className="social-icon" href="#" aria-label="LinkedIn">in</a>
              <a className="social-icon" href="#" aria-label="Email">✉</a>
            </div>
          </div>
        </div>

        <div className="footer-links">
          <div>
            <strong>Platform</strong>
            <a href="/services">Services</a>
            <a href="#how-it-works">How it works</a>
            <a href="#communities">For households</a>
            <a href="#nearby-services">Live Network</a>
            <a href="#platform-features">Features</a>
          </div>
          <div>
            <strong>Community</strong>
            <a href="#communities">For workers</a>
            <a href="#cooperatives">For cooperatives</a>
            <a href="#about">Our mission</a>
            <a href="#testimonials">Worker Stories</a>
            <a href="#accessibility">Accessibility</a>
          </div>
          <div>
            <strong>Connect</strong>
            <a href="/auth/login">Customer Login</a>
            <a href="/auth/worker-register">Join as Worker</a>
            <a href="/auth/login">Get Started</a>
            <a href="#support">Contact Support</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 ShramNexus. Cooperative ownership, community impact.</span>
        <span>Made for the people who keep communities moving.</span>
      </div>
    </footer>





      <Script src="/js/script.js" strategy="afterInteractive" />
    </>
  );
}
