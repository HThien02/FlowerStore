'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { getAuthErrorMessage } from '@/lib/auth-errors'

export default function SignupPage() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { signUp } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error(locale === 'en' ? 'Passwords do not match' : 'Mật khẩu không khớp')
      return
    }

    if (!firstName.trim() || !lastName.trim()) {
      toast.error(locale === 'en' ? 'Please enter first and last name' : 'Vui lòng nhập tên và họ')
      return
    }

    setIsLoading(true)

    try {
      const { needsEmailConfirmation } = await signUp(
        email,
        password,
        `${firstName.trim()} ${lastName.trim()}`
      )
      if (needsEmailConfirmation) {
        toast.success(
          locale === 'en'
            ? 'Check your email to confirm your account, then sign in.'
            : 'Kiểm tra email để xác nhận tài khoản, sau đó đăng nhập.'
        )
      } else {
        toast.success(locale === 'en' ? 'Account created successfully!' : 'Tạo tài khoản thành công!')
      }
      router.push(`/${locale}/login`)
    } catch (error: any) {
      console.error('[v0] Signup error:', error)
      toast.error(getAuthErrorMessage(error, locale === 'vi' ? 'vi' : 'en'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">{t('auth.signupTitle')}</h2>
          <p className="mt-2 text-gray-600">{t('auth.signupSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">{t('auth.firstName')}</Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t('auth.firstName')}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="lastName">{t('auth.lastName')}</Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t('auth.lastName')}
                required
                disabled={isLoading}
              />
            </div>
          </div>

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

          <div>
            <Label htmlFor="password">{t('auth.password')}</Label>
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

          <div>
            <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.confirmPassword')}
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-rose-500 hover:bg-rose-600"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('auth.signup')}
          </Button>
        </form>

        <p className="text-center text-gray-600">
          {t('auth.haveAccount')}{' '}
          <Link
            href={`/${locale}/login`}
            className="text-rose-500 hover:text-rose-600 font-semibold"
          >
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </div>
  )
}
