# 🤝 ShramNexus (श्रमNexus)
### Cooperative-Owned Digital Workforce & Service Marketplace
**Smart India Hackathon 2026** | **Problem Statement ID:** `SIH26089`  
**Theme:** Agriculture, FoodTech & Rural Development  
**Category:** Software | **Team:** Seis Bandits  

---

## 🌟 Overview

**ShramNexus** transforms traditional, manual labor cooperative records into a centralized, transparent, and fair digital gig marketplace for household and community services. 

Unlike conventional gig aggregator platforms that extract hefty 20–30% commissions and deploy opaque algorithms, ShramNexus empowers worker cooperatives with **democratic governance (1-Worker-1-Vote)**, **transparent revenue splits**, and an **anti-monopoly, fairness-aware job dispatch engine**.

---

## 🚀 Key Differentiators

| Feature | Private Aggregators (e.g. Urban Company) | ShramNexus Cooperative Platform |
| :--- | :--- | :--- |
| **Worker Take-Home** | 70% – 75% after deductions | **85% direct payout** to the artisan |
| **Welfare & Safety** | Negligible support / Out-of-pocket | **10% directly allocated** to Cooperative Welfare & Tool Bank |
| **Platform Commission** | High private margin (20–30%) | **5% transparent maintenance fee** |
| **Job Dispatch** | Pure rating monopoly | **Multi-factor Fair Matching** (prevents overworking 5-star workers) |
| **Governance** | Corporate board | **1-Worker-1-Vote democratic cooperative voting** |
| **Verification** | Anonymous / basic listing | **Desk-verified skills** by local registered cooperative societies |

---

## 🏗️ Technical Architecture & Workflow

```
1. Worker Signup (Trade, Experience, Cooperative Affiliation)
   └── 2. Cooperative Desk Verification (Admin approves skill badge)
       └── 3. Active Verified Artisan Pool
           └── 4. Customer Booking (Trade + Leaflet GPS Pin)
               └── 5. Multi-Factor Fair Matching Engine
                   └── 6. Razorpay Escrow Lock
                       └── 7. 4-Digit OTP Completion Handshake
                           └── 8. Automated Revenue Split (85% Worker / 10% Welfare / 5% Platform)
```

### 1. Fairness-Aware Matching Engine
Instead of a standard greedy nearest-neighbor algorithm that starves newer artisans, ShramNexus computes a composite **Fair Match Score (out of 100)**:
- **Trade & Skill Verification:** 35% (strict trade isolation)
- **Proximity / Distance (Haversine Formula):** 20%
- **Real-Time Availability:** 15%
- **Track Record & Customer Rating:** 10%
- **Workload Balance:** 10% (penalizes saturated workers)
- **Opportunity Fairness (Gini Distribution):** 10% (boosts newly enrolled cooperative members)

### 2. Escrow & Dual OTP Handshake
- Customer payments are securely held in **Escrow** upon booking.
- A cryptographically verified **4-Digit OTP** is shown on the customer’s tracking dashboard.
- The artisan enters this OTP upon physical completion, confirming service delivery and triggering immediate payout release.

---

## 💻 Tech Stack

- **Frontend:** Next.js 16 (React 19), Tailwind CSS, Lucide Icons, Leaflet Maps
- **State Management:** Zustand with persistent caching
- **Backend & APIs:** Next.js Server Actions (type-safe RPCs, zero exposed API keys)
- **Database & Auth:** Supabase (PostgreSQL) with Row Level Security (RLS) & Realtime WebSockets
- **Payments:** Razorpay UPI & Escrow simulation
- **Internationalization:** Multi-language support (English, Hindi, Bengali, Marathi, Tamil, Telugu)

---

## 🔑 Demo & Evaluation Credentials

You can test all portals seamlessly via the 1-Click buttons on `/auth/login` or with the following accounts:

### 👤 1. Customer Portal
- **Email:** `customer@shramnexus.com`
- **Password:** `customer123`
- *Features:* Browse 10 trades, book services, track live status, make Razorpay UPI payments, view OTP.

### 🛠️ 2. Worker Portal (Artisans)
All demo workers share the password: **`password123`** *(or `worker123`)*

| Trade | Artisan Name | Login Email |
| :--- | :--- | :--- |
| 🚰 **Plumber** | Rajesh Kumar | `rajesh.test@sharmnexus.com` |
| ⚡ **Electrician** | Rajesh Kumar | `worker@shramnexus.com` |
| 🪚 **Carpenter** | Suresh Kumar | `suresh.kumar@shramnexus.coop` |
| 🎨 **Painter** | Deepak Verma | `deepak.verma@shramnexus.coop` |
| ✨ **Cleaner** | Sunita Sharma | `sunita.sharma@shramnexus.coop` |
| 🔧 **Technician** | Manoj Verma | `manoj.verma@shramnexus.coop` |

*Features:* Accept/reject incoming jobs, view active jobs, complete services with customer OTP, track earnings passbook.

### 🏢 3. Cooperative Society Admin Portal
- **Email:** `coop@shramnexus.com`
- **Password:** `coop123`
- *Features:* Verify newly registered workers, manage tool banks, allocate district dispatch pools, view welfare fund balance.

---

## ⚡ Quickstart Guide

### 1. Clone & Install
```bash
git clone https://github.com/J0ydip/sharmnexus-hackathon.git
cd sharmnexus-hackathon
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://iliykpzhcfrpdkfwetvc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Team: Seis Bandits
Developed with ❤️ for **Smart India Hackathon 2026**.
