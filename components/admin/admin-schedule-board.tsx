'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminFetch } from '@/lib/admin/use-admin-fetch'
import { Loader2, CalendarHeart, User, Clock } from 'lucide-react'
import AdminDayCalendar, { type CalendarEvent } from '@/components/admin/admin-day-calendar'
import { minutesToTime } from '@/lib/scheduling/staff-shifts'

type StaffRow = { id: string; full_name: string | null; email: string; role: string }

type WorkShift = {
  id: string
  staff_id: string
  shift_date: string
  start_minutes: number
  end_minutes: number
  user_profiles?: { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null
}

type Assignment = {
  order_id: string
  staff_id: string
  prep_scheduled_at: string
  user_profiles?: { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null
}

type OrderRow = {
  id: string
  status: string
  fulfillment_type: string
  scheduled_at: string | null
  prep_scheduled_at: string | null
  customer_name: string | null
  total: number
}

function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
}

function fmtShiftDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function profileName(
  p: { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null | undefined
) {
  if (!p) return null
  const profile = Array.isArray(p) ? p[0] : p
  return profile?.full_name || profile?.email || null
}

function staffNameFromAssignment(a: Assignment): string | null {
  return profileName(a.user_profiles)
}

export default function AdminScheduleBoard({ locale }: { locale: string }) {
  const isVi = locale === 'vi'
  const [loading, setLoading] = useState(true)
  const [staff, setStaff] = useState<StaffRow[]>([])
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const from = new Date()
      from.setHours(0, 0, 0, 0)
      const to = new Date(from)
      to.setDate(to.getDate() + 14)

      const res = await adminFetch(
        `/api/admin/schedule?from=${from.toISOString()}&to=${to.toISOString()}`
      )
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setStaff(data.staff ?? [])
      setOrders(data.orders ?? [])
      setAssignments(data.assignments ?? [])
      setWorkShifts(data.workShifts ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const staffByOrder = useMemo(() => {
    const m = new Map<string, string | null>()
    for (const a of assignments) {
      m.set(a.order_id, staffNameFromAssignment(a))
    }
    return m
  }, [assignments])

  const calendarEvents: CalendarEvent[] = useMemo(
    () =>
      orders.map((o) => ({
        orderId: o.id,
        customerName: o.customer_name,
        status: o.status,
        staffName: staffByOrder.get(o.id) ?? null,
        prepAt: o.prep_scheduled_at,
        dueAt: o.scheduled_at,
      })),
    [orders, staffByOrder]
  )

  const shiftsByStaff = useMemo(() => {
    const m = new Map<string, WorkShift[]>()
    for (const s of staff) m.set(s.id, [])
    for (const sh of workShifts) {
      if (m.has(sh.staff_id)) m.get(sh.staff_id)!.push(sh)
    }
    for (const [, list] of m) {
      list.sort((a, b) => a.shift_date.localeCompare(b.shift_date) || a.start_minutes - b.start_minutes)
    }
    return m
  }, [staff, workShifts])

  const ordersByStaff = useMemo(() => {
    const m = new Map<string, OrderRow[]>()
    for (const s of staff) m.set(s.id, [])
    const unassigned: OrderRow[] = []
    for (const o of orders) {
      const a = assignments.find((x) => x.order_id === o.id)
      if (a && m.has(a.staff_id)) {
        m.get(a.staff_id)!.push(o)
      } else {
        unassigned.push(o)
      }
    }
    return { m, unassigned }
  }, [staff, orders, assignments])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
      </div>
    )
  }

  return (
    <div className="space-y-8 min-w-0">
      <div className="flex items-center gap-3">
        <CalendarHeart className="w-8 h-8 text-rose-500 shrink-0" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isVi ? 'Lịch chuẩn bị & nhân sự' : 'Prep schedule & staff'}
          </h1>
          <p className="text-sm text-gray-500">
            {isVi
              ? 'Lịch đơn theo giờ + ca làm & đơn được gán từng nhân viên.'
              : 'Order calendar plus work shifts and assigned orders per staff.'}
          </p>
        </div>
      </div>

      <AdminDayCalendar locale={locale} events={calendarEvents} />

      {staff.length === 0 ? (
        <p className="text-gray-500 text-sm rounded-2xl border bg-white p-6">
          {isVi
            ? 'Chưa có nhân viên (role staff/admin). Vào Team để gán role.'
            : 'No staff yet. Assign staff/admin roles in Team.'}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 min-w-0">
          {staff.map((member) => {
            const shiftList = shiftsByStaff.get(member.id) ?? []
            const orderList = ordersByStaff.m.get(member.id) ?? []
            return (
              <section
                key={member.id}
                className="rounded-2xl border border-rose-100 bg-white shadow-sm overflow-hidden min-w-0"
              >
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-4 py-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-rose-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{member.full_name || member.email}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                </div>

                <div className="p-3 border-b bg-emerald-50/40">
                  <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1 mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    {isVi ? 'Ca làm (14 ngày tới)' : 'Work shifts (next 14 days)'}
                  </p>
                  {shiftList.length === 0 ? (
                    <p className="text-xs text-gray-400">
                      {isVi ? 'Chưa có ca làm — gán tại Shifts.' : 'No work shifts — assign in Shifts.'}
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {shiftList.map((sh) => (
                        <li key={sh.id} className="text-xs text-gray-700">
                          <span className="font-medium text-emerald-700">{fmtShiftDate(sh.shift_date)}</span>
                          {' · '}
                          <span className="text-emerald-600">
                            {minutesToTime(sh.start_minutes)}–{minutesToTime(sh.end_minutes)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="p-3">
                  <p className="text-xs font-semibold text-rose-800 mb-2">
                    {isVi ? 'Đơn được gán' : 'Assigned orders'}
                  </p>
                  <ul className="space-y-1 max-h-48 overflow-y-auto">
                    {orderList.length === 0 ? (
                      <li className="text-xs text-gray-400">
                        {isVi ? 'Chưa có đơn trong khoảng ngày.' : 'No orders in date range.'}
                      </li>
                    ) : (
                      orderList.map((o) => (
                        <li
                          key={o.id}
                          className="p-2 text-sm hover:bg-rose-50/50 rounded-lg border border-transparent hover:border-rose-100"
                        >
                          <p className="font-medium truncate text-xs">
                            #{o.id.slice(0, 8)} · {o.customer_name}
                          </p>
                          <p className="text-rose-600 text-[11px] mt-0.5">
                            {isVi ? 'CB' : 'Prep'}: {fmt(o.prep_scheduled_at)}
                          </p>
                          <p className="text-gray-500 text-[11px]">
                            {isVi ? 'GN' : 'Due'}: {fmt(o.scheduled_at)}
                          </p>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </section>
            )
          })}
        </div>
      )}

      {ordersByStaff.unassigned.length > 0 && (
        <div className="rounded-2xl border bg-amber-50 p-4 text-sm">
          <p className="font-semibold mb-2">{isVi ? 'Chưa gán nhân viên' : 'Unassigned orders'}</p>
          {ordersByStaff.unassigned.map((o) => (
            <p key={o.id}>
              #{o.id.slice(0, 8)} — {fmt(o.prep_scheduled_at)}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
