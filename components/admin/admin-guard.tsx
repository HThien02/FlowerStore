'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export type AdminRole = 'admin' | 'staff'

type State =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'forbidden'; email: string | null; reason?: string }
  | { status: 'allowed'; email: string | null; role: AdminRole }
  | { status: 'error'; message: string }

export default function AdminGuard({
  children,
  locale,
}: {
  children: ReactNode
  locale: string
}) {
  const [state, setState] = useState<State>({ status: 'loading' })
  const router = useRouter()

  useEffect(() => {
    const ac = new AbortController()

    const resolve = async (session: Session | null) => {
      try {
        if (!isSupabaseConfigured()) {
          if (!ac.signal.aborted) setState({ status: 'anonymous' })
          return
        }

        const user = session?.user ?? null
        if (!user) {
          if (!ac.signal.aborted) setState({ status: 'anonymous' })
          return
        }

        const { data, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()

        if (ac.signal.aborted) return

        if (error) {
          const hint =
            error.message?.includes('role') || error.code === '42703'
              ? ' Có thể bạn chưa chạy migration scripts/setup-admin.sql trên Supabase.'
              : ''
          setState({
            status: 'forbidden',
            email: user.email ?? null,
            reason: `${error.message}.${hint}`,
          })
          return
        }

        const role = (data as { role?: string } | null)?.role
        if (role === 'admin' || role === 'staff') {
          setState({ status: 'allowed', email: user.email ?? null, role })
        } else {
          setState({ status: 'forbidden', email: user.email ?? null })
        }
      } catch (e) {
        if (ac.signal.aborted) return
        const msg = e instanceof Error ? e.message : 'Unknown error'
        setState({
          status: 'error',
          message: msg,
        })
      }
    }

    const bootstrap = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        await resolve(session)
      } catch (e) {
        if (ac.signal.aborted) return
        setState({
          status: 'error',
          message: e instanceof Error ? e.message : 'Failed to load session',
        })
      }
    }

    void bootstrap()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      void resolve(session)
    })

    return () => {
      ac.abort()
      sub.subscription.unsubscribe()
    }
  }, [])

  if (state.status === 'loading') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
        <p className="text-gray-500">Loading admin…</p>
        <p className="text-xs text-gray-400 max-w-sm text-center">
          Nếu treo lâu: mở DevTools → Console xem lỗi; đảm bảo đã chạy SQL trong
          scripts/setup-admin.sql.
        </p>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Admin — lỗi</h1>
        <p className="text-gray-700 text-sm break-words">{state.message}</p>
        <Link href={`/${locale}`}>
          <Button variant="outline">Về trang chủ</Button>
        </Link>
      </div>
    )
  }

  if (state.status === 'anonymous') {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold">Admin login required</h1>
        <p className="text-gray-600">Please sign in with an admin or staff account to continue.</p>
        <Button onClick={() => router.push(`/${locale}/login?next=/${locale}/admin/orders`)}>
          Sign in
        </Button>
      </div>
    )
  }

  if (state.status === 'forbidden') {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Access denied</h1>
        <p className="text-gray-600">
          {state.email ? `${state.email} ` : ''}does not have admin or staff privileges.
        </p>
        {state.reason && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded p-2 text-left break-words">
            {state.reason}
          </p>
        )}
        <p className="text-sm text-gray-500">
          Run the migration in <code>scripts/setup-admin.sql</code> and set
          <br />
          <code className="text-xs">UPDATE user_profiles SET role = 'admin' WHERE email = '…'</code>
        </p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={() => supabase.auth.signOut()}>
            Sign out
          </Button>
          <Link href={`/${locale}`}>
            <Button>Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href={`/${locale}/admin`} className="font-semibold flex items-center gap-2">
              Admin
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  state.role === 'admin' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                }`}
              >
                {state.role}
              </span>
            </Link>
            <nav className="flex gap-4 text-sm text-gray-600">
              <Link href={`/${locale}/admin/orders`} className="hover:text-rose-500">
                Orders
              </Link>
              {state.role === 'admin' && (
                <>
                  <Link href={`/${locale}/admin/products`} className="hover:text-rose-500">
                    Products
                  </Link>
                  <Link href={`/${locale}/admin/staff`} className="hover:text-rose-500">
                    Team
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-3">
            <span>{state.email}</span>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                router.push(`/${locale}`)
              }}
              className="text-gray-700 hover:text-rose-500"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
    </div>
  )
}
