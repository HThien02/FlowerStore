import Stripe from 'stripe'

let stripeClient: Stripe | null = null

/** Lazily create the client so `next build` does not require env vars at module load. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: '2024-11-20' as any,
    })
  }
  return stripeClient
}
