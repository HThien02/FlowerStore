-- Đảm bảo images_urls chứa đủ 5 URL (ảnh chính ở đầu mảng).
-- Chạy 1 lần trong Supabase SQL Editor cho sản phẩm đã tạo trước khi sửa lưu gallery.

UPDATE public.products
SET images_urls = (
  CASE
    WHEN COALESCE(cardinality(images_urls), 0) >= 5 THEN images_urls[1:5]
    WHEN trim(COALESCE(images_urls[1], '')) = trim(image_url) THEN images_urls
    ELSE (
      ARRAY[trim(image_url)] ||
      COALESCE(
        (
          SELECT array_agg(trim(x) ORDER BY ord)
          FROM unnest(COALESCE(images_urls, ARRAY[]::text[])) WITH ORDINALITY AS t(x, ord)
          WHERE trim(x) <> '' AND trim(x) <> trim(image_url)
        ),
        ARRAY[]::text[]
      )
    )[1:5]
  END
)
WHERE image_url IS NOT NULL
  AND trim(image_url) <> '';
