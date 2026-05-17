'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  orderId: string
  locale: string
}

export default function OrderSuccessPayosStatus({ orderId, locale }: Props) {
  const [status, setStatus] = useState<'pending' | 'completed' | 'unknown' | 'underpaid'>(
    'pending'
  )

  const [payosHint, setPayosHint] = useState<string | null>(null)

  const checkPayment = useCallback(async () => {
    const res = await fetch(`/api/orders/${orderId}/payment-status?sync=1`)
    if (!res.ok) return false
    const data = await res.json()
    if (data.payment_status === 'completed') {
      setStatus('completed')
      setPayosHint(null)
      return true
    }
    const ps = String(data.payos_status ?? '').toUpperCase()
    const paid = Number(data.amountPaid ?? data.amount_paid ?? 0)
    const remaining = Number(data.amountRemaining ?? data.amount_remaining ?? 0)
    if (ps === 'UNDERPAID' || ps === 'UNDER_PAY' || (paid > 0 && remaining > 0)) {
      setStatus('underpaid')
      setPayosHint(null)
      return true
    }
    if (ps === 'PENDING' && paid === 0 && Number(data.amount) > 0) {
      setPayosHint(
        locale === 'vi'
          ? 'PayOS chưa ghi nhận tiền (tiền thanh toán = 0). Cần quét QR / đúng nội dung CK trên link PayOS.'
          : 'PayOS shows amount paid = 0. Use QR or exact transfer content from the PayOS page.'
      )
    }
    return false
  }, [orderId, locale])

  useEffect(() => {
    let cancelled = false
    let attempts = 0

    const poll = async () => {
      try {
        const done = await checkPayment()
        if (cancelled || done) return
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
  }, [orderId, checkPayment])

  if (status === 'completed') {
    return (
      <p className="text-sm text-green-700 font-medium">
        {locale === 'vi' ? 'Thanh toán đã được xác nhận.' : 'Payment confirmed.'}
      </p>
    )
  }

  if (status === 'underpaid') {
    return (
      <p className="text-sm text-amber-700">
        {locale === 'vi'
          ? 'PayOS ghi nhận chuyển thiếu so với số tiền trên link. Vui lòng chuyển bổ sung đúng phần còn thiếu trên trang PayOS hoặc đặt đơn mới.'
          : 'PayOS shows an underpayment. Complete the remaining amount on PayOS or place a new order.'}
      </p>
    )
  }

  if (status === 'unknown') {
    return (
      <div className="space-y-3 flex flex-col items-center">
        {payosHint && <p className="text-sm text-amber-800 max-w-md">{payosHint}</p>}
        <p className="text-sm text-amber-700">
          {locale === 'vi'
            ? 'Chưa thấy xác nhận từ PayOS. Nếu đã chuyển tiền, bấm nút bên dưới hoặc đợi vài phút (webhook).'
            : 'Payment not confirmed yet. If you already paid, tap below or wait a moment.'}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={async () => {
            setStatus('pending')
            try {
              const done = await checkPayment()
              if (!done) setStatus('unknown')
            } catch {
              setStatus('unknown')
            }
          }}
        >
          {locale === 'vi' ? 'Tôi đã thanh toán — kiểm tra lại' : 'I paid — check again'}
        </Button>
      </div>
    )
  }

  return (
    <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      {locale === 'vi' ? 'Đang xác nhận thanh toán…' : 'Confirming payment…'}
    </p>
  )
}
