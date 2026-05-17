/** Thông báo lỗi Supabase Auth dễ hiểu (en / vi). */
export function getAuthErrorMessage(
  error: { message?: string; code?: string; status?: number },
  locale: 'en' | 'vi' = 'vi'
): string {
  const code = error.code ?? ''
  const msg = (error.message ?? '').toLowerCase()

  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
    return locale === 'vi'
      ? 'Email chưa được xác nhận. Kiểm tra hộp thư (cả spam) và bấm link xác nhận trước khi đăng nhập.'
      : 'Email not confirmed. Check your inbox (and spam) and confirm before signing in.'
  }

  if (
    code === 'invalid_credentials' ||
    msg.includes('invalid login credentials') ||
    msg.includes('invalid credentials')
  ) {
    return locale === 'vi'
      ? 'Email hoặc mật khẩu không đúng. Nếu vừa đăng ký, hãy xác nhận email trước. Hoặc dùng "Quên mật khẩu?" để đặt lại.'
      : 'Invalid email or password. If you just signed up, confirm your email first, or use "Forgot password?" to reset.'
  }

  if (msg.includes('user already registered') || code === 'user_already_exists') {
    return locale === 'vi'
      ? 'Email này đã được đăng ký. Hãy đăng nhập hoặc dùng email khác.'
      : 'This email is already registered. Sign in or use another email.'
  }

  if (msg.includes('password') && msg.includes('least')) {
    return locale === 'vi'
      ? 'Mật khẩu quá ngắn (Supabase thường yêu cầu tối thiểu 6 ký tự).'
      : 'Password is too short (usually minimum 6 characters).'
  }

  if (
    error.status === 429 ||
    code === 'over_email_send_rate_limit' ||
    msg.includes('rate limit') ||
    msg.includes('too many')
  ) {
    return locale === 'vi'
      ? 'Đã gửi quá nhiều email xác nhận trong thời gian ngắn. Đợi khoảng 1 giờ rồi thử lại, hoặc kiểm tra hộp thư/spam xem đã có mail xác nhận chưa. Khi dev: tắt "Confirm email" trong Supabase → Authentication → Providers → Email.'
      : 'Too many confirmation emails sent recently. Wait about an hour, or check inbox/spam for an existing link. For dev: disable "Confirm email" under Supabase → Authentication → Providers → Email.'
  }

  return error.message || (locale === 'vi' ? 'Đã có lỗi xác thực' : 'Authentication error')
}

export function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase()
}
