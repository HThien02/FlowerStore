import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseServerClient } from '@/lib/supabase'

export type AdminRole = 'admin' | 'staff'

type GuardSuccess = {
  ok: true
  userId: string
  email: string
  role: AdminRole
  admin: ReturnType<typeof getSupabaseServerClient>
}
type GuardFailure = { ok: false; response: NextResponse }

async function resolveCaller(req: NextRequest): Promise<
  | { ok: true; userId: string; email: string; role: AdminRole | 'user' | null; admin: ReturnType<typeof getSupabaseServerClient> }
  | GuardFailure
> {
  const auth = req.headers.get('authorization') ?? req.headers.get('Authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Server is missing Supabase config' }, { status: 500 }),
    }
  }

  const verifier = createClient(url, anon)
  const { data, error } = await verifier.auth.getUser(token)
  if (error || !data?.user) {
    return { ok: false, response: NextResponse.json({ error: 'Invalid session' }, { status: 401 }) }
  }

  const admin = getSupabaseServerClient()
  const { data: profile, error: pErr } = await admin
    .from('user_profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle()

  if (pErr) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Failed to load profile' }, { status: 500 }),
    }
  }

  return {
    ok: true,
    userId: data.user.id,
    email: data.user.email ?? '',
    role: ((profile as { role?: string } | null)?.role ?? 'user') as AdminRole | 'user',
    admin,
  }
}

/** Allow only `role = 'admin'`. */
export async function requireAdmin(req: NextRequest): Promise<GuardSuccess | GuardFailure> {
  const r = await resolveCaller(req)
  if (!r.ok) return r
  if (r.role !== 'admin') {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { ok: true, userId: r.userId, email: r.email, role: 'admin', admin: r.admin }
}

/** Allow `role = 'admin'` or `role = 'staff'` (read-only operators). */
export async function requireStaffOrAdmin(req: NextRequest): Promise<GuardSuccess | GuardFailure> {
  const r = await resolveCaller(req)
  if (!r.ok) return r
  if (r.role !== 'admin' && r.role !== 'staff') {
    return { ok: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { ok: true, userId: r.userId, email: r.email, role: r.role, admin: r.admin }
}
