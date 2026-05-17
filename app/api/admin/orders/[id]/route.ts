import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, requireStaffOrAdmin } from '@/lib/admin/require-admin'
import { notifyOrderEvent } from '@/lib/orders/notify-order'
import {
  assignOrderPrepSchedule,
  loadAssignableProfiles,
  reassignOrderStaff,
} from '@/lib/scheduling/assign-prep-slot'

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

    const { data: assignment } = await guard.admin
      .from('order_staff_assignments')
      .select('staff_id, prep_scheduled_at, user_profiles(id, full_name, email, role)')
      .eq('order_id', id)
      .maybeSingle()

    const assignableStaff =
      guard.role === 'admin' ? await loadAssignableProfiles(guard.admin) : []

    return NextResponse.json({
      order,
      items: items ?? [],
      assignment: assignment ?? null,
      assignableStaff,
    })
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

    const { data: existing, error: fetchErr } = await guard.admin
      .from('orders')
      .select('status')
      .eq('id', id)
      .single()
    if (fetchErr) throw fetchErr
    const previousStatus = existing?.status as string | undefined

    if (typeof body.staffId === 'string') {
      const assignment = await reassignOrderStaff(guard.admin, id, body.staffId)
      const { data: order } = await guard.admin.from('orders').select('*').eq('id', id).single()
      return NextResponse.json({
        order,
        assignment: {
          staff_id: assignment.staffId,
          prep_scheduled_at: assignment.prepAt.toISOString(),
          staff_name: assignment.staffName,
        },
      })
    }

    if (body.autoAssign === true) {
      const { data: orderRow } = await guard.admin
        .from('orders')
        .select('scheduled_at')
        .eq('id', id)
        .single()
      if (!orderRow?.scheduled_at) {
        return NextResponse.json({ error: 'Order has no scheduled time' }, { status: 400 })
      }
      const assignment = await assignOrderPrepSchedule(
        guard.admin,
        id,
        new Date(orderRow.scheduled_at as string)
      )
      const { data: order } = await guard.admin.from('orders').select('*').eq('id', id).single()
      return NextResponse.json({
        order,
        assignment: {
          staff_id: assignment.staffId,
          prep_scheduled_at: assignment.prepAt.toISOString(),
          staff_name: assignment.staffName,
        },
      })
    }

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

    const locale =
      request.headers.get('accept-language')?.toLowerCase().includes('vi') ? 'vi' : 'en'

    if (body.status === 'cancelled') {
      void notifyOrderEvent(id, 'cancelled', { locale }).catch((e) =>
        console.error('[admin/orders/:id] cancel email', e)
      )
    } else if (
      typeof body.status === 'string' &&
      previousStatus &&
      body.status !== previousStatus
    ) {
      void notifyOrderEvent(id, 'status_updated', {
        locale,
        previousStatus,
        newStatus: body.status,
      }).catch((e) => console.error('[admin/orders/:id] status email', e))
    }

    return NextResponse.json({ order: data })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to update'
    console.error('[admin/orders/:id PATCH]', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
