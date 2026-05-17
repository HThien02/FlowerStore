/** Giờ làm việc chuẩn: 08:00–18:00 (giờ Việt Nam, nhận/giao trong khung này không phụ thu). */
export const BUSINESS_HOUR_START = 8
export const BUSINESS_HOUR_END = 18
export const AFTER_HOURS_SURCHARGE_RATE = 0.1
const VN_TZ = 'Asia/Ho_Chi_Minh'

/** Phút trong ngày theo giờ VN (tránh server UTC tính nhầm phụ thu). */
export function minutesOfDayInVietnam(d: Date): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: VN_TZ,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(d)
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)
  return hour * 60 + minute
}

/** Ngoài 8:00–17:59 giờ VN (trước 8h hoặc từ 18:00). */
export function isOutsideBusinessHours(scheduledAt: Date): boolean {
  const m = minutesOfDayInVietnam(scheduledAt)
  return m < BUSINESS_HOUR_START * 60 || m >= BUSINESS_HOUR_END * 60
}

export function formatScheduledAtVietnam(isoOrLocal: string): string {
  const d = new Date(isoOrLocal)
  if (Number.isNaN(d.getTime())) return isoOrLocal
  return d.toLocaleString('vi-VN', { timeZone: VN_TZ, dateStyle: 'medium', timeStyle: 'short' })
}

/** subtotal, deliveryCost: VND (số nguyên). */
export function calcAfterHoursFee(subtotal: number, deliveryCost: number, scheduledAt: Date): number {
  if (!isOutsideBusinessHours(scheduledAt)) return 0
  const base = subtotal + deliveryCost
  return Math.round(base * AFTER_HOURS_SURCHARGE_RATE)
}

export function orderTotalWithFees(
  subtotal: number,
  deliveryCost: number,
  scheduledAt: Date
): { afterHoursFee: number; total: number } {
  const afterHoursFee = calcAfterHoursFee(subtotal, deliveryCost, scheduledAt)
  return {
    afterHoursFee,
    total: subtotal + deliveryCost + afterHoursFee,
  }
}
