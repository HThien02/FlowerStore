'use client'

import { useTranslations } from 'next-intl'
import { useCheckout } from '@/lib/checkout-context'
import { Button } from '@/components/ui/button'
import { QrCode } from 'lucide-react'

type Props = {
  locale: string
}

export default function PaymentStep({ locale }: Props) {
  const t = useTranslations()
  const { paymentInfo, setPaymentInfo, setCurrentStep } = useCheckout()

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-bold">{t('checkout.step3')}</h2>
      <p className="text-gray-600 text-sm">
        {locale === 'en'
          ? 'Pay securely via QR code or bank transfer (powered by payOS).'
          : 'Thanh toán an toàn qua mã QR hoặc chuyển khoản (payOS).'}
      </p>

      <button
        type="button"
        onClick={() => setPaymentInfo({ method: 'payos' })}
        className={`w-full p-4 border-2 rounded-lg transition text-left flex items-center gap-4 ${
          paymentInfo.method === 'payos'
            ? 'border-rose-500 bg-rose-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <QrCode className="w-6 h-6 text-rose-500 shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {locale === 'vi' ? 'QR / Chuyển khoản ngân hàng' : 'QR / Bank transfer'}
          </h3>
          <p className="text-sm text-gray-600">
            {locale === 'vi'
              ? 'Sau khi đặt hàng, bạn được chuyển sang trang thanh toán payOS (VND).'
              : 'After placing the order, you will be redirected to payOS checkout (VND).'}
          </p>
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 shrink-0 ${
            paymentInfo.method === 'payos' ? 'border-rose-500 bg-rose-500' : 'border-gray-300'
          }`}
        />
      </button>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        {locale === 'vi'
          ? 'Giá trong hệ thống là VND. Thanh toán payOS dùng đúng số VND trên đơn.'
          : 'Prices are stored in VND. USD is shown using PAYOS_USD_TO_VND_RATE from .env.'}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" size="lg" onClick={() => setCurrentStep(1)}>
          {t('checkout.back')}
        </Button>
        <Button size="lg" className="bg-rose-500 hover:bg-rose-600" onClick={() => setCurrentStep(4)}>
          {t('checkout.continue')}
        </Button>
      </div>
    </div>
  )
}
