import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, LOCALE_COOKIE, locales, type Locale } from './config';

export default getRequestConfig(async () => {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value as Locale | undefined;
    const locale: Locale =
        cookieLocale && locales.includes(cookieLocale) ? cookieLocale : defaultLocale;

    const messages = (await import(`../../messages/${locale}/index.ts`)).default;

    return {
        locale,
        messages,
    };
});
