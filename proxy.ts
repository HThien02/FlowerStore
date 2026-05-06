import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'vi'],

  // If this locale is matched in the pathname, the middleware will
  // not alter the pathname
  defaultLocale: 'en',

  // The locale prefix strategy determines how locales appear in the URL
  localePrefix: 'as-needed',
});

export const config = {
  // Skip all paths that should not be internationalized. This example
  // skips the folders "admin", "_next" and all files with an extension
  // (e.g. favicon.ico)
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
