"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Save, ShieldCheck } from "lucide-react";
import { useBusiness } from "@/hooks/useBusinessId";
import type { BusinessProfile } from "@/lib/business-profile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BusinessSettingsFormState {
  name: string;
  nameAr: string;
  address: string;
  addressAr: string;
  phone: string;
  email: string;
  website: string;
  vatNumber: string;
  crNumber: string;
}

function buildFormState(business?: BusinessProfile | null): BusinessSettingsFormState {
  return {
    name: business?.name || "",
    nameAr: business?.nameAr || "",
    address: business?.address || "",
    addressAr: business?.addressAr || "",
    phone: business?.phone || "",
    email: business?.email || "",
    website: business?.website || "",
    vatNumber: business?.vatNumber || "",
    crNumber: business?.crNumber || "",
  };
}

export function BusinessSettingsForm() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("settings");
  const { business, loading, error, refreshBusiness } = useBusiness();
  const [formState, setFormState] = React.useState<BusinessSettingsFormState>(
    buildFormState(),
  );
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setFormState(buildFormState(business));
  }, [business]);

  const handleChange =
    (field: keyof BusinessSettingsFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormState((current) => ({ ...current, [field]: value }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/business-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || t("saveFailed"));
      }

      await refreshBusiness();
      router.refresh();
      toast.success(t("saved"));
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : t("saveFailed");
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const qrReady = Boolean(
    formState.name.trim() && /^\d{15}$/.test(formState.vatNumber.trim()),
  );

  return (
    <div
      className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-6 lg:p-8"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("subtitle")}
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5 shadow-none">
        <CardHeader className="gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <CardTitle>{t("qrRequirementsTitle")}</CardTitle>
              <CardDescription>{t("qrRequirementsDescription")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="rounded-lg border bg-background/80 p-4">
            <div className="font-medium text-foreground">{t("statusTitle")}</div>
            <div className="mt-2">
              {qrReady ? t("qrStatusReady") : t("qrStatusMissing")}
            </div>
          </div>
          <div className="rounded-lg border bg-background/80 p-4">
            <div className="font-medium text-foreground">{t("optionalFieldsTitle")}</div>
            <div className="mt-2">{t("optionalFieldsDescription")}</div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/40">
          <CardContent className="pt-6 text-sm text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      <form className="grid gap-6" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{t("businessProfileTitle")}</CardTitle>
            <CardDescription>{t("businessProfileDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="name">{t("englishName")}</Label>
              <Input
                id="name"
                value={formState.name}
                onChange={handleChange("name")}
                placeholder={t("placeholders.englishName")}
                disabled={loading || isSaving}
              />
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="nameAr">{t("arabicName")}</Label>
              <Input
                id="nameAr"
                dir="rtl"
                value={formState.nameAr}
                onChange={handleChange("nameAr")}
                placeholder={t("placeholders.arabicName")}
                disabled={loading || isSaving}
              />
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input
                id="phone"
                value={formState.phone}
                onChange={handleChange("phone")}
                placeholder={t("placeholders.phone")}
                disabled={loading || isSaving}
              />
            </div>

            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={formState.email}
                onChange={handleChange("email")}
                placeholder={t("placeholders.email")}
                disabled={loading || isSaving}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">{t("englishAddress")}</Label>
              <Textarea
                id="address"
                value={formState.address}
                onChange={handleChange("address")}
                placeholder={t("placeholders.englishAddress")}
                disabled={loading || isSaving}
                rows={3}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressAr">{t("arabicAddress")}</Label>
              <Textarea
                id="addressAr"
                dir="rtl"
                value={formState.addressAr}
                onChange={handleChange("addressAr")}
                placeholder={t("placeholders.arabicAddress")}
                disabled={loading || isSaving}
                rows={3}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="website">{t("website")}</Label>
              <Input
                id="website"
                value={formState.website}
                onChange={handleChange("website")}
                placeholder={t("placeholders.website")}
                disabled={loading || isSaving}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("invoiceProfileTitle")}</CardTitle>
            <CardDescription>{t("invoiceProfileDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vatNumber">{t("vatNumber")}</Label>
              <Input
                id="vatNumber"
                value={formState.vatNumber}
                onChange={handleChange("vatNumber")}
                placeholder={t("placeholders.vatNumber")}
                disabled={loading || isSaving}
                inputMode="numeric"
              />
              <p className="text-xs text-muted-foreground">
                {t("vatNumberHint")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="crNumber">{t("crNumber")}</Label>
              <Input
                id="crNumber"
                value={formState.crNumber}
                onChange={handleChange("crNumber")}
                placeholder={t("placeholders.crNumber")}
                disabled={loading || isSaving}
              />
              <p className="text-xs text-muted-foreground">
                {t("crNumberHint")}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="submit" disabled={loading || isSaving}>
            <Save className="size-4" />
            {isSaving ? t("saving") : t("save")}
          </Button>
        </div>
      </form>
    </div>
  );
}