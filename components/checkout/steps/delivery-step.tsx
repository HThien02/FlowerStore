'use client'

import { useTranslations } from 'next-intl'
import { useCheckout } from '@/lib/checkout-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'

type Props = {
  locale: string
}

export default function DeliveryStep({ locale }: Props) {
  const t = useTranslations()
  const { deliveryInfo, setDeliveryInfo, setCurrentStep } = useCheckout()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!deliveryInfo.firstName.trim()) newErrors.firstName = 'Required'
    if (!deliveryInfo.lastName.trim()) newErrors.lastName = 'Required'
    if (!deliveryInfo.email.trim()) newErrors.email = 'Required'
    if (!deliveryInfo.phone.trim()) newErrors.phone = 'Required'
    if (!deliveryInfo.address.trim()) newErrors.address = 'Required'
    if (!deliveryInfo.city.trim()) newErrors.city = 'Required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      setCurrentStep(2)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-bold">{t('checkout.step1')}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">{t('checkout.firstName')}</Label>
          <Input
            id="firstName"
            value={deliveryInfo.firstName}
            onChange={(e) => setDeliveryInfo({ firstName: e.target.value })}
            placeholder={t('checkout.firstName')}
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <Label htmlFor="lastName">{t('checkout.lastName')}</Label>
          <Input
            id="lastName"
            value={deliveryInfo.lastName}
            onChange={(e) => setDeliveryInfo({ lastName: e.target.value })}
            placeholder={t('checkout.lastName')}
            className={errors.lastName ? 'border-red-500' : ''}
          />
          {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
        </div>

        <div>
          <Label htmlFor="email">{t('checkout.email')}</Label>
          <Input
            id="email"
            type="email"
            value={deliveryInfo.email}
            onChange={(e) => setDeliveryInfo({ email: e.target.value })}
            placeholder={t('checkout.email')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="phone">{t('checkout.phone')}</Label>
          <Input
            id="phone"
            value={deliveryInfo.phone}
            onChange={(e) => setDeliveryInfo({ phone: e.target.value })}
            placeholder={t('checkout.phone')}
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="address">{t('checkout.address')}</Label>
        <Input
          id="address"
          value={deliveryInfo.address}
          onChange={(e) => setDeliveryInfo({ address: e.target.value })}
          placeholder={t('checkout.address')}
          className={errors.address ? 'border-red-500' : ''}
        />
        {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">{t('checkout.city')}</Label>
          <Input
            id="city"
            value={deliveryInfo.city}
            onChange={(e) => setDeliveryInfo({ city: e.target.value })}
            placeholder={t('checkout.city')}
            className={errors.city ? 'border-red-500' : ''}
          />
          {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
        </div>

        <div>
          <Label htmlFor="state">{t('checkout.state')}</Label>
          <Input
            id="state"
            value={deliveryInfo.state}
            onChange={(e) => setDeliveryInfo({ state: e.target.value })}
            placeholder={t('checkout.state')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="postalCode">{t('checkout.postalCode')}</Label>
          <Input
            id="postalCode"
            value={deliveryInfo.postalCode}
            onChange={(e) => setDeliveryInfo({ postalCode: e.target.value })}
            placeholder={t('checkout.postalCode')}
          />
        </div>

        <div>
          <Label htmlFor="country">{t('checkout.country')}</Label>
          <Input
            id="country"
            value={deliveryInfo.country}
            onChange={(e) => setDeliveryInfo({ country: e.target.value })}
            placeholder={t('checkout.country')}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">{t('checkout.notes')}</Label>
        <Textarea
          id="notes"
          value={deliveryInfo.notes || ''}
          onChange={(e) => setDeliveryInfo({ notes: e.target.value })}
          placeholder={t('checkout.notes')}
          rows={4}
        />
      </div>

      <div className="flex justify-end">
        <Button size="lg" className="bg-rose-500 hover:bg-rose-600" onClick={handleNext}>
          {t('checkout.continue')}
        </Button>
      </div>
    </div>
  )
}
