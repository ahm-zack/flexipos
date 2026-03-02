"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  type Category,
  type NewCategory,
} from "../services/category-supabase-service";
import { useCreateCategory, useUpdateCategory } from "@/hooks/useCategories";
import { useBusinessId } from "@/hooks/useBusinessId";

interface CategoryFormProps {
  category?: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (category: Category) => void;
}

const DEFAULT_COLORS = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#10b981", label: "Emerald" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#ec4899", label: "Pink" },
  { value: "#84cc16", label: "Lime" },
  { value: "#f97316", label: "Orange" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#a855f7", label: "Purple" },
  { value: "#0ea5e9", label: "Sky" },
];

// Icons grouped by business type for easier selection
const ICON_GROUPS = [
  {
    label: "Food & Beverages",
    icons: [
      "🍕",
      "🍔",
      "🌮",
      "🌯",
      "🥙",
      "🥪",
      "🍖",
      "🍗",
      "🥩",
      "🍟",
      "🌭",
      "🥓",
      "🍱",
      "🍛",
      "🍜",
      "🍝",
      "🍣",
      "🍤",
      "🦐",
      "🦞",
      "🦀",
      "🐟",
      "🐠",
      "🍳",
      "🥚",
      "🧆",
      "🥗",
      "🥘",
      "🫕",
      "🫔",
    ],
  },
  {
    label: "Bakery & Sweets",
    icons: [
      "🍰",
      "🎂",
      "🧁",
      "🍩",
      "🍪",
      "🥧",
      "🍮",
      "🍫",
      "🍬",
      "🍭",
      "🍡",
      "🧇",
      "🥐",
      "🥖",
      "🥨",
      "🥯",
      "🍞",
      "🫓",
    ],
  },
  {
    label: "Drinks & Coffee",
    icons: [
      "☕",
      "🍵",
      "🧃",
      "🥤",
      "🧋",
      "🍺",
      "🍻",
      "🥂",
      "🍷",
      "🍸",
      "🍹",
      "🧊",
      "🫖",
    ],
  },
  {
    label: "Fruits & Vegetables",
    icons: [
      "🍎",
      "🍊",
      "🍋",
      "🍇",
      "🍓",
      "🫐",
      "🍒",
      "🍑",
      "🥭",
      "🍍",
      "🥥",
      "🍌",
      "🫒",
      "🥑",
      "🍅",
      "🥦",
      "🥕",
      "🌽",
      "🥬",
      "🧅",
      "🧄",
      "🫑",
    ],
  },
  {
    label: "Retail & Clothing",
    icons: [
      "👕",
      "👗",
      "👔",
      "👖",
      "🩱",
      "🧥",
      "👟",
      "👠",
      "👒",
      "🧣",
      "🧤",
      "🧢",
      "💍",
      "💎",
      "👜",
      "👛",
      "🎒",
      "🧳",
    ],
  },
  {
    label: "Electronics & Tech",
    icons: [
      "📱",
      "💻",
      "🖥️",
      "⌨️",
      "🖱️",
      "🖨️",
      "📷",
      "📸",
      "📡",
      "🔌",
      "🔋",
      "💡",
      "📺",
      "🎧",
      "🎮",
      "🕹️",
      "🔭",
    ],
  },
  {
    label: "Health & Pharmacy",
    icons: [
      "💊",
      "💉",
      "🩺",
      "🩹",
      "🧪",
      "🏥",
      "🌡️",
      "🩻",
      "🫀",
      "🦷",
      "👁️",
      "💆",
      "🛁",
      "🧴",
      "🧼",
      "🪥",
    ],
  },
  {
    label: "Home & Furniture",
    icons: [
      "🛋️",
      "🛏️",
      "🪑",
      "🚿",
      "🛁",
      "🪞",
      "🖼️",
      "🪴",
      "🕯️",
      "🏺",
      "🧹",
      "🧺",
      "🪣",
      "🔑",
      "🏠",
      "🪟",
      "🛠️",
    ],
  },
  {
    label: "Beauty & Spa",
    icons: [
      "💅",
      "💄",
      "💋",
      "🪒",
      "✂️",
      "🧴",
      "🌺",
      "🌸",
      "💐",
      "🌹",
      "🕌",
      "🧖",
      "🛢️",
      "🌿",
      "🧿",
    ],
  },
  {
    label: "Sports & Fitness",
    icons: [
      "⚽",
      "🏀",
      "🏈",
      "⚾",
      "🎾",
      "🏐",
      "🏉",
      "🎱",
      "🏓",
      "🏸",
      "🥊",
      "🏋️",
      "🤸",
      "🎿",
      "⛷️",
      "🏊",
      "🚴",
      "🧘",
      "🎯",
      "🏆",
    ],
  },
  {
    label: "Services & Business",
    icons: [
      "🏢",
      "🏪",
      "🏬",
      "🏦",
      "💼",
      "📋",
      "📊",
      "📈",
      "📌",
      "🔧",
      "⚙️",
      "🔩",
      "🚗",
      "🚙",
      "✈️",
      "🚢",
      "📦",
      "🎁",
      "🎉",
      "⭐",
    ],
  },
  {
    label: "Gifts & Flowers",
    icons: [
      "🎁",
      "🎀",
      "🎊",
      "🎉",
      "🎈",
      "🎏",
      "🎗️",
      "🏅",
      "🥇",
      "🏆",
      "🌹",
      "🌷",
      "🌸",
      "🌺",
      "💐",
      "🌻",
      "🌼",
      "🪷",
      "🌾",
      "🍀",
      "🌿",
      "🍃",
      "🍂",
      "🍁",
      "🪴",
      "🌵",
      "🌴",
      "✨",
      "💫",
      "⭐",
      "🌟",
      "💝",
      "💖",
      "💗",
      "💓",
      "💞",
      "💕",
      "❤️",
      "🩷",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🎶",
      "🪄",
      "🧧",
      "🪅",
      "🧸",
      "🪆",
      "🎠",
      "🍫",
      "🍬",
      "🍭",
      "🫶",
      "🤗",
      "🥳",
    ],
  },
];

