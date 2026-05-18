import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/require-admin'
import { getShopSettings, saveShopSettings } from '@/lib/shop/settings'

export async function GET(request: NextRequest) {
  const guard = await requireAdmin(request)
  if (!guard.ok) return guard.response

  try {
    const settings = await getShopSettings()
    return NextResponse.json({ settings })
  } catch (e) {
    console.error('[admin/shop-settings GET]', e)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const guard = await requireAdmin(request)
  if (!guard.ok) return guard.response

  try {
    const body = await request.json()
    const {
      addressDetail,
      provinceCode,
      provinceName,
      districtCode,
      districtName,
      wardCode,
      wardName,
      latitude,
      longitude,
    } = body

    if (!addressDetail?.trim() || !provinceCode || !districtCode || !wardCode) {
      return NextResponse.json({ error: 'Missing address fields' }, { status: 400 })
    }

    const manualCoords =
      latitude != null && longitude != null
        ? { latitude: Number(latitude), longitude: Number(longitude) }
        : null

    const { settings, geocoded, formattedAddress, precision } = await saveShopSettings({
      addressDetail: String(addressDetail).trim(),
      provinceCode: String(provinceCode),
      provinceName: String(provinceName ?? ''),
      districtCode: String(districtCode),
      districtName: String(districtName ?? ''),
      wardCode: String(wardCode),
      wardName: String(wardName ?? ''),
    }, manualCoords)

    return NextResponse.json({
      settings,
      geocoded,
      formattedAddress,
      precision,
      warning: geocoded
        ? undefined
        : 'Không lấy được tọa độ đúng số nhà. Dán lat/lng từ Google Maps hoặc thêm GOONG_API_KEY.',
    })
  } catch (e) {
    console.error('[admin/shop-settings PUT]', e)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
