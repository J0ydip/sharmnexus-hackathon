// ============================================================================
// ShramNexus Premium Authentication System
// ============================================================================

class PremiumAuth {
    constructor() {
        this.currentUser = null;
        this.isLoading = false;
        this.selectedRole = 'customer'; // Default role
        this.init();
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.setupPasswordStrengthChecker();
        this.restoreSession();
    }

    cacheElements() {
        this.authContainer = document.getElementById('authContainer');
        this.loginContainer = document.getElementById('loginContainer');
        this.signupContainer = document.getElementById('signupContainer');

        this.loginForm = document.getElementById('loginForm');
        this.signupForm = document.getElementById('signupForm');
        this.resetForm = document.getElementById('resetForm');

        this.loginEmail = document.getElementById('loginEmail');
        this.loginPassword = document.getElementById('loginPassword');
        this.rememberMe = document.getElementById('rememberMe');
        this.loginBtn = document.getElementById('loginBtn');
        this.loginRoleText = document.getElementById('loginRoleText');

        this.fullName = document.getElementById('fullName');
        this.signupEmail = document.getElementById('signupEmail');
        this.signupPassword = document.getElementById('signupPassword');
        this.confirmPassword = document.getElementById('confirmPassword');
        
        // Dynamic Worker Fields
        this.workerExtraFields = document.getElementById('workerExtraFields');
        this.aadharNumber = document.getElementById('aadharNumber');
        this.panNumber = document.getElementById('panNumber');
        
        this.termsCheckbox = document.getElementById('termsCheckbox');
        this.signupBtn = document.getElementById('signupBtn');
        this.signupRoleText = document.getElementById('signupRoleText');

        this.resetEmail = document.getElementById('resetEmail');
        this.resetBtn = document.getElementById('resetBtn');

        this.forgotPasswordModal = document.getElementById('forgotPasswordModal');
        this.modalOverlay = document.getElementById('modalOverlay');
        this.closeModal = document.getElementById('closeModal');
        this.resetSuccess = document.getElementById('resetSuccess');

        this.successModal = document.getElementById('successModal');
        this.successTitle = document.getElementById('successTitle');
        this.successMessage = document.getElementById('successMessage');
    }

