import { CartPageClient } from '@/components/cart/cart-page-client'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return {
    title: locale === 'en' ? 'Shopping Cart | Flower Shop' : 'Giỏ Hàng | Flower Shop',
  }
}

export default async function CartPage({ params }: Props) {
  const { locale } = await params
  return <CartPageClient locale={locale} />
}
