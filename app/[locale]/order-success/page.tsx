import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ orderId?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return {
    title: locale === 'en' ? 'Order Successful | Flower Shop' : 'Đặt Hàng Thành Công | Flower Shop',
  }
}

function OrderSuccess({ locale }: { locale: string }) {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
          <Check className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold">
          {locale === 'en' ? 'Order Successful!' : 'Đặt Hàng Thành Công!'}
        </h1>

        <p className="text-gray-600 text-lg max-w-md mx-auto">
          {locale === 'en'
            ? 'Thank you for your order. We will process it shortly and you will receive a confirmation email.'
            : 'Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý nó ngay và bạn sẽ nhận được email xác nhận.'}
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
          <h2 className="font-semibold text-blue-900 mb-3">
            {locale === 'en' ? 'What happens next?' : 'Tiếp theo?'}
          </h2>
          <ul className="space-y-2 text-sm text-blue-900">
            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>
                {locale === 'en'
                  ? 'You will receive a confirmation email with your order details'
                  : 'Bạn sẽ nhận được email xác nhận với chi tiết đơn hàng'}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>
                {locale === 'en'
                  ? 'Our team will prepare your flowers with care'
                  : 'Đội của chúng tôi sẽ chuẩn bị hoa của bạn một cách cẩn thận'}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>
                {locale === 'en'
                  ? 'You will receive a tracking number via SMS'
                  : 'Bạn sẽ nhận được số theo dõi qua SMS'}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">4.</span>
              <span>
                {locale === 'en'
                  ? 'Enjoy your beautiful flowers!'
                  : 'Tận hưởng những bông hoa đẹp của bạn!'}
              </span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link href={`/${locale}`}>
            <Button size="lg" variant="outline">
              {locale === 'en' ? 'Back to Home' : 'Về Trang Chủ'}
            </Button>
          </Link>
          <Link href={`/${locale}/shop`}>
            <Button size="lg" className="bg-rose-500 hover:bg-rose-600">
              {locale === 'en' ? 'Continue Shopping' : 'Tiếp Tục Mua Hàng'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default async function OrderSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params

  return <OrderSuccess locale={locale} />
}
