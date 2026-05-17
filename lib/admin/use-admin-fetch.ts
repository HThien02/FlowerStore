'use client'

import { supabase } from '@/lib/supabase'

/**
 * Fetch wrapper that attaches the current Supabase access token as
 * `Authorization: Bearer <token>` so admin API routes can verify the caller.
 */
export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const token = session?.access_token

  const headers = new Headers(init?.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  // Avoid forcing JSON content type for FormData uploads.
  if (init?.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(input, { ...init, headers })
}
