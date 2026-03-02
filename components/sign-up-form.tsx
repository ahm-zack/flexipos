"use client";

import { cn } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

type BusinessFormData = {
  name: string;
  type: string;
  phone: string;
  address: string;
  city: string;
  country: string;
};

const BUSINESS_TYPE_VALUES = [
  "restaurant",
  "retail",
  "service",
  "cafe",
  "bakery",
  "pharmacy",
  "grocery",
] as const;

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations("auth");
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [businessData, setBusinessData] = useState<BusinessFormData>({
    name: "",
    type: "restaurant",
    phone: "",
    address: "",
    city: "",
    country: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== repeatPassword) {
      setError(t("signup.errors.passwordsMismatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("signup.errors.passwordTooShort"));
      return;
    }

    setIsLoading(true);

    try {
      // Call Step 1 API: Create auth user and users table entry
      const response = await fetch("/api/auth/signup/step1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("signup.errors.createAccountFailed"));
      }

      // Store userId and move to step 2
      setUserId(data.data.userId);
      setStep(2);
      console.log("✅ Step 1 complete: User created");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!userId) {
      setError(t("signup.errors.sessionExpired"));
      setStep(1);
      setIsLoading(false);
      return;
    }

    try {
      // Call Step 2 API: Create business and link to user
      const response = await fetch("/api/auth/signup/step2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          business: {
            name: businessData.name,
            phone: businessData.phone,
            address: businessData.address
              ? `${businessData.address}, ${businessData.city}, ${businessData.country}`
              : null,
            timezone: "Asia/Riyadh",
            currency: "SAR",
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("signup.errors.createBusinessFailed"));
      }

      console.log("✅ Step 2 complete: Business created");

      // Success! Redirect to login
      router.push(
        "/login?message=Account created successfully! Please log in.",
      );
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const isStep1Valid =
    email &&
    password &&
    password.length >= 6 &&
    repeatPassword &&
    password === repeatPassword;
  const isStep2Valid =
    businessData.name && businessData.type && businessData.phone;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">
            {step === 1 ? t("signup.step1Title") : t("signup.step2Title")}
          </CardTitle>
          <CardDescription>
            {step === 1
              ? t("signup.step1Description")
              : t("signup.step2Description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          {step === 1 ? (
            <form onSubmit={handleNextStep}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">{t("signup.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("signup.emailPlaceholder")}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">{t("signup.password")}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t("signup.passwordPlaceholder")}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {password && password.length < 6 && (
                    <p className="text-xs text-muted-foreground">
                      {t("signup.passwordTooShort")}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password">
                    {t("signup.repeatPassword")}
                  </Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    placeholder={t("signup.repeatPasswordPlaceholder")}
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                  {repeatPassword && password !== repeatPassword && (
                    <p className="text-xs text-destructive">
                      {t("signup.passwordsMismatch")}
                    </p>
                  )}
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isStep1Valid || isLoading}
                >
                  {isLoading ? t("signup.creatingAccount") : t("signup.next")}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                {t("signup.alreadyHaveAccount")}{" "}
                <Link href="/login" className="underline underline-offset-4">
                  {t("signup.loginLink")}
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="business-name">
                    {t("signup.businessNameRequired")}
                  </Label>
                  <Input
                    id="business-name"
                    type="text"
                    placeholder={t("signup.businessNamePlaceholder")}
                    required
                    value={businessData.name}
                    onChange={(e) =>
                      setBusinessData({ ...businessData, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="business-type">
                    {t("signup.businessType")}
                  </Label>
                  <Select
                    value={businessData.type}
                    onValueChange={(value) =>
                      setBusinessData({ ...businessData, type: value })
                    }
                  >
                    <SelectTrigger id="business-type">
                      <SelectValue
                        placeholder={t("signup.businessTypePlaceholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPE_VALUES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {t(`signup.businessTypes.${value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">{t("signup.phone")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t("signup.phonePlaceholder")}
                    required
                    value={businessData.phone}
                    onChange={(e) =>
                      setBusinessData({
                        ...businessData,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">{t("signup.address")}</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder={t("signup.addressPlaceholder")}
                    value={businessData.address}
                    onChange={(e) =>
                      setBusinessData({
                        ...businessData,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="city">{t("signup.city")}</Label>
                    <Input
                      id="city"
                      type="text"
                      placeholder={t("signup.cityPlaceholder")}
                      value={businessData.city}
                      onChange={(e) =>
                        setBusinessData({
                          ...businessData,
                          city: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="country">{t("signup.country")}</Label>
                    <Input
                      id="country"
                      type="text"
                      placeholder={t("signup.countryPlaceholder")}
                      value={businessData.country}
                      onChange={(e) =>
                        setBusinessData({
                          ...businessData,
                          country: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setStep(1);
                      setError(null);
                    }}
                    disabled={isLoading}
                  >
                    Back
                  </Button> */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!isStep2Valid || isLoading}
                  >
                    {isLoading
                      ? t("signup.creatingAccount")
                      : t("signup.signUp")}
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                {t("signup.alreadyHaveAccount")}{" "}
                <Link href="/login" className="underline underline-offset-4">
                  {t("signup.loginLink")}
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
