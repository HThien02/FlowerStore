'use client'

import { useLocale } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
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
  const hasImage = product.image_url && !product.image_url.startsWith('emoji:')

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      image: product.image_url,
    })
    toast.success(locale === 'en' ? 'Added to cart! 🌸' : 'Đã thêm vào giỏ! 🌸')
  }

  return (
    <article className="floral-card overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <Link href={`/${locale}/shop/${product.slug}`}>
        <div className="relative h-52 bg-gradient-to-br from-rose-100 via-pink-50 to-amber-50 flex items-center justify-center overflow-hidden">
          {hasImage ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width:768px) 100vw, 33vw"
            />
          ) : (
            <span className="text-6xl float-gentle group-hover:scale-110 transition-transform">🌹</span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              setIsWishlisted(!isWishlisted)
            }}
            className="absolute top-3 right-3 p-2.5 bg-white/90 rounded-full shadow-sm hover:scale-110 transition z-10"
            aria-label="Wishlist"
          >
            <Heart
              className={`w-5 h-5 transition ${
                isWishlisted ? 'fill-primary text-primary' : 'text-gray-400'
              }`}
            />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/${locale}/shop/${product.slug}`}>
          <h3 className="font-semibold font-display text-rose-950 hover:text-primary transition line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-3 text-sm">
            <span className="text-amber-400">★</span>
            <span className="text-muted-foreground">({product.reviews_count})</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary font-display">${product.price.toFixed(2)}</span>
          <Button size="sm" className="rounded-full btn-bloom" onClick={handleAddToCart}>
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </article>
  )
}
