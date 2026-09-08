-- =========================================================
-- ShramNexus Cooperative Portal & Federation Schema Migration
-- Run this in your Supabase SQL Editor if setting up live tables.
-- =========================================================

-- 1. Ensure cooperative_societies exists and has enhanced fields
CREATE TABLE IF NOT EXISTS cooperative_societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  federation_id UUID REFERENCES cooperative_federations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  district TEXT,
  state TEXT,
  address TEXT,
  member_count INT DEFAULT 0,
  welfare_fund_balance DECIMAL DEFAULT 180000,
  monthly_revenue DECIMAL DEFAULT 420000,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Safely alter cooperative_societies to add newly required columns in case the table already existed from previous migrations
ALTER TABLE cooperative_societies ADD COLUMN IF NOT EXISTS member_count INT DEFAULT 0;
ALTER TABLE cooperative_societies ADD COLUMN IF NOT EXISTS welfare_fund_balance DECIMAL DEFAULT 180000;
ALTER TABLE cooperative_societies ADD COLUMN IF NOT EXISTS monthly_revenue DECIMAL DEFAULT 420000;
ALTER TABLE cooperative_societies ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE cooperative_societies ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE cooperative_societies ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE cooperative_societies ADD COLUMN IF NOT EXISTS address TEXT;

-- 2. Community Contracts (Institutions & RWAs)
CREATE TABLE IF NOT EXISTS community_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES cooperative_societies(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  service_title TEXT NOT NULL,
  workers_needed INT NOT NULL DEFAULT 1,
  duration_days INT NOT NULL DEFAULT 7,
  budget DECIMAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'Pending', 'Completed'
  start_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Cooperative Squads
CREATE TABLE IF NOT EXISTS cooperative_squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES cooperative_societies(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES community_contracts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  leader_name TEXT NOT NULL,
  members_count INT DEFAULT 4,
  members_summary TEXT,
  status TEXT DEFAULT 'Active', -- 'Active', 'Standby'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Cooperative Tool Bank
CREATE TABLE IF NOT EXISTS cooperative_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES cooperative_societies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tool_code TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT 'Equipment',
  status TEXT NOT NULL DEFAULT 'Available', -- 'Available', 'In Use', 'Maintenance'
  current_borrower_name TEXT,
  reserved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Democratic Member Assembly Proposals
CREATE TABLE IF NOT EXISTS cooperative_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id UUID REFERENCES cooperative_societies(id) ON DELETE CASCADE,
  proposal_number INT,
  title TEXT NOT NULL,
  description TEXT,
  cost DECIMAL DEFAULT 0,
  yes_votes INT DEFAULT 0,
  no_votes INT DEFAULT 0,
  status TEXT DEFAULT 'Active', -- 'Active', 'Approved', 'Rejected'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Disciplinary & Audit Logs (Admin Governance)
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'worker', 'coop'
  target_id TEXT NOT NULL,
  target_name TEXT NOT NULL,
  action TEXT NOT NULL, -- 'remove', 'suspend'
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sample Seed Data for Cooperatives
INSERT INTO cooperative_societies (name, registration_number, district, state, member_count, welfare_fund_balance, monthly_revenue, is_active)
VALUES 
  ('Shakti Labour Coop', 'REG-9921', 'Jaipur', 'Rajasthan', 248, 180000, 420000, true),
  ('Rajasthan Navnirman Society', 'REG-8834', 'Jodhpur', 'Rajasthan', 112, 95000, 210000, true),
ON CONFLICT (registration_number) DO UPDATE SET
  member_count = EXCLUDED.member_count,
  welfare_fund_balance = EXCLUDED.welfare_fund_balance,
  monthly_revenue = EXCLUDED.monthly_revenue,
  is_active = EXCLUDED.is_active;
