'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ProductCard from '@/components/product-card'
import { Search, Filter } from 'lucide-react'

type Product = {
  id: string
  slug: string
  name: string
  price: number
  image_url: string
  rating: number
  reviews_count: number
}

type Category = {
  id: string
  slug: string
  name: string
}

type Props = {
  initialProducts: Product[]
  categories: Category[]
  initialCategory?: string
  initialSort?: string
  locale: string
}

export default function ShopClient({
  initialProducts,
  categories,
  initialCategory,
  initialSort,
  locale,
}: Props) {
  const t = useTranslations()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState(initialSort || 'newest')
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '')

  const filteredAndSortedProducts = useMemo(() => {
    let products = initialProducts

    // Filter by search
    if (searchQuery) {
      products = products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory) {
      // TODO: Filter by category once category_id is available in products
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        return [...products].sort((a, b) => a.price - b.price)
      case 'price-high':
        return [...products].sort((a, b) => b.price - a.price)
      case 'rating':
        return [...products].sort((a, b) => b.rating - a.rating)
      case 'newest':
      default:
        return products
    }
  }, [initialProducts, searchQuery, sortBy, selectedCategory])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t('shop.title')}</h1>
        <p className="text-gray-600">
          {locale === 'en'
            ? `Showing ${filteredAndSortedProducts.length} products`
            : `Hiển thị ${filteredAndSortedProducts.length} sản phẩm`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Search */}
            <div>
              <h3 className="font-semibold mb-3">{t('common.search')}</h3>
              <div className="relative">
                <Input
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">{t('shop.categories')}</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`block w-full text-left px-3 py-2 rounded transition ${
                      !selectedCategory
                        ? 'bg-rose-500 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {locale === 'en' ? 'All Products' : 'Tất Cả Sản Phẩm'}
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.slug)}
                      className={`block w-full text-left px-3 py-2 rounded transition ${
                        selectedCategory === category.slug
                          ? 'bg-rose-500 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sort */}
            <div>
              <h3 className="font-semibold mb-3">{t('shop.sort')}</h3>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t('shop.newest')}</SelectItem>
                  <SelectItem value="price-low">
                    {locale === 'en' ? 'Price: Low to High' : 'Giá: Thấp đến Cao'}
                  </SelectItem>
                  <SelectItem value="price-high">
                    {locale === 'en' ? 'Price: High to Low' : 'Giá: Cao đến Thấp'}
                  </SelectItem>
                  <SelectItem value="rating">{t('shop.rating')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-600">{t('shop.noResults')}</p>
              <Link href={`/${locale}/shop`}>
                <Button variant="outline" className="mt-4">
                  {locale === 'en' ? 'Clear Filters' : 'Xóa Bộ Lọc'}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
