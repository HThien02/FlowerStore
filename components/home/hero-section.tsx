'use client'

import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

export default function HeroSection() {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <div className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0">
        <span className="petal-drift absolute top-16 left-[10%] text-4xl opacity-40">🌸</span>
        <span className="petal-drift absolute top-32 right-[15%] text-3xl opacity-30" style={{ animationDelay: '1s' }}>✿</span>
        <span className="petal-drift absolute bottom-20 left-[20%] text-2xl opacity-35" style={{ animationDelay: '2s' }}>🌷</span>
      </div>

      <div className="w-full relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-in fade-in slide-in-from-left-6 duration-700">
            <p className="inline-flex items-center gap-2 rounded-full bg-rose-100/80 px-4 py-1.5 text-sm font-medium text-rose-700">
              <Sparkles className="w-4 h-4" />
              {locale === 'vi' ? 'Hoa tươi mỗi ngày' : 'Fresh blooms daily'}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-rose-950 leading-tight font-display">
              {t('home.title')}
            </h1>
            <p className="text-lg text-rose-900/70 max-w-lg">{t('home.subtitle')}</p>
            <Link href={`/${locale}/shop`}>
              <Button size="lg" className="rounded-full btn-bloom text-base px-8 h-12">
                {t('home.cta')}
              </Button>
            </Link>

            <div className="grid grid-cols-3 gap-4 pt-6">
              {[
                { n: '500+', l: locale === 'en' ? 'Bouquets' : 'Bó hoa' },
                { n: '1000+', l: locale === 'en' ? 'Smiles' : 'Nụ cười' },
                { n: '24h', l: locale === 'en' ? 'Delivery' : 'Giao nhanh' },
              ].map((s) => (
                <div key={s.l} className="floral-card p-3 text-center">
                  <p className="text-xl font-bold text-primary font-display">{s.n}</p>
                  <p className="text-xs text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-80 sm:h-96 float-gentle">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-rose-300 via-pink-200 to-amber-100 shadow-xl shadow-rose-200/50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[7rem] sm:text-[9rem] drop-shadow-lg">💐</span>
            </div>
            <div className="absolute -bottom-2 -right-2 rounded-2xl bg-white/90 px-4 py-2 text-sm font-medium text-rose-700 shadow-md border border-rose-100">
              {locale === 'vi' ? 'Đặt lịch nhận hoa dễ dàng' : 'Schedule your pickup'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
