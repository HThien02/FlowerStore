-- =========================================================================
-- Ca làm việc nhân viên + phụ thu ngoài giờ (chạy sau setup-scheduling.sql)
-- =========================================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS after_hours_fee DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- Ca làm: một nhân viên có thể nhiều ca/ngày
CREATE TABLE IF NOT EXISTS public.staff_work_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_minutes INT NOT NULL CHECK (start_minutes >= 0 AND start_minutes < 1440),
  end_minutes INT NOT NULL CHECK (end_minutes > 0 AND end_minutes <= 1440),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_minutes > start_minutes)
);

CREATE INDEX IF NOT EXISTS idx_staff_work_shifts_date
  ON public.staff_work_shifts (shift_date, staff_id);

CREATE INDEX IF NOT EXISTS idx_staff_work_shifts_staff
  ON public.staff_work_shifts (staff_id, shift_date);

ALTER TABLE public.staff_work_shifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff shifts readable" ON public.staff_work_shifts;
CREATE POLICY "Staff shifts readable"
  ON public.staff_work_shifts FOR SELECT
  USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS "Admins manage staff shifts" ON public.staff_work_shifts;
CREATE POLICY "Admins manage staff shifts"
  ON public.staff_work_shifts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
