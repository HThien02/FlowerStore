'use client'

import { useLocale } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Heart } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/lib/cart-context'
import { toast } from 'sonner'

type ProductCardProps = {
  product: {
    id: string
    slug: string
    name: string
    price: number
    image_url: string
    rating: number
    reviews_count: number
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const locale = useLocale()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      image: product.image_url,
    })
    toast.success(locale === 'en' ? 'Added to cart!' : 'Thêm vào giỏ hàng thành công!')
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition group">
      {/* Image */}
      <Link href={`/${locale}/shop/${product.slug}`}>
        <div className="relative h-48 bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center overflow-hidden cursor-pointer">
          <span className="text-6xl group-hover:scale-110 transition">🌹</span>
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsWishlisted(!isWishlisted)
            }}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition"
          >
            <Heart
              className={`w-5 h-5 transition ${
                isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-400'
              }`}
            />
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/${locale}/shop/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 hover:text-rose-500 transition line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex gap-0.5">
              {Array.from({ length: Math.round(product.rating) }).map((_, i) => (
                <span key={i} className="text-yellow-400">
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-500">({product.reviews_count})</span>
          </div>
        )}

        {/* Price and Button */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          <Button
            size="sm"
            className="bg-rose-500 hover:bg-rose-600"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
