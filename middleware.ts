import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { defaultLocale, LOCALE_COOKIE, locales, type Locale } from '@/lib/i18n/config'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  // Ensure NEXT_LOCALE cookie is set so next-intl can read it server-side
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value as Locale | undefined
  const locale: Locale =
    cookieLocale && locales.includes(cookieLocale) ? cookieLocale : defaultLocale

  if (!cookieLocale || !locales.includes(cookieLocale)) {
    // Clone the response and set the cookie
    const res = response instanceof NextResponse ? response : NextResponse.next()
    res.cookies.set(LOCALE_COOKIE, locale, { path: '/', sameSite: 'lax' })
    return res
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}