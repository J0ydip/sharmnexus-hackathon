// ============================================================================
// Premium Authentication System
// ============================================================================

class PremiumAuth {
    constructor() {
        this.currentUser = null;
        this.isLoading = false;
        this.init();
    }

    // ========================================================================
    // Initialization
    // ========================================================================
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupPasswordStrengthChecker();
        this.restoreSession();
    }

    cacheElements() {
        // Containers
        this.authContainer = document.getElementById('authContainer');
        this.authLeft = document.getElementById('authLeft');
        this.authRight = document.getElementById('authRight');

        // Form Containers
        this.loginContainer = document.getElementById('loginContainer');
        this.signupContainer = document.getElementById('signupContainer');

        // Forms
        this.loginForm = document.getElementById('loginForm');
        this.signupForm = document.getElementById('signupForm');
        this.resetForm = document.getElementById('resetForm');

        // Login Form Fields
        this.loginEmail = document.getElementById('loginEmail');
        this.loginPassword = document.getElementById('loginPassword');
        this.rememberMe = document.getElementById('rememberMe');
        this.loginBtn = document.getElementById('loginBtn');

        // Signup Form Fields
        this.fullName = document.getElementById('fullName');
        this.signupEmail = document.getElementById('signupEmail');
        this.signupPassword = document.getElementById('signupPassword');
        this.confirmPassword = document.getElementById('confirmPassword');
        this.termsCheckbox = document.getElementById('termsCheckbox');
        this.signupBtn = document.getElementById('signupBtn');

        // Reset Form Fields
        this.resetEmail = document.getElementById('resetEmail');
        this.resetBtn = document.getElementById('resetBtn');

        // Modals
        this.forgotPasswordModal = document.getElementById('forgotPasswordModal');
        this.modalOverlay = document.getElementById('modalOverlay');
        this.closeModal = document.getElementById('closeModal');
        this.resetSuccess = document.getElementById('resetSuccess');

        // Success Modal
        this.successModal = document.getElementById('successModal');
        this.successTitle = document.getElementById('successTitle');
        this.successMessage = document.getElementById('successMessage');
    }

    setupEventListeners() {
        // Form Submissions
        this.loginForm.addEventListener('submit', (e) => this.handleLoginSubmit(e));
        this.signupForm.addEventListener('submit', (e) => this.handleSignupSubmit(e));
        this.resetForm.addEventListener('submit', (e) => this.handleResetSubmit(e));

        // Form Switching
        document.getElementById('switchToSignup').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchForms('signup');
        });

        document.getElementById('switchToLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchForms('login');
        });

        // Forgot Password
        document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.openForgotPasswordModal();
        });

        this.closeModal.addEventListener('click', () => this.closeForgotPasswordModal());
        this.modalOverlay.addEventListener('click', () => this.closeForgotPasswordModal());

        // Password Visibility Toggles
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', (e) => this.togglePasswordVisibility(e));
        });

        // Social Authentication
        document.getElementById('googleLogin').addEventListener('click', () => this.handleSocialAuth('Google'));
        document.getElementById('githubLogin').addEventListener('click', () => this.handleSocialAuth('GitHub'));
        document.getElementById('googleSignup').addEventListener('click', () => this.handleSocialAuth('Google'));
        document.getElementById('githubSignup').addEventListener('click', () => this.handleSocialAuth('GitHub'));

        // Real-time Validation
        this.loginEmail?.addEventListener('blur', () => this.validateEmail(this.loginEmail));
        this.signupEmail?.addEventListener('blur', () => this.validateEmail(this.signupEmail));
        this.resetEmail?.addEventListener('blur', () => this.validateEmail(this.resetEmail));
        this.fullName?.addEventListener('blur', () => this.validateFullName());
        this.confirmPassword?.addEventListener('input', () => this.validatePasswordMatch());

        // Input Focus Effects
        [this.loginEmail, this.loginPassword, this.signupEmail, this.signupPassword, this.confirmPassword, this.fullName, this.resetEmail].forEach(field => {
            if (field) {
                field.addEventListener('focus', (e) => this.onInputFocus(e));
                field.addEventListener('blur', (e) => this.onInputBlur(e));
            }
        });
    }

    setupPasswordStrengthChecker() {
        this.signupPassword?.addEventListener('input', () => {
            const password = this.signupPassword.value;
            this.updatePasswordStrength(password);
        });
    }

    // ========================================================================
    // Form Switching with Animation
    // ========================================================================
    switchForms(targetForm) {
        const currentActive = this.loginContainer.classList.contains('active') ? this.loginContainer : this.signupContainer;
        const targetContainer = targetForm === 'signup' ? this.signupContainer : this.loginContainer;

        // Exit animation
        currentActive.classList.add('exit');

        setTimeout(() => {
            currentActive.classList.remove('active', 'exit');
            targetContainer.classList.add('active');

            // Scroll to top if mobile
            if (window.innerWidth < 768) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 400);
    }

    // ========================================================================
    // Input Focus Effects
    // ========================================================================
    onInputFocus(e) {
        const wrapper = e.target.closest('.input-wrapper');
        if (wrapper) {
            wrapper.classList.add('focused');
            e.target.classList.remove('error');
            const errorMsg = wrapper.querySelector('.error-message');
            if (errorMsg) errorMsg.textContent = '';
        }
    }

    onInputBlur(e) {
        const wrapper = e.target.closest('.input-wrapper');
        if (wrapper) {
            wrapper.classList.remove('focused');
        }
    }

    // ========================================================================
    // Form Validation
    // ========================================================================
    validateEmail(field) {
        const email = field.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            this.showError(field, 'Email is required');
            return false;
        }

        if (!emailRegex.test(email)) {
            this.showError(field, 'Please enter a valid email address');
            return false;
        }

        this.clearError(field);
        return true;
    }

    validatePassword(field) {
        const password = field.value;

        if (!password) {
            this.showError(field, 'Password is required');
            return false;
        }

        if (password.length < 8) {
            this.showError(field, 'Password must be at least 8 characters');
            return false;
        }

        this.clearError(field);
        return true;
    }

    validateSignupPassword() {
        const password = this.signupPassword.value;
        const strength = this.calculatePasswordStrength(password);

        if (!password) {
            this.showError(this.signupPassword, 'Password is required');
            return false;
        }

        if (password.length < 8) {
            this.showError(this.signupPassword, 'Password must be at least 8 characters');
            return false;
        }

        if (strength === 'weak') {
            this.showError(this.signupPassword, 'Password is too weak. Use uppercase, lowercase, numbers, and symbols');
            return false;
        }

        this.clearError(this.signupPassword);
        return true;
    }

    validatePasswordMatch() {
        const password = this.signupPassword.value;
        const confirmPassword = this.confirmPassword.value;

        if (confirmPassword && password !== confirmPassword) {
            this.showError(this.confirmPassword, 'Passwords do not match');
            return false;
        }

        if (confirmPassword) {
            this.clearError(this.confirmPassword);
        }

        return true;
    }

    validateFullName() {
        const name = this.fullName.value.trim();

        if (!name) {
            this.showError(this.fullName, 'Full name is required');
            return false;
        }

        if (name.length < 2) {
            this.showError(this.fullName, 'Full name must be at least 2 characters');
            return false;
        }

        if (!/^[a-zA-Z\s'-]+$/.test(name)) {
            this.showError(this.fullName, 'Full name can only contain letters, spaces, hyphens, and apostrophes');
            return false;
        }

        this.clearError(this.fullName);
        return true;
    }

    validateTerms() {
        if (!this.termsCheckbox.checked) {
            const termsError = document.getElementById('termsError');
            termsError.textContent = 'You must accept the Terms & Conditions';
            return false;
        }

        document.getElementById('termsError').textContent = '';
        return true;
    }

    validateLoginForm() {
        let isValid = true;

        if (!this.validateEmail(this.loginEmail)) isValid = false;
        if (!this.validatePassword(this.loginPassword)) isValid = false;

        return isValid;
    }

    validateSignupForm() {
        let isValid = true;

        if (!this.validateFullName()) isValid = false;
        if (!this.validateEmail(this.signupEmail)) isValid = false;
        if (!this.validateSignupPassword()) isValid = false;
        if (!this.validatePasswordMatch()) isValid = false;
        if (!this.validateTerms()) isValid = false;

        return isValid;
    }

    validateResetEmail() {
        return this.validateEmail(this.resetEmail);
    }

    // ========================================================================
    // Error & Success Messages
    // ========================================================================
    showError(field, message) {
        field.classList.add('error');
        let errorElement = field.closest('.input-wrapper')?.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.getElementById(`${field.id}Error`);
        }
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    clearError(field) {
        field.classList.remove('error');
        let errorElement = field.closest('.input-wrapper')?.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.getElementById(`${field.id}Error`);
        }
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    // ========================================================================
    // Password Strength
    // ========================================================================
    calculatePasswordStrength(password) {
        if (!password) return 'empty';

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

        if (strength <= 2) return 'weak';
        if (strength <= 3) return 'medium';
        return 'strong';
    }

    updatePasswordStrength(password) {
        const strength = this.calculatePasswordStrength(password);
        const bars = document.querySelectorAll('.strength-bar');
        const strengthText = document.getElementById('strengthText');

        bars.forEach(bar => bar.classList.remove('weak', 'medium', 'strong'));

        if (password.length === 0) {
            strengthText.textContent = 'Enter password';
            strengthText.className = 'strength-text';
            return;
        }

        if (strength === 'weak') {
            bars[0].classList.add('weak');
            strengthText.textContent = 'Weak password';
            strengthText.className = 'strength-text weak';
        } else if (strength === 'medium') {
            bars[0].classList.add('medium');
            bars[1].classList.add('medium');
            strengthText.textContent = 'Medium password';
            strengthText.className = 'strength-text medium';
        } else if (strength === 'strong') {
            bars.forEach(bar => bar.classList.add('strong'));
            strengthText.textContent = 'Strong password';
            strengthText.className = 'strength-text strong';
        }
    }

    // ========================================================================
    // Password Visibility Toggle
    // ========================================================================
    togglePasswordVisibility(e) {
        e.preventDefault();
        const targetId = e.currentTarget.dataset.target;
        const field = document.getElementById(targetId);

        if (field.type === 'password') {
            field.type = 'text';
            e.currentTarget.classList.add('visible');
        } else {
            field.type = 'password';
            e.currentTarget.classList.remove('visible');
        }
    }

    // ========================================================================
    // Form Submissions
    // ========================================================================
    async handleLoginSubmit(e) {
        e.preventDefault();

        if (!this.validateLoginForm()) return;

        this.setButtonLoading(this.loginBtn, true);

        try {
            await this.simulateNetworkDelay(1500);

            const user = {
                id: Date.now(),
                email: this.loginEmail.value,
                type: 'user',
                loginTime: new Date().toISOString(),
                rememberMe: this.rememberMe.checked
            };

            this.currentUser = user;
            this.saveSession(user);
            this.showSuccessAnimation('Login Successful!', `Welcome back, ${user.email.split('@')[0]}!`);

            setTimeout(() => this.handleAuthenticationSuccess(), 2000);
        } catch (error) {
            this.showError(this.loginEmail, 'Login failed. Please try again.');
        } finally {
            this.setButtonLoading(this.loginBtn, false);
        }
    }

    async handleSignupSubmit(e) {
        e.preventDefault();

        if (!this.validateSignupForm()) return;

        this.setButtonLoading(this.signupBtn, true);

        try {
            await this.simulateNetworkDelay(1500);

            const user = {
                id: Date.now(),
                fullName: this.fullName.value,
                email: this.signupEmail.value,
                type: 'user',
                createdAt: new Date().toISOString()
            };

            this.currentUser = user;
            this.saveSession(user);
            this.showSuccessAnimation('Account Created!', `Welcome ${user.fullName}!`);

            setTimeout(() => this.handleAuthenticationSuccess(), 2000);
        } catch (error) {
            this.showError(this.signupEmail, 'Signup failed. Please try again.');
        } finally {
            this.setButtonLoading(this.signupBtn, false);
        }
    }

    async handleResetSubmit(e) {
        e.preventDefault();

        if (!this.validateResetEmail()) return;

        this.setButtonLoading(this.resetBtn, true);

        try {
            await this.simulateNetworkDelay(1500);

            this.resetForm.style.display = 'none';
            this.resetSuccess.style.display = 'block';

            setTimeout(() => this.closeForgotPasswordModal(), 2000);
        } catch (error) {
            this.showError(this.resetEmail, 'Failed to send reset link. Please try again.');
        } finally {
            this.setButtonLoading(this.resetBtn, false);
        }
    }

    // ========================================================================
    // Modal Management
    // ========================================================================
    openForgotPasswordModal() {
        this.forgotPasswordModal.classList.add('active');
        this.resetForm.style.display = 'block';
        this.resetSuccess.style.display = 'none';
        this.resetForm.reset();
        document.body.style.overflow = 'hidden';
    }

    closeForgotPasswordModal() {
        this.forgotPasswordModal.classList.remove('active');
        this.resetForm.style.display = 'block';
        this.resetSuccess.style.display = 'none';
        document.body.style.overflow = '';
    }

    // ========================================================================
    // Success Animation
    // ========================================================================
    showSuccessAnimation(title, message) {
        this.successTitle.textContent = title;
        this.successMessage.textContent = message;
        this.successModal.classList.add('active');
    }

    hideSuccessAnimation() {
        this.successModal.classList.remove('active');
    }

    // ========================================================================
    // Button States
    // ========================================================================
    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    setButtonSuccess(button) {
        button.classList.add('success');
        button.disabled = true;
    }

    // ========================================================================
    // Social Authentication
    // ========================================================================
    handleSocialAuth(provider) {
        const btn = event.target.closest('.btn-social');
        this.setButtonLoading(btn, true);

        setTimeout(() => {
            alert(`${provider} OAuth flow would open here.\n\nIn a real app, you would be redirected to ${provider}'s login page.`);
            this.setButtonLoading(btn, false);
        }, 1500);
    }

    // ========================================================================
    // Session Management
    // ========================================================================
    saveSession(user) {
        const sessionData = {
            user: user,
            timestamp: new Date().toISOString()
        };

        if (user.rememberMe) {
            localStorage.setItem('authSession', JSON.stringify(sessionData));
        } else {
            sessionStorage.setItem('authSession', JSON.stringify(sessionData));
        }
    }

    restoreSession() {
        let sessionData = JSON.parse(localStorage.getItem('authSession')) ||
                         JSON.parse(sessionStorage.getItem('authSession'));

        if (sessionData && sessionData.user) {
            this.currentUser = sessionData.user;
            console.log('Session restored for:', this.currentUser.email);
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('authSession');
        sessionStorage.removeItem('authSession');
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    // ========================================================================
    // Utilities
    // ========================================================================
    simulateNetworkDelay(ms = 1000) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    handleAuthenticationSuccess() {
        this.hideSuccessAnimation();
        console.log('User authenticated:', this.currentUser);
        alert(`Welcome ${this.currentUser.fullName || this.currentUser.email}!\n\nIn a real app, you would be redirected to the dashboard.`);
        this.logout();
        this.switchForms('login');
        this.loginForm.reset();
        this.signupForm.reset();
    }
}

// ============================================================================
// Initialize on DOM Load
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    const auth = new PremiumAuth();
    window.auth = auth;

    // Optional: Auto-detect and apply theme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.style.colorScheme = 'dark';
    }

    // Optional: Monitor for theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            document.documentElement.style.colorScheme = e.matches ? 'dark' : 'light';
        });
    }
});
