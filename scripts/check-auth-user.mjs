/**
 * Kiểm tra user trong Supabase Auth (khác user_profiles).
 * Run: node --env-file=.env.local scripts/check-auth-user.mjs hieuthien2k2@gmail.com
 */
import { createClient } from '@supabase/supabase-js'

const email = (process.argv[2] || '').trim().toLowerCase()
if (!email) {
  console.error('Usage: node --env-file=.env.local scripts/check-auth-user.mjs <email>')
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local')
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 })
if (error) {
  console.error('Không list được users:', error.message)
  process.exit(1)
}

const user = data.users.find((u) => (u.email || '').toLowerCase() === email)

if (!user) {
  console.log('❌ KHÔNG có user trong auth.users với email:', email)
  console.log('   → user_profiles có thể tồn tại nhưng đăng nhập vẫn fail nếu không có auth user.')
  console.log('   → Đăng ký lại tại /signup hoặc tạo user trong Dashboard → Authentication → Users')
  process.exit(0)
}

console.log('✅ Có user trong auth.users')
console.log('   id:', user.id)
console.log('   email:', user.email)
console.log('   email_confirmed_at:', user.email_confirmed_at ?? '(chưa xác nhận — cần confirm trước khi login)')
console.log('   created_at:', user.created_at)
console.log('   last_sign_in_at:', user.last_sign_in_at ?? '(chưa từng đăng nhập)')

const { data: profile, error: pErr } = await admin
  .from('user_profiles')
  .select('id, email, role, full_name')
  .eq('id', user.id)
  .maybeSingle()

if (pErr) {
  console.log('   profile:', '(lỗi đọc)', pErr.message)
} else if (!profile) {
  console.log('   profile: ❌ chưa có trong user_profiles')
} else {
  console.log('   profile role:', profile.role)
  console.log('   profile full_name:', profile.full_name)
}

if (!user.email_confirmed_at) {
  console.log('\n⚠️  Email chưa xác nhận → Supabase có thể từ chối đăng nhập.')
  console.log('   Dashboard → Authentication → Users → Confirm user')
  console.log('   Hoặc tắt "Confirm email" trong Providers → Email (dev only)')
}
