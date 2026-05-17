-- =========================================================================
-- Scheduling, staff assignments, guest orders, email reminder flags
-- Run after setup-db.sql and setup-admin.sql (Supabase SQL editor)
-- =========================================================================

-- Guest-friendly orders + delivery timing
ALTER TABLE public.orders
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS fulfillment_type TEXT NOT NULL DEFAULT 'pickup';

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_fulfillment_type_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_fulfillment_type_check
  CHECK (fulfillment_type IN ('pickup', 'home'));

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS prep_scheduled_at TIMESTAMPTZ;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_email TEXT;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_name TEXT;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_orders_scheduled_at ON public.orders (scheduled_at);
CREATE INDEX IF NOT EXISTS idx_orders_prep_scheduled_at ON public.orders (prep_scheduled_at);

-- One staff member per order prep slot
CREATE TABLE IF NOT EXISTS public.order_staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  prep_scheduled_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (order_id)
);

CREATE INDEX IF NOT EXISTS idx_order_staff_assignments_staff
  ON public.order_staff_assignments (staff_id, prep_scheduled_at);

ALTER TABLE public.order_staff_assignments
  ADD COLUMN IF NOT EXISTS prep_reminder_sent_at TIMESTAMPTZ;

ALTER TABLE public.order_staff_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff assignments readable by staff or admin" ON public.order_staff_assignments;
CREATE POLICY "Staff assignments readable by staff or admin"
  ON public.order_staff_assignments FOR SELECT
  USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS "Admins manage staff assignments" ON public.order_staff_assignments;
CREATE POLICY "Admins manage staff assignments"
  ON public.order_staff_assignments FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
