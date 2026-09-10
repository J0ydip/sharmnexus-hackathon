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
   ========================================================= */

const initScript = () => {

  /* =====================================================
     1. CUSTOM CURSOR DOT
     ===================================================== */
  const cursorDot = document.querySelector('.cursor-dot');
  if (cursorDot && window.matchMedia('(pointer: fine)').matches) {
    document.body.classList.add('has-custom-cursor');
    window.addEventListener('mousemove', (e) => {
      cursorDot.style.opacity = '1';
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

    // Interactive Demand Zone Focus
    document.querySelectorAll('.dzc-focus-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const lat = parseFloat(button.dataset.lat);
        const lng = parseFloat(button.dataset.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          map.flyTo([lat, lng], 14, { duration: 1.2 });
          const target = markers.find(m => {
            const ll = m.getLatLng();
            return Math.abs(ll.lat - lat) < 0.005 && Math.abs(ll.lng - lng) < 0.005;
          });
          if (target) {
            if (!map.hasLayer(target)) target.addTo(map);
            target.openPopup();
          }
          const mapCard = document.querySelector('.map-card');
          if (mapCard) {
            mapCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });
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
     6. STICKY NAVBAR
     ===================================================== */
  // Handled via Tailwind utility classes directly

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
    },
    bn: {
      nav_how: "যেভাবে কাজ করে", nav_services: "সেবাসমূহ", nav_communities: "সম্প্রদায়ের জন্য", nav_cooperatives: "সমবায়ের জন্য",
      nav_login: "লগ ইন", nav_getstarted: "শুরু করুন",
      hero_eyebrow: "সমবায়-চালিত সেবা নেটওয়ার্ক",
      hero_h1: "প্রতিটি বাড়ির জন্য বিশ্বস্ত সহায়তা।<br><em>প্রতিটি কর্মীর জন্য</em> আরও ভালো সুযোগ।",
      hero_lede: "ShramNexus পরিবারগুলোকে যাচাইকৃত স্থানীয় পেশাদারদের সাথে সংযুক্ত করে, এবং শ্রম সমবায়গুলোকে কাজ, আয় ও কল্যাণ একটি প্ল্যাটফর্ম থেকে পরিচালনা করতে সাহায্য করে।",
      hero_cta_find: "সেবা খুঁজুন", hero_cta_join: "কর্মী হিসেবে যোগ দিন",
      hero_proof_title: "স্থানীয় বিশ্বাসের ভিত্তিতে গড়া", hero_proof_sub: "নেটওয়ার্কে ইতিমধ্যে ৫,০০০+ দক্ষ কর্মী",
      trust_workers: "দক্ষ কর্মী", trust_services: "সম্পন্ন সেবা", trust_coops: "সমবায়", trust_rating: "গড় রেটিং",
      trust_tagline: "একটি নেটওয়ার্ক। যুক্ত হওয়ার অনেক উপায়।",
      services_kicker: "প্রতিদিনের সহায়তা, বাড়ির কাছেই",
      services_h2: "যা কিছুই দরকার হোক,<br><em>কাছের কেউ সাহায্য করতে পারে।</em>",
      services_explore: "সব সেবা দেখুন",
      svc_plumbing_t: "প্লাম্বিং", svc_plumbing_d: "মেরামত, ফিটিং ও রক্ষণাবেক্ষণ",
      svc_electrical_t: "ইলেকট্রিক্যাল", svc_electrical_d: "মেরামত ও ইনস্টলেশন",
      svc_cleaning_t: "পরিচ্ছন্নতা", svc_cleaning_d: "বাড়ি ও অফিসের যত্ন",
      svc_caregiving_t: "পরিচর্যা", svc_caregiving_d: "প্রয়োজনের সময় সহায়তা",
      svc_carpentry_t: "কাঠমিস্ত্রি", svc_carpentry_d: "আসবাবপত্র ও মেরামত",
      svc_driving_t: "ড্রাইভিং", svc_driving_d: "পরিবহন ও ডেলিভারি",
      svc_gardening_t: "বাগান পরিচর্যা", svc_gardening_d: "ল্যান্ডস্কেপিং ও রক্ষণাবেক্ষণ",
      svc_technician_t: "টেকনিশিয়ান", svc_technician_d: "প্রযুক্তি মেরামত ও সহায়তা",
      map_kicker: "লাইভ লোকাল নেটওয়ার্ক", map_h2: "আপনার আশেপাশের সেবা।",
      map_p: "যাচাইকৃত কর্মী, চলমান বুকিং, এবং ক্রমবর্ধমান চাহিদার এলাকা দেখুন।",
      map_locbtn: "আমার অবস্থান ব্যবহার করুন",
      legend_workers: "উপলব্ধ কর্মী", legend_bookings: "চলমান বুকিং",
      legend_demand: "উচ্চ-চাহিদা এলাকা", legend_requests: "গ্রাহক অনুরোধ",
      features_kicker: "SHRAMNEXUS-এর বৈশিষ্ট্য",
      features_h2: "আপনার প্রয়োজনীয় সবকিছু।<br><em>একটি সহজ প্ল্যাটফর্ম।</em>",
      feat_1: "যাচাইকৃত<br>পেশাদার খুঁজুন", feat_2: "অবস্থান-ভিত্তিক<br>ম্যাচিং", feat_3: "সহজ সময়সূচি",
      feat_4: "নিরাপদ ডিজিটাল<br>পেমেন্ট", feat_5: "ডিজিটাল চালান", feat_6: "রেটিং ও<br>রিভিউ",
      feat_7: "সেবা ট্র্যাকিং", feat_8: "জরুরি<br>বুকিং",
      access_kicker: "সবার জন্য ডিজাইন করা",
      access_h2: "প্রযুক্তি যা<br><em>আপনার ভাষায় কথা বলে।</em>",
      access_explore: "ShramNexus দেখুন",
      worker_kicker: "দক্ষ কর্মীদের জন্য",
      worker_h2: "আপনার দক্ষতার জন্য<br><em>আরও সুযোগ।</em>",
      worker_p: "আপনার পেশাদার পরিচয় গড়ুন, কাজ খুঁজুন, সুনাম বাড়ান, এবং একটি প্ল্যাটফর্ম থেকে সমবায় কল্যাণ সুবিধা পান।",
      how_kicker: "সহজ পরিকল্পনায়",
      how_h2: "“আমার সাহায্য দরকার”<br><em>থেকে “সব ঠিক আছে” পর্যন্ত।</em>",
      step1_t: "আমাদের বলুন কী দরকার", step1_d: "নিজের ভাষায়, নিজের কথায় সেবাটি বর্ণনা করুন।",
      step2_t: "বুদ্ধিমত্তার সাথে মিলিত হন", step2_d: "আমরা দক্ষতা, রেটিং, অবস্থান ও প্রাপ্যতা অনুযায়ী কাছের যাচাইকৃত কর্মী খুঁজে দিই।",
      step3_t: "নিশ্চিন্তে বুক করুন", step3_d: "সময় বেছে নিন, সেবা ট্র্যাক করুন, নিরাপদে পেমেন্ট করুন, এবং রেটিং দিন।",
      step4_t: "নেটওয়ার্ককে বাড়তে সাহায্য করুন", step4_d: "প্রতিটি বুকিং স্থানীয় কর্মী ও তাদের সমবায়কে শক্তিশালী করে।",
      communities_kicker: "একটি প্ল্যাটফর্ম। তিনটি সম্প্রদায়।",
      communities_h2: "ভাগ করা সমৃদ্ধি,<br><em>প্রতিটি বুকিং-এ গাঁথা।</em>",
      comm1_num: "০১ / পরিবারের জন্য", comm1_h3: "কাছে বিশ্বস্ত সহায়তা খুঁজুন।",
      comm1_p: "স্বচ্ছ রেটিং, নিরাপদ পেমেন্ট, এবং প্রয়োজনের সময় সহায়তাসহ বিশ্বস্ত পেশাদার বুক করুন।",
      comm1_link: "সেবা খুঁজুন",
      comm2_num: "০২ / কর্মীদের জন্য", comm2_h3: "আপনার দক্ষতাকে সুযোগে পরিণত করুন।",
      comm2_p: "পেশাদার পরিচয় গড়ুন, ভালো কাজ খুঁজুন, সুনাম বাড়ান, এবং সমবায় কল্যাণ সুবিধা পান।",
      comm2_link: "কর্মী হিসেবে যোগ দিন",
      comm3_num: "০৩ / সমবায়ের জন্য", comm3_h3: "বুদ্ধিমত্তার সাথে সমন্বয় করুন।",
      comm3_p: "আপনার কর্মীবাহিনী পরিচালনা করুন, চাহিদা পূর্বাভাস দিন, কাজ বণ্টন করুন, এবং একটি প্ল্যাটফর্ম থেকে প্রভাব পরিমাপ করুন।",
      comm3_link: "সমবায় দেখুন",
      final_kicker: "আপনি প্রস্তুত থাকলেই",
      final_h2: "আপনার পরবর্তী সেবা<br><em>মাত্র কয়েক ক্লিক দূরে।</em>",
      final_p: "বিশ্বস্ত পেশাদার খুঁজুন। দক্ষ কর্মীদের পাশে থাকুন। স্থানীয় সমবায়কে শক্তিশালী করুন।",
      footer_tagline: "দক্ষতা সংযুক্ত করা।<br>সুযোগ তৈরি করা।"
    },
    mr: {
      nav_how: "हे कसे काम करते", nav_services: "सेवा", nav_communities: "समुदायांसाठी", nav_cooperatives: "सहकारी संस्थांसाठी",
      nav_login: "लॉग इन करा", nav_getstarted: "सुरुवात करा",
      hero_eyebrow: "सहकारी-चालित सेवा नेटवर्क",
      hero_h1: "प्रत्येक घरासाठी विश्वासार्ह मदत.<br><em>प्रत्येक कामगारासाठी</em> अधिक चांगल्या संधी.",
      hero_lede: "ShramNexus घरांना पडताळणी केलेल्या स्थानिक व्यावसायिकांशी जोडते, आणि कामगार सहकारी संस्थांना काम, कमाई व कल्याण एकाच व्यासपीठावरून सांभाळण्यास मदत करते.",
      hero_cta_find: "सेवा शोधा", hero_cta_join: "कामगार म्हणून सामील व्हा",
      hero_proof_title: "स्थानिक विश्वासावर आधारित", hero_proof_sub: "नेटवर्कमध्ये आधीच 5,000+ कुशल कामगार",
      trust_workers: "कुशल कामगार", trust_services: "पूर्ण झालेल्या सेवा", trust_coops: "सहकारी संस्था", trust_rating: "सरासरी रेटिंग",
      trust_tagline: "एक नेटवर्क. जोडण्याचे अनेक मार्ग.",
      services_kicker: "रोजची मदत, घराजवळ",
      services_h2: "तुम्हाला जे हवे ते,<br><em>जवळचा कोणीतरी मदत करू शकतो.</em>",
      services_explore: "सर्व सेवा पहा",
      svc_plumbing_t: "प्लंबिंग", svc_plumbing_d: "दुरुस्ती, फिटिंग व देखभाल",
      svc_electrical_t: "इलेक्ट्रिकल", svc_electrical_d: "दुरुस्ती व इन्स्टॉलेशन",
      svc_cleaning_t: "स्वच्छता", svc_cleaning_d: "घर व कार्यालयाची काळजी",
      svc_caregiving_t: "काळजी सेवा", svc_caregiving_d: "गरजेच्या वेळी मदत",
      svc_carpentry_t: "सुतारकाम", svc_carpentry_d: "फर्निचर व दुरुस्ती",
      svc_driving_t: "ड्रायव्हिंग", svc_driving_d: "वाहतूक व डिलिव्हरी",
      svc_gardening_t: "बागकाम", svc_gardening_d: "लँडस्केपिंग व देखभाल",
      svc_technician_t: "तंत्रज्ञ", svc_technician_d: "तांत्रिक दुरुस्ती व सहाय्य",
      map_kicker: "थेट स्थानिक नेटवर्क", map_h2: "तुमच्या आसपासच्या सेवा.",
      map_p: "पडताळणी केलेले कामगार, सक्रिय बुकिंग, आणि वाढत्या मागणीचे भाग पहा.",
      map_locbtn: "माझे स्थान वापरा",
      legend_workers: "उपलब्ध कामगार", legend_bookings: "सक्रिय बुकिंग",
      legend_demand: "उच्च-मागणी क्षेत्र", legend_requests: "ग्राहक विनंत्या",
      features_kicker: "SHRAMNEXUS चे वैशिष्ट्य",
      features_h2: "तुम्हाला हवे ते सर्व काही.<br><em>एक सोपे व्यासपीठ.</em>",
      feat_1: "पडताळणी केलेले<br>व्यावसायिक शोधा", feat_2: "स्थान-आधारित<br>जुळणी", feat_3: "सोपे वेळापत्रक",
      feat_4: "सुरक्षित डिजिटल<br>पेमेंट", feat_5: "डिजिटल इनव्हॉइस", feat_6: "रेटिंग व<br>पुनरावलोकने",
      feat_7: "सेवा ट्रॅकिंग", feat_8: "आपत्कालीन<br>बुकिंग",
      access_kicker: "सर्वांसाठी बनवलेले",
      access_h2: "तंत्रज्ञान जे<br><em>तुमची भाषा बोलते.</em>",
      access_explore: "ShramNexus पहा",
      worker_kicker: "कुशल कामगारांसाठी",
      worker_h2: "तुमच्या कौशल्यांसाठी<br><em>अधिक संधी.</em>",
      worker_p: "तुमची व्यावसायिक ओळख तयार करा, कामे शोधा, प्रतिष्ठा वाढवा, आणि एकाच व्यासपीठावरून सहकारी कल्याण लाभ मिळवा.",
      how_kicker: "सोप्या पद्धतीने",
      how_h2: "“मला मदत हवी आहे”<br><em>पासून “सर्व काही ठीक आहे” पर्यंत.</em>",
      step1_t: "तुम्हाला काय हवे ते सांगा", step1_d: "तुमच्या स्वतःच्या भाषेत, स्वतःच्या शब्दांत सेवा सांगा.",
      step2_t: "योग्य जुळणी मिळवा", step2_d: "आम्ही कौशल्य, रेटिंग, स्थान व उपलब्धतेनुसार जवळचे पडताळणी केलेले कामगार शोधतो.",
      step3_t: "विश्वासाने बुक करा", step3_d: "वेळ निवडा, सेवा ट्रॅक करा, सुरक्षित पेमेंट करा, आणि रेटिंग द्या.",
      step4_t: "नेटवर्क वाढण्यास मदत करा", step4_d: "प्रत्येक बुकिंग स्थानिक कामगार व त्यांच्या सहकारी संस्थेला बळकट करते.",
      communities_kicker: "एक व्यासपीठ. तीन समुदाय.",
      communities_h2: "सामायिक समृद्धी,<br><em>प्रत्येक बुकिंगमध्ये गुंफलेली.</em>",
      comm1_num: "०१ / कुटुंबांसाठी", comm1_h3: "जवळ विश्वासार्ह मदत शोधा.",
      comm1_p: "पारदर्शक रेटिंग, सुरक्षित पेमेंट व गरजेच्या वेळी मदतीसह विश्वासार्ह व्यावसायिक बुक करा.",
      comm1_link: "सेवा शोधा",
      comm2_num: "०२ / कामगारांसाठी", comm2_h3: "तुमच्या कौशल्यांचे संधीत रूपांतर करा.",
      comm2_p: "व्यावसायिक ओळख तयार करा, चांगली कामे शोधा, प्रतिष्ठा वाढवा, आणि सहकारी कल्याण लाभ मिळवा.",
      comm2_link: "कामगार म्हणून सामील व्हा",
      comm3_num: "०३ / सहकारी संस्थांसाठी", comm3_h3: "बुद्धिमत्तेने समन्वय साधा.",
      comm3_p: "तुमचे कर्मचारी व्यवस्थापित करा, मागणीचा अंदाज घ्या, कामे वाटप करा, आणि एकाच व्यासपीठावरून परिणाम मोजा.",
      comm3_link: "सहकारी संस्था पहा",
      final_kicker: "तुम्ही तयार असाल तेव्हा",
      final_h2: "तुमची पुढील सेवा<br><em>फक्त काही क्लिक दूर आहे.</em>",
      final_p: "विश्वासार्ह व्यावसायिक शोधा. कुशल कामगारांना पाठिंबा द्या. स्थानिक सहकारी संस्था बळकट करा.",
      footer_tagline: "कौशल्ये जोडणे.<br>संधी निर्माण करणे."
    },
    ta: {
      nav_how: "இது எப்படி செயல்படுகிறது", nav_services: "சேவைகள்", nav_communities: "சமூகங்களுக்கு", nav_cooperatives: "கூட்டுறவு சங்கங்களுக்கு",
      nav_login: "உள்நுழைய", nav_getstarted: "தொடங்குங்கள்",
      hero_eyebrow: "கூட்டுறவு-இயங்கும் சேவை நெட்வொர்க்",
      hero_h1: "ஒவ்வொரு வீட்டிற்கும் நம்பகமான உதவி.<br><em>ஒவ்வொரு தொழிலாளிக்கும்</em> சிறந்த வாய்ப்புகள்.",
      hero_lede: "ShramNexus வீடுகளை சரிபார்க்கப்பட்ட உள்ளூர் நிபுணர்களுடன் இணைக்கிறது, மேலும் தொழிலாளர் கூட்டுறவு சங்கங்கள் வேலை, வருமானம் மற்றும் நலனை ஒரே தளத்தில் நிர்வகிக்க உதவுகிறது.",
      hero_cta_find: "சேவையைத் தேடுங்கள்", hero_cta_join: "தொழிலாளியாக இணையுங்கள்",
      hero_proof_title: "உள்ளூர் நம்பிக்கையின் அடிப்படையில் கட்டமைக்கப்பட்டது", hero_proof_sub: "நெட்வொர்க்கில் ஏற்கனவே 5,000+ திறமையான தொழிலாளர்கள்",
      trust_workers: "திறமையான தொழிலாளர்கள்", trust_services: "முடிக்கப்பட்ட சேவைகள்", trust_coops: "கூட்டுறவு சங்கங்கள்", trust_rating: "சராசரி மதிப்பீடு",
      trust_tagline: "ஒரு நெட்வொர்க். இணைவதற்கு பல வழிகள்.",
      services_kicker: "தினசரி உதவி, வீட்டிற்கு அருகில்",
      services_h2: "உங்களுக்கு என்ன தேவையானாலும்,<br><em>அருகில் உள்ளவர் உதவ முடியும்.</em>",
      services_explore: "அனைத்து சேவைகளையும் பார்க்க",
      svc_plumbing_t: "பிளம்பிங்", svc_plumbing_d: "பழுதுபார்ப்பு, பொருத்துதல் மற்றும் பராமரிப்பு",
      svc_electrical_t: "மின்சாரம்", svc_electrical_d: "பழுதுபார்ப்பு மற்றும் நிறுவல்",
      svc_cleaning_t: "சுத்தம் செய்தல்", svc_cleaning_d: "வீடு மற்றும் அலுவலக பராமரிப்பு",
      svc_caregiving_t: "பராமரிப்பு", svc_caregiving_d: "தேவையான நேரத்தில் ஆதரவு",
      svc_carpentry_t: "தச்சு வேலை", svc_carpentry_d: "மரச்சாமான்கள் மற்றும் பழுதுபார்ப்பு",
      svc_driving_t: "வாகனம் ஓட்டுதல்", svc_driving_d: "போக்குவரத்து மற்றும் விநியோகம்",
      svc_gardening_t: "தோட்டவேலை", svc_gardening_d: "நிலப்பரப்பு அமைப்பு மற்றும் பராமரிப்பு",
      svc_technician_t: "தொழில்நுட்பர்", svc_technician_d: "தொழில்நுட்ப பழுது மற்றும் ஆதரவு",
      map_kicker: "நேரடி உள்ளூர் நெட்வொர்க்", map_h2: "உங்களைச் சுற்றியுள்ள சேவைகள்.",
      map_p: "சரிபார்க்கப்பட்ட தொழிலாளர்கள், நடப்பு முன்பதிவுகள், மற்றும் அதிக தேவை உள்ள பகுதிகளைப் பார்க்கவும்.",
      map_locbtn: "எனது இருப்பிடத்தைப் பயன்படுத்தவும்",
      legend_workers: "கிடைக்கும் தொழிலாளர்கள்", legend_bookings: "நடப்பு முன்பதிவுகள்",
      legend_demand: "அதிக தேவை உள்ள பகுதிகள்", legend_requests: "வாடிக்கையாளர் கோரிக்கைகள்",
      features_kicker: "SHRAMNEXUS-இன் சிறப்பம்சம்",
      features_h2: "உங்களுக்குத் தேவையான அனைத்தும்.<br><em>ஒரு எளிய தளம்.</em>",
      feat_1: "சரிபார்க்கப்பட்ட<br>நிபுணர்களைக் கண்டறியவும்", feat_2: "இருப்பிடம் அடிப்படையிலான<br>பொருத்தம்", feat_3: "எளிதான திட்டமிடல்",
      feat_4: "பாதுகாப்பான டிஜிட்டல்<br>கட்டணம்", feat_5: "டிஜிட்டல் விலைப்பட்டியல்", feat_6: "மதிப்பீடுகள் மற்றும்<br>விமர்சனங்கள்",
      feat_7: "சேவை கண்காணிப்பு", feat_8: "அவசர<br>முன்பதிவு",
      access_kicker: "அனைவருக்குமான வடிவமைப்பு",
      access_h2: "உங்கள் மொழியில் பேசும்<br><em>தொழில்நுட்பம்.</em>",
      access_explore: "ShramNexus-ஐ ஆராயுங்கள்",
      worker_kicker: "திறமையான தொழிலாளர்களுக்கு",
      worker_h2: "உங்கள் திறமைகளுக்கு<br><em>மேலும் வாய்ப்புகள்.</em>",
      worker_p: "உங்கள் தொழில்முறை அடையாளத்தை உருவாக்குங்கள், வேலைகளைக் கண்டறியுங்கள், நற்பெயரை வளர்த்துக்கொள்ளுங்கள், மேலும் ஒரே தளத்தில் கூட்டுறவு நலன் பலன்களைப் பெறுங்கள்.",
      how_kicker: "எளிமையான வடிவமைப்பு",
      how_h2: "“எனக்கு உதவி தேவை”<br><em>என்பதிலிருந்து “அனைத்தும் சரி” வரை.</em>",
      step1_t: "உங்களுக்கு என்ன தேவை என்று சொல்லுங்கள்", step1_d: "உங்கள் சொந்த மொழியில், உங்கள் சொந்த வார்த்தைகளில் சேவையை விவரிக்கவும்.",
      step2_t: "புத்திசாலித்தனமாகப் பொருத்தப்படுங்கள்", step2_d: "திறமை, மதிப்பீடு, இருப்பிடம் மற்றும் கிடைக்கும் தன்மையின் அடிப்படையில் அருகிலுள்ள சரிபார்க்கப்பட்ட தொழிலாளர்களைக் கண்டறிகிறோம்.",
      step3_t: "நம்பிக்கையுடன் முன்பதிவு செய்யுங்கள்", step3_d: "நேரத்தைத் தேர்ந்தெடுங்கள், சேவையைக் கண்காணியுங்கள், பாதுகாப்பாகக் கட்டணம் செலுத்துங்கள், மற்றும் மதிப்பீடு அளியுங்கள்.",
      step4_t: "நெட்வொர்க் வளர உதவுங்கள்", step4_d: "ஒவ்வொரு முன்பதிவும் உள்ளூர் தொழிலாளர்களையும் அவர்களின் கூட்டுறவு சங்கத்தையும் வலுப்படுத்துகிறது.",
      communities_kicker: "ஒரு தளம். மூன்று சமூகங்கள்.",
      communities_h2: "பகிரப்பட்ட செழிப்பு,<br><em>ஒவ்வொரு முன்பதிவிலும் வடிவமைக்கப்பட்டுள்ளது.</em>",
      comm1_num: "01 / குடும்பங்களுக்கு", comm1_h3: "அருகில் நம்பகமான உதவியைக் கண்டறியுங்கள்.",
      comm1_p: "வெளிப்படையான மதிப்பீடுகள், பாதுகாப்பான கட்டணங்கள், மற்றும் தேவையான நேரத்தில் ஆதரவுடன் நம்பகமான நிபுணர்களை முன்பதிவு செய்யுங்கள்.",
      comm1_link: "சேவையைத் தேடுங்கள்",
      comm2_num: "02 / தொழிலாளர்களுக்கு", comm2_h3: "உங்கள் திறமைகளை வாய்ப்பாக மாற்றுங்கள்.",
      comm2_p: "தொழில்முறை அடையாளத்தை உருவாக்குங்கள், சிறந்த வேலைகளைக் கண்டறியுங்கள், நற்பெயரை வளர்த்துக் கொள்ளுங்கள், மேலும் கூட்டுறவு நலன் பலன்களைப் பெறுங்கள்.",
      comm2_link: "தொழிலாளியாக இணையுங்கள்",
      comm3_num: "03 / கூட்டுறவு சங்கங்களுக்கு", comm3_h3: "புத்திசாலித்தனமாக ஒருங்கிணைக்கவும்.",
      comm3_p: "உங்கள் பணியாளர்களை நிர்வகிக்கவும், தேவையை முன்கூட்டியே அறியவும், வேலைகளை ஒதுக்கவும், ஒரே தளத்தில் தாக்கத்தை அளக்கவும்.",
      comm3_link: "கூட்டுறவு சங்கங்களை ஆராயுங்கள்",
      final_kicker: "நீங்கள் தயாராக இருக்கும்போது",
      final_h2: "உங்கள் அடுத்த சேவை<br><em>சில கிளிக்குகள் தொலைவில் உள்ளது.</em>",
      final_p: "நம்பகமான நிபுணர்களைக் கண்டறியுங்கள். திறமையான தொழிலாளர்களை ஆதரியுங்கள். உள்ளூர் கூட்டுறவு சங்கங்களை வலுப்படுத்துங்கள்.",
      footer_tagline: "திறமைகளை இணைத்தல்.<br>வாய்ப்புகளை உருவாக்குதல்."
    },
    te: {
      nav_how: "ఇది ఎలా పనిచేస్తుంది", nav_services: "సేవలు", nav_communities: "సంఘాల కోసం", nav_cooperatives: "సహకార సంఘాల కోసం",
      nav_login: "లాగిన్ చేయండి", nav_getstarted: "ప్రారంభించండి",
      hero_eyebrow: "సహకార-ఆధారిత సేవా నెట్‌వర్క్",
      hero_h1: "ప్రతి ఇంటికీ నమ్మకమైన సహాయం.<br><em>ప్రతి కార్మికుడికి</em> మెరుగైన అవకాశాలు.",
      hero_lede: "ShramNexus ఇళ్లను ధృవీకరించిన స్థానిక నిపుణులతో కలుపుతుంది, మరియు కార్మిక సహకార సంఘాలు పని, ఆదాయం, సంక్షేమాన్ని ఒకే వేదిక నుండి నిర్వహించడంలో సహాయపడుతుంది.",
      hero_cta_find: "సేవను కనుగొనండి", hero_cta_join: "కార్మికుడిగా చేరండి",
      hero_proof_title: "స్థానిక నమ్మకంపై ఆధారపడి నిర్మించబడింది", hero_proof_sub: "నెట్‌వర్క్‌లో ఇప్పటికే 5,000+ నైపుణ్యం గల కార్మికులు",
      trust_workers: "నైపుణ్యం గల కార్మికులు", trust_services: "పూర్తయిన సేవలు", trust_coops: "సహకార సంఘాలు", trust_rating: "సగటు రేటింగ్",
      trust_tagline: "ఒకే నెట్‌వర్క్. చేరడానికి అనేక మార్గాలు.",
      services_kicker: "నిత్యావసర సహాయం, ఇంటికి దగ్గరగా",
      services_h2: "మీకు ఏమి కావాలన్నా,<br><em>దగ్గరలో ఉన్నవారు సహాయం చేయగలరు.</em>",
      services_explore: "అన్ని సేవలను చూడండి",
      svc_plumbing_t: "ప్లంబింగ్", svc_plumbing_d: "మరమ్మతులు, ఫిట్టింగ్‌లు & నిర్వహణ",
      svc_electrical_t: "ఎలక్ట్రికల్", svc_electrical_d: "మరమ్మతులు & ఇన్‌స్టాలేషన్",
      svc_cleaning_t: "శుభ్రపరచడం", svc_cleaning_d: "ఇల్లు & కార్యాలయ సంరక్షణ",
      svc_caregiving_t: "సంరక్షణ", svc_caregiving_d: "అవసరమైనప్పుడు మద్దతు",
      svc_carpentry_t: "వడ్రంగం", svc_carpentry_d: "ఫర్నిచర్ & మరమ్మతులు",
      svc_driving_t: "డ్రైవింగ్", svc_driving_d: "రవాణా & డెలివరీ",
      svc_gardening_t: "తోటపని", svc_gardening_d: "ల్యాండ్‌స్కేపింగ్ & నిర్వహణ",
      svc_technician_t: "టెక్నీషియన్", svc_technician_d: "సాంకేతిక మరమ్మతు & మద్దతు",
      map_kicker: "లైవ్ లోకల్ నెట్‌వర్క్", map_h2: "మీ చుట్టుపక్కల సేవలు.",
      map_p: "ధృవీకరించిన కార్మికులు, జరుగుతున్న బుకింగ్‌లు, మరియు పెరుగుతున్న డిమాండ్ ఉన్న ప్రాంతాలను చూడండి.",
      map_locbtn: "నా స్థానాన్ని ఉపయోగించండి",
      legend_workers: "అందుబాటులో ఉన్న కార్మికులు", legend_bookings: "జరుగుతున్న బుకింగ్‌లు",
      legend_demand: "అధిక-డిమాండ్ ప్రాంతాలు", legend_requests: "కస్టమర్ అభ్యర్థనలు",
      features_kicker: "SHRAMNEXUS ప్రత్యేకత",
      features_h2: "మీకు కావలసినవన్నీ.<br><em>ఒకే సరళమైన వేదిక.</em>",
      feat_1: "ధృవీకరించిన<br>నిపుణులను కనుగొనండి", feat_2: "స్థాన-ఆధారిత<br>మ్యాచింగ్", feat_3: "సులభమైన షెడ్యూలింగ్",
      feat_4: "సురక్షిత డిజిటల్<br>చెల్లింపులు", feat_5: "డిజిటల్ ఇన్వాయిస్‌లు", feat_6: "రేటింగ్‌లు &<br>సమీక్షలు",
      feat_7: "సేవా ట్రాకింగ్", feat_8: "అత్యవసర<br>బుకింగ్",
      access_kicker: "అందరి కోసం రూపొందించబడింది",
      access_h2: "మీ భాషలో మాట్లాడే<br><em>సాంకేతికత.</em>",
      access_explore: "ShramNexusని అన్వేషించండి",
      worker_kicker: "నైపుణ్యం గల కార్మికుల కోసం",
      worker_h2: "మీ నైపుణ్యాలకు<br><em>మరిన్ని అవకాశాలు.</em>",
      worker_p: "మీ వృత్తిపరమైన గుర్తింపును నిర్మించండి, ఉద్యోగాలను కనుగొనండి, మీ ప్రతిష్టను పెంచుకోండి, మరియు ఒకే వేదిక నుండి సహకార సంక్షేమ ప్రయోజనాలను పొందండి.",
      how_kicker: "సరళమైన రూపకల్పన",
      how_h2: "“నాకు సహాయం కావాలి”<br><em>నుండి “అంతా సర్దుకుంది” వరకు.</em>",
      step1_t: "మీకు ఏమి కావాలో మాకు చెప్పండి", step1_d: "మీ స్వంత మాటల్లో, మీ స్వంత భాషలో సేవను వివరించండి.",
      step2_t: "తెలివిగా జతచేయబడండి", step2_d: "నైపుణ్యం, రేటింగ్, స్థానం మరియు లభ్యత ఆధారంగా సమీపంలోని ధృవీకరించిన కార్మికులను మేము కనుగొంటాము.",
      step3_t: "నమ్మకంతో బుక్ చేయండి", step3_d: "సమయాన్ని ఎంచుకోండి, సేవను ట్రాక్ చేయండి, సురక్షితంగా చెల్లించండి, మరియు రేటింగ్ ఇవ్వండి.",
      step4_t: "నెట్‌వర్క్ పెరగడానికి సహాయపడండి", step4_d: "ప్రతి బుకింగ్ స్థానిక కార్మికులను మరియు వారి సహకార సంఘాన్ని బలోపేతం చేస్తుంది.",
      communities_kicker: "ఒక వేదిక. మూడు సంఘాలు.",
      communities_h2: "పంచుకున్న శ్రేయస్సు,<br><em>ప్రతి బుకింగ్‌లో రూపొందించబడింది.</em>",
      comm1_num: "01 / గృహాల కోసం", comm1_h3: "సమీపంలో నమ్మకమైన సహాయాన్ని కనుగొనండి.",
      comm1_p: "పారదర్శక రేటింగ్‌లు, సురక్షిత చెల్లింపులు, మరియు అవసరమైనప్పుడు మద్దతుతో నమ్మకమైన నిపుణులను బుక్ చేయండి.",
      comm1_link: "సేవను కనుగొనండి",
      comm2_num: "02 / కార్మికుల కోసం", comm2_h3: "మీ నైపుణ్యాలను అవకాశంగా మార్చుకోండి.",
      comm2_p: "వృత్తిపరమైన గుర్తింపును నిర్మించండి, మెరుగైన ఉద్యోగాలను కనుగొనండి, ప్రతిష్టను పెంచుకోండి, మరియు సహకార సంక్షేమ ప్రయోజనాలను పొందండి.",
      comm2_link: "కార్మికుడిగా చేరండి",
      comm3_num: "03 / సహకార సంఘాల కోసం", comm3_h3: "తెలివిగా సమన్వయం చేయండి.",
      comm3_p: "మీ శ్రామిక శక్తిని నిర్వహించండి, డిమాండ్‌ను ముందుగానే అంచనా వేయండి, ఉద్యోగాలను కేటాయించండి, మరియు ఒకే వేదిక నుండి ప్రభావాన్ని కొలవండి.",
      comm3_link: "సహకార సంఘాలను అన్వేషించండి",
      final_kicker: "మీరు సిద్ధంగా ఉన్నప్పుడు",
      final_h2: "మీ తదుపరి సేవ<br><em>కొన్ని క్లిక్‌ల దూరంలో ఉంది.</em>",
      final_p: "నమ్మకమైన నిపుణులను కనుగొనండి. నైపుణ్యం గల కార్మికులకు మద్దతు ఇవ్వండి. స్థానిక సహకార సంఘాలను బలోపేతం చేయండి.",
      footer_tagline: "నైపుణ్యాలను అనుసంధానించడం.<br>అవకాశాలను సృష్టించడం."
    }
  };

  const STORAGE_KEY = 'shramnexus-lang';

  function applyLanguage(lang) {
    const dict = translations[lang];
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

  console.log('✅ ShramNexus script.js loaded — cursor, counters, map, mobile nav, and 6-language switching are live.');
};

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScript);
  } else {
    setTimeout(initScript, 50);
  }
}