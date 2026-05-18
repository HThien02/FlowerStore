import { NextResponse } from 'next/server'
import { fetchProvinces } from '@/lib/vietnam-address/api'

export async function GET() {
  try {
    const provinces = await fetchProvinces()
    return NextResponse.json({ provinces })
  } catch (e) {
    console.error('[vietnam-address/provinces]', e)
    return NextResponse.json({ error: 'Failed to load provinces' }, { status: 502 })
  }
}
