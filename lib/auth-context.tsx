'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from './supabase'

type AuthContextType = {
  user: User | null
  isLoading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const ensureUserProfile = async (u: User) => {
    try {
      const fullName =
        (u.user_metadata?.full_name as string | undefined) ??
        [
          u.user_metadata?.first_name as string | undefined,
          u.user_metadata?.last_name as string | undefined,
        ]
          .filter(Boolean)
          .join(' ')

      const { error: insertError } = await supabase
        .from('user_profiles')
        .upsert(
          {
            id: u.id,
            email: u.email,
            full_name: fullName || null,
          },
          { onConflict: 'id', ignoreDuplicates: true }
        )

      if (insertError) {
        console.error('[Auth] Error creating user profile:', insertError)
      }
    } catch (e) {
      console.error('[Auth] ensureUserProfile failed:', e)
    }
  }

  useEffect(() => {
    const loadingGuard = setTimeout(() => {
      setIsLoading(false)
    }, 4000)

    if (!isSupabaseConfigured()) {
      console.warn(
        '[Auth] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them in Vercel → Settings → Environment Variables and redeploy.'
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
        if (currentUser) {
          void ensureUserProfile(currentUser)
        }
      } catch (error) {
        console.error('[v0] Error checking session:', error)
      } finally {
        setIsLoading(false)
        clearTimeout(loadingGuard)
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setIsLoading(false)
      if (currentUser) {
        void ensureUserProfile(currentUser)
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
        'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY on the server and redeploy.'
      )
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) throw error
    if (data.user) {
      await ensureUserProfile(data.user)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error(
        'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY on the server and redeploy.'
      )
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  const signOut = async () => {
    if (!isSupabaseConfigured()) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signUp, signIn, signOut }}>
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
