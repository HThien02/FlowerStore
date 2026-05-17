'use client'

import { useTranslations } from 'next-intl'
import { useCheckout } from '@/lib/checkout-context'
import { Button } from '@/components/ui/button'
import { Truck, Clock } from 'lucide-react'
import PriceDisplay from '@/components/price-display'

type DeliveryOption = {
  id: string
  name: string
  name_vi?: string
  base_price: number
  price_per_km?: number
  estimated_days: number
}

type Props = {
  deliveryOptions: DeliveryOption[]
  locale: string
}

export default function DeliveryMethodStep({ deliveryOptions, locale }: Props) {
  const t = useTranslations()
  const { selectedDelivery, setSelectedDelivery, setCurrentStep, setDeliveryCost } = useCheckout()

  const optionsToShow =
    deliveryOptions.length > 0
      ? deliveryOptions
      : [
          {
            id: 'pickup-default',
            name: 'In-store pickup',
            name_vi: 'Nhận tại cửa hàng',
            base_price: 0,
            estimated_days: 0,
          },
        ]

  const handleSelectDelivery = (option: DeliveryOption) => {
    setSelectedDelivery({
      id: option.id,
      name: locale === 'vi' && option.name_vi ? option.name_vi : option.name,
      basePrice: option.base_price,
      pricePerKm: option.price_per_km,
      estimatedDays: option.estimated_days,
    })
    setDeliveryCost(option.base_price)
  }

  const handleNext = () => {
    if (selectedDelivery) {
      setCurrentStep(3)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-bold">{t('checkout.step2')}</h2>

      <div className="space-y-3">
        {optionsToShow.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelectDelivery(option)}
            className={`w-full p-4 border-2 rounded-lg transition text-left ${
              selectedDelivery?.id === option.id
                ? 'border-rose-500 bg-rose-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {locale === 'vi' && option.name_vi ? option.name_vi : option.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {option.estimated_days <= 0
                        ? locale === 'en'
                          ? 'Pickup'
                          : 'Lấy hàng'
                        : `${option.estimated_days} ${locale === 'en' ? 'days' : 'ngày'}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    <PriceDisplay amountVnd={option.base_price} />
                  </div>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 mt-1 ${
                selectedDelivery?.id === option.id
                  ? 'border-rose-500 bg-rose-500'
                  : 'border-gray-300'
              }`} />
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setCurrentStep(1)}
        >
          {t('checkout.back')}
        </Button>
        <Button
          size="lg"
          className="bg-rose-500 hover:bg-rose-600"
          onClick={handleNext}
          disabled={!selectedDelivery}
        >
          {t('checkout.continue')}
        </Button>
      </div>
    </div>
  )
}
