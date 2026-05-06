'use client'

import { useTranslations } from 'next-intl'
import { useCart } from '@/lib/cart-context'
import { useCheckout } from '@/lib/checkout-context'

type Props = {
  locale: string
}

export default function CheckoutSummary({ locale }: Props) {
  const t = useTranslations()
  const { items, total } = useCart()
  const { selectedDelivery, deliveryCost } = useCheckout()

  const subtotal = total
  const finalTotal = subtotal + deliveryCost

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20 h-fit">
      <h2 className="text-lg font-bold mb-6">{t('checkout.orderSummary')}</h2>

      {/* Items */}
      <div className="space-y-3 pb-4 border-b mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-600">
              {item.productName} × {item.quantity}
            </span>
            <span className="font-medium">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Costs */}
      <div className="space-y-3 pb-4 border-b mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">{t('checkout.subtotal')}</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        {selectedDelivery && (
          <div className="flex justify-between">
            <span className="text-gray-600">{t('checkout.delivery')}</span>
            <span className="font-medium">${deliveryCost.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold">{t('checkout.total')}</span>
        <span className="text-2xl font-bold text-rose-500">
          ${finalTotal.toFixed(2)}
        </span>
      </div>

      {/* Selected options */}
      {selectedDelivery && (
        <div className="mt-6 pt-6 border-t space-y-2">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{locale === 'en' ? 'Delivery:' : 'Giao Hàng:'}</span> {selectedDelivery.name}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{locale === 'en' ? 'Est. Days:' : 'Dự Kiến:'}</span> {selectedDelivery.estimatedDays} {locale === 'en' ? 'days' : 'ngày'}
          </p>
        </div>
      )}
    </div>
  )
}
