'use client'

import { useLocale } from 'next-intl'
import Link from 'next/link'

type Category = {
  id: string
  slug: string
  name: string
  image_url?: string
}

export default function CategoriesSection({ categories }: { categories: Category[] }) {
  const locale = useLocale()

  return (
    <div className="bg-gray-50 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {locale === 'en' ? 'Shop by Category' : 'Mua Theo Danh Mục'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/${locale}/shop?category=${category.slug}`}>
              <div className="group cursor-pointer">
                <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition mb-4 h-48 flex items-center justify-center bg-gradient-to-br from-rose-100 to-pink-100">
                  <span className="text-6xl">🌸</span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-rose-500 transition">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
