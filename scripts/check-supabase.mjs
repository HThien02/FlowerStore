/**
 * Quick connectivity check: Supabase REST + table `products` (matches lib/db.ts).
 * Run: node --env-file=.env.local scripts/check-supabase.mjs
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anon) {
  console.error(
    'Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY (thêm vào .env.local hoặc truyền env).'
  )
  process.exit(1)
}

const supabase = createClient(url, anon)

const { error, count } = await supabase
  .from('products')
  .select('*', { count: 'exact', head: true })

if (error) {
  console.error('Lỗi khi truy vấn bảng `products`:', error.message)
  console.error('Chi tiết:', error)
  process.exit(1)
}

console.log('Kết nối Supabase REST: OK')
console.log('Đọc được bảng `products`, số dòng (ước lượng):', count ?? 0)
