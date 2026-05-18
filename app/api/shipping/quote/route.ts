import { NextRequest, NextResponse } from 'next/server'
import { calculateShippingQuote } from '@/lib/shipping/quote'
import type { VietnamAddressParts } from '@/lib/vietnam-address/types'

type Body = Partial<VietnamAddressParts>

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body
    const required = [
      'addressDetail',
      'provinceCode',
      'provinceName',
      'districtCode',
      'districtName',
      'wardCode',
      'wardName',
    ] as const

    for (const key of required) {
      if (!body[key]?.trim()) {
        return NextResponse.json({ error: `Missing ${key}` }, { status: 400 })
      }
    }

    const quote = await calculateShippingQuote({
      addressDetail: body.addressDetail!.trim(),
      provinceCode: body.provinceCode!.trim(),
      provinceName: body.provinceName!.trim(),
      districtCode: body.districtCode!.trim(),
      districtName: body.districtName!.trim(),
      wardCode: body.wardCode!.trim(),
      wardName: body.wardName!.trim(),
    })

    return NextResponse.json({ quote })
  } catch (e) {
    console.error('[shipping/quote]', e)
    return NextResponse.json({ error: 'Failed to calculate shipping' }, { status: 500 })
  }
}
