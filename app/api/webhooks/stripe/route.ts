import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getSupabaseServerClient } from '@/lib/supabase'
import { notifyOrderEvent } from '@/lib/orders/notify-order'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')!

    let event
    try {
      event = getStripe().webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid signature'
      console.error('[stripe webhook]', msg)
      return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 })
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as { id: string; metadata: { orderId?: string } }
      const orderId = paymentIntent.metadata.orderId
      if (orderId) {
        const { error } = await supabase
          .from('orders')
          .update({
            payment_status: 'completed',
            stripe_payment_intent_id: paymentIntent.id,
            status: 'processing',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId)

        if (error) console.error('[stripe webhook] update order', error)
        else {
          void notifyOrderEvent(orderId, 'payment_success').catch((e) =>
            console.error('[stripe webhook] email', e)
          )
        }
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as { metadata: { orderId?: string } }
      const orderId = paymentIntent.metadata.orderId
      if (orderId) {
        await supabase
          .from('orders')
          .update({ payment_status: 'failed', updated_at: new Date().toISOString() })
          .eq('id', orderId)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[stripe webhook]', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
