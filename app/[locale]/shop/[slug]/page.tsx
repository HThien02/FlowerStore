import { notFound } from 'next/navigation'
import ProductDetail from '@/components/product/product-detail'

// Mock products data
const mockProducts = [
  { id: '1', name: 'Red Roses Bouquet', price: 45, image_url: 'https://via.placeholder.com/300x400?text=Red+Roses', category_id: '1', slug: 'red-roses-bouquet', featured: true, description: 'Beautiful red roses for special occasions', rating: 4.5, created_at: '2026-05-01' },
  { id: '2', name: 'Sunflower Bundle', price: 35, image_url: 'https://via.placeholder.com/300x400?text=Sunflowers', category_id: '2', slug: 'sunflower-bundle', featured: true, description: 'Bright sunflowers to brighten your day', rating: 4.8, created_at: '2026-05-01' },
  { id: '3', name: 'White Lilies', price: 50, image_url: 'https://via.placeholder.com/300x400?text=White+Lilies', category_id: '3', slug: 'white-lilies', featured: true, description: 'Elegant white lilies for elegance', rating: 4.7, created_at: '2026-05-01' },
  { id: '4', name: 'Tulip Mix', price: 40, image_url: 'https://via.placeholder.com/300x400?text=Tulips', category_id: '4', slug: 'tulip-mix', featured: false, description: 'Colorful tulip arrangement', rating: 4.6, created_at: '2026-05-01' },
  { id: '5', name: 'Lavender Dreams', price: 38, image_url: 'https://via.placeholder.com/300x400?text=Lavender', category_id: '5', slug: 'lavender-dreams', featured: false, description: 'Fragrant lavender bouquet', rating: 4.9, created_at: '2026-05-01' },
  { id: '6', name: 'Daisy Delight', price: 30, image_url: 'https://via.placeholder.com/300x400?text=Daisies', category_id: '6', slug: 'daisy-delight', featured: false, description: 'Fresh daisy arrangement', rating: 4.4, created_at: '2026-05-01' },
]

type Props = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const product = mockProducts.find(p => p.slug === slug)
  
  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The product you are looking for does not exist.',
    }
  }

  return {
    title: `${product.name} | Flower Shop`,
    description: product.description,
  }
}

export async function generateStaticParams() {
  return mockProducts.map((product) => ({
    slug: product.slug,
  }))
}

export default async function ProductPage({ params }: Props) {
  const { slug, locale } = await params
  const product = mockProducts.find(p => p.slug === slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = mockProducts.filter((p) => p.id !== product.id).slice(0, 3)

  return (
    <ProductDetail
      product={product}
      relatedProducts={relatedProducts}
      locale={locale}
    />
  )
}
