'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ProductCard from '@/components/product-card'
import { ShoppingCart, Heart, Share2, Star, Truck, RotateCcw } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { toast } from 'sonner'
import ProductImageGallery from '@/components/product/product-image-gallery'
import { productImageList } from '@/lib/product-images'
import PriceDisplay from '@/components/price-display'

type Product = {
  id: string
  slug: string
  name: string
  description: string
  price: number
  image_url: string
  images_urls?: string[]
  rating: number
  reviews_count: number
  stock: number
}

type Props = {
  product: Product
  relatedProducts: Product[]
  locale: string
}

export default function ProductDetail({ product, relatedProducts, locale }: Props) {
  const t = useTranslations()
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity,
      image: product.image_url,
    })
    toast.success(locale === 'en' ? `Added ${quantity} to cart!` : `Thêm ${quantity} vào giỏ hàng!`)
    setQuantity(1)
  }

  const handleShare = () => {
    console.log('[v0] Sharing product:', product.slug)
    // TODO: Implement share
  }

  const galleryImages = productImageList(product.image_url, product.images_urls)

  return (
    <div>
      <div className="w-full py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 text-sm text-gray-600">
          <Link href={`/${locale}`} className="hover:text-rose-500">
            {t('nav.home')}
          </Link>
          <span>/</span>
          <Link href={`/${locale}/shop`} className="hover:text-rose-500">
            {t('nav.shop')}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <ProductImageGallery
            images={galleryImages}
            alt={product.name}
            priority
          />

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    {Array.from({ length: Math.round(product.rating) }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({product.reviews_count} {locale === 'en' ? 'reviews' : 'đánh giá'})
                  </span>
                </div>
                {product.stock > 0 ? (
                  <span className="text-sm font-semibold text-green-600">{t('shop.inStock')}</span>
                ) : (
                  <span className="text-sm font-semibold text-red-600">{t('shop.outOfStock')}</span>
                )}
              </div>

              <p className="text-2xl font-bold text-gray-900 mb-2">
                <PriceDisplay amountVnd={product.price} />
              </p>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">{t('product.description')}</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <label className="block font-semibold">{t('product.quantity')}</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border rounded hover:bg-gray-50 transition"
                >
                  −
                </button>
                <Input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-20 text-center"
                  disabled={product.stock === 0}
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-2 border rounded hover:bg-gray-50 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="flex-1 bg-rose-500 hover:bg-rose-600"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {t('product.addToCart')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-400'
                  }`}
                />
              </Button>
              <Button variant="outline" size="lg" onClick={handleShare}>
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-rose-500 mt-1" />
                <div className="text-sm">
                  <p className="font-semibold">{locale === 'en' ? 'Fast Delivery' : 'Giao Hàng Nhanh'}</p>
                  <p className="text-gray-600">{locale === 'en' ? '24-48 hours' : '24-48 giờ'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-rose-500 mt-1" />
                <div className="text-sm">
                  <p className="font-semibold">{locale === 'en' ? 'Easy Returns' : 'Hoàn Trả Dễ Dàng'}</p>
                  <p className="text-gray-600">{locale === 'en' ? '30 days' : '30 ngày'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t pt-16">
            <h2 className="text-2xl font-bold mb-8">{t('product.relatedProducts')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
