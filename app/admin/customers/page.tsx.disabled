"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  Users,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Edit3,
} from "lucide-react";
import { CustomerClientService } from "@/lib/supabase-queries/customer-client-service";
import { PriceDisplay } from "@/components/currency";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface CustomerData {
  id: string;
  phone: string;
  name: string;
  address?: string;
  totalPurchases: number;
  orderCount: number;
  lastOrderAt?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [editingCustomer, setEditingCustomer] = useState<CustomerData | null>(
    null
  );
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const customerService = useMemo(() => new CustomerClientService(), []);

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await customerService.getCustomersList(0, 50); // Load first 50 customers
      setCustomers(
        result.customers.map((customer) => ({
          id: customer.id,
          phone: customer.phone,
          name: customer.name,
          address: customer.address,
          totalPurchases: customer.totalPurchases,
          orderCount: customer.orderCount,
          lastOrderAt: customer.lastOrderAt,
        }))
      );
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error("Error loading customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  }, [customerService]);

  const searchCustomer = async () => {
    if (!searchTerm.trim()) {
      loadCustomers();
      return;
    }

    setIsLoading(true);
    try {
      const results = await customerService.searchCustomers(searchTerm.trim());
      setCustomers(
        results.map((customer) => ({
          id: customer.id,
          phone: customer.phone,
          name: customer.name,
          address: customer.address,
          totalPurchases: customer.totalPurchases,
          orderCount: customer.orderCount,
          lastOrderAt: customer.lastOrderAt,
        }))
      );
      setTotalCount(results.length);

      if (results.length === 0) {
        toast.info("No customers found matching your search");
      } else {
        toast.success(
          `Found ${results.length} customer${results.length > 1 ? "s" : ""}`
        );
      }
    } catch (error) {
      console.error("Error searching customers:", error);
      toast.error("Failed to search customers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchCustomer();
    }
  };

  const openEditDialog = (customer: CustomerData) => {
    setEditingCustomer(customer);
    setEditForm({
      name: customer.name,
      phone: customer.phone,
      address: customer.address || "",
    });
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditingCustomer(null);
    setIsEditDialogOpen(false);
  };

  const handleEditSubmit = async () => {
    if (!editingCustomer) return;

    try {
      await customerService.updateCustomer(editingCustomer.id, {
        name: editForm.name,
        phone: editForm.phone,
        address: editForm.address || undefined,
      });

      // Update the customer in the local state
      setCustomers(
        customers.map((customer) =>
          customer.id === editingCustomer.id
            ? {
                ...customer,
                name: editForm.name,
                phone: editForm.phone,
                address: editForm.address,
              }
            : customer
        )
      );

      closeEditDialog();
      toast.success("Customer updated successfully");
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error("Failed to update customer");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground">
            Manage and view customer information and purchase history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {totalCount} Customers
          </Badge>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Customers
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Search by phone number, name, or address
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search by phone, name, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="flex-1"
            />
            <Button onClick={searchCustomer} disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                loadCustomers();
              }}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No customers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <Card
              key={customer.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Customer Name & Edit Button */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog
                        open={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(customer)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Edit Customer</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Name</Label>
                              <Input
                                id="name"
                                value={editForm.name}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    name: e.target.value,
                                  })
                                }
                                className="w-full"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone</Label>
                              <Input
                                id="phone"
                                value={editForm.phone}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    phone: e.target.value,
                                  })
                                }
                                className="w-full"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="address">Address</Label>
                              <Input
                                id="address"
                                value={editForm.address}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    address: e.target.value,
                                  })
                                }
                                className="w-full"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={closeEditDialog}>
                              Cancel
                            </Button>
                            <Button onClick={handleEditSubmit}>
                              Save Changes
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>{" "}
                  {/* Contact Information */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="font-medium">{customer.phone}</span>
                    </div>
                    {customer.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{customer.address}</span>
                      </div>
                    )}
                  </div>
                  {/* Purchase Stats */}
                  <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Spent</span>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <PriceDisplay
                          price={customer.totalPurchases}
                          className="font-semibold text-green-600"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Orders
                      </span>
                      <span className="text-sm font-medium">
                        {customer.orderCount}
                      </span>
                    </div>
                  </div>
                  {/* Last Order */}
                  <div className="pt-2 border-t">
                    {customer.lastOrderAt ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Last order:{" "}
                          {formatDistanceToNow(new Date(customer.lastOrderAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>No orders yet</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
