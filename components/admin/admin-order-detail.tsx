'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminFetch } from '@/lib/admin/use-admin-fetch'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

type OrderItem = {
  id: string
  product_name: string
  product_price: number
  quantity: number
}

type Order = {
  id: string
  status: string
  payment_status: string | null
  payment_method: string | null
  subtotal: number
  delivery_cost: number
  total: number
  delivery_address: string | null
  delivery_phone: string | null
  delivery_notes: string | null
  user_id: string | null
  created_at: string
  updated_at?: string | null
}

export default function AdminOrderDetail({ locale, orderId }: { locale: string; orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [savingStatus, setSavingStatus] = useState(false)
  const [role, setRole] = useState<string | null>(null)

  const isAdmin = role === 'admin'

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const uid = session?.user?.id
      if (!uid) return
      const { data } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', uid)
        .maybeSingle()
      setRole(((data as { role?: string } | null)?.role) ?? null)
    }
    fetchRole()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminFetch(`/api/admin/orders/${orderId}`)
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
      setOrder(body.order as Order)
      setItems((body.items ?? []) as OrderItem[])
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [orderId])

  const updateStatus = async (next: string) => {
    if (!order) return
    setSavingStatus(true)
    try {
      const res = await adminFetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
      setOrder(body.order as Order)
      toast.success('Status updated')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update')
    } finally {
      setSavingStatus(false)
    }
  }

  if (loading) return <p className="text-gray-500">Loading…</p>
  if (!order) return <p className="text-gray-500">Order not found.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/${locale}/admin/orders`}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to orders
          </Link>
          <h1 className="text-2xl font-bold mt-2">Order {order.id.slice(0, 8)}…</h1>
          <p className="text-sm text-gray-500">
            Created {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <div className="w-44">
              <Select value={order.status} onValueChange={updateStatus} disabled={savingStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <span className="text-sm px-3 py-1.5 rounded-full bg-gray-100 text-gray-700">
              Status: {order.status}
            </span>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border rounded-lg p-6">
            <h2 className="font-semibold mb-4">Items</h2>
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500">
                <tr>
                  <th className="py-2">Product</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Line</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="py-2">{it.product_name}</td>
                    <td className="py-2 text-center">{it.quantity}</td>
                    <td className="py-2 text-right">${Number(it.product_price).toFixed(2)}</td>
                    <td className="py-2 text-right">
                      ${(Number(it.product_price) * it.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span>${Number(order.delivery_cost).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-white border rounded-lg p-6 text-sm space-y-2">
            <h2 className="font-semibold mb-2">Delivery</h2>
            <p>
              <span className="text-gray-500">Address:</span>{' '}
              {order.delivery_address || '—'}
            </p>
            <p>
              <span className="text-gray-500">Phone:</span> {order.delivery_phone || '—'}
            </p>
            {order.delivery_notes && (
              <p>
                <span className="text-gray-500">Notes:</span> {order.delivery_notes}
              </p>
            )}
          </section>

          <section className="bg-white border rounded-lg p-6 text-sm space-y-2">
            <h2 className="font-semibold mb-2">Payment</h2>
            <p>
              <span className="text-gray-500">Method:</span> {order.payment_method || '—'}
            </p>
            <p>
              <span className="text-gray-500">Status:</span> {order.payment_status || '—'}
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}
