'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import AuthPageShell from '@/components/auth/auth-page-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { getAuthErrorMessage } from '@/lib/auth-errors'

export default function LoginPage() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { signIn, resetPassword } = useAuth()
  const isVi = locale === 'vi'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (forgotMode) {
        await resetPassword(email, locale)
        toast.success(t('auth.resetEmailSent'))
        setForgotMode(false)
        return
      }

      await signIn(email, password)
      toast.success(t('common.success'))
      router.push(`/${locale}/account`)
    } catch (error: unknown) {
      console.error('[v0] Login error:', error)
      toast.error(getAuthErrorMessage(error as { message?: string; code?: string }, isVi ? 'vi' : 'en'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthPageShell
      locale={locale}
      title={forgotMode ? t('auth.reset') : t('auth.loginTitle')}
      subtitle={
        forgotMode
          ? isVi
            ? 'Nhập email đã đăng ký — chúng tôi gửi link đặt lại mật khẩu.'
            : 'Enter your registered email — we will send a reset link.'
          : t('auth.loginSubtitle')
      }
      footer={
        !forgotMode ? (
          <p className="text-center text-gray-600">
            {t('auth.noAccount')}{' '}
            <Link href={`/${locale}/signup`} className="text-rose-500 hover:text-rose-600 font-semibold">
              {t('auth.signup')}
            </Link>
          </p>
        ) : (
          <p className="text-center">
            <button
              type="button"
              onClick={() => setForgotMode(false)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {t('auth.backToLogin')}
            </button>
          </p>
        )
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.email')}
            required
            disabled={isLoading}
          />
        </div>

        {!forgotMode && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <button
                type="button"
                onClick={() => setForgotMode(true)}
                className="text-sm text-rose-500 hover:text-rose-600 font-medium"
              >
                {t('auth.forgotPassword')}
              </button>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.password')}
              required
              disabled={isLoading}
            />
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full bg-rose-500 hover:bg-rose-600"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {forgotMode ? t('auth.reset') : t('auth.login')}
        </Button>

        {forgotMode && (
          <button
            type="button"
            onClick={() => setForgotMode(false)}
            className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
          >
            {t('auth.backToLogin')}
          </button>
        )}
      </form>
    </AuthPageShell>
  )
}
