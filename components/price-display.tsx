'use client'

import { useLocale } from 'next-intl'
import { formatMoney } from '@/lib/pricing/currency'

type Props = {
  amountVnd: number
  className?: string
}

/** Hiển thị giá: vi → VND, en → USD (theo PAYOS_USD_TO_VND_RATE). amountVnd = giá trong DB. */
export default function PriceDisplay({ amountVnd, className }: Props) {
  const locale = useLocale()
  return <span className={className}>{formatMoney(amountVnd, locale)}</span>
}
