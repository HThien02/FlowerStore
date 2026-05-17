'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminFetch } from '@/lib/admin/use-admin-fetch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { CalendarRange, Loader2, Trash2 } from 'lucide-react'
import { dateKey, endOfWeekSunday, minutesToTime, startOfWeekMonday } from '@/lib/scheduling/staff-shifts'
import AdminWeekShiftCalendar, { type WeekShiftRow } from '@/components/admin/admin-week-shift-calendar'

type Staff = { id: string; full_name: string | null; email: string; role: string }

type ShiftRow = {
  id: string
  staff_id: string
  shift_date: string
  start_minutes: number
  end_minutes: number
  user_profiles?: Staff | Staff[] | null
}

const PRESETS = [
  { id: 'this_week', vi: 'Cả tuần này (T2–CN)', en: 'This week (Mon–Sun)' },
  { id: 'weekdays', vi: 'Thứ 2 – Thứ 6', en: 'Weekdays (Mon–Fri)' },
  { id: 'weekend', vi: 'Cuối tuần (T7–CN)', en: 'Weekend (Sat–Sun)' },
  { id: 'custom', vi: 'Chọn khoảng ngày', en: 'Custom date range' },
] as const

const LIST_PAGE_SIZE = 10

function shiftStaffName(s: ShiftRow): string {
  const p = Array.isArray(s.user_profiles) ? s.user_profiles[0] : s.user_profiles
  return p?.full_name || p?.email || s.staff_id.slice(0, 8)
}

