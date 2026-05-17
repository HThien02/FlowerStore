-- PayOS: mã đơn thanh toán + payment link id
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payos_order_code BIGINT UNIQUE;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payos_payment_link_id TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_payos_order_code
  ON public.orders (payos_order_code)
  WHERE payos_order_code IS NOT NULL;
