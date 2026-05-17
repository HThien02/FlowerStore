import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/require-admin'

/** List users with their role (admin only). */
export async function GET(request: NextRequest) {
  const guard = await requireAdmin(request)
  if (!guard.ok) return guard.response

  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const search = searchParams.get('q')?.trim()

    let query = guard.admin
      .from('user_profiles')
      .select('id, email, full_name, phone, role, created_at')
      .order('created_at', { ascending: false })
      .limit(200)

    if (role) query = query.eq('role', role)
    if (search) query = query.ilike('email', `%${search}%`)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ users: data ?? [] })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed'
    console.error('[admin/users GET]', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
