import { getSupabaseServerClient } from './supabase'

export interface ScheduleSlot {
  staffId: string
  time: Date
  isAvailable: boolean
}

/**
 * Schedule a delivery automatically
 * 1. Calculate delivery time (1 hour from order creation)
 * 2. Check for conflicts
 * 3. If conflict, shift by 30 minutes
 * 4. Find available staff member
 */
export async function scheduleDelivery(
  orderId: string,
  orderCreatedAt: string,
  staffIdHint?: string
): Promise<{
  scheduledTime: Date
  staffId: string | null
  success: boolean
} | null> {
  const supabase = getSupabaseServerClient()

  try {
    // Calculate initial delivery time (1 hour from order creation)
    const orderTime = new Date(orderCreatedAt)
    const initialTime = new Date(orderTime.getTime() + 60 * 60 * 1000) // 1 hour later

    // Check for existing schedules at this time
    let scheduledTime = initialTime
    let attempt = 0
    const maxAttempts = 10 // Try up to 5 hours with 30-minute intervals

    while (attempt < maxAttempts) {
      const { data: existingSchedules, error: checkError } = await supabase
        .from('delivery_schedule')
        .select('id')
        .gte('scheduled_time', new Date(scheduledTime.getTime() - 30 * 60 * 1000))
        .lte('scheduled_time', new Date(scheduledTime.getTime() + 30 * 60 * 1000))
        .eq('status', 'scheduled')

      if (checkError) {
        console.error('[SCHEDULING] Error checking existing schedules:', checkError)
        return null
      }

      // If no conflicts, we found a slot
      if (!existingSchedules || existingSchedules.length === 0) {
        break
      }

      // Shift by 30 minutes and try again
      scheduledTime = new Date(scheduledTime.getTime() + 30 * 60 * 1000)
      attempt++
    }

    // Find available staff member (auto-assign)
    let assignedStaffId: string | null = null

    if (staffIdHint) {
      assignedStaffId = staffIdHint
    } else {
      // Get all active staff
      const { data: staffList, error: staffError } = await supabase
        .from('staff')
        .select('id')
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .limit(1)

      if (!staffError && staffList && staffList.length > 0) {
        assignedStaffId = staffList[0].id
      }
    }

    // Create delivery schedule record
    const { data: schedule, error: insertError } = await supabase
      .from('delivery_schedule')
      .insert({
        order_id: orderId,
        staff_id: assignedStaffId,
        scheduled_time: scheduledTime.toISOString(),
        status: 'scheduled',
      })
      .select()
      .single()

    if (insertError) {
      console.error('[SCHEDULING] Error creating delivery schedule:', insertError)
      return null
    }

    return {
      scheduledTime,
      staffId: assignedStaffId,
      success: true,
    }
  } catch (error) {
    console.error('[SCHEDULING] Exception during scheduling:', error)
    return null
  }
}

/**
 * Get all scheduled deliveries for a staff member
 */
export async function getStaffSchedule(staffId: string, date?: Date) {
  const supabase = getSupabaseServerClient()

  try {
    let query = supabase
      .from('delivery_schedule')
      .select('*, orders(id, user_id, delivery_address), staff(name, email)')
      .eq('staff_id', staffId)
      .eq('status', 'scheduled')

    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      query = query
        .gte('scheduled_time', startOfDay.toISOString())
        .lte('scheduled_time', endOfDay.toISOString())
    }

    const { data, error } = await query.order('scheduled_time', { ascending: true })

    if (error) {
      console.error('[SCHEDULING] Error fetching staff schedule:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('[SCHEDULING] Exception fetching staff schedule:', error)
    return []
  }
}

/**
 * Get all scheduled deliveries
 */
export async function getAllScheduledDeliveries(status: string = 'scheduled') {
  const supabase = getSupabaseServerClient()

  try {
    const { data, error } = await supabase
      .from('delivery_schedule')
      .select('*, orders(id, user_id, delivery_address), staff(id, name, email, phone)')
      .eq('status', status)
      .order('scheduled_time', { ascending: true })

    if (error) {
      console.error('[SCHEDULING] Error fetching all schedules:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('[SCHEDULING] Exception fetching all schedules:', error)
    return []
  }
}

/**
 * Update delivery status
 */
export async function updateDeliveryStatus(scheduleId: string, status: 'scheduled' | 'in-progress' | 'completed' | 'failed') {
  const supabase = getSupabaseServerClient()

  try {
    const updateData: any = { status }

    if (status === 'completed') {
      updateData.actual_delivery_time = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('delivery_schedule')
      .update(updateData)
      .eq('id', scheduleId)
      .select()
      .single()

    if (error) {
      console.error('[SCHEDULING] Error updating delivery status:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('[SCHEDULING] Exception updating delivery status:', error)
    return null
  }
}

/**
 * Reassign delivery to different staff
 */
export async function reassignDelivery(scheduleId: string, newStaffId: string) {
  const supabase = getSupabaseServerClient()

  try {
    const { data, error } = await supabase
      .from('delivery_schedule')
      .update({ staff_id: newStaffId })
      .eq('id', scheduleId)
      .select()
      .single()

    if (error) {
      console.error('[SCHEDULING] Error reassigning delivery:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('[SCHEDULING] Exception reassigning delivery:', error)
    return null
  }
}
