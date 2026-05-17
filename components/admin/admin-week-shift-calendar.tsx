'use client'

import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { dateKey, minutesToTime, startOfWeekMonday, weekDateKeys } from '@/lib/scheduling/staff-shifts'
import { BUSINESS_HOUR_END, BUSINESS_HOUR_START } from '@/lib/pricing/business-hours'

export type WeekShiftRow = {
  id: string
  staff_id: string
  shift_date: string
  start_minutes: number
  end_minutes: number
  staff_name?: string | null
}

const HOURS = 24
const MINUTES_PER_DAY = HOURS * 60

type PlacedShift = WeekShiftRow & {
  staff_name: string
  top: number
  height: number
  lane: number
  laneCount: number
}

function staffLabel(
  staff: { id: string; full_name: string | null; email: string }[],
  staffId: string
) {
  const p = staff.find((s) => s.id === staffId)
  return p?.full_name || p?.email || staffId.slice(0, 8)
}

/** % theo cả ngày 24h — 08:00 = đúng hàng 08, không lệch. */
function minuteTopPct(minutes: number): number {
  return (minutes / MINUTES_PER_DAY) * 100
}

function minuteHeightPct(start: number, end: number): number {
  const s = Math.max(0, Math.min(start, MINUTES_PER_DAY))
  const e = Math.max(0, Math.min(end, MINUTES_PER_DAY))
  if (e <= s) return 0
  return ((e - s) / MINUTES_PER_DAY) * 100
}

function placeShiftsForDay(shifts: (WeekShiftRow & { staff_name: string })[]): PlacedShift[] {
  const sorted = [...shifts].sort((a, b) => a.start_minutes - b.start_minutes)
  const lanes: { end: number }[] = []
  const placed: PlacedShift[] = []

  for (const sh of sorted) {
    const s = sh.start_minutes
    const e = sh.end_minutes
    if (e <= s || s >= MINUTES_PER_DAY) continue

    let lane = lanes.findIndex((l) => l.end <= s)
    if (lane === -1) {
      lane = lanes.length
      lanes.push({ end: e })
    } else {
      lanes[lane].end = e
    }

    placed.push({
      ...sh,
      top: minuteTopPct(s),
      height: minuteHeightPct(s, e),
      lane,
      laneCount: 1,
    })
  }

  const laneCount = Math.max(1, lanes.length)
  return placed.map((p) => ({ ...p, laneCount }))
}

