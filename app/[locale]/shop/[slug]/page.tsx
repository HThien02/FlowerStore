import { notFound } from 'next/navigation'
import type { PostgrestError } from '@supabase/supabase-js'
import ProductDetail from '@/components/product/product-detail'
import { getProductBySlug, getProducts } from '@/lib/db'
import { isSupabaseConfigured } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

type ProductRow = {
  id: string
  slug: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  rating?: number | null
  reviews_count?: number | null
  stock?: number | null
  category_id?: string | null
  images_urls?: string[] | null
}

function toDetailProduct(p: ProductRow) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description ?? '',
    price: p.price,
    image_url: p.image_url ?? '',
    rating: p.rating ?? 0,
    reviews_count: p.reviews_count ?? 0,
    stock: p.stock ?? 0,
    images_urls: p.images_urls ?? undefined,
  }
}

function toCardProduct(p: ProductRow) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    image_url: p.image_url ?? '',
    rating: p.rating ?? 0,
    reviews_count: p.reviews_count ?? 0,
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params

  if (!isSupabaseConfigured()) {
    return { title: 'Product | Flower Shop' }
  }

  try {
    const product = (await getProductBySlug(slug)) as ProductRow
    return {
      title: `${product.name} | Flower Shop`,
      description: product.description ?? undefined,
    }
  } catch {
    return {
      title: 'Product Not Found',
      description: 'The product you are looking for does not exist.',
    }
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug, locale } = await params

  if (!isSupabaseConfigured()) {
    notFound()
  }

  let row: ProductRow
  try {
    row = (await getProductBySlug(slug)) as ProductRow
  } catch (e) {
    const err = e as PostgrestError
    if (err?.code === 'PGRST116') {
      notFound()
    }
    console.error('[shop/[slug]]', e)
    throw e
  }

  const product = toDetailProduct(row)

  let relatedRaw: ProductRow[] = []
  try {
    const list = (await getProducts(row.category_id ?? undefined)) as ProductRow[]
    relatedRaw = list.filter((p) => p.id !== row.id).slice(0, 3)
  } catch {
    relatedRaw = []
  }

  const relatedProducts = relatedRaw.map(toCardProduct)

  return (
    <ProductDetail
      product={product}
      relatedProducts={relatedProducts}
      locale={locale}
    />
  )
}
