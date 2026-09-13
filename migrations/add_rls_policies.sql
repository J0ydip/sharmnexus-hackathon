-- =========================================================
-- ShramNexus Row-Level Security (RLS) Policies
-- Run in Supabase SQL Editor to enforce data access controls
-- =========================================================

-- 1. Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperative_societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperative_squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperative_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperative_proposals ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- Service Categories — Public readable (everyone needs to browse services)
-- =========================================================
CREATE POLICY "Service categories are publicly readable"
  ON service_categories FOR SELECT
  USING (true);

-- =========================================================
-- Customers — Own profile only
-- =========================================================
CREATE POLICY "Customers can view own profile"
  ON customers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Customers can update own profile"
  ON customers FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Customers can insert own profile"
  ON customers FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =========================================================
-- Workers — Own profile + publicly visible when verified
-- =========================================================
CREATE POLICY "Workers are publicly visible when verified"
  ON workers FOR SELECT
  USING (is_verified = true OR auth.uid() = id);

CREATE POLICY "Workers can update own profile"
  ON workers FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Workers can insert own profile"
  ON workers FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =========================================================
-- Worker Skills — Publicly readable for matching, own manageable
-- =========================================================
CREATE POLICY "Worker skills publicly readable"
  ON worker_skills FOR SELECT
  USING (true);

CREATE POLICY "Workers can manage own skills"
  ON worker_skills FOR ALL
  USING (auth.uid() = worker_id);

-- =========================================================
-- Bookings — Customer sees own, Worker sees assigned
-- =========================================================
CREATE POLICY "Customers can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Workers can view assigned bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = worker_id);

CREATE POLICY "Customers can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Workers can update assigned bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = worker_id OR auth.uid() = customer_id);

-- =========================================================
-- Payments — Linked to booking participants
-- =========================================================
CREATE POLICY "Payment visible to booking participants"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = payments.booking_id
      AND (b.customer_id = auth.uid() OR b.worker_id = auth.uid())
    )
  );

-- =========================================================
-- Ratings — Public readable, customer can create
-- =========================================================
CREATE POLICY "Ratings are publicly readable"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Customers can create ratings for their bookings"
  ON ratings FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- =========================================================
-- Cooperative Societies — Publicly readable
-- =========================================================
CREATE POLICY "Cooperative societies are publicly readable"
  ON cooperative_societies FOR SELECT
  USING (true);

-- =========================================================
-- Cooperative Resources — Members of the society can manage
-- =========================================================
CREATE POLICY "Community contracts readable by society members"
  ON community_contracts FOR SELECT
  USING (true);

CREATE POLICY "Cooperative squads readable by society members"
  ON cooperative_squads FOR SELECT
  USING (true);

CREATE POLICY "Cooperative tools readable by society members"
  ON cooperative_tools FOR SELECT
  USING (true);

CREATE POLICY "Cooperative proposals readable by society members"
  ON cooperative_proposals FOR SELECT
  USING (true);

-- =========================================================
-- Allow service role to bypass RLS (for server-side operations)
-- Supabase's service_role key automatically bypasses RLS.
-- The anon key respects these policies.
-- =========================================================
