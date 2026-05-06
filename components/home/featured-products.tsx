'use client'

import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import ProductCard from '@/components/product-card'

type Product = {
  id: string
  slug: string
  name: string
  price: number
  image_url: string
  rating: number
  reviews_count: number
}

export default function FeaturedProducts({ products }: { products: Product[] }) {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <div className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('home.featured')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {locale === 'en'
              ? 'Check out our hand-picked selection of the most beautiful and fresh flowers'
              : 'Xem qua bộ sưu tập những bông hoa tươi đẹp nhất của chúng tôi'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href={`/${locale}/shop`} className="text-rose-500 font-semibold hover:text-rose-600 transition">
            {locale === 'en' ? 'View All Products →' : 'Xem Tất Cả Sản Phẩm →'}
          </Link>
        </div>
      </div>
    </div>
  )
}
