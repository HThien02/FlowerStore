'use client'

import { useTranslations } from 'next-intl'
import { useCart } from '@/lib/cart-context'
import { useCheckout } from '@/lib/checkout-context'
import DeliveryStep from '@/components/checkout/steps/delivery-step'
import HomeDeliveryRequestStep from '@/components/checkout/steps/home-request-step'
import PaymentStep from '@/components/checkout/steps/payment-step'
import ReviewStep from '@/components/checkout/steps/review-step'
import CheckoutProgress from '@/components/checkout/checkout-progress'
import CheckoutSummary from '@/components/checkout/checkout-summary'

type Props = {
  locale: string
}

export default function CheckoutClient({ locale }: Props) {
  const t = useTranslations()
  const { items } = useCart()
  const { currentStep, fulfillmentType } = useCheckout()

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">{locale === 'en' ? 'Your cart is empty' : 'Giỏ hàng của bạn trống'}</h1>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">{t('checkout.title')}</h1>

      <CheckoutProgress currentStep={currentStep} fulfillmentType={fulfillmentType} locale={locale} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
          {currentStep === 1 ? (
            <DeliveryStep locale={locale} />
          ) : currentStep === 2 && fulfillmentType === 'home' ? (
            <HomeDeliveryRequestStep locale={locale} />
          ) : currentStep === 3 && fulfillmentType === 'pickup' ? (
            <PaymentStep locale={locale} />
          ) : currentStep === 4 && fulfillmentType === 'pickup' ? (
            <ReviewStep locale={locale} />
          ) : (
            <DeliveryStep locale={locale} />
          )}
        </div>

        <CheckoutSummary locale={locale} />
      </div>
    </div>
  )
}
