import { isSupabaseConfigured, supabase } from './supabase'

function assertPublicSupabaseEnv() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }
}

export async function getCurrentUser() {
  assertPublicSupabaseEnv()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function signOut() {
  assertPublicSupabaseEnv()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  assertPublicSupabaseEnv()
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

  // Create user profile
  if (data.user) {
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
      })

    if (profileError) throw profileError
  }

  return data
}

export async function signInWithEmail(email: string, password: string) {
  assertPublicSupabaseEnv()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function resetPassword(email: string) {
  assertPublicSupabaseEnv()
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
}

export async function updatePassword(newPassword: string) {
  assertPublicSupabaseEnv()
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })
  if (error) throw error
}
