import { getTranslations } from "next-intl/server";

export default async function SettingsPage() {
  const t = await getTranslations("settings");
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">⚙️ {t("title")}</h1>
        <div className="space-y-6">
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">{t("businessSettings")}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                <span>{t("businessName")}</span>
                <span className="font-semibold">Lazaza Restaurant</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                <span>{t("taxRate")}</span>
                <span className="font-semibold">8.5%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                <span>{t("serviceCharge")}</span>
                <span className="font-semibold">15%</span>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">{t("systemSettings")}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                <span>{t("theme")}</span>
                <span className="font-semibold">{t("themes.system")}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                <span>{t("language")}</span>
                <span className="font-semibold">{t("languages.en")}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded">
                <span>{t("currency")}</span>
                <span className="font-semibold">{t("usd")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
