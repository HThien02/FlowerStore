'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useCheckout } from '@/lib/checkout-context'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import {
  orderTotalWithFees,
  isOutsideBusinessHours,
  formatScheduledAtVietnam,
} from '@/lib/pricing/business-hours'
import PriceDisplay from '@/components/price-display'

type Props = {
  locale: string
}

export default function ReviewStep({ locale }: Props) {
  const t = useTranslations()
  const { deliveryInfo, selectedDelivery, paymentInfo, setCurrentStep, fulfillmentType } =
    useCheckout()
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subtotal = total
  const deliveryCost = selectedDelivery?.basePrice || 0
  const scheduledDate = deliveryInfo.scheduledAt ? new Date(deliveryInfo.scheduledAt) : null
  const fees =
    scheduledDate && !Number.isNaN(scheduledDate.getTime())
      ? orderTotalWithFees(subtotal, deliveryCost, scheduledDate)
      : { afterHoursFee: 0, total: subtotal + deliveryCost }
  const afterHoursFee = fees.afterHoursFee
  const finalTotal = fees.total
  const outsideHours =
    scheduledDate && !Number.isNaN(scheduledDate.getTime()) && isOutsideBusinessHours(scheduledDate)

  const handlePlaceOrder = async () => {
    setError(null)
    setIsProcessing(true)
    try {
      if (!deliveryInfo.scheduledAt) {
        throw new Error(locale === 'en' ? 'Missing schedule time' : 'Thiếu thời gian nhận hoa')
      }

      const address =
        fulfillmentType === 'home'
          ? [deliveryInfo.address, deliveryInfo.city, deliveryInfo.state, deliveryInfo.postalCode]
              .filter(Boolean)
              .join(', ')
          : locale === 'vi'
            ? 'Nhận tại cửa hàng'
            : 'Pickup at store'

      const scheduledAt = new Date(deliveryInfo.scheduledAt).toISOString()

      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id ?? null,
          customerEmail: deliveryInfo.email,
          customerName: `${deliveryInfo.firstName} ${deliveryInfo.lastName}`.trim(),
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            price: i.price,
            quantity: i.quantity,
          })),
          subtotal,
          deliveryCost,
          deliveryId: selectedDelivery?.id,
          deliveryAddress: address,
          deliveryPhone: deliveryInfo.phone,
          deliveryNotes: deliveryInfo.notes,
          paymentMethod: paymentInfo.method === 'payos' ? 'payos' : paymentInfo.method,
          fulfillmentType: fulfillmentType ?? 'pickup',
          scheduledAt,
          locale,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Order failed')
      }

      const data = await res.json()
      clearCart()

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl as string
        return
      }

      const qs = data.orderId ? `?orderId=${data.orderId}` : '?type=pickup'
      window.location.href = `/${locale}/order-success${qs}`
    } catch (e) {
      console.error('[review-step]', e)
      setError(
        e instanceof Error
          ? e.message
          : locale === 'en'
            ? 'Could not place order. Please try again.'
            : 'Không đặt được đơn. Vui lòng thử lại.'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const fmtSchedule = deliveryInfo.scheduledAt
    ? formatScheduledAtVietnam(deliveryInfo.scheduledAt)
    : '—'

  return (
    <div className="floral-card p-6 space-y-6 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold font-display text-rose-900">{t('checkout.review')}</h2>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3">{t('checkout.step1')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <p>
            <span className="text-gray-600">{locale === 'en' ? 'Name:' : 'Tên:'}</span>{' '}
            <span className="font-medium">
              {deliveryInfo.firstName} {deliveryInfo.lastName}
            </span>
          </p>
          <p>
            <span className="text-gray-600">{locale === 'en' ? 'When:' : 'Thời gian:'}</span>{' '}
            <span className="font-medium text-rose-600">{fmtSchedule}</span>
          </p>
          <p>
            <span className="text-gray-600">{locale === 'en' ? 'Email:' : 'Email:'}</span>{' '}
            <span className="font-medium">{deliveryInfo.email}</span>
          </p>
          <p>
            <span className="text-gray-600">{locale === 'en' ? 'Phone:' : 'Điện thoại:'}</span>{' '}
            <span className="font-medium">{deliveryInfo.phone}</span>
          </p>
        </div>
      </div>

      <div className="border-t pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">{locale === 'vi' ? 'Tạm tính' : 'Subtotal'}</span>
          <PriceDisplay amountVnd={subtotal} />
        </div>
        {deliveryCost > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">{locale === 'vi' ? 'Giao hàng' : 'Delivery'}</span>
            <PriceDisplay amountVnd={deliveryCost} />
          </div>
        )}
        {afterHoursFee > 0 && (
          <div className="flex justify-between text-amber-700">
            <span>{locale === 'vi' ? 'Phụ thu ngoài giờ (10%)' : 'After-hours surcharge (10%)'}</span>
            <span>+<PriceDisplay amountVnd={afterHoursFee} /></span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold pt-2 border-t">
          <span>{t('checkout.total')}</span>
          <span className="text-rose-500">
            <PriceDisplay amountVnd={finalTotal} />
          </span>
        </div>
        {paymentInfo.method === 'payos' && locale === 'en' && (
          <p className="text-xs text-gray-500">
            payOS charges in VND; USD shown uses PAYOS_USD_TO_VND_RATE.
          </p>
        )}
        {outsideHours && (
          <p className="text-xs text-amber-600">
            {locale === 'vi'
              ? 'Giờ nhận ngoài 8h–18h (giờ VN): phụ thu 10% đã cộng vào tổng.'
              : 'Pickup outside 8am–6pm VN time: 10% surcharge included.'}
          </p>
        )}
        {paymentInfo.method === 'payos' && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
            <p className="font-semibold">
              {locale === 'vi' ? 'Số tiền cần chuyển qua PayOS' : 'Amount to pay via PayOS'}
            </p>
            <p className="text-xl font-bold mt-1">
              <PriceDisplay amountVnd={finalTotal} />
            </p>
            <p className="text-xs text-rose-800/80 mt-1">
              {locale === 'vi'
                ? 'Vui lòng chuyển đúng số tiền trên. Chuyển thiếu (ví dụ chỉ 10.000₫) thì PayOS vẫn hiển thị chờ thanh toán.'
                : 'Transfer exactly this amount. Underpaying keeps the link pending on PayOS.'}
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-between">
        <Button variant="outline" size="lg" className="rounded-full" onClick={() => setCurrentStep(3)} disabled={isProcessing}>
          {t('checkout.back')}
        </Button>
        <Button size="lg" className="rounded-full btn-bloom" onClick={handlePlaceOrder} disabled={isProcessing}>
          {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {t('checkout.placeOrder')}
        </Button>
      </div>
    </div>
  )
}
