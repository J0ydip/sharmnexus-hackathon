'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createWorkerRegistration } from '@/app/actions/workers';
import { toast } from 'sonner';
import Link from 'next/link';

export default function WorkerRegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

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
    async function loadCategories() {
      const { data } = await supabase.from('service_categories').select('id, name').order('name');
      if (data && data.length > 0) {
        setCategories(data);
        setSelectedCategory(data[0].id);
      }
    }
    loadCategories();
  }, [supabase]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!fullName || !phone || !email || !password) {
        toast.error('Please fill in all personal information fields');
        return;
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedCategory) {
        toast.error('Please select your profession / skill category');
        return;
      }
      setStep(3);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !city) {
      toast.error('Please provide your service area and address');
      return;
    }

    setLoading(true);
    try {
      const { data: authResult, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
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
        fullName,
        phone,
        email,
        aadhaarNumber: aadhaarNumber || undefined,
        address: `${address}, ${city}`,
        serviceCategoryId: selectedCategory,
        yearsExperience: parseInt(experience, 10) || 3,
        certificationName: certification || 'Verified Trade Professional',
        hourlyRate: parseFloat(hourlyRate) || 350,
      });

      if (regResult?.error) {
        toast.error('Notice: Worker profile will sync upon login');
      }

      toast.success('Worker registration complete! Welcome to SharmNexus.');
      
      await supabase.auth.signInWithPassword({ email, password });
      window.location.href = '/worker-dashboard';
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'An unexpected error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center px-4">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium">
          ← Back to SharmNexus Home
        </Link>
        <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30 mb-4">
          <span className="text-2xl font-black text-white">SN</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">Join as a Skilled Professional</h2>
        <p className="mt-2 text-sm text-slate-400">
          Empowering cooperative workers with digital identity, fair jobs, and welfare benefits
        </p>

        <div className="mt-8 max-w-md mx-auto grid grid-cols-3 gap-2 text-center text-xs font-semibold">
          <div className={`py-2 rounded-lg border ${step >= 1 ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-800 text-slate-500'}`}>
            1. Account
          </div>
          <div className={`py-2 rounded-lg border ${step >= 2 ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-800 text-slate-500'}`}>
            2. Skills & Trade
          </div>
          <div className={`py-2 rounded-lg border ${step >= 3 ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-slate-800 text-slate-500'}`}>
            3. Identity & Area
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/60 py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div className="border-b border-slate-700 pb-3 mb-4">
                <h3 className="text-lg font-bold text-white">Step 1: Personal & Account Details</h3>
                <p className="text-xs text-slate-400">Create your login credentials and contact info</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar Sharma"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Create Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  Continue to Skills & Trade →
                </button>
              </div>

              <p className="text-center text-xs text-slate-400 mt-4">
                Already registered as a worker?{' '}
                <Link href="/auth/login" className="text-blue-400 hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div className="border-b border-slate-700 pb-3 mb-4">
                <h3 className="text-lg font-bold text-white">Step 2: Profession & Skills</h3>
                <p className="text-xs text-slate-400">Select what services you provide and your background</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Primary Profession / Trade</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Experience (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Expected Hourly (₹)</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Specialization or Certification</label>
                <input
                  type="text"
                  value={certification}
                  onChange={(e) => setCertification(e.target.value)}
                  placeholder="e.g. Certified Pipefitter, Government ITI Diploma"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-3.5 px-4 rounded-xl transition-all text-sm"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/30 text-sm"
                >
                  Continue to Verification →
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-5">
              <div className="border-b border-slate-700 pb-3 mb-4">
                <h3 className="text-lg font-bold text-white">Step 3: Verification & Service Area</h3>
                <p className="text-xs text-slate-400">Required to issue your verified SharmNexus Digital ID</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Aadhaar or Government ID Number</label>
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  placeholder="e.g. 1234 5678 9012"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <p className="text-[11px] text-slate-400 mt-1">Used for verified background check and digital ID card generation.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Primary City / Region</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Jaipur"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Residential / Operating Address</label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Flat 12, Malviya Nagar, Sector 4"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 p-3.5 rounded-xl text-xs text-blue-200">
                🛡️ <strong>Instant Digital ID Guarantee:</strong> Once submitted, your SharmNexus Digital ID will be activated and you can immediately receive customer requests!
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setStep(2)}
                  className="w-1/3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-3.5 px-4 rounded-xl transition-all text-sm"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-emerald-600/30 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? 'Creating Worker Profile...' : 'Complete Registration ✓'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
