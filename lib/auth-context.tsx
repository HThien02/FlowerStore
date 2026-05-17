'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from './supabase'
import { normalizeAuthEmail } from './auth-errors'

type AuthContextType = {
  user: User | null
  isLoading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ needsEmailConfirmation: boolean }>
  signIn: (email: string, password: string) => Promise<void>
  resetPassword: (email: string, locale?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

async function syncProfileViaApi(accessToken: string, fullName?: string) {
  const res = await fetch('/api/auth/ensure-profile', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fullName }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Could not save profile to database')
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const ensureUserProfile = async (u: User, accessToken?: string) => {
    const fullName =
      (u.user_metadata?.full_name as string | undefined) ??
      [
        u.user_metadata?.first_name as string | undefined,
        u.user_metadata?.last_name as string | undefined,
      ]
        .filter(Boolean)
        .join(' ')

    if (accessToken) {
      try {
        await syncProfileViaApi(accessToken, fullName || undefined)
        return
      } catch (e) {
        console.error('[Auth] ensure-profile API failed:', e)
      }
    }

    try {
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', u.id)
        .maybeSingle()

      const row = {
        id: u.id,
        email: u.email,
        full_name: fullName || null,
      }

      const { error: insertError } = existing
        ? await supabase.from('user_profiles').update(row).eq('id', u.id)
        : await supabase.from('user_profiles').insert({ ...row, role: 'user' })

      if (insertError) {
        console.error('[Auth] Error creating user profile:', insertError)
        throw insertError
      }
    } catch (e) {
      console.error('[Auth] ensureUserProfile failed:', e)
      throw e
    }
  }

  useEffect(() => {
    const loadingGuard = setTimeout(() => {
      setIsLoading(false)
    }, 4000)

    if (!isSupabaseConfigured()) {
      console.warn(
        '[Auth] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      )
      setIsLoading(false)
      clearTimeout(loadingGuard)
      return
    }

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser && session?.access_token) {
          void ensureUserProfile(currentUser, session.access_token).catch(() => {})
        }
      } catch (error) {
        console.error('[Auth] Error checking session:', error)
      } finally {
        setIsLoading(false)
        clearTimeout(loadingGuard)
      }
    }

    void checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setIsLoading(false)
      if (currentUser && session?.access_token) {
        void ensureUserProfile(currentUser, session.access_token).catch(() => {})
      }
    })

    return () => {
      clearTimeout(loadingGuard)
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error(
        'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      )
    }
    const normalizedEmail = normalizeAuthEmail(email)
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo:
          typeof window !== 'undefined'
            ? `${window.location.origin}/${window.location.pathname.split('/')[1] || 'vi'}/login`
            : undefined,
      },
    })

    if (error) throw error

    const needsEmailConfirmation = !data.session

    if (data.session?.access_token && data.user) {
      await ensureUserProfile(data.user, data.session.access_token)
    }

    return { needsEmailConfirmation }
  }

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error(
        'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      )
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizeAuthEmail(email),
      password,
    })

    if (error) throw error

    if (data.session?.access_token && data.user) {
      await ensureUserProfile(data.user, data.session.access_token)
    }
  }

  const resetPassword = async (email: string, locale = 'vi') => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured.')
    }
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/${locale}/reset-password`
        : undefined
    const { error } = await supabase.auth.resetPasswordForEmail(normalizeAuthEmail(email), {
      redirectTo,
    })
    if (error) throw error
  }

  const signOut = async () => {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signUp, signIn, resetPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
