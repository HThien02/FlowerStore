import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, requireStaffOrAdmin } from '@/lib/admin/require-admin'
import { loadAssignableProfiles } from '@/lib/scheduling/assign-prep-slot'
import {
  buildShiftDates,
  insertBulkShifts,
  minutesToTime,
  parseTimeToMinutes,
  startOfWeekMonday,
} from '@/lib/scheduling/staff-shifts'

export async function GET(request: NextRequest) {
  const guard = await requireStaffOrAdmin(request)
  if (!guard.ok) return guard.response

  const from = request.nextUrl.searchParams.get('from')
  const to = request.nextUrl.searchParams.get('to')

  try {
    const staff =
      guard.role === 'admin' ? await loadAssignableProfiles(guard.admin) : []

    let shifts: unknown[] = []
    let shiftsTableMissing = false

    let q = guard.admin
      .from('staff_work_shifts')
      .select(
        'id, staff_id, shift_date, start_minutes, end_minutes, user_profiles(id, full_name, email, role)'
      )
      .order('shift_date')
      .order('start_minutes')

    if (from) q = q.gte('shift_date', from.slice(0, 10))
    if (to) q = q.lte('shift_date', to.slice(0, 10))

    const { data, error } = await q
    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('staff_work_shifts')) {
        shiftsTableMissing = true
        console.warn('[admin/shifts GET] staff_work_shifts table missing — run scripts/setup-staff-shifts.sql')
      } else {
        throw error
      }
    } else {
      shifts = data ?? []
    }

    return NextResponse.json({
      shifts,
      staff,
      ...(shiftsTableMissing
        ? {
            warning:
              'Chưa có bảng staff_work_shifts. Chạy scripts/setup-staff-shifts.sql trên Supabase.',
          }
        : {}),
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to load shifts'
    console.error('[admin/shifts GET]', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

type BulkBody = {
  staffId: string
  startTime: string
  endTime: string
  preset?: 'this_week' | 'weekdays' | 'weekend' | 'custom'
  fromDate?: string
  toDate?: string
  dates?: string[]
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request)
  if (!guard.ok) return guard.response

  try {
    const body = (await request.json()) as BulkBody
    if (!body.staffId || !body.startTime || !body.endTime) {
      return NextResponse.json({ error: 'Missing staffId, startTime, or endTime' }, { status: 400 })
    }

    const startMinutes = parseTimeToMinutes(body.startTime)
    const endMinutes = parseTimeToMinutes(body.endTime)
    if (endMinutes <= startMinutes) {
      return NextResponse.json({ error: 'endTime must be after startTime' }, { status: 400 })
    }

    let dates: string[] = []

    if (body.preset === 'custom' && body.dates?.length) {
      dates = body.dates.map((d) => d.slice(0, 10))
    } else {
      const anchor = body.fromDate ? new Date(body.fromDate) : new Date()
      anchor.setHours(0, 0, 0, 0)

      let from = anchor
      let to = anchor

      if (body.preset === 'this_week') {
        from = startOfWeekMonday(anchor)
        to = new Date(from)
        to.setDate(to.getDate() + 6)
      } else if (body.fromDate && body.toDate) {
        from = new Date(body.fromDate)
        to = new Date(body.toDate)
        from.setHours(0, 0, 0, 0)
        to.setHours(0, 0, 0, 0)
      } else {
        to = new Date(from)
        to.setDate(to.getDate() + 6)
      }

      const weekdays =
        body.preset === 'weekdays'
          ? [1, 2, 3, 4, 5]
          : body.preset === 'weekend'
            ? [0, 6]
            : undefined

      dates = buildShiftDates({ from, to, weekdays })
    }

    if (dates.length === 0) {
      return NextResponse.json({ error: 'No dates selected' }, { status: 400 })
    }

    const { inserted } = await insertBulkShifts(guard.admin, {
      staffId: body.staffId,
      startMinutes,
      endMinutes,
      dates,
    })

    return NextResponse.json({
      ok: true,
      inserted,
      dates,
      startTime: minutesToTime(startMinutes),
      endTime: minutesToTime(endMinutes),
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to save shifts'
    console.error('[admin/shifts POST]', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const guard = await requireAdmin(request)
  if (!guard.ok) return guard.response

  const staffId = request.nextUrl.searchParams.get('staffId')
  const from = request.nextUrl.searchParams.get('from')?.slice(0, 10)
  const to = request.nextUrl.searchParams.get('to')?.slice(0, 10)

  if (!staffId || !from || !to) {
    return NextResponse.json({ error: 'staffId, from, to required' }, { status: 400 })
  }

  try {
    const { error } = await guard.admin
      .from('staff_work_shifts')
      .delete()
      .eq('staff_id', staffId)
      .gte('shift_date', from)
      .lte('shift_date', to)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to delete'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
