import { Suspense } from 'react'
import ShopClient from '@/components/shop/shop-client'

export const dynamic = 'force-dynamic'

// Mock products data for testing
const mockProducts = [
  { id: '1', name: 'Red Roses Bouquet', price: 45, image_url: 'https://via.placeholder.com/300x400?text=Red+Roses', category_id: '1', slug: 'red-roses-bouquet', featured: true, description: 'Beautiful red roses', rating: 4.5, created_at: '2026-05-01' },
  { id: '2', name: 'Sunflower Bundle', price: 35, image_url: 'https://via.placeholder.com/300x400?text=Sunflowers', category_id: '2', slug: 'sunflower-bundle', featured: true, description: 'Bright sunflowers', rating: 4.8, created_at: '2026-05-01' },
  { id: '3', name: 'White Lilies', price: 50, image_url: 'https://via.placeholder.com/300x400?text=White+Lilies', category_id: '3', slug: 'white-lilies', featured: true, description: 'Elegant lilies', rating: 4.7, created_at: '2026-05-01' },
  { id: '4', name: 'Tulip Mix', price: 40, image_url: 'https://via.placeholder.com/300x400?text=Tulips', category_id: '4', slug: 'tulip-mix', featured: false, description: 'Colorful tulips', rating: 4.6, created_at: '2026-05-01' },
  { id: '5', name: 'Lavender Dreams', price: 38, image_url: 'https://via.placeholder.com/300x400?text=Lavender', category_id: '5', slug: 'lavender-dreams', featured: false, description: 'Fragrant lavender', rating: 4.9, created_at: '2026-05-01' },
  { id: '6', name: 'Daisy Delight', price: 30, image_url: 'https://via.placeholder.com/300x400?text=Daisies', category_id: '6', slug: 'daisy-delight', featured: false, description: 'Fresh daisies', rating: 4.4, created_at: '2026-05-01' },
]

const mockCategories = [
  { id: '1', name: 'Roses', slug: 'roses', created_at: '2026-05-01' },
  { id: '2', name: 'Sunflowers', slug: 'sunflowers', created_at: '2026-05-01' },
  { id: '3', name: 'Lilies', slug: 'lilies', created_at: '2026-05-01' },
  { id: '4', name: 'Tulips', slug: 'tulips', created_at: '2026-05-01' },
  { id: '5', name: 'Lavender', slug: 'lavender', created_at: '2026-05-01' },
  { id: '6', name: 'Daisies', slug: 'daisies', created_at: '2026-05-01' },
]

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    category?: string
    sort?: string
    search?: string
  }>
}

async function ShopContent({ params, searchParams }: Props) {
  const { locale } = await params
  const { category, sort, search } = await searchParams

  // Filter products based on category
  let filteredProducts = mockProducts
  if (category) {
    filteredProducts = mockProducts.filter(p => p.category_id === category)
  }

  return (
    <ShopClient
      initialProducts={filteredProducts}
      categories={mockCategories}
      initialCategory={category}
      initialSort={sort}
      locale={locale}
    />
  )
}

export default async function ShopPage(props: Props) {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
      <ShopContent {...props} />
    </Suspense>
  )
}
