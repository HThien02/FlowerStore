/** Giờ làm việc chuẩn: 08:00–18:00 (nhận/giao trong khung này không phụ thu). */
export const BUSINESS_HOUR_START = 8
export const BUSINESS_HOUR_END = 18
export const AFTER_HOURS_SURCHARGE_RATE = 0.1

export function minutesOfDay(d: Date): number {
  return d.getHours() * 60 + d.getMinutes()
}

/** Ngoài 8:00–17:59 (tức trước 8h hoặc từ 18:00 trở đi). */
export function isOutsideBusinessHours(scheduledAt: Date): boolean {
  const m = minutesOfDay(scheduledAt)
  return m < BUSINESS_HOUR_START * 60 || m >= BUSINESS_HOUR_END * 60
}

export function calcAfterHoursFee(subtotal: number, deliveryCost: number, scheduledAt: Date): number {
  if (!isOutsideBusinessHours(scheduledAt)) return 0
  const base = subtotal + deliveryCost
  return Math.round(base * AFTER_HOURS_SURCHARGE_RATE * 100) / 100
}

export function orderTotalWithFees(
  subtotal: number,
  deliveryCost: number,
  scheduledAt: Date
): { afterHoursFee: number; total: number } {
  const afterHoursFee = calcAfterHoursFee(subtotal, deliveryCost, scheduledAt)
  return {
    afterHoursFee,
    total: Math.round((subtotal + deliveryCost + afterHoursFee) * 100) / 100,
  }
}
