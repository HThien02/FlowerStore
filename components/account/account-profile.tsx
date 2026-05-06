'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updateUserProfile } from '@/lib/db'

type Props = {
  user: User
  profile: any
  locale: string
}

export default function AccountProfile({ user, profile, locale }: Props) {
  const t = useTranslations()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    postalCode: profile?.postal_code || '',
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateUserProfile(user.id, {
        full_name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postalCode,
      })
      toast.success(t('common.success'))
      setIsEditing(false)
    } catch (error) {
      console.error('[v0] Error updating profile:', error)
      toast.error(t('common.error'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>{t('checkout.email')}</Label>
          <p className="mt-2 text-gray-900">{user.email}</p>
        </div>

        <div>
          <Label>{locale === 'en' ? 'Member Since' : 'Thành Viên Từ'}</Label>
          <p className="mt-2 text-gray-900">
            {new Date(user.created_at!).toLocaleDateString(locale === 'en' ? 'en-US' : 'vi-VN')}
          </p>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4 border-t pt-6">
          <h3 className="font-semibold">{t('account.editProfile')}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{locale === 'en' ? 'Full Name' : 'Họ Tên'}</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder={t('checkout.firstName')}
              />
            </div>

            <div>
              <Label>{t('checkout.phone')}</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t('checkout.phone')}
              />
            </div>
          </div>

          <div>
            <Label>{t('checkout.address')}</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder={t('checkout.address')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{t('checkout.city')}</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder={t('checkout.city')}
              />
            </div>

            <div>
              <Label>{t('checkout.state')}</Label>
              <Input
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder={t('checkout.state')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-rose-500 hover:bg-rose-600"
              onClick={handleSave}
              disabled={isSaving}
            >
              {t('common.save')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-t pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-600">{locale === 'en' ? 'Full Name' : 'Họ Tên'}</Label>
              <p className="mt-2 text-gray-900">{formData.fullName || '-'}</p>
            </div>

            <div>
              <Label className="text-gray-600">{t('checkout.phone')}</Label>
              <p className="mt-2 text-gray-900">{formData.phone || '-'}</p>
            </div>

            <div className="md:col-span-2">
              <Label className="text-gray-600">{t('checkout.address')}</Label>
              <p className="mt-2 text-gray-900">{formData.address || '-'}</p>
            </div>

            <div>
              <Label className="text-gray-600">{t('checkout.city')}</Label>
              <p className="mt-2 text-gray-900">{formData.city || '-'}</p>
            </div>

            <div>
              <Label className="text-gray-600">{t('checkout.state')}</Label>
              <p className="mt-2 text-gray-900">{formData.state || '-'}</p>
            </div>
          </div>

          <Button
            variant="outline"
            className="mt-6"
            onClick={() => setIsEditing(true)}
          >
            {t('account.editProfile')}
          </Button>
        </div>
      )}
    </div>
  )
}
