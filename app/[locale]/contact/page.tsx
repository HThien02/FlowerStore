import { getTranslations } from 'next-intl/server'

export default async function ContactPage() {
  const t = await getTranslations()

  return (
    <div className="w-full py-16 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{t('nav.contact')}</h1>
      <p className="text-gray-600 leading-relaxed">
        For orders, partnerships, or questions, reach out—we typically reply within one
        business day.
      </p>
      <div className="rounded-lg border bg-gray-50 p-6 text-gray-800">
        <p className="font-medium mb-2">Email</p>
        <a href="mailto:support@example.com" className="text-rose-600 hover:underline">
          support@example.com
        </a>
        <p className="font-medium mt-4 mb-2">Hours</p>
        <p className="text-sm text-gray-600">Mon–Sat, 9:00–18:00</p>
      </div>
    </div>
  )
}
