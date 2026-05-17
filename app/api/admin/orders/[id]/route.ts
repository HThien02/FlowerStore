import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, requireStaffOrAdmin } from '@/lib/admin/require-admin'

type Params = { params: Promise<{ id: string }> }

const ALLOWED_STATUS = new Set(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])

export async function GET(request: NextRequest, { params }: Params) {
  const guard = await requireStaffOrAdmin(request)
  if (!guard.ok) return guard.response

  const { id } = await params

  try {
    const { data: order, error } = await guard.admin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error

    const { data: items } = await guard.admin
      .from('order_items')
      .select('*')
      .eq('order_id', id)

    return NextResponse.json({ order, items: items ?? [] })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to load order'
    console.error('[admin/orders/:id GET]', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const guard = await requireAdmin(request)
  if (!guard.ok) return guard.response

  const { id } = await params

  try {
    const body = await request.json()
    const update: Record<string, unknown> = {}
    if (typeof body.status === 'string') {
      if (!ALLOWED_STATUS.has(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      update.status = body.status
    }
    if (typeof body.payment_status === 'string') {
      update.payment_status = body.payment_status
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }
    update.updated_at = new Date().toISOString()

    const { data, error } = await guard.admin
      .from('orders')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ order: data })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to update'
    console.error('[admin/orders/:id PATCH]', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
