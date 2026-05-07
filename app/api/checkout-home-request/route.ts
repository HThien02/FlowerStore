import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import {
  homeDeliveryCustomerEmail,
  homeDeliveryStaffEmail,
  type HomeDeliveryForm,
} from '@/lib/email/templates/home-delivery-request'

type Body = HomeDeliveryForm & {
  locale?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body
    const { locale = 'en', deliveryInfo, items, subtotal } = body

    if (!deliveryInfo?.email?.trim() || !items?.length) {
      return NextResponse.json({ error: 'Missing email or items' }, { status: 400 })
    }

    const loc = locale === 'vi' ? 'vi' : 'en'
    const payload: HomeDeliveryForm = { deliveryInfo, items, subtotal }

    const customer = homeDeliveryCustomerEmail(loc, payload)
    const staff = homeDeliveryStaffEmail(payload)

    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

    if (apiKey) {
      const resend = new Resend(apiKey)
      await resend.emails.send({
        from,
        to: deliveryInfo.email,
        subject: customer.subject,
        html: customer.html,
      })

      const notify = process.env.RESEND_NOTIFY_EMAIL
      if (notify) {
        await resend.emails.send({
          from,
          to: notify,
          subject: staff.subject,
          html: staff.html,
        })
      }
    } else {
      console.warn('[checkout-home-request] RESEND_API_KEY not set — email skipped')
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[checkout-home-request]', e)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
