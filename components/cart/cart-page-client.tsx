'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import CartItemRow from '@/components/cart/cart-item-row'
import { ShoppingBag, ArrowRight } from 'lucide-react'

type Props = {
  locale: string
}

export function CartPageClient({ locale }: Props) {
  const t = useTranslations()
  const { items, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="w-full py-20">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t('cart.empty')}</h1>
          <p className="text-gray-600 mb-8">
            {locale === 'en'
              ? 'Your shopping cart is empty. Let\'s add some flowers!'
              : 'Giỏ hàng của bạn trống. Hãy thêm một số bông hoa!'}
          </p>
          <Link href={`/${locale}/shop`}>
            <Button size="lg" className="bg-rose-500 hover:bg-rose-600">
              {t('cart.continueShopping')}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full py-12">
      <h1 className="text-3xl font-bold mb-8">{t('cart.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="divide-y">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} locale={locale} />
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20 space-y-4">
            <h2 className="text-lg font-bold">{t('cart.orderSummary')}</h2>

            <div className="space-y-3 py-4 border-y">
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

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('cart.subtotal')}</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t('cart.delivery')}</span>
                <span>{locale === 'en' ? 'Calculated at checkout' : 'Tính toán ở thanh toán'}</span>
              </div>
            </div>

            <Link href={`/${locale}/checkout`} className="block">
              <Button size="lg" className="w-full bg-rose-500 hover:bg-rose-600">
                {t('cart.checkout')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Link href={`/${locale}/shop`} className="block">
              <Button variant="outline" size="lg" className="w-full">
                {t('cart.continueShopping')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
