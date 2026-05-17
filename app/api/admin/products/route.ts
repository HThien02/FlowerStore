import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/require-admin'

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request)
  if (!guard.ok) return guard.response

  try {
    const body = await request.json()
    const { name, name_vi, slug, description, description_vi, category_id, price, image_url, images_urls, stock, featured } = body

    if (!name || !slug || price == null || !image_url || !category_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await guard.admin
      .from('products')
      .insert({
        name,
        name_vi: name_vi ?? name,
        slug,
        description: description ?? null,
        description_vi: description_vi ?? null,
        category_id,
        price: Number(price),
        image_url,
        images_urls: images_urls ?? null,
        stock: Number(stock ?? 0),
        featured: Boolean(featured ?? false),
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ product: data })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to create'
    console.error('[admin/products POST]', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
