import { getSupabaseServerClient } from './supabase'

export interface StaffMember {
  id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive'
  is_admin: boolean
  user_id?: string
  created_at: string
}

/**
 * Get all staff members
 */
export async function getStaffMembers(active: boolean = true) {
  const supabase = getSupabaseServerClient()

  try {
    let query = supabase.from('staff').select('*')

    if (active) {
      query = query.eq('status', 'active')
    }

    const { data, error } = await query.order('created_at', { ascending: true })

    if (error) {
      console.error('[STAFF] Error fetching staff members:', error)
      return []
    }

    return (data || []) as StaffMember[]
  } catch (error) {
    console.error('[STAFF] Exception fetching staff members:', error)
    return []
  }
}

/**
 * Get a single staff member by ID
 */
export async function getStaffById(staffId: string) {
  const supabase = getSupabaseServerClient()

  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('id', staffId)
      .single()

    if (error) {
      console.error('[STAFF] Error fetching staff member:', error)
      return null
    }

    return data as StaffMember
  } catch (error) {
    console.error('[STAFF] Exception fetching staff member:', error)
    return null
  }
}

/**
 * Create a new staff member
 */
export async function createStaffMember(staffData: {
  name: string
  email: string
  phone: string
  is_admin?: boolean
  user_id?: string
}) {
  const supabase = getSupabaseServerClient()

  try {
    const { data, error } = await supabase
      .from('staff')
      .insert({
        name: staffData.name,
        email: staffData.email,
        phone: staffData.phone,
        is_admin: staffData.is_admin || false,
        user_id: staffData.user_id || null,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('[STAFF] Error creating staff member:', error)
      return null
    }

    return data as StaffMember
  } catch (error) {
    console.error('[STAFF] Exception creating staff member:', error)
    return null
  }
}

/**
 * Update a staff member
 */
export async function updateStaffMember(staffId: string, updates: Partial<StaffMember>) {
  const supabase = getSupabaseServerClient()

  try {
    const { data, error } = await supabase
      .from('staff')
      .update(updates)
      .eq('id', staffId)
      .select()
      .single()

    if (error) {
      console.error('[STAFF] Error updating staff member:', error)
      return null
    }

    return data as StaffMember
  } catch (error) {
    console.error('[STAFF] Exception updating staff member:', error)
    return null
  }
}

/**
 * Delete a staff member
 */
export async function deleteStaffMember(staffId: string) {
  const supabase = getSupabaseServerClient()

  try {
    const { error } = await supabase.from('staff').delete().eq('id', staffId)

    if (error) {
      console.error('[STAFF] Error deleting staff member:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('[STAFF] Exception deleting staff member:', error)
    return false
  }
}

/**
 * Deactivate a staff member
 */
export async function deactivateStaffMember(staffId: string) {
  return updateStaffMember(staffId, { status: 'inactive' })
}

/**
 * Activate a staff member
 */
export async function activateStaffMember(staffId: string) {
  return updateStaffMember(staffId, { status: 'active' })
}

/**
 * Get staff member with upcoming deliveries
 */
export async function getStaffWithSchedules(staffId: string) {
  const supabase = getSupabaseServerClient()

  try {
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('id', staffId)
      .single()

    if (staffError || !staff) {
      console.error('[STAFF] Error fetching staff:', staffError)
      return null
    }

    const { data: schedules, error: scheduleError } = await supabase
      .from('delivery_schedule')
      .select('*, orders(*, order_items(*, products(*)))')
      .eq('staff_id', staffId)
      .eq('status', 'scheduled')
      .order('scheduled_time', { ascending: true })

    if (scheduleError) {
      console.error('[STAFF] Error fetching schedules:', scheduleError)
      return { ...staff, schedules: [] }
    }

    return { ...staff, schedules: schedules || [] }
  } catch (error) {
    console.error('[STAFF] Exception fetching staff with schedules:', error)
    return null
  }
}

/**
 * Get staff workload for a given date
 */
export async function getStaffWorkload(staffId: string, date: Date) {
  const supabase = getSupabaseServerClient()

  try {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from('delivery_schedule')
      .select('id')
      .eq('staff_id', staffId)
      .eq('status', 'scheduled')
      .gte('scheduled_time', startOfDay.toISOString())
      .lte('scheduled_time', endOfDay.toISOString())

    if (error) {
      console.error('[STAFF] Error fetching workload:', error)
      return 0
    }

    return data?.length || 0
  } catch (error) {
    console.error('[STAFF] Exception fetching workload:', error)
    return 0
  }
}
