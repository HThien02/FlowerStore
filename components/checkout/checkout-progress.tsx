'use client'

import { useTranslations } from 'next-intl'
import { CheckoutStep } from '@/lib/checkout-context'
import { Check } from 'lucide-react'

type Props = {
  currentStep: CheckoutStep
  locale: string
}

export default function CheckoutProgress({ currentStep, locale }: Props) {
  const t = useTranslations()

  const steps = [
    { number: 1, title: t('checkout.step1'), key: 'step1' },
    { number: 2, title: t('checkout.step2'), key: 'step2' },
    { number: 3, title: t('checkout.step3'), key: 'step3' },
    { number: 4, title: t('checkout.step4'), key: 'step4' },
  ]

  return (
    <div className="relative">
      {/* Progress bar */}
      <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
        <div
          className="h-full bg-rose-500 transition-all duration-300"
          style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
        />
      </div>

      {/* Steps */}
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
              {step.number < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                step.number
              )}
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
