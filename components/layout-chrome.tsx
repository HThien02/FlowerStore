'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import SiteContainer from '@/components/site-container'

export default function LayoutChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.includes('/admin')

  if (isAdmin) {
    return (
      <div className="flex flex-col min-h-dvh w-full min-w-0 flex-1">
        {children}
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dvh w-full min-w-0">
      <Navigation />
      <main className="flex-1 flex flex-col w-full min-w-0">
        <SiteContainer className="flex-1 min-w-0">{children}</SiteContainer>
      </main>
      <Footer />
    </div>
  )
}
