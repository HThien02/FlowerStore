import { getRequestConfig } from 'next-intl/server'
import { routing } from './lib/i18n-routing'

type AppLocale = (typeof routing.locales)[number]

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale: AppLocale = (routing.locales as readonly string[]).includes(
    requested ?? ''
  )
    ? (requested as AppLocale)
    : routing.defaultLocale

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
