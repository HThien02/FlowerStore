import { NextRequest, NextResponse } from 'next/server'
import { fetchDistricts } from '@/lib/vietnam-address/api'

export async function GET(request: NextRequest) {
  const provinceCode = request.nextUrl.searchParams.get('province')
  if (!provinceCode) {
    return NextResponse.json({ error: 'Missing province code' }, { status: 400 })
  }
  try {
    const districts = await fetchDistricts(provinceCode)
    return NextResponse.json({ districts })
  } catch (e) {
    console.error('[vietnam-address/districts]', e)
    return NextResponse.json({ error: 'Failed to load districts' }, { status: 502 })
  }
}