export function CategoryForm({
  category,
  isOpen,
  onClose,
  onSuccess,
}: CategoryFormProps) {
  const isEdit = !!category;
  const {
    businessId,
    isLoading: businessLoading,
    error: businessError,
  } = useBusinessId();

  const [formData, setFormData] = useState<Partial<NewCategory>>(() => ({
    name: category?.name || "",
    nameAr: category?.nameAr || "",
    description: category?.description || "",
    icon: category?.icon || "📦",
    color: category?.color || "#6366f1",
    displayOrder: category?.displayOrder || 0,
    isActive: category?.isActive ?? true,
    slug: category?.slug || "",
    businessId: category?.businessId || businessId || undefined,
    parentCategoryId: category?.parentCategoryId || null,
    metadata: category?.metadata || {},
  }));

  const [activeIconGroup, setActiveIconGroup] = useState(0);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  // Re-populate form whenever the dialog opens or the target category changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: category?.name || "",
        nameAr: category?.nameAr || "",
        description: category?.description || "",
        icon: category?.icon || "📦",
        color: category?.color || "#6366f1",
        displayOrder: category?.displayOrder || 0,
        isActive: category?.isActive ?? true,
        slug: category?.slug || "",
        businessId: category?.businessId || businessId || undefined,
        parentCategoryId: category?.parentCategoryId || null,
        metadata: category?.metadata || {},
      });
      setActiveIconGroup(0);
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!businessId) {
      toast.error(
        "Business information not loaded. Please refresh and try again.",
      );
      return;
    }

    const dataToSubmit = {
      ...formData,
      businessId,
      slug:
        formData.slug?.trim() ||
        formData
          .name!.toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]/g, ""),
    };

    try {
      if (isEdit && category) {
        const updatedCategory = await updateMutation.mutateAsync({
          id: category.id,
          data: dataToSubmit as Partial<NewCategory>,
        });
        toast.success(`"${updatedCategory.name}" updated successfully`);
        onSuccess?.(updatedCategory);
      } else {
        const newCategory = await createMutation.mutateAsync(
          dataToSubmit as NewCategory,
        );
        toast.success(`"${newCategory.name}" created successfully`);
        onSuccess?.(newCategory);
      }
      onClose();
    } catch (error) {
      toast.error(
        `Failed to ${isEdit ? "update" : "create"} category: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  };

  const handleChange = (
    field: keyof NewCategory,
    value: string | number | boolean | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-base"
              style={{ backgroundColor: formData.color || "#6366f1" }}
            >
              {formData.icon || "📦"}
            </span>
            {isEdit ? "Edit Category" : "New Category"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the category details below."
              : "Create a new category to organise your products."}
          </DialogDescription>
        </DialogHeader>

        {businessError && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {businessError} — cannot save without business context.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          {/* Names */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Main Dishes"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nameAr">Arabic Name</Label>
              <Input
                id="nameAr"
                value={formData.nameAr || ""}
                onChange={(e) => handleChange("nameAr", e.target.value)}
                placeholder="e.g., الأطباق الرئيسية"
                dir="rtl"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Brief description of this category…"
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Icon Picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Icon</Label>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Selected:
                <span className="text-lg">{formData.icon || "📦"}</span>
              </div>
            </div>
            {/* Group Tabs */}
            <div className="flex flex-wrap gap-1">
              {ICON_GROUPS.map((group, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIconGroup(i)}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeIconGroup === i
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </div>
            {/* Icons Grid */}
            <div className="flex flex-wrap gap-1 p-2 bg-muted/30 rounded-lg max-h-28 overflow-y-auto">
              {ICON_GROUPS[activeIconGroup].icons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleChange("icon", icon)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-lg transition-all hover:scale-110 ${
                    formData.icon === icon
                      ? "bg-primary/20 ring-2 ring-primary ring-offset-1"
                      : "hover:bg-muted"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_COLORS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  title={label}
                  onClick={() => handleChange("color", value)}
                  className={`w-7 h-7 rounded-full transition-all hover:scale-110 ${
                    formData.color === value
                      ? "ring-2 ring-offset-2 ring-foreground scale-110"
                      : ""
                  }`}
                  style={{ backgroundColor: value }}
                />
              ))}
              {/* Custom colour input */}
              <div className="relative w-7 h-7">
                <input
                  type="color"
                  value={formData.color || "#6366f1"}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  title="Custom colour"
                />
                <div
                  className="w-7 h-7 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center text-muted-foreground text-xs hover:border-foreground transition-colors"
                  title="Pick custom colour"
                >
                  +
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
            <Switch
              id="isActive"
              checked={formData.isActive ?? true}
              onCheckedChange={(checked) => handleChange("isActive", checked)}
            />
            <div>
              <Label htmlFor="isActive" className="cursor-pointer font-medium">
                {formData.isActive ? "Active" : "Inactive"}
              </Label>
              <p className="text-xs text-muted-foreground">
                {formData.isActive
                  ? "Visible to staff in the POS menu"
                  : "Hidden from the POS menu"}
              </p>
            </div>
            <Badge
              variant={formData.isActive ? "default" : "secondary"}
              className="ml-auto"
            >
              {formData.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!businessId || businessLoading || isPending}
              className="min-w-[130px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
