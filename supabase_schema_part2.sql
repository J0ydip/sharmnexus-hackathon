CREATE TABLE welfare_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- e.g., 'Health Insurance', 'Accident Cover'
  policy_number TEXT,
  provider TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  premium_amount DECIMAL,
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- can be customer_id, worker_id, or admin_user_id
  user_type TEXT NOT NULL, -- 'customer', 'worker', 'admin'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL, -- e.g., 'booking_update', 'system_alert'
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ai_demand_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_category_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
  region TEXT NOT NULL,
  forecast_date DATE NOT NULL,
  predicted_demand DECIMAL NOT NULL,
  actual_demand DECIMAL,
  confidence DECIMAL,
  generated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  federation_id UUID REFERENCES cooperative_federations(id) ON DELETE CASCADE,
  society_id UUID REFERENCES cooperative_societies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'society_admin', -- 'federation_admin' or 'society_admin'
  created_at TIMESTAMPTZ DEFAULT now()
);
