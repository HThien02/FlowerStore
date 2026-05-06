'use client'

import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">🌹</span>
              </div>
              <span className="font-bold text-lg">Flower Shop</span>
            </div>
            <p className="text-gray-400 text-sm">
              {locale === 'en'
                ? 'Fresh flowers for every occasion'
                : 'Hoa tươi cho mọi dịp'}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold mb-4">{t('nav.shop')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href={`/${locale}/shop`} className="hover:text-white transition">
                  {locale === 'en' ? 'All Flowers' : 'Tất Cả Hoa'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/shop?featured=true`} className="hover:text-white transition">
                  {locale === 'en' ? 'Featured' : 'Nổi Bật'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/shop?sort=newest`} className="hover:text-white transition">
                  {locale === 'en' ? 'New Arrivals' : 'Hàng Mới'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold mb-4">{t('nav.contact')}</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href={`/${locale}/contact`} className="hover:text-white transition">
                  {locale === 'en' ? 'Contact Us' : 'Liên Hệ'}
                </a>
              </li>
              <li>
                <a href={`/${locale}/faq`} className="hover:text-white transition">
                  {locale === 'en' ? 'FAQ' : 'Câu Hỏi Thường Gặp'}
                </a>
              </li>
              <li>
                <a href={`/${locale}/delivery`} className="hover:text-white transition">
                  {locale === 'en' ? 'Delivery Info' : 'Thông Tin Giao Hàng'}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4">{locale === 'en' ? 'Get in Touch' : 'Liên Hệ'}</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:info@flowershop.com" className="hover:text-white transition">
                  info@flowershop.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+84123456789" className="hover:text-white transition">
                  +84 (123) 456-789
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>{locale === 'en' ? 'Ho Chi Minh City, Vietnam' : 'TP. Hồ Chí Minh, Việt Nam'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; 2024 Flower Shop. {locale === 'en' ? 'All rights reserved.' : 'Bảo lưu mọi quyền.'}</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href={`/${locale}/privacy`} className="hover:text-white transition">
                {locale === 'en' ? 'Privacy Policy' : 'Chính Sách Bảo Mật'}
              </a>
              <a href={`/${locale}/terms`} className="hover:text-white transition">
                {locale === 'en' ? 'Terms of Service' : 'Điều Khoản Dịch Vụ'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
