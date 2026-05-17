/** Slot 30 phút — dùng chung calendar + assign. */
export const SLOT_STEP_MS = 30 * 60 * 1000

export function slotKey(d: Date): number {
  return Math.floor(d.getTime() / SLOT_STEP_MS)
}

/** Hàng giờ 0–23 trên lịch ngày. */
export function calendarHour(iso: string): number {
  return new Date(iso).getHours()
}
