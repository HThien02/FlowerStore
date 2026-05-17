'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type CalendarEvent = {
  orderId: string
  customerName: string | null
  status: string
  staffName: string | null
  prepAt: string | null
  dueAt: string | null
}

const HOURS = 24
const BUSINESS_START = 8
const BUSINESS_END = 18

export const ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const

/** Viền trái + ô status trên block (nền trắng, chữ dễ đọc). */
const STATUS_ACCENT: Record<string, { border: string; pill: string }> = {
  pending: { border: 'border-l-amber-500', pill: 'bg-amber-500 text-white' },
  processing: { border: 'border-l-sky-500', pill: 'bg-sky-500 text-white' },
  shipped: { border: 'border-l-violet-500', pill: 'bg-violet-500 text-white' },
  delivered: { border: 'border-l-emerald-500', pill: 'bg-emerald-600 text-white' },
  cancelled: { border: 'border-l-slate-400', pill: 'bg-slate-400 text-white line-through' },
}

const STATUS_SWATCH: Record<string, string> = {
  pending: 'bg-amber-500 border-amber-600',
  processing: 'bg-sky-500 border-sky-600',
  shipped: 'bg-violet-500 border-violet-600',
  delivered: 'bg-emerald-600 border-emerald-700',
  cancelled: 'bg-slate-400 border-slate-500',
}

/** Cột cố định trên mỗi block (đơn | loại | status | NV). */
const BLOCK_GRID =
  'grid grid-cols-[3.25rem_2.25rem_4.75rem_minmax(0,1fr)] gap-x-1.5 items-center'

export const STATUS_BLOCK: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_ACCENT).map(([k, v]) => [k, v.border])
)

const STATUS_LABEL: Record<string, { vi: string; en: string }> = {
  pending: { vi: 'Chờ xử lý', en: 'Pending' },
  processing: { vi: 'Đang làm', en: 'Processing' },
  shipped: { vi: 'Đang giao', en: 'Shipped' },
  delivered: { vi: 'Hoàn tất', en: 'Delivered' },
  cancelled: { vi: 'Đã hủy', en: 'Cancelled' },
}

type Block = {
  id: string
  orderId: string
  sub: string
  top: number
  height: number
  left: number
  width: number
  kind: 'prep' | 'due'
  status: string
  hour: number
  lane: number
  laneCount: number
}

const HOUR_HEIGHT_PCT = 100 / HOURS

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function buildBlocksForDay(events: CalendarEvent[], day: Date): Block[] {
  type Raw = Omit<Block, 'top' | 'height' | 'left' | 'width' | 'lane' | 'laneCount'>
  const raw: Raw[] = []

  for (const ev of events) {
    if (ev.prepAt) {
      const prep = new Date(ev.prepAt)
      if (isSameDay(prep, day)) {
        raw.push({
          id: `${ev.orderId}-prep`,
          orderId: ev.orderId,
          sub: ev.customerName ?? `#${ev.orderId.slice(0, 8)}`,
          kind: 'prep',
          status: ev.status,
          hour: prep.getHours(),
        })
      }
    }
    if (ev.dueAt) {
      const due = new Date(ev.dueAt)
      if (isSameDay(due, day)) {
        raw.push({
          id: `${ev.orderId}-due`,
          orderId: ev.orderId,
          sub: ev.customerName ?? `#${ev.orderId.slice(0, 8)}`,
          kind: 'due',
          status: ev.status,
          hour: due.getHours(),
        })
      }
    }
  }

  const byHour = new Map<number, Raw[]>()
  for (const item of raw) {
    const list = byHour.get(item.hour) ?? []
    list.push(item)
    byHour.set(item.hour, list)
  }

  const result: Block[] = []
  for (const [hour, items] of byHour) {
    const laneCount = items.length
    const width = 100 / laneCount
    items.forEach((item, lane) => {
      result.push({
        ...item,
        hour,
        lane,
        laneCount,
        top: hour * HOUR_HEIGHT_PCT,
        height: HOUR_HEIGHT_PCT,
        left: lane * width,
        width,
      })
    })
  }

  return result.sort((a, b) => a.top - b.top || a.left - b.left)
}

