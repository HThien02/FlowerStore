'use client'

import { useCart, CartItem } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import PriceDisplay from '@/components/price-display'

type Props = {
  item: CartItem
  locale: string
}

export default function CartItemRow({ item, locale }: Props) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <div className="p-4 sm:p-6 flex gap-4 items-start">
      {/* Image */}
      <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-100 rounded flex items-center justify-center flex-shrink-0">
        <span className="text-4xl">🌹</span>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 mb-2">{item.productName}</h3>
        <p className="text-lg font-bold text-gray-900 mb-4">
          <PriceDisplay amountVnd={item.price} /> {locale === 'en' ? 'each' : '/ sp'}
        </p>

        {/* Quantity and Price */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              className="px-3 py-1 border rounded hover:bg-gray-50 transition"
            >
              −
            </button>
            <Input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value)
                if (val > 0) updateQuantity(item.productId, val)
              }}
              className="w-16 text-center py-1 h-auto"
            />
            <button
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="px-3 py-1 border rounded hover:bg-gray-50 transition"
            >
              +
            </button>
          </div>

          <div className="flex-1 text-right">
            <p className="text-sm text-gray-600 mb-1">
              {locale === 'en' ? 'Subtotal' : 'Tổng'}
            </p>
            <p className="text-lg font-bold">
              <PriceDisplay amountVnd={item.price * item.quantity} />
            </p>
          </div>

          <button
            onClick={() => removeItem(item.productId)}
            className="p-2 text-gray-400 hover:text-red-500 transition flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
