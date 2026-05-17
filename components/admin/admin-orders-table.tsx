'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminFetch } from '@/lib/admin/use-admin-fetch'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

type OrderRow = {
  id: string
  status: string
  payment_status: string | null
  payment_method: string | null
  subtotal: number
  delivery_cost: number
  total: number
  delivery_phone: string | null
  delivery_address: string | null
  customer_name: string | null
  scheduled_at: string | null
  prep_scheduled_at: string | null
  fulfillment_type: string | null
  created_at: string
}

function fmtShort(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-violet-100 text-violet-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-800',
}

export default function AdminOrdersTable({ locale }: { locale: string }) {
  const [rows, setRows] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<string>('all')

  const load = async () => {
    setLoading(true)
    try {
      const url = `/api/admin/orders${status !== 'all' ? `?status=${encodeURIComponent(status)}` : ''}`
      const res = await adminFetch(url)
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
      setRows((body.orders ?? []) as OrderRow[])
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load orders')
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [status])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-44">
          <Select value={status} onValueChange={(v) => setStatus(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </Button>
      </div>

      <div className="border rounded-lg bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Prep / Due</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="text-center text-gray-500 py-10">
                  No orders.
                </td>
              </tr>
            )}
            {rows.map((o) => {
              const created = new Date(o.created_at)
              return (
                <tr key={o.id} className="border-t">
                  <td className="px-4 py-2 font-mono text-xs text-gray-700">
                    {o.id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-2 text-gray-700 max-w-[140px] truncate">
                    {o.customer_name ?? '—'}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-600">
                    <span className="text-rose-600 block">⏱ {fmtShort(o.prep_scheduled_at)}</span>
                    <span className="text-gray-500">→ {fmtShort(o.scheduled_at)}</span>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-700'}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {o.payment_method ?? '—'}{' '}
                    <span className="text-xs text-gray-400">{o.payment_status ?? ''}</span>
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    ${Number(o.total).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{o.delivery_phone ?? '—'}</td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/${locale}/admin/orders/${o.id}`}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
