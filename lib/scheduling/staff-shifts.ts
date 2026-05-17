import type { SupabaseClient } from '@supabase/supabase-js'

export function parseTimeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) throw new Error('Invalid time')
  return h * 60 + m
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function dateKey(d: Date): string {
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${da}`
}

/** Ai đang trong ca tại thời điểm `at` (theo ngày + phút). */
export async function loadStaffIdsOnShift(
  admin: SupabaseClient,
  at: Date
): Promise<Set<string>> {
  const shiftDate = dateKey(at)
  const minutes = at.getHours() * 60 + at.getMinutes()

  const { data } = await admin
    .from('staff_work_shifts')
    .select('staff_id')
    .eq('shift_date', shiftDate)
    .lte('start_minutes', minutes)
    .gt('end_minutes', minutes)

  return new Set((data ?? []).map((r) => r.staff_id as string))
}

export type BulkShiftInput = {
  staffId: string
  startMinutes: number
  endMinutes: number
  dates: string[]
}

export async function insertBulkShifts(
  admin: SupabaseClient,
  input: BulkShiftInput
): Promise<{ inserted: number }> {
  if (input.dates.length === 0) return { inserted: 0 }

  const rows = input.dates.map((shift_date) => ({
    staff_id: input.staffId,
    shift_date,
    start_minutes: input.startMinutes,
    end_minutes: input.endMinutes,
  }))

  await admin
    .from('staff_work_shifts')
    .delete()
    .eq('staff_id', input.staffId)
    .in('shift_date', input.dates)

  const { error } = await admin.from('staff_work_shifts').insert(rows)
  if (error) throw error

  return { inserted: rows.length }
}

/** Sinh danh sách ngày từ preset. */
export function buildShiftDates(opts: {
  from: Date
  to: Date
  weekdays?: number[]
}): string[] {
  const out: string[] = []
  const cur = new Date(opts.from)
  cur.setHours(0, 0, 0, 0)
  const end = new Date(opts.to)
  end.setHours(0, 0, 0, 0)

  while (cur <= end) {
    if (!opts.weekdays || opts.weekdays.includes(cur.getDay())) {
      out.push(dateKey(cur))
    }
    cur.setDate(cur.getDate() + 1)
  }
  return out
}

export function startOfWeekMonday(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const day = x.getDay()
  const diff = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + diff)
  return x
}

export function endOfWeekSunday(monday: Date): Date {
  const x = new Date(monday)
  x.setDate(x.getDate() + 6)
  x.setHours(23, 59, 59, 999)
  return x
}

/** 7 ngày T2→CN (dateKey). */
export function weekDateKeys(weekStartMonday: Date): string[] {
  const keys: string[] = []
  const cur = new Date(weekStartMonday)
  cur.setHours(0, 0, 0, 0)
  for (let i = 0; i < 7; i++) {
    keys.push(dateKey(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return keys
}

export function staffOnShiftAtHour(
  shifts: { staff_id: string; shift_date: string; start_minutes: number; end_minutes: number }[],
  shiftDate: string,
  hour: number
): { staff_id: string }[] {
  const start = hour * 60
  const end = start + 60
  return shifts.filter(
    (s) =>
      s.shift_date === shiftDate &&
      s.start_minutes < end &&
      s.end_minutes > start
  )
}
