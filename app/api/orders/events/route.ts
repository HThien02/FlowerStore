import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase'
import { scheduleDelivery } from '@/lib/scheduling'
import { sendEmail } from '@/lib/email/smtp'
import {
  generateOrderConfirmationEmail,
  generateAdminNotificationEmail,
  OrderEmailData,
} from '@/lib/email/templates'

interface OrderEventPayload {
  orderId: string
  userId: string
  eventType: 'created' | 'payment_success' | 'cancelled'
  orderData?: {
    customerName: string
    customerEmail: string
    customerPhone: string
    deliveryAddress: string
    items: Array<{ name: string; quantity: number; price: number }>
    subtotal: number
    deliveryCost: number
    total: number
    locale?: 'en' | 'vi'
  }
  cancellationReason?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const body: OrderEventPayload = await request.json()

    const { orderId, userId, eventType, orderData, cancellationReason } = body

    if (!orderId || !eventType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Get user profile for email
    let userEmail = orderData?.customerEmail || ''
    let userName = orderData?.customerName || 'Customer'

    if (!userEmail) {
      const { data: user } = await supabase.auth.admin.getUserById(userId)
      userEmail = user?.user?.email || ''
    }

    // Get admin emails for notifications
    const { data: admins } = await supabase
      .from('staff')
      .select('email')
      .eq('is_admin', true)
      .eq('status', 'active')

    const adminEmails = admins?.map((admin) => admin.email) || []

    // Handle different event types
    switch (eventType) {
      case 'created': {
        // Schedule delivery automatically
        const scheduleResult = await scheduleDelivery(orderId, order.created_at)

        if (scheduleResult?.success) {
          // Update order with schedule info
          await supabase
            .from('orders')
            .update({ scheduled_for: scheduleResult.scheduledTime.toISOString() })
            .eq('id', orderId)

          // Send order confirmation email to customer
          if (userEmail && orderData) {
            const emailData: OrderEmailData = {
              orderId,
              customerName: userName,
              customerEmail: userEmail,
              items: orderData.items,
              subtotal: orderData.subtotal,
              deliveryCost: orderData.deliveryCost,
              total: orderData.total,
              deliveryAddress: orderData.deliveryAddress,
              deliveryTime: scheduleResult.scheduledTime.toLocaleString(
                orderData.locale === 'vi' ? 'vi-VN' : 'en-US'
              ),
              locale: orderData.locale as 'en' | 'vi',
            }

            const emailHtml = generateOrderConfirmationEmail(emailData)
            await sendEmail(
              userEmail,
              `Order Confirmation - #${orderId}`,
              emailHtml,
              orderId,
              userId,
              'order-confirmation'
            )
          }

          // Send admin notification
          if (adminEmails.length > 0 && orderData) {
            const adminEmailData = {
              orderId,
              customerName: userName,
              customerEmail: userEmail,
              customerPhone: orderData.customerPhone,
              deliveryAddress: orderData.deliveryAddress,
              total: orderData.total,
              items: orderData.items,
              locale: orderData.locale as 'en' | 'vi',
            }

            const adminHtml = generateAdminNotificationEmail(adminEmailData)
            for (const adminEmail of adminEmails) {
              await sendEmail(
                adminEmail,
                `New Order - #${orderId}`,
                adminHtml,
                orderId,
                userId,
                'admin-notification'
              )
            }
          }
        }
        break
      }

      case 'payment_success': {
        // Update order payment status
        await supabase
          .from('orders')
          .update({ payment_status: 'completed' })
          .eq('id', orderId)

        // Send payment success email
        if (userEmail && orderData) {
          const emailData: OrderEmailData = {
            orderId,
            customerName: userName,
            customerEmail: userEmail,
            items: orderData.items,
            subtotal: orderData.subtotal,
            deliveryCost: orderData.deliveryCost,
            total: orderData.total,
            locale: orderData.locale as 'en' | 'vi',
          }

          const { generatePaymentSuccessEmail } = await import('@/lib/email/templates')
          const emailHtml = generatePaymentSuccessEmail(emailData)
          await sendEmail(
            userEmail,
            `Payment Received - Order #${orderId}`,
            emailHtml,
            orderId,
            userId,
            'payment-success'
          )
        }
        break
      }

      case 'cancelled': {
        // Update order status
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId)

        // Update order extensions
        await supabase
          .from('order_extensions')
          .update({
            cancelled_at: new Date().toISOString(),
            cancellation_reason: cancellationReason,
          })
          .eq('order_id', orderId)

        // Cancel delivery schedule
        await supabase
          .from('delivery_schedule')
          .update({ status: 'failed' })
          .eq('order_id', orderId)
          .eq('status', 'scheduled')

        // Send cancellation email
        if (userEmail && orderData) {
          const emailData: OrderEmailData = {
            orderId,
            customerName: userName,
            customerEmail: userEmail,
            items: orderData.items,
            subtotal: orderData.subtotal,
            deliveryCost: orderData.deliveryCost,
            total: orderData.total,
            locale: orderData.locale as 'en' | 'vi',
          }

          const { generateCancellationEmail } = await import('@/lib/email/templates')
          const emailHtml = generateCancellationEmail({ ...emailData, reason: cancellationReason })
          await sendEmail(
            userEmail,
            `Order Cancelled - #${orderId}`,
            emailHtml,
            orderId,
            userId,
            'cancellation'
          )
        }
        break
      }
    }

    return NextResponse.json({ success: true, orderId })
  } catch (error) {
    console.error('[API] Order event error:', error)
    return NextResponse.json({ error: 'Failed to process order event' }, { status: 500 })
  }
}
