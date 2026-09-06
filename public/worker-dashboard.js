document.addEventListener('DOMContentLoaded', () => {
    // 1. Authentication Check
    const authData = JSON.parse(localStorage.getItem('shramnexus-auth'));
    if (!authData || !authData.isLoggedIn || authData.role !== 'worker') {
        window.location.href = 'premium-auth.html';
        return;
    }

    // Populate user specific elements
    document.getElementById('welcome-name').innerText = `Welcome back, ${authData.name.split(' ')[0]}!`;
    document.getElementById('topbar-avatar').innerText = authData.name.charAt(0).toUpperCase();
    
    // Profile Pre-fill
    document.getElementById('p-name').value = authData.name || '';
    document.getElementById('p-phone').value = authData.phone || '';
    document.getElementById('p-skill').value = (authData.skills && authData.skills[0]) || '';
    document.getElementById('p-exp').value = authData.experience || '';
    document.getElementById('p-loc').value = authData.location || '';

    // ========================================================================
    // 2. LANGUAGE SWITCHING & i18n
    // ========================================================================
    const translations = {
        en: {
            nav_dash: "🏠 Dashboard", nav_req: "📋 Job Requests", nav_jobs: "🔧 My Jobs",
            nav_earn: "💰 Earnings", nav_rev: "⭐ Reviews", nav_notif: "🔔 Notifications",
            nav_prof: "👤 My Profile", nav_verif: "✅ Verification", nav_logout: "🚪 Logout",
            avail_online: "🟢 Available for Work", avail_offline: "🔴 Not Available"
        },
        hi: {
            nav_dash: "🏠 डैशबोर्ड", nav_req: "📋 कार्य अनुरोध", nav_jobs: "🔧 मेरे कार्य",
            nav_earn: "💰 कमाई", nav_rev: "⭐ समीक्षाएं", nav_notif: "🔔 सूचनाएं",
            nav_prof: "👤 मेरी प्रोफ़ाइल", nav_verif: "✅ सत्यापन", nav_logout: "🚪 लॉग आउट",
            avail_online: "🟢 काम के लिए उपलब्ध", avail_offline: "🔴 उपलब्ध नहीं"
        },
        bn: {
            nav_dash: "🏠 ড্যাশবোর্ড", nav_req: "📋 কাজের অনুরোধ", nav_jobs: "🔧 আমার কাজ",
            nav_earn: "💰 উপার্জন", nav_rev: "⭐ রিভিউ", nav_notif: "🔔 বিজ্ঞপ্তি",
            nav_prof: "👤 আমার প্রোফাইল", nav_verif: "✅ যাচাইকরণ", nav_logout: "🚪 লগ আউট",
            avail_online: "🟢 কাজের জন্য উপলব্ধ", avail_offline: "🔴 উপলব্ধ নয়"
        },
        mr: {
            nav_dash: "🏠 डॅशबोर्ड", nav_req: "📋 नोकरीच्या विनंत्या", nav_jobs: "🔧 माझी कामे",
            nav_earn: "💰 कमाई", nav_rev: "⭐ पुनरावलोकने", nav_notif: "🔔 सूचना",
            nav_prof: "👤 माझी प्रोफाइल", nav_verif: "✅ पडताळणी", nav_logout: "🚪 लॉग आउट",
            avail_online: "🟢 कामासाठी उपलब्ध", avail_offline: "🔴 उपलब्ध नाही"
        },
        ta: {
            nav_dash: "🏠 டாஷ்போர்டு", nav_req: "📋 வேலை கோரிக்கைகள்", nav_jobs: "🔧 எனது வேலைகள்",
            nav_earn: "💰 வருமானம்", nav_rev: "⭐ விமர்சனங்கள்", nav_notif: "🔔 அறிவிப்புகள்",
            nav_prof: "👤 எனது சுயவிவரம்", nav_verif: "✅ சரிபார்ப்பு", nav_logout: "🚪 வெளியேறு",
            avail_online: "🟢 வேலைக்கு தயார்", avail_offline: "🔴 கிடைக்கவில்லை"
        },
        te: {
            nav_dash: "🏠 డాష్‌బోర్డ్", nav_req: "📋 ఉద్యోగ అభ్యర్థనలు", nav_jobs: "🔧 నా పనులు",
            nav_earn: "💰 ఆదాయం", nav_rev: "⭐ సమీక్షలు", nav_notif: "🔔 నోటిఫికేషన్‌లు",
            nav_prof: "👤 నా ప్రొఫైల్", nav_verif: "✅ ధృవీకరణ", nav_logout: "🚪 లాగ్ అవుట్",
            avail_online: "🟢 పనికి అందుబాటులో", avail_offline: "🔴 అందుబాటులో లేదు"
        }
    };

    const LANG_STORAGE_KEY = 'shramnexus-lang';

    function applyLanguage(lang) {
        const dict = translations[lang] || translations['en'];
        
        // Translate text content
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key] !== undefined) el.textContent = dict[key];
        });

        // Sync dropdown
        const navSelect = document.getElementById('nav-language-select');
        if (navSelect && navSelect.value !== lang) navSelect.value = lang;

        // Save layout language
        document.documentElement.lang = lang;
        try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch (e) { /* ignore */ }
    }

    const navSelect = document.getElementById('nav-language-select');
    if (navSelect) {
        navSelect.addEventListener('change', () => applyLanguage(navSelect.value));
    }

    // Auto-load previously saved language (Syncs perfectly with Customer Dashboard)
    let savedLang = 'en';
    try { savedLang = localStorage.getItem(LANG_STORAGE_KEY) || 'en'; } catch (e) { }
    if (translations[savedLang]) applyLanguage(savedLang);

    // ========================================================================

    // 3. Navigation Logic
    const navItems = document.querySelectorAll('.nav-item[data-target]');
    const views = document.querySelectorAll('.dashboard-view');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            views.forEach(v => v.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
            
            document.querySelector('.sidebar').classList.remove('open');
        });
    });

    document.getElementById('mobileMenuBtn').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('open');
    });

    // 4. Availability Toggle (Uses translation dictionary logic)
    const availToggle = document.getElementById('avail-toggle');
    const availText = document.getElementById('avail-status-text');
    
    availToggle.checked = authData.available !== false; 
    updateAvailText(availToggle.checked);

    availToggle.addEventListener('change', (e) => {
        const isAvail = e.target.checked;
        updateAvailText(isAvail);
        
        authData.available = isAvail;
        localStorage.setItem('shramnexus-auth', JSON.stringify(authData));
        showToast(isAvail ? 'You are now Online' : 'You are now Offline');
    });

    function updateAvailText(isAvail) {
        const currentLang = localStorage.getItem(LANG_STORAGE_KEY) || 'en';
        const dict = translations[currentLang] || translations['en'];

        if (isAvail) {
            availText.innerText = dict['avail_online'];
            availText.className = 'status-active';
            availText.setAttribute('data-i18n', 'avail_online');
        } else {
            availText.innerText = dict['avail_offline'];
            availText.className = 'status-inactive';
            availText.setAttribute('data-i18n', 'avail_offline');
        }
    }

    // 5. Mock Data Generation
    let mockRequests = [
        { id: 'REQ001', name: 'Sanjay Verma', service: 'Leaking Pipe Repair', date: 'Today, 2:00 PM', price: '₹ 450', dist: '1.2 km', desc: 'Kitchen sink pipe is leaking heavily.' },
        { id: 'REQ002', name: 'Anjali Desai', service: 'Geyser Installation', date: 'Tomorrow, 10:00 AM', price: '₹ 800', dist: '3.5 km', desc: 'Need a new 15L geyser installed in the bathroom.' }
    ];

    let activeJobs = [
        { id: 'JOB099', name: 'Karan Singh', service: 'Tap Replacement', date: 'Today, 5:00 PM', price: '₹ 300', address: 'Block 4, Sector 3, Jaipur' }
    ];

    let completedJobs = [];

    // 6. Render Functions
    const renderRequests = () => {
        const containers = [document.getElementById('recent-requests-container'), document.getElementById('full-requests-container')];
        const badge = document.getElementById('req-badge');
        
        badge.innerText = mockRequests.length;
        if(mockRequests.length === 0) badge.style.display = 'none';

        const html = mockRequests.length === 0 
            ? `<p class="text-muted">No new requests at the moment.</p>` 
            : mockRequests.map(req => `
                <div class="req-card">
                    <div class="req-head">
                        <div><h3>${req.service}</h3><span>${req.name} • ⌖ ${req.dist}</span></div>
                        <span class="badge">${req.date}</span>
                    </div>
                    <p class="text-muted" style="font-size:0.85rem">${req.desc}</p>
                    <div class="req-price">${req.price}</div>
                    <div class="req-actions">
                        <button class="btn btn-outline" onclick="rejectReq('${req.id}')">Reject</button>
                        <button class="btn btn-gold" onclick="acceptReq('${req.id}')">Accept Job</button>
                    </div>
                </div>
            `).join('');

        containers.forEach(c => { if(c) c.innerHTML = html; });
    };

    const renderActiveJobs = () => {
        const container = document.getElementById('active-jobs-container');
        if(!container) return;

        container.innerHTML = activeJobs.length === 0 
            ? `<p class="text-muted">You have no active jobs.</p>` 
            : activeJobs.map(job => `
                <div class="req-card">
                    <div class="req-head">
                        <div><h3>${job.service}</h3><span>${job.name}</span></div>
                        <span class="badge" style="background:var(--mint); color:var(--green)">Active</span>
                    </div>
                    <p class="text-muted" style="font-size:0.85rem">📍 ${job.address}<br>📅 ${job.date}</p>
                    <div class="req-price">${job.price}</div>
                    <div class="req-actions">
                        <button class="btn btn-outline" onclick="openChat('${job.name}')">Message</button>
                        <button class="btn btn-dark" onclick="completeJob('${job.id}')">Complete</button>
                    </div>
                </div>
            `).join('');
    };

    const renderCompletedJobs = () => {
        const container = document.getElementById('completed-jobs-container');
        if(!container) return;

        container.innerHTML = completedJobs.length === 0 
            ? `<p class="text-muted">No completed jobs yet.</p>` 
            : completedJobs.map(job => `
                <div class="req-card" style="opacity: 0.8">
                    <div class="req-head">
                        <div><h3>${job.service}</h3><span>${job.name}</span></div>
                        <span class="badge">Completed</span>
                    </div>
                    <div class="req-price">${job.price}</div>
                </div>
            `).join('');
    };

    // 7. Action Handlers
    window.acceptReq = (id) => {
        const reqIndex = mockRequests.findIndex(r => r.id === id);
        if(reqIndex > -1) {
            const accepted = mockRequests.splice(reqIndex, 1)[0];
            activeJobs.push({...accepted, address: 'Address provided after acceptance'});
            renderRequests();
            renderActiveJobs();
            showToast('Job Accepted successfully!');
        }
    };

    window.rejectReq = (id) => {
        mockRequests = mockRequests.filter(r => r.id !== id);
        renderRequests();
        showToast('Job Request rejected.');
    };

    window.completeJob = (id) => {
        if(confirm("Are you sure you want to mark this job as completed?")) {
            const jobIndex = activeJobs.findIndex(j => j.id === id);
            if(jobIndex > -1) {
                const completed = activeJobs.splice(jobIndex, 1)[0];
                completedJobs.push(completed);
                
                const statElem = document.getElementById('stat-jobs');
                statElem.innerText = parseInt(statElem.innerText) + 1;

                renderActiveJobs();
                renderCompletedJobs();
                showToast('Job Marked as Completed!');
            }
        }
    };

    // 8. Tabs Logic
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
        });
    });

    // 9. Profile Save
    document.getElementById('profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        authData.name = document.getElementById('p-name').value;
        authData.phone = document.getElementById('p-phone').value;
        authData.skills = [document.getElementById('p-skill').value];
        
        localStorage.setItem('shramnexus-auth', JSON.stringify(authData));
        document.getElementById('welcome-name').innerText = `Welcome back, ${authData.name.split(' ')[0]}!`;
        
        showToast('Profile Updated Successfully!');
    });

    // 10. Chat Logic
    const chatModal = document.getElementById('chat-modal');
    window.openChat = (name) => {
        document.getElementById('chat-customer-name').innerText = name;
        chatModal.style.display = 'flex';
    };
    
    document.getElementById('close-chat').addEventListener('click', () => chatModal.style.display = 'none');
    
    document.getElementById('btn-send-msg').addEventListener('click', () => {
        const input = document.getElementById('chat-input');
        if(input.value.trim()) {
            const chatBody = document.getElementById('chat-messages');
            chatBody.innerHTML += `<div class="msg sent">${input.value}</div>`;
            input.value = '';
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    });

    // 11. Logout Logic
    document.getElementById('btnLogout').addEventListener('click', (e) => {
        e.preventDefault();
        if(confirm("Are you sure you want to log out?")) {
            localStorage.removeItem('shramnexus-auth');
            window.location.href = 'premium-auth.html';
        }
    });

    function showToast(msg) {
        const toast = document.getElementById('toast');
        toast.innerText = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    renderRequests();
    renderActiveJobs();
    renderCompletedJobs();
});