import { CheckoutProvider } from '@/lib/checkout-context'
import { CartProvider } from '@/lib/cart-context'
import CheckoutClient from '@/components/checkout/checkout-client'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return {
    title: locale === 'en' ? 'Checkout | Flower Shop' : 'Thanh Toán | Flower Shop',
  }
}

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params

  return (
    <CheckoutProvider>
      <CheckoutClient locale={locale} />
    </CheckoutProvider>
  )
}
