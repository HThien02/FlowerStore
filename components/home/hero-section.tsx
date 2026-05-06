'use client'

import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HeroSection() {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-rose-50 to-pink-50 py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
              {t('home.title')}
            </h1>
            <p className="text-lg text-gray-600">
              {t('home.subtitle')}
            </p>
            <Link href={`/${locale}/shop`}>
              <Button size="lg" className="bg-rose-500 hover:bg-rose-600">
                {t('home.cta')}
              </Button>
            </Link>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div>
                <p className="text-2xl font-bold text-rose-500">500+</p>
                <p className="text-sm text-gray-600">{locale === 'en' ? 'Products' : 'Sản Phẩm'}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-500">1000+</p>
                <p className="text-sm text-gray-600">{locale === 'en' ? 'Happy Customers' : 'Khách Hàng'}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-500">24h</p>
                <p className="text-sm text-gray-600">{locale === 'en' ? 'Delivery' : 'Giao Hàng'}</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative h-96 sm:h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-pink-300 rounded-2xl opacity-20" />
            <div className="flex items-center justify-center h-full text-6xl">
              🌹
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