    setupEventListeners() {
        this.loginForm?.addEventListener('submit', (e) => this.handleLoginSubmit(e));
        this.signupForm?.addEventListener('submit', (e) => this.handleSignupSubmit(e));
        this.resetForm?.addEventListener('submit', (e) => this.handleResetSubmit(e));

        // Role Selector Buttons
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const role = e.currentTarget.dataset.role;
                this.setRole(role);
            });
        });

        // Form Switching
        document.getElementById('switchToSignup')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchForms('signup');
        });

        document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchForms('login');
        });

        // Forgot Password
        document.getElementById('forgotPasswordLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.openForgotPasswordModal();
        });

        this.closeModal?.addEventListener('click', () => this.closeForgotPasswordModal());
        this.modalOverlay?.addEventListener('click', () => this.closeForgotPasswordModal());

        // Password Visibility Toggles
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', (e) => this.togglePasswordVisibility(e));
        });
    }

    setupPasswordStrengthChecker() {
        this.signupPassword?.addEventListener('input', () => {
            const password = this.signupPassword.value;
            this.updatePasswordStrength(password);
        });
    }

    setRole(role) {
        this.selectedRole = role;
        const formattedRole = role.charAt(0).toUpperCase() + role.slice(1);

        document.querySelectorAll('.role-selector').forEach(selector => {
            if (role === 'worker') {
                selector.classList.add('worker-selected');
            } else {
                selector.classList.remove('worker-selected');
            }
        });

        document.querySelectorAll('.role-btn').forEach(btn => {
            if (btn.dataset.role === role) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        if (this.loginRoleText) this.loginRoleText.textContent = formattedRole;
        if (this.signupRoleText) this.signupRoleText.textContent = formattedRole;
        
        // TOGGLE WORKER EXTRA FIELDS
        if (this.workerExtraFields) {
            this.workerExtraFields.style.display = (role === 'worker') ? 'block' : 'none';
        }
    }

    switchForms(targetForm) {
        const currentActive = this.loginContainer?.classList.contains('active') ? this.loginContainer : this.signupContainer;
        const targetContainer = targetForm === 'signup' ? this.signupContainer : this.loginContainer;

        if (!currentActive || !targetContainer) return;

        currentActive.classList.add('exit');

        setTimeout(() => {
            currentActive.classList.remove('active', 'exit');
            targetContainer.classList.add('active');

            if (window.innerWidth < 768) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 300);
    }

    calculatePasswordStrength(password) {
        if (!password) return 'empty';
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;

        if (strength <= 2) return 'weak';
        if (strength === 3) return 'medium';
        return 'strong';
    }

    updatePasswordStrength(password) {
        const strength = this.calculatePasswordStrength(password);
        const bars = document.querySelectorAll('.strength-bar');
        const strengthText = document.getElementById('strengthText');

        bars.forEach(bar => bar.classList.remove('weak', 'medium', 'strong'));
        if (!strengthText) return;

        if (password.length === 0) {
            strengthText.textContent = 'Enter password';
            strengthText.className = 'strength-text';
            return;
        }

        if (strength === 'weak') {
            if (bars[0]) bars[0].classList.add('weak');
            strengthText.textContent = 'Weak password';
            strengthText.className = 'strength-text weak';
        } else if (strength === 'medium') {
            if (bars[0]) bars[0].classList.add('medium');
            if (bars[1]) bars[1].classList.add('medium');
            strengthText.textContent = 'Medium password';
            strengthText.className = 'strength-text medium';
        } else if (strength === 'strong') {
            bars.forEach(bar => bar.classList.add('strong'));
            strengthText.textContent = 'Strong password';
            strengthText.className = 'strength-text strong';
        }
    }

    togglePasswordVisibility(e) {
        e.preventDefault();
        const btn = e.currentTarget;
        const targetId = btn.dataset.target;
        const field = document.getElementById(targetId);

        if (!field) return;

        const openEyeSVG = `
            <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
        `;

        const closedEyeSVG = `
            <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
        `;

        if (field.type === 'password') {
            field.type = 'text';
            btn.innerHTML = closedEyeSVG;
            btn.classList.add('visible');
        } else {
            field.type = 'password';
            btn.innerHTML = openEyeSVG;
            btn.classList.remove('visible');
        }
    }

    validateEmail(field) {
        if (!field) return false;
        const email = field.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            this.showError(field, 'Enter a valid email address');
            return false;
        }
        this.clearError(field);
        return true;
    }

    validatePassword(field) {
        if (!field || field.value.length < 8) {
            this.showError(field, 'Min 8 characters required');
            return false;
        }
        this.clearError(field);
        return true;
    }

    validateFullName() {
        if (!this.fullName || this.fullName.value.trim().length < 2) {
            this.showError(this.fullName, 'Full name is required');
            return false;
        }
        this.clearError(this.fullName);
        return true;
    }

    validatePasswordMatch() {
        if (!this.signupPassword || !this.confirmPassword) return false;
        if (this.confirmPassword.value && this.signupPassword.value !== this.confirmPassword.value) {
            this.showError(this.confirmPassword, 'Passwords do not match');
            return false;
        }
        this.clearError(this.confirmPassword);
        return true;
    }
    
    // NEW: Validate Worker Specific Fields
    validateWorkerFields() {
        if (this.selectedRole !== 'worker') return true; // Skip if customer
        let isValid = true;
        
        if (!this.aadharNumber || !this.aadharNumber.value.trim()) {
            this.showError(this.aadharNumber, 'Required for workers');
            isValid = false;
        } else {
            this.clearError(this.aadharNumber);
        }

        if (!this.panNumber || !this.panNumber.value.trim()) {
            this.showError(this.panNumber, 'Required for workers');
            isValid = false;
        } else {
            this.clearError(this.panNumber);
        }
        return isValid;
    }

    showError(field, message) {
        if (!field) return;
        field.classList.add('error');
        const errorElement = field.closest('.input-wrapper')?.querySelector('.error-message') || document.getElementById(`${field.id}Error`);
        if (errorElement) errorElement.textContent = message;
    }

    clearError(field) {
        if (!field) return;
        field.classList.remove('error');
        const errorElement = field.closest('.input-wrapper')?.querySelector('.error-message') || document.getElementById(`${field.id}Error`);
        if (errorElement) errorElement.textContent = '';
    }

    async handleLoginSubmit(e) {
        e.preventDefault();
        if (!this.validateEmail(this.loginEmail) || !this.validatePassword(this.loginPassword)) return;

        this.setButtonLoading(this.loginBtn, true);
        await new Promise(r => setTimeout(r, 1200));

        this.currentUser = { email: this.loginEmail.value, role: this.selectedRole };
        this.showSuccessAnimation('Login Successful!', `Welcome back (${this.selectedRole})!`);
        setTimeout(() => this.handleAuthenticationSuccess(), 1800);
    }

    async handleSignupSubmit(e) {
        e.preventDefault();
        // Check standard validations + new worker validation
        if (!this.validateFullName() || 
            !this.validateEmail(this.signupEmail) || 
            !this.validatePassword(this.signupPassword) || 
            !this.validatePasswordMatch() || 
            !this.validateWorkerFields()) {
            return;
        }

        this.setButtonLoading(this.signupBtn, true);
        await new Promise(r => setTimeout(r, 1200));

        this.currentUser = { fullName: this.fullName.value, role: this.selectedRole };
        this.showSuccessAnimation('Account Created!', `Welcome to ShramNexus as a ${this.selectedRole}!`);
        setTimeout(() => this.handleAuthenticationSuccess(), 1800);
    }

    async handleResetSubmit(e) {
        e.preventDefault();
        if (!this.validateEmail(this.resetEmail)) return;
        this.setButtonLoading(this.resetBtn, true);
        await new Promise(r => setTimeout(r, 1000));
        if (this.resetForm) this.resetForm.style.display = 'none';
        if (this.resetSuccess) this.resetSuccess.style.display = 'block';
        this.setButtonLoading(this.resetBtn, false);
    }

    openForgotPasswordModal() {
        if (this.forgotPasswordModal) this.forgotPasswordModal.classList.add('active');
        if (this.resetForm) this.resetForm.style.display = 'block';
        if (this.resetSuccess) this.resetSuccess.style.display = 'none';
        this.resetForm?.reset();
    }

    closeForgotPasswordModal() {
        this.forgotPasswordModal?.classList.remove('active');
    }

    showSuccessAnimation(title, message) {
        if (this.successTitle) this.successTitle.textContent = title;
        if (this.successMessage) this.successMessage.textContent = message;
        this.successModal?.classList.add('active');
    }

    setButtonLoading(button, isLoading) {
        if (!button) return;
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    handleAuthenticationSuccess() {
        this.successModal?.classList.remove('active');
        
        // Save auth state to localStorage so the main landing page knows the user is logged in
        localStorage.setItem('shramnexus-auth', JSON.stringify({
            isLoggedIn: true,
            role: this.selectedRole,
            name: this.currentUser?.fullName || this.currentUser?.email
        }));
        
        // Redirect back to the main landing page
        window.location.href = 'shramnexus-landing-updated.html';
    }
    restoreSession() {}
}

document.addEventListener('DOMContentLoaded', () => {
    window.auth = new PremiumAuth();
});