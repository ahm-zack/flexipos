"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useCreateCustomer } from "../hooks/use-customers";
import { useCurrentUser } from "@/hooks/use-current-user";

interface CustomerFormProps {
  onSuccess?: (customer: {
    id: string;
    phone: string;
    name: string;
    address?: string;
  }) => void;
  onCancel?: () => void;
  initialData?: {
    phone?: string;
    name?: string;
    address?: string;
  };
  submitLabel?: string;
}

export function CreateCustomerForm({
  onSuccess,
  onCancel,
  initialData,
  submitLabel = "Add Customer",
}: CustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    phone: initialData?.phone || "",
    name: initialData?.name || "",
    address: initialData?.address || "",
  });
  const [errors, setErrors] = useState<{
    phone?: string;
    name?: string;
    address?: string;
  }>({});

  const { user: currentUser } = useCurrentUser();
  const createCustomer = useCreateCustomer();

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone.length > 20) {
      newErrors.phone = "Phone number too long";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Name too long";
    }

    if (formData.address && formData.address.length > 500) {
      newErrors.address = "Address too long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!currentUser) {
      toast.error("Please log in to add a customer");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createCustomer.mutateAsync({
        customerData: {
          phone: formData.phone,
          name: formData.name,
          address: formData.address || undefined,
        },
        createdBy: currentUser.id,
      });

      toast.success("Customer added successfully!");
      setFormData({ phone: "", name: "", address: "" });
      setErrors({});

      onSuccess?.({
        id: result.id,
        phone: result.phone,
        name: result.name,
        address: result.address || undefined,
      });
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("Failed to add customer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Add New Customer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Customer Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter customer name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address (Optional)</Label>
            <Input
              id="address"
              type="text"
              placeholder="Enter customer address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1"
              disabled={
                isSubmitting || !formData.phone.trim() || !formData.name.trim()
              }
            >
              {isSubmitting ? "Adding..." : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
