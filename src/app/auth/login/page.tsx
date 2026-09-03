
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import './auth.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  
  const supabase = createClient();
  const router = useRouter();

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please enter both email and password');
      return;
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
      toast.success('Successfully logged in!');
      window.location.href = '/';
    } catch (err) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignupSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: signupName,
            user_type: 'customer',
          }
        }
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success('Account created successfully!');
      window.location.href = '/';
    } catch (err) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      
    {/* Animated Background */}
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
            {/* Left Panel - Branding & Illustration */}
            <div className="auth-panel auth-left" id="authLeft">
                <div className="branding">
                    <div className="logo-circle">
                        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7V12C2 18.627 12 23 12 23C12 23 22 18.627 22 12V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <h1 className="brand-title">SharmNexus</h1>
                    <p className="brand-tagline">Connecting Skills. Creating Opportunities.</p>
                </div>

                <div className="illustration">
                    <div className="floating-card card-1">
                        <div className="card-icon">💡</div>
                    </div>
                    <div className="floating-card card-2">
                        <div className="card-icon">🚀</div>
                    </div>
                    <div className="floating-card card-3">
                        <div className="card-icon">⚡</div>
                    </div>
                    <div className="geometric-shape shape-1"></div>
                    <div className="geometric-shape shape-2"></div>
                    <div className="geometric-shape shape-3"></div>
                </div>

                <p className="brand-description">Everything you need, all in one place.</p>
            </div>

            {/* Right Panel - Authentication Form */}
            <div className="auth-panel auth-right" id="authRight">
                <a href="/" className="back-to-home" title="Back to Home" aria-label="Go back to SharmNexus landing page">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 10H1m0 0l8-8m-8 8l8 8"/>
                    </svg>
                    Back to Home
                </a>
                {/* Login Form */}
                <div className={`form-container ${isLogin ? "active" : ""}`} id="loginContainer">
                    <div className="form-header">
                        <h2 className="form-title">Welcome Back</h2>
                        <p className="form-subtitle">Login to continue to your account</p>
                    </div>

                    <form className="auth-form" id="loginForm" onSubmit={handleLoginSubmit}>
                        <div className="form-group">
                            <div className="input-wrapper">
                                <label htmlFor="loginEmail">Email Address</label>
                                <input 
                                    type="email" 
                                    id="loginEmail" 
                                    name="email" 
                                    placeholder="Enter your email"
                                    required
                                    aria-label="Email Address"
                                  value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                                <div className="input-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                    </svg>
                                </div>
                                <div className="input-underline"></div>
                                <span className="error-message" id="loginEmailError"></span>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-wrapper">
                                <label htmlFor="loginPassword">Password</label>
                                <input 
                                    type="password" 
                                    id="loginPassword" 
                                    name="password" 
                                    placeholder="Enter your password"
                                    required
                                    aria-label="Password"
                                  value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                                <div className="input-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                </div>
                                <button type="button" className="toggle-password" data-target="loginPassword" aria-label="Toggle password visibility">
                                    <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </button>
                                <div className="input-underline"></div>
                                <span className="error-message" id="loginPasswordError"></span>
                            </div>
                        </div>

                        <div className="form-row">
                            <label className="checkbox-label">
                                <input type="checkbox" id="rememberMe" name="rememberMe" />
                                <span className="checkbox-custom"></span>
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="link" id="forgotPasswordLink">Forgot Password?</a>
                        </div>

                        <button type="submit" className="btn btn-primary" id="loginBtn">
                            <span className="btn-text">Login</span>
                            <span className="btn-loader"></span>
                            <span className="btn-success">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                </svg>
                            </span>
                        </button>
                    </form>

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <div className="social-login">
                        <button type="button" className="btn btn-social" id="googleLogin" aria-label="Continue with Google">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span>Google</span>
                        </button>
                        <button type="button" className="btn btn-social" id="githubLogin" aria-label="Continue with GitHub">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            <span>GitHub</span>
                        </button>
                    </div>

                    <div className="form-footer">
                        Don't have an account? 
                        <a href="#" className="link" id="switchToSignup" onClick={(e) => { e.preventDefault(); setIsLogin(false); }}>Sign Up</a>
                    </div>
                </div>

                {/* Signup Form */}
                <div className="form-container" className={`form-container ${!isLogin ? "active" : ""}`} id="signupContainer">
                    <div className="form-header">
                        <h2 className="form-title">Create Your Account</h2>
                        <p className="form-subtitle">Join us and get started today</p>
                    </div>

                    <form className="auth-form" id="signupForm" onSubmit={handleSignupSubmit}>
                        <div className="form-group">
                            <div className="input-wrapper">
                                <label htmlFor="fullName">Full Name</label>
                                <input 
                                    type="text" 
                                    id="fullName" 
                                    name="fullName" 
                                    placeholder="Enter your full name"
                                    required
                                    aria-label="Full Name"
                                  value={signupName} onChange={(e) => setSignupName(e.target.value)} />
                                <div className="input-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                </div>
                                <div className="input-underline"></div>
                                <span className="error-message" id="fullNameError"></span>
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
                                    required
                                    aria-label="Email Address"
                                  value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
                                <div className="input-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                                    </svg>
                                </div>
                                <div className="input-underline"></div>
                                <span className="error-message" id="signupEmailError"></span>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-wrapper">
                                <label htmlFor="signupPassword">Password</label>
                                <input 
                                    type="password" 
                                    id="signupPassword" 
                                    name="password" 
                                    placeholder="Min 8 characters"
                                    required
                                    aria-label="Password"
                                  value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
                                <div className="input-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                </div>
                                <button type="button" className="toggle-password" data-target="signupPassword" aria-label="Toggle password visibility">
                                    <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </button>
                                <div className="input-underline"></div>
                                <span className="error-message" id="signupPasswordError"></span>
                            </div>

                            <div className="password-strength">
                                <div className="strength-bars">
                                    <span className="strength-bar" id="strengthBar1"></span>
                                    <span className="strength-bar" id="strengthBar2"></span>
                                    <span className="strength-bar" id="strengthBar3"></span>
                                    <span className="strength-bar" id="strengthBar4"></span>
                                </div>
                                <span className="strength-text" id="strengthText">Enter password</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-wrapper">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <input 
                                    type="password" 
                                    id="confirmPassword" 
                                    name="confirmPassword" 
                                    placeholder="Re-enter password"
                                    required
                                    aria-label="Confirm Password"
                                 />
                                <div className="input-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                </div>
                                <button type="button" className="toggle-password" data-target="confirmPassword" aria-label="Toggle confirm password visibility">
                                    <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </button>
                                <div className="input-underline"></div>
                                <span className="error-message" id="confirmPasswordError"></span>
                            </div>
                        </div>

                        <label className="checkbox-label">
                            <input type="checkbox" id="termsCheckbox" name="terms" required />
                            <span className="checkbox-custom"></span>
                            <span>I agree to the <a href="#" className="link">Terms & Conditions</a></span>
                        </label>
                        <span className="error-message" id="termsError"></span>

                        <button type="submit" className="btn btn-primary" id="signupBtn">
                            <span className="btn-text">Create Account</span>
                            <span className="btn-loader"></span>
                            <span className="btn-success">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                </svg>
                            </span>
                        </button>
                    </form>

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <div className="social-login">
                        <button type="button" className="btn btn-social" id="googleSignup" aria-label="Continue with Google">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span>Google</span>
                        </button>
                        <button type="button" className="btn btn-social" id="githubSignup" aria-label="Continue with GitHub">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            <span>GitHub</span>
                        </button>
                    </div>

                    <div className="form-footer">
                        Already have an account? 
                        <a href="#" className="link" id="switchToLogin" onClick={(e) => { e.preventDefault(); setIsLogin(true); }}>Login</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {/* Forgot Password Modal */}
    <div className="modal" id="forgotPasswordModal">
        <div className="modal-overlay" id="modalOverlay"></div>
        <div className="modal-content">
            <button className="modal-close" id="closeModal" aria-label="Close modal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>

            <h2>Reset Your Password</h2>
            <p>Enter your email address and we'll send you a password reset link.</p>

            <form id="resetForm" >
                <div className="input-wrapper">
                    <label htmlFor="resetEmail">Email Address</label>
                    <input 
                        type="email" 
                        id="resetEmail" 
                        name="email" 
                        placeholder="Enter your email"
                        required
                     />
                    <div className="input-underline"></div>
                    <span className="error-message" id="resetEmailError"></span>
                </div>

                <button type="submit" className="btn btn-primary" id="resetBtn">
                    <span className="btn-text">Send Reset Link</span>
                    <span className="btn-loader"></span>
                </button>
            </form>

            <div className="modal-success" id="resetSuccess" style={{ display: 'none' }}>
                <div className="success-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                    </svg>
                </div>
                <h3>Reset Link Sent!</h3>
                <p>Check your email for a password reset link.</p>
            </div>
        </div>
    </div>

    {/* Success Modal */}
    <div className="success-modal" id="successModal" style={{ display: 'none' }}>
        <div className="success-content">
            <div className="success-icon-large">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <h2 id="successTitle">Login Successful!</h2>
            <p id="successMessage">Welcome back! Redirecting...</p>
        </div>
    </div>

    

    </>
  );
}
