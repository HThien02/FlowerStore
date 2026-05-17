import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase'
import {
  getStaffMembers,
  getStaffById,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
  deactivateStaffMember,
  activateStaffMember,
} from '@/lib/staff'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const staffId = searchParams.get('id')
    const active = searchParams.get('active') !== 'false'

    if (staffId) {
      // Get single staff member
      const staff = await getStaffById(staffId)
      if (!staff) {
        return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
      }
      return NextResponse.json(staff)
    }

    // Get all staff members
    const staffList = await getStaffMembers(active)
    return NextResponse.json(staffList)
  } catch (error) {
    console.error('[API] Staff GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, is_admin, user_id, action } = body

    if (action === 'deactivate' || action === 'activate') {
      const staffId = body.staffId
      if (!staffId) {
        return NextResponse.json({ error: 'Staff ID required' }, { status: 400 })
      }

      if (action === 'deactivate') {
        const result = await deactivateStaffMember(staffId)
        if (!result) {
          return NextResponse.json({ error: 'Failed to deactivate staff' }, { status: 500 })
        }
        return NextResponse.json(result)
      } else {
        const result = await activateStaffMember(staffId)
        if (!result) {
          return NextResponse.json({ error: 'Failed to activate staff' }, { status: 500 })
        }
        return NextResponse.json(result)
      }
    }

    // Create new staff member
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      )
    }

    const newStaff = await createStaffMember({
      name,
      email,
      phone,
      is_admin: is_admin || false,
      user_id: user_id || undefined,
    })

    if (!newStaff) {
      return NextResponse.json({ error: 'Failed to create staff member' }, { status: 500 })
    }

    return NextResponse.json(newStaff, { status: 201 })
  } catch (error) {
    console.error('[API] Staff POST error:', error)
    return NextResponse.json({ error: 'Failed to create staff member' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Staff ID required' }, { status: 400 })
    }

    const updatedStaff = await updateStaffMember(id, updates)
    if (!updatedStaff) {
      return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 })
    }

    return NextResponse.json(updatedStaff)
  } catch (error) {
    console.error('[API] Staff PUT error:', error)
    return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const staffId = searchParams.get('id')

    if (!staffId) {
      return NextResponse.json({ error: 'Staff ID required' }, { status: 400 })
    }

    const success = await deleteStaffMember(staffId)
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete staff member' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: staffId })
  } catch (error) {
    console.error('[API] Staff DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete staff member' }, { status: 500 })
  }
}
