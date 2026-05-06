'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { useCart } from '@/lib/cart-context'
import { useCheckout } from '@/lib/checkout-context'
import { getDeliveryOptions } from '@/lib/db'
import DeliveryStep from '@/components/checkout/steps/delivery-step'
import DeliveryMethodStep from '@/components/checkout/steps/delivery-method-step'
import PaymentStep from '@/components/checkout/steps/payment-step'
import ReviewStep from '@/components/checkout/steps/review-step'
import CheckoutProgress from '@/components/checkout/checkout-progress'
import CheckoutSummary from '@/components/checkout/checkout-summary'

type Props = {
  locale: string
}

export default function CheckoutClient({ locale }: Props) {
  const t = useTranslations()
  const { items, total, clearCart } = useCart()
  const { currentStep, setCurrentStep } = useCheckout()
  const [deliveryOptions, setDeliveryOptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDeliveryOptions = async () => {
      try {
        const options = await getDeliveryOptions()
        setDeliveryOptions(options)
      } catch (error) {
        console.error('[v0] Error loading delivery options:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDeliveryOptions()
  }, [])

  if (items.length === 0 && !isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">{locale === 'en' ? 'Your cart is empty' : 'Giỏ hàng của bạn trống'}</h1>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">{t('checkout.title')}</h1>

      <CheckoutProgress currentStep={currentStep} locale={locale} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Form */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="text-center py-20">{t('common.loading')}</div>
          ) : currentStep === 1 ? (
            <DeliveryStep locale={locale} />
          ) : currentStep === 2 ? (
            <DeliveryMethodStep deliveryOptions={deliveryOptions} locale={locale} />
          ) : currentStep === 3 ? (
            <PaymentStep locale={locale} />
          ) : (
            <ReviewStep locale={locale} />
          )}
        </div>

        {/* Summary */}
        <CheckoutSummary locale={locale} />
      </div>
    </div>
  )
}
