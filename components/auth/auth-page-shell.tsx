'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { Flower2 } from 'lucide-react'

type Props = {
  locale: string
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

/** Khung giao diện chung cho login / signup / reset-password */
export default function AuthPageShell({ locale, title, subtitle, children, footer }: Props) {
  return (
    <div className="min-h-[calc(100dvh-8rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center gap-2 text-rose-500 hover:text-rose-600 transition-colors"
          >
            <Flower2 className="w-7 h-7" />
            <span className="font-display font-semibold text-lg text-rose-950">TFlowers</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 pt-2">{title}</h2>
          {subtitle ? <p className="text-gray-600">{subtitle}</p> : null}
        </div>

        <div className="bg-white border border-rose-100 rounded-2xl shadow-sm p-6 sm:p-8">{children}</div>

        {footer ? <div>{footer}</div> : null}
      </div>
    </div>
  )
}

