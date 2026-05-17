import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/require-admin'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const guard = await requireAdmin(request)
  if (!guard.ok) return guard.response

  const { id } = await params
  try {
    const body = await request.json()
    const allowed: Record<string, unknown> = {}
    for (const key of [
      'name',
      'name_vi',
      'slug',
      'description',
      'description_vi',
      'category_id',
      'price',
      'image_url',
      'images_urls',
      'stock',
      'featured',
    ]) {
      if (key in body) allowed[key] = body[key]
    }
    if ('price' in allowed) allowed.price = Number(allowed.price)
    if ('stock' in allowed) allowed.stock = Number(allowed.stock)
    if ('featured' in allowed) allowed.featured = Boolean(allowed.featured)
    allowed.updated_at = new Date().toISOString()

    const { data, error } = await guard.admin
      .from('products')
      .update(allowed)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ product: data })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to update'
    console.error('[admin/products PATCH]', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const guard = await requireAdmin(request)
  if (!guard.ok) return guard.response

  const { id } = await params
  try {
    const { error } = await guard.admin.from('products').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to delete'
    console.error('[admin/products DELETE]', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
