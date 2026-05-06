'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShoppingBag } from 'lucide-react'

type Props = {
  orders: any[]
  locale: string
}

export default function AccountOrders({ orders, locale }: Props) {
  const t = useTranslations()

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('orders.orderHistory')}</h3>
        <p className="text-gray-600 mb-6">
          {locale === 'en' ? 'You haven&apos;t placed any orders yet.' : 'Bạn chưa đặt đơn hàng nào.'}
        </p>
        <Link href={`/${locale}/shop`}>
          <Button className="bg-rose-500 hover:bg-rose-600">
            {t('cart.continueShopping')}
          </Button>
        </Link>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: t('orders.pending'),
      processing: t('orders.processing'),
      shipped: t('orders.shipped'),
      delivered: t('orders.delivered'),
      cancelled: t('orders.cancelled'),
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">{t('orders.orderNumber')}</p>
              <p className="font-mono font-semibold">{order.id.slice(0, 8)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">{t('orders.date')}</p>
              <p className="font-semibold">
                {new Date(order.created_at).toLocaleDateString(
                  locale === 'en' ? 'en-US' : 'vi-VN'
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">{t('orders.status')}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-600">{t('checkout.total')}</p>
              <p className="text-xl font-bold text-rose-500">
                ${order.total.toFixed(2)}
              </p>
            </div>
          </div>

          {order.order_items && order.order_items.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-2">
                {locale === 'en' ? 'Items' : 'Sản Phẩm'} ({order.order_items.length})
              </p>
              <div className="space-y-1">
                {order.order_items.map((item: any) => (
                  <p key={item.id} className="text-sm text-gray-600">
                    {item.product_name} × {item.quantity}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
