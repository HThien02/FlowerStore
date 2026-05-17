-- Đặt tất cả sản phẩm giá 10.000 VND (chạy 1 lần sau khi chuyển sang lưu giá VND).
UPDATE public.products
SET price = 10000,
    updated_at = NOW()
WHERE price IS NOT NULL;
