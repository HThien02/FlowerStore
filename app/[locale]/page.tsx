import HeroSection from '@/components/home/hero-section'
import FeaturedProducts from '@/components/home/featured-products'
import CategoriesSection from '@/components/home/categories-section'
import TestimonialsSection from '@/components/home/testimonials-section'
import { getCategories, getFeaturedProducts } from '@/lib/db'
import { isSupabaseConfigured } from '@/lib/supabase'
import { toCategoryNavRow, toProductCardRow } from '@/lib/product-map'

const mockProducts = [
  { id: '1', name: 'Red Roses', price: 45, image_url: 'https://via.placeholder.com/300x400?text=Red+Roses', category_id: '1', slug: 'red-roses', featured: true, description: 'Beautiful red roses', rating: 4.5, reviews_count: 0 },
  { id: '2', name: 'Sunflowers', price: 35, image_url: 'https://via.placeholder.com/300x400?text=Sunflowers', category_id: '2', slug: 'sunflowers', featured: true, description: 'Bright sunflowers', rating: 4.8, reviews_count: 0 },
  { id: '3', name: 'White Lilies', price: 50, image_url: 'https://via.placeholder.com/300x400?text=White+Lilies', category_id: '3', slug: 'white-lilies', featured: true, description: 'Elegant lilies', rating: 4.7, reviews_count: 0 },
]

const mockCategories = [
  { id: '1', name: 'Roses', slug: 'roses' },
  { id: '2', name: 'Sunflowers', slug: 'sunflowers' },
  { id: '3', name: 'Lilies', slug: 'lilies' },
]

export default async function Home() {
  let featured = mockProducts.map((p) => toProductCardRow(p as unknown as Record<string, unknown>))
  let categories = mockCategories.map((c) => toCategoryNavRow(c as unknown as Record<string, unknown>))

  if (isSupabaseConfigured()) {
    try {
      const [featRows, catRows] = await Promise.all([
        getFeaturedProducts(),
        getCategories(),
      ])
      featured = (featRows ?? []).map((r) =>
        toProductCardRow(r as unknown as Record<string, unknown>)
      )
      if (catRows?.length) {
        categories = catRows.map((c) =>
          toCategoryNavRow(c as unknown as Record<string, unknown>)
        )
      }
    } catch (e) {
      console.error('[home] Supabase load failed, using mock data:', e)
    }
  }

  return (
    <div className="space-y-16">
      <HeroSection />
      <FeaturedProducts products={featured} />
      <CategoriesSection categories={categories} />
      <TestimonialsSection />
    </div>
  )
}
