import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase'
import { notifyOrderEvent } from '@/lib/orders/notify-order'

/**
 * Gửi email nhắc lịch (khách: trước giờ nhận ~2h; nhân viên: trước giờ chuẩn bị ~30 phút).
 *
 * Bảo vệ bằng CRON_SECRET — chỉ ai có secret mới gọi được endpoint này.
 * Vercel Cron tự gửi header: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim()
  const auth = request.headers.get('authorization') ?? ''

  if (!secret) {
    console.warn('[cron] CRON_SECRET not set — endpoint disabled')
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 503 })
  }

  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  if (token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getSupabaseServerClient()
  const now = Date.now()
  const nowIso = new Date(now).toISOString()
  const in2h = new Date(now + 2 * 60 * 60 * 1000).toISOString()
  const in30m = new Date(now + 30 * 60 * 1000).toISOString()

  try {
    const { data: pickupOrders } = await admin
      .from('orders')
      .select('id')
      .is('reminder_sent_at', null)
      .not('scheduled_at', 'is', null)
      .gte('scheduled_at', nowIso)
      .lte('scheduled_at', in2h)
      .neq('status', 'cancelled')

    let pickupSent = 0
    for (const row of pickupOrders ?? []) {
      await notifyOrderEvent(row.id as string, 'pickup_reminder')
      await admin
        .from('orders')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', row.id)
      pickupSent++
    }

    const { data: prepRows } = await admin
      .from('order_staff_assignments')
      .select('id, order_id, staff_id, prep_scheduled_at')
      .is('prep_reminder_sent_at', null)
      .gte('prep_scheduled_at', nowIso)
      .lte('prep_scheduled_at', in30m)

    let prepSent = 0
    for (const row of prepRows ?? []) {
      const { data: profile } = await admin
        .from('user_profiles')
        .select('email')
        .eq('id', row.staff_id)
        .maybeSingle()

      const email = profile?.email
      if (!email) continue

      await notifyOrderEvent(row.order_id as string, 'prep_reminder_staff', { staffEmail: email })
      await admin
        .from('order_staff_assignments')
        .update({ prep_reminder_sent_at: new Date().toISOString() })
        .eq('id', row.id)
      prepSent++
    }

    return NextResponse.json({ ok: true, pickupSent, prepSent, ranAt: nowIso })
  } catch (e) {
    console.error('[cron/send-reminders]', e)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