export default function AdminWeekShiftCalendar({
  locale,
  weekStart,
  onWeekStartChange,
  shifts,
  staff,
}: {
  locale: string
  weekStart: Date
  onWeekStartChange: (d: Date) => void
  shifts: WeekShiftRow[]
  staff: { id: string; full_name: string | null; email: string }[]
}) {
  const isVi = locale === 'vi'
  const hours = useMemo(() => Array.from({ length: HOURS }, (_, i) => i), [])
  const dayKeys = useMemo(() => weekDateKeys(weekStart), [weekStart])

  const shiftsWithNames = useMemo(
    () =>
      shifts.map((s) => ({
        ...s,
        staff_name: s.staff_name ?? staffLabel(staff, s.staff_id),
      })),
    [shifts, staff]
  )

  const weekLabel = (() => {
    const end = new Date(weekStart)
    end.setDate(end.getDate() + 6)
    const fmt = (d: Date) =>
      d.toLocaleDateString(isVi ? 'vi-VN' : 'en-US', { day: 'numeric', month: 'short' })
    return `${fmt(weekStart)} – ${fmt(end)}`
  })()

  const shiftWeek = (delta: number) => {
    const n = new Date(weekStart)
    n.setDate(n.getDate() + delta * 7)
    onWeekStartChange(startOfWeekMonday(n))
  }

  const dayHeaders = dayKeys.map((key, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    const weekday = d.toLocaleDateString(isVi ? 'vi-VN' : 'en-US', { weekday: 'short' })
    const dayNum = d.getDate()
    const isToday = dateKey(new Date()) === key
    return { key, weekday, dayNum, isToday }
  })

  const staffColors = useMemo(() => {
    const map = new Map<string, string>()
    const palette = [
      'bg-rose-100 text-rose-900 border-rose-200',
      'bg-sky-100 text-sky-900 border-sky-200',
      'bg-emerald-100 text-emerald-900 border-emerald-200',
      'bg-violet-100 text-violet-900 border-violet-200',
      'bg-amber-100 text-amber-900 border-amber-200',
    ]
    const ids = [...new Set(shiftsWithNames.map((s) => s.staff_id))]
    ids.forEach((id, i) => map.set(id, palette[i % palette.length]))
    return map
  }, [shiftsWithNames])

  const weekShifts = useMemo(
    () => shiftsWithNames.filter((s) => dayKeys.includes(s.shift_date)),
    [shiftsWithNames, dayKeys]
  )

  const blocksByDay = useMemo(() => {
    const map = new Map<string, PlacedShift[]>()
    for (const key of dayKeys) {
      map.set(key, placeShiftsForDay(weekShifts.filter((s) => s.shift_date === key)))
    }
    return map
  }, [dayKeys, weekShifts])

  const businessTop = (BUSINESS_HOUR_START / HOURS) * 100
  const businessHeight = ((BUSINESS_HOUR_END - BUSINESS_HOUR_START) / HOURS) * 100

  return (
    <section className="rounded-2xl border bg-white shadow-sm overflow-hidden min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b bg-gray-50/80">
        <div>
          <h2 className="font-semibold text-gray-900">
            {isVi ? 'Lịch ca theo tuần (24h)' : 'Weekly shifts (24h)'}
          </h2>
          <p className="text-sm text-gray-500">{weekLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon" onClick={() => shiftWeek(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onWeekStartChange(startOfWeekMonday(new Date()))}
          >
            {isVi ? 'Tuần này' : 'This week'}
          </Button>
          <Button type="button" variant="outline" size="icon" onClick={() => shiftWeek(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-[2.5rem_repeat(7,minmax(0,1fr))] border-b bg-gray-50/60 text-[10px] font-medium text-gray-600">
                <div className="border-r" />
                {dayHeaders.map((d) => (
                  <div
                    key={d.key}
                    className={cn(
                      'px-1 py-2 text-center border-r last:border-r-0',
                      d.isToday && 'bg-rose-50 text-rose-700'
                    )}
                  >
                    <div>{d.weekday}</div>
                    <div className={cn('text-sm font-semibold', d.isToday && 'text-rose-600')}>
                      {d.dayNum}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex h-[clamp(20rem,48vh,32rem)] min-h-[20rem]">
                <div className="w-10 shrink-0 grid grid-rows-[repeat(24,minmax(0,1fr))] border-r bg-gray-50/60">
                  {hours.map((h) => (
                    <div
                      key={`label-${h}`}
                      className="text-[10px] text-gray-500 pr-1 text-right border-b border-gray-100 flex items-start justify-end pt-px leading-none"
                    >
                      {String(h).padStart(2, '0')}
                    </div>
                  ))}
                </div>

                <div className="flex-1 grid grid-cols-7 min-w-0">
                  {dayKeys.map((dayKey) => {
                    const blocks = blocksByDay.get(dayKey) ?? []
                    const header = dayHeaders.find((d) => d.key === dayKey)
                    return (
                      <div
                        key={dayKey}
                        className={cn(
                          'relative min-w-0 border-r last:border-r-0',
                          header?.isToday && 'bg-rose-50/20'
                        )}
                      >
                        <div className="absolute inset-0 grid grid-rows-[repeat(24,minmax(0,1fr))]">
                          {hours.map((h) => (
                            <div key={h} className="border-b border-gray-100 min-h-0" />
                          ))}
                        </div>

                        <div className="absolute inset-0 pointer-events-none">
                          <div
                            className="absolute left-0 right-0 bg-emerald-50/50 border-y border-emerald-200/40"
                            style={{ top: `${businessTop}%`, height: `${businessHeight}%` }}
                          />

                          {blocks.map((b) => {
                            const color =
                              staffColors.get(b.staff_id) ??
                              'bg-gray-100 text-gray-800 border-gray-200'
                            const width = 100 / b.laneCount
                            const left = b.lane * width
                            const shortName = b.staff_name.split(' ').slice(-1)[0] || b.staff_name
                            return (
                              <div
                                key={b.id}
                                title={`${b.staff_name} ${minutesToTime(b.start_minutes)}–${minutesToTime(b.end_minutes)}`}
                                className={cn(
                                  'absolute rounded border px-1 py-0.5 text-[9px] leading-tight overflow-hidden shadow-sm pointer-events-auto box-border',
                                  color
                                )}
                                style={{
                                  top: `${b.top}%`,
                                  height: `${b.height}%`,
                                  left: `calc(${left}% + 1px)`,
                                  width: `calc(${width}% - 2px)`,
                                }}
                              >
                                <span className="font-medium block truncate">{shortName}</span>
                                <span className="opacity-90 block truncate">
                                  {minutesToTime(b.start_minutes)}–{minutesToTime(b.end_minutes)}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

      <p className="px-4 py-1.5 text-[10px] text-gray-400 border-t">
        {isVi
          ? 'Vùng xanh nhạt: giờ làm chuẩn 8h–18h. Một ca = một khối (tăng ca ngoài giờ vẫn hiện).'
          : 'Light green: standard 8am–6pm. One block per shift.'}
      </p>

      {weekShifts.length > 0 && (
        <div className="px-4 py-2 border-t bg-gray-50/50 flex flex-wrap gap-2 text-[10px]">
          {[...staffColors.entries()].map(([id, cls]) => (
            <span key={id} className={cn('px-2 py-0.5 rounded border', cls)}>
              {staffLabel(staff, id)}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}
