import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getSupabaseServerClient } from '@/lib/supabase'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient()
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')!

    let event
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err: any) {
      console.error('[v0] Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    // Handle payment intent succeeded
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as any

      // Update order payment status
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'completed',
          stripe_payment_intent_id: paymentIntent.id,
          status: 'processing',
        })
        .eq('id', paymentIntent.metadata.orderId)

      if (error) {
        console.error('[v0] Error updating order:', error)
      }
    }

    // Handle payment intent failed
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as any

      // Update order payment status
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
        })
        .eq('id', paymentIntent.metadata.orderId)

      if (error) {
        console.error('[v0] Error updating order:', error)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[v0] Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