export default function AdminShiftsPanel({ locale }: { locale: string }) {
  const isVi = locale === 'vi'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [staff, setStaff] = useState<Staff[]>([])
  const [shifts, setShifts] = useState<ShiftRow[]>([])
  const [staffId, setStaffId] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('18:00')
  const [preset, setPreset] = useState<(typeof PRESETS)[number]['id']>('this_week')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [shiftsWarning, setShiftsWarning] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(new Date()))
  const [listStaffFilter, setListStaffFilter] = useState<string>('all')
  const [listDateFrom, setListDateFrom] = useState('')
  const [listDateTo, setListDateTo] = useState('')
  const [listPage, setListPage] = useState(1)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const from = new Date()
      from.setMonth(from.getMonth() - 6)
      const to = new Date()
      to.setMonth(to.getMonth() + 6)
      const res = await adminFetch(
        `/api/admin/shifts?from=${dateKey(from)}&to=${dateKey(to)}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')

      const staffList = (data.staff ?? []) as Staff[]
      setStaff(staffList)
      setShifts(data.shifts ?? [])
      setShiftsWarning(typeof data.warning === 'string' ? data.warning : null)

      if (staffList.length === 0) {
        setStaffId('')
      } else {
        setStaffId((prev) =>
          prev && staffList.some((s) => s.id === prev) ? prev : staffList[0].id
        )
      }
    } catch (e) {
      console.error(e)
      toast.error(isVi ? 'Không tải được lịch ca' : 'Failed to load shifts')
    } finally {
      setLoading(false)
    }
  }, [isVi])

  useEffect(() => {
    void load()
  }, [load])

  const applyBulk = async () => {
    if (!staffId) {
      toast.error(isVi ? 'Chọn nhân viên' : 'Select staff')
      return
    }
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        staffId,
        startTime,
        endTime,
        preset,
      }
      if (preset === 'custom') {
        if (!fromDate || !toDate) {
          toast.error(isVi ? 'Chọn từ ngày đến ngày' : 'Pick from and to dates')
          setSaving(false)
          return
        }
        body.fromDate = fromDate
        body.toDate = toDate
      }

      const res = await adminFetch('/api/admin/shifts', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')

      toast.success(
        isVi
          ? `Đã gán ${data.inserted} ca (${data.startTime}–${data.endTime})`
          : `Applied ${data.inserted} shifts (${data.startTime}–${data.endTime})`
      )
      void load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const clearRange = async () => {
    if (!staffId || !fromDate || !toDate) {
      toast.error(isVi ? 'Chọn NV và khoảng ngày' : 'Select staff and date range')
      return
    }
    setSaving(true)
    try {
      const res = await adminFetch(
        `/api/admin/shifts?staffId=${staffId}&from=${fromDate}&to=${toDate}`,
        { method: 'DELETE' }
      )
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      toast.success(isVi ? 'Đã xóa ca trong khoảng' : 'Shifts cleared')
      void load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setSaving(false)
    }
  }

  function staffLabel(s: Staff) {
    return `${s.full_name || s.email}${s.role === 'admin' ? ' (admin)' : ''}`
  }

  const weekShiftRows: WeekShiftRow[] = useMemo(() => {
    const monday = dateKey(weekStart)
    const sunday = dateKey(endOfWeekSunday(weekStart))
    return shifts
      .filter((s) => s.shift_date >= monday && s.shift_date <= sunday)
      .map((s) => ({
        id: s.id,
        staff_id: s.staff_id,
        shift_date: s.shift_date,
        start_minutes: s.start_minutes,
        end_minutes: s.end_minutes,
        staff_name: shiftStaffName(s),
      }))
  }, [shifts, weekStart])

  const filteredListShifts = useMemo(() => {
    let list = [...shifts]
    if (listStaffFilter !== 'all') {
      list = list.filter((s) => s.staff_id === listStaffFilter)
    }
    if (listDateFrom) {
      list = list.filter((s) => s.shift_date >= listDateFrom)
    }
    if (listDateTo) {
      list = list.filter((s) => s.shift_date <= listDateTo)
    }
    list.sort(
      (a, b) =>
        b.shift_date.localeCompare(a.shift_date) ||
        a.start_minutes - b.start_minutes ||
        shiftStaffName(a).localeCompare(shiftStaffName(b))
    )
    return list
  }, [shifts, listStaffFilter, listDateFrom, listDateTo])

  const listTotalPages = Math.max(1, Math.ceil(filteredListShifts.length / LIST_PAGE_SIZE))

  const paginatedListShifts = useMemo(() => {
    const page = Math.min(listPage, listTotalPages)
    const start = (page - 1) * LIST_PAGE_SIZE
    return filteredListShifts.slice(start, start + LIST_PAGE_SIZE)
  }, [filteredListShifts, listPage, listTotalPages])

  useEffect(() => {
    setListPage(1)
  }, [listStaffFilter, listDateFrom, listDateTo])

  useEffect(() => {
    if (listPage > listTotalPages) setListPage(listTotalPages)
  }, [listPage, listTotalPages])

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex items-center gap-3">
        <CalendarRange className="w-8 h-8 text-rose-500 shrink-0" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isVi ? 'Chia lịch làm' : 'Work shifts'}
          </h1>
          <p className="text-sm text-gray-500">
            {isVi
              ? 'Gán nhanh cả tuần hoặc nhiều ngày — đơn hàng chỉ assign NV đang trong ca.'
              : 'Bulk-assign week or date range — orders only assign staff on shift.'}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">
          {isVi ? 'Gán ca hàng loạt' : 'Bulk assign shifts'}
        </h2>

        {shiftsWarning && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {isVi
              ? 'Chưa tạo bảng ca làm. Chạy scripts/setup-staff-shifts.sql trên Supabase — vẫn có thể chọn nhân viên bên dưới.'
              : shiftsWarning}
          </p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <Label>{isVi ? 'Nhân viên' : 'Staff'}</Label>
            <Select value={staffId || undefined} onValueChange={setStaffId} disabled={staff.length === 0}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder={isVi ? 'Chọn nhân viên…' : 'Select staff…'} />
              </SelectTrigger>
              <SelectContent>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {staffLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {staff.length === 0 && !loading && (
              <p className="text-xs text-gray-500">
                {isVi
                  ? 'Chưa có tài khoản role staff/admin. Vào Team → đổi role cho nhân viên.'
                  : 'No staff/admin accounts. Promote users in Team.'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{isVi ? 'Từ giờ' : 'Start'}</Label>
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{isVi ? 'Đến giờ' : 'End'}</Label>
            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{isVi ? 'Áp dụng cho' : 'Apply to'}</Label>
          <Select value={preset} onValueChange={(v) => setPreset(v as typeof preset)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRESETS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {isVi ? p.vi : p.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {preset === 'custom' && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isVi ? 'Từ ngày' : 'From date'}</Label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{isVi ? 'Đến ngày' : 'To date'}</Label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            type="button"
            className="bg-rose-500 hover:bg-rose-600"
            disabled={saving}
            onClick={() => void applyBulk()}
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isVi ? 'Áp dụng lịch ca' : 'Apply shifts'}
          </Button>
          {preset === 'custom' && (
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => void clearRange()}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              {isVi ? 'Xóa ca trong khoảng' : 'Clear range'}
            </Button>
          )}
        </div>
      </section>

      <AdminWeekShiftCalendar
        locale={locale}
        weekStart={weekStart}
        onWeekStartChange={setWeekStart}
        shifts={weekShiftRows}
        staff={staff}
      />

      <section className="rounded-2xl border bg-white overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 space-y-3">
          <h2 className="font-semibold text-gray-900">{isVi ? 'Danh sách ca' : 'All shifts'}</h2>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1 min-w-[10rem]">
              <Label className="text-xs">{isVi ? 'Nhân viên' : 'Staff'}</Label>
              <Select value={listStaffFilter} onValueChange={setListStaffFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isVi ? 'Tất cả' : 'All staff'}</SelectItem>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {staffLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isVi ? 'Từ ngày' : 'From'}</Label>
              <Input
                type="date"
                className="h-9 w-36"
                value={listDateFrom}
                onChange={(e) => setListDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isVi ? 'Đến ngày' : 'To'}</Label>
              <Input
                type="date"
                className="h-9 w-36"
                value={listDateTo}
                onChange={(e) => setListDateTo(e.target.value)}
              />
            </div>
            {(listStaffFilter !== 'all' || listDateFrom || listDateTo) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9"
                onClick={() => {
                  setListStaffFilter('all')
                  setListDateFrom('')
                  setListDateTo('')
                }}
              >
                {isVi ? 'Xóa lọc' : 'Clear filters'}
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {isVi
              ? `${filteredListShifts.length} ca · ${LIST_PAGE_SIZE} ca/trang`
              : `${filteredListShifts.length} shifts · ${LIST_PAGE_SIZE} per page`}
          </p>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
          </div>
        ) : filteredListShifts.length === 0 ? (
          <p className="text-sm text-gray-500 p-6 text-center">
            {shifts.length === 0
              ? isVi
                ? 'Chưa có ca. Dùng form trên để gán.'
                : 'No shifts yet. Use the form above.'
              : isVi
                ? 'Không có ca khớp bộ lọc.'
                : 'No shifts match filters.'}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-4 py-2">{isVi ? 'Ngày' : 'Date'}</th>
                    <th className="px-4 py-2">{isVi ? 'Nhân viên' : 'Staff'}</th>
                    <th className="px-4 py-2">{isVi ? 'Giờ' : 'Hours'}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedListShifts.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="px-4 py-2">{s.shift_date}</td>
                      <td className="px-4 py-2">{shiftStaffName(s)}</td>
                      <td className="px-4 py-2 text-rose-600">
                        {minutesToTime(s.start_minutes)} – {minutesToTime(s.end_minutes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t bg-gray-50/80 text-sm">
              <span className="text-gray-600 text-xs">
                {isVi
                  ? `Trang ${Math.min(listPage, listTotalPages)} / ${listTotalPages}`
                  : `Page ${Math.min(listPage, listTotalPages)} / ${listTotalPages}`}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={listPage <= 1}
                  onClick={() => setListPage((p) => Math.max(1, p - 1))}
                >
                  {isVi ? 'Trước' : 'Prev'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={listPage >= listTotalPages}
                  onClick={() => setListPage((p) => Math.min(listTotalPages, p + 1))}
                >
                  {isVi ? 'Sau' : 'Next'}
                </Button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
