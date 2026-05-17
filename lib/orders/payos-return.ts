import type { SupabaseClient } from '@supabase/supabase-js'

/** Tìm đơn từ orderId (UUID) hoặc orderCode PayOS (số). */
export async function resolveOrderIdForPayosReturn(
  admin: SupabaseClient,
  opts: { orderId?: string | null; orderCode?: string | null }
): Promise<string | null> {
  const orderId = opts.orderId?.trim()
  if (orderId) {
    const { data } = await admin.from('orders').select('id').eq('id', orderId).maybeSingle()
    if (data?.id) return data.id as string
  }

  const raw = opts.orderCode?.trim()
  if (!raw) return null
  const code = Number(raw)
  if (!Number.isFinite(code)) return null

  const { data } = await admin
    .from('orders')
    .select('id')
    .eq('payos_order_code', code)
    .maybeSingle()

  return (data?.id as string) ?? null
}
