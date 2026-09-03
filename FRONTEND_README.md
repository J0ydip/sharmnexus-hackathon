# 🤝 SahayaK — Cooperative Gig Services Platform

> A cooperative-owned digital service marketplace connecting Labour Cooperative workers (electricians, plumbers, carpenters, etc.) with households and institutions.

---

## 📌 Quick Summary (Read This First)

We're building a platform where **cooperative society workers** get booked for household services by customers. Think Urban Company, but **owned by the cooperative** — fair wages, verified workers, welfare benefits.

**Three interfaces, one website (PWA):**

| Interface | URL | Who Uses It | Device |
|---|---|---|---|
| **Customer App** | `/` | Households booking services | 📱 Phone (PWA) |
| **Worker App** | `/worker` | Electricians, plumbers, etc. | 📱 Phone (PWA) |
| **Admin Dashboard** | `/admin` | Cooperative federation/society admins | 💻 Laptop |

**PWA = Progressive Web App.** It's a website that can be installed on a phone and looks like a native app (full screen, home screen icon, no browser bar).

---

## 🛠️ Tech Stack

| What | Technology | Learn (30 min each) |
|---|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/docs) (App Router) | [Next.js Tutorial](https://nextjs.org/learn) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/docs) | [Tailwind Crash Course](https://tailwindcss.com/docs/utility-first) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) | Pre-built beautiful components, just copy-paste |
| **Icons** | [Lucide Icons](https://lucide.dev/icons/) | Search and use any icon |
| **Maps** | [React Leaflet](https://react-leaflet.js.org/) + OpenStreetMap | Free maps, no API key |
| **Charts** | [Recharts](https://recharts.org/) | For admin dashboard analytics |
| **Language** | JavaScript (JSX) | If you know HTML + JS, you know JSX |
| **Database** | [Supabase](https://supabase.com/) | You won't touch this directly — backend handles it |
| **Translations** | [next-intl](https://next-intl-docs.vercel.app/) or i18next | JSON files with translations |

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)
- **VS Code** — [Download](https://code.visualstudio.com/)

### VS Code Extensions (Install These)
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native Snippets
- Prettier - Code Formatter

### Getting Started

```bash
# 1. Clone the repo
git clone <repo-url>
cd sih_new

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Run the development server
npm run dev

# 5. Open in browser
# http://localhost:3000         → Customer App
# http://localhost:3000/worker  → Worker App
# http://localhost:3000/admin   → Admin Dashboard
```

---

## 📁 Project Structure (Frontend Only)

You'll be working inside the `src/` folder:

```
src/
├── app/                          # Pages (file-based routing)
│   ├── (customer)/               # Customer-facing pages
│   │   ├── page.jsx              # Home page (/)
│   │   ├── services/
│   │   │   └── page.jsx          # Browse services (/services)
│   │   ├── booking/
│   │   │   ├── [serviceId]/
│   │   │   │   └── page.jsx      # Booking form (/booking/electrician)
│   │   │   └── confirm/
│   │   │       └── page.jsx      # Booking confirmation
│   │   ├── track/
│   │   │   └── [bookingId]/
│   │   │       └── page.jsx      # Track worker on map
│   │   ├── history/
│   │   │   └── page.jsx          # Booking history
│   │   ├── rate/
│   │   │   └── [bookingId]/
│   │   │       └── page.jsx      # Rate worker after job
│   │   ├── emergency/
│   │   │   └── page.jsx          # Emergency booking
│   │   ├── profile/
│   │   │   └── page.jsx          # Customer profile
│   │   └── layout.jsx            # Customer layout (navbar, footer)
│   │
│   ├── worker/                   # Worker-facing pages
│   │   ├── page.jsx              # Worker dashboard (/worker)
│   │   ├── jobs/
│   │   │   ├── page.jsx          # Available/assigned jobs
│   │   │   └── [jobId]/
│   │   │       └── page.jsx      # Job details
│   │   ├── profile/
│   │   │   └── page.jsx          # Skill profile & digital ID
│   │   ├── earnings/
│   │   │   └── page.jsx          # Earnings & payment history
│   │   ├── welfare/
│   │   │   └── page.jsx          # Insurance & benefits status
│   │   ├── register/
│   │   │   └── page.jsx          # Multi-step registration form
│   │   └── layout.jsx            # Worker layout (bottom nav)
│   │
│   ├── admin/                    # Admin dashboard pages
│   │   ├── page.jsx              # Dashboard with KPIs (/admin)
│   │   ├── workers/
│   │   │   ├── page.jsx          # Worker list & management
│   │   │   └── [workerId]/
│   │   │       └── page.jsx      # Worker detail & verification
│   │   ├── bookings/
│   │   │   └── page.jsx          # All bookings management
│   │   ├── societies/
│   │   │   └── page.jsx          # Cooperative societies CRUD
│   │   ├── finance/
│   │   │   └── page.jsx          # Revenue, payment splits, reports
│   │   ├── analytics/
│   │   │   └── page.jsx          # Charts + AI demand forecast
│   │   ├── welfare/
│   │   │   └── page.jsx          # Insurance tracking
│   │   ├── services/
│   │   │   └── page.jsx          # Service categories management
│   │   ├── settings/
│   │   │   └── page.jsx          # Platform settings
│   │   └── layout.jsx            # Admin layout (sidebar nav)
│   │
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.jsx          # Login (email OTP)
│   │   └── register/
│   │       └── page.jsx          # Customer registration
│   │
│   ├── layout.jsx                # Root layout (global styles, fonts)
│   └── globals.css               # Tailwind base styles
│
├── components/                   # Reusable components
│   ├── ui/                       # shadcn/ui components (Button, Card, Input, etc.)
│   ├── common/                   # Shared across all interfaces
│   │   ├── Navbar.jsx
│   │   ├── BottomNav.jsx         # Mobile bottom navigation
│   │   ├── Sidebar.jsx           # Admin sidebar
│   │   ├── StarRating.jsx
│   │   ├── ServiceCard.jsx
│   │   ├── WorkerCard.jsx
│   │   ├── BookingStatusBadge.jsx
│   │   ├── MapView.jsx           # Leaflet map component
│   │   ├── FileUpload.jsx
│   │   ├── LanguageSwitcher.jsx
│   │   └── LoadingSpinner.jsx
│   ├── customer/                 # Customer-specific components
│   ├── worker/                   # Worker-specific components
│   └── admin/                    # Admin-specific components
│
├── lib/                          # Utilities & helpers
│   ├── supabase.js               # Supabase client setup
│   ├── api.js                    # API helper functions
│   └── utils.js                  # General utilities
│
├── i18n/                         # Translation files
│   ├── en.json                   # English
│   ├── hi.json                   # Hindi
│   └── bn.json                   # Bengali (or your regional language)
│
└── public/                       # Static assets
    ├── icons/                    # Service category icons
    ├── images/                   # Illustrations, hero images
    └── manifest.json             # PWA manifest
```

---

## 📱 Pages to Build — Detailed

### Customer App Pages

#### 1. Home Page (`/`)
- Hero section: "Book trusted cooperative workers"
- Search bar with location
- Grid of service categories (Electrician, Plumber, Carpenter, Painter, Cleaner, Driver, Caregiver, Gardener, Technician, Domestic Helper)
- "Emergency Booking" red button
- How it works section (3 steps)
- Trust badges: "✅ Cooperative Verified | 🛡️ Insured Workers | 💰 Fair Pricing"

#### 2. Service Page (`/services`)
- List of workers available for a selected service
- Each worker shown as a card:
  ```
  [Photo] Ramesh Kumar ⭐ 4.8 (127 jobs)
  ⚡ Electrician | 🏢 Patna Labour Cooperative
  ✅ Verified | 📍 2.3 km away
  ₹350/hr
  [Book Now]
  ```
- Filters: Distance, Rating, Price, Availability
- Map view toggle (show workers on a map)

#### 3. Booking Form (`/booking/[serviceId]`)
- Select date & time (or "Right Now" for on-demand)
- Enter/select address (with map pin)
- Describe the issue (text area)
- Estimated price display
- [Confirm Booking] button

#### 4. Booking Tracking (`/track/[bookingId]`)
- Map showing worker's live location + customer location
- ETA display
- Worker contact info (call button)
- Status timeline: Accepted → On the way → Arrived → Working → Completed

#### 5. Rating Page (`/rate/[bookingId]`)
- Star rating (1-5)
- Quick tags: "Punctual", "Professional", "Skilled", "Friendly", "Clean Work"
- Optional text review
- [Submit Review] button

#### 6. Emergency Booking (`/emergency`)
- Big prominent UI — "Need help RIGHT NOW?"
- Select service category
- Auto-detect location
- One-tap booking
- Shows: "Finding nearest available worker..." with animation
- Emergency pricing notice (1.5x)

#### 7. Booking History (`/history`)
- Tabs: Upcoming | Completed | Cancelled
- Each booking card shows: service, worker, date, status, price
- Click to view details or rebook

#### 8. Profile (`/profile`)
- Name, phone, email, photo
- Saved addresses
- Language preference
- Notification settings

---

### Worker App Pages

#### 1. Worker Dashboard (`/worker`)
- Today's summary: Jobs assigned, earnings today
- Online/Offline toggle (big switch at top)
- Incoming job notifications (accept/reject with countdown timer)
- Quick stats: Total earnings this week, Rating, Jobs completed

#### 2. Registration (`/worker/register`)
- **Multi-step form (4 steps):**
  - Step 1: Personal info (name, phone, photo, address)
  - Step 2: Cooperative Society selection (dropdown) + Membership ID
  - Step 3: Document upload (Aadhaar front/back, selfie)
  - Step 4: Skills selection (checkboxes) + certificate upload + years of experience
- Progress bar at top
- [Submit for Verification] button
- Post-submit: "Your application is under review ⏳"

#### 3. Job Details (`/worker/jobs/[jobId]`)
- Customer name & location (map)
- Service requested + description
- Scheduled time
- Estimated payment
- Action buttons: [Navigate] [Start Job] [Complete Job]
- After completion: waiting for payment confirmation

#### 4. Skill Profile & Digital ID (`/worker/profile`)
- **Digital ID Card view:**
  ```
  ┌─────────────────────────────────┐
  │  COOPERATIVE WORKER ID          │
  │  ─────────────────────────────  │
  │  [Photo]  Ramesh Kumar          │
  │           Member #PLC-2024-0847 │
  │           ⚡ Electrician         │
  │                                 │
  │  🏢 Patna Labour Cooperative    │
  │  ✅ Verified | 🛡️ Insured       │
  │  ⭐ 4.8 | 127 Jobs Completed   │
  │  ─────────────────────────────  │
  │  QR Code: [████████]            │
  └─────────────────────────────────┘
  ```
- List of verified skills with badges
- Add new skill + upload certificate

#### 5. Earnings (`/worker/earnings`)
- Total balance / Pending payout
- Weekly/Monthly chart (bar chart)
- Transaction list: Date, Service, Customer, Amount, Status
- Payment split breakdown: "You received ₹850 (85%) | Cooperative fund ₹100 (10%) | Platform ₹50 (5%)"

#### 6. Welfare & Insurance (`/worker/welfare`)
- Insurance status card: Active/Expired, Policy number, Coverage amount, Expiry date
- Benefits list from cooperative
- Document downloads

---

### Admin Dashboard Pages

#### 1. Dashboard (`/admin`)
- **KPI Cards (top row):**
  - Total Workers (verified/pending)
  - Active Bookings today
  - Revenue this month
  - Average Rating
  - Worker Utilization Rate
- **Charts:**
  - Bookings over time (line chart)
  - Top services (bar chart)
  - Revenue breakdown (pie chart)
  - Geographic demand heatmap

#### 2. Worker Management (`/admin/workers`)
- Table: Name, Society, Skills, Status (Verified/Pending/Suspended), Rating, Jobs
- Filters: Status, Society, Skill
- Search by name/phone
- Click row → Worker detail page

#### 3. Worker Verification (`/admin/workers/[workerId]`)
- All submitted info and documents (see the verification UI from our discussion)
- OCR auto-extracted data from Aadhaar
- [Approve] [Reject] [Request More Info] buttons
- Admin notes field

#### 4. Booking Management (`/admin/bookings`)
- Table: Booking #, Customer, Worker, Service, Date, Status, Amount
- Filters: Status, Date range, Service, Society
- Click for details

#### 5. Society Management (`/admin/societies`)
- List of cooperative societies
- Add new society form
- Each society: name, registration number, district, admin contact, worker count

#### 6. Finance (`/admin/finance`)
- Revenue summary: Total, Worker payouts, Cooperative fund, Platform fees
- Date range filter
- Payment split visualization
- Export to CSV button

#### 7. Analytics & AI Forecast (`/admin/analytics`)
- **Demand Forecast section:**
  - Line chart: "Predicted vs Actual demand" per service
  - Table: Service | Region | Next Week Predicted Demand | Available Workers | Status (Overstaffed/Understaffed/Balanced)
- **Workforce Allocation Recommendations:**
  - "⚠️ Area X needs 3 more plumbers next week"
  - "✅ Electricians well-covered in Area Y"
- Peak hours heatmap

#### 8. Welfare Management (`/admin/welfare`)
- Workers with expiring insurance (next 30 days)
- Bulk enrollment form
- Welfare fund balance (from 10% cooperative share)

---

## 🎨 Design System

### Colors (Use these Tailwind classes)

```
Primary:       bg-emerald-600    text-emerald-600    (cooperative green — trust, growth)
Primary Dark:  bg-emerald-700    (hover states)
Secondary:     bg-amber-500      text-amber-500      (accent — warmth, approachability)
Emergency:     bg-red-600        text-red-600         (emergency booking)
Background:    bg-gray-50        (light gray background)
Card:          bg-white          (white cards)
Text Primary:  text-gray-900
Text Secondary:text-gray-500
Success:       bg-green-100 text-green-700   (verified, completed)
Warning:       bg-yellow-100 text-yellow-700 (pending, expiring)
Error:         bg-red-100 text-red-700       (rejected, failed)
```

### Typography
- **Headings:** `font-bold text-2xl` (Inter or Poppins font)
- **Body:** `text-base text-gray-700`
- **Small/Caption:** `text-sm text-gray-500`

### Component Patterns

```jsx
// Card pattern (use everywhere)
<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
  {/* content */}
</div>

// Status badge
<span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
  ✅ Verified
</span>

// Primary button
<button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl">
  Book Now
</button>

// Mobile bottom nav (Customer & Worker apps)
<nav className="fixed bottom-0 w-full bg-white border-t flex justify-around py-2">
  <NavItem icon={Home} label="Home" />
  <NavItem icon={Search} label="Services" />
  <NavItem icon={Calendar} label="Bookings" />
  <NavItem icon={User} label="Profile" />
</nav>
```

### Mobile-First Design
- All Customer and Worker pages must look great on a **375px wide screen** (iPhone SE)
- Use Tailwind responsive classes: design mobile first, then add `md:` and `lg:` for desktop
- Admin dashboard is desktop-first (`lg:` sidebar layout)

---

## 🌐 Multilingual (i18n)

Every visible text string should use translation keys, NOT hardcoded text.

```jsx
// ❌ DON'T do this
<h1>Book a Service</h1>

// ✅ DO this
<h1>{t('home.title')}</h1>
```

Translation files (`src/i18n/en.json`):
```json
{
  "home": {
    "title": "Book a Service",
    "subtitle": "Trusted cooperative workers at your doorstep",
    "emergency": "Emergency Booking",
    "search_placeholder": "What service do you need?"
  },
  "services": {
    "electrician": "Electrician",
    "plumber": "Plumber",
    "carpenter": "Carpenter"
  },
  "common": {
    "book_now": "Book Now",
    "verified": "Verified",
    "rating": "Rating"
  }
}
```

Hindi version (`src/i18n/hi.json`):
```json
{
  "home": {
    "title": "सेवा बुक करें",
    "subtitle": "आपके दरवाज़े पर विश्वसनीय सहकारी कर्मचारी",
    "emergency": "आपातकालीन बुकिंग",
    "search_placeholder": "आपको कौन सी सेवा चाहिए?"
  },
  "services": {
    "electrician": "इलेक्ट्रीशियन",
    "plumber": "प्लम्बर",
    "carpenter": "बढ़ई"
  },
  "common": {
    "book_now": "अभी बुक करें",
    "verified": "सत्यापित",
    "rating": "रेटिंग"
  }
}
```

**Include a language switcher** (🌐 icon) in the navbar of all three interfaces.

---

## 🔌 API Endpoints (For Reference)

When building pages, use these API routes. All return JSON.

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new customer/worker |
| POST | `/api/auth/login` | Login with email + OTP |
| POST | `/api/auth/verify-otp` | Verify OTP code |
| GET  | `/api/auth/me` | Get current logged-in user |

### Services
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/services` | List all service categories |
| GET | `/api/services/[id]` | Get service details |

### Workers
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/workers?service=electrician&lat=X&lng=Y` | Find nearby workers |
| GET | `/api/workers/[id]` | Get worker profile |
| POST | `/api/workers/register` | Worker registration |
| PUT | `/api/workers/[id]/location` | Update worker location |
| PUT | `/api/workers/[id]/availability` | Toggle online/offline |

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings` | Create new booking |
| GET | `/api/bookings/[id]` | Get booking details |
| GET | `/api/bookings/my` | Get current user's bookings |
| PUT | `/api/bookings/[id]/status` | Update booking status |
| POST | `/api/bookings/emergency` | Create emergency booking |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment |
| GET | `/api/payments/[bookingId]/invoice` | Get invoice |

### Ratings
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ratings` | Submit rating |
| GET | `/api/ratings/worker/[id]` | Get worker ratings |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/dashboard` | KPI stats |
| GET | `/api/admin/workers?status=pending` | Workers by status |
| PUT | `/api/admin/workers/[id]/verify` | Approve/reject worker |
| GET | `/api/admin/bookings` | All bookings |
| GET | `/api/admin/finance/summary` | Revenue summary |
| GET | `/api/admin/analytics/forecast` | AI demand forecast |
| GET | `/api/admin/societies` | List societies |
| POST | `/api/admin/societies` | Add society |

---

## 📋 Suggested Task Split (6 People)

| Person | Responsibility | Pages |
|---|---|---|
| **Person 1 (Lead)** | Backend + API + Database + Integration | All API routes, Supabase setup |
| **Person 2** | Customer App — Main Flow | Home, Services, Booking Form, Tracking |
| **Person 3** | Customer App — Secondary + Worker Registration | History, Rating, Emergency, Profile, Worker Register |
| **Person 4** | Worker App | Dashboard, Jobs, Earnings, Profile/Digital ID, Welfare |
| **Person 5** | Admin Dashboard | Dashboard KPIs, Worker Mgmt, Bookings, Finance |
| **Person 6** | Admin Advanced + Polish | Analytics/AI, Societies, Welfare, Translations, PWA setup, Testing |

---

## ✅ Definition of Done (For Each Page)

Before marking any page as complete, ensure:

- [ ] Page renders correctly on mobile (375px width)
- [ ] All text uses translation keys (`t('key')`) — no hardcoded strings
- [ ] Loading state shown while data is fetching
- [ ] Error state shown if API fails
- [ ] Matches the color scheme and component patterns above
- [ ] Tested on Chrome + at least one phone browser

---

## 🚀 Useful Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Check for code issues
```

---

## ❓ Questions?

Ask the team lead (Person 1). Don't get stuck — ask and move on.

**Remember: Done is better than perfect. Get the page working first, make it pretty second.**