function CalendarEventChip({
  block,
  staff,
  locale,
  isVi,
}: {
  block: Block
  staff: string | null
  locale: string
  isVi: boolean
}) {
  const accent = STATUS_ACCENT[block.status] ?? {
    border: 'border-l-rose-500',
    pill: 'bg-rose-500 text-white',
  }
  const statusText = isVi
    ? STATUS_LABEL[block.status]?.vi ?? block.status
    : STATUS_LABEL[block.status]?.en ?? block.status
  const narrow = block.laneCount > 1
  const kindLabel = block.kind === 'prep' ? (isVi ? 'CB' : 'Pr') : isVi ? 'GN' : 'Du'

  return (
    <Link
      href={`/${locale}/admin/orders/${block.orderId}`}
      title={[block.sub, staff, kindLabel].filter(Boolean).join(' · ')}
      className={cn(
        'absolute rounded border border-gray-200/90 bg-white/95 shadow-sm',
        'hover:ring-2 hover:ring-rose-400 transition pointer-events-auto z-10 border-l-[3px]',
        'overflow-hidden box-border',
        accent.border,
        block.kind === 'prep' && 'border-dashed'
      )}
      style={{
        top: `${block.top}%`,
        height: `${block.height}%`,
        left: `calc(${block.left}% + 1px)`,
        width: `calc(${block.width}% - 2px)`,
      }}
    >
      {narrow ? (
        <div className="flex flex-col justify-center h-full px-1 py-0.5 gap-0.5 text-[9px] leading-tight">
          <span className="font-mono font-bold text-gray-900 truncate">#{block.orderId.slice(0, 6)}</span>
          <span className={cn('rounded px-0.5 text-[8px] font-semibold truncate text-center', accent.pill)}>
            {kindLabel} · {statusText}
          </span>
          <span className="truncate text-gray-600 text-[8px]" title={staff ?? undefined}>
            {staff ?? '—'}
          </span>
        </div>
      ) : (
        <div className={cn(BLOCK_GRID, 'h-full px-1 py-0.5 text-[10px]')}>
          <span className="font-mono font-bold text-gray-900 tabular-nums leading-none truncate">
            #{block.orderId.slice(0, 8)}
          </span>
          <span className="text-[8px] font-semibold uppercase text-gray-500 leading-none text-center">
            {kindLabel}
          </span>
          <span
            className={cn(
              'inline-flex items-center justify-center rounded px-0.5 text-[8px] font-semibold truncate',
              accent.pill
            )}
          >
            {statusText}
          </span>
          <span className="truncate text-gray-700 font-medium leading-none" title={staff ?? undefined}>
            {staff ?? (isVi ? 'Chưa gán' : '—')}
          </span>
        </div>
      )}
    </Link>
  )
}

function StatusLegend({ isVi }: { isVi: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-600">
      <span className="font-medium text-gray-500">{isVi ? 'Chú thích:' : 'Legend:'}</span>
      {ORDER_STATUSES.map((s) => (
        <span key={s} className="inline-flex items-center gap-1">
          <span className={cn('w-2.5 h-2.5 rounded-sm border shrink-0', STATUS_SWATCH[s])} />
          {isVi ? STATUS_LABEL[s].vi : STATUS_LABEL[s].en}
        </span>
      ))}
      <span className="inline-flex items-center gap-1 text-gray-500">
        <span className="w-2.5 h-2.5 rounded-sm border border-dashed border-gray-500 bg-white shrink-0" />
        {isVi ? 'viền đứt = chuẩn bị' : 'dashed = prep'}
      </span>
    </div>
  )
}

