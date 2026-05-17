'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminFetch } from '@/lib/admin/use-admin-fetch'
import AdminDayCalendar, { type CalendarEvent } from '@/components/admin/admin-day-calendar'
import { Loader2 } from 'lucide-react'

type Assignment = {
  order_id: string
  staff_id: string
  user_profiles?: { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null
}

type OrderRow = {
  id: string
  status: string
  scheduled_at: string | null
  prep_scheduled_at: string | null
  customer_name: string | null
}

function staffName(a: Assignment): string | null {
  const p = a.user_profiles
  if (!p) return null
  const profile = Array.isArray(p) ? p[0] : p
  return profile?.full_name || profile?.email || null
}

/** Lịch việc hôm nay trên trang Orders */
export default function AdminOrdersCalendar({ locale }: { locale: string }) {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const from = new Date()
      from.setHours(0, 0, 0, 0)
      const to = new Date(from)
      to.setHours(23, 59, 59, 999)

      const res = await adminFetch(
        `/api/admin/schedule?from=${from.toISOString()}&to=${to.toISOString()}`
      )
      if (!res.ok) return
      const data = await res.json()
      setOrders(data.orders ?? [])
      setAssignments(data.assignments ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const events: CalendarEvent[] = useMemo(() => {
    const staffMap = new Map(assignments.map((a) => [a.order_id, staffName(a)]))
    return orders.map((o) => ({
      orderId: o.id,
      customerName: o.customer_name,
      status: o.status,
      staffName: staffMap.get(o.id) ?? null,
      prepAt: o.prep_scheduled_at,
      dueAt: o.scheduled_at,
    }))
  }, [orders, assignments])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
      </div>
    )
  }

  return <AdminDayCalendar locale={locale} events={events} />
}
