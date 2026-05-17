'use client'

import { useTranslations } from 'next-intl'
import { useCheckout, type FulfillmentType } from '@/lib/checkout-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Store, Home } from 'lucide-react'
import { useState } from 'react'

type Props = {
  locale: string
}

export default function DeliveryStep({ locale }: Props) {
  const t = useTranslations()
  const {
    deliveryInfo,
    setDeliveryInfo,
    fulfillmentType,
    setFulfillmentType,
    setCurrentStep,
    setSelectedDelivery,
    setDeliveryCost,
  } = useCheckout()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const selectFulfillment = (value: FulfillmentType) => {
    setFulfillmentType(value)
    setSelectedDelivery(undefined)
    setDeliveryCost(0)
    if (value === 'pickup') {
      setDeliveryInfo({
        address: '',
        city: '',
        state: '',
        postalCode: '',
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!fulfillmentType) {
      newErrors.fulfillment =
        locale === 'en' ? 'Please choose how you want to receive your order' : 'Vui lòng chọn hình thức nhận hàng'
    }
    if (!deliveryInfo.firstName.trim()) newErrors.firstName = locale === 'en' ? 'Required' : 'Bắt buộc'
    if (!deliveryInfo.lastName.trim()) newErrors.lastName = locale === 'en' ? 'Required' : 'Bắt buộc'
    if (!deliveryInfo.email.trim()) newErrors.email = locale === 'en' ? 'Required' : 'Bắt buộc'
    if (!deliveryInfo.phone.trim()) newErrors.phone = locale === 'en' ? 'Required' : 'Bắt buộc'

    if (fulfillmentType === 'home') {
      if (!deliveryInfo.address.trim()) newErrors.address = locale === 'en' ? 'Required' : 'Bắt buộc'
      if (!deliveryInfo.city.trim()) newErrors.city = locale === 'en' ? 'Required' : 'Bắt buộc'
    }

    if (!deliveryInfo.scheduledAt?.trim()) {
      newErrors.scheduledAt =
        locale === 'en' ? 'Please choose date & time' : 'Vui lòng chọn ngày giờ nhận/giao hoa'
    } else {
      const when = new Date(deliveryInfo.scheduledAt)
      if (when.getTime() < Date.now() + 60 * 60 * 1000) {
        newErrors.scheduledAt =
          locale === 'en'
            ? 'Please schedule at least 1 hour from now'
            : 'Vui lòng chọn thời gian sau ít nhất 1 giờ'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateForm()) return

    if (fulfillmentType === 'pickup') {
      setSelectedDelivery({
        id: 'pickup-in-store',
        name: locale === 'vi' ? 'Nhận tại cửa hàng' : 'Pickup at store',
        basePrice: 0,
        estimatedDays: 0,
      })
      setDeliveryCost(0)
      setCurrentStep(3)
      return
    }

    setCurrentStep(2)
  }

  const isHome = fulfillmentType === 'home'

  const minSchedule = () => {
    const d = new Date(Date.now() + 60 * 60 * 1000)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 16)
  }

  return (
    <div className="floral-card p-6 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <h2 className="text-xl font-bold font-display text-rose-900">{t('checkout.step1Title')}</h2>

      <div className="space-y-3">
        <Label className="text-base font-semibold">{t('checkout.fulfillmentQuestion')}</Label>
        <RadioGroup
          value={fulfillmentType ?? ''}
          onValueChange={(v) => selectFulfillment(v as FulfillmentType)}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <label
            htmlFor="fulfillment-pickup"
            className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition ${
              fulfillmentType === 'pickup' ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <RadioGroupItem value="pickup" id="fulfillment-pickup" className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <Store className="w-5 h-5 text-rose-500" />
                {t('checkout.pickupAtStore')}
              </div>
              <p className="mt-1 text-sm text-gray-600">{t('checkout.pickupAtStoreHint')}</p>
            </div>
          </label>

          <label
            htmlFor="fulfillment-home"
            className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition ${
              fulfillmentType === 'home' ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <RadioGroupItem value="home" id="fulfillment-home" className="mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <Home className="w-5 h-5 text-rose-500" />
                {t('checkout.homeDelivery')}
              </div>
              <p className="mt-1 text-sm text-gray-600">{t('checkout.homeDeliveryHint')}</p>
            </div>
          </label>
        </RadioGroup>
        {errors.fulfillment && <p className="text-sm text-red-500">{errors.fulfillment}</p>}
      </div>

      <div className="border-t pt-6 space-y-4">
        <h3 className="font-semibold text-gray-900">{t('checkout.contactSection')}</h3>
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
      </div>

      {isHome && (
        <div className="border-t pt-6 space-y-4 animate-in fade-in">
          <h3 className="font-semibold text-gray-900">{t('checkout.addressSection')}</h3>

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
        </div>
      )}

      <div className="border-t pt-6 space-y-2">
        <Label htmlFor="scheduledAt" className="text-base font-semibold">
          {locale === 'en' ? 'When do you need the flowers?' : 'Bạn cần hoa lúc nào?'}
        </Label>
        <Input
          id="scheduledAt"
          type="datetime-local"
          min={minSchedule()}
          value={deliveryInfo.scheduledAt ?? ''}
          onChange={(e) => setDeliveryInfo({ scheduledAt: e.target.value })}
          className={errors.scheduledAt ? 'border-red-500' : ''}
        />
        {errors.scheduledAt && <p className="text-sm text-red-500">{errors.scheduledAt}</p>}
        <p className="text-xs text-muted-foreground">
          {locale === 'en'
            ? 'We prepare bouquets 1 hour before your time; the shop will confirm by email. Standard hours 8am–6pm. Outside hours: +10% order value.'
            : 'Shop chuẩn bị trước 1 giờ; bạn sẽ nhận email xác nhận. Giờ chuẩn 8h–18h. Ngoài giờ: +10% giá trị đơn.'}
        </p>
      </div>

      {fulfillmentType === 'pickup' && (
        <div className="border-t pt-4">
          <Label htmlFor="notes-pickup">{t('checkout.notes')}</Label>
          <Textarea
            id="notes-pickup"
            value={deliveryInfo.notes || ''}
            onChange={(e) => setDeliveryInfo({ notes: e.target.value })}
            placeholder={t('checkout.notes')}
            rows={3}
            className="mt-2"
          />
        </div>
      )}

      <div className="flex justify-end">
        <Button size="lg" className="rounded-full btn-bloom" onClick={handleNext}>
          {t('checkout.continue')}
        </Button>
      </div>
    </div>
  )
}
