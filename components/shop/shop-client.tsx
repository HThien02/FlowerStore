'use client'

import { useState, useMemo, useEffect } from 'react'
import { useTranslations } from 'next-intl'
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
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 9

type Product = {
  id: string
  slug: string
  name: string
  price: number
  image_url: string
  rating: number
  reviews_count: number
  category_id?: string
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
  const [page, setPage] = useState(1)

  const filteredAndSortedProducts = useMemo(() => {
    let products = initialProducts

    if (searchQuery) {
      products = products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory) {
      const cat = categories.find((c) => c.slug === selectedCategory)
      if (cat) {
        products = products.filter((p) => p.category_id === cat.id)
      }
    }

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
  }, [initialProducts, searchQuery, sortBy, selectedCategory, categories])

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedProducts.length / PAGE_SIZE))

  const pageProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredAndSortedProducts.slice(start, start + PAGE_SIZE)
  }, [filteredAndSortedProducts, page])

  useEffect(() => {
    setPage(1)
  }, [searchQuery, sortBy, selectedCategory])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const goToPage = (next: number) => {
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSortBy('newest')
    setPage(1)
  }

  const from = filteredAndSortedProducts.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const to = Math.min(page * PAGE_SIZE, filteredAndSortedProducts.length)

  return (
    <div className="w-full py-10 pb-8">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-rose-950">
          {t('shop.title')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {filteredAndSortedProducts.length === 0
            ? locale === 'en'
              ? 'No products'
              : 'Không có sản phẩm'
            : locale === 'en'
              ? `Showing ${from}–${to} of ${filteredAndSortedProducts.length} · ${PAGE_SIZE} per page`
              : `${from}–${to} / ${filteredAndSortedProducts.length} sản phẩm · ${PAGE_SIZE}/trang`}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-8 items-start">
        <aside className="lg:sticky lg:top-20">
          <div className="floral-card p-5 space-y-5">
            <div>
              <h3 className="font-semibold mb-2 text-rose-900 text-sm">{t('common.search')}</h3>
              <div className="relative">
                <Input
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl h-9 text-sm"
                />
                <Search className="absolute left-3 top-2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {categories.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-rose-900 text-sm">{t('shop.categories')}</h3>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('')}
                    className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${
                      !selectedCategory
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-rose-50'
                    }`}
                  >
                    {locale === 'en' ? 'All' : 'Tất cả'}
                  </button>
                  {categories.map((category) => (
                    <button
                      type="button"
                      key={category.id}
                      onClick={() => setSelectedCategory(category.slug)}
                      className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${
                        selectedCategory === category.slug
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-rose-50'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2 text-rose-900 text-sm">{t('shop.sort')}</h3>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="rounded-xl h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t('shop.newest')}</SelectItem>
                  <SelectItem value="price-low">
                    {locale === 'en' ? 'Price ↑' : 'Giá ↑'}
                  </SelectItem>
                  <SelectItem value="price-high">
                    {locale === 'en' ? 'Price ↓' : 'Giá ↓'}
                  </SelectItem>
                  <SelectItem value="rating">{t('shop.rating')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(searchQuery || selectedCategory || sortBy !== 'newest') && (
              <Button variant="outline" size="sm" className="w-full rounded-full" onClick={clearFilters}>
                {locale === 'en' ? 'Clear' : 'Xóa lọc'}
              </Button>
            )}
          </div>
        </aside>

        <div className="min-w-0 space-y-8">
          {pageProducts.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 list-none p-0 m-0">
              {pageProducts.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-20 text-center floral-card border-dashed">
              <span className="text-5xl mb-4 block opacity-50">🌸</span>
              <p className="text-muted-foreground">{t('shop.noResults')}</p>
              <Button variant="outline" size="sm" className="mt-4 rounded-full" onClick={clearFilters}>
                {locale === 'en' ? 'Clear filters' : 'Xóa bộ lọc'}
              </Button>
            </div>
          )}

          {filteredAndSortedProducts.length > PAGE_SIZE && (
            <nav
              className="flex items-center justify-center gap-4 pt-2"
              aria-label={locale === 'en' ? 'Pagination' : 'Phân trang'}
            >
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-1"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                {locale === 'en' ? 'Prev' : 'Trước'}
              </Button>
              <span className="text-sm text-muted-foreground tabular-nums">
                {locale === 'en' ? `Page ${page} / ${totalPages}` : `Trang ${page} / ${totalPages}`}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-1"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
              >
                {locale === 'en' ? 'Next' : 'Sau'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}
