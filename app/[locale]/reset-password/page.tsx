'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AuthPageShell from '@/components/auth/auth-page-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { getAuthErrorMessage } from '@/lib/auth-errors'

export default function ResetPasswordPage() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const isVi = locale === 'vi'

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      toast.error(isVi ? 'Mật khẩu không khớp' : 'Passwords do not match')
      return
    }
    if (password.length < 6) {
      toast.error(isVi ? 'Mật khẩu tối thiểu 6 ký tự' : 'Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success(isVi ? 'Đã đổi mật khẩu. Đang chuyển đến đăng nhập…' : 'Password updated. Redirecting…')
      await supabase.auth.signOut()
      router.push(`/${locale}/login`)
    } catch (err: unknown) {
      toast.error(getAuthErrorMessage(err as { message?: string; code?: string }, isVi ? 'vi' : 'en'))
    } finally {
      setLoading(false)
    }
  }

  if (!ready) {
    return (
      <AuthPageShell
        locale={locale}
        title={t('auth.reset')}
        subtitle={
          isVi
            ? 'Mở link trong email đặt lại mật khẩu, hoặc yêu cầu gửi lại từ trang đăng nhập.'
            : 'Open the link from your reset email, or request a new one from the login page.'
        }
        footer={
          <p className="text-center text-gray-600">
            <Link href={`/${locale}/login`} className="text-rose-500 hover:text-rose-600 font-semibold">
              {t('auth.backToLogin')}
            </Link>
          </p>
        }
      >
        <p className="text-center text-sm text-gray-500">
          {isVi ? 'Đang chờ phiên đặt lại mật khẩu…' : 'Waiting for password recovery session…'}
        </p>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell
      locale={locale}
      title={isVi ? 'Mật khẩu mới' : 'New password'}
      subtitle={isVi ? 'Nhập mật khẩu mới cho tài khoản của bạn.' : 'Enter a new password for your account.'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="password">{isVi ? 'Mật khẩu mới' : 'New password'}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="confirm">{t('auth.confirmPassword')}</Label>
          <Input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            disabled={loading}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="w-full bg-rose-500 hover:bg-rose-600"
          disabled={loading}
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isVi ? 'Lưu mật khẩu' : 'Save password'}
        </Button>
      </form>
    </AuthPageShell>
  )
}
