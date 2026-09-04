/* =========================================================
   SHARMNEXUS â€” script.js
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

const init = () => {

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
      { category: 'worker', coords: [26.9157, 75.8010], title: 'Raj Kumar', detail: 'Verified Plumber Â· 4.8 â˜… Â· Available today' },
      { category: 'worker', coords: [26.8957, 75.8125], title: 'Meena Devi', detail: 'Verified Electrician Â· 4.9 â˜… Â· Available now' },
      { category: 'worker', coords: [26.9352, 75.7812], title: 'Amit Singh', detail: 'Verified Technician Â· 4.7 â˜… Â· Available today' },
      { category: 'worker', coords: [26.9291, 75.7685], title: 'Sunita Sharma', detail: 'Verified Cleaner Â· 4.8 â˜… Â· Available today' },
      { category: 'worker', coords: [26.8842, 75.8038], title: 'Rakesh Meena', detail: 'Verified Carpenter Â· 4.6 â˜… Â· Available now' },
      { category: 'worker', coords: [26.9480, 75.7820], title: 'Pooja Verma', detail: 'Verified Caregiver Â· 4.9 â˜… Â· Available today' },
      { category: 'worker', coords: [26.9065, 75.8450], title: 'Vikram Yadav', detail: 'Verified Driver Â· 4.7 â˜… Â· Available now' },
      { category: 'worker', coords: [26.8715, 75.7900], title: 'Neha Gupta', detail: 'Verified Gardener Â· 4.8 â˜… Â· Available today' },
      { category: 'worker', coords: [26.9580, 75.8200], title: 'Mohit Jain', detail: 'Verified Plumber Â· 4.7 â˜… Â· Available today' },
      { category: 'worker', coords: [26.9200, 75.7500], title: 'Kavita Rao', detail: 'Verified Electrician Â· 4.9 â˜… Â· Available now' },
      { category: 'worker', coords: [26.8780, 75.8350], title: 'Arun Patel', detail: 'Verified Technician Â· 4.6 â˜… Â· Available today' },
      { category: 'worker', coords: [26.9400, 75.8500], title: 'Nisha Khan', detail: 'Verified Cleaner Â· 4.8 â˜… Â· Available now' },
      { category: 'booking', coords: [26.9028, 75.7870], title: 'Active booking', detail: 'Home cleaning in progress' },
      { category: 'booking', coords: [26.9270, 75.8060], title: 'Active booking', detail: 'Carpentry visit scheduled' },
      { category: 'booking', coords: [26.8880, 75.7700], title: 'Active booking', detail: 'Electrical installation underway' },
      { category: 'booking', coords: [26.9470, 75.7980], title: 'Active booking', detail: 'Caregiving visit in progress' },
      { category: 'booking', coords: [26.9180, 75.8200], title: 'Active booking', detail: 'Plumbing repair underway' },
      { category: 'booking', coords: [26.8720, 75.8150], title: 'Active booking', detail: 'Garden maintenance underway' },
      { category: 'booking', coords: [26.9340, 75.7480], title: 'Active booking', detail: 'Technician visit scheduled' },
      { category: 'booking', coords: [26.9600, 75.8000], title: 'Active booking', detail: 'Delivery service in progress' },
      { category: 'demand', coords: [26.9120, 75.7700], title: 'Zone A Â· High demand', detail: 'Plumbing requests are up 23%' },
      { category: 'demand', coords: [26.8850, 75.7750], title: 'Zone B Â· High demand', detail: 'Electrical requests are up 17%' },
      { category: 'demand', coords: [26.9450, 75.8420], title: 'Zone C Â· High demand', detail: 'Cleaning requests are up 19%' },
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
      hero_lede: "SharmNexus connects households with verified local professionals while helping labour cooperatives manage work, earnings, and welfare from one platform.",
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
      features_kicker: "THE SHARMNEXUS DIFFERENCE",
      features_h2: "Everything you need.<br><em>One simple platform.</em>",
      feat_1: "Find verified<br>professionals", feat_2: "Location-based<br>matching", feat_3: "Easy scheduling",
      feat_4: "Secure digital<br>payments", feat_5: "Digital invoices", feat_6: "Ratings &<br>reviews",
      feat_7: "Service tracking", feat_8: "Emergency<br>booking",
      access_kicker: "DESIGNED FOR EVERYONE",
      access_h2: "Technology that speaks<br><em>your language.</em>",
      access_explore: "Explore SharmNexus",
      worker_kicker: "FOR SKILLED WORKERS",
      worker_h2: "Your skills deserve more<br><em>opportunities.</em>",
      worker_p: "Build your professional identity, discover jobs, grow your reputation, and access cooperative welfare benefits â€” all from one platform.",
      how_kicker: "SIMPLE BY DESIGN",
      how_h2: "From â€œI need helpâ€<br><em>to â€œall sorted.â€</em>",
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
      nav_how: "à¤¯à¤¹ à¤•à¥ˆà¤¸à¥‡ à¤•à¤¾à¤® à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆ", nav_services: "à¤¸à¥‡à¤µà¤¾à¤à¤", nav_communities: "à¤¸à¤®à¥à¤¦à¤¾à¤¯à¥‹à¤‚ à¤•à¥‡ à¤²à¤¿à¤", nav_cooperatives: "à¤¸à¤¹à¤•à¤¾à¤°à¥€ à¤¸à¤®à¤¿à¤¤à¤¿à¤¯à¥‹à¤‚ à¤•à¥‡ à¤²à¤¿à¤",
      nav_login: "à¤²à¥‰à¤— à¤‡à¤¨ à¤•à¤°à¥‡à¤‚", nav_getstarted: "à¤¶à¥à¤°à¥‚ à¤•à¤°à¥‡à¤‚",
      hero_eyebrow: "à¤¸à¤¹à¤•à¤¾à¤°à¥€-à¤¸à¤‚à¤šà¤¾à¤²à¤¿à¤¤ à¤¸à¥‡à¤µà¤¾ à¤¨à¥‡à¤Ÿà¤µà¤°à¥à¤•",
      hero_h1: "à¤¹à¤° à¤˜à¤° à¤•à¥‡ à¤²à¤¿à¤ à¤­à¤°à¥‹à¤¸à¥‡à¤®à¤‚à¤¦ à¤®à¤¦à¤¦à¥¤<br><em>à¤¹à¤° à¤•à¤¾à¤®à¤—à¤¾à¤° à¤•à¥‡ à¤²à¤¿à¤</em> à¤¬à¥‡à¤¹à¤¤à¤° à¤…à¤µà¤¸à¤°à¥¤",
      hero_lede: "SharmNexus à¤˜à¤°à¥‹à¤‚ à¤•à¥‹ à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¿à¤¤ à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤ªà¥‡à¤¶à¥‡à¤µà¤°à¥‹à¤‚ à¤¸à¥‡ à¤œà¥‹à¤¡à¤¼à¤¤à¤¾ à¤¹à¥ˆ, à¤”à¤° à¤¶à¥à¤°à¤® à¤¸à¤¹à¤•à¤¾à¤°à¥€ à¤¸à¤®à¤¿à¤¤à¤¿à¤¯à¥‹à¤‚ à¤•à¥‹ à¤•à¤¾à¤®, à¤•à¤®à¤¾à¤ˆ à¤”à¤° à¤•à¤²à¥à¤¯à¤¾à¤£ à¤à¤• à¤¹à¥€ à¤®à¤‚à¤š à¤¸à¥‡ à¤ªà¥à¤°à¤¬à¤‚à¤§à¤¿à¤¤ à¤•à¤°à¤¨à¥‡ à¤®à¥‡à¤‚ à¤®à¤¦à¤¦ à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆà¥¤",
      hero_cta_find: "à¤¸à¥‡à¤µà¤¾ à¤–à¥‹à¤œà¥‡à¤‚", hero_cta_join: "à¤•à¤¾à¤®à¤—à¤¾à¤° à¤•à¥‡ à¤°à¥‚à¤ª à¤®à¥‡à¤‚ à¤œà¥à¤¡à¤¼à¥‡à¤‚",
      hero_proof_title: "à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤­à¤°à¥‹à¤¸à¥‡ à¤ªà¤° à¤†à¤§à¤¾à¤°à¤¿à¤¤", hero_proof_sub: "à¤¨à¥‡à¤Ÿà¤µà¤°à¥à¤• à¤®à¥‡à¤‚ à¤ªà¤¹à¤²à¥‡ à¤¸à¥‡ à¤¹à¥€ 5,000+ à¤•à¥à¤¶à¤² à¤•à¤¾à¤®à¤—à¤¾à¤°",
      trust_workers: "à¤•à¥à¤¶à¤² à¤•à¤¾à¤®à¤—à¤¾à¤°", trust_services: "à¤ªà¥‚à¤°à¥€ à¤•à¥€ à¤—à¤ˆ à¤¸à¥‡à¤µà¤¾à¤à¤", trust_coops: "à¤¸à¤¹à¤•à¤¾à¤°à¥€ à¤¸à¤®à¤¿à¤¤à¤¿à¤¯à¤¾à¤", trust_rating: "à¤”à¤¸à¤¤ à¤°à¥‡à¤Ÿà¤¿à¤‚à¤—",
      trust_tagline: "à¤à¤• à¤¨à¥‡à¤Ÿà¤µà¤°à¥à¤•à¥¤ à¤œà¥à¤¡à¤¼à¤¨à¥‡ à¤•à¥‡ à¤•à¤ˆ à¤¤à¤°à¥€à¤•à¥‡à¥¤",
      services_kicker: "à¤°à¥‹à¤œà¤¼à¤®à¤°à¥à¤°à¤¾ à¤•à¥€ à¤®à¤¦à¤¦, à¤˜à¤° à¤•à¥‡ à¤•à¤°à¥€à¤¬",
      services_h2: "à¤œà¥‹ à¤­à¥€ à¤†à¤ªà¤•à¥‹ à¤šà¤¾à¤¹à¤¿à¤,<br><em>à¤ªà¤¾à¤¸ à¤•à¤¾ à¤•à¥‹à¤ˆ à¤®à¤¦à¤¦ à¤•à¤° à¤¸à¤•à¤¤à¤¾ à¤¹à¥ˆà¥¤</em>",
      services_explore: "à¤¸à¤­à¥€ à¤¸à¥‡à¤µà¤¾à¤à¤ à¤¦à¥‡à¤–à¥‡à¤‚",
      svc_plumbing_t: "à¤ªà¥à¤²à¤‚à¤¬à¤¿à¤‚à¤—", svc_plumbing_d: "à¤®à¤°à¤®à¥à¤®à¤¤, à¤«à¤¿à¤Ÿà¤¿à¤‚à¤— à¤”à¤° à¤°à¤–à¤°à¤–à¤¾à¤µ",
      svc_electrical_t: "à¤‡à¤²à¥‡à¤•à¥à¤Ÿà¥à¤°à¤¿à¤•à¤²", svc_electrical_d: "à¤®à¤°à¤®à¥à¤®à¤¤ à¤”à¤° à¤‡à¤‚à¤¸à¥à¤Ÿà¥‰à¤²à¥‡à¤¶à¤¨",
      svc_cleaning_t: "à¤¸à¤«à¤¾à¤ˆ", svc_cleaning_d: "à¤˜à¤° à¤”à¤° à¤‘à¤«à¤¿à¤¸ à¤•à¥€ à¤¦à¥‡à¤–à¤­à¤¾à¤²",
      svc_caregiving_t: "à¤¦à¥‡à¤–à¤­à¤¾à¤²", svc_caregiving_d: "à¤œà¤°à¥‚à¤°à¤¤ à¤•à¥‡ à¤¸à¤®à¤¯ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾",
      svc_carpentry_t: "à¤¬à¤¢à¤¼à¤ˆà¤—à¤¿à¤°à¥€", svc_carpentry_d: "à¤«à¤°à¥à¤¨à¥€à¤šà¤° à¤”à¤° à¤®à¤°à¤®à¥à¤®à¤¤",
      svc_driving_t: "à¤¡à¥à¤°à¤¾à¤‡à¤µà¤¿à¤‚à¤—", svc_driving_d: "à¤ªà¤°à¤¿à¤µà¤¹à¤¨ à¤”à¤° à¤¡à¤¿à¤²à¥€à¤µà¤°à¥€",
      svc_gardening_t: "à¤¬à¤¾à¤—à¤µà¤¾à¤¨à¥€", svc_gardening_d: "à¤²à¥ˆà¤‚à¤¡à¤¸à¥à¤•à¥‡à¤ªà¤¿à¤‚à¤— à¤”à¤° à¤°à¤–à¤°à¤–à¤¾à¤µ",
      svc_technician_t: "à¤¤à¤•à¤¨à¥€à¤¶à¤¿à¤¯à¤¨", svc_technician_d: "à¤¤à¤•à¤¨à¥€à¤•à¥€ à¤®à¤°à¤®à¥à¤®à¤¤ à¤”à¤° à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾",
      map_kicker: "à¤²à¤¾à¤‡à¤µ à¤²à¥‹à¤•à¤² à¤¨à¥‡à¤Ÿà¤µà¤°à¥à¤•", map_h2: "à¤†à¤ªà¤•à¥‡ à¤†à¤¸à¤ªà¤¾à¤¸ à¤•à¥€ à¤¸à¥‡à¤µà¤¾à¤à¤à¥¤",
      map_p: "à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¿à¤¤ à¤•à¤¾à¤®à¤—à¤¾à¤°, à¤¸à¤•à¥à¤°à¤¿à¤¯ à¤¬à¥à¤•à¤¿à¤‚à¤—, à¤”à¤° à¤¬à¤¢à¤¼à¤¤à¥€ à¤®à¤¾à¤‚à¤— à¤µà¤¾à¤²à¥‡ à¤•à¥à¤·à¥‡à¤¤à¥à¤° à¤¦à¥‡à¤–à¥‡à¤‚à¥¤",
      map_locbtn: "à¤®à¥‡à¤°à¥€ à¤²à¥‹à¤•à¥‡à¤¶à¤¨ à¤•à¤¾ à¤‰à¤ªà¤¯à¥‹à¤— à¤•à¤°à¥‡à¤‚",
      legend_workers: "à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤•à¤¾à¤®à¤—à¤¾à¤°", legend_bookings: "à¤¸à¤•à¥à¤°à¤¿à¤¯ à¤¬à¥à¤•à¤¿à¤‚à¤—",
      legend_demand: "à¤‰à¤šà¥à¤š-à¤®à¤¾à¤‚à¤— à¤µà¤¾à¤²à¥‡ à¤•à¥à¤·à¥‡à¤¤à¥à¤°", legend_requests: "à¤—à¥à¤°à¤¾à¤¹à¤• à¤…à¤¨à¥à¤°à¥‹à¤§",
      features_kicker: "SHARMNEXUS à¤•à¥€ à¤–à¤¾à¤¸à¤¿à¤¯à¤¤",
      features_h2: "à¤†à¤ªà¤•à¥‹ à¤œà¥‹ à¤šà¤¾à¤¹à¤¿à¤, à¤¸à¤¬ à¤•à¥à¤›à¥¤<br><em>à¤à¤• à¤¸à¤°à¤² à¤®à¤‚à¤šà¥¤</em>",
      feat_1: "à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¿à¤¤<br>à¤ªà¥‡à¤¶à¥‡à¤µà¤° à¤–à¥‹à¤œà¥‡à¤‚", feat_2: "à¤²à¥‹à¤•à¥‡à¤¶à¤¨-à¤†à¤§à¤¾à¤°à¤¿à¤¤<br>à¤®à¥ˆà¤šà¤¿à¤‚à¤—", feat_3: "à¤†à¤¸à¤¾à¤¨ à¤¶à¥‡à¤¡à¥à¤¯à¥‚à¤²à¤¿à¤‚à¤—",
      feat_4: "à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤ à¤¡à¤¿à¤œà¤¿à¤Ÿà¤²<br>à¤­à¥à¤—à¤¤à¤¾à¤¨", feat_5: "à¤¡à¤¿à¤œà¤¿à¤Ÿà¤² à¤‡à¤¨à¤µà¥‰à¤‡à¤¸", feat_6: "à¤°à¥‡à¤Ÿà¤¿à¤‚à¤— à¤”à¤°<br>à¤¸à¤®à¥€à¤•à¥à¤·à¤¾à¤à¤",
      feat_7: "à¤¸à¥‡à¤µà¤¾ à¤Ÿà¥à¤°à¥ˆà¤•à¤¿à¤‚à¤—", feat_8: "à¤†à¤ªà¤¾à¤¤à¤•à¤¾à¤²à¥€à¤¨<br>à¤¬à¥à¤•à¤¿à¤‚à¤—",
      access_kicker: "à¤¸à¤­à¥€ à¤•à¥‡ à¤²à¤¿à¤ à¤¡à¤¿à¤œà¤¼à¤¾à¤‡à¤¨ à¤•à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾",
      access_h2: "à¤à¤¸à¥€ à¤¤à¤•à¤¨à¥€à¤• à¤œà¥‹<br><em>à¤†à¤ªà¤•à¥€ à¤­à¤¾à¤·à¤¾ à¤¬à¥‹à¤²à¤¤à¥€ à¤¹à¥ˆà¥¤</em>",
      access_explore: "SharmNexus à¤¦à¥‡à¤–à¥‡à¤‚",
      worker_kicker: "à¤•à¥à¤¶à¤² à¤•à¤¾à¤®à¤—à¤¾à¤°à¥‹à¤‚ à¤•à¥‡ à¤²à¤¿à¤",
      worker_h2: "à¤†à¤ªà¤•à¥‡ à¤¹à¥à¤¨à¤° à¤•à¥‡ à¤²à¤¿à¤<br><em>à¤”à¤° à¤­à¥€ à¤…à¤µà¤¸à¤°à¥¤</em>",
      worker_p: "à¤…à¤ªà¤¨à¥€ à¤ªà¥‡à¤¶à¥‡à¤µà¤° à¤ªà¤¹à¤šà¤¾à¤¨ à¤¬à¤¨à¤¾à¤à¤‚, à¤¨à¤ à¤•à¤¾à¤® à¤–à¥‹à¤œà¥‡à¤‚, à¤…à¤ªà¤¨à¥€ à¤ªà¥à¤°à¤¤à¤¿à¤·à¥à¤ à¤¾ à¤¬à¤¢à¤¼à¤¾à¤à¤‚, à¤”à¤° à¤à¤• à¤¹à¥€ à¤®à¤‚à¤š à¤¸à¥‡ à¤¸à¤¹à¤•à¤¾à¤°à¥€ à¤•à¤²à¥à¤¯à¤¾à¤£ à¤²à¤¾à¤­ à¤ªà¤¾à¤à¤‚à¥¤",
      how_kicker: "à¤†à¤¸à¤¾à¤¨ à¤”à¤° à¤¸à¥€à¤§à¤¾",
      how_h2: "â€œà¤®à¥à¤à¥‡ à¤®à¤¦à¤¦ à¤šà¤¾à¤¹à¤¿à¤â€<br><em>à¤¸à¥‡ â€œà¤¸à¤¬ à¤•à¥à¤› à¤¤à¥ˆà¤¯à¤¾à¤°â€ à¤¤à¤•à¥¤</em>",
      step1_t: "à¤¹à¤®à¥‡à¤‚ à¤¬à¤¤à¤¾à¤à¤‚ à¤†à¤ªà¤•à¥‹ à¤•à¥à¤¯à¤¾ à¤šà¤¾à¤¹à¤¿à¤", step1_d: "à¤…à¤ªà¤¨à¥€ à¤­à¤¾à¤·à¤¾ à¤®à¥‡à¤‚, à¤…à¤ªà¤¨à¥‡ à¤¶à¤¬à¥à¤¦à¥‹à¤‚ à¤®à¥‡à¤‚ à¤¸à¥‡à¤µà¤¾ à¤¬à¤¤à¤¾à¤à¤‚à¥¤",
      step2_t: "à¤¸à¤®à¤à¤¦à¤¾à¤°à¥€ à¤¸à¥‡ à¤®à¥ˆà¤š à¤ªà¤¾à¤à¤‚", step2_d: "à¤¹à¤® à¤•à¥Œà¤¶à¤², à¤°à¥‡à¤Ÿà¤¿à¤‚à¤—, à¤²à¥‹à¤•à¥‡à¤¶à¤¨ à¤”à¤° à¤‰à¤ªà¤²à¤¬à¥à¤§à¤¤à¤¾ à¤•à¥‡ à¤†à¤§à¤¾à¤° à¤ªà¤° à¤ªà¤¾à¤¸ à¤•à¥‡ à¤¸à¤¤à¥à¤¯à¤¾à¤ªà¤¿à¤¤ à¤•à¤¾à¤®à¤—à¤¾à¤° à¤–à¥‹à¤œà¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤",
      step3_t: "à¤­à¤°à¥‹à¤¸à¥‡ à¤•à¥‡ à¤¸à¤¾à¤¥ à¤¬à¥à¤• à¤•à¤°à¥‡à¤‚", step3_d: "à¤¸à¤®à¤¯ à¤šà¥à¤¨à¥‡à¤‚, à¤¸à¥‡à¤µà¤¾ à¤Ÿà¥à¤°à¥ˆà¤• à¤•à¤°à¥‡à¤‚, à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤ à¤­à¥à¤—à¤¤à¤¾à¤¨ à¤•à¤°à¥‡à¤‚, à¤”à¤° à¤°à¥‡à¤Ÿà¤¿à¤‚à¤— à¤¦à¥‡à¤‚à¥¤",
      step4_t: "à¤¨à¥‡à¤Ÿà¤µà¤°à¥à¤• à¤•à¥‹ à¤¬à¤¢à¤¼à¤¨à¥‡ à¤®à¥‡à¤‚ à¤®à¤¦à¤¦ à¤•à¤°à¥‡à¤‚", step4_d: "à¤¹à¤° à¤¬à¥à¤•à¤¿à¤‚à¤— à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤•à¤¾à¤®à¤—à¤¾à¤°à¥‹à¤‚ à¤”à¤° à¤‰à¤¨à¤•à¥€ à¤¸à¤¹à¤•à¤¾à¤°à¥€ à¤¸à¤®à¤¿à¤¤à¤¿ à¤•à¥‹ à¤®à¤œà¤¬à¥‚à¤¤ à¤¬à¤¨à¤¾à¤¤à¥€ à¤¹à¥ˆà¥¤",
      communities_kicker: "à¤à¤• à¤®à¤‚à¤šà¥¤ à¤¤à¥€à¤¨ à¤¸à¤®à¥à¤¦à¤¾à¤¯à¥¤",
      communities_h2: "à¤¸à¤¾à¤à¤¾ à¤¸à¤®à¥ƒà¤¦à¥à¤§à¤¿,<br><em>à¤¹à¤° à¤¬à¥à¤•à¤¿à¤‚à¤— à¤®à¥‡à¤‚ à¤¶à¤¾à¤®à¤¿à¤²à¥¤</em>",
      comm1_num: "01 / à¤˜à¤°à¥‹à¤‚ à¤•à¥‡ à¤²à¤¿à¤", comm1_h3: "à¤ªà¤¾à¤¸ à¤®à¥‡à¤‚ à¤­à¤°à¥‹à¤¸à¥‡à¤®à¤‚à¤¦ à¤®à¤¦à¤¦ à¤ªà¤¾à¤à¤‚à¥¤",
      comm1_p: "à¤ªà¤¾à¤°à¤¦à¤°à¥à¤¶à¥€ à¤°à¥‡à¤Ÿà¤¿à¤‚à¤—, à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤ à¤­à¥à¤—à¤¤à¤¾à¤¨, à¤”à¤° à¤œà¤°à¥‚à¤°à¤¤ à¤•à¥‡ à¤¸à¤®à¤¯ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾ à¤•à¥‡ à¤¸à¤¾à¤¥ à¤­à¤°à¥‹à¤¸à¥‡à¤®à¤‚à¤¦ à¤ªà¥‡à¤¶à¥‡à¤µà¤° à¤¬à¥à¤• à¤•à¤°à¥‡à¤‚à¥¤",
      comm1_link: "à¤¸à¥‡à¤µà¤¾ à¤–à¥‹à¤œà¥‡à¤‚",
      comm2_num: "02 / à¤•à¤¾à¤®à¤—à¤¾à¤°à¥‹à¤‚ à¤•à¥‡ à¤²à¤¿à¤", comm2_h3: "à¤…à¤ªà¤¨à¥‡ à¤¹à¥à¤¨à¤° à¤•à¥‹ à¤…à¤µà¤¸à¤° à¤®à¥‡à¤‚ à¤¬à¤¦à¤²à¥‡à¤‚à¥¤",
      comm2_p: "à¤ªà¥‡à¤¶à¥‡à¤µà¤° à¤ªà¤¹à¤šà¤¾à¤¨ à¤¬à¤¨à¤¾à¤à¤‚, à¤¬à¥‡à¤¹à¤¤à¤° à¤•à¤¾à¤® à¤–à¥‹à¤œà¥‡à¤‚, à¤ªà¥à¤°à¤¤à¤¿à¤·à¥à¤ à¤¾ à¤¬à¤¢à¤¼à¤¾à¤à¤‚, à¤”à¤° à¤¸à¤¹à¤•à¤¾à¤°à¥€ à¤•à¤²à¥à¤¯à¤¾à¤£ à¤²à¤¾à¤­ à¤ªà¤¾à¤à¤‚à¥¤",
      comm2_link: "à¤•à¤¾à¤®à¤—à¤¾à¤° à¤•à¥‡ à¤°à¥‚à¤ª à¤®à¥‡à¤‚ à¤œà¥à¤¡à¤¼à¥‡à¤‚",
      comm3_num: "03 / à¤¸à¤¹à¤•à¤¾à¤°à¥€ à¤¸à¤®à¤¿à¤¤à¤¿à¤¯à¥‹à¤‚ à¤•à¥‡ à¤²à¤¿à¤", comm3_h3: "à¤¸à¤®à¤à¤¦à¤¾à¤°à¥€ à¤¸à¥‡ à¤¸à¤®à¤¨à¥à¤µà¤¯ à¤•à¤°à¥‡à¤‚à¥¤",
      comm3_p: "à¤…à¤ªà¤¨à¥‡ à¤•à¤¾à¤°à¥à¤¯à¤¬à¤² à¤•à¤¾ à¤ªà¥à¤°à¤¬à¤‚à¤§à¤¨ à¤•à¤°à¥‡à¤‚, à¤®à¤¾à¤‚à¤— à¤•à¤¾ à¤…à¤¨à¥à¤®à¤¾à¤¨ à¤²à¤—à¤¾à¤à¤‚, à¤•à¤¾à¤® à¤¬à¤¾à¤à¤Ÿà¥‡à¤‚, à¤”à¤° à¤à¤• à¤¹à¥€ à¤®à¤‚à¤š à¤¸à¥‡ à¤ªà¥à¤°à¤­à¤¾à¤µ à¤®à¤¾à¤ªà¥‡à¤‚à¥¤",
      comm3_link: "à¤¸à¤¹à¤•à¤¾à¤°à¥€ à¤¸à¤®à¤¿à¤¤à¤¿à¤¯à¤¾à¤ à¤¦à¥‡à¤–à¥‡à¤‚",
      final_kicker: "à¤œà¤¬ à¤†à¤ª à¤¤à¥ˆà¤¯à¤¾à¤° à¤¹à¥‹à¤‚",
      final_h2: "à¤†à¤ªà¤•à¥€ à¤…à¤—à¤²à¥€ à¤¸à¥‡à¤µà¤¾<br><em>à¤¬à¤¸ à¤•à¥à¤› à¤•à¥à¤²à¤¿à¤• à¤¦à¥‚à¤° à¤¹à¥ˆà¥¤</em>",
      final_p: "à¤­à¤°à¥‹à¤¸à¥‡à¤®à¤‚à¤¦ à¤ªà¥‡à¤¶à¥‡à¤µà¤° à¤ªà¤¾à¤à¤‚à¥¤ à¤•à¥à¤¶à¤² à¤•à¤¾à¤®à¤—à¤¾à¤°à¥‹à¤‚ à¤•à¤¾ à¤¸à¤¾à¤¥ à¤¦à¥‡à¤‚à¥¤ à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤¸à¤¹à¤•à¤¾à¤°à¥€ à¤¸à¤®à¤¿à¤¤à¤¿à¤¯à¥‹à¤‚ à¤•à¥‹ à¤®à¤œà¤¬à¥‚à¤¤ à¤¬à¤¨à¤¾à¤à¤‚à¥¤",
      footer_tagline: "à¤¹à¥à¤¨à¤° à¤•à¥‹ à¤œà¥‹à¤¡à¤¼à¤¨à¤¾à¥¤<br>à¤…à¤µà¤¸à¤° à¤¬à¤¨à¤¾à¤¨à¤¾à¥¤"
    },
    bn: {
      nav_how: "à¦¯à§‡à¦­à¦¾à¦¬à§‡ à¦•à¦¾à¦œ à¦•à¦°à§‡", nav_services: "à¦¸à§‡à¦¬à¦¾à¦¸à¦®à§‚à¦¹", nav_communities: "à¦¸à¦®à§à¦ªà§à¦°à¦¦à¦¾à¦¯à¦¼à§‡à¦° à¦œà¦¨à§à¦¯", nav_cooperatives: "à¦¸à¦®à¦¬à¦¾à¦¯à¦¼à§‡à¦° à¦œà¦¨à§à¦¯",
      nav_login: "à¦²à¦— à¦‡à¦¨", nav_getstarted: "à¦¶à§à¦°à§ à¦•à¦°à§à¦¨",
      hero_eyebrow: "à¦¸à¦®à¦¬à¦¾à¦¯à¦¼-à¦šà¦¾à¦²à¦¿à¦¤ à¦¸à§‡à¦¬à¦¾ à¦¨à§‡à¦Ÿà¦“à¦¯à¦¼à¦¾à¦°à§à¦•",
      hero_h1: "à¦ªà§à¦°à¦¤à¦¿à¦Ÿà¦¿ à¦¬à¦¾à¦¡à¦¼à¦¿à¦° à¦œà¦¨à§à¦¯ à¦¬à¦¿à¦¶à§à¦¬à¦¸à§à¦¤ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾à¥¤<br><em>à¦ªà§à¦°à¦¤à¦¿à¦Ÿà¦¿ à¦•à¦°à§à¦®à§€à¦° à¦œà¦¨à§à¦¯</em> à¦†à¦°à¦“ à¦­à¦¾à¦²à§‹ à¦¸à§à¦¯à§‹à¦—à¥¤",
      hero_lede: "SharmNexus à¦ªà¦°à¦¿à¦¬à¦¾à¦°à¦—à§à¦²à§‹à¦•à§‡ à¦¯à¦¾à¦šà¦¾à¦‡à¦•à§ƒà¦¤ à¦¸à§à¦¥à¦¾à¦¨à§€à¦¯à¦¼ à¦ªà§‡à¦¶à¦¾à¦¦à¦¾à¦°à¦¦à§‡à¦° à¦¸à¦¾à¦¥à§‡ à¦¸à¦‚à¦¯à§à¦•à§à¦¤ à¦•à¦°à§‡, à¦à¦¬à¦‚ à¦¶à§à¦°à¦® à¦¸à¦®à¦¬à¦¾à¦¯à¦¼à¦—à§à¦²à§‹à¦•à§‡ à¦•à¦¾à¦œ, à¦†à¦¯à¦¼ à¦“ à¦•à¦²à§à¦¯à¦¾à¦£ à¦à¦•à¦Ÿà¦¿ à¦ªà§à¦²à§à¦¯à¦¾à¦Ÿà¦«à¦°à§à¦® à¦¥à§‡à¦•à§‡ à¦ªà¦°à¦¿à¦šà¦¾à¦²à¦¨à¦¾ à¦•à¦°à¦¤à§‡ à¦¸à¦¾à¦¹à¦¾à¦¯à§à¦¯ à¦•à¦°à§‡à¥¤",
      hero_cta_find: "à¦¸à§‡à¦¬à¦¾ à¦–à§à¦à¦œà§à¦¨", hero_cta_join: "à¦•à¦°à§à¦®à§€ à¦¹à¦¿à¦¸à§‡à¦¬à§‡ à¦¯à§‹à¦— à¦¦à¦¿à¦¨",
      hero_proof_title: "à¦¸à§à¦¥à¦¾à¦¨à§€à¦¯à¦¼ à¦¬à¦¿à¦¶à§à¦¬à¦¾à¦¸à§‡à¦° à¦­à¦¿à¦¤à§à¦¤à¦¿à¦¤à§‡ à¦—à¦¡à¦¼à¦¾", hero_proof_sub: "à¦¨à§‡à¦Ÿà¦“à¦¯à¦¼à¦¾à¦°à§à¦•à§‡ à¦‡à¦¤à¦¿à¦®à¦§à§à¦¯à§‡ à§«,à§¦à§¦à§¦+ à¦¦à¦•à§à¦· à¦•à¦°à§à¦®à§€",
      trust_workers: "à¦¦à¦•à§à¦· à¦•à¦°à§à¦®à§€", trust_services: "à¦¸à¦®à§à¦ªà¦¨à§à¦¨ à¦¸à§‡à¦¬à¦¾", trust_coops: "à¦¸à¦®à¦¬à¦¾à¦¯à¦¼", trust_rating: "à¦—à¦¡à¦¼ à¦°à§‡à¦Ÿà¦¿à¦‚",
      trust_tagline: "à¦à¦•à¦Ÿà¦¿ à¦¨à§‡à¦Ÿà¦“à¦¯à¦¼à¦¾à¦°à§à¦•à¥¤ à¦¯à§à¦•à§à¦¤ à¦¹à¦“à¦¯à¦¼à¦¾à¦° à¦…à¦¨à§‡à¦• à¦‰à¦ªà¦¾à¦¯à¦¼à¥¤",
      services_kicker: "à¦ªà§à¦°à¦¤à¦¿à¦¦à¦¿à¦¨à§‡à¦° à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾, à¦¬à¦¾à¦¡à¦¼à¦¿à¦° à¦•à¦¾à¦›à§‡à¦‡",
      services_h2: "à¦¯à¦¾ à¦•à¦¿à¦›à§à¦‡ à¦¦à¦°à¦•à¦¾à¦° à¦¹à§‹à¦•,<br><em>à¦•à¦¾à¦›à§‡à¦° à¦•à§‡à¦‰ à¦¸à¦¾à¦¹à¦¾à¦¯à§à¦¯ à¦•à¦°à¦¤à§‡ à¦ªà¦¾à¦°à§‡à¥¤</em>",
      services_explore: "à¦¸à¦¬ à¦¸à§‡à¦¬à¦¾ à¦¦à§‡à¦–à§à¦¨",
      svc_plumbing_t: "à¦ªà§à¦²à¦¾à¦®à§à¦¬à¦¿à¦‚", svc_plumbing_d: "à¦®à§‡à¦°à¦¾à¦®à¦¤, à¦«à¦¿à¦Ÿà¦¿à¦‚ à¦“ à¦°à¦•à§à¦·à¦£à¦¾à¦¬à§‡à¦•à§à¦·à¦£",
      svc_electrical_t: "à¦‡à¦²à§‡à¦•à¦Ÿà§à¦°à¦¿à¦•à§à¦¯à¦¾à¦²", svc_electrical_d: "à¦®à§‡à¦°à¦¾à¦®à¦¤ à¦“ à¦‡à¦¨à¦¸à§à¦Ÿà¦²à§‡à¦¶à¦¨",
      svc_cleaning_t: "à¦ªà¦°à¦¿à¦šà§à¦›à¦¨à§à¦¨à¦¤à¦¾", svc_cleaning_d: "à¦¬à¦¾à¦¡à¦¼à¦¿ à¦“ à¦…à¦«à¦¿à¦¸à§‡à¦° à¦¯à¦¤à§à¦¨",
      svc_caregiving_t: "à¦ªà¦°à¦¿à¦šà¦°à§à¦¯à¦¾", svc_caregiving_d: "à¦ªà§à¦°à¦¯à¦¼à§‹à¦œà¦¨à§‡à¦° à¦¸à¦®à¦¯à¦¼ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾",
      svc_carpentry_t: "à¦•à¦¾à¦ à¦®à¦¿à¦¸à§à¦¤à§à¦°à¦¿", svc_carpentry_d: "à¦†à¦¸à¦¬à¦¾à¦¬à¦ªà¦¤à§à¦° à¦“ à¦®à§‡à¦°à¦¾à¦®à¦¤",
      svc_driving_t: "à¦¡à§à¦°à¦¾à¦‡à¦­à¦¿à¦‚", svc_driving_d: "à¦ªà¦°à¦¿à¦¬à¦¹à¦¨ à¦“ à¦¡à§‡à¦²à¦¿à¦­à¦¾à¦°à¦¿",
      svc_gardening_t: "à¦¬à¦¾à¦—à¦¾à¦¨ à¦ªà¦°à¦¿à¦šà¦°à§à¦¯à¦¾", svc_gardening_d: "à¦²à§à¦¯à¦¾à¦¨à§à¦¡à¦¸à§à¦•à§‡à¦ªà¦¿à¦‚ à¦“ à¦°à¦•à§à¦·à¦£à¦¾à¦¬à§‡à¦•à§à¦·à¦£",
      svc_technician_t: "à¦Ÿà§‡à¦•à¦¨à¦¿à¦¶à¦¿à¦¯à¦¼à¦¾à¦¨", svc_technician_d: "à¦ªà§à¦°à¦¯à§à¦•à§à¦¤à¦¿ à¦®à§‡à¦°à¦¾à¦®à¦¤ à¦“ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾",
      map_kicker: "à¦²à¦¾à¦‡à¦­ à¦²à§‹à¦•à¦¾à¦² à¦¨à§‡à¦Ÿà¦“à¦¯à¦¼à¦¾à¦°à§à¦•", map_h2: "à¦†à¦ªà¦¨à¦¾à¦° à¦†à¦¶à§‡à¦ªà¦¾à¦¶à§‡à¦° à¦¸à§‡à¦¬à¦¾à¥¤",
      map_p: "à¦¯à¦¾à¦šà¦¾à¦‡à¦•à§ƒà¦¤ à¦•à¦°à§à¦®à§€, à¦šà¦²à¦®à¦¾à¦¨ à¦¬à§à¦•à¦¿à¦‚, à¦à¦¬à¦‚ à¦•à§à¦°à¦®à¦¬à¦°à§à¦§à¦®à¦¾à¦¨ à¦šà¦¾à¦¹à¦¿à¦¦à¦¾à¦° à¦à¦²à¦¾à¦•à¦¾ à¦¦à§‡à¦–à§à¦¨à¥¤",
      map_locbtn: "à¦†à¦®à¦¾à¦° à¦…à¦¬à¦¸à§à¦¥à¦¾à¦¨ à¦¬à§à¦¯à¦¬à¦¹à¦¾à¦° à¦•à¦°à§à¦¨",
      legend_workers: "à¦‰à¦ªà¦²à¦¬à§à¦§ à¦•à¦°à§à¦®à§€", legend_bookings: "à¦šà¦²à¦®à¦¾à¦¨ à¦¬à§à¦•à¦¿à¦‚",
      legend_demand: "à¦‰à¦šà§à¦š-à¦šà¦¾à¦¹à¦¿à¦¦à¦¾ à¦à¦²à¦¾à¦•à¦¾", legend_requests: "à¦—à§à¦°à¦¾à¦¹à¦• à¦…à¦¨à§à¦°à§‹à¦§",
      features_kicker: "SHARMNEXUS-à¦à¦° à¦¬à§ˆà¦¶à¦¿à¦·à§à¦Ÿà§à¦¯",
      features_h2: "à¦†à¦ªà¦¨à¦¾à¦° à¦ªà§à¦°à¦¯à¦¼à§‹à¦œà¦¨à§€à¦¯à¦¼ à¦¸à¦¬à¦•à¦¿à¦›à§à¥¤<br><em>à¦à¦•à¦Ÿà¦¿ à¦¸à¦¹à¦œ à¦ªà§à¦²à§à¦¯à¦¾à¦Ÿà¦«à¦°à§à¦®à¥¤</em>",
      feat_1: "à¦¯à¦¾à¦šà¦¾à¦‡à¦•à§ƒà¦¤<br>à¦ªà§‡à¦¶à¦¾à¦¦à¦¾à¦° à¦–à§à¦à¦œà§à¦¨", feat_2: "à¦…à¦¬à¦¸à§à¦¥à¦¾à¦¨-à¦­à¦¿à¦¤à§à¦¤à¦¿à¦•<br>à¦®à§à¦¯à¦¾à¦šà¦¿à¦‚", feat_3: "à¦¸à¦¹à¦œ à¦¸à¦®à¦¯à¦¼à¦¸à§‚à¦šà¦¿",
      feat_4: "à¦¨à¦¿à¦°à¦¾à¦ªà¦¦ à¦¡à¦¿à¦œà¦¿à¦Ÿà¦¾à¦²<br>à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ", feat_5: "à¦¡à¦¿à¦œà¦¿à¦Ÿà¦¾à¦² à¦šà¦¾à¦²à¦¾à¦¨", feat_6: "à¦°à§‡à¦Ÿà¦¿à¦‚ à¦“<br>à¦°à¦¿à¦­à¦¿à¦‰",
      feat_7: "à¦¸à§‡à¦¬à¦¾ à¦Ÿà§à¦°à§à¦¯à¦¾à¦•à¦¿à¦‚", feat_8: "à¦œà¦°à§à¦°à¦¿<br>à¦¬à§à¦•à¦¿à¦‚",
      access_kicker: "à¦¸à¦¬à¦¾à¦° à¦œà¦¨à§à¦¯ à¦¡à¦¿à¦œà¦¾à¦‡à¦¨ à¦•à¦°à¦¾",
      access_h2: "à¦ªà§à¦°à¦¯à§à¦•à§à¦¤à¦¿ à¦¯à¦¾<br><em>à¦†à¦ªà¦¨à¦¾à¦° à¦­à¦¾à¦·à¦¾à¦¯à¦¼ à¦•à¦¥à¦¾ à¦¬à¦²à§‡à¥¤</em>",
      access_explore: "SharmNexus à¦¦à§‡à¦–à§à¦¨",
      worker_kicker: "à¦¦à¦•à§à¦· à¦•à¦°à§à¦®à§€à¦¦à§‡à¦° à¦œà¦¨à§à¦¯",
      worker_h2: "à¦†à¦ªà¦¨à¦¾à¦° à¦¦à¦•à§à¦·à¦¤à¦¾à¦° à¦œà¦¨à§à¦¯<br><em>à¦†à¦°à¦“ à¦¸à§à¦¯à§‹à¦—à¥¤</em>",
      worker_p: "à¦†à¦ªà¦¨à¦¾à¦° à¦ªà§‡à¦¶à¦¾à¦¦à¦¾à¦° à¦ªà¦°à¦¿à¦šà¦¯à¦¼ à¦—à¦¡à¦¼à§à¦¨, à¦•à¦¾à¦œ à¦–à§à¦à¦œà§à¦¨, à¦¸à§à¦¨à¦¾à¦® à¦¬à¦¾à¦¡à¦¼à¦¾à¦¨, à¦à¦¬à¦‚ à¦à¦•à¦Ÿà¦¿ à¦ªà§à¦²à§à¦¯à¦¾à¦Ÿà¦«à¦°à§à¦® à¦¥à§‡à¦•à§‡ à¦¸à¦®à¦¬à¦¾à¦¯à¦¼ à¦•à¦²à§à¦¯à¦¾à¦£ à¦¸à§à¦¬à¦¿à¦§à¦¾ à¦ªà¦¾à¦¨à¥¤",
      how_kicker: "à¦¸à¦¹à¦œ à¦ªà¦°à¦¿à¦•à¦²à§à¦ªà¦¨à¦¾à¦¯à¦¼",
      how_h2: "â€œà¦†à¦®à¦¾à¦° à¦¸à¦¾à¦¹à¦¾à¦¯à§à¦¯ à¦¦à¦°à¦•à¦¾à¦°â€<br><em>à¦¥à§‡à¦•à§‡ â€œà¦¸à¦¬ à¦ à¦¿à¦• à¦†à¦›à§‡â€ à¦ªà¦°à§à¦¯à¦¨à§à¦¤à¥¤</em>",
      step1_t: "à¦†à¦®à¦¾à¦¦à§‡à¦° à¦¬à¦²à§à¦¨ à¦•à§€ à¦¦à¦°à¦•à¦¾à¦°", step1_d: "à¦¨à¦¿à¦œà§‡à¦° à¦­à¦¾à¦·à¦¾à¦¯à¦¼, à¦¨à¦¿à¦œà§‡à¦° à¦•à¦¥à¦¾à¦¯à¦¼ à¦¸à§‡à¦¬à¦¾à¦Ÿà¦¿ à¦¬à¦°à§à¦£à¦¨à¦¾ à¦•à¦°à§à¦¨à¥¤",
      step2_t: "à¦¬à§à¦¦à§à¦§à¦¿à¦®à¦¤à§à¦¤à¦¾à¦° à¦¸à¦¾à¦¥à§‡ à¦®à¦¿à¦²à¦¿à¦¤ à¦¹à¦¨", step2_d: "à¦†à¦®à¦°à¦¾ à¦¦à¦•à§à¦·à¦¤à¦¾, à¦°à§‡à¦Ÿà¦¿à¦‚, à¦…à¦¬à¦¸à§à¦¥à¦¾à¦¨ à¦“ à¦ªà§à¦°à¦¾à¦ªà§à¦¯à¦¤à¦¾ à¦…à¦¨à§à¦¯à¦¾à¦¯à¦¼à§€ à¦•à¦¾à¦›à§‡à¦° à¦¯à¦¾à¦šà¦¾à¦‡à¦•à§ƒà¦¤ à¦•à¦°à§à¦®à§€ à¦–à§à¦à¦œà§‡ à¦¦à¦¿à¦‡à¥¤",
      step3_t: "à¦¨à¦¿à¦¶à§à¦šà¦¿à¦¨à§à¦¤à§‡ à¦¬à§à¦• à¦•à¦°à§à¦¨", step3_d: "à¦¸à¦®à¦¯à¦¼ à¦¬à§‡à¦›à§‡ à¦¨à¦¿à¦¨, à¦¸à§‡à¦¬à¦¾ à¦Ÿà§à¦°à§à¦¯à¦¾à¦• à¦•à¦°à§à¦¨, à¦¨à¦¿à¦°à¦¾à¦ªà¦¦à§‡ à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ à¦•à¦°à§à¦¨, à¦à¦¬à¦‚ à¦°à§‡à¦Ÿà¦¿à¦‚ à¦¦à¦¿à¦¨à¥¤",
      step4_t: "à¦¨à§‡à¦Ÿà¦“à¦¯à¦¼à¦¾à¦°à§à¦•à¦•à§‡ à¦¬à¦¾à¦¡à¦¼à¦¤à§‡ à¦¸à¦¾à¦¹à¦¾à¦¯à§à¦¯ à¦•à¦°à§à¦¨", step4_d: "à¦ªà§à¦°à¦¤à¦¿à¦Ÿà¦¿ à¦¬à§à¦•à¦¿à¦‚ à¦¸à§à¦¥à¦¾à¦¨à§€à¦¯à¦¼ à¦•à¦°à§à¦®à§€ à¦“ à¦¤à¦¾à¦¦à§‡à¦° à¦¸à¦®à¦¬à¦¾à¦¯à¦¼à¦•à§‡ à¦¶à¦•à§à¦¤à¦¿à¦¶à¦¾à¦²à§€ à¦•à¦°à§‡à¥¤",
      communities_kicker: "à¦à¦•à¦Ÿà¦¿ à¦ªà§à¦²à§à¦¯à¦¾à¦Ÿà¦«à¦°à§à¦®à¥¤ à¦¤à¦¿à¦¨à¦Ÿà¦¿ à¦¸à¦®à§à¦ªà§à¦°à¦¦à¦¾à¦¯à¦¼à¥¤",
      communities_h2: "à¦­à¦¾à¦— à¦•à¦°à¦¾ à¦¸à¦®à§ƒà¦¦à§à¦§à¦¿,<br><em>à¦ªà§à¦°à¦¤à¦¿à¦Ÿà¦¿ à¦¬à§à¦•à¦¿à¦‚-à¦ à¦—à¦¾à¦à¦¥à¦¾à¥¤</em>",
      comm1_num: "à§¦à§§ / à¦ªà¦°à¦¿à¦¬à¦¾à¦°à§‡à¦° à¦œà¦¨à§à¦¯", comm1_h3: "à¦•à¦¾à¦›à§‡ à¦¬à¦¿à¦¶à§à¦¬à¦¸à§à¦¤ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾ à¦–à§à¦à¦œà§à¦¨à¥¤",
      comm1_p: "à¦¸à§à¦¬à¦šà§à¦› à¦°à§‡à¦Ÿà¦¿à¦‚, à¦¨à¦¿à¦°à¦¾à¦ªà¦¦ à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ, à¦à¦¬à¦‚ à¦ªà§à¦°à¦¯à¦¼à§‹à¦œà¦¨à§‡à¦° à¦¸à¦®à¦¯à¦¼ à¦¸à¦¹à¦¾à¦¯à¦¼à¦¤à¦¾à¦¸à¦¹ à¦¬à¦¿à¦¶à§à¦¬à¦¸à§à¦¤ à¦ªà§‡à¦¶à¦¾à¦¦à¦¾à¦° à¦¬à§à¦• à¦•à¦°à§à¦¨à¥¤",
      comm1_link: "à¦¸à§‡à¦¬à¦¾ à¦–à§à¦à¦œà§à¦¨",
      comm2_num: "à§¦à§¨ / à¦•à¦°à§à¦®à§€à¦¦à§‡à¦° à¦œà¦¨à§à¦¯", comm2_h3: "à¦†à¦ªà¦¨à¦¾à¦° à¦¦à¦•à§à¦·à¦¤à¦¾à¦•à§‡ à¦¸à§à¦¯à§‹à¦—à§‡ à¦ªà¦°à¦¿à¦£à¦¤ à¦•à¦°à§à¦¨à¥¤",
      comm2_p: "à¦ªà§‡à¦¶à¦¾à¦¦à¦¾à¦° à¦ªà¦°à¦¿à¦šà¦¯à¦¼ à¦—à¦¡à¦¼à§à¦¨, à¦­à¦¾à¦²à§‹ à¦•à¦¾à¦œ à¦–à§à¦à¦œà§à¦¨, à¦¸à§à¦¨à¦¾à¦® à¦¬à¦¾à¦¡à¦¼à¦¾à¦¨, à¦à¦¬à¦‚ à¦¸à¦®à¦¬à¦¾à¦¯à¦¼ à¦•à¦²à§à¦¯à¦¾à¦£ à¦¸à§à¦¬à¦¿à¦§à¦¾ à¦ªà¦¾à¦¨à¥¤",
      comm2_link: "à¦•à¦°à§à¦®à§€ à¦¹à¦¿à¦¸à§‡à¦¬à§‡ à¦¯à§‹à¦— à¦¦à¦¿à¦¨",
      comm3_num: "à§¦à§© / à¦¸à¦®à¦¬à¦¾à¦¯à¦¼à§‡à¦° à¦œà¦¨à§à¦¯", comm3_h3: "à¦¬à§à¦¦à§à¦§à¦¿à¦®à¦¤à§à¦¤à¦¾à¦° à¦¸à¦¾à¦¥à§‡ à¦¸à¦®à¦¨à§à¦¬à¦¯à¦¼ à¦•à¦°à§à¦¨à¥¤",
      comm3_p: "à¦†à¦ªà¦¨à¦¾à¦° à¦•à¦°à§à¦®à§€à¦¬à¦¾à¦¹à¦¿à¦¨à§€ à¦ªà¦°à¦¿à¦šà¦¾à¦²à¦¨à¦¾ à¦•à¦°à§à¦¨, à¦šà¦¾à¦¹à¦¿à¦¦à¦¾ à¦ªà§‚à¦°à§à¦¬à¦¾à¦­à¦¾à¦¸ à¦¦à¦¿à¦¨, à¦•à¦¾à¦œ à¦¬à¦£à§à¦Ÿà¦¨ à¦•à¦°à§à¦¨, à¦à¦¬à¦‚ à¦à¦•à¦Ÿà¦¿ à¦ªà§à¦²à§à¦¯à¦¾à¦Ÿà¦«à¦°à§à¦® à¦¥à§‡à¦•à§‡ à¦ªà§à¦°à¦­à¦¾à¦¬ à¦ªà¦°à¦¿à¦®à¦¾à¦ª à¦•à¦°à§à¦¨à¥¤",
      comm3_link: "à¦¸à¦®à¦¬à¦¾à¦¯à¦¼ à¦¦à§‡à¦–à§à¦¨",
      final_kicker: "à¦†à¦ªà¦¨à¦¿ à¦ªà§à¦°à¦¸à§à¦¤à§à¦¤ à¦¥à¦¾à¦•à¦²à§‡à¦‡",
      final_h2: "à¦†à¦ªà¦¨à¦¾à¦° à¦ªà¦°à¦¬à¦°à§à¦¤à§€ à¦¸à§‡à¦¬à¦¾<br><em>à¦®à¦¾à¦¤à§à¦° à¦•à¦¯à¦¼à§‡à¦• à¦•à§à¦²à¦¿à¦• à¦¦à§‚à¦°à§‡à¥¤</em>",
      final_p: "à¦¬à¦¿à¦¶à§à¦¬à¦¸à§à¦¤ à¦ªà§‡à¦¶à¦¾à¦¦à¦¾à¦° à¦–à§à¦à¦œà§à¦¨à¥¤ à¦¦à¦•à§à¦· à¦•à¦°à§à¦®à§€à¦¦à§‡à¦° à¦ªà¦¾à¦¶à§‡ à¦¥à¦¾à¦•à§à¦¨à¥¤ à¦¸à§à¦¥à¦¾à¦¨à§€à¦¯à¦¼ à¦¸à¦®à¦¬à¦¾à¦¯à¦¼à¦•à§‡ à¦¶à¦•à§à¦¤à¦¿à¦¶à¦¾à¦²à§€ à¦•à¦°à§à¦¨à¥¤",
      footer_tagline: "à¦¦à¦•à§à¦·à¦¤à¦¾ à¦¸à¦‚à¦¯à§à¦•à§à¦¤ à¦•à¦°à¦¾à¥¤<br>à¦¸à§à¦¯à§‹à¦— à¦¤à§ˆà¦°à¦¿ à¦•à¦°à¦¾à¥¤"
    },
    mr: {
      nav_how: "à¤¹à¥‡ à¤•à¤¸à¥‡ à¤•à¤¾à¤® à¤•à¤°à¤¤à¥‡", nav_services: "à¤¸à¥‡à¤µà¤¾", nav_communities: "à¤¸à¤®à¥à¤¦à¤¾à¤¯à¤¾à¤‚à¤¸à¤¾à¤ à¥€", nav_cooperatives: "à¤¸à¤¹à¤•à¤¾à¤°à¥€ à¤¸à¤‚à¤¸à¥à¤¥à¤¾à¤‚à¤¸à¤¾à¤ à¥€",
      nav_login: "à¤²à¥‰à¤— à¤‡à¤¨ à¤•à¤°à¤¾", nav_getstarted: "à¤¸à¥à¤°à¥à¤µà¤¾à¤¤ à¤•à¤°à¤¾",
      hero_eyebrow: "à¤¸à¤¹à¤•à¤¾à¤°à¥€-à¤šà¤¾à¤²à¤¿à¤¤ à¤¸à¥‡à¤µà¤¾ à¤¨à¥‡à¤Ÿà¤µà¤°à¥à¤•",
      hero_h1: "à¤ªà¥à¤°à¤¤à¥à¤¯à¥‡à¤• à¤˜à¤°à¤¾à¤¸à¤¾à¤ à¥€ à¤µà¤¿à¤¶à¥à¤µà¤¾à¤¸à¤¾à¤°à¥à¤¹ à¤®à¤¦à¤¤.<br><em>à¤ªà¥à¤°à¤¤à¥à¤¯à¥‡à¤• à¤•à¤¾à¤®à¤—à¤¾à¤°à¤¾à¤¸à¤¾à¤ à¥€</em> à¤…à¤§à¤¿à¤• à¤šà¤¾à¤‚à¤—à¤²à¥à¤¯à¤¾ à¤¸à¤‚à¤§à¥€.",
      hero_lede: "SharmNexus à¤˜à¤°à¤¾à¤‚à¤¨à¤¾ à¤ªà¤¡à¤¤à¤¾à¤³à¤£à¥€ à¤•à¥‡à¤²à¥‡à¤²à¥à¤¯à¤¾ à¤¸à¥à¤¥à¤¾à¤¨à¤¿à¤• à¤µà¥à¤¯à¤¾à¤µà¤¸à¤¾à¤¯à¤¿à¤•à¤¾à¤‚à¤¶à¥€ à¤œà¥‹à¤¡à¤¤à¥‡, à¤†à¤£à¤¿ à¤•à¤¾à¤®à¤—à¤¾à¤° à¤¸à¤¹à¤•à¤¾à¤°à¥€ à¤¸à¤‚à¤¸à¥à¤¥à¤¾à¤‚à¤¨à¤¾ à¤•à¤¾à¤®, à¤•à¤®à¤¾à¤ˆ à¤µ à¤•à¤²à¥à¤¯à¤¾à¤£ à¤à¤•à¤¾à¤š à¤µà¥à¤¯à¤¾à¤¸à¤ªà¥€à¤ à¤¾à¤µà¤°à¥‚à¤¨ à¤¸à¤¾à¤‚à¤­à¤¾à¤³à¤£à¥à¤¯à¤¾à¤¸ à¤®à¤¦à¤¤ à¤•à¤°à¤¤à¥‡.",
      hero_cta_find: "à¤¸à¥‡à¤µà¤¾ à¤¶à¥‹à¤§à¤¾", hero_cta_join: "à¤•à¤¾à¤®à¤—à¤¾à¤° à¤®à¥à¤¹à¤£à¥‚à¤¨ à¤¸à¤¾à¤®à¥€à¤² à¤µà¥à¤¹à¤¾",
      hero_proof_title: "à¤¸à¥à¤¥à¤¾à¤¨à¤¿à¤• à¤µà¤¿à¤¶à¥à¤µà¤¾à¤¸à¤¾à¤µà¤° à¤†à¤§à¤¾à¤°à¤¿à¤¤", hero_proof_sub: "à¤¨à¥‡à¤Ÿà¤µà¤°à¥à¤•à¤®à¤§à¥à¤¯à¥‡ à¤†à¤§à¥€à¤š 5,000+ à¤•à¥à¤¶à¤² à¤•à¤¾à¤®à¤—à¤¾à¤°",
      trust_workers: "à¤•à¥à¤¶à¤² à¤•à¤¾à¤®à¤—à¤¾à¤°", trust_services: "à¤ªà¥‚à¤°à¥à¤£ à¤à¤¾à¤²à¥‡à¤²à¥à¤¯à¤¾ à¤¸à¥‡à¤µà¤¾", trust_coops: "à¤¸à¤¹à¤•à¤¾à¤°à¥€ à¤¸à¤‚à¤¸à¥à¤¥à¤¾", trust_rating: "à¤¸à¤°à¤¾à¤¸à¤°à¥€ à¤°à¥‡à¤Ÿà¤¿à¤‚à¤—",
      trust_tagline: "à¤à¤• à¤¨à¥‡à¤Ÿà¤µà¤°à¥à¤•. à¤œà¥‹à¤¡à¤£à¥à¤¯à¤¾à¤šà¥‡ à¤…à¤¨à¥‡à¤• à¤®à¤¾à¤°à¥à¤—.",
      services_kicker: "à¤°à¥‹à¤œà¤šà¥€ à¤®à¤¦à¤¤, à¤˜à¤°à¤¾à¤œà¤µà¤³",
      services_h2: "à¤¤à¥à¤®à¥à¤¹à¤¾à¤²à¤¾ à¤œà¥‡ à¤¹à¤µà¥‡ à¤¤à¥‡,<br><em>à¤œà¤µà¤³à¤šà¤¾ à¤•à¥‹à¤£à¥€à¤¤à¤°à¥€ à¤®à¤¦à¤¤ à¤•à¤°à¥‚ à¤¶à¤•à¤¤à¥‹.</em>",
      services_explore: "à¤¸à¤°à¥à¤µ à¤¸à¥‡à¤µà¤¾ à¤ªà¤¹à¤¾",
      svc_plumbing_t: "à¤ªà¥à¤²à¤‚à¤¬à¤¿à¤‚à¤—", svc_plumbing_d: "à¤¦à¥à¤°à¥à¤¸à¥à¤¤à¥€, à¤«à¤¿à¤Ÿà¤¿à¤‚à¤— à¤µ à¤¦à¥‡à¤–à¤­à¤¾à¤²",
      svc_electrical_t: "à¤‡à¤²à¥‡à¤•à¥à¤Ÿà¥à¤°à¤¿à¤•à¤²", svc_electrical_d: "à¤¦à¥à¤°à¥à¤¸à¥à¤¤à¥€ à¤µ à¤‡à¤¨à¥à¤¸à¥à¤Ÿà¥‰à¤²à¥‡à¤¶à¤¨",
      svc_cleaning_t: "à¤¸à¥à¤µà¤šà¥à¤›à¤¤à¤¾", svc_cleaning_d: "à¤˜à¤° à¤µ à¤•à¤¾à¤°à¥à¤¯à¤¾à¤²à¤¯à¤¾à¤šà¥€ à¤•à¤¾à¤³à¤œà¥€",
      svc_caregiving_t: "à¤•à¤¾à¤³à¤œà¥€ à¤¸à¥‡à¤µà¤¾", svc_caregiving_d: "à¤—à¤°à¤œà¥‡à¤šà¥à¤¯à¤¾ à¤µà¥‡à¤³à¥€ à¤®à¤¦à¤¤",
      svc_carpentry_t: "à¤¸à¥à¤¤à¤¾à¤°à¤•à¤¾à¤®", svc_carpentry_d: "à¤«à¤°à¥à¤¨à¤¿à¤šà¤° à¤µ à¤¦à¥à¤°à¥à¤¸à¥à¤¤à¥€",
      svc_driving_t: "à¤¡à¥à¤°à¤¾à¤¯à¤µà¥à¤¹à¤¿à¤‚à¤—", svc_driving_d: "à¤µà¤¾à¤¹à¤¤à¥‚à¤• à¤µ à¤¡à¤¿à¤²à¤¿à¤µà¥à¤¹à¤°à¥€",
      svc_gardening_t: "à¤¬à¤¾à¤—à¤•à¤¾à¤®", svc_gardening_d: "à¤²à¤à¤¡à¤¸à¥à¤•à¥‡à¤ªà¤¿à¤‚à¤— à¤µ à¤¦à¥‡à¤–à¤­à¤¾à¤²",
      svc_technician_t: "à¤¤à¤‚à¤¤à¥à¤°à¤œà¥à¤ž", svc_technician_d: "à¤¤à¤¾à¤‚à¤¤à¥à¤°à¤¿à¤• à¤¦à¥à¤°à¥à¤¸à¥à¤¤à¥€ à¤µ à¤¸à¤¹à¤¾à¤¯à¥à¤¯",
      map_kicker: "à¤¥à¥‡à¤Ÿ à¤¸à¥à¤¥à¤¾à¤¨à¤¿à¤• à¤¨à¥‡à¤Ÿà¤µà¤°à¥à¤•", map_h2: "à¤¤à¥à¤®à¤šà¥à¤¯à¤¾ à¤†à¤¸à¤ªà¤¾à¤¸à¤šà¥à¤¯à¤¾ à¤¸à¥‡à¤µà¤¾.",
      map_p: "à¤ªà¤¡à¤¤à¤¾à¤³à¤£à¥€ à¤•à¥‡à¤²à¥‡à¤²à¥‡ à¤•à¤¾à¤®à¤—à¤¾à¤°, à¤¸à¤•à¥à¤°à¤¿à¤¯ à¤¬à¥à¤•à¤¿à¤‚à¤—, à¤†à¤£à¤¿ à¤µà¤¾à¤¢à¤¤à¥à¤¯à¤¾ à¤®à¤¾à¤—à¤£à¥€à¤šà¥‡ à¤­à¤¾à¤— à¤ªà¤¹à¤¾.",
      map_locbtn: "à¤®à¤¾à¤à¥‡ à¤¸à¥à¤¥à¤¾à¤¨ à¤µà¤¾à¤ªà¤°à¤¾",
      legend_workers: "à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤•à¤¾à¤®à¤—à¤¾à¤°", legend_bookings: "à¤¸à¤•à¥à¤°à¤¿à¤¯ à¤¬à¥à¤•à¤¿à¤‚à¤—",
      legend_demand: "à¤‰à¤šà¥à¤š-à¤®à¤¾à¤—à¤£à¥€ à¤•à¥à¤·à¥‡à¤¤à¥à¤°", legend_requests: "à¤—à¥à¤°à¤¾à¤¹à¤• à¤µà¤¿à¤¨à¤‚à¤¤à¥à¤¯à¤¾",
      features_kicker: "SHARMNEXUS à¤šà¥‡ à¤µà¥ˆà¤¶à¤¿à¤·à¥à¤Ÿà¥à¤¯",
      features_h2: "à¤¤à¥à¤®à¥à¤¹à¤¾à¤²à¤¾ à¤¹à¤µà¥‡ à¤¤à¥‡ à¤¸à¤°à¥à¤µ à¤•à¤¾à¤¹à¥€.<br><em>à¤à¤• à¤¸à¥‹à¤ªà¥‡ à¤µà¥à¤¯à¤¾à¤¸à¤ªà¥€à¤ .</em>",
      feat_1: "à¤ªà¤¡à¤¤à¤¾à¤³à¤£à¥€ à¤•à¥‡à¤²à¥‡à¤²à¥‡<br>à¤µà¥à¤¯à¤¾à¤µà¤¸à¤¾à¤¯à¤¿à¤• à¤¶à¥‹à¤§à¤¾", feat_2: "à¤¸à¥à¤¥à¤¾à¤¨-à¤†à¤§à¤¾à¤°à¤¿à¤¤<br>à¤œà¥à¤³à¤£à¥€", feat_3: "à¤¸à¥‹à¤ªà¥‡ à¤µà¥‡à¤³à¤¾à¤ªà¤¤à¥à¤°à¤•",
      feat_4: "à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤ à¤¡à¤¿à¤œà¤¿à¤Ÿà¤²<br>à¤ªà¥‡à¤®à¥‡à¤‚à¤Ÿ", feat_5: "à¤¡à¤¿à¤œà¤¿à¤Ÿà¤² à¤‡à¤¨à¤µà¥à¤¹à¥‰à¤‡à¤¸", feat_6: "à¤°à¥‡à¤Ÿà¤¿à¤‚à¤— à¤µ<br>à¤ªà¥à¤¨à¤°à¤¾à¤µà¤²à¥‹à¤•à¤¨à¥‡",
      feat_7: "à¤¸à¥‡à¤µà¤¾ à¤Ÿà¥à¤°à¥…à¤•à¤¿à¤‚à¤—", feat_8: "à¤†à¤ªà¤¤à¥à¤•à¤¾à¤²à¥€à¤¨<br>à¤¬à¥à¤•à¤¿à¤‚à¤—",
      access_kicker: "à¤¸à¤°à¥à¤µà¤¾à¤‚à¤¸à¤¾à¤ à¥€ à¤¬à¤¨à¤µà¤²à¥‡à¤²à¥‡",
      access_h2: "à¤¤à¤‚à¤¤à¥à¤°à¤œà¥à¤žà¤¾à¤¨ à¤œà¥‡<br><em>à¤¤à¥à¤®à¤šà¥€ à¤­à¤¾à¤·à¤¾ à¤¬à¥‹à¤²à¤¤à¥‡.</em>",
      access_explore: "SharmNexus à¤ªà¤¹à¤¾",
      worker_kicker: "à¤•à¥à¤¶à¤² à¤•à¤¾à¤®à¤—à¤¾à¤°à¤¾à¤‚à¤¸à¤¾à¤ à¥€",
      worker_h2: "à¤¤à¥à¤®à¤šà¥à¤¯à¤¾ à¤•à¥Œà¤¶à¤²à¥à¤¯à¤¾à¤‚à¤¸à¤¾à¤ à¥€<br><em>à¤…à¤§à¤¿à¤• à¤¸à¤‚à¤§à¥€.</em>",
      worker_p: "à¤¤à¥à¤®à¤šà¥€ à¤µà¥à¤¯à¤¾à¤µà¤¸à¤¾à¤¯à¤¿à¤• à¤“à¤³à¤– à¤¤à¤¯à¤¾à¤° à¤•à¤°à¤¾, à¤•à¤¾à¤®à¥‡ à¤¶à¥‹à¤§à¤¾, à¤ªà¥à¤°à¤¤à¤¿à¤·à¥à¤ à¤¾ à¤µà¤¾à¤¢à¤µà¤¾, à¤†à¤£à¤¿ à¤à¤•à¤¾à¤š à¤µà¥à¤¯à¤¾à¤¸à¤ªà¥€à¤ à¤¾à¤µà¤°à¥‚à¤¨ à¤¸à¤¹à¤•à¤¾à¤°à¥€ à¤•à¤²à¥à¤¯à¤¾à¤£ à¤²à¤¾à¤­ à¤®à¤¿à¤³à¤µà¤¾.",
      how_kicker: "à¤¸à¥‹à¤ªà¥à¤¯à¤¾ à¤ªà¤¦à¥à¤§à¤¤à¥€à¤¨à¥‡",
      how_h2: "â€œà¤®à¤²à¤¾ à¤®à¤¦à¤¤ à¤¹à¤µà¥€ à¤†à¤¹à¥‡â€<br><em>à¤ªà¤¾à¤¸à¥‚à¤¨ â€œà¤¸à¤°à¥à¤µ à¤•à¤¾à¤¹à¥€ à¤ à¥€à¤• à¤†à¤¹à¥‡â€ à¤ªà¤°à¥à¤¯à¤‚à¤¤.</em>",
      step1_t: "à¤¤à¥à¤®à¥à¤¹à¤¾à¤²à¤¾ à¤•à¤¾à¤¯ à¤¹à¤µà¥‡ à¤¤à¥‡ à¤¸à¤¾à¤‚à¤—à¤¾", step1_d: "à¤¤à¥à¤®à¤šà¥à¤¯à¤¾ à¤¸à¥à¤µà¤¤à¤ƒà¤šà¥à¤¯à¤¾ à¤­à¤¾à¤·à¥‡à¤¤, à¤¸à¥à¤µà¤¤à¤ƒà¤šà¥à¤¯à¤¾ à¤¶à¤¬à¥à¤¦à¤¾à¤‚à¤¤ à¤¸à¥‡à¤µà¤¾ à¤¸à¤¾à¤‚à¤—à¤¾.",
      step2_t: "à¤¯à¥‹à¤—à¥à¤¯ à¤œà¥à¤³à¤£à¥€ à¤®à¤¿à¤³à¤µà¤¾", step2_d: "à¤†à¤®à¥à¤¹à¥€ à¤•à¥Œà¤¶à¤²à¥à¤¯, à¤°à¥‡à¤Ÿà¤¿à¤‚à¤—, à¤¸à¥à¤¥à¤¾à¤¨ à¤µ à¤‰à¤ªà¤²à¤¬à¥à¤§à¤¤à¥‡à¤¨à¥à¤¸à¤¾à¤° à¤œà¤µà¤³à¤šà¥‡ à¤ªà¤¡à¤¤à¤¾à¤³à¤£à¥€ à¤•à¥‡à¤²à¥‡à¤²à¥‡ à¤•à¤¾à¤®à¤—à¤¾à¤° à¤¶à¥‹à¤§à¤¤à¥‹.",
      step3_t: "à¤µà¤¿à¤¶à¥à¤µà¤¾à¤¸à¤¾à¤¨à¥‡ à¤¬à¥à¤• à¤•à¤°à¤¾", step3_d: "à¤µà¥‡à¤³ à¤¨à¤¿à¤µà¤¡à¤¾, à¤¸à¥‡à¤µà¤¾ à¤Ÿà¥à¤°à¥…à¤• à¤•à¤°à¤¾, à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤ à¤ªà¥‡à¤®à¥‡à¤‚à¤Ÿ à¤•à¤°à¤¾, à¤†à¤£à¤¿ à¤°à¥‡à¤Ÿà¤¿à¤‚à¤— à¤¦à¥à¤¯à¤¾.",
      step4_t: "à¤¨à¥‡à¤Ÿà¤µà¤°à¥à¤• à¤µà¤¾à¤¢à¤£à¥à¤¯à¤¾à¤¸ à¤®à¤¦à¤¤ à¤•à¤°à¤¾", step4_d: "à¤ªà¥à¤°à¤¤à¥à¤¯à¥‡à¤• à¤¬à¥à¤•à¤¿à¤‚à¤— à¤¸à¥à¤¥à¤¾à¤¨à¤¿à¤• à¤•à¤¾à¤®à¤—à¤¾à¤° à¤µ à¤¤à¥à¤¯à¤¾à¤‚à¤šà¥à¤¯à¤¾ à¤¸à¤¹à¤•à¤¾à¤°à¥€ à¤¸à¤‚à¤¸à¥à¤¥à¥‡à¤²à¤¾ à¤¬à¤³à¤•à¤Ÿ à¤•à¤°à¤¤à¥‡.",
      communities_kicker: "à¤à¤• à¤µà¥à¤¯à¤¾à¤¸à¤ªà¥€à¤ . à¤¤à¥€à¤¨ à¤¸à¤®à¥à¤¦à¤¾à¤¯.",
      communities_h2: "à¤¸à¤¾à¤®à¤¾à¤¯à¤¿à¤• à¤¸à¤®à¥ƒà¤¦à¥à¤§à¥€,<br><em>à¤ªà¥à¤°à¤¤à¥à¤¯à¥‡à¤• à¤¬à¥à¤•à¤¿à¤‚à¤—à¤®à¤§à¥à¤¯à¥‡ à¤—à¥à¤‚à¤«à¤²à¥‡à¤²à¥€.</em>",
      comm1_num: "à¥¦à¥§ / à¤•à¥à¤Ÿà¥à¤‚à¤¬à¤¾à¤‚à¤¸à¤¾à¤ à¥€", comm1_h3: "à¤œà¤µà¤³ à¤µà¤¿à¤¶à¥à¤µà¤¾à¤¸à¤¾à¤°à¥à¤¹ à¤®à¤¦à¤¤ à¤¶à¥‹à¤§à¤¾.",
      comm1_p: "à¤ªà¤¾à¤°à¤¦à¤°à¥à¤¶à¤• à¤°à¥‡à¤Ÿà¤¿à¤‚à¤—, à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤ à¤ªà¥‡à¤®à¥‡à¤‚à¤Ÿ à¤µ à¤—à¤°à¤œà¥‡à¤šà¥à¤¯à¤¾ à¤µà¥‡à¤³à¥€ à¤®à¤¦à¤¤à¥€à¤¸à¤¹ à¤µà¤¿à¤¶à¥à¤µà¤¾à¤¸à¤¾à¤°à¥à¤¹ à¤µà¥à¤¯à¤¾à¤µà¤¸à¤¾à¤¯à¤¿à¤• à¤¬à¥à¤• à¤•à¤°à¤¾.",
      comm1_link: "à¤¸à¥‡à¤µà¤¾ à¤¶à¥‹à¤§à¤¾",
      comm2_num: "à¥¦à¥¨ / à¤•à¤¾à¤®à¤—à¤¾à¤°à¤¾à¤‚à¤¸à¤¾à¤ à¥€", comm2_h3: "à¤¤à¥à¤®à¤šà¥à¤¯à¤¾ à¤•à¥Œà¤¶à¤²à¥à¤¯à¤¾à¤‚à¤šà¥‡ à¤¸à¤‚à¤§à¥€à¤¤ à¤°à¥‚à¤ªà¤¾à¤‚à¤¤à¤° à¤•à¤°à¤¾.",
      comm2_p: "à¤µà¥à¤¯à¤¾à¤µà¤¸à¤¾à¤¯à¤¿à¤• à¤“à¤³à¤– à¤¤à¤¯à¤¾à¤° à¤•à¤°à¤¾, à¤šà¤¾à¤‚à¤—à¤²à¥€ à¤•à¤¾à¤®à¥‡ à¤¶à¥‹à¤§à¤¾, à¤ªà¥à¤°à¤¤à¤¿à¤·à¥à¤ à¤¾ à¤µà¤¾à¤¢à¤µà¤¾, à¤†à¤£à¤¿ à¤¸à¤¹à¤•à¤¾à¤°à¥€ à¤•à¤²à¥à¤¯à¤¾à¤£ à¤²à¤¾à¤­ à¤®à¤¿à¤³à¤µà¤¾.",
      comm2_link: "à¤•à¤¾à¤®à¤—à¤¾à¤° à¤®à¥à¤¹à¤£à¥‚à¤¨ à¤¸à¤¾à¤®à¥€à¤² à¤µà¥à¤¹à¤¾",
      comm3_num: "à¥¦à¥© / à¤¸à¤¹à¤•à¤¾à¤°à¥€ à¤¸à¤‚à¤¸à¥à¤¥à¤¾à¤‚à¤¸à¤¾à¤ à¥€", comm3_h3: "à¤¬à¥à¤¦à¥à¤§à¤¿à¤®à¤¤à¥à¤¤à¥‡à¤¨à¥‡ à¤¸à¤®à¤¨à¥à¤µà¤¯ à¤¸à¤¾à¤§à¤¾.",
      comm3_p: "à¤¤à¥à¤®à¤šà¥‡ à¤•à¤°à¥à¤®à¤šà¤¾à¤°à¥€ à¤µà¥à¤¯à¤µà¤¸à¥à¤¥à¤¾à¤ªà¤¿à¤¤ à¤•à¤°à¤¾, à¤®à¤¾à¤—à¤£à¥€à¤šà¤¾ à¤…à¤‚à¤¦à¤¾à¤œ à¤˜à¥à¤¯à¤¾, à¤•à¤¾à¤®à¥‡ à¤µà¤¾à¤Ÿà¤ª à¤•à¤°à¤¾, à¤†à¤£à¤¿ à¤à¤•à¤¾à¤š à¤µà¥à¤¯à¤¾à¤¸à¤ªà¥€à¤ à¤¾à¤µà¤°à¥‚à¤¨ à¤ªà¤°à¤¿à¤£à¤¾à¤® à¤®à¥‹à¤œà¤¾.",
      comm3_link: "à¤¸à¤¹à¤•à¤¾à¤°à¥€ à¤¸à¤‚à¤¸à¥à¤¥à¤¾ à¤ªà¤¹à¤¾",
      final_kicker: "à¤¤à¥à¤®à¥à¤¹à¥€ à¤¤à¤¯à¤¾à¤° à¤…à¤¸à¤¾à¤² à¤¤à¥‡à¤µà¥à¤¹à¤¾",
      final_h2: "à¤¤à¥à¤®à¤šà¥€ à¤ªà¥à¤¢à¥€à¤² à¤¸à¥‡à¤µà¤¾<br><em>à¤«à¤•à¥à¤¤ à¤•à¤¾à¤¹à¥€ à¤•à¥à¤²à¤¿à¤• à¤¦à¥‚à¤° à¤†à¤¹à¥‡.</em>",
      final_p: "à¤µà¤¿à¤¶à¥à¤µà¤¾à¤¸à¤¾à¤°à¥à¤¹ à¤µà¥à¤¯à¤¾à¤µà¤¸à¤¾à¤¯à¤¿à¤• à¤¶à¥‹à¤§à¤¾. à¤•à¥à¤¶à¤² à¤•à¤¾à¤®à¤—à¤¾à¤°à¤¾à¤‚à¤¨à¤¾ à¤ªà¤¾à¤ à¤¿à¤‚à¤¬à¤¾ à¤¦à¥à¤¯à¤¾. à¤¸à¥à¤¥à¤¾à¤¨à¤¿à¤• à¤¸à¤¹à¤•à¤¾à¤°à¥€ à¤¸à¤‚à¤¸à¥à¤¥à¤¾ à¤¬à¤³à¤•à¤Ÿ à¤•à¤°à¤¾.",
      footer_tagline: "à¤•à¥Œà¤¶à¤²à¥à¤¯à¥‡ à¤œà¥‹à¤¡à¤£à¥‡.<br>à¤¸à¤‚à¤§à¥€ à¤¨à¤¿à¤°à¥à¤®à¤¾à¤£ à¤•à¤°à¤£à¥‡."
    },
    ta: {
      nav_how: "à®‡à®¤à¯ à®Žà®ªà¯à®ªà®Ÿà®¿ à®šà¯†à®¯à®²à¯à®ªà®Ÿà¯à®•à®¿à®±à®¤à¯", nav_services: "à®šà¯‡à®µà¯ˆà®•à®³à¯", nav_communities: "à®šà®®à¯‚à®•à®™à¯à®•à®³à¯à®•à¯à®•à¯", nav_cooperatives: "à®•à¯‚à®Ÿà¯à®Ÿà¯à®±à®µà¯ à®šà®™à¯à®•à®™à¯à®•à®³à¯à®•à¯à®•à¯",
      nav_login: "à®‰à®³à¯à®¨à¯à®´à¯ˆà®¯", nav_getstarted: "à®¤à¯Šà®Ÿà®™à¯à®•à¯à®™à¯à®•à®³à¯",
      hero_eyebrow: "à®•à¯‚à®Ÿà¯à®Ÿà¯à®±à®µà¯-à®‡à®¯à®™à¯à®•à¯à®®à¯ à®šà¯‡à®µà¯ˆ à®¨à¯†à®Ÿà¯à®µà¯Šà®°à¯à®•à¯",
      hero_h1: "à®’à®µà¯à®µà¯Šà®°à¯ à®µà¯€à®Ÿà¯à®Ÿà®¿à®±à¯à®•à¯à®®à¯ à®¨à®®à¯à®ªà®•à®®à®¾à®© à®‰à®¤à®µà®¿.<br><em>à®’à®µà¯à®µà¯Šà®°à¯ à®¤à¯Šà®´à®¿à®²à®¾à®³à®¿à®•à¯à®•à¯à®®à¯</em> à®šà®¿à®±à®¨à¯à®¤ à®µà®¾à®¯à¯à®ªà¯à®ªà¯à®•à®³à¯.",
      hero_lede: "SharmNexus à®µà¯€à®Ÿà¯à®•à®³à¯ˆ à®šà®°à®¿à®ªà®¾à®°à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿ à®‰à®³à¯à®³à¯‚à®°à¯ à®¨à®¿à®ªà¯à®£à®°à¯à®•à®³à¯à®Ÿà®©à¯ à®‡à®£à¯ˆà®•à¯à®•à®¿à®±à®¤à¯, à®®à¯‡à®²à¯à®®à¯ à®¤à¯Šà®´à®¿à®²à®¾à®³à®°à¯ à®•à¯‚à®Ÿà¯à®Ÿà¯à®±à®µà¯ à®šà®™à¯à®•à®™à¯à®•à®³à¯ à®µà¯‡à®²à¯ˆ, à®µà®°à¯à®®à®¾à®©à®®à¯ à®®à®±à¯à®±à¯à®®à¯ à®¨à®²à®©à¯ˆ à®’à®°à¯‡ à®¤à®³à®¤à¯à®¤à®¿à®²à¯ à®¨à®¿à®°à¯à®µà®•à®¿à®•à¯à®• à®‰à®¤à®µà¯à®•à®¿à®±à®¤à¯.",
      hero_cta_find: "à®šà¯‡à®µà¯ˆà®¯à¯ˆà®¤à¯ à®¤à¯‡à®Ÿà¯à®™à¯à®•à®³à¯", hero_cta_join: "à®¤à¯Šà®´à®¿à®²à®¾à®³à®¿à®¯à®¾à®• à®‡à®£à¯ˆà®¯à¯à®™à¯à®•à®³à¯",
      hero_proof_title: "à®‰à®³à¯à®³à¯‚à®°à¯ à®¨à®®à¯à®ªà®¿à®•à¯à®•à¯ˆà®¯à®¿à®©à¯ à®…à®Ÿà®¿à®ªà¯à®ªà®Ÿà¯ˆà®¯à®¿à®²à¯ à®•à®Ÿà¯à®Ÿà®®à¯ˆà®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà®¤à¯", hero_proof_sub: "à®¨à¯†à®Ÿà¯à®µà¯Šà®°à¯à®•à¯à®•à®¿à®²à¯ à®à®±à¯à®•à®©à®µà¯‡ 5,000+ à®¤à®¿à®±à®®à¯ˆà®¯à®¾à®© à®¤à¯Šà®´à®¿à®²à®¾à®³à®°à¯à®•à®³à¯",
      trust_workers: "à®¤à®¿à®±à®®à¯ˆà®¯à®¾à®© à®¤à¯Šà®´à®¿à®²à®¾à®³à®°à¯à®•à®³à¯", trust_services: "à®®à¯à®Ÿà®¿à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿ à®šà¯‡à®µà¯ˆà®•à®³à¯", trust_coops: "à®•à¯‚à®Ÿà¯à®Ÿà¯à®±à®µà¯ à®šà®™à¯à®•à®™à¯à®•à®³à¯", trust_rating: "à®šà®°à®¾à®šà®°à®¿ à®®à®¤à®¿à®ªà¯à®ªà¯€à®Ÿà¯",
      trust_tagline: "à®’à®°à¯ à®¨à¯†à®Ÿà¯à®µà¯Šà®°à¯à®•à¯. à®‡à®£à¯ˆà®µà®¤à®±à¯à®•à¯ à®ªà®² à®µà®´à®¿à®•à®³à¯.",
      services_kicker: "à®¤à®¿à®©à®šà®°à®¿ à®‰à®¤à®µà®¿, à®µà¯€à®Ÿà¯à®Ÿà®¿à®±à¯à®•à¯ à®…à®°à¯à®•à®¿à®²à¯",
      services_h2: "à®‰à®™à¯à®•à®³à¯à®•à¯à®•à¯ à®Žà®©à¯à®© à®¤à¯‡à®µà¯ˆà®¯à®¾à®©à®¾à®²à¯à®®à¯,<br><em>à®…à®°à¯à®•à®¿à®²à¯ à®‰à®³à¯à®³à®µà®°à¯ à®‰à®¤à®µ à®®à¯à®Ÿà®¿à®¯à¯à®®à¯.</em>",
      services_explore: "à®…à®©à¯ˆà®¤à¯à®¤à¯ à®šà¯‡à®µà¯ˆà®•à®³à¯ˆà®¯à¯à®®à¯ à®ªà®¾à®°à¯à®•à¯à®•",
      svc_plumbing_t: "à®ªà®¿à®³à®®à¯à®ªà®¿à®™à¯", svc_plumbing_d: "à®ªà®´à¯à®¤à¯à®ªà®¾à®°à¯à®ªà¯à®ªà¯, à®ªà¯Šà®°à¯à®¤à¯à®¤à¯à®¤à®²à¯ à®®à®±à¯à®±à¯à®®à¯ à®ªà®°à®¾à®®à®°à®¿à®ªà¯à®ªà¯",
      svc_electrical_t: "à®®à®¿à®©à¯à®šà®¾à®°à®®à¯", svc_electrical_d: "à®ªà®´à¯à®¤à¯à®ªà®¾à®°à¯à®ªà¯à®ªà¯ à®®à®±à¯à®±à¯à®®à¯ à®¨à®¿à®±à¯à®µà®²à¯",
      svc_cleaning_t: "à®šà¯à®¤à¯à®¤à®®à¯ à®šà¯†à®¯à¯à®¤à®²à¯", svc_cleaning_d: "à®µà¯€à®Ÿà¯ à®®à®±à¯à®±à¯à®®à¯ à®…à®²à¯à®µà®²à®• à®ªà®°à®¾à®®à®°à®¿à®ªà¯à®ªà¯",
      svc_caregiving_t: "à®ªà®°à®¾à®®à®°à®¿à®ªà¯à®ªà¯", svc_caregiving_d: "à®¤à¯‡à®µà¯ˆà®¯à®¾à®© à®¨à¯‡à®°à®¤à¯à®¤à®¿à®²à¯ à®†à®¤à®°à®µà¯",
      svc_carpentry_t: "à®¤à®šà¯à®šà¯ à®µà¯‡à®²à¯ˆ", svc_carpentry_d: "à®®à®°à®šà¯à®šà®¾à®®à®¾à®©à¯à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯ à®ªà®´à¯à®¤à¯à®ªà®¾à®°à¯à®ªà¯à®ªà¯",
      svc_driving_t: "à®µà®¾à®•à®©à®®à¯ à®“à®Ÿà¯à®Ÿà¯à®¤à®²à¯", svc_driving_d: "à®ªà¯‹à®•à¯à®•à¯à®µà®°à®¤à¯à®¤à¯ à®®à®±à¯à®±à¯à®®à¯ à®µà®¿à®¨à®¿à®¯à¯‹à®•à®®à¯",
      svc_gardening_t: "à®¤à¯‹à®Ÿà¯à®Ÿà®µà¯‡à®²à¯ˆ", svc_gardening_d: "à®¨à®¿à®²à®ªà¯à®ªà®°à®ªà¯à®ªà¯ à®…à®®à¯ˆà®ªà¯à®ªà¯ à®®à®±à¯à®±à¯à®®à¯ à®ªà®°à®¾à®®à®°à®¿à®ªà¯à®ªà¯",
      svc_technician_t: "à®¤à¯Šà®´à®¿à®²à¯à®¨à¯à®Ÿà¯à®ªà®°à¯", svc_technician_d: "à®¤à¯Šà®´à®¿à®²à¯à®¨à¯à®Ÿà¯à®ª à®ªà®´à¯à®¤à¯ à®®à®±à¯à®±à¯à®®à¯ à®†à®¤à®°à®µà¯",
      map_kicker: "à®¨à¯‡à®°à®Ÿà®¿ à®‰à®³à¯à®³à¯‚à®°à¯ à®¨à¯†à®Ÿà¯à®µà¯Šà®°à¯à®•à¯", map_h2: "à®‰à®™à¯à®•à®³à¯ˆà®šà¯ à®šà¯à®±à¯à®±à®¿à®¯à¯à®³à¯à®³ à®šà¯‡à®µà¯ˆà®•à®³à¯.",
      map_p: "à®šà®°à®¿à®ªà®¾à®°à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿ à®¤à¯Šà®´à®¿à®²à®¾à®³à®°à¯à®•à®³à¯, à®¨à®Ÿà®ªà¯à®ªà¯ à®®à¯à®©à¯à®ªà®¤à®¿à®µà¯à®•à®³à¯, à®®à®±à¯à®±à¯à®®à¯ à®…à®¤à®¿à®• à®¤à¯‡à®µà¯ˆ à®‰à®³à¯à®³ à®ªà®•à¯à®¤à®¿à®•à®³à¯ˆà®ªà¯ à®ªà®¾à®°à¯à®•à¯à®•à®µà¯à®®à¯.",
      map_locbtn: "à®Žà®©à®¤à¯ à®‡à®°à¯à®ªà¯à®ªà®¿à®Ÿà®¤à¯à®¤à¯ˆà®ªà¯ à®ªà®¯à®©à¯à®ªà®Ÿà¯à®¤à¯à®¤à®µà¯à®®à¯",
      legend_workers: "à®•à®¿à®Ÿà¯ˆà®•à¯à®•à¯à®®à¯ à®¤à¯Šà®´à®¿à®²à®¾à®³à®°à¯à®•à®³à¯", legend_bookings: "à®¨à®Ÿà®ªà¯à®ªà¯ à®®à¯à®©à¯à®ªà®¤à®¿à®µà¯à®•à®³à¯",
      legend_demand: "à®…à®¤à®¿à®• à®¤à¯‡à®µà¯ˆ à®‰à®³à¯à®³ à®ªà®•à¯à®¤à®¿à®•à®³à¯", legend_requests: "à®µà®¾à®Ÿà®¿à®•à¯à®•à¯ˆà®¯à®¾à®³à®°à¯ à®•à¯‹à®°à®¿à®•à¯à®•à¯ˆà®•à®³à¯",
      features_kicker: "SHARMNEXUS-à®‡à®©à¯ à®šà®¿à®±à®ªà¯à®ªà®®à¯à®šà®®à¯",
      features_h2: "à®‰à®™à¯à®•à®³à¯à®•à¯à®•à¯à®¤à¯ à®¤à¯‡à®µà¯ˆà®¯à®¾à®© à®…à®©à¯ˆà®¤à¯à®¤à¯à®®à¯.<br><em>à®’à®°à¯ à®Žà®³à®¿à®¯ à®¤à®³à®®à¯.</em>",
      feat_1: "à®šà®°à®¿à®ªà®¾à®°à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿ<br>à®¨à®¿à®ªà¯à®£à®°à¯à®•à®³à¯ˆà®•à¯ à®•à®£à¯à®Ÿà®±à®¿à®¯à®µà¯à®®à¯", feat_2: "à®‡à®°à¯à®ªà¯à®ªà®¿à®Ÿà®®à¯ à®…à®Ÿà®¿à®ªà¯à®ªà®Ÿà¯ˆà®¯à®¿à®²à®¾à®©<br>à®ªà¯Šà®°à¯à®¤à¯à®¤à®®à¯", feat_3: "à®Žà®³à®¿à®¤à®¾à®© à®¤à®¿à®Ÿà¯à®Ÿà®®à®¿à®Ÿà®²à¯",
      feat_4: "à®ªà®¾à®¤à¯à®•à®¾à®ªà¯à®ªà®¾à®© à®Ÿà®¿à®œà®¿à®Ÿà¯à®Ÿà®²à¯<br>à®•à®Ÿà¯à®Ÿà®£à®®à¯", feat_5: "à®Ÿà®¿à®œà®¿à®Ÿà¯à®Ÿà®²à¯ à®µà®¿à®²à¯ˆà®ªà¯à®ªà®Ÿà¯à®Ÿà®¿à®¯à®²à¯", feat_6: "à®®à®¤à®¿à®ªà¯à®ªà¯€à®Ÿà¯à®•à®³à¯ à®®à®±à¯à®±à¯à®®à¯<br>à®µà®¿à®®à®°à¯à®šà®©à®™à¯à®•à®³à¯",
      feat_7: "à®šà¯‡à®µà¯ˆ à®•à®£à¯à®•à®¾à®£à®¿à®ªà¯à®ªà¯", feat_8: "à®…à®µà®šà®°<br>à®®à¯à®©à¯à®ªà®¤à®¿à®µà¯",
      access_kicker: "à®…à®©à¯ˆà®µà®°à¯à®•à¯à®•à¯à®®à®¾à®© à®µà®Ÿà®¿à®µà®®à¯ˆà®ªà¯à®ªà¯",
      access_h2: "à®‰à®™à¯à®•à®³à¯ à®®à¯Šà®´à®¿à®¯à®¿à®²à¯ à®ªà¯‡à®šà¯à®®à¯<br><em>à®¤à¯Šà®´à®¿à®²à¯à®¨à¯à®Ÿà¯à®ªà®®à¯.</em>",
      access_explore: "SharmNexus-à® à®†à®°à®¾à®¯à¯à®™à¯à®•à®³à¯",
      worker_kicker: "à®¤à®¿à®±à®®à¯ˆà®¯à®¾à®© à®¤à¯Šà®´à®¿à®²à®¾à®³à®°à¯à®•à®³à¯à®•à¯à®•à¯",
      worker_h2: "à®‰à®™à¯à®•à®³à¯ à®¤à®¿à®±à®®à¯ˆà®•à®³à¯à®•à¯à®•à¯<br><em>à®®à¯‡à®²à¯à®®à¯ à®µà®¾à®¯à¯à®ªà¯à®ªà¯à®•à®³à¯.</em>",
      worker_p: "à®‰à®™à¯à®•à®³à¯ à®¤à¯Šà®´à®¿à®²à¯à®®à¯à®±à¯ˆ à®…à®Ÿà¯ˆà®¯à®¾à®³à®¤à¯à®¤à¯ˆ à®‰à®°à¯à®µà®¾à®•à¯à®•à¯à®™à¯à®•à®³à¯, à®µà¯‡à®²à¯ˆà®•à®³à¯ˆà®•à¯ à®•à®£à¯à®Ÿà®±à®¿à®¯à¯à®™à¯à®•à®³à¯, à®¨à®±à¯à®ªà¯†à®¯à®°à¯ˆ à®µà®³à®°à¯à®¤à¯à®¤à¯à®•à¯à®•à¯Šà®³à¯à®³à¯à®™à¯à®•à®³à¯, à®®à¯‡à®²à¯à®®à¯ à®’à®°à¯‡ à®¤à®³à®¤à¯à®¤à®¿à®²à¯ à®•à¯‚à®Ÿà¯à®Ÿà¯à®±à®µà¯ à®¨à®²à®©à¯ à®ªà®²à®©à¯à®•à®³à¯ˆà®ªà¯ à®ªà¯†à®±à¯à®™à¯à®•à®³à¯.",
      how_kicker: "à®Žà®³à®¿à®®à¯ˆà®¯à®¾à®© à®µà®Ÿà®¿à®µà®®à¯ˆà®ªà¯à®ªà¯",
      how_h2: "â€œà®Žà®©à®•à¯à®•à¯ à®‰à®¤à®µà®¿ à®¤à¯‡à®µà¯ˆâ€<br><em>à®Žà®©à¯à®ªà®¤à®¿à®²à®¿à®°à¯à®¨à¯à®¤à¯ â€œà®…à®©à¯ˆà®¤à¯à®¤à¯à®®à¯ à®šà®°à®¿â€ à®µà®°à¯ˆ.</em>",
      step1_t: "à®‰à®™à¯à®•à®³à¯à®•à¯à®•à¯ à®Žà®©à¯à®© à®¤à¯‡à®µà¯ˆ à®Žà®©à¯à®±à¯ à®šà¯Šà®²à¯à®²à¯à®™à¯à®•à®³à¯", step1_d: "à®‰à®™à¯à®•à®³à¯ à®šà¯Šà®¨à¯à®¤ à®®à¯Šà®´à®¿à®¯à®¿à®²à¯, à®‰à®™à¯à®•à®³à¯ à®šà¯Šà®¨à¯à®¤ à®µà®¾à®°à¯à®¤à¯à®¤à¯ˆà®•à®³à®¿à®²à¯ à®šà¯‡à®µà¯ˆà®¯à¯ˆ à®µà®¿à®µà®°à®¿à®•à¯à®•à®µà¯à®®à¯.",
      step2_t: "à®ªà¯à®¤à¯à®¤à®¿à®šà®¾à®²à®¿à®¤à¯à®¤à®©à®®à®¾à®•à®ªà¯ à®ªà¯Šà®°à¯à®¤à¯à®¤à®ªà¯à®ªà®Ÿà¯à®™à¯à®•à®³à¯", step2_d: "à®¤à®¿à®±à®®à¯ˆ, à®®à®¤à®¿à®ªà¯à®ªà¯€à®Ÿà¯, à®‡à®°à¯à®ªà¯à®ªà®¿à®Ÿà®®à¯ à®®à®±à¯à®±à¯à®®à¯ à®•à®¿à®Ÿà¯ˆà®•à¯à®•à¯à®®à¯ à®¤à®©à¯à®®à¯ˆà®¯à®¿à®©à¯ à®…à®Ÿà®¿à®ªà¯à®ªà®Ÿà¯ˆà®¯à®¿à®²à¯ à®…à®°à¯à®•à®¿à®²à¯à®³à¯à®³ à®šà®°à®¿à®ªà®¾à®°à¯à®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿ à®¤à¯Šà®´à®¿à®²à®¾à®³à®°à¯à®•à®³à¯ˆà®•à¯ à®•à®£à¯à®Ÿà®±à®¿à®•à®¿à®±à¯‹à®®à¯.",
      step3_t: "à®¨à®®à¯à®ªà®¿à®•à¯à®•à¯ˆà®¯à¯à®Ÿà®©à¯ à®®à¯à®©à¯à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à¯à®™à¯à®•à®³à¯", step3_d: "à®¨à¯‡à®°à®¤à¯à®¤à¯ˆà®¤à¯ à®¤à¯‡à®°à¯à®¨à¯à®¤à¯†à®Ÿà¯à®™à¯à®•à®³à¯, à®šà¯‡à®µà¯ˆà®¯à¯ˆà®•à¯ à®•à®£à¯à®•à®¾à®£à®¿à®¯à¯à®™à¯à®•à®³à¯, à®ªà®¾à®¤à¯à®•à®¾à®ªà¯à®ªà®¾à®•à®•à¯ à®•à®Ÿà¯à®Ÿà®£à®®à¯ à®šà¯†à®²à¯à®¤à¯à®¤à¯à®™à¯à®•à®³à¯, à®®à®±à¯à®±à¯à®®à¯ à®®à®¤à®¿à®ªà¯à®ªà¯€à®Ÿà¯ à®…à®³à®¿à®¯à¯à®™à¯à®•à®³à¯.",
      step4_t: "à®¨à¯†à®Ÿà¯à®µà¯Šà®°à¯à®•à¯ à®µà®³à®° à®‰à®¤à®µà¯à®™à¯à®•à®³à¯", step4_d: "à®’à®µà¯à®µà¯Šà®°à¯ à®®à¯à®©à¯à®ªà®¤à®¿à®µà¯à®®à¯ à®‰à®³à¯à®³à¯‚à®°à¯ à®¤à¯Šà®´à®¿à®²à®¾à®³à®°à¯à®•à®³à¯ˆà®¯à¯à®®à¯ à®…à®µà®°à¯à®•à®³à®¿à®©à¯ à®•à¯‚à®Ÿà¯à®Ÿà¯à®±à®µà¯ à®šà®™à¯à®•à®¤à¯à®¤à¯ˆà®¯à¯à®®à¯ à®µà®²à¯à®ªà¯à®ªà®Ÿà¯à®¤à¯à®¤à¯à®•à®¿à®±à®¤à¯.",
      communities_kicker: "à®’à®°à¯ à®¤à®³à®®à¯. à®®à¯‚à®©à¯à®±à¯ à®šà®®à¯‚à®•à®™à¯à®•à®³à¯.",
      communities_h2: "à®ªà®•à®¿à®°à®ªà¯à®ªà®Ÿà¯à®Ÿ à®šà¯†à®´à®¿à®ªà¯à®ªà¯,<br><em>à®’à®µà¯à®µà¯Šà®°à¯ à®®à¯à®©à¯à®ªà®¤à®¿à®µà®¿à®²à¯à®®à¯ à®µà®Ÿà®¿à®µà®®à¯ˆà®•à¯à®•à®ªà¯à®ªà®Ÿà¯à®Ÿà¯à®³à¯à®³à®¤à¯.</em>",
      comm1_num: "01 / à®•à¯à®Ÿà¯à®®à¯à®ªà®™à¯à®•à®³à¯à®•à¯à®•à¯", comm1_h3: "à®…à®°à¯à®•à®¿à®²à¯ à®¨à®®à¯à®ªà®•à®®à®¾à®© à®‰à®¤à®µà®¿à®¯à¯ˆà®•à¯ à®•à®£à¯à®Ÿà®±à®¿à®¯à¯à®™à¯à®•à®³à¯.",
      comm1_p: "à®µà¯†à®³à®¿à®ªà¯à®ªà®Ÿà¯ˆà®¯à®¾à®© à®®à®¤à®¿à®ªà¯à®ªà¯€à®Ÿà¯à®•à®³à¯, à®ªà®¾à®¤à¯à®•à®¾à®ªà¯à®ªà®¾à®© à®•à®Ÿà¯à®Ÿà®£à®™à¯à®•à®³à¯, à®®à®±à¯à®±à¯à®®à¯ à®¤à¯‡à®µà¯ˆà®¯à®¾à®© à®¨à¯‡à®°à®¤à¯à®¤à®¿à®²à¯ à®†à®¤à®°à®µà¯à®Ÿà®©à¯ à®¨à®®à¯à®ªà®•à®®à®¾à®© à®¨à®¿à®ªà¯à®£à®°à¯à®•à®³à¯ˆ à®®à¯à®©à¯à®ªà®¤à®¿à®µà¯ à®šà¯†à®¯à¯à®¯à¯à®™à¯à®•à®³à¯.",
      comm1_link: "à®šà¯‡à®µà¯ˆà®¯à¯ˆà®¤à¯ à®¤à¯‡à®Ÿà¯à®™à¯à®•à®³à¯",
      comm2_num: "02 / à®¤à¯Šà®´à®¿à®²à®¾à®³à®°à¯à®•à®³à¯à®•à¯à®•à¯", comm2_h3: "à®‰à®™à¯à®•à®³à¯ à®¤à®¿à®±à®®à¯ˆà®•à®³à¯ˆ à®µà®¾à®¯à¯à®ªà¯à®ªà®¾à®• à®®à®¾à®±à¯à®±à¯à®™à¯à®•à®³à¯.",
      comm2_p: "à®¤à¯Šà®´à®¿à®²à¯à®®à¯à®±à¯ˆ à®…à®Ÿà¯ˆà®¯à®¾à®³à®¤à¯à®¤à¯ˆ à®‰à®°à¯à®µà®¾à®•à¯à®•à¯à®™à¯à®•à®³à¯, à®šà®¿à®±à®¨à¯à®¤ à®µà¯‡à®²à¯ˆà®•à®³à¯ˆà®•à¯ à®•à®£à¯à®Ÿà®±à®¿à®¯à¯à®™à¯à®•à®³à¯, à®¨à®±à¯à®ªà¯†à®¯à®°à¯ˆ à®µà®³à®°à¯à®¤à¯à®¤à¯à®•à¯ à®•à¯Šà®³à¯à®³à¯à®™à¯à®•à®³à¯, à®®à¯‡à®²à¯à®®à¯ à®•à¯‚à®Ÿà¯à®Ÿà¯à®±à®µà¯ à®¨à®²à®©à¯ à®ªà®²à®©à¯à®•à®³à¯ˆà®ªà¯ à®ªà¯†à®±à¯à®™à¯à®•à®³à¯.",
      comm2_link: "à®¤à¯Šà®´à®¿à®²à®¾à®³à®¿à®¯à®¾à®• à®‡à®£à¯ˆà®¯à¯à®™à¯à®•à®³à¯",
      comm3_num: "03 / à®•à¯‚à®Ÿà¯à®Ÿà¯à®±à®µà¯ à®šà®™à¯à®•à®™à¯à®•à®³à¯à®•à¯à®•à¯", comm3_h3: "à®ªà¯à®¤à¯à®¤à®¿à®šà®¾à®²à®¿à®¤à¯à®¤à®©à®®à®¾à®• à®’à®°à¯à®™à¯à®•à®¿à®£à¯ˆà®•à¯à®•à®µà¯à®®à¯.",
      comm3_p: "à®‰à®™à¯à®•à®³à¯ à®ªà®£à®¿à®¯à®¾à®³à®°à¯à®•à®³à¯ˆ à®¨à®¿à®°à¯à®µà®•à®¿à®•à¯à®•à®µà¯à®®à¯, à®¤à¯‡à®µà¯ˆà®¯à¯ˆ à®®à¯à®©à¯à®•à¯‚à®Ÿà¯à®Ÿà®¿à®¯à¯‡ à®…à®±à®¿à®¯à®µà¯à®®à¯, à®µà¯‡à®²à¯ˆà®•à®³à¯ˆ à®’à®¤à¯à®•à¯à®•à®µà¯à®®à¯, à®’à®°à¯‡ à®¤à®³à®¤à¯à®¤à®¿à®²à¯ à®¤à®¾à®•à¯à®•à®¤à¯à®¤à¯ˆ à®…à®³à®•à¯à®•à®µà¯à®®à¯.",
      comm3_link: "à®•à¯‚à®Ÿà¯à®Ÿà¯à®±à®µà¯ à®šà®™à¯à®•à®™à¯à®•à®³à¯ˆ à®†à®°à®¾à®¯à¯à®™à¯à®•à®³à¯",
      final_kicker: "à®¨à¯€à®™à¯à®•à®³à¯ à®¤à®¯à®¾à®°à®¾à®• à®‡à®°à¯à®•à¯à®•à¯à®®à¯à®ªà¯‹à®¤à¯",
      final_h2: "à®‰à®™à¯à®•à®³à¯ à®…à®Ÿà¯à®¤à¯à®¤ à®šà¯‡à®µà¯ˆ<br><em>à®šà®¿à®² à®•à®¿à®³à®¿à®•à¯à®•à¯à®•à®³à¯ à®¤à¯Šà®²à¯ˆà®µà®¿à®²à¯ à®‰à®³à¯à®³à®¤à¯.</em>",
      final_p: "à®¨à®®à¯à®ªà®•à®®à®¾à®© à®¨à®¿à®ªà¯à®£à®°à¯à®•à®³à¯ˆà®•à¯ à®•à®£à¯à®Ÿà®±à®¿à®¯à¯à®™à¯à®•à®³à¯. à®¤à®¿à®±à®®à¯ˆà®¯à®¾à®© à®¤à¯Šà®´à®¿à®²à®¾à®³à®°à¯à®•à®³à¯ˆ à®†à®¤à®°à®¿à®¯à¯à®™à¯à®•à®³à¯. à®‰à®³à¯à®³à¯‚à®°à¯ à®•à¯‚à®Ÿà¯à®Ÿà¯à®±à®µà¯ à®šà®™à¯à®•à®™à¯à®•à®³à¯ˆ à®µà®²à¯à®ªà¯à®ªà®Ÿà¯à®¤à¯à®¤à¯à®™à¯à®•à®³à¯.",
      footer_tagline: "à®¤à®¿à®±à®®à¯ˆà®•à®³à¯ˆ à®‡à®£à¯ˆà®¤à¯à®¤à®²à¯.<br>à®µà®¾à®¯à¯à®ªà¯à®ªà¯à®•à®³à¯ˆ à®‰à®°à¯à®µà®¾à®•à¯à®•à¯à®¤à®²à¯."
    },
    te: {
      nav_how: "à°‡à°¦à°¿ à°Žà°²à°¾ à°ªà°¨à°¿à°šà±‡à°¸à±à°¤à±à°‚à°¦à°¿", nav_services: "à°¸à±‡à°µà°²à±", nav_communities: "à°¸à°‚à°˜à°¾à°² à°•à±‹à°¸à°‚", nav_cooperatives: "à°¸à°¹à°•à°¾à°° à°¸à°‚à°˜à°¾à°² à°•à±‹à°¸à°‚",
      nav_login: "à°²à°¾à°—à°¿à°¨à± à°šà±‡à°¯à°‚à°¡à°¿", nav_getstarted: "à°ªà±à°°à°¾à°°à°‚à°­à°¿à°‚à°šà°‚à°¡à°¿",
      hero_eyebrow: "à°¸à°¹à°•à°¾à°°-à°†à°§à°¾à°°à°¿à°¤ à°¸à±‡à°µà°¾ à°¨à±†à°Ÿà±â€Œà°µà°°à±à°•à±",
      hero_h1: "à°ªà±à°°à°¤à°¿ à°‡à°‚à°Ÿà°¿à°•à±€ à°¨à°®à±à°®à°•à°®à±ˆà°¨ à°¸à°¹à°¾à°¯à°‚.<br><em>à°ªà±à°°à°¤à°¿ à°•à°¾à°°à±à°®à°¿à°•à±à°¡à°¿à°•à°¿</em> à°®à±†à°°à±à°—à±ˆà°¨ à°…à°µà°•à°¾à°¶à°¾à°²à±.",
      hero_lede: "SharmNexus à°‡à°³à±à°²à°¨à± à°§à±ƒà°µà±€à°•à°°à°¿à°‚à°šà°¿à°¨ à°¸à±à°¥à°¾à°¨à°¿à°• à°¨à°¿à°ªà±à°£à±à°²à°¤à±‹ à°•à°²à±à°ªà±à°¤à±à°‚à°¦à°¿, à°®à°°à°¿à°¯à± à°•à°¾à°°à±à°®à°¿à°• à°¸à°¹à°•à°¾à°° à°¸à°‚à°˜à°¾à°²à± à°ªà°¨à°¿, à°†à°¦à°¾à°¯à°‚, à°¸à°‚à°•à±à°·à±‡à°®à°¾à°¨à±à°¨à°¿ à°’à°•à±‡ à°µà±‡à°¦à°¿à°• à°¨à±à°‚à°¡à°¿ à°¨à°¿à°°à±à°µà°¹à°¿à°‚à°šà°¡à°‚à°²à±‹ à°¸à°¹à°¾à°¯à°ªà°¡à±à°¤à±à°‚à°¦à°¿.",
      hero_cta_find: "à°¸à±‡à°µà°¨à± à°•à°¨à±à°—à±Šà°¨à°‚à°¡à°¿", hero_cta_join: "à°•à°¾à°°à±à°®à°¿à°•à±à°¡à°¿à°—à°¾ à°šà±‡à°°à°‚à°¡à°¿",
      hero_proof_title: "à°¸à±à°¥à°¾à°¨à°¿à°• à°¨à°®à±à°®à°•à°‚à°ªà±ˆ à°†à°§à°¾à°°à°ªà°¡à°¿ à°¨à°¿à°°à±à°®à°¿à°‚à°šà°¬à°¡à°¿à°‚à°¦à°¿", hero_proof_sub: "à°¨à±†à°Ÿà±â€Œà°µà°°à±à°•à±â€Œà°²à±‹ à°‡à°ªà±à°ªà°Ÿà°¿à°•à±‡ 5,000+ à°¨à±ˆà°ªà±à°£à±à°¯à°‚ à°—à°² à°•à°¾à°°à±à°®à°¿à°•à±à°²à±",
      trust_workers: "à°¨à±ˆà°ªà±à°£à±à°¯à°‚ à°—à°² à°•à°¾à°°à±à°®à°¿à°•à±à°²à±", trust_services: "à°ªà±‚à°°à±à°¤à°¯à°¿à°¨ à°¸à±‡à°µà°²à±", trust_coops: "à°¸à°¹à°•à°¾à°° à°¸à°‚à°˜à°¾à°²à±", trust_rating: "à°¸à°—à°Ÿà± à°°à±‡à°Ÿà°¿à°‚à°—à±",
      trust_tagline: "à°’à°•à±‡ à°¨à±†à°Ÿà±â€Œà°µà°°à±à°•à±. à°šà±‡à°°à°¡à°¾à°¨à°¿à°•à°¿ à°…à°¨à±‡à°• à°®à°¾à°°à±à°—à°¾à°²à±.",
      services_kicker: "à°¨à°¿à°¤à±à°¯à°¾à°µà°¸à°° à°¸à°¹à°¾à°¯à°‚, à°‡à°‚à°Ÿà°¿à°•à°¿ à°¦à°—à±à°—à°°à°—à°¾",
      services_h2: "à°®à±€à°•à± à°à°®à°¿ à°•à°¾à°µà°¾à°²à°¨à±à°¨à°¾,<br><em>à°¦à°—à±à°—à°°à°²à±‹ à°‰à°¨à±à°¨à°µà°¾à°°à± à°¸à°¹à°¾à°¯à°‚ à°šà±‡à°¯à°—à°²à°°à±.</em>",
      services_explore: "à°…à°¨à±à°¨à°¿ à°¸à±‡à°µà°²à°¨à± à°šà±‚à°¡à°‚à°¡à°¿",
      svc_plumbing_t: "à°ªà±à°²à°‚à°¬à°¿à°‚à°—à±", svc_plumbing_d: "à°®à°°à°®à±à°®à°¤à±à°²à±, à°«à°¿à°Ÿà±à°Ÿà°¿à°‚à°—à±â€Œà°²à± & à°¨à°¿à°°à±à°µà°¹à°£",
      svc_electrical_t: "à°Žà°²à°•à±à°Ÿà±à°°à°¿à°•à°²à±", svc_electrical_d: "à°®à°°à°®à±à°®à°¤à±à°²à± & à°‡à°¨à±â€Œà°¸à±à°Ÿà°¾à°²à±‡à°·à°¨à±",
      svc_cleaning_t: "à°¶à±à°­à±à°°à°ªà°°à°šà°¡à°‚", svc_cleaning_d: "à°‡à°²à±à°²à± & à°•à°¾à°°à±à°¯à°¾à°²à°¯ à°¸à°‚à°°à°•à±à°·à°£",
      svc_caregiving_t: "à°¸à°‚à°°à°•à±à°·à°£", svc_caregiving_d: "à°…à°µà°¸à°°à°®à±ˆà°¨à°ªà±à°ªà±à°¡à± à°®à°¦à±à°¦à°¤à±",
      svc_carpentry_t: "à°µà°¡à±à°°à°‚à°—à°‚", svc_carpentry_d: "à°«à°°à±à°¨à°¿à°šà°°à± & à°®à°°à°®à±à°®à°¤à±à°²à±",
      svc_driving_t: "à°¡à±à°°à±ˆà°µà°¿à°‚à°—à±", svc_driving_d: "à°°à°µà°¾à°£à°¾ & à°¡à±†à°²à°¿à°µà°°à±€",
      svc_gardening_t: "à°¤à±‹à°Ÿà°ªà°¨à°¿", svc_gardening_d: "à°²à±à°¯à°¾à°‚à°¡à±â€Œà°¸à±à°•à±‡à°ªà°¿à°‚à°—à± & à°¨à°¿à°°à±à°µà°¹à°£",
      svc_technician_t: "à°Ÿà±†à°•à±à°¨à±€à°·à°¿à°¯à°¨à±", svc_technician_d: "à°¸à°¾à°‚à°•à±‡à°¤à°¿à°• à°®à°°à°®à±à°®à°¤à± & à°®à°¦à±à°¦à°¤à±",
      map_kicker: "à°²à±ˆà°µà± à°²à±‹à°•à°²à± à°¨à±†à°Ÿà±â€Œà°µà°°à±à°•à±", map_h2: "à°®à±€ à°šà±à°Ÿà±à°Ÿà±à°ªà°•à±à°•à°² à°¸à±‡à°µà°²à±.",
      map_p: "à°§à±ƒà°µà±€à°•à°°à°¿à°‚à°šà°¿à°¨ à°•à°¾à°°à±à°®à°¿à°•à±à°²à±, à°œà°°à±à°—à±à°¤à±à°¨à±à°¨ à°¬à±à°•à°¿à°‚à°—à±â€Œà°²à±, à°®à°°à°¿à°¯à± à°ªà±†à°°à±à°—à±à°¤à±à°¨à±à°¨ à°¡à°¿à°®à°¾à°‚à°¡à± à°‰à°¨à±à°¨ à°ªà±à°°à°¾à°‚à°¤à°¾à°²à°¨à± à°šà±‚à°¡à°‚à°¡à°¿.",
      map_locbtn: "à°¨à°¾ à°¸à±à°¥à°¾à°¨à°¾à°¨à±à°¨à°¿ à°‰à°ªà°¯à±‹à°—à°¿à°‚à°šà°‚à°¡à°¿",
      legend_workers: "à°…à°‚à°¦à±à°¬à°¾à°Ÿà±à°²à±‹ à°‰à°¨à±à°¨ à°•à°¾à°°à±à°®à°¿à°•à±à°²à±", legend_bookings: "à°œà°°à±à°—à±à°¤à±à°¨à±à°¨ à°¬à±à°•à°¿à°‚à°—à±â€Œà°²à±",
      legend_demand: "à°…à°§à°¿à°•-à°¡à°¿à°®à°¾à°‚à°¡à± à°ªà±à°°à°¾à°‚à°¤à°¾à°²à±", legend_requests: "à°•à°¸à±à°Ÿà°®à°°à± à°…à°­à±à°¯à°°à±à°¥à°¨à°²à±",
      features_kicker: "SHARMNEXUS à°ªà±à°°à°¤à±à°¯à±‡à°•à°¤",
      features_h2: "à°®à±€à°•à± à°•à°¾à°µà°²à°¸à°¿à°¨à°µà°¨à±à°¨à±€.<br><em>à°’à°•à±‡ à°¸à°°à°³à°®à±ˆà°¨ à°µà±‡à°¦à°¿à°•.</em>",
      feat_1: "à°§à±ƒà°µà±€à°•à°°à°¿à°‚à°šà°¿à°¨<br>à°¨à°¿à°ªà±à°£à±à°²à°¨à± à°•à°¨à±à°—à±Šà°¨à°‚à°¡à°¿", feat_2: "à°¸à±à°¥à°¾à°¨-à°†à°§à°¾à°°à°¿à°¤<br>à°®à±à°¯à°¾à°šà°¿à°‚à°—à±", feat_3: "à°¸à±à°²à°­à°®à±ˆà°¨ à°·à±†à°¡à±à°¯à±‚à°²à°¿à°‚à°—à±",
      feat_4: "à°¸à±à°°à°•à±à°·à°¿à°¤ à°¡à°¿à°œà°¿à°Ÿà°²à±<br>à°šà±†à°²à±à°²à°¿à°‚à°ªà±à°²à±", feat_5: "à°¡à°¿à°œà°¿à°Ÿà°²à± à°‡à°¨à±à°µà°¾à°¯à°¿à°¸à±â€Œà°²à±", feat_6: "à°°à±‡à°Ÿà°¿à°‚à°—à±â€Œà°²à± &<br>à°¸à°®à±€à°•à±à°·à°²à±",
      feat_7: "à°¸à±‡à°µà°¾ à°Ÿà±à°°à°¾à°•à°¿à°‚à°—à±", feat_8: "à°…à°¤à±à°¯à°µà°¸à°°<br>à°¬à±à°•à°¿à°‚à°—à±",
      access_kicker: "à°…à°‚à°¦à°°à°¿ à°•à±‹à°¸à°‚ à°°à±‚à°ªà±Šà°‚à°¦à°¿à°‚à°šà°¬à°¡à°¿à°‚à°¦à°¿",
      access_h2: "à°®à±€ à°­à°¾à°·à°²à±‹ à°®à°¾à°Ÿà±à°²à°¾à°¡à±‡<br><em>à°¸à°¾à°‚à°•à±‡à°¤à°¿à°•à°¤.</em>",
      access_explore: "SharmNexusà°¨à°¿ à°…à°¨à±à°µà±‡à°·à°¿à°‚à°šà°‚à°¡à°¿",
      worker_kicker: "à°¨à±ˆà°ªà±à°£à±à°¯à°‚ à°—à°² à°•à°¾à°°à±à°®à°¿à°•à±à°² à°•à±‹à°¸à°‚",
      worker_h2: "à°®à±€ à°¨à±ˆà°ªà±à°£à±à°¯à°¾à°²à°•à±<br><em>à°®à°°à°¿à°¨à±à°¨à°¿ à°…à°µà°•à°¾à°¶à°¾à°²à±.</em>",
      worker_p: "à°®à±€ à°µà±ƒà°¤à±à°¤à°¿à°ªà°°à°®à±ˆà°¨ à°—à±à°°à±à°¤à°¿à°‚à°ªà±à°¨à± à°¨à°¿à°°à±à°®à°¿à°‚à°šà°‚à°¡à°¿, à°‰à°¦à±à°¯à±‹à°—à°¾à°²à°¨à± à°•à°¨à±à°—à±Šà°¨à°‚à°¡à°¿, à°®à±€ à°ªà±à°°à°¤à°¿à°·à±à°Ÿà°¨à± à°ªà±†à°‚à°šà±à°•à±‹à°‚à°¡à°¿, à°®à°°à°¿à°¯à± à°’à°•à±‡ à°µà±‡à°¦à°¿à°• à°¨à±à°‚à°¡à°¿ à°¸à°¹à°•à°¾à°° à°¸à°‚à°•à±à°·à±‡à°® à°ªà±à°°à°¯à±‹à°œà°¨à°¾à°²à°¨à± à°ªà±Šà°‚à°¦à°‚à°¡à°¿.",
      how_kicker: "à°¸à°°à°³à°®à±ˆà°¨ à°°à±‚à°ªà°•à°²à±à°ªà°¨",
      how_h2: "â€œà°¨à°¾à°•à± à°¸à°¹à°¾à°¯à°‚ à°•à°¾à°µà°¾à°²à°¿â€<br><em>à°¨à±à°‚à°¡à°¿ â€œà°…à°‚à°¤à°¾ à°¸à°°à±à°¦à±à°•à±à°‚à°¦à°¿â€ à°µà°°à°•à±.</em>",
      step1_t: "à°®à±€à°•à± à°à°®à°¿ à°•à°¾à°µà°¾à°²à±‹ à°®à°¾à°•à± à°šà±†à°ªà±à°ªà°‚à°¡à°¿", step1_d: "à°®à±€ à°¸à±à°µà°‚à°¤ à°®à°¾à°Ÿà°²à±à°²à±‹, à°®à±€ à°¸à±à°µà°‚à°¤ à°­à°¾à°·à°²à±‹ à°¸à±‡à°µà°¨à± à°µà°¿à°µà°°à°¿à°‚à°šà°‚à°¡à°¿.",
      step2_t: "à°¤à±†à°²à°¿à°µà°¿à°—à°¾ à°œà°¤à°šà±‡à°¯à°¬à°¡à°‚à°¡à°¿", step2_d: "à°¨à±ˆà°ªà±à°£à±à°¯à°‚, à°°à±‡à°Ÿà°¿à°‚à°—à±, à°¸à±à°¥à°¾à°¨à°‚ à°®à°°à°¿à°¯à± à°²à°­à±à°¯à°¤ à°†à°§à°¾à°°à°‚à°—à°¾ à°¸à°®à±€à°ªà°‚à°²à±‹à°¨à°¿ à°§à±ƒà°µà±€à°•à°°à°¿à°‚à°šà°¿à°¨ à°•à°¾à°°à±à°®à°¿à°•à±à°²à°¨à± à°®à±‡à°®à± à°•à°¨à±à°—à±Šà°‚à°Ÿà°¾à°®à±.",
      step3_t: "à°¨à°®à±à°®à°•à°‚à°¤à±‹ à°¬à±à°•à± à°šà±‡à°¯à°‚à°¡à°¿", step3_d: "à°¸à°®à°¯à°¾à°¨à±à°¨à°¿ à°Žà°‚à°šà±à°•à±‹à°‚à°¡à°¿, à°¸à±‡à°µà°¨à± à°Ÿà±à°°à°¾à°•à± à°šà±‡à°¯à°‚à°¡à°¿, à°¸à±à°°à°•à±à°·à°¿à°¤à°‚à°—à°¾ à°šà±†à°²à±à°²à°¿à°‚à°šà°‚à°¡à°¿, à°®à°°à°¿à°¯à± à°°à±‡à°Ÿà°¿à°‚à°—à± à°‡à°µà±à°µà°‚à°¡à°¿.",
      step4_t: "à°¨à±†à°Ÿà±â€Œà°µà°°à±à°•à± à°ªà±†à°°à°—à°¡à°¾à°¨à°¿à°•à°¿ à°¸à°¹à°¾à°¯à°ªà°¡à°‚à°¡à°¿", step4_d: "à°ªà±à°°à°¤à°¿ à°¬à±à°•à°¿à°‚à°—à± à°¸à±à°¥à°¾à°¨à°¿à°• à°•à°¾à°°à±à°®à°¿à°•à±à°²à°¨à± à°®à°°à°¿à°¯à± à°µà°¾à°°à°¿ à°¸à°¹à°•à°¾à°° à°¸à°‚à°˜à°¾à°¨à±à°¨à°¿ à°¬à°²à±‹à°ªà±‡à°¤à°‚ à°šà±‡à°¸à±à°¤à±à°‚à°¦à°¿.",
      communities_kicker: "à°’à°• à°µà±‡à°¦à°¿à°•. à°®à±‚à°¡à± à°¸à°‚à°˜à°¾à°²à±.",
      communities_h2: "à°ªà°‚à°šà±à°•à±à°¨à±à°¨ à°¶à±à°°à±‡à°¯à°¸à±à°¸à±,<br><em>à°ªà±à°°à°¤à°¿ à°¬à±à°•à°¿à°‚à°—à±â€Œà°²à±‹ à°°à±‚à°ªà±Šà°‚à°¦à°¿à°‚à°šà°¬à°¡à°¿à°‚à°¦à°¿.</em>",
      comm1_num: "01 / à°—à±ƒà°¹à°¾à°² à°•à±‹à°¸à°‚", comm1_h3: "à°¸à°®à±€à°ªà°‚à°²à±‹ à°¨à°®à±à°®à°•à°®à±ˆà°¨ à°¸à°¹à°¾à°¯à°¾à°¨à±à°¨à°¿ à°•à°¨à±à°—à±Šà°¨à°‚à°¡à°¿.",
      comm1_p: "à°ªà°¾à°°à°¦à°°à±à°¶à°• à°°à±‡à°Ÿà°¿à°‚à°—à±â€Œà°²à±, à°¸à±à°°à°•à±à°·à°¿à°¤ à°šà±†à°²à±à°²à°¿à°‚à°ªà±à°²à±, à°®à°°à°¿à°¯à± à°…à°µà°¸à°°à°®à±ˆà°¨à°ªà±à°ªà±à°¡à± à°®à°¦à±à°¦à°¤à±à°¤à±‹ à°¨à°®à±à°®à°•à°®à±ˆà°¨ à°¨à°¿à°ªà±à°£à±à°²à°¨à± à°¬à±à°•à± à°šà±‡à°¯à°‚à°¡à°¿.",
      comm1_link: "à°¸à±‡à°µà°¨à± à°•à°¨à±à°—à±Šà°¨à°‚à°¡à°¿",
      comm2_num: "02 / à°•à°¾à°°à±à°®à°¿à°•à±à°² à°•à±‹à°¸à°‚", comm2_h3: "à°®à±€ à°¨à±ˆà°ªà±à°£à±à°¯à°¾à°²à°¨à± à°…à°µà°•à°¾à°¶à°‚à°—à°¾ à°®à°¾à°°à±à°šà±à°•à±‹à°‚à°¡à°¿.",
      comm2_p: "à°µà±ƒà°¤à±à°¤à°¿à°ªà°°à°®à±ˆà°¨ à°—à±à°°à±à°¤à°¿à°‚à°ªà±à°¨à± à°¨à°¿à°°à±à°®à°¿à°‚à°šà°‚à°¡à°¿, à°®à±†à°°à±à°—à±ˆà°¨ à°‰à°¦à±à°¯à±‹à°—à°¾à°²à°¨à± à°•à°¨à±à°—à±Šà°¨à°‚à°¡à°¿, à°ªà±à°°à°¤à°¿à°·à±à°Ÿà°¨à± à°ªà±†à°‚à°šà±à°•à±‹à°‚à°¡à°¿, à°®à°°à°¿à°¯à± à°¸à°¹à°•à°¾à°° à°¸à°‚à°•à±à°·à±‡à°® à°ªà±à°°à°¯à±‹à°œà°¨à°¾à°²à°¨à± à°ªà±Šà°‚à°¦à°‚à°¡à°¿.",
      comm2_link: "à°•à°¾à°°à±à°®à°¿à°•à±à°¡à°¿à°—à°¾ à°šà±‡à°°à°‚à°¡à°¿",
      comm3_num: "03 / à°¸à°¹à°•à°¾à°° à°¸à°‚à°˜à°¾à°² à°•à±‹à°¸à°‚", comm3_h3: "à°¤à±†à°²à°¿à°µà°¿à°—à°¾ à°¸à°®à°¨à±à°µà°¯à°‚ à°šà±‡à°¯à°‚à°¡à°¿.",
      comm3_p: "à°®à±€ à°¶à±à°°à°¾à°®à°¿à°• à°¶à°•à±à°¤à°¿à°¨à°¿ à°¨à°¿à°°à±à°µà°¹à°¿à°‚à°šà°‚à°¡à°¿, à°¡à°¿à°®à°¾à°‚à°¡à±â€Œà°¨à± à°®à±à°‚à°¦à±à°—à°¾à°¨à±‡ à°…à°‚à°šà°¨à°¾ à°µà±‡à°¯à°‚à°¡à°¿, à°‰à°¦à±à°¯à±‹à°—à°¾à°²à°¨à± à°•à±‡à°Ÿà°¾à°¯à°¿à°‚à°šà°‚à°¡à°¿, à°®à°°à°¿à°¯à± à°’à°•à±‡ à°µà±‡à°¦à°¿à°• à°¨à±à°‚à°¡à°¿ à°ªà±à°°à°­à°¾à°µà°¾à°¨à±à°¨à°¿ à°•à±Šà°²à°µà°‚à°¡à°¿.",
      comm3_link: "à°¸à°¹à°•à°¾à°° à°¸à°‚à°˜à°¾à°²à°¨à± à°…à°¨à±à°µà±‡à°·à°¿à°‚à°šà°‚à°¡à°¿",
      final_kicker: "à°®à±€à°°à± à°¸à°¿à°¦à±à°§à°‚à°—à°¾ à°‰à°¨à±à°¨à°ªà±à°ªà±à°¡à±",
      final_h2: "à°®à±€ à°¤à°¦à±à°ªà°°à°¿ à°¸à±‡à°µ<br><em>à°•à±Šà°¨à±à°¨à°¿ à°•à±à°²à°¿à°•à±â€Œà°² à°¦à±‚à°°à°‚à°²à±‹ à°‰à°‚à°¦à°¿.</em>",
      final_p: "à°¨à°®à±à°®à°•à°®à±ˆà°¨ à°¨à°¿à°ªà±à°£à±à°²à°¨à± à°•à°¨à±à°—à±Šà°¨à°‚à°¡à°¿. à°¨à±ˆà°ªà±à°£à±à°¯à°‚ à°—à°² à°•à°¾à°°à±à°®à°¿à°•à±à°²à°•à± à°®à°¦à±à°¦à°¤à± à°‡à°µà±à°µà°‚à°¡à°¿. à°¸à±à°¥à°¾à°¨à°¿à°• à°¸à°¹à°•à°¾à°° à°¸à°‚à°˜à°¾à°²à°¨à± à°¬à°²à±‹à°ªà±‡à°¤à°‚ à°šà±‡à°¯à°‚à°¡à°¿.",
      footer_tagline: "à°¨à±ˆà°ªà±à°£à±à°¯à°¾à°²à°¨à± à°…à°¨à±à°¸à°‚à°§à°¾à°¨à°¿à°‚à°šà°¡à°‚.<br>à°…à°µà°•à°¾à°¶à°¾à°²à°¨à± à°¸à±ƒà°·à±à°Ÿà°¿à°‚à°šà°¡à°‚."
    }
  };

  const STORAGE_KEY = 'sharmnexus-lang';

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

  console.log('âœ… SharmNexus script.js loaded â€” cursor, counters, map, mobile nav, and 6-language switching are live.');
});
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
