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
    <div className="group relative">
      <div className="bg-card rounded-2xl overflow-hidden border-2 border-border hover:border-primary/50 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
        {/* Image */}
        <Link href={`/${locale}/shop/${product.slug}`}>
          <div className="relative h-56 bg-gradient-to-br from-muted via-accent/10 to-primary/5 flex items-center justify-center overflow-hidden cursor-pointer">
            <span className="text-7xl group-hover:scale-125 transition-transform duration-300 drop-shadow-lg">🌹</span>
            
            {/* Wishlist Button */}
            <button
              onClick={(e) => {
                e.preventDefault()
                setIsWishlisted(!isWishlisted)
                toast.success(
                  isWishlisted
                    ? locale === 'en' ? 'Removed from wishlist' : 'Xoá khỏi danh sách yêu thích'
                    : locale === 'en' ? 'Added to wishlist' : 'Thêm vào danh sách yêu thích'
                )
              }}
              className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200"
            >
              <Heart
                className={`w-6 h-6 transition-colors ${
                  isWishlisted ? 'fill-primary text-primary' : 'text-foreground/40'
                }`}
              />
            </button>
          </div>
        </Link>

        {/* Content */}
        <div className="p-5 space-y-3">
          <Link href={`/${locale}/shop/${product.slug}`}>
            <h3 className="font-bold text-foreground hover:text-primary transition-colors line-clamp-2 mb-1 text-base">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-lg ${i < Math.round(product.rating) ? 'text-accent' : 'text-muted-foreground/30'}`}>
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-medium">({product.reviews_count})</span>
            </div>
          )}

          {/* Price and Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ${product.price.toFixed(2)}
            </span>
            <Button
              size="sm"
              className="bg-primary hover:bg-secondary text-primary-foreground font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              {locale === 'en' ? 'Add' : 'Thêm'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
