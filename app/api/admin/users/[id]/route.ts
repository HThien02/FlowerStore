import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/require-admin'

const ALLOWED_ROLES = new Set(['user', 'staff', 'admin'])

type Params = { params: Promise<{ id: string }> }

/** Update a user's role (admin only). Cannot demote yourself by accident. */
export async function PATCH(request: NextRequest, { params }: Params) {
  const guard = await requireAdmin(request)
  if (!guard.ok) return guard.response

  const { id } = await params
  try {
    const body = await request.json()
    const role = String(body.role ?? '')
    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }
    if (id === guard.userId && role !== 'admin') {
      return NextResponse.json(
        { error: 'You cannot demote yourself.' },
        { status: 400 }
      )
    }

    const { data, error } = await guard.admin
      .from('user_profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ user: data })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed'
    console.error('[admin/users PATCH]', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
