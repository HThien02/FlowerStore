/** Normalize DB rows for ProductCard / FeaturedProducts (client components). */
export type ProductCardRow = {
  id: string
  slug: string
  name: string
  price: number
  image_url: string
  rating: number
  reviews_count: number
  category_id?: string | null
}

export function toProductCardRow(row: Record<string, unknown>): ProductCardRow {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    price: Number(row.price),
    image_url: row.image_url != null ? String(row.image_url) : '',
    rating: row.rating != null ? Number(row.rating) : 0,
    reviews_count: row.reviews_count != null ? Number(row.reviews_count) : 0,
    category_id:
      row.category_id != null && row.category_id !== ''
        ? String(row.category_id)
        : undefined,
  }
}

export function toCategoryNavRow(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
  }
}
