'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { useAuth } from '@/lib/auth-context'
import { getOrders, getUserProfile } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Loader2, LogOut, User, ShoppingBag } from 'lucide-react'
import AccountProfile from '@/components/account/account-profile'
import AccountOrders from '@/components/account/account-orders'

export default function AccountPage() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const { user, isLoading, signOut } = useAuth()

  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/${locale}/login`)
    }
  }, [user, isLoading, router, locale])

  useEffect(() => {
    const loadData = async () => {
      if (!user) return

      try {
        const [profileData, ordersData] = await Promise.all([
          getUserProfile(user.id),
          getOrders(user.id),
        ])
        setProfile(profileData)
        setOrders(ordersData || [])
      } catch (error) {
        console.error('[v0] Error loading account data:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success(t('common.success'))
      router.push(`/${locale}`)
    } catch (error) {
      console.error('[v0] Signout error:', error)
      toast.error(t('common.error'))
    }
  }

  if (isLoading || isLoadingData) {
    return (
      <div className="w-full py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        <p className="mt-4 text-gray-600">{t('common.loading')}</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="w-full py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('account.title')}</h1>
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="text-rose-600 border-rose-200 hover:bg-rose-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t('account.logout')}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {t('account.profile')}
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            {t('account.orders')} ({orders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <AccountProfile user={user} profile={profile} locale={locale} />
        </TabsContent>

        <TabsContent value="orders">
          <AccountOrders orders={orders} locale={locale} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