export default function AdminDayCalendar({
  locale,
  events,
}: {
  locale: string
  events: CalendarEvent[]
}) {
  const [day, setDay] = useState(() => startOfDay(new Date()))
  const isVi = locale === 'vi'

  const hours = useMemo(() => Array.from({ length: HOURS }, (_, i) => i), [])

  const blocks = useMemo(() => buildBlocksForDay(events, day), [events, day])

  const staffByOrder = useMemo(() => {
    const m = new Map<string, string | null>()
    for (const e of events) m.set(e.orderId, e.staffName)
    return m
  }, [events])

  const dayLabel = day.toLocaleDateString(isVi ? 'vi-VN' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const shiftDay = (delta: number) => {
    const n = new Date(day)
    n.setDate(n.getDate() + delta)
    setDay(startOfDay(n))
  }

  const todayEvents = events.filter((e) => {
    const prep = e.prepAt ? new Date(e.prepAt) : null
    const due = e.dueAt ? new Date(e.dueAt) : null
    return (prep && isSameDay(prep, day)) || (due && isSameDay(due, day))
  })

  const businessTop = (BUSINESS_START / HOURS) * 100
  const businessHeight = ((BUSINESS_END - BUSINESS_START) / HOURS) * 100

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {isVi ? 'Lịch việc hôm nay' : "Today's schedule"}
          </h2>
          <p className="text-sm text-gray-500 capitalize">{dayLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon" onClick={() => shiftDay(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDay(startOfDay(new Date()))}
          >
            {isVi ? 'Hôm nay' : 'Today'}
          </Button>
          <Button type="button" variant="outline" size="icon" onClick={() => shiftDay(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="px-3 py-2 border-b bg-gray-50/80 space-y-1.5">
          <StatusLegend isVi={isVi} />
          <div
            className={cn(BLOCK_GRID, 'text-[9px] text-gray-500 font-medium px-1.5')}
            aria-hidden
          >
            <span>{isVi ? 'Mã đơn' : 'Order'}</span>
            <span className="text-center">{isVi ? 'Loại' : 'Type'}</span>
            <span>{isVi ? 'Trạng thái' : 'Status'}</span>
            <span>{isVi ? 'Nhân viên' : 'Staff'}</span>
          </div>
          <p className="text-[10px] text-gray-400">
            {isVi
              ? 'Mỗi tag = 1 giờ. Trùng giờ: chia đôi/ngang. Giao hàng cũng chiếm slot NV.'
              : 'One tag = one hour. Same hour: split side-by-side. Delivery blocks staff too.'}
          </p>
        </div>

        <div className="flex h-[clamp(22rem,52vh,34rem)] min-h-[22rem]">
          <div className="w-11 shrink-0 grid grid-rows-[repeat(24,minmax(0,1fr))] border-r bg-gray-50/60">
            {hours.map((h) => (
              <div
                key={`t-${h}`}
                className="text-[10px] text-gray-500 pr-1 text-right border-b border-gray-100 flex items-start justify-end pt-px leading-none"
              >
                {String(h).padStart(2, '0')}
              </div>
            ))}
          </div>

          <div className="flex-1 relative min-w-0">
            <div className="absolute inset-0 grid grid-rows-[repeat(24,minmax(0,1fr))]">
              {hours.map((h) => (
                <div key={`row-${h}`} className="border-b border-gray-100 min-h-0" />
              ))}
            </div>

            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute left-0 right-0 bg-emerald-50/60 border-y border-emerald-200/50"
                style={{ top: `${businessTop}%`, height: `${businessHeight}%` }}
              />

              {blocks.map((b) => (
                <CalendarEventChip
                  key={b.id}
                  block={b}
                  staff={staffByOrder.get(b.orderId) ?? null}
                  locale={locale}
                  isVi={isVi}
                />
              ))}

              {blocks.length === 0 && (
                <p className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
                  {isVi ? 'Không có lịch trong ngày này' : 'No events this day'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {todayEvents.length > 0 && (
        <div className="rounded-xl border bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            {isVi ? 'Danh sách việc' : 'To-do list'} ({todayEvents.length})
          </h3>
          <ul className="space-y-2">
            {todayEvents.map((ev) => (
              <li
                key={ev.orderId}
                className="flex flex-wrap items-center gap-2 text-sm border-b border-gray-50 pb-2 last:border-0"
              >
                <Link
                  href={`/${locale}/admin/orders/${ev.orderId}`}
                  className="font-mono text-rose-600 hover:underline"
                >
                  #{ev.orderId.slice(0, 8)}
                </Link>
                <span className="text-gray-700">{ev.customerName ?? '—'}</span>
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    STATUS_ACCENT[ev.status]?.pill ?? 'bg-gray-500 text-white'
                  )}
                >
                  {isVi ? STATUS_LABEL[ev.status]?.vi ?? ev.status : STATUS_LABEL[ev.status]?.en ?? ev.status}
                </span>
                <span className="text-xs text-gray-500 ml-auto">
                  {ev.prepAt && isSameDay(new Date(ev.prepAt), day)
                    ? `${isVi ? 'Prep' : 'Prep'} ${new Date(ev.prepAt).toLocaleTimeString(isVi ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}`
                    : ''}
                  {ev.dueAt && isSameDay(new Date(ev.dueAt), day)
                    ? ` → ${new Date(ev.dueAt).toLocaleTimeString(isVi ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}`
                    : ''}
                </span>
                <span className="text-xs text-rose-600 w-full sm:w-auto">
                  {ev.staffName ?? (isVi ? 'Chưa gán nhân viên' : 'No staff assigned')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
