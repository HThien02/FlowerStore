import { NextRequest, NextResponse } from 'next/server'
import { fetchWards } from '@/lib/vietnam-address/api'

export async function GET(request: NextRequest) {
  const districtCode = request.nextUrl.searchParams.get('district')
  if (!districtCode) {
    return NextResponse.json({ error: 'Missing district code' }, { status: 400 })
  }
  try {
    const wards = await fetchWards(districtCode)
    return NextResponse.json({ wards })
  } catch (e) {
    console.error('[vietnam-address/wards]', e)
    return NextResponse.json({ error: 'Failed to load wards' }, { status: 502 })
  }
}
