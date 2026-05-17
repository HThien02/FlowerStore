import { createHmac } from 'crypto'

/** Payload `data` PayOS gửi trong webhook (sau khi thanh toán thành công). */
export type PayosWebhookData = {
  orderCode?: number | string
  amount?: number
  description?: string
  paymentLinkId?: string
  code?: string
  desc?: string
  accountNumber?: string
  reference?: string
  transactionDateTime?: string
  currency?: string
  counterAccountBankId?: string
  counterAccountBankName?: string
  counterAccountName?: string
  counterAccountNumber?: string
  virtualAccountName?: string
  virtualAccountNumber?: string
}

export type PayosWebhookPayload = {
  code?: string
  desc?: string
  success?: boolean
  data?: PayosWebhookData
  signature?: string
}

function sortObjDataByKey<T extends Record<string, unknown>>(object: T): T {
  return Object.keys(object)
    .sort()
    .reduce((obj, key) => {
      obj[key as keyof T] = object[key as keyof T]
      return obj
    }, {} as T)
}

function convertObjToQueryStr(object: Record<string, unknown>): string {
  return Object.keys(object)
    .filter((key) => object[key] !== undefined)
    .map((key) => {
      let value: unknown = object[key]
      if (value && Array.isArray(value)) {
        value = JSON.stringify(
          (value as Record<string, unknown>[]).map((val) => sortObjDataByKey(val))
        )
      }
      if ([null, undefined, 'undefined', 'null'].includes(value as string)) {
        value = ''
      }
      return `${key}=${value}`
    })
    .join('&')
}

/** Xác thực chữ ký webhook theo docs payOS (HMAC SHA256 trên `data`). */
export function verifyPayosWebhookSignature(
  data: PayosWebhookData,
  signature: string,
  checksumKey: string
): boolean {
  if (!data || !signature || !checksumKey) return false
  const sorted = sortObjDataByKey(data as Record<string, unknown>)
  const query = convertObjToQueryStr(sorted)
  const expected = createHmac('sha256', checksumKey).update(query).digest('hex')
  return expected === signature
}

export function isPayosWebhookPaymentSuccess(payload: PayosWebhookPayload): boolean {
  if (payload.code && payload.code !== '00') return false
  if (payload.success === false) return false
  const inner = payload.data?.code
  if (inner && inner !== '00') return false
  return Number.isFinite(Number(payload.data?.orderCode))
}
