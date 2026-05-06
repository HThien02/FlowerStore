'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useCheckout } from '@/lib/checkout-context'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

type Props = {
  locale: string
}

export default function ReviewStep({ locale }: Props) {
  const t = useTranslations()
  const { deliveryInfo, selectedDelivery, paymentInfo, setCurrentStep } = useCheckout()
  const { items, total, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)

  const subtotal = total
  const deliveryCost = selectedDelivery?.basePrice || 0
  const finalTotal = subtotal + deliveryCost

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    try {
      // TODO: Create order in database and integrate with payment
      console.log('[v0] Placing order:', {
        deliveryInfo,
        selectedDelivery,
        paymentInfo,
        items,
        total: finalTotal,
      })

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Clear cart and redirect to success page
      clearCart()
      window.location.href = `/${locale}/order-success`
    } catch (error) {
      console.error('[v0] Error placing order:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-bold">{t('checkout.review')}</h2>

      {/* Delivery Info */}
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
            <span className="text-gray-600">{locale === 'en' ? 'Email:' : 'Email:'}</span>{' '}
            <span className="font-medium">{deliveryInfo.email}</span>
          </p>
          <p>
            <span className="text-gray-600">{locale === 'en' ? 'Phone:' : 'Điện thoại:'}</span>{' '}
            <span className="font-medium">{deliveryInfo.phone}</span>
          </p>
          <p>
            <span className="text-gray-600">{locale === 'en' ? 'City:' : 'Thành phố:'}</span>{' '}
            <span className="font-medium">{deliveryInfo.city}</span>
          </p>
          <p className="sm:col-span-2">
            <span className="text-gray-600">{locale === 'en' ? 'Address:' : 'Địa chỉ:'}</span>{' '}
            <span className="font-medium">{deliveryInfo.address}</span>
          </p>
        </div>
      </div>

      {/* Delivery Method */}
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2">{t('checkout.step2')}</h3>
        <p className="text-sm">
          <span className="text-gray-600">{locale === 'en' ? 'Method:' : 'Phương thức:'}</span>{' '}
          <span className="font-medium">{selectedDelivery?.name}</span>
        </p>
        <p className="text-sm">
          <span className="text-gray-600">{locale === 'en' ? 'Estimated:' : 'Ước tính:'}</span>{' '}
          <span className="font-medium">
            {selectedDelivery?.estimatedDays} {locale === 'en' ? 'days' : 'ngày'}
          </span>
        </p>
      </div>

      {/* Payment Method */}
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2">{t('checkout.step3')}</h3>
        <p className="text-sm">
          <span className="text-gray-600">{locale === 'en' ? 'Method:' : 'Phương thức:'}</span>{' '}
          <span className="font-medium">
            {paymentInfo.method === 'card'
              ? t('checkout.cardPayment')
              : paymentInfo.method === 'bank_transfer'
              ? t('checkout.bankTransfer')
              : t('checkout.momo')}
          </span>
        </p>
      </div>

      {/* Order Items */}
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3">{locale === 'en' ? 'Items' : 'Sản Phẩm'}</h3>
        <div className="space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="text-gray-600">
                {item.productName} × {item.quantity}
              </span>
              <span className="font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('checkout.subtotal')}</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('checkout.delivery')}</span>
          <span className="font-medium">${deliveryCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span>{t('checkout.total')}</span>
          <span className="text-rose-500">${finalTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          {locale === 'en'
            ? 'By placing this order, you agree to our Terms of Service and Privacy Policy.'
            : 'Bằng cách đặt đơn hàng này, bạn đồng ý với Điều Khoản Dịch Vụ và Chính Sách Bảo Mật của chúng tôi.'}
        </p>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setCurrentStep(3)}
          disabled={isProcessing}
        >
          {t('checkout.back')}
        </Button>
        <Button
          size="lg"
          className="bg-rose-500 hover:bg-rose-600"
          onClick={handlePlaceOrder}
          disabled={isProcessing}
        >
          {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {t('checkout.placeOrder')}
        </Button>
      </div>
    </div>
  )
}
