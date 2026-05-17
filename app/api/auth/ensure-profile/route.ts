import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseServerClient } from '@/lib/supabase'

/** Tạo/cập nhật user_profiles bằng service role (bypass RLS). Cần Bearer token hợp lệ. */
export async function POST(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const auth = request.headers.get('authorization') ?? ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const verifier = createClient(url, anon)
    const { data, error: authError } = await verifier.auth.getUser(token)
    if (authError || !data?.user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const user = data.user
    const body = await request.json().catch(() => ({}))
    const fullName =
      (typeof body.fullName === 'string' ? body.fullName : null) ??
      (user.user_metadata?.full_name as string | undefined) ??
      null

    const admin = getSupabaseServerClient()
    const { data: existing } = await admin
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    const row = {
      id: user.id,
      email: user.email ?? '',
      full_name: fullName,
      updated_at: new Date().toISOString(),
    }

    const { error: upsertError } = existing
      ? await admin.from('user_profiles').update(row).eq('id', user.id)
      : await admin.from('user_profiles').insert({ ...row, role: 'user' })

    if (upsertError) {
      console.error('[ensure-profile]', upsertError)
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[ensure-profile]', e)
    return NextResponse.json({ error: 'Failed to ensure profile' }, { status: 500 })
  }
}
