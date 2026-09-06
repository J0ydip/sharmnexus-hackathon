'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { setAdminSession } from '@/app/actions/admin';
import { toast } from 'sonner';
import './auth.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'customer' | 'worker'>('customer');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Signup fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupUserType, setSignupUserType] = useState<'customer' | 'worker'>('customer');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  // Password strength helper
  function getPasswordStrength(password: string) {
    if (!password) return { level: 'empty', label: 'Enter password' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

    if (score <= 2) return { level: 'weak', label: 'Weak password' };
    if (score === 3) return { level: 'medium', label: 'Medium password' };
    return { level: 'strong', label: 'Strong password' };
  }

  const strengthInfo = getPasswordStrength(signupPassword);

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please enter both email and password');
      return;
    }

    const trimmedEmail = loginEmail.trim().toLowerCase();

    // 🚨 SUPER ADMIN CREDENTIALS BYPASS 🚨
    const isAdminEmail =
      trimmedEmail === 'admin@shramnexus' ||
      trimmedEmail === 'admin@shramnexus.com' ||
      trimmedEmail === 'admin@sharmnexus' ||
      trimmedEmail === 'admin@sharmnexus.com';

    if (isAdminEmail && loginPassword === 'admin123') {
      setIsLoading(true);
      try {
        await setAdminSession();
        try {
          await supabase.auth.signOut();
        } catch (e) {}
        localStorage.setItem('shramnexus-admin-auth', 'true');
        localStorage.setItem('sharmnexus-admin-auth', 'true');
        const adminData = JSON.stringify({
          isLoggedIn: true,
          role: 'admin',
          name: 'Super Admin',
          email: 'admin@shramnexus.com',
        });
        localStorage.setItem('shramnexus-auth', adminData);
        localStorage.setItem('sharmnexus-auth', adminData);
        document.cookie = 'admin-session=true; path=/; max-age=86400';
        toast.success('Welcome, Super Admin! Transporting to Admin Console...');
        setTimeout(() => {
          window.location.href = '/admin';
        }, 500);
        return;
      } catch (err) {
        window.location.href = '/admin';
        return;
      }
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: loginEmail, 
        password: loginPassword 
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(`Successfully logged in as ${selectedRole.toUpperCase()}!`);
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.user_type || selectedRole;

      try {
        const authPayload = JSON.stringify({
          isLoggedIn: true,
          role: role,
          name: user?.user_metadata?.full_name || loginEmail.split('@')[0],
          email: loginEmail,
        });
        localStorage.setItem('shramnexus-auth', authPayload);
        localStorage.setItem('sharmnexus-auth', authPayload);
      } catch (e) {}

      window.location.href = role === 'worker' ? '/worker-dashboard' : '/';
    } catch (err) {
      toast.error('An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignupSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (signupPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      toast.error('Please agree to the Terms & Conditions');
      return;
    }

    setIsLoading(true);
    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: signupName,
            user_type: signupUserType,
          }
        }
      });
      if (error) {
        toast.error(error.message);
        return;
      }

      if (signUpData.user) {
        const rawDigits = (signUpData.user.id.replace(/[^0-9]/g, '') + Date.now().toString()).slice(0, 10);
        const uniquePhone = `+91${rawDigits.padEnd(10, '0')}`;

        if (signupUserType === 'customer') {
          await supabase.from('customers').upsert({
            id: signUpData.user.id,
            full_name: signupName,
            email: signupEmail,
            phone: uniquePhone,
          }, { onConflict: 'id' });
        } else if (signupUserType === 'worker') {
          await supabase.from('workers').upsert({
            id: signUpData.user.id,
            full_name: signupName,
            email: signupEmail,
            phone: uniquePhone,
            is_verified: true,
            is_available: true,
            verification_status: 'verified',
          }, { onConflict: 'id' });
        }
      }

      toast.success(`Account created successfully as ${signupUserType.toUpperCase()}!`);
      window.location.href = signupUserType === 'worker' ? '/worker-dashboard' : '/';
    } catch (err) {
      toast.error('An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/login`,
      });
      if (error) {
        toast.error(error.message);
      } else {
        setResetSuccess(true);
        toast.success('Password reset link sent to your email!');
      }
    } catch (err) {
      toast.error('Failed to send reset link.');
    } finally {
      setResetLoading(false);
    }
  }

  async function handleOAuth(provider: 'google' | 'github') {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) toast.error(error.message);
    } catch (err) {
      toast.error(`Failed to connect with ${provider}`);
    }
  }

  return (
    <>
      {/* Animated Background Orbs (ShramNexus Brand Glow) */}
      <div className="background-animation">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
      </div>

      {/* Main Authentication Container */}
      <div className="auth-wrapper">
        <div className="auth-container" id="authContainer">
          
          {/* Left Panel - Branding & Cooperative Network Illustration */}
          <div className="auth-panel auth-left" id="authLeft">
            <div className="branding">
              <div className="logo-circle">
                <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7V12C2 18.627 12 23 12 23C12 23 22 18.627 22 12V7L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="brand-title">ShramNexus</h1>
              <p className="brand-tagline">COOPERATIVE-POWERED SERVICE NETWORK</p>
            </div>

            {/* Animated Cooperative Network Illustration */}
            <div className="illustration">
              <div className="coop-hub">
                <div className="hub-pulse"></div>
                <div className="hub-icon">🌐</div>
              </div>
              <div className="network-node node-1"><span>🔧</span></div>
              <div className="network-node node-2"><span>🏠</span></div>
              <div className="network-node node-3"><span>⚡</span></div>
              <div className="network-node node-4"><span>🤝</span></div>
              <svg className="network-lines" viewBox="0 0 300 300">
                <line x1="150" y1="150" x2="60" y2="70" className="pulse-line" />
                <line x1="150" y1="150" x2="240" y2="90" className="pulse-line delay-1" />
                <line x1="150" y1="150" x2="70" y2="220" className="pulse-line delay-2" />
                <line x1="150" y1="150" x2="220" y2="210" className="pulse-line delay-3" />
              </svg>
            </div>

            <p className="brand-description">Connecting households with verified local professionals while empowering worker cooperatives.</p>
          </div>

          {/* Right Panel - Authentication Forms & Role Selector */}
          <div className="auth-panel auth-right" id="authRight">
            {/* Back to Home Button */}
            <a href="/" className="back-to-home" title="Back to Home" aria-label="Go back to ShramNexus landing page">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 10H1m0 0l8-8m-8 8l8 8"/>
              </svg>
              Back to Home
            </a>

            {/* Login Form Container */}
            <div className={`form-container ${isLogin ? 'active' : ''}`} id="loginContainer">
              <div className="form-header">
                <h2 className="form-title">Welcome Back</h2>
                <p className="form-subtitle">Choose your portal and sign in</p>
              </div>

              {/* Animated Pill Role Selector */}
              <div className={`role-selector ${selectedRole === 'worker' ? 'worker-selected' : ''}`} data-form="login">
                <button 
                  type="button" 
                  className={`role-btn ${selectedRole === 'customer' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('customer')}
                >
                  Customer
                </button>
                <button 
                  type="button" 
                  className={`role-btn ${selectedRole === 'worker' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('worker')}
                >
                  Worker
                </button>
              </div>

              <form className="auth-form" id="loginForm" onSubmit={handleLoginSubmit} noValidate>
                <div className="form-group">
                  <div className="input-wrapper">
                    <label htmlFor="loginEmail">Email Address</label>
                    <input 
                      type="email" 
                      id="loginEmail" 
                      name="email" 
                      placeholder="Enter your email" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required 
                    />
                    <div className="input-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <label htmlFor="loginPassword">Password</label>
                    <input 
                      type={showLoginPassword ? 'text' : 'password'} 
                      id="loginPassword" 
                      name="password" 
                      placeholder="Enter your password" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required 
                    />
                    <div className="input-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <button 
                      type="button" 
                      className="toggle-password" 
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showLoginPassword ? (
                        <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-row">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      id="rememberMe" 
                      name="rememberMe" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="checkbox-custom"></span>
                    <span>Remember me</span>
                  </label>
                  <a 
                    href="#" 
                    className="link" 
                    id="forgotPasswordLink"
                    onClick={(e) => {
                      e.preventDefault();
                      setResetSuccess(false);
                      setShowForgotModal(true);
                    }}
                  >
                    Forgot Password?
                  </a>
                </div>

                <button 
                  type="submit" 
                  className={`btn btn-primary ${isLoading ? 'loading' : ''}`} 
                  id="loginBtn"
                  disabled={isLoading}
                >
                  <span className="btn-text">Sign in as {selectedRole === 'worker' ? 'Worker' : 'Customer'}</span>
                  <span className="btn-loader"></span>
                </button>
              </form>

              <div className="divider"><span>OR</span></div>

              <div className="social-login">
                <button type="button" className="btn btn-social" onClick={() => handleOAuth('google')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google</span>
                </button>
                <button type="button" className="btn btn-social" onClick={() => handleOAuth('github')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>

              <div className="form-footer">
                Don't have an account?{' '}
                <a href="#" className="link" id="switchToSignup" onClick={(e) => { e.preventDefault(); setIsLogin(false); }}>
                  Sign Up
                </a>
              </div>
            </div>

            {/* Signup Form Container */}
            <div className={`form-container ${!isLogin ? 'active' : ''}`} id="signupContainer">
              <div className="form-header">
                <h2 className="form-title">Join ShramNexus</h2>
                <p className="form-subtitle">Create your network profile</p>
              </div>

              {/* Animated Pill Role Selector */}
              <div className={`role-selector ${signupUserType === 'worker' ? 'worker-selected' : ''}`} data-form="signup">
                <button 
                  type="button" 
                  className={`role-btn ${signupUserType === 'customer' ? 'active' : ''}`}
                  onClick={() => setSignupUserType('customer')}
                >
                  Customer
                </button>
                <button 
                  type="button" 
                  className={`role-btn ${signupUserType === 'worker' ? 'active' : ''}`}
                  onClick={() => setSignupUserType('worker')}
                >
                  Worker
                </button>
              </div>

              {/* Worker Onboarding Wizard Banner */}
              {signupUserType === 'worker' && (
                <div style={{
                  marginBottom: '14px',
                  padding: '10px 14px',
                  background: 'rgba(217, 111, 77, 0.08)',
                  border: '1px solid rgba(217, 111, 77, 0.25)',
                  borderRadius: '12px',
                  fontSize: '0.78rem',
                  color: 'var(--ink)'
                }}>
                  ✦ Prefer our comprehensive onboarding flow?{' '}
                  <a href="/auth/worker-register" style={{ color: 'var(--terracotta)', fontWeight: 700, textDecoration: 'underline' }}>
                    Open 3-Step Worker Registration →
                  </a>
                </div>
              )}

              <form className="auth-form" id="signupForm" onSubmit={handleSignupSubmit} noValidate>
                <div className="form-group">
                  <div className="input-wrapper">
                    <label htmlFor="fullName">Full Name</label>
                    <input 
                      type="text" 
                      id="fullName" 
                      name="fullName" 
                      placeholder="Enter your full name" 
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required 
                    />
                    <div className="input-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <label htmlFor="signupEmail">Email Address</label>
                    <input 
                      type="email" 
                      id="signupEmail" 
                      name="email" 
                      placeholder="Enter your email" 
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required 
                    />
                    <div className="input-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-wrapper">
                    <label htmlFor="signupPassword">Password</label>
                    <input 
                      type={showSignupPassword ? 'text' : 'password'} 
                      id="signupPassword" 
                      name="password" 
                      placeholder="Min 8 characters" 
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required 
                    />
                    <div className="input-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <button 
                      type="button" 
                      className="toggle-password" 
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showSignupPassword ? (
                        <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {/* Password Strength Indicator */}
                  <div className="password-strength">
                    <div className="strength-bars">
                      <span className={`strength-bar ${strengthInfo.level === 'weak' ? 'weak' : strengthInfo.level === 'medium' ? 'medium' : strengthInfo.level === 'strong' ? 'strong' : ''}`}></span>
                      <span className={`strength-bar ${strengthInfo.level === 'medium' ? 'medium' : strengthInfo.level === 'strong' ? 'strong' : ''}`}></span>
                      <span className={`strength-bar ${strengthInfo.level === 'strong' ? 'strong' : ''}`}></span>
                    </div>
                    <span className={`strength-text ${strengthInfo.level}`}>
                      {strengthInfo.label}
                    </span>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="form-group">
                  <div className="input-wrapper">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      placeholder="Re-enter password" 
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      required 
                    />
                    <div className="input-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <button 
                      type="button" 
                      className="toggle-password" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? (
                        <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    id="termsCheckbox" 
                    name="terms" 
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required 
                  />
                  <span className="checkbox-custom"></span>
                  <span>I agree to the <a href="#" className="link">Terms & Conditions</a></span>
                </label>

                <button 
                  type="submit" 
                  className={`btn btn-primary ${isLoading ? 'loading' : ''}`} 
                  id="signupBtn"
                  disabled={isLoading}
                >
                  <span className="btn-text">Register as {signupUserType === 'worker' ? 'Worker' : 'Customer'}</span>
                  <span className="btn-loader"></span>
                </button>
              </form>

              <div className="form-footer">
                Already have an account?{' '}
                <a href="#" className="link" id="switchToLogin" onClick={(e) => { e.preventDefault(); setIsLogin(true); }}>
                  Login
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <div className={`modal ${showForgotModal ? 'active' : ''}`} id="forgotPasswordModal">
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}></div>
        <div className="modal-content">
          <button 
            className="modal-close" 
            onClick={() => setShowForgotModal(false)} 
            aria-label="Close modal"
          >
            ×
          </button>
          <h2>Reset Your Password</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '8px 0 18px' }}>
            Enter your email address and we'll send you a password reset link.
          </p>
          
          {!resetSuccess ? (
            <form onSubmit={handleResetSubmit} noValidate>
              <div className="form-group" style={{ textAlign: 'left', marginBottom: '16px' }}>
                <div className="input-wrapper">
                  <label htmlFor="resetEmail">Email Address</label>
                  <input 
                    type="email" 
                    id="resetEmail" 
                    name="email" 
                    placeholder="Enter your email" 
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required 
                  />
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </div>
                </div>
              </div>
              <button 
                type="submit" 
                className={`btn btn-primary ${resetLoading ? 'loading' : ''}`}
                disabled={resetLoading}
              >
                <span className="btn-text">Send Reset Link</span>
                <span className="btn-loader"></span>
              </button>
            </form>
          ) : (
            <div className="modal-success" style={{ display: 'block' }}>
              <div className="success-icon-large">✓</div>
              <h3 style={{ color: 'var(--ink)', fontSize: '1.2rem', marginBottom: '6px' }}>Reset Link Sent!</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                Please check your inbox at <b>{resetEmail}</b> for password reset instructions.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
