'use client'

import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HeroSection() {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-background via-muted to-background min-h-screen py-20 sm:py-32">
      {/* Decorative floating elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-accent/20 rounded-full float-animation opacity-70 blur-2xl" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-primary/10 rounded-full float-animation opacity-60 blur-3xl animation-delay-2000" />
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-secondary/15 rounded-full float-animation opacity-50 blur-xl animation-delay-4000" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4 bounce-in-animation">
              <div className="inline-block">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-primary font-semibold text-sm">
                  <span className="text-lg">🌸</span>
                  {locale === 'en' ? 'Fresh Flowers Delivered Daily' : 'Hoa Tươi Giao Hàng Hàng Ngày'}
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold leading-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                {t('home.title')}
              </h1>
              <p className="text-xl text-foreground/70 leading-relaxed">
                {t('home.subtitle')}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link href={`/${locale}/shop`}>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-secondary text-primary-foreground font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  {t('home.cta')}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-primary text-primary hover:bg-muted font-semibold"
              >
                {locale === 'en' ? 'Learn More' : 'Tìm Hiểu Thêm'}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all">
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">500+</p>
                <p className="text-sm text-foreground/60 font-medium">{locale === 'en' ? 'Products' : 'Sản Phẩm'}</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border hover:border-accent/50 hover:shadow-lg transition-all">
                <p className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">1000+</p>
                <p className="text-sm text-foreground/60 font-medium">{locale === 'en' ? 'Happy Customers' : 'Khách Hàng'}</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border hover:border-secondary/50 hover:shadow-lg transition-all">
                <p className="text-3xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">24h</p>
                <p className="text-sm text-foreground/60 font-medium">{locale === 'en' ? 'Delivery' : 'Giao Hàng'}</p>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative h-96 sm:h-[500px] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl" />
            <div className="relative z-10 text-center">
              <div className="text-[150px] sm:text-[200px] float-animation drop-shadow-lg">
                🌹
              </div>
              <div className="mt-8 space-y-2">
                <p className="text-primary font-semibold text-lg">{locale === 'en' ? 'Premium Quality' : 'Chất Lượng Cao'}</p>
                <p className="text-foreground/60">{locale === 'en' ? 'Hand-picked fresh flowers' : 'Những bông hoa tươi được lựa chọn kỹ'}</p>
              </div>
            </div>

            {/* Floating flower decorations */}
            <div className="absolute top-0 left-0 text-4xl float-animation opacity-50">🌻</div>
            <div className="absolute bottom-20 right-10 text-3xl float-animation opacity-60 animation-delay-2000">🌷</div>
            <div className="absolute top-1/3 right-0 text-5xl float-animation opacity-40 animation-delay-4000">💐</div>
          </div>
        </div>
      </div>
    </div>
  )
}
