"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BusinessUserWithDetails } from "@/lib/user-service";
import type { UserRole } from "@/lib/user-service";
import { useUpdateUser } from "../hooks/use-users";
import { toast } from "sonner";
import { User as UserIcon, Mail, Shield, Edit } from "lucide-react";

interface EditUserDialogProps {
  user: BusinessUserWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
}: EditUserDialogProps) {
  const t = useTranslations("users");
  const updateUserMutation = useUpdateUser();
  const roles: { value: string; label: string; description: string }[] = [
    { value: "admin", label: t("roles.admin"), description: t("roleDescriptions.admin") },
    { value: "manager", label: t("roles.manager"), description: t("roleDescriptions.manager") },
    { value: "staff", label: t("roles.staff"), description: t("roleDescriptions.staff") },
    { value: "cashier", label: t("roles.cashier"), description: t("roleDescriptions.cashier") },
  ];
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [isDirty, setIsDirty] = useState(false);

  // Reset form data when user changes or dialog opens
  useEffect(() => {
    if (user && open) {
      const newFormData = {
        name: user.user.fullName || "",
        email: user.user.email,
        role: user.role || "staff",
      };
      setFormData(newFormData);
      setIsDirty(false);
      setErrors({ name: "", email: "", role: "" });
    }
  }, [user, open]);

  const validateForm = () => {
    const newErrors = { name: "", email: "", role: "" };

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = t("errors.nameRequired");
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = t("errors.emailRequired");
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = t("errors.emailInvalid");
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = t("errors.roleRequired");
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const checkIfDirty = (newFormData: typeof formData) => {
    if (!user) return false;

    return (
      newFormData.name !== (user.user.fullName || "") ||
      newFormData.email !== user.user.email ||
      newFormData.role !== (user.role || "staff")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (!validateForm()) {
      return;
    }

    if (!isDirty) {
      toast.info(t("toasts.noChanges"));
      onOpenChange(false);
      return;
    }

    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        data: {
          fullName: formData.name.trim(),
          role: formData.role,
        },
      });

      toast.success(t("toasts.editSuccess", { name: formData.name }));
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("toasts.editFailed"),
      );
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form data to original values
    if (user) {
      const originalData = {
        name: user.user.fullName || "",
        email: user.user.email,
        role: user.role || "staff",
      };
      setFormData(originalData);
      setIsDirty(false);
      setErrors({ name: "", email: "", role: "" });
    }
  };

  const isLoading = updateUserMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            {t("editUser")}
          </DialogTitle>
          <DialogDescription>
            {t("form.editDesc")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                {t("fullName")}
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="name"
                  placeholder={t("form.fullNamePlaceholder")}
                  value={formData.name}
                  onChange={(e) => {
                    const newFormData = { ...formData, name: e.target.value };
                    setFormData(newFormData);
                    setIsDirty(checkIfDirty(newFormData));
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                {t("email")}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t("form.emailPlaceholder")}
                  value={formData.email}
                  onChange={(e) => {
                    const newFormData = { ...formData, email: e.target.value };
                    setFormData(newFormData);
                    setIsDirty(checkIfDirty(newFormData));
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Role Field */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">
                {t("role")}
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => {
                  const newFormData = { ...formData, role: value };
                  setFormData(newFormData);
                  setIsDirty(checkIfDirty(newFormData));
                  if (errors.role) setErrors({ ...errors, role: "" });
                }}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <SelectValue placeholder={t("form.selectRole")} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{role.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {role.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role}</p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isLoading || !isDirty}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full border-2 border-t-transparent border-white h-4 w-4" />
                  {t("form.submitting")}
                </div>
              ) : (
                t("form.saveChanges")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
