'use client'

import { useTranslations } from 'next-intl'
import { useCart } from '@/lib/cart-context'
import { useCheckout } from '@/lib/checkout-context'
import PriceDisplay from '@/components/price-display'

type Props = {
  locale: string
}

export default function CheckoutSummary({ locale }: Props) {
  const t = useTranslations()
  const { items, total } = useCart()
  const { selectedDelivery, deliveryCost, fulfillmentType } = useCheckout()

  const subtotal = total
  const finalTotal = subtotal + deliveryCost

  const showDeliveryLine = fulfillmentType === 'pickup' && selectedDelivery
  const homeFlow = fulfillmentType === 'home'

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
              <PriceDisplay amountVnd={item.price * item.quantity} />
            </span>
          </div>
        ))}
      </div>

      {/* Costs */}
      <div className="space-y-3 pb-4 border-b mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">{t('cart.subtotal')}</span>
          <span className="font-medium">
            <PriceDisplay amountVnd={subtotal} />
          </span>
        </div>
        {homeFlow && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-2">
            {t('checkout.summaryHomeNote')}
          </p>
        )}
        {showDeliveryLine && (
          <div className="flex justify-between">
            <span className="text-gray-600">{t('cart.delivery')}</span>
            <span className="font-medium">
              <PriceDisplay amountVnd={deliveryCost} />
            </span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold">{t('cart.total')}</span>
        <span className="text-2xl font-bold text-rose-500">
          {homeFlow ? (
            <span className="text-base font-normal text-gray-600">
              {locale === 'en' ? 'TBD after contact' : 'Liên hệ xác nhận'}
            </span>
          ) : (
            <PriceDisplay amountVnd={finalTotal} />
          )}
        </span>
      </div>

      {/* Selected options */}
      {selectedDelivery && fulfillmentType === 'pickup' && (
        <div className="mt-6 pt-6 border-t space-y-2">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{locale === 'en' ? 'Delivery:' : 'Giao Hàng:'}</span> {selectedDelivery.name}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{locale === 'en' ? 'Est. Days:' : 'Dự Kiến:'}</span>{' '}
            {selectedDelivery.estimatedDays <= 0
              ? locale === 'en'
                ? 'Pickup'
                : 'Lấy tại cửa'
              : `${selectedDelivery.estimatedDays} ${locale === 'en' ? 'days' : 'ngày'}`}
          </p>
        </div>
      )}
    </div>
  )
}
