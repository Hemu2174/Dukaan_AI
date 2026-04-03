-- Enable RLS for all required tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpers ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_reports ENABLE ROW LEVEL SECURITY;

-- Policy: users can access their own data
-- 1. Transactions
CREATE POLICY "Users can access own data"
ON transactions
FOR ALL
USING (auth.uid() = user_id);

-- 2. Products
CREATE POLICY "Users can access own data"
ON products
FOR ALL
USING (auth.uid() = user_id);

-- 3. Distributors
CREATE POLICY "Users can access own data"
ON distributors
FOR ALL
USING (auth.uid() = user_id);

-- 4. Helpers (Owners can access their own helpers)
CREATE POLICY "Users can access own data"
ON helpers
FOR ALL
USING (auth.uid() = owner_user_id);

-- 5. Price Reports
CREATE POLICY "Users can access own data"
ON price_reports
FOR ALL
USING (auth.uid() = user_id);

-- Create helpers table if it doesn't exist
CREATE TABLE IF NOT EXISTS helpers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES auth.users(id) NOT NULL,
  helper_name text NOT NULL,
  pin_hash text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Alerts
CREATE TABLE IF NOT EXISTS daily_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL, -- references auth.users(id) or just UUID since we use demo users too
  alert_text text NOT NULL,
  date date NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE daily_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own data"
ON daily_alerts
FOR ALL
USING (auth.uid() = user_id);

-- 7. Distributors
CREATE TABLE IF NOT EXISTS distributors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  distributor_name text NOT NULL,
  phone text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 8. Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_name text NOT NULL,
  current_stock numeric DEFAULT 0,
  unit text DEFAULT 'packets',
  avg_daily_sales numeric DEFAULT 0,
  reorder_threshold_days numeric DEFAULT 2,
  distributor_id uuid REFERENCES distributors(id),
  created_at timestamp with time zone DEFAULT now()
);
