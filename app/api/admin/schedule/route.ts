import { NextRequest, NextResponse } from 'next/server'
import { requireStaffOrAdmin } from '@/lib/admin/require-admin'

export async function GET(request: NextRequest) {
  const guard = await requireStaffOrAdmin(request)
  if (!guard.ok) return guard.response

  const from = request.nextUrl.searchParams.get('from')
  const to = request.nextUrl.searchParams.get('to')

  try {
    let ordersQuery = guard.admin
      .from('orders')
      .select(
        'id, status, fulfillment_type, scheduled_at, prep_scheduled_at, customer_name, customer_email, total'
      )
      .order('prep_scheduled_at', { ascending: true, nullsFirst: false })

    if (from && to) {
      ordersQuery = ordersQuery.or(
        `and(prep_scheduled_at.gte.${from},prep_scheduled_at.lte.${to}),and(scheduled_at.gte.${from},scheduled_at.lte.${to})`
      )
    } else {
      if (from) ordersQuery = ordersQuery.gte('prep_scheduled_at', from)
      if (to) ordersQuery = ordersQuery.lte('prep_scheduled_at', to)
    }

    const { data: orders, error: ordersErr } = await ordersQuery
    if (ordersErr) throw ordersErr

    const { data: assignments, error: assignErr } = await guard.admin
      .from('order_staff_assignments')
      .select('order_id, staff_id, prep_scheduled_at, user_profiles(id, full_name, email)')

    if (assignErr) throw assignErr

    const { data: staff, error: staffErr } = await guard.admin
      .from('user_profiles')
      .select('id, full_name, email, role')
      .in('role', ['staff', 'admin'])
      .order('full_name')

    if (staffErr) throw staffErr

    let workShifts: unknown[] = []
    const fromDate = from?.slice(0, 10)
    const toDate = to?.slice(0, 10)
    let shiftsQuery = guard.admin
      .from('staff_work_shifts')
      .select(
        'id, staff_id, shift_date, start_minutes, end_minutes, user_profiles(id, full_name, email, role)'
      )
      .order('shift_date')
      .order('start_minutes')

    if (fromDate) shiftsQuery = shiftsQuery.gte('shift_date', fromDate)
    if (toDate) shiftsQuery = shiftsQuery.lte('shift_date', toDate)

    const { data: shiftRows, error: shiftsErr } = await shiftsQuery
    if (shiftsErr) {
      if (shiftsErr.code !== 'PGRST205' && !shiftsErr.message?.includes('staff_work_shifts')) {
        throw shiftsErr
      }
    } else {
      workShifts = shiftRows ?? []
    }

    return NextResponse.json({
      orders: orders ?? [],
      assignments: assignments ?? [],
      staff: staff ?? [],
      workShifts,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to load schedule'
    console.error('[admin/schedule]', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
