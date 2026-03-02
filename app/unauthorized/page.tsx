import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle, Home } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function UnauthorizedPage() {
  const t = await getTranslations("auth");

  return (
    <div className="container mx-auto py-16 px-4 text-center">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <AlertTriangle className="h-24 w-24 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-red-600 mb-2">
            {t("unauthorized.title")}
          </h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            {t("unauthorized.subtitle")}
          </h2>
          <p className="text-gray-600 mb-6">{t("unauthorized.message")}</p>
        </div>

        <div className="space-y-4">
          <Link href="/">
            <Button className="w-full">
              <Home className="h-4 w-4 me-2" />
              {t("unauthorized.backHome")}
            </Button>
          </Link>

          <p className="text-sm text-gray-500 pt-4">
            {t("unauthorized.contactAdmin")}
          </p>
        </div>
      </div>
    </div>
  );
}
