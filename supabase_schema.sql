-- Run this in your Supabase SQL Editor

-- Enable PostGIS for geo-location matching
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE cooperative_federations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE cooperative_societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  federation_id UUID REFERENCES cooperative_federations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  district TEXT,
  state TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_hi TEXT,
  description TEXT,
  icon_url TEXT,
  base_price DECIMAL NOT NULL,
  emergency_multiplier DECIMAL DEFAULT 1.5,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  profile_photo_url TEXT,
  preferred_language TEXT DEFAULT 'en',
  avg_rating_given DECIMAL DEFAULT 5.0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE workers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  society_id UUID REFERENCES cooperative_societies(id),
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  profile_photo_url TEXT,
  aadhaar_number TEXT UNIQUE,
  address TEXT,
  location geography(POINT),
  is_verified BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'pending',
  avg_rating DECIMAL DEFAULT 0.0,
  total_jobs_completed INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE worker_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  service_category_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
  certification_name TEXT,
  certificate_url TEXT,
  years_experience INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT false
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  worker_id UUID REFERENCES workers(id),
  service_category_id UUID REFERENCES service_categories(id),
  booking_type TEXT DEFAULT 'scheduled', -- 'scheduled' or 'emergency'
  status TEXT DEFAULT 'requested', -- requested, assigned, accepted, in_progress, completed, cancelled
  description TEXT,
  address TEXT,
  location geography(POINT),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_price DECIMAL,
  final_price DECIMAL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  amount DECIMAL NOT NULL,
  platform_fee DECIMAL,
  worker_payout DECIMAL,
  cooperative_share DECIMAL,
  status TEXT DEFAULT 'pending',
  method TEXT,
  paid_at TIMESTAMPTZ
);

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  worker_id UUID REFERENCES workers(id),
  score INT CHECK (score >= 1 AND score <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
