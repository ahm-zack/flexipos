"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateUser } from "../hooks/use-users";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/user-service";

export function CreateUserForm() {
  const t = useTranslations("users");
  const router = useRouter();
  const createUserMutation = useCreateUser();
  const roles: { value: UserRole; label: string }[] = [
    { value: "admin", label: t("roles.admin") },
    { value: "manager", label: t("roles.manager") },
    { value: "staff", label: t("roles.staff") },
  ];
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "" as UserRole,
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.role) {
      toast.error(t("errors.roleRequired"));
      return;
    }

    try {
      await createUserMutation.mutateAsync({
        email: formData.email,
        name: formData.name,
        role: formData.role,
        password: formData.password,
      });

      toast.success(t("toasts.createSuccess"));
      // Reset form
      setFormData({
        email: "",
        name: "",
        role: "" as UserRole,
        password: "",
      });
      // Navigate back to users list
      router.push("/admin/users");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("toasts.addFailed"),
      );
    }
  };

  const isLoading = createUserMutation.isPending;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t("form.createTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("fullName")}</Label>
              <Input
                id="name"
                type="text"
                placeholder={t("form.fullNamePlaceholder")}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("form.emailPlaceholder")}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">{t("role")}</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) =>
                  setFormData({ ...formData, role: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("form.selectRole")} />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("form.passwordPlaceholder")}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("form.submitting") : t("addUser")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/users")}
              disabled={isLoading}
            >
              {t("cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
