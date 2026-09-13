-- =========================================================
-- ShramNexus Performance Indexes
-- Run in Supabase SQL Editor to optimize query performance
-- =========================================================

-- Bookings table — most queried table
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_worker_id ON bookings(worker_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status_created ON bookings(status, created_at DESC);

-- Workers table — filtered by availability + verification
CREATE INDEX IF NOT EXISTS idx_workers_available_verified ON workers(is_available, is_verified)
  WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_workers_society_id ON workers(society_id);

-- Worker skills — join table for category filtering
CREATE INDEX IF NOT EXISTS idx_worker_skills_category ON worker_skills(service_category_id);
CREATE INDEX IF NOT EXISTS idx_worker_skills_worker ON worker_skills(worker_id);

-- Ratings — aggregated per worker
CREATE INDEX IF NOT EXISTS idx_ratings_worker_id ON ratings(worker_id);
CREATE INDEX IF NOT EXISTS idx_ratings_booking_id ON ratings(booking_id);

-- Payments — looked up by booking
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Cooperative tables
CREATE INDEX IF NOT EXISTS idx_community_contracts_society ON community_contracts(society_id);
CREATE INDEX IF NOT EXISTS idx_community_contracts_status ON community_contracts(status);
CREATE INDEX IF NOT EXISTS idx_cooperative_squads_society ON cooperative_squads(society_id);
CREATE INDEX IF NOT EXISTS idx_cooperative_tools_society ON cooperative_tools(society_id);
CREATE INDEX IF NOT EXISTS idx_cooperative_tools_status ON cooperative_tools(status);
CREATE INDEX IF NOT EXISTS idx_cooperative_proposals_society ON cooperative_proposals(society_id);

-- Notifications table (if exists)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);
