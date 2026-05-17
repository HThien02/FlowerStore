'use client'

import { useLocale } from 'next-intl'
import { Star } from 'lucide-react'

export default function TestimonialsSection() {
  const locale = useLocale()

  const testimonials = [
    {
      id: 1,
      name: locale === 'en' ? 'Sarah Anderson' : 'Sarah Anderson',
      role: locale === 'en' ? 'Happy Customer' : 'Khách Hàng Hài Lòng',
      content:
        locale === 'en'
          ? 'The flowers were absolutely stunning and arrived fresh. Highly recommended!'
          : 'Những bông hoa thật đẹp lắm và tươi tính. Rất đáng giới thiệu!',
      rating: 5,
    },
    {
      id: 2,
      name: locale === 'en' ? 'John Smith' : 'John Smith',
      role: locale === 'en' ? 'Verified Buyer' : 'Người Mua Xác Minh',
      content:
        locale === 'en'
          ? 'Excellent service and delivery was faster than expected. Thank you!'
          : 'Dịch vụ tuyệt vời và giao hàng nhanh hơn dự kiến. Cảm ơn!',
      rating: 5,
    },
    {
      id: 3,
      name: locale === 'en' ? 'Emma Wilson' : 'Emma Wilson',
      role: locale === 'en' ? 'Regular Customer' : 'Khách Hàng Thường Xuyên',
      content:
        locale === 'en'
          ? 'Been ordering from them for months. Never disappointed with the quality.'
          : 'Đã đặt hàng từ họ hàng tháng. Không bao giờ thất vọng với chất lượng.',
      rating: 5,
    },
  ]

  return (
    <div className="py-16 sm:py-20">
      <div className="w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {locale === 'en' ? 'What Our Customers Say' : 'Khách Hàng Nói Gì Về Chúng Tôi'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">{testimonial.content}</p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
