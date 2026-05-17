-- =========================================================================
-- Roles (admin / staff) + product CRUD policies + orders RLS for staff/admin
-- + Storage bucket for product images.
--
-- Idempotent: safe to run multiple times.
-- Run in Supabase Studio → SQL editor.
-- =========================================================================

-- 1. Add role column to user_profiles. Roles:
--    'user'  : default customer
--    'admin' : full CRUD on products + view all orders
--    'staff' : sub-admin — read orders only, NO product CRUD
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- Reset constraint so we can extend allowed values.
ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('user', 'admin', 'staff'));

CREATE INDEX IF NOT EXISTS idx_user_profiles_role
  ON public.user_profiles (role);

-- 2. Helpers
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role IN ('admin', 'staff')
  );
$$;

-- 3. Admin-only writes for products & categories
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
CREATE POLICY "Admins can insert categories" ON public.categories
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Admins can update categories" ON public.categories
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
CREATE POLICY "Admins can delete categories" ON public.categories
  FOR DELETE USING (public.is_admin());

-- 4. Orders & order_items: admin + staff can read everything;
--    only admin can update statuses (you can swap to is_staff_or_admin if desired).
DROP POLICY IF EXISTS "Admins/staff can view all orders" ON public.orders;
CREATE POLICY "Admins/staff can view all orders" ON public.orders
  FOR SELECT USING (public.is_staff_or_admin());

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins/staff can view all order items" ON public.order_items;
CREATE POLICY "Admins/staff can view all order items" ON public.order_items
  FOR SELECT USING (public.is_staff_or_admin());

-- 5. Allow admin/staff to read user_profiles to display order owners.
DROP POLICY IF EXISTS "Admins/staff can view all profiles" ON public.user_profiles;
CREATE POLICY "Admins/staff can view all profiles" ON public.user_profiles
  FOR SELECT USING (public.is_staff_or_admin() OR auth.uid() = id);

-- 6. Storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', TRUE)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

-- =========================================================================
-- Promote a user (run AFTER they sign up via the website):
--
--   UPDATE public.user_profiles SET role = 'admin'  WHERE email = '...';
--   UPDATE public.user_profiles SET role = 'staff'  WHERE email = '...';
-- =========================================================================
