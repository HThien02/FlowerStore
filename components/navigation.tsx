'use client'

import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ShoppingCart, User, Search, LogOut } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

export default function Navigation() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { itemCount } = useCart()
  const { user, isLoading, signOut } = useAuth()

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'vi' : 'en'
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPathname)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success(locale === 'en' ? 'Signed out successfully' : 'Đăng xuất thành công')
      router.push(`/${locale}`)
      router.refresh()
    } catch (error) {
      console.error('[v0] Sign out error:', error)
      toast.error(locale === 'en' ? 'Failed to sign out' : 'Đăng xuất thất bại')
    }
  }

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">🌹</span>
            </div>
            <span className="font-bold text-lg">Flower Shop</span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href={`/${locale}`} className="text-sm hover:text-rose-500 transition">
              {t('nav.home')}
            </Link>
            <Link href={`/${locale}/shop`} className="text-sm hover:text-rose-500 transition">
              {t('nav.shop')}
            </Link>
            <Link href={`/${locale}/about`} className="text-sm hover:text-rose-500 transition">
              {t('nav.about')}
            </Link>
            <Link href={`/${locale}/contact`} className="text-sm hover:text-rose-500 transition">
              {t('nav.contact')}
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <span className="text-sm">{locale.toUpperCase()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={toggleLanguage}>
                  {locale === 'en' ? '🇻🇳 Tiếng Việt' : '🇺🇸 English'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href={`/${locale}/cart`}>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isLoading && (
                  <DropdownMenuItem disabled>
                    {locale === 'en' ? 'Loading...' : 'Đang tải...'}
                  </DropdownMenuItem>
                )}
                {!isLoading && !user && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/login`}>{t('account.login')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/signup`}>{t('account.signup')}</Link>
                    </DropdownMenuItem>
                  </>
                )}

                {!isLoading && user && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/account`}>{t('account.profile')}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/admin/orders`}>Admin</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      {locale === 'en' ? 'Sign out' : 'Đăng xuất'}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
