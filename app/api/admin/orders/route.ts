import { NextRequest, NextResponse } from 'next/server'
import { requireStaffOrAdmin } from '@/lib/admin/require-admin'

export async function GET(request: NextRequest) {
  const guard = await requireStaffOrAdmin(request)
  if (!guard.ok) return guard.response

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = Math.min(Number(searchParams.get('limit') ?? 100), 500)

    let query = guard.admin
      .from('orders')
      .select(
        'id, status, payment_status, payment_method, subtotal, delivery_cost, total, delivery_address, delivery_phone, created_at, user_id, customer_name, customer_email, fulfillment_type, scheduled_at, prep_scheduled_at'
      )
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ orders: data ?? [] })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to load orders'
    console.error('[admin/orders GET]', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
