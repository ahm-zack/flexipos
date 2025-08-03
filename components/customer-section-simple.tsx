"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, User, X } from "lucide-react";
import { CustomerClientService } from "@/lib/supabase-queries/customer-client-service";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";

interface CustomerInfo {
  id: string;
  phone: string;
  name: string;
  address?: string;
}

interface CustomerSectionSimpleProps {
  selectedCustomer: CustomerInfo | null;
  onCustomerSelected: (customer: CustomerInfo | null) => void;
}

export function CustomerSectionSimple({
  selectedCustomer,
  onCustomerSelected,
}: CustomerSectionSimpleProps) {
  const [showForm, setShowForm] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user: currentUser } = useCurrentUser();
  const customerService = new CustomerClientService();

  const handleAddCustomer = async () => {
    if (!phone.trim() || !name.trim()) {
      toast.error("Phone number and name are required");
      return;
    }

    if (!currentUser) {
      toast.error("Please log in to create customers");
      return;
    }

    setIsLoading(true);
    try {
      // First check if customer already exists
      const existingCustomer = await customerService.searchByPhone(
        phone.trim()
      );
      if (existingCustomer) {
        onCustomerSelected({
          id: existingCustomer.id,
          phone: existingCustomer.phone,
          name: existingCustomer.name,
          address: existingCustomer.address || undefined,
        });
        toast.success(`Using existing customer: ${existingCustomer.name}`);
      } else {
        // Create new customer
        const newCustomer = await customerService.createCustomer(
          {
            phone: phone.trim(),
            name: name.trim(),
            address: address.trim() || undefined,
          },
          currentUser.id
        );

        onCustomerSelected({
          id: newCustomer.id,
          phone: newCustomer.phone,
          name: newCustomer.name,
          address: newCustomer.address || undefined,
        });
        toast.success(`New customer created: ${newCustomer.name}`);
      }

      setShowForm(false);
      setPhone("");
      setName("");
      setAddress("");
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("Failed to create customer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCustomer = () => {
    onCustomerSelected(null);
  };

  if (selectedCustomer) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-green-600" />
              Customer Info
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveCustomer}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div>
              <p className="font-medium text-green-900">
                {selectedCustomer.name}
              </p>
              <p className="text-sm text-green-700">{selectedCustomer.phone}</p>
              {selectedCustomer.address && (
                <p className="text-sm text-green-600">
                  {selectedCustomer.address}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showForm) {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-blue-600" />
              Add Customer
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div>
              <Label htmlFor="customer-phone" className="text-xs">
                Phone Number *
              </Label>
              <Input
                id="customer-phone"
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="customer-name" className="text-xs">
                Name *
              </Label>
              <Input
                id="customer-name"
                type="text"
                placeholder="Enter customer name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="customer-address" className="text-xs">
                Address (Optional)
              </Label>
              <Input
                id="customer-address"
                type="text"
                placeholder="Enter address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <Button
              onClick={handleAddCustomer}
              disabled={!phone.trim() || !name.trim() || isLoading}
              className="w-full h-8 text-sm bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Saving..." : "Add Customer"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed border-2 border-muted-foreground/25">
      <CardContent className="p-4">
        <div className="text-center">
          <User className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground mb-3">
            Add customer info to order
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
            className="w-full h-8 text-xs"
          >
            <UserPlus className="h-3 w-3 mr-1" />
            Add Customer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
