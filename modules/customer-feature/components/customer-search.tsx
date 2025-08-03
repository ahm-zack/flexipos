"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, UserPlus, User } from "lucide-react";
import { toast } from "sonner";
import { useCustomerSearch, useCreateCustomer } from "../hooks/use-customers";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { CustomerSearchResult } from "../types";

interface CustomerSearchProps {
  onCustomerSelected?: (customer: CustomerSearchResult) => void;
}

export function CustomerSearch({ onCustomerSelected }: CustomerSearchProps) {
  const [phone, setPhone] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: "",
    address: "",
  });

  const { user: currentUser } = useCurrentUser();
  const { data: foundCustomer, isLoading, error } = useCustomerSearch(phone);
  const createCustomer = useCreateCustomer();

  // Reset form when phone changes
  useEffect(() => {
    if (phone.length < 4) {
      setShowAddForm(false);
    }
  }, [phone]);

  // Show add form if no customer found and phone is valid
  useEffect(() => {
    if (phone.length >= 4 && !isLoading && !foundCustomer && !error) {
      setShowAddForm(true);
    } else {
      setShowAddForm(false);
    }
  }, [phone, isLoading, foundCustomer, error]);

  const handleSelectCustomer = (customer: CustomerSearchResult) => {
    onCustomerSelected?.(customer);
    toast.success(`Customer ${customer.name} selected`);
  };

  const handleCreateCustomer = async () => {
    if (!currentUser) {
      toast.error("Please log in to add a customer");
      return;
    }

    if (!customerData.name.trim()) {
      toast.error("Please enter customer name");
      return;
    }

    try {
      const newCustomer = await createCustomer.mutateAsync({
        customerData: {
          phone,
          name: customerData.name,
          address: customerData.address,
        },
        createdBy: currentUser.id,
      });

      toast.success("Customer added successfully!");

      // Transform newCustomer to CustomerSearchResult format
      const customerSearchResult: CustomerSearchResult = {
        id: newCustomer.id,
        phone: newCustomer.phone,
        name: newCustomer.name,
        address: newCustomer.address || undefined,
        totalPurchases: parseFloat(newCustomer.totalPurchases),
        orderCount: parseInt(newCustomer.orderCount),
        lastOrderAt: newCustomer.lastOrderAt
          ? newCustomer.lastOrderAt.toISOString()
          : undefined,
      };

      handleSelectCustomer(customerSearchResult);
      setCustomerData({ name: "", address: "" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("Failed to add customer. Please try again.");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Customer Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phone Search */}
        <div className="space-y-2">
          <Label htmlFor="customer-phone">Search by Phone Number</Label>
          <Input
            id="customer-phone"
            type="tel"
            placeholder="Enter phone number..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Loading State */}
        {isLoading && phone.length >= 4 && (
          <div className="text-center text-muted-foreground">
            Searching for customer...
          </div>
        )}

        {/* Found Customer */}
        {foundCustomer && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{foundCustomer.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {foundCustomer.phone}
                    </p>
                    {foundCustomer.address && (
                      <p className="text-sm text-muted-foreground">
                        {foundCustomer.address}
                      </p>
                    )}
                    <p className="text-xs text-green-600">
                      {foundCustomer.orderCount} orders • Total: $
                      {foundCustomer.totalPurchases.toFixed(2)}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleSelectCustomer(foundCustomer)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Select
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add New Customer Form */}
        {showAddForm && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <UserPlus className="h-4 w-4 text-blue-600" />
                <h3 className="font-medium text-blue-900">Add New Customer</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="customer-name" className="text-sm">
                    Name *
                  </Label>
                  <Input
                    id="customer-name"
                    type="text"
                    placeholder="Enter customer name"
                    value={customerData.name}
                    onChange={(e) =>
                      setCustomerData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-address" className="text-sm">
                    Address (Optional)
                  </Label>
                  <Input
                    id="customer-address"
                    type="text"
                    placeholder="Enter customer address"
                    value={customerData.address}
                    onChange={(e) =>
                      setCustomerData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="w-full"
                  />
                </div>
                <Button
                  onClick={handleCreateCustomer}
                  disabled={
                    !customerData.name.trim() || createCustomer.isPending
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {createCustomer.isPending ? "Adding..." : "Add Customer"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Helper Text */}
        {phone.length < 4 && (
          <p className="text-sm text-muted-foreground text-center">
            Enter at least 4 digits to search for a customer
          </p>
        )}
      </CardContent>
    </Card>
  );
}
