"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, X } from "lucide-react";
import { CustomerSearch } from "@/modules/customer-feature";
import type { CustomerSearchResult } from "@/modules/customer-feature";

interface CustomerSectionProps {
  selectedCustomer: CustomerSearchResult | null;
  onCustomerSelected: (customer: CustomerSearchResult | null) => void;
}

export function CustomerSection({
  selectedCustomer,
  onCustomerSelected,
}: CustomerSectionProps) {
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);

  const handleCustomerSelected = (customer: CustomerSearchResult) => {
    onCustomerSelected(customer);
    setShowCustomerSearch(false);
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
            <div className="flex items-center justify-between text-xs text-green-600 pt-1">
              <span>{selectedCustomer.orderCount} orders</span>
              <span>Total: ${selectedCustomer.totalPurchases.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showCustomerSearch) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Customer Information</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCustomerSearch(false)}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CustomerSearch onCustomerSelected={handleCustomerSelected} />
      </div>
    );
  }

  return (
    <Card className="border-dashed border-2 border-muted-foreground/25">
      <CardContent className="p-4">
        <div className="text-center">
          <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-3">
            Add customer information to track purchases
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomerSearch(true)}
            className="w-full"
          >
            Add Customer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
