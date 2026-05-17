import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import LayoutChrome from '@/components/layout-chrome'

export const metadata: Metadata = {
  title: 'Flower Shop - Fresh Flowers Delivered',
  description: 'Beautiful, fresh flowers for every occasion. Fast and reliable delivery.',
}

type Props = {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <LayoutChrome>{children}</LayoutChrome>
    </NextIntlClientProvider>
  )
}
