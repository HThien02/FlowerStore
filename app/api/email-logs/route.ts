import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('orderId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    let query = supabase.from('email_logs').select('*')

    if (orderId) {
      query = query.eq('order_id', orderId)
    }

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[API] Email logs GET error:', error)
      return NextResponse.json({ error: 'Failed to fetch email logs' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('[API] Email logs error:', error)
    return NextResponse.json({ error: 'Failed to fetch email logs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const body = await request.json()
    const { action, logId, status, errorMessage } = body

    if (action === 'retry') {
      // Mark email for retry
      const { data, error } = await supabase
        .from('email_logs')
        .update({
          status: 'pending',
          retry_count: supabase.raw('retry_count + 1'),
          error_message: null,
        })
        .eq('id', logId)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: 'Failed to retry email' }, { status: 500 })
      }

      return NextResponse.json(data)
    }

    if (action === 'update_status') {
      // Update email log status
      const { data, error } = await supabase
        .from('email_logs')
        .update({
          status,
          error_message: errorMessage || null,
        })
        .eq('id', logId)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: 'Failed to update email log' }, { status: 500 })
      }

      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[API] Email logs POST error:', error)
    return NextResponse.json({ error: 'Failed to process email log action' }, { status: 500 })
  }
}
