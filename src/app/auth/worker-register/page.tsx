'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createWorkerRegistration } from '@/app/actions/workers';
import { toast } from 'sonner';
import Link from 'next/link';
import './worker-register.css';

export default function WorkerRegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [societies, setSocieties] = useState<Array<{ id: string; name: string; district?: string; state?: string }>>([]);
  const [selectedSociety, setSelectedSociety] = useState('');

  // Step 1: Account & Contact
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: Profession & Skills
  const [selectedCategory, setSelectedCategory] = useState('');
  const [experience, setExperience] = useState('3');
  const [certification, setCertification] = useState('');
  const [hourlyRate, setHourlyRate] = useState('350');

  // Step 3: Identity & Location
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [city, setCity] = useState('Jaipur');
  const [address, setAddress] = useState('');

  useEffect(() => {
    async function loadInitialData() {
      const { data: catData } = await supabase.from('service_categories').select('id, name').order('name');
      if (catData && catData.length > 0) {
        setCategories(catData);
        setSelectedCategory(catData[0].id);
      }

      const { data: socData } = await supabase.from('cooperative_societies').select('id, name, district, state').order('name');
      if (socData && socData.length > 0) {
        setSocieties(socData);
      }
    }
    loadInitialData();
  }, [supabase]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!fullName.trim() || !phone.trim() || !email.trim() || !password) {
        toast.error('Please fill in all personal information fields');
        return;
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2) {
      if (!selectedCategory) {
        toast.error('Please select your profession / skill category');
        return;
      }
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !city.trim()) {
      toast.error('Please provide your service area and residential address');
      return;
    }

    setLoading(true);
    try {
      const { data: authResult, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            user_type: 'worker',
          },
        },
      });

      if (authError) {
        toast.error(authError.message);
        setLoading(false);
        return;
      }

      const userId = authResult.user?.id;
      if (!userId) {
        toast.error('Could not create worker user account');
        setLoading(false);
        return;
      }

      const regResult = await createWorkerRegistration({
        id: userId,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        aadhaarNumber: aadhaarNumber.trim() || undefined,
        address: `${address.trim()}, ${city.trim()}`,
        serviceCategoryId: selectedCategory,
        yearsExperience: parseInt(experience, 10) || 3,
        certificationName: certification.trim() || 'Verified Trade Professional',
        hourlyRate: parseFloat(hourlyRate) || 350,
        societyId: selectedSociety || undefined,
      });

      if (regResult?.error) {
        toast.error('Notice: Worker profile will sync upon dashboard load');
      }

      toast.success('Worker registration successful! Welcome to ShramNexus.');

      try {
        const authPayload = JSON.stringify({
          isLoggedIn: true,
          role: 'worker',
          name: fullName.trim(),
          email: email.trim(),
        });
        localStorage.setItem('shramnexus-auth', authPayload);
        localStorage.setItem('sharmnexus-auth', authPayload);
      } catch (e) {}
      
      await supabase.auth.signInWithPassword({ email: email.trim(), password });
      window.location.href = '/worker-dashboard';
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'An unexpected error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="worker-reg-root"
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background ambient glow */}
      <div className="worker-reg-glow-1" />
      <div className="worker-reg-glow-2" />

      <div
        className="worker-reg-container"
        style={{
          width: '100%',
          maxWidth: '620px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {/* Header */}
        <div className="worker-reg-header">
          <Link href="/" className="worker-reg-back">
            ← Back to ShramNexus Home
          </Link>
          <br />
          <div className="worker-reg-brand-badge">
            <span className="worker-reg-brand-dot" />
            SHRAMNEXUS COOPERATIVE ONBOARDING
          </div>
          <h1 className="worker-reg-title">Join as a Skilled Trade Professional</h1>
          <p className="worker-reg-subtitle">
            Build your verified digital identity, receive guaranteed fair-pay work, and access cooperative welfare benefits.
          </p>

          {/* Step Tracker */}
          <div className="worker-step-tracker">
            <div className={`worker-step-item ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
              <div className="worker-step-badge">{step > 1 ? '✓' : '1'}</div>
              <div className="worker-step-info">
                <span className="worker-step-num">Step 1</span>
                <span className="worker-step-label">Account & Login</span>
              </div>
            </div>
            <div className={`worker-step-item ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
              <div className="worker-step-badge">{step > 2 ? '✓' : '2'}</div>
              <div className="worker-step-info">
                <span className="worker-step-num">Step 2</span>
                <span className="worker-step-label">Trade & Skills</span>
              </div>
            </div>
            <div className={`worker-step-item ${step === 3 ? 'active' : ''}`}>
              <div className="worker-step-badge">3</div>
              <div className="worker-step-info">
                <span className="worker-step-num">Step 3</span>
                <span className="worker-step-label">ID & Cooperative</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step Card */}
        <div className="worker-reg-card">
          {/* STEP 1: Account Details */}
          {step === 1 && (
            <form onSubmit={handleNextStep}>
              <div className="worker-step-header">
                <h3>Step 1: Personal & Account Details</h3>
                <p>Create your personal profile and secure login credentials</p>
              </div>

              <div className="worker-field-group">
                <label className="worker-field-label">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar Sharma"
                  className="worker-input"
                />
              </div>

              <div className="worker-field-group">
                <label className="worker-field-label">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="worker-input"
                />
                <p className="worker-field-hint">Customers and cooperatives will reach you on this verified number.</p>
              </div>

              <div className="worker-field-group">
                <label className="worker-field-label">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="worker-input"
                />
              </div>

              <div className="worker-field-group">
                <label className="worker-field-label">Create Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="worker-input"
                />
              </div>

              <div className="worker-action-row">
                <button type="submit" className="worker-btn-primary">
                  Continue to Skills & Trade →
                </button>
              </div>

              <div className="worker-card-footer">
                Already registered as a worker?{' '}
                <Link href="/auth/login">Sign In</Link>
              </div>
            </form>
          )}

          {/* STEP 2: Profession & Skills */}
          {step === 2 && (
            <form onSubmit={handleNextStep}>
              <div className="worker-step-header">
                <h3>Step 2: Profession & Skills</h3>
                <p>Define your trade specialization and base service rate</p>
              </div>

              <div className="worker-field-group">
                <label className="worker-field-label">Primary Trade / Service Category *</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="worker-select"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="worker-field-hint">This determines your visibility when customers search for services in your area.</p>
              </div>

              <div className="worker-grid-2">
                <div className="worker-field-group">
                  <label className="worker-field-label">Experience (Years) *</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="worker-input"
                  />
                </div>
                <div className="worker-field-group">
                  <label className="worker-field-label">Expected Hourly Rate (₹) *</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="worker-input"
                  />
                </div>
              </div>

              <div className="worker-field-group">
                <label className="worker-field-label">Specialization or ITI Certification (Optional)</label>
                <input
                  type="text"
                  value={certification}
                  onChange={(e) => setCertification(e.target.value)}
                  placeholder="e.g. Certified Pipefitter, Government ITI Diploma"
                  className="worker-input"
                />
              </div>

              <div className="worker-info-box gold">
                <span>⚖️</span>
                <div>
                  <strong>FairWork Engine™ Guarantee:</strong> Your experience and skill certifications ensure balanced task distribution, fair community contracts, and zero wage exploitation.
                </div>
              </div>

              <div className="worker-action-row">
                <button
                  type="button"
                  onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="worker-btn-secondary"
                >
                  ← Back
                </button>
                <button type="submit" className="worker-btn-primary">
                  Continue to Verification →
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Verification & Cooperative Affiliation */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit}>
              <div className="worker-step-header">
                <h3>Step 3: Identity & Cooperative Affiliation</h3>
                <p>Required to issue your verified ShramNexus Digital ID Pass</p>
              </div>

              <div className="worker-field-group">
                <label className="worker-field-label">Aadhaar or National ID Number (Optional)</label>
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  placeholder="e.g. 1234 5678 9012"
                  className="worker-input"
                />
                <p className="worker-field-hint">Used to generate your trusted Government/Cooperative verified trust badge.</p>
              </div>

              <div className="worker-field-group">
                <label className="worker-field-label">Primary City / Region *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Jaipur"
                  className="worker-input"
                />
              </div>

              <div className="worker-field-group">
                <label className="worker-field-label">Residential / Operating Address *</label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Flat 12, Malviya Nagar, Sector 4"
                  className="worker-textarea"
                />
              </div>

              <div className="worker-field-group">
                <label className="worker-field-label">Cooperative Society Affiliation (Recommended)</label>
                <select
                  value={selectedSociety}
                  onChange={(e) => setSelectedSociety(e.target.value)}
                  className="worker-select"
                >
                  <option value="">None — Register as Independent Worker</option>
                  {societies.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.district || s.state || 'Cooperative'})
                    </option>
                  ))}
                </select>

                {selectedSociety ? (
                  <div className="worker-info-box gold">
                    <span>🏛️</span>
                    <div>
                      <strong>Cooperative Membership Selected:</strong> You will be enrolled under this society. Your registration will be reviewed by the society committee for 1-click verification, giving you access to collective community contracts, tool bank borrowing, and emergency welfare benefits.
                    </div>
                  </div>
                ) : (
                  <p className="worker-field-hint">
                    Independent workers can affiliate with a local cooperative society anytime later from their dashboard.
                  </p>
                )}
              </div>

              <div className="worker-info-box green">
                <span>🛡️</span>
                <div>
                  <strong>Instant Digital ID Guarantee:</strong> Once submitted, your verified ShramNexus Member Pass is generated immediately so you can start receiving booking requests!
                </div>
              </div>

              <div className="worker-action-row">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="worker-btn-secondary"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="worker-btn-primary"
                >
                  {loading ? 'Creating Worker Profile...' : 'Complete Registration ✓'}
                </button>
              </div>

              <div className="worker-card-footer">
                Protected by ShramNexus Democratic Protocol • Verified Worker Security
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

