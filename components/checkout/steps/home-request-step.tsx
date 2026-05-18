'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useCheckout } from '@/lib/checkout-context'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, Mail, AlertCircle } from 'lucide-react'
import PriceDisplay from '@/components/price-display'
import { isShippingOutOfRange } from '@/lib/shipping/tiers'

type Props = {
  locale: string
}

export default function HomeDeliveryRequestStep({ locale }: Props) {
  const t = useTranslations()
  const { deliveryInfo, setCurrentStep, deliveryCost, shippingQuote } = useCheckout()
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const outOfRange = isShippingOutOfRange(shippingQuote)
  const vi = locale === 'vi'

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
        vi
          ? 'Đã có lỗi. Vui lòng thử lại hoặc liên hệ cửa hàng.'
          : 'Something went wrong. Please try again or contact us.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-bold">{t('checkout.homeConfirmTitle')}</h2>

      {outOfRange ? (
        <Alert className="border-amber-300 bg-amber-50 text-amber-950">
          <AlertCircle className="text-amber-700" />
          <AlertTitle>{vi ? 'Địa chỉ quá xa để thanh toán online' : 'Address too far for online payment'}</AlertTitle>
          <AlertDescription className="text-amber-900/90">
            {vi
              ? `Khoảng cách khoảng ${shippingQuote.distanceKm} km (trên 20 km). Không thể thanh toán trực tuyến. Bạn vẫn có thể gửi đơn — nhân viên sẽ liên hệ báo phí giao hàng và hỗ trợ bạn.`
              : `Distance is about ${shippingQuote.distanceKm} km (over 20 km). Online payment is not available. You can still submit your order — our staff will contact you with a delivery quote.`}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <div className="flex gap-3">
            <Mail className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{t('checkout.homeNoPaymentTitle')}</p>
              <p className="mt-1 text-amber-900/90">{t('checkout.homeNoPaymentBody')}</p>
            </div>
          </div>
        </div>
      )}

      <div className="border rounded-lg p-4 text-sm space-y-2">
        <p>
          <span className="text-gray-600">{vi ? 'Giao đến:' : 'Deliver to:'}</span>{' '}
          <span className="font-medium">
            {deliveryInfo.address}
            {deliveryInfo.wardName ? `, ${deliveryInfo.wardName}` : ''}
            {deliveryInfo.districtName ? `, ${deliveryInfo.districtName}` : ''}
            {deliveryInfo.provinceName ? `, ${deliveryInfo.provinceName}` : ''}
          </span>
        </p>
        <p>
          <span className="text-gray-600">{vi ? 'Liên hệ:' : 'Contact:'}</span>{' '}
          <span className="font-medium">
            {deliveryInfo.firstName} {deliveryInfo.lastName} · {deliveryInfo.phone} · {deliveryInfo.email}
          </span>
        </p>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3">{vi ? 'Sản phẩm' : 'Items'}</h3>
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
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-gray-600">{t('cart.subtotal')}</span>
          <PriceDisplay amountVnd={total} />
        </div>

        {!outOfRange && deliveryCost > 0 && (
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-600">{vi ? 'Phí giao hàng' : 'Delivery'}</span>
            <PriceDisplay amountVnd={deliveryCost} />
          </div>
        )}
        {!outOfRange && shippingQuote?.supported && shippingQuote.distanceKm > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {vi ? 'Khoảng cách' : 'Distance'}: {shippingQuote.distanceKm} km
          </p>
        )}
        {outOfRange && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-2 mt-2">
            {vi
              ? 'Phí giao hàng: nhân viên báo sau khi liên hệ.'
              : 'Delivery fee: quoted by staff after contact.'}
          </p>
        )}

        {!outOfRange && (
          <div className="flex justify-between mt-4 font-semibold">
            <span>{vi ? 'Tạm tính' : 'Estimated total'}</span>
            <PriceDisplay amountVnd={total + deliveryCost} />
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">
          {outOfRange
            ? vi
              ? 'Giá hoa và phí ship sẽ do nhân viên xác nhận qua điện thoại.'
              : 'Flower price and delivery fee will be confirmed by phone.'
            : vi
              ? 'Nhân viên xác nhận giá hoa qua điện thoại. Phí ship (nếu có) đã tính trong tạm tính.'
              : 'Staff will confirm flower total by phone. Delivery fee (if any) is in the estimate above.'}
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
          {outOfRange
            ? vi
              ? 'Gửi đơn — chờ nhân viên liên hệ'
              : 'Submit order — staff will contact you'
            : t('checkout.submitRequest')}
        </Button>
      </div>
    </div>
  )
}

