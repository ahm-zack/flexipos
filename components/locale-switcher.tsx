"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();

  function toggle() {
    const next: Locale = locale === "en" ? "ar" : "en";
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="font-medium min-w-[3rem]"
      title={locale === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
    >
      {locale === "en" ? "عربي" : "EN"}
    </Button>
  );
}
