'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

type Props = {
  orderId: string
  locale: string
}

export default function OrderSuccessPayosStatus({ orderId, locale }: Props) {
  const [status, setStatus] = useState<'pending' | 'completed' | 'unknown'>('pending')

  useEffect(() => {
    let cancelled = false
    let attempts = 0

    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/payment-status?sync=1`)
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        if (data.payment_status === 'completed') {
          setStatus('completed')
          return
        }
      } catch {
        /* ignore */
      }
      attempts += 1
      if (attempts < 12 && !cancelled) {
        setTimeout(poll, 2500)
      } else if (!cancelled) {
        setStatus('unknown')
      }
    }

    void poll()
    return () => {
      cancelled = true
    }
  }, [orderId])

  if (status === 'completed') {
    return (
      <p className="text-sm text-green-700 font-medium">
        {locale === 'vi' ? 'Thanh toán đã được xác nhận.' : 'Payment confirmed.'}
      </p>
    )
  }

  if (status === 'unknown') {
    return (
      <p className="text-sm text-amber-700">
        {locale === 'vi'
          ? 'Nếu đã thanh toán, đơn sẽ được cập nhật trong vài phút. Liên hệ cửa hàng nếu cần.'
          : 'If you paid, your order will update shortly. Contact us if needed.'}
      </p>
    )
  }

  return (
    <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      {locale === 'vi' ? 'Đang xác nhận thanh toán…' : 'Confirming payment…'}
    </p>
  )
}
