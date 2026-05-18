-- Shop location for distance-based delivery fees
-- Run after setup-db.sql on Supabase SQL editor

CREATE TABLE IF NOT EXISTS shop_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  address_detail TEXT NOT NULL DEFAULT '',
  province_code TEXT,
  province_name TEXT,
  district_code TEXT,
  district_name TEXT,
  ward_code TEXT,
  ward_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO shop_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE shop_settings ENABLE ROW LEVEL SECURITY;

-- Public read (checkout needs shop coordinates server-side via service role)
CREATE POLICY "shop_settings_public_read" ON shop_settings
  FOR SELECT USING (true);

-- Writes only via service role (admin API uses service key)
COMMENT ON TABLE shop_settings IS 'Singleton row (id=1): store address for shipping distance calculation';
