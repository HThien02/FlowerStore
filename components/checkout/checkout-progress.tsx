'use client'

import { useTranslations } from 'next-intl'
import { CheckoutStep } from '@/lib/checkout-context'
import type { FulfillmentType } from '@/lib/checkout-context'
import { Check } from 'lucide-react'

type Props = {
  currentStep: CheckoutStep
  fulfillmentType: FulfillmentType | null
  locale: string
}

export default function CheckoutProgress({
  currentStep,
  fulfillmentType,
  locale: _locale,
}: Props) {
  const t = useTranslations()

  if (fulfillmentType === 'home') {
    const steps = [
      { number: 1 as CheckoutStep, title: t('checkout.progressContact') },
      { number: 2 as CheckoutStep, title: t('checkout.progressConfirm') },
    ]
    const activeIndex = currentStep - 1
    const pct = steps.length <= 1 ? 0 : (activeIndex / (steps.length - 1)) * 100

    return (
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
          <div
            className="h-full bg-rose-500 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition ${
                  step.number < currentStep
                    ? 'bg-rose-500 text-white'
                    : step.number === currentStep
                      ? 'bg-rose-500 text-white ring-4 ring-rose-200'
                      : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.number < currentStep ? <Check className="w-5 h-5" /> : step.number}
              </div>
              <p className="text-xs sm:text-sm font-medium text-center text-gray-900 line-clamp-2">
                {step.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Pickup: bỏ bước delivery method → 3 bước (1 → 3 → 4)
  if (fulfillmentType === 'pickup') {
    const labels = [t('checkout.progressContact'), t('checkout.step3'), t('checkout.step4')]
    const visualIndex =
      currentStep === 1 ? 0 : currentStep === 3 ? 1 : currentStep === 4 ? 2 : 0
    const pct = labels.length <= 1 ? 0 : (visualIndex / (labels.length - 1)) * 100

    return (
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
          <div
            className="h-full bg-rose-500 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {labels.map((title, i) => {
            const done = visualIndex > i
            const active = visualIndex === i
            return (
              <div key={title} className="relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition ${
                    done
                      ? 'bg-rose-500 text-white'
                      : active
                        ? 'bg-rose-500 text-white ring-4 ring-rose-200'
                        : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {done ? <Check className="w-5 h-5" /> : i + 1}
                </div>
                <p className="text-xs sm:text-sm font-medium text-center text-gray-900 line-clamp-2">
                  {title}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const steps = [
    { number: 1 as CheckoutStep, title: t('checkout.progressContact') },
    { number: 2 as CheckoutStep, title: t('checkout.step2') },
    { number: 3 as CheckoutStep, title: t('checkout.step3') },
    { number: 4 as CheckoutStep, title: t('checkout.step4') },
  ]

  const pct = ((currentStep - 1) / 3) * 100

  return (
    <div className="relative">
      <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
        <div
          className="h-full bg-rose-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {steps.map((step) => (
          <div key={step.number} className="relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition ${
                step.number < currentStep
                  ? 'bg-rose-500 text-white'
                  : step.number === currentStep
                    ? 'bg-rose-500 text-white ring-4 ring-rose-200'
                    : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step.number < currentStep ? <Check className="w-5 h-5" /> : step.number}
            </div>
            <p className="text-xs sm:text-sm font-medium text-center text-gray-900 line-clamp-2">
              {step.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
