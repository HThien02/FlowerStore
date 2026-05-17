'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useCheckout } from '@/lib/checkout-context'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Loader2, Mail } from 'lucide-react'
import PriceDisplay from '@/components/price-display'

type Props = {
  locale: string
}

export default function HomeDeliveryRequestStep({ locale }: Props) {
  const t = useTranslations()
  const { deliveryInfo, setCurrentStep } = useCheckout()
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/checkout-home-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          userId: user?.id ?? null,
          scheduledAt: deliveryInfo.scheduledAt
            ? new Date(deliveryInfo.scheduledAt).toISOString()
            : undefined,
          deliveryInfo,
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            price: i.price,
            quantity: i.quantity,
          })),
          subtotal: total,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Request failed')
      }

      clearCart()
      window.location.href = `/${locale}/order-success?type=home-request`
    } catch (e) {
      console.error('[home-request]', e)
      setError(
        locale === 'en'
          ? 'Something went wrong. Please try again or contact us.'
          : 'Đã có lỗi. Vui lòng thử lại hoặc liên hệ cửa hàng.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-bold">{t('checkout.homeConfirmTitle')}</h2>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <div className="flex gap-3">
          <Mail className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{t('checkout.homeNoPaymentTitle')}</p>
            <p className="mt-1 text-amber-900/90">{t('checkout.homeNoPaymentBody')}</p>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 text-sm space-y-2">
        <p>
          <span className="text-gray-600">{locale === 'en' ? 'Deliver to:' : 'Giao đến:'}</span>{' '}
          <span className="font-medium">
            {deliveryInfo.address}, {deliveryInfo.city}
          </span>
        </p>
        <p>
          <span className="text-gray-600">{locale === 'en' ? 'Contact:' : 'Liên hệ:'}</span>{' '}
          <span className="font-medium">
            {deliveryInfo.firstName} {deliveryInfo.lastName} · {deliveryInfo.phone} · {deliveryInfo.email}
          </span>
        </p>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3">{locale === 'en' ? 'Items' : 'Sản phẩm'}</h3>
        <div className="space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="text-gray-600">
                {item.productName} × {item.quantity}
              </span>
              <PriceDisplay amountVnd={item.price * item.quantity} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 font-semibold">
          <span>{t('cart.subtotal')}</span>
          <PriceDisplay amountVnd={total} />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {locale === 'en'
            ? 'Final price will be confirmed by staff after contact.'
            : 'Giá cuối sẽ được nhân viên xác nhận sau khi liên hệ.'}
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-between gap-4">
        <Button variant="outline" size="lg" onClick={() => setCurrentStep(1)} disabled={isSubmitting}>
          {t('checkout.back')}
        </Button>
        <Button
          size="lg"
          className="bg-rose-500 hover:bg-rose-600"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {t('checkout.submitRequest')}
        </Button>
      </div>
    </div>
  )
}
