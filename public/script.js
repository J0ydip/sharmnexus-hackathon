/* =========================================================
   SHRAMNEXUS — script.js
   Rebuilt to match the actual markup in index.html.
   Sections:
     1. Custom cursor dot
     2. Stat counters (.count-up)
     3. Leaflet map + legend filters + geolocation
     4. Mobile nav toggle
     5. Smooth-scroll for in-page nav links
     6. Sticky navbar shadow
     7. Language switching (i18n)
     8. Service Booking Modal & LocalStorage
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* =====================================================
     1. CUSTOM CURSOR DOT
     ===================================================== */
  const cursorDot = document.querySelector('.cursor-dot');
  if (cursorDot && window.matchMedia('(pointer: fine)').matches) {
    document.body.classList.add('has-custom-cursor');
    window.addEventListener('mousemove', (e) => {
      cursorDot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });
    document.addEventListener('mouseleave', () => { cursorDot.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursorDot.style.opacity = '1'; });
    document.querySelectorAll('a, button, .service-card, .feature-card').forEach((el) => {
      el.addEventListener('mouseenter', () => cursorDot.classList.add('is-active'));
      el.addEventListener('mouseleave', () => cursorDot.classList.remove('is-active'));
    });
  }

  /* =====================================================
     2. STAT COUNTERS (.count-up)
     ===================================================== */
  const counters = document.querySelectorAll('.count-up');
  counters.forEach((counter, index) => {
    const target = Number(counter.dataset.target);
    const isDecimal = counter.classList.contains('count-decimal');
    const duration = 2400;
    const delay = index * 180;
    const start = performance.now() + delay;

    const tick = (now) => {
      if (now < start) {
        requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min((now - start) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = target * eased;
      counter.textContent = isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString('en-IN');
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  });

  /* =====================================================
     3. LEAFLET MAP + LEGEND FILTERS + GEOLOCATION
     ===================================================== */
  const mapElement = document.getElementById('service-map');
  if (mapElement && window.L) {
    const map = L.map(mapElement, { scrollWheelZoom: false, zoomControl: true }).setView([26.9124, 75.7873], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const points = [
      { category: 'worker', coords: [26.9157, 75.8010], title: 'Raj Kumar', detail: 'Verified Plumber · 4.8 ★ · Available today' },
      { category: 'worker', coords: [26.8957, 75.8125], title: 'Meena Devi', detail: 'Verified Electrician · 4.9 ★ · Available now' },
      { category: 'worker', coords: [26.9352, 75.7812], title: 'Amit Singh', detail: 'Verified Technician · 4.7 ★ · Available today' },
      { category: 'worker', coords: [26.9291, 75.7685], title: 'Sunita Sharma', detail: 'Verified Cleaner · 4.8 ★ · Available today' },
      { category: 'worker', coords: [26.8842, 75.8038], title: 'Rakesh Meena', detail: 'Verified Carpenter · 4.6 ★ · Available now' },
      { category: 'worker', coords: [26.9480, 75.7820], title: 'Pooja Verma', detail: 'Verified Caregiver · 4.9 ★ · Available today' },
      { category: 'worker', coords: [26.9065, 75.8450], title: 'Vikram Yadav', detail: 'Verified Driver · 4.7 ★ · Available now' },
      { category: 'worker', coords: [26.8715, 75.7900], title: 'Neha Gupta', detail: 'Verified Gardener · 4.8 ★ · Available today' },
      { category: 'worker', coords: [26.9580, 75.8200], title: 'Mohit Jain', detail: 'Verified Plumber · 4.7 ★ · Available today' },
      { category: 'worker', coords: [26.9200, 75.7500], title: 'Kavita Rao', detail: 'Verified Electrician · 4.9 ★ · Available now' },
      { category: 'worker', coords: [26.8780, 75.8350], title: 'Arun Patel', detail: 'Verified Technician · 4.6 ★ · Available today' },
      { category: 'worker', coords: [26.9400, 75.8500], title: 'Nisha Khan', detail: 'Verified Cleaner · 4.8 ★ · Available now' },
      { category: 'booking', coords: [26.9028, 75.7870], title: 'Active booking', detail: 'Home cleaning in progress' },
      { category: 'booking', coords: [26.9270, 75.8060], title: 'Active booking', detail: 'Carpentry visit scheduled' },
      { category: 'booking', coords: [26.8880, 75.7700], title: 'Active booking', detail: 'Electrical installation underway' },
      { category: 'booking', coords: [26.9470, 75.7980], title: 'Active booking', detail: 'Caregiving visit in progress' },
      { category: 'booking', coords: [26.9180, 75.8200], title: 'Active booking', detail: 'Plumbing repair underway' },
      { category: 'booking', coords: [26.8720, 75.8150], title: 'Active booking', detail: 'Garden maintenance underway' },
      { category: 'booking', coords: [26.9340, 75.7480], title: 'Active booking', detail: 'Technician visit scheduled' },
      { category: 'booking', coords: [26.9600, 75.8000], title: 'Active booking', detail: 'Delivery service in progress' },
      { category: 'demand', coords: [26.9120, 75.7700], title: 'Zone A · High demand', detail: 'Plumbing requests are up 23%' },
      { category: 'demand', coords: [26.8850, 75.7750], title: 'Zone B · High demand', detail: 'Electrical requests are up 17%' },
      { category: 'demand', coords: [26.9450, 75.8420], title: 'Zone C · High demand', detail: 'Cleaning requests are up 19%' },
      { category: 'request', coords: [26.9460, 75.8050], title: 'Customer request', detail: 'Urgent caregiving support needed' },
      { category: 'request', coords: [26.9180, 75.8350], title: 'Customer request', detail: 'Garden maintenance requested' },
      { category: 'request', coords: [26.8970, 75.7600], title: 'Customer request', detail: 'Plumber for leaking tap' },
      { category: 'request', coords: [26.9560, 75.7700], title: 'Customer request', detail: 'Home deep cleaning requested' },
      { category: 'request', coords: [26.8750, 75.8500], title: 'Customer request', detail: 'Furniture repair requested' },
      { category: 'request', coords: [26.9250, 75.7350], title: 'Customer request', detail: 'Urgent electrical repair needed' }
    ];

    const colors = { worker: '#18ae79', booking: '#d96f4d', demand: '#c94b3e', request: '#e6aa3b' };
    const markers = points.map(point => {
      const marker = L.circleMarker(point.coords, {
        radius: point.category === 'demand' ? 11 : 8,
        color: '#fff',
        weight: 3,
        fillColor: colors[point.category],
        fillOpacity: 0.95
      }).addTo(map);
      marker.bindPopup(`<strong>${point.title}</strong><br><span>${point.detail}</span>`);
      marker.category = point.category;
      return marker;
    });

    document.querySelectorAll('.legend-item').forEach(button => button.addEventListener('click', () => {
      const category = button.dataset.category;
      button.classList.toggle('is-active');
      markers.filter(marker => marker.category === category)
        .forEach(marker => button.classList.contains('is-active') ? marker.addTo(map) : map.removeLayer(marker));
    }));

    document.getElementById('use-location')?.addEventListener('click', () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          map.setView([coords.latitude, coords.longitude], 14);
          L.marker([coords.latitude, coords.longitude]).addTo(map).bindPopup('<strong>You are here</strong>').openPopup();
        },
        () => alert('Location access was not available. Showing Jaipur network instead.')
      );
    });

    setTimeout(() => map.invalidateSize(true), 200);
    window.addEventListener('resize', () => map.invalidateSize(true));
  }

  /* =====================================================
     4. MOBILE NAV TOGGLE
     ===================================================== */
  const navbar = document.querySelector('.navbar');
  const menuToggle = document.querySelector('.menu-toggle');
  if (navbar && menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navbar.classList.toggle('nav-open');
      menuToggle.classList.toggle('is-active', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
    navbar.querySelectorAll('.nav-links a, .nav-actions a').forEach(link => {
      link.addEventListener('click', () => {
        navbar.classList.remove('nav-open');
        menuToggle.classList.remove('is-active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* =====================================================
     5. SMOOTH SCROLL FOR IN-PAGE NAV LINKS
     ===================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* =====================================================
     6. STICKY NAVBAR SHADOW
     ===================================================== */
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.style.boxShadow = window.scrollY > 50 ? '0 10px 25px rgba(0,0,0,0.10)' : 'none';
    });
  }

  /* =====================================================
     7. LANGUAGE SWITCHING (i18n)
     ===================================================== */
  const translations = {
    en: {
      nav_how: "How it works", nav_services: "Services", nav_communities: "For communities", nav_cooperatives: "For cooperatives",
      nav_login: "Log in", nav_getstarted: "Get started",
      hero_eyebrow: "COOPERATIVE-POWERED SERVICE NETWORK",
      hero_h1: "Trusted help for every home.<br><em>Stronger opportunities</em> for every worker.",
      hero_lede: "ShramNexus connects households with verified local professionals while helping labour cooperatives manage work, earnings, and welfare from one platform.",
      hero_cta_find: "Find a service", hero_cta_join: "Join as a worker",
      hero_proof_title: "Built around local trust", hero_proof_sub: "5,000+ skilled workers already in the network",
      trust_workers: "skilled workers", trust_services: "services completed", trust_coops: "cooperatives", trust_rating: "average rating",
      trust_tagline: "One network. Many ways to belong.",
      services_kicker: "EVERYDAY HELP, CLOSE TO HOME",
      services_h2: "Whatever you need,<br><em>someone nearby can help.</em>",
      services_explore: "Explore all services",
      svc_plumbing_t: "Plumbing", svc_plumbing_d: "Repairs, fittings & maintenance",
      svc_electrical_t: "Electrical", svc_electrical_d: "Repairs & installation",
      svc_cleaning_t: "Cleaning", svc_cleaning_d: "Home & office care",
      svc_caregiving_t: "Caregiving", svc_caregiving_d: "Support when it matters",
      svc_carpentry_t: "Carpentry", svc_carpentry_d: "Furniture & repairs",
      svc_driving_t: "Driving", svc_driving_d: "Transport & delivery",
      svc_gardening_t: "Gardening", svc_gardening_d: "Landscaping & maintenance",
      svc_technician_t: "Technician", svc_technician_d: "Tech repair & support",
      map_kicker: "LIVE LOCAL NETWORK", map_h2: "Services around you.",
      map_p: "Explore verified workers, active bookings, and areas with rising demand.",
      map_locbtn: "Use my location",
      legend_workers: "Available workers", legend_bookings: "Active bookings",
      legend_demand: "High-demand zones", legend_requests: "Customer requests",
      features_kicker: "THE SHRAMNEXUS DIFFERENCE",
      features_h2: "Everything you need.<br><em>One simple platform.</em>",
      feat_1: "Find verified<br>professionals", feat_2: "Location-based<br>matching", feat_3: "Easy scheduling",
      feat_4: "Secure digital<br>payments", feat_5: "Digital invoices", feat_6: "Ratings &<br>reviews",
      feat_7: "Service tracking", feat_8: "Emergency<br>booking",
      access_kicker: "DESIGNED FOR EVERYONE",
      access_h2: "Technology that speaks<br><em>your language.</em>",
      access_explore: "Explore ShramNexus",
      worker_kicker: "FOR SKILLED WORKERS",
     
      worker_h2: "Your skills deserve more<br><em>opportunities.</em>",
      worker_p: "Build your professional identity, discover jobs, grow your reputation, and access cooperative welfare benefits — all from one platform.",
      
      how_kicker: "SIMPLE BY DESIGN",
      how_h2: "From “I need help”<br><em>to “all sorted.”</em>",
      step1_t: "Tell us what you need", step1_d: "Describe a service in your own words, in your own language.",
      step2_t: "Get intelligently matched", step2_d: "We find verified nearby workers by skill, rating, location, and availability.",
      step3_t: "Book with confidence", step3_d: "Choose a time, track the service, pay securely, and leave a rating.",
      step4_t: "Help the network grow", step4_d: "Every booking supports local workers and strengthens the cooperative behind them.",
      communities_kicker: "ONE PLATFORM. THREE COMMUNITIES.",
      communities_h2: "Shared prosperity,<br><em>designed into every booking.</em>",
      comm1_num: "01 / FOR HOUSEHOLDS", comm1_h3: "Find trusted help nearby.",
      comm1_p: "Book skilled professionals you can trust, with transparent ratings, secure payments, and support when you need it most.",
      comm1_link: "Find a service",
      comm2_num: "02 / FOR WORKERS", comm2_h3: "Turn your skills into opportunity.",
      comm2_p: "Build a professional identity, discover better jobs, grow your reputation, and access cooperative welfare benefits.",
      comm2_link: "Join as a worker",
      comm3_num: "03 / FOR COOPERATIVES", comm3_h3: "Coordinate with intelligence.",
      comm3_p: "Manage your workforce, anticipate demand, allocate jobs, and measure impact from one cooperative-owned platform.",
      comm3_link: "Explore cooperatives",
      final_kicker: "READY WHEN YOU ARE",
      final_h2: "Your next service is just<br><em>a few clicks away.</em>",
      final_p: "Find trusted professionals. Support skilled workers. Strengthen local cooperatives.",
      footer_tagline: "Connecting skills.<br>Creating opportunities."
    },
    hi: {
      nav_how: "यह कैसे काम करता है", nav_services: "सेवाएँ", nav_communities: "समुदायों के लिए", nav_cooperatives: "सहकारी समितियों के लिए",
      nav_login: "लॉग इन करें", nav_getstarted: "शुरू करें",
      hero_eyebrow: "सहकारी-संचालित सेवा नेटवर्क",
      hero_h1: "हर घर के लिए भरोसेमंद मदद।<br><em>हर कामगार के लिए</em> बेहतर अवसर।",
      hero_lede: "ShramNexus घरों को सत्यापित स्थानीय पेशेवरों से जोड़ता है, और श्रम सहकारी समितियों को काम, कमाई और कल्याण एक ही मंच से प्रबंधित करने में मदद करता है।",
      hero_cta_find: "सेवा खोजें", hero_cta_join: "कामगार के रूप में जुड़ें",
      hero_proof_title: "स्थानीय भरोसे पर आधारित", hero_proof_sub: "नेटवर्क में पहले से ही 5,000+ कुशल कामगार",
      trust_workers: "कुशल कामगार", trust_services: "पूरी की गई सेवाएँ", trust_coops: "सहकारी समितियाँ", trust_rating: "औसत रेटिंग",
      trust_tagline: "एक नेटवर्क। जुड़ने के कई तरीके।",
      services_kicker: "रोज़मर्रा की मदद, घर के करीब",
      services_h2: "जो भी आपको चाहिए,<br><em>पास का कोई मदद कर सकता है।</em>",
      services_explore: "सभी सेवाएँ देखें",
      svc_plumbing_t: "प्लंबिंग", svc_plumbing_d: "मरम्मत, फिटिंग और रखरखाव",
      svc_electrical_t: "इलेक्ट्रिकल", svc_electrical_d: "मरम्मत और इंस्टॉलेशन",
      svc_cleaning_t: "सफाई", svc_cleaning_d: "घर और ऑफिस की देखभाल",
      svc_caregiving_t: "देखभाल", svc_caregiving_d: "जरूरत के समय सहायता",
      svc_carpentry_t: "बढ़ईगिरी", svc_carpentry_d: "फर्नीचर और मरम्मत",
      svc_driving_t: "ड्राइविंग", svc_driving_d: "परिवहन और डिलीवरी",
      svc_gardening_t: "बागवानी", svc_gardening_d: "लैंडस्केपिंग और रखरखाव",
      svc_technician_t: "तकनीशियन", svc_technician_d: "तकनीकी मरम्मत और सहायता",
      map_kicker: "लाइव लोकल नेटवर्क", map_h2: "आपके आसपास की सेवाएँ।",
      map_p: "सत्यापित कामगार, सक्रिय बुकिंग, और बढ़ती मांग वाले क्षेत्र देखें।",
      map_locbtn: "मेरी लोकेशन का उपयोग करें",
      legend_workers: "उपलब्ध कामगार", legend_bookings: "सक्रिय बुकिंग",
      legend_demand: "उच्च-मांग वाले क्षेत्र", legend_requests: "ग्राहक अनुरोध",
      features_kicker: "SHRAMNEXUS की खासियत",
      features_h2: "आपको जो चाहिए, सब कुछ।<br><em>एक सरल मंच।</em>",
      feat_1: "सत्यापित<br>पेशेवर खोजें", feat_2: "लोकेशन-आधारित<br>मैचिंग", feat_3: "आसान शेड्यूलिंग",
      feat_4: "सुरक्षित डिजिटल<br>भुगतान", feat_5: "डिजिटल इनवॉइस", feat_6: "रेटिंग और<br>समीक्षाएँ",
      feat_7: "सेवा ट्रैकिंग", feat_8: "आपातकालीन<br>बुकिंग",
      access_kicker: "सभी के लिए डिज़ाइन किया गया",
      access_h2: "ऐसी तकनीक जो<br><em>आपकी भाषा बोलती है।</em>",
      access_explore: "ShramNexus देखें",
      worker_kicker: "कुशल कामगारों के लिए",
      worker_h2: "आपके हुनर के लिए<br><em>और भी अवसर।</em>",
      worker_p: "अपनी पेशेवर पहचान बनाएं, नए काम खोजें, अपनी प्रतिष्ठा बढ़ाएं, और एक ही मंच से सहकारी कल्याण लाभ पाएं।",
      how_kicker: "आसान और सीधा",
      how_h2: "“मुझे मदद चाहिए”<br><em>से “सब कुछ तैयार” तक।</em>",
      step1_t: "हमें बताएं आपको क्या चाहिए", step1_d: "अपनी भाषा में, अपने शब्दों में सेवा बताएं।",
      step2_t: "समझदारी से मैच पाएं", step2_d: "हम कौशल, रेटिंग, लोकेशन और उपलब्धता के आधार पर पास के सत्यापित कामगार खोजते हैं।",
      step3_t: "भरोसे के साथ बुक करें", step3_d: "समय चुनें, सेवा ट्रैक करें, सुरक्षित भुगतान करें, और रेटिंग दें।",
      step4_t: "नेटवर्क को बढ़ने में मदद करें", step4_d: "हर बुकिंग स्थानीय कामगारों और उनकी सहकारी समिति को मजबूत बनाती है।",
      communities_kicker: "एक मंच। तीन समुदाय।",
      communities_h2: "साझा समृद्धि,<br><em>हर बुकिंग में शामिल।</em>",
      comm1_num: "01 / घरों के लिए", comm1_h3: "पास में भरोसेमंद मदद पाएं।",
      comm1_p: "पारदर्शी रेटिंग, सुरक्षित भुगतान, और जरूरत के समय सहायता के साथ भरोसेमंद पेशेवर बुक करें।",
      comm1_link: "सेवा खोजें",
      comm2_num: "02 / कामगारों के लिए", comm2_h3: "अपने हुनर को अवसर में बदलें।",
      comm2_p: "पेशेवर पहचान बनाएं, बेहतर काम खोजें, प्रतिष्ठा बढ़ाएं, और सहकारी कल्याण लाभ पाएं।",
      comm2_link: "कामगार के रूप में जुड़ें",
      comm3_num: "03 / सहकारी समितियों के लिए", comm3_h3: "समझदारी से समन्वय करें।",
      comm3_p: "अपने कार्यबल का प्रबंधन करें, मांग का अनुमान लगाएं, काम बाँटें, और एक ही मंच से प्रभाव मापें।",
      comm3_link: "सहकारी समितियाँ देखें",
      final_kicker: "जब आप तैयार हों",
      final_h2: "आपकी अगली सेवा<br><em>बस कुछ क्लिक दूर है।</em>",
      final_p: "भरोसेमंद पेशेवर पाएं। कुशल कामगारों का साथ दें। स्थानीय सहकारी समितियों को मजबूत बनाएं।",
      footer_tagline: "हुनर को जोड़ना।<br>अवसर बनाना।"
    }
  };

  const STORAGE_KEY = 'shramnexus-lang';

  function applyLanguage(lang) {
    const dict = translations[lang] || translations['en'];
    if (!dict) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.textContent = dict[key];
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });

    document.querySelectorAll('.lang-pill').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.lang === lang);
    });

    const navSelect = document.getElementById('nav-language-select');
    if (navSelect && navSelect.value !== lang) navSelect.value = lang;

    document.documentElement.lang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
  }

  document.querySelectorAll('.lang-pill').forEach(btn => {
    btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
  });

  const navSelect = document.getElementById('nav-language-select');
  if (navSelect) {
    navSelect.addEventListener('change', () => applyLanguage(navSelect.value));
  }

  let savedLang = 'en';
  try { savedLang = localStorage.getItem(STORAGE_KEY) || 'en'; } catch (e) { /* ignore */ }
  if (translations[savedLang]) applyLanguage(savedLang);

  /* =====================================================
     8. SERVICE BOOKING MODAL & LOCALSTORAGE
     ===================================================== */
  
  // Realistic Mock Data for Providers 
  const mockServices = {
    plumbing: { title: 'Plumbing', img: './plumbing.jfif', desc: 'Repairs, fittings & maintenance for all your plumbing needs.', wName: 'Raj Kumar', wAvatar: 'RK', wRating: '★ 4.8', wExp: '6 Years', wPrice: '₹450+', wLoc: '⌖ 1.8 km away' },
    electrical: { title: 'Electrical', img: './electral.jfif', desc: 'Safe and reliable electrical repairs and installations.', wName: 'Meena Devi', wAvatar: 'MD', wRating: '★ 4.9', wExp: '8 Years', wPrice: '₹350+', wLoc: '⌖ 2.5 km away' },
    cleaning: { title: 'Cleaning', img: './cleaning.jfif', desc: 'Thorough home and office cleaning services.', wName: 'Sunita Sharma', wAvatar: 'SS', wRating: '★ 4.7', wExp: '4 Years', wPrice: '₹600+', wLoc: '⌖ 3.2 km away' },
    caregiving: { title: 'Caregiving', img: './caregiving.jfif', desc: 'Compassionate support and caregiving for your loved ones.', wName: 'Pooja Verma', wAvatar: 'PV', wRating: '★ 4.9', wExp: '10 Years', wPrice: '₹800/day', wLoc: '⌖ 4.1 km away' },
    carpentry: { title: 'Carpentry', img: './carpentry.jfif', desc: 'Custom furniture and reliable carpentry repairs.', wName: 'Rakesh Meena', wAvatar: 'RM', wRating: '★ 4.6', wExp: '12 Years', wPrice: '₹500+', wLoc: '⌖ 1.5 km away' },
    driving: { title: 'Driving', img: './driving.jfif', desc: 'Professional transport and delivery services.', wName: 'Vikram Yadav', wAvatar: 'VY', wRating: '★ 4.8', wExp: '7 Years', wPrice: '₹400/trip', wLoc: '⌖ 0.8 km away' },
    gardening: { title: 'Gardening', img: './gardening.jfif', desc: 'Expert landscaping and garden maintenance.', wName: 'Neha Gupta', wAvatar: 'NG', wRating: '★ 4.7', wExp: '5 Years', wPrice: '₹350+', wLoc: '⌖ 2.9 km away' },
    technician: { title: 'Technician', img: './technician.jfif', desc: 'Quick and efficient technical repair and support.', wName: 'Amit Singh', wAvatar: 'AS', wRating: '★ 4.8', wExp: '9 Years', wPrice: '₹700+', wLoc: '⌖ 3.5 km away' }
  };

  const modal = document.getElementById('service-booking-modal');
  const viewDetails = document.getElementById('modal-view-details');
  const viewForm = document.getElementById('modal-view-form');
  const viewSuccess = document.getElementById('modal-view-success');

  const closeModal = () => {
    modal.classList.remove('is-active');
    setTimeout(() => {
      viewDetails.style.display = 'block';
      viewForm.style.display = 'none';
      viewSuccess.style.display = 'none';
      document.getElementById('service-booking-form').reset();
    }, 300);
  };

  if (modal) {
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.getElementById('btn-close-success').addEventListener('click', closeModal);
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Advance to Booking Form
    document.getElementById('btn-proceed-book').addEventListener('click', () => {
      viewDetails.style.display = 'none';
      viewForm.style.display = 'block';
    });

    // Go Back to Details
    document.getElementById('btn-back-details').addEventListener('click', () => {
      viewForm.style.display = 'none';
      viewDetails.style.display = 'block';
    });

    // Submit Booking
    document.getElementById('service-booking-form').addEventListener('submit', (e) => {
      e.preventDefault();
      
      const bookingData = {
        service: document.getElementById('modal-service-title').innerText,
        worker: document.getElementById('modal-worker-name').innerText,
        name: document.getElementById('b-name').value,
        phone: document.getElementById('b-phone').value,
        address: document.getElementById('b-address').value,
        date: document.getElementById('b-date').value,
        time: document.getElementById('b-time').value,
        requirements: document.getElementById('b-req').value,
        timestamp: new Date().toISOString()
      };
      
      // Save data locally
      const existingBookings = JSON.parse(localStorage.getItem('shramnexus-bookings') || '[]');
      existingBookings.push(bookingData);
      localStorage.setItem('shramnexus-bookings', JSON.stringify(existingBookings));
      
      // Show Success View
      window.location.href = 'slip.html';
    });

    // Attach functionality to service cards
    document.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        
        const serviceKey = card.getAttribute('data-service');
        const data = mockServices[serviceKey];
        
        if (data) {
          document.getElementById('modal-service-img').src = data.img;
          document.getElementById('modal-service-img').alt = data.title;
          document.getElementById('modal-service-title').innerText = data.title;
          document.getElementById('modal-service-desc').innerText = data.desc;
          
          document.getElementById('modal-worker-avatar').innerText = data.wAvatar;
          document.getElementById('modal-worker-name').innerText = data.wName;
          document.getElementById('modal-worker-rating').innerText = data.wRating;
          document.getElementById('modal-worker-exp').innerText = `Experience: ${data.wExp}`;
          document.getElementById('modal-worker-price').innerText = data.wPrice;
          document.getElementById('modal-worker-loc').innerText = data.wLoc;
          
          modal.classList.add('is-active');
        }
      });
      
      // Ensure cards are accessible via keyboard Enter/Space
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  }

  console.log('✅ ShramNexus script.js loaded — Service Modals, Form validation, and LocaStorage booking logic are fully active.');
});