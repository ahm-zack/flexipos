"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export interface CustomerFormData {
  name: string;
  phone: string;
  address: string;
}

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: CustomerFormData;
  onSave: (data: CustomerFormData) => void;
  isSaving: boolean;
  title: string;
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  initial,
  onSave,
  isSaving,
  title,
}: CustomerFormDialogProps) {
  const t = useTranslations("customers");
  const [form, setForm] = useState<CustomerFormData>(initial);

  const handleOpenChange = (v: boolean) => {
    if (v) setForm(initial);
    onOpenChange(v);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error(t("toasts.nameRequired"));
    if (!form.phone.trim()) return toast.error(t("toasts.phoneRequired"));
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="cust-name">{t("nameRequired")}</Label>
            <Input
              id="cust-name"
              placeholder={t("namePlaceholder")}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cust-phone">{t("phoneRequired")}</Label>
            <Input
              id="cust-phone"
              placeholder={t("phonePlaceholder")}
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cust-address">{t("address")}</Label>
            <Input
              id="cust-address"
              placeholder={t("addressPlaceholder")}
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? t("form.saving") : t("form.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
