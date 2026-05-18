import type { SupabaseClient } from '@supabase/supabase-js'
import { findOrderForPayosEvent } from '@/lib/orders/payos-lookup'

/** Tìm đơn từ orderId (UUID) hoặc orderCode PayOS (số). */
export async function resolveOrderIdForPayosReturn(
  admin: SupabaseClient,
  opts: {
    orderId?: string | null
    orderCode?: string | null
    description?: string | null
  }
): Promise<string | null> {
  const orderId = opts.orderId?.trim()
  if (orderId) {
    const { data } = await admin.from('orders').select('id').eq('id', orderId).maybeSingle()
    if (data?.id) return data.id as string
  }

  const order = await findOrderForPayosEvent(admin, {
    orderCode: opts.orderCode,
    description: opts.description,
  })
  return order?.id ?? null
}
