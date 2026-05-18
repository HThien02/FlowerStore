import type { SupabaseClient } from '@supabase/supabase-js'

export type PayosOrderRow = {
  id: string
  payment_status: string | null
  total: number
}

/** Parse VQRIO123456 or VQRIO123 → numeric PayOS order code. */
export function parsePayosOrderCodeFromDescription(description?: string | null): number | null {
  if (!description?.trim()) return null
  const m = description.trim().match(/VQRIO(\d{1,6})/i)
  if (!m) return null
  const code = Number(m[1])
  return Number.isFinite(code) ? code : null
}

/**
 * Find order for PayOS webhook / return using orderCode, paymentLinkId, or CK description.
 */
export async function findOrderForPayosEvent(
  admin: SupabaseClient,
  opts: {
    orderCode?: number | string | null
    paymentLinkId?: string | null
    description?: string | null
  }
): Promise<PayosOrderRow | null> {
  const codes = new Set<number>()

  const rawCode = opts.orderCode
  if (rawCode != null && rawCode !== '') {
    const n = Number(rawCode)
    if (Number.isFinite(n)) codes.add(n)
  }

  const fromDesc = parsePayosOrderCodeFromDescription(opts.description)
  if (fromDesc != null) codes.add(fromDesc)

  for (const code of codes) {
    const { data, error } = await admin
      .from('orders')
      .select('id, payment_status, total')
      .eq('payos_order_code', code)
      .maybeSingle()
    if (error) throw error
    if (data) return data as PayosOrderRow
  }

  const linkId = opts.paymentLinkId?.trim()
  if (linkId) {
    const { data, error } = await admin
      .from('orders')
      .select('id, payment_status, total')
      .eq('payos_payment_link_id', linkId)
      .maybeSingle()
    if (error) throw error
    if (data) return data as PayosOrderRow
  }

  return null
}
