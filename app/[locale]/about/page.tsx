import { getTranslations } from 'next-intl/server'

export default async function AboutPage() {
  const t = await getTranslations()

  return (
    <div className="w-full py-16 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{t('nav.about')}</h1>
      <p className="text-gray-600 leading-relaxed">
        We are a flower shop dedicated to fresh bouquets and reliable delivery. Our team
        sources blooms daily so every arrangement arrives vibrant and on time.
      </p>
      <p className="text-gray-600 leading-relaxed">
        Whether it&apos;s a celebration, a thank-you, or a quiet moment—Thank you for
        letting us be part of your story.
      </p>
    </div>
  )
}
