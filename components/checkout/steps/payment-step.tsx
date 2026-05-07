'use client'

import { useTranslations } from 'next-intl'
import { useCheckout } from '@/lib/checkout-context'
import { Button } from '@/components/ui/button'
import { CreditCard, Banknote, Smartphone } from 'lucide-react'

type Props = {
  locale: string
}

export default function PaymentStep({ locale }: Props) {
  const t = useTranslations()
  const { paymentInfo, setPaymentInfo, setCurrentStep } = useCheckout()

  const paymentMethods = [
    {
      id: 'card',
      name: t('checkout.cardPayment'),
      icon: CreditCard,
      description: locale === 'en' ? 'Credit or Debit Card' : 'Thẻ Tín Dụng hoặc Ghi Nợ',
    },
    {
      id: 'bank_transfer',
      name: t('checkout.bankTransfer'),
      icon: Banknote,
      description: locale === 'en' ? 'Direct Bank Transfer' : 'Chuyển Khoản Trực Tiếp',
    },
    {
      id: 'momo',
      name: t('checkout.momo'),
      icon: Smartphone,
      description: locale === 'en' ? 'Mobile Wallet' : 'Ví Điện Tử',
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-bold">{t('checkout.step3')}</h2>
      <p className="text-gray-600 text-sm">
        {locale === 'en'
          ? 'Select your preferred payment method'
          : 'Chọn phương thức thanh toán của bạn'}
      </p>

      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon
          return (
            <button
              key={method.id}
              onClick={() => setPaymentInfo({ method: method.id as any })}
              className={`w-full p-4 border-2 rounded-lg transition text-left flex items-center gap-4 ${
                paymentInfo.method === method.id
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className="w-6 h-6 text-rose-500" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{method.name}</h3>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 ${
                paymentInfo.method === method.id
                  ? 'border-rose-500 bg-rose-500'
                  : 'border-gray-300'
              }`} />
            </button>
          )
        })}
      </div>

      {paymentInfo.method === 'bank_transfer' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            {locale === 'en'
              ? 'Bank transfer details will be provided in the next step. Please complete the payment within 24 hours.'
              : 'Chi tiết chuyển khoản sẽ được cung cấp ở bước tiếp theo. Vui lòng hoàn tất thanh toán trong 24 giờ.'}
          </p>
        </div>
      )}

      {paymentInfo.method === 'momo' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-900">
            {locale === 'en'
              ? 'You will receive a Momo payment link. Please complete the payment to confirm your order.'
              : 'Bạn sẽ nhận được liên kết thanh toán Momo. Vui lòng hoàn tất thanh toán để xác nhận đơn hàng.'}
          </p>
        </div>
      )}

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
          onClick={() => setCurrentStep(4)}
        >
          {t('checkout.continue')}
        </Button>
      </div>
    </div>
  )
}
