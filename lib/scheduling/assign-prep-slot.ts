import type { SupabaseClient } from '@supabase/supabase-js'
import { dateKey, loadStaffIdsOnShift } from '@/lib/scheduling/staff-shifts'
import { SLOT_STEP_MS, slotKey } from '@/lib/scheduling/calendar-slots'

export const PREP_LEAD_MS = 60 * 60 * 1000
const MAX_SLOT_SHIFTS = 48

export type PrepAssignment = {
  prepAt: Date
  staffId: string | null
  staffName: string | null
}

type ProfileRow = {
  id: string
  full_name: string | null
  email: string
  role: string
}

function displayName(p: ProfileRow): string {
  return p.full_name || p.email || p.id.slice(0, 8)
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function markSlot(map: Map<string, Set<number>>, staffId: string, at: Date) {
  if (!map.has(staffId)) map.set(staffId, new Set())
  map.get(staffId)!.add(slotKey(at))
}

/**
 * Lịch bận theo nhân viên: cả giờ chuẩn bị VÀ giờ giao/nhận.
 * Giao 14:30 vẫn chiếm slot → không gán prep trùng 14:30 cho đơn khác.
 */
export async function loadStaffOccupiedSlots(
  admin: SupabaseClient,
  excludeOrderId?: string
): Promise<Map<string, Set<number>>> {
  let query = admin
    .from('order_staff_assignments')
    .select('staff_id, order_id, prep_scheduled_at, orders(scheduled_at)')
  if (excludeOrderId) query = query.neq('order_id', excludeOrderId)

  const { data } = await query
  const map = new Map<string, Set<number>>()

  for (const row of data ?? []) {
    const sid = row.staff_id as string
    if (row.prep_scheduled_at) {
      markSlot(map, sid, new Date(row.prep_scheduled_at as string))
    }
    const order = row.orders as { scheduled_at?: string } | { scheduled_at?: string }[] | null
    const scheduledAt = Array.isArray(order) ? order[0]?.scheduled_at : order?.scheduled_at
    if (scheduledAt) {
      markSlot(map, sid, new Date(scheduledAt))
    }
  }

  return map
}

export function isStaffFreeAt(
  occupied: Map<string, Set<number>>,
  staffId: string,
  prepAt: Date
): boolean {
  return !occupied.get(staffId)?.has(slotKey(prepAt))
}

/** Staff trước; không có staff thì dùng admin. */
export async function loadAssigneePool(admin: SupabaseClient): Promise<ProfileRow[]> {
  const { data: staff } = await admin
    .from('user_profiles')
    .select('id, full_name, email, role')
    .eq('role', 'staff')
    .order('created_at', { ascending: true })

  if (staff && staff.length > 0) return staff as ProfileRow[]

  const { data: admins } = await admin
    .from('user_profiles')
    .select('id, full_name, email, role')
    .eq('role', 'admin')
    .order('created_at', { ascending: true })

  return (admins ?? []) as ProfileRow[]
}

/** Danh sách có thể gán thủ công (staff + admin). */
export async function loadAssignableProfiles(admin: SupabaseClient): Promise<ProfileRow[]> {
  const { data, error } = await admin
    .from('user_profiles')
    .select('id, full_name, email, role')
    .in('role', ['staff', 'admin'])
    .order('full_name', { ascending: true })

  if (error) {
    console.error('[loadAssignableProfiles]', error)
    throw error
  }

  return (data ?? []) as ProfileRow[]
}

/**
 * Chọn slot prep trống trên lịch cá nhân:
 * - Nhiều staff → random trong số người rảnh ở slot đó
 * - 1 staff → người đó (dời slot +30p nếu trùng)
 * - Không staff → random admin rảnh
 */
export async function pickStaffAndPrepSlot(
  admin: SupabaseClient,
  scheduledAt: Date,
  excludeOrderId?: string
): Promise<{ prepAt: Date; staff: ProfileRow } | null> {
  const pool = await loadAssigneePool(admin)
  if (pool.length === 0) return null

  const occupied = await loadStaffOccupiedSlots(admin, excludeOrderId)
  for (const p of pool) {
    if (!occupied.has(p.id)) occupied.set(p.id, new Set())
  }

  let prepAt = new Date(scheduledAt.getTime() - PREP_LEAD_MS)

  const { count: shiftCount } = await admin
    .from('staff_work_shifts')
    .select('*', { count: 'exact', head: true })
    .eq('shift_date', dateKey(prepAt))

  const hasShiftsForDay = (shiftCount ?? 0) > 0

  for (let shift = 0; shift < MAX_SLOT_SHIFTS; shift++) {
    const onShift = await loadStaffIdsOnShift(admin, prepAt)
    let slotPool = pool
    if (hasShiftsForDay) {
      const onDuty = pool.filter((p) => onShift.has(p.id))
      if (onDuty.length > 0) slotPool = onDuty
    }

    const available = slotPool.filter((p) => isStaffFreeAt(occupied, p.id, prepAt))

    if (available.length > 0) {
      const staff =
        slotPool.length === 1 ? slotPool[0] : pickRandom(available)
      return { prepAt, staff }
    }

    prepAt = new Date(prepAt.getTime() + SLOT_STEP_MS)
  }

  const staff = pool.length === 1 ? pool[0] : pickRandom(pool)
  return { prepAt, staff }
}

async function persistAssignment(
  admin: SupabaseClient,
  orderId: string,
  scheduledAt: Date,
  prepAt: Date,
  staff: ProfileRow
): Promise<PrepAssignment> {
  await admin
    .from('orders')
    .update({
      scheduled_at: scheduledAt.toISOString(),
      prep_scheduled_at: prepAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  await admin.from('order_staff_assignments').delete().eq('order_id', orderId)

  await admin.from('order_staff_assignments').insert({
    order_id: orderId,
    staff_id: staff.id,
    prep_scheduled_at: prepAt.toISOString(),
  })

  return {
    prepAt,
    staffId: staff.id,
    staffName: displayName(staff),
  }
}

/** Gán lịch prep khi tạo đơn mới. */
export async function assignOrderPrepSchedule(
  admin: SupabaseClient,
  orderId: string,
  scheduledAt: Date
): Promise<PrepAssignment> {
  const picked = await pickStaffAndPrepSlot(admin, scheduledAt, orderId)

  if (!picked) {
    const prepAt = new Date(scheduledAt.getTime() - PREP_LEAD_MS)
    await admin
      .from('orders')
      .update({
        scheduled_at: scheduledAt.toISOString(),
        prep_scheduled_at: prepAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
    await admin.from('order_staff_assignments').delete().eq('order_id', orderId)
    return { prepAt, staffId: null, staffName: null }
  }

  return persistAssignment(admin, orderId, scheduledAt, picked.prepAt, picked.staff)
}

/** Admin đổi người phụ trách — tìm slot trống trên lịch người đó. */
export async function reassignOrderStaff(
  admin: SupabaseClient,
  orderId: string,
  staffId: string
): Promise<PrepAssignment> {
  const { data: profile, error: profileErr } = await admin
    .from('user_profiles')
    .select('id, full_name, email, role')
    .eq('id', staffId)
    .maybeSingle()

  if (profileErr || !profile) throw new Error('Staff member not found')
  const role = profile.role as string
  if (role !== 'staff' && role !== 'admin') {
    throw new Error('User cannot be assigned to orders')
  }

  const staff = profile as ProfileRow

  const { data: order, error: orderErr } = await admin
    .from('orders')
    .select('scheduled_at, prep_scheduled_at')
    .eq('id', orderId)
    .single()

  if (orderErr || !order?.scheduled_at) throw new Error('Order not found or missing schedule')

  const scheduledAt = new Date(order.scheduled_at as string)
  let prepAt = order.prep_scheduled_at
    ? new Date(order.prep_scheduled_at as string)
    : new Date(scheduledAt.getTime() - PREP_LEAD_MS)

  const occupied = await loadStaffOccupiedSlots(admin, orderId)
  if (!occupied.has(staffId)) occupied.set(staffId, new Set())

  if (!isStaffFreeAt(occupied, staffId, prepAt)) {
    let found = false
    for (let shift = 0; shift < MAX_SLOT_SHIFTS; shift++) {
      if (isStaffFreeAt(occupied, staffId, prepAt)) {
        found = true
        break
      }
      prepAt = new Date(prepAt.getTime() + SLOT_STEP_MS)
    }
    if (!found) {
      throw new Error('No free slot on this staff calendar in the next 24 hours')
    }
  }

  return persistAssignment(admin, orderId, scheduledAt, prepAt, staff)
}
