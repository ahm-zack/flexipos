"use client";

import { useState } from "react";
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
import type { UserRole } from "@/lib/user-service";
import { useCreateUser } from "../hooks/use-users";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, User, Lock, Shield } from "lucide-react";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddUserDialog({ open, onOpenChange }: AddUserDialogProps) {
  const t = useTranslations("users");
  const createUserMutation = useCreateUser();
  const roles: { value: UserRole; label: string; description: string }[] = [
    { value: "admin", label: t("roles.admin"), description: t("roleDescriptions.admin") },
    { value: "manager", label: t("roles.manager"), description: t("roleDescriptions.manager") },
    { value: "staff", label: t("roles.staff"), description: t("roleDescriptions.staff") },
  ];
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "" as UserRole,
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      role: "",
      password: "",
      confirmPassword: "",
    };

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = t("errors.nameRequired");
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t("errors.nameTooShort");
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

    // Password validation
    if (!formData.password) {
      newErrors.password = t("errors.passwordRequired");
    } else if (formData.password.length < 8) {
      newErrors.password = t("errors.passwordTooShort");
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("errors.confirmRequired");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("errors.passwordMismatch");
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createUserMutation.mutateAsync({
        email: formData.email.trim(),
        name: formData.name.trim(),
        role: formData.role,
        password: formData.password,
      });

      toast.success(t("toasts.addSuccess", { name: formData.name }));
      handleClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("toasts.addFailed"),
      );
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form data
    setFormData({
      name: "",
      email: "",
      role: "" as UserRole,
      password: "",
      confirmPassword: "",
    });
    setErrors({
      name: "",
      email: "",
      role: "",
      password: "",
      confirmPassword: "",
    });
    setShowPassword(false);
  };

  const isLoading = createUserMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("addUser")}
          </DialogTitle>
          <DialogDescription>
            {t("form.createDesc")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                {t("fullName")}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="name"
                  placeholder={t("form.fullNamePlaceholder")}
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
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
                    setFormData({ ...formData, email: e.target.value });
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
                  setFormData({ ...formData, role: value });
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

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                {t("password")}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("form.passwordPlaceholder")}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  className={`pl-10 pr-10 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                {t("confirmPassword")}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("form.confirmPasswordPlaceholder")}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    });
                    if (errors.confirmPassword)
                      setErrors({ ...errors, confirmPassword: "" });
                  }}
                  className={`pl-10 ${
                    errors.confirmPassword ? "border-red-500" : ""
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full border-2 border-t-transparent border-white h-4 w-4" />
                  {t("form.submitting")}
                </div>
              ) : (
                t("addUser")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
