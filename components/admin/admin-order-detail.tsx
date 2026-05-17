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
import { formatMoney } from '@/lib/pricing/currency'

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

type OrderItem = {
  id: string
  product_name: string
  product_price: number
  quantity: number
}

type AssignableStaff = {
  id: string
  full_name: string | null
  email: string
  role: string
}

type Assignment = {
  staff_id: string
  prep_scheduled_at: string
  user_profiles?: AssignableStaff | AssignableStaff[] | null
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
  customer_name: string | null
  customer_email: string | null
  fulfillment_type: string | null
  scheduled_at: string | null
  prep_scheduled_at: string | null
  created_at: string
  updated_at?: string | null
}

function fmtDt(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function AdminOrderDetail({ locale, orderId }: { locale: string; orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [savingStatus, setSavingStatus] = useState(false)
  const [savingStaff, setSavingStaff] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [assignableStaff, setAssignableStaff] = useState<AssignableStaff[]>([])
  const [selectedStaffId, setSelectedStaffId] = useState<string>('')

  const isAdmin = role === 'admin'
  const isVi = locale === 'vi'

  function staffLabel(p: AssignableStaff) {
    const name = p.full_name || p.email
    return p.role === 'admin' ? `${name} (admin)` : name
  }

  function assignmentStaffName(a: Assignment | null) {
    if (!a) return null
    const p = a.user_profiles
    const profile = Array.isArray(p) ? p[0] : p
    return profile?.full_name || profile?.email || null
  }

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
      setAssignment((body.assignment as Assignment | null) ?? null)
      setAssignableStaff((body.assignableStaff as AssignableStaff[]) ?? [])
      const a = body.assignment as Assignment | null
      setSelectedStaffId(a?.staff_id ?? '')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [orderId])

  const updateStaff = async (staffId: string) => {
    if (!order || !staffId) return
    setSavingStaff(true)
    try {
      const res = await adminFetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ staffId }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
      if (body.order) setOrder(body.order as Order)
      if (body.assignment) {
        setAssignment({
          staff_id: body.assignment.staff_id,
          prep_scheduled_at: body.assignment.prep_scheduled_at,
          user_profiles: body.assignment.staff_name
            ? { id: body.assignment.staff_id, full_name: body.assignment.staff_name, email: '', role: 'staff' }
            : null,
        })
        setSelectedStaffId(body.assignment.staff_id)
      }
      toast.success(isVi ? 'Đã cập nhật nhân viên phụ trách' : 'Assignee updated')
      void load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update assignee')
    } finally {
      setSavingStaff(false)
    }
  }

  const autoAssign = async () => {
    if (!order) return
    setSavingStaff(true)
    try {
      const res = await adminFetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ autoAssign: true }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`)
      toast.success(isVi ? 'Đã gán nhân viên tự động' : 'Auto-assigned staff')
      void load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Auto-assign failed')
    } finally {
      setSavingStaff(false)
    }
  }

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
                    <td className="py-2 text-right">{formatMoney(Number(it.product_price), locale)}</td>
                    <td className="py-2 text-right">
                      {formatMoney(Number(it.product_price) * it.quantity, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatMoney(Number(order.subtotal), locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span>{formatMoney(Number(order.delivery_cost), locale)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>{formatMoney(Number(order.total), locale)}</span>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-white border rounded-lg p-6 text-sm space-y-3">
            <h2 className="font-semibold mb-2">{isVi ? 'Lịch & nhân viên' : 'Schedule & staff'}</h2>
            <p>
              <span className="text-gray-500">{isVi ? 'Khách:' : 'Customer:'}</span>{' '}
              {order.customer_name || '—'}
              {order.customer_email ? (
                <span className="block text-xs text-gray-400">{order.customer_email}</span>
              ) : null}
            </p>
            <p>
              <span className="text-gray-500">{isVi ? 'Chuẩn bị:' : 'Prep at:'}</span>{' '}
              <span className="text-rose-600 font-medium">{fmtDt(order.prep_scheduled_at)}</span>
            </p>
            <p>
              <span className="text-gray-500">{isVi ? 'Giao/nhận:' : 'Pickup / delivery:'}</span>{' '}
              {fmtDt(order.scheduled_at)}
            </p>
            <p>
              <span className="text-gray-500">{isVi ? 'Hình thức:' : 'Type:'}</span>{' '}
              {order.fulfillment_type ?? '—'}
            </p>

            <div className="pt-2 border-t space-y-2">
              <p className="text-gray-500">{isVi ? 'Người phụ trách:' : 'Assigned to:'}</p>
              {assignmentStaffName(assignment) ? (
                <p className="font-medium text-rose-700">{assignmentStaffName(assignment)}</p>
              ) : (
                <p className="text-amber-600">{isVi ? 'Chưa gán' : 'Unassigned'}</p>
              )}

              {isAdmin && assignableStaff.length > 0 && (
                <div className="space-y-2 pt-1">
                  <Select
                    value={selectedStaffId || undefined}
                    onValueChange={(v) => {
                      setSelectedStaffId(v)
                      void updateStaff(v)
                    }}
                    disabled={savingStaff}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isVi ? 'Chọn nhân viên' : 'Select staff'} />
                    </SelectTrigger>
                    <SelectContent>
                      {assignableStaff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {staffLabel(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!assignment && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={savingStaff}
                      onClick={() => void autoAssign()}
                    >
                      {isVi ? 'Gán tự động' : 'Auto-assign'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </section>

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
