import { NextRequest, NextResponse } from 'next/server'
import {
  getAllScheduledDeliveries,
  getStaffSchedule,
  updateDeliveryStatus,
  reassignDelivery,
} from '@/lib/scheduling'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const staffId = searchParams.get('staffId')
    const date = searchParams.get('date')
    const status = searchParams.get('status') || 'scheduled'

    if (staffId) {
      // Get schedule for specific staff member
      const scheduleDate = date ? new Date(date) : undefined
      const schedule = await getStaffSchedule(staffId, scheduleDate)
      return NextResponse.json(schedule)
    }

    // Get all scheduled deliveries
    const allSchedules = await getAllScheduledDeliveries(status)
    return NextResponse.json(allSchedules)
  } catch (error) {
    console.error('[API] Schedule GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { scheduleId, status, newStaffId } = body

    if (!scheduleId) {
      return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 })
    }

    // Update status
    if (status) {
      const validStatuses = ['scheduled', 'in-progress', 'completed', 'failed']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }

      const updated = await updateDeliveryStatus(
        scheduleId,
        status as 'scheduled' | 'in-progress' | 'completed' | 'failed'
      )
      if (!updated) {
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
      }

      return NextResponse.json(updated)
    }

    // Reassign to different staff
    if (newStaffId) {
      const reassigned = await reassignDelivery(scheduleId, newStaffId)
      if (!reassigned) {
        return NextResponse.json({ error: 'Failed to reassign delivery' }, { status: 500 })
      }

      return NextResponse.json(reassigned)
    }

    return NextResponse.json({ error: 'No action specified' }, { status: 400 })
  } catch (error) {
    console.error('[API] Schedule PUT error:', error)
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 })
  }
}
