/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  ShoppingBag,
  Trash2,
  Banknote,
  CreditCard,
  Split,
  Minus,
  Plus,
  ChevronDown,
  ParkingCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useCart } from "@/modules/cart/hooks/use-cart";
import { PriceDisplay, SaudiRiyalSymbol } from "@/components/currency";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCreateOrder } from "@/modules/orders-feature";
import { useUpdateCustomerPurchases } from "@/modules/customer-feature";
import { CustomerClientService } from "@/lib/supabase-queries/customer-client-service";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { User, Percent } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CashCalculatorDialog } from "@/components/cash-calculator-dialog";
import { MixedPaymentDialog } from "@/components/mixed-payment-dialog";
import { useEventDiscountStore } from "@/hooks/use-event-discount";
import { ParkOrderDialog } from "@/components/park-order-dialog";
import { ParkedOrdersPanel } from "@/components/parked-orders-panel";
import { ParkedOrder, useParkedOrders } from "@/hooks/use-parked-orders";

export function CartPanelWithCustomer() {
  const { cart, updateQuantity, removeItem, clearCart, addItem, openCart } =
    useCart();

  // Parked orders hook to get count for notification badge
  const { parkedOrders } = useParkedOrders();

  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mixed">(
    "card" // Default to card instead of cash
  );

  // Customer form states
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isCustomerSectionCollapsed, setIsCustomerSectionCollapsed] =
    useState(true); // Start collapsed

  // Discount state
  const [discountType, setDiscountType] = useState<"percentage" | "amount">(
    "percentage"
  );
  const [discountValue, setDiscountValue] = useState<string>("");
  const [isDiscountSectionCollapsed, setIsDiscountSectionCollapsed] =
    useState(true); // Start collapsed

  // Cash calculator state
  const [showCashCalculator, setShowCashCalculator] = useState(false);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [changeAmount, setChangeAmount] = useState<number>(0);

  // Mixed payment state
  const [showMixedPayment, setShowMixedPayment] = useState(false);
  const [mixedCashAmount, setMixedCashAmount] = useState<number>(0);
  const [mixedCardAmount, setMixedCardAmount] = useState<number>(0);

  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const createOrder = useCreateOrder();
  const updateCustomerPurchases = useUpdateCustomerPurchases();
  const customerService = useMemo(() => new CustomerClientService(), []);

  // Event discount store
  const eventDiscount = useEventDiscountStore();

  // Park order functionality
  const handleParkOrder = () => {
    clearCart();
    clearCustomerData();
    setDiscountValue("");
  };

  const handleRestoreParkedOrder = (order: ParkedOrder) => {
    // Clear current cart first
    clearCart();

    // Restore cart items
    order.cartData.items.forEach((item) => {
      addItem(item);
    });

    // Restore customer data
    if (order.customerName) setCustomerName(order.customerName);
    if (order.customerPhone) setCustomerPhone(order.customerPhone);
    if (order.customerAddress) setCustomerAddress(order.customerAddress);

    // Restore payment method
    setPaymentMethod(order.paymentMethod);

    // Restore discount
    if (order.discountData) {
      setDiscountType(order.discountData.type);
      setDiscountValue(order.discountData.value);
    }

    // Open cart to show restored order
    openCart();

    toast.success(
      `Order restored${order.customerName ? ` for ${order.customerName}` : ""}`,
      {
        description: "All items and settings have been restored to your cart.",
      }
    );
  };

  // Search for customer when phone changes
  useEffect(() => {
    const searchCustomer = async () => {
      if (customerPhone.length >= 4) {
        setIsSearching(true);
        try {
          const customer = await customerService.searchByPhone(customerPhone);
          if (customer) {
            setCustomerName(customer.name);
            setCustomerAddress(customer.address || "");
            setIsExistingCustomer(true);
          } else {
            setIsExistingCustomer(false);
            // Keep current name and address if user was typing
          }
        } catch (error) {
          console.error("Error searching customer:", error);
          setIsExistingCustomer(false);
        } finally {
          setIsSearching(false);
        }
      } else {
        setIsExistingCustomer(false);
        setIsSearching(false);
        // Clear fields when phone is too short
        if (customerPhone.length === 0) {
          setCustomerName("");
          setCustomerAddress("");
        }
      }
    };

    const timeoutId = setTimeout(searchCustomer, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [customerPhone, customerService]);

  const clearCustomerData = () => {
    setCustomerPhone("");
    setCustomerName("");
    setCustomerAddress("");
    setIsExistingCustomer(false);
  };

  // Calculate discount amount and final total
  const calculateDiscount = () => {
    const subtotal = cart.total;
    const discountNum = parseFloat(discountValue) || 0;

    if (discountType === "percentage") {
      const discountAmount = (subtotal * discountNum) / 100;
      return Math.min(discountAmount, subtotal); // Cap at subtotal
    } else {
      return Math.min(discountNum, subtotal); // Cap at subtotal
    }
  };

  // Calculate event discount amount
  const calculateEventDiscount = () => {
    if (!eventDiscount.isActive || eventDiscount.discountPercentage <= 0) {
      return 0;
    }

    const subtotal = cart.total;
    const eventDiscountAmount =
      (subtotal * eventDiscount.discountPercentage) / 100;
    return Math.min(eventDiscountAmount, subtotal);
  };

  const discountAmount = calculateDiscount();
  const eventDiscountAmount = calculateEventDiscount();
  const totalDiscountAmount = discountAmount + eventDiscountAmount;
  const finalTotal = Math.max(0, cart.total - totalDiscountAmount);

  const handleProceedToCheckout = async () => {
    if (!currentUser) {
      toast.error("Please log in to create an order");
      return;
    }

    // If payment method is cash, show cash calculator first
    if (paymentMethod === "cash") {
      setShowCashCalculator(true);
      return;
    }

    // If payment method is mixed, show mixed payment dialog first
    if (paymentMethod === "mixed") {
      setShowMixedPayment(true);
      return;
    }

    // For card payments, proceed directly
    await processOrder();
  };

  const processOrder = async (
    overrideCashAmount?: number,
    overrideCardAmount?: number,
    overrideCashReceived?: number,
    overrideChangeAmount?: number
  ) => {
    if (!currentUser) {
      toast.error("Please log in to create an order");
      return;
    }

    // Use provided amounts if available, otherwise use state
    const effectiveCashAmount = overrideCashAmount ?? mixedCashAmount;
    const effectiveCardAmount = overrideCardAmount ?? mixedCardAmount;
    const effectiveCashReceived = overrideCashReceived ?? cashReceived;
    const effectiveChangeAmount = overrideChangeAmount ?? changeAmount;

    const orderData = {
      items: cart.items,
      totalAmount: finalTotal, // Use final total after all discounts
      paymentMethod,
      createdBy: currentUser.id,
      customerName: customerName.trim() || undefined,
      discountType: discountAmount > 0 ? discountType : undefined,
      discountValue: discountAmount > 0 ? parseFloat(discountValue) : undefined,
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      // Add event discount info for order history and receipts
      eventDiscountName:
        eventDiscountAmount > 0 ? eventDiscount.eventName : undefined,
      eventDiscountPercentage:
        eventDiscountAmount > 0 ? eventDiscount.discountPercentage : undefined,
      eventDiscountAmount:
        eventDiscountAmount > 0 ? eventDiscountAmount : undefined,
      // Payment tracking fields
      cashAmount:
        paymentMethod === "cash"
          ? finalTotal
          : paymentMethod === "mixed"
          ? effectiveCashAmount
          : undefined,
      cardAmount:
        paymentMethod === "card"
          ? finalTotal
          : paymentMethod === "mixed"
          ? effectiveCardAmount
          : undefined,
      cashReceived:
        paymentMethod === "cash" || paymentMethod === "mixed"
          ? effectiveCashReceived
          : undefined,
      changeAmount:
        paymentMethod === "cash" || paymentMethod === "mixed"
          ? effectiveChangeAmount
          : undefined,
    };

    // Debug log to check payment data
    console.log("🔍 Creating order with payment data:", {
      paymentMethod,
      finalTotal,
      effectiveCashAmount,
      effectiveCardAmount,
      effectiveCashReceived,
      effectiveChangeAmount,
      orderData: {
        cashAmount: orderData.cashAmount,
        cardAmount: orderData.cardAmount,
        cashReceived: orderData.cashReceived,
        changeAmount: orderData.changeAmount,
      },
    });

    createOrder.mutate(orderData, {
      onSuccess: async (data) => {
        // Show payment-specific notifications
        if (paymentMethod === "cash" && changeAmount > 0) {
          toast.success(
            `Order #${
              data.orderNumber
            } created! Cash received: ${cashReceived.toFixed(
              2
            )} SAR | Change: ${changeAmount.toFixed(2)} SAR`,
            { duration: 8000 }
          );
        } else if (paymentMethod === "mixed") {
          toast.success(
            `Order #${
              data.orderNumber
            } created! Mixed Payment - Cash: ${mixedCashAmount.toFixed(
              2
            )} SAR | Card: ${mixedCardAmount.toFixed(2)} SAR`,
            { duration: 8000 }
          );
        } else {
          toast.success(`Order #${data.orderNumber} created successfully!`);
        }

        // Update customer purchase totals if customer is selected
        if (customerPhone.trim() && customerName.trim()) {
          try {
            // First, try to create/update customer
            let customerId = null;

            if (isExistingCustomer) {
              // Find existing customer by phone to get ID
              const existingCustomer = await customerService.searchByPhone(
                customerPhone
              );
              customerId = existingCustomer?.id;
            } else {
              // Create new customer
              const newCustomer = await customerService.createCustomer(
                {
                  phone: customerPhone,
                  name: customerName,
                  address: customerAddress || undefined,
                },
                currentUser.id
              );
              customerId = newCustomer.id;
            }

            if (customerId) {
              await updateCustomerPurchases.mutateAsync({
                customerId,
                orderTotal: finalTotal, // Use final total after discount
                orderNumber: data.orderNumber,
              });
            }
          } catch (error) {
            console.error("Error updating customer purchases:", error);
            // Don't fail the order creation for this
            toast.warning("Order created but customer stats update failed");
          }
        }

        clearCart();
        clearCustomerData();
        setDiscountValue(""); // Clear discount
        // Reset payment state
        setCashReceived(0);
        setChangeAmount(0);
        setMixedCashAmount(0);
        setMixedCardAmount(0);

        // Debug: log the order data returned from server
        console.log("🔍 Order data returned from server:", {
          paymentMethod: data.paymentMethod,
          cashAmount: data.cashAmount,
          cardAmount: data.cardAmount,
          cashReceived: data.cashReceived,
          changeAmount: data.changeAmount,
        });

        // Generate receipt
        const apiOrder = {
          id: data.id,
          orderNumber: data.orderNumber,
          dailySerial: data.dailySerial, // Add the daily serial field
          customerName: data.customerName,
          items: data.items,
          totalAmount:
            typeof data.totalAmount === "string"
              ? parseFloat(data.totalAmount)
              : data.totalAmount,
          paymentMethod: data.paymentMethod,
          status: data.status,
          discountType: data.discountType,
          discountValue: data.discountValue,
          discountAmount: data.discountAmount,
          // Add event discount fields for receipt display
          eventDiscountName: data.eventDiscountName,
          eventDiscountPercentage: data.eventDiscountPercentage,
          eventDiscountAmount: data.eventDiscountAmount,
          // Add payment tracking fields for receipt display
          cashAmount: data.cashAmount,
          cardAmount: data.cardAmount,
          cashReceived: data.cashReceived,
          changeAmount: data.changeAmount,
          createdAt:
            typeof data.createdAt === "string"
              ? data.createdAt
              : new Date(data.createdAt).toISOString(),
          updatedAt:
            typeof data.updatedAt === "string"
              ? data.updatedAt
              : data.updatedAt
              ? new Date(data.updatedAt).toISOString()
              : new Date().toISOString(),
          createdBy: data.createdBy,
        };

        const { downloadReceiptPDF } = await import(
          "@/components/restaurant-receipt"
        );

        const mappedItems = Array.isArray(apiOrder.items)
          ? apiOrder.items.map((item: any) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              type: item.type ?? "unknown",
              nameAr: item.nameAr ?? "",
              unitPrice: item.unitPrice ?? item.price ?? 0,
              totalPrice: item.totalPrice ?? (item.price ?? 0) * item.quantity,
              details: item.details ?? {},
            }))
          : [];

        // Debug: log the final order object being sent to PDF
        const finalOrderForPDF = {
          ...apiOrder,
          items: mappedItems,
          customerName:
            apiOrder.customerName === null ? undefined : apiOrder.customerName,
        };
        console.log("🔍 Final order object for PDF:", {
          paymentMethod: finalOrderForPDF.paymentMethod,
          cashAmount: finalOrderForPDF.cashAmount,
          cardAmount: finalOrderForPDF.cardAmount,
          cashReceived: finalOrderForPDF.cashReceived,
          changeAmount: finalOrderForPDF.changeAmount,
        });

        await downloadReceiptPDF(finalOrderForPDF);
      },
      onError: (error) => {
        toast.error(`Failed to create order: ${error.message}`);
      },
    });
  };

  const handleCashCalculation = (cashReceived: number, change: number) => {
    setCashReceived(cashReceived);
    setChangeAmount(change);
    // Show change information toast
    toast.info(
      `Cash: ${cashReceived.toFixed(2)} SAR | Change: ${change.toFixed(2)} SAR`
    );
    // Process the order after cash calculation with direct values
    processOrder(undefined, undefined, cashReceived, change);
  };

  const handleMixedPayment = (cashAmount: number, cardAmount: number) => {
    setMixedCashAmount(cashAmount);
    setMixedCardAmount(cardAmount);

    // For mixed payment, if there's a cash portion, calculate received and change
    // For now, assume exact cash (could be enhanced with cash calculator)
    const mixedCashReceived = cashAmount;
    const mixedChangeAmount = 0; // For mixed, we assume exact cash for the cash portion

    setCashReceived(mixedCashReceived);
    setChangeAmount(mixedChangeAmount);

    // Show mixed payment information toast
    toast.info(
      `Mixed Payment - Cash: ${cashAmount.toFixed(
        2
      )} SAR | Card: ${cardAmount.toFixed(2)} SAR`
    );
    // Process the order after mixed payment calculation with direct amounts
    processOrder(cashAmount, cardAmount, mixedCashReceived, mixedChangeAmount);
  };

  return (
    <div className="h-full w-full bg-background border-l shadow-2xl flex flex-col">
      {/* Header */}
      <div className="border-b">
        {/* Park Order and Parked Orders Section - Always Visible */}
        <div className="p-6 pb-3">
          <div className="flex gap-2">
            <ParkOrderDialog
              cartData={{
                items: cart.items,
                total: finalTotal,
                itemCount: cart.itemCount,
              }}
              customerName={customerName}
              customerPhone={customerPhone}
              customerAddress={customerAddress}
              paymentMethod={paymentMethod}
              discountData={
                discountAmount > 0
                  ? {
                      type: discountType,
                      value: discountValue,
                      amount: discountAmount,
                    }
                  : undefined
              }
              onParkSuccess={handleParkOrder}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={cart.items.length === 0}
                >
                  <ParkingCircle className="h-4 w-4 mr-2" />
                  Park Order
                </Button>
              }
            />
            <ParkedOrdersPanel
              onRestoreOrder={handleRestoreParkedOrder}
              trigger={
                <div className="relative flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <ParkingCircle className="h-4 w-4 mr-2" />
                    Parked
                  </Button>
                  {parkedOrders.length > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                      {parkedOrders.length}
                    </div>
                  )}
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-6">
        {cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">
              Add some delicious items to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    {/* Modifiers Display */}
                    {item.modifiers && item.modifiers.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.modifiers.map((modifier) => (
                          <div
                            key={modifier.id}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-muted-foreground flex items-center gap-1">
                              {modifier.type === "extra" ? (
                                <span className="text-green-600">+</span>
                              ) : (
                                <span className="text-red-600">-</span>
                              )}
                              {modifier.name}
                            </span>
                            {modifier.type === "extra" && (
                              <span className="text-green-600 font-medium">
                                +
                                <PriceDisplay
                                  price={modifier.price}
                                  symbolSize={10}
                                  className="text-xs"
                                />
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-primary">
                          <PriceDisplay
                            price={
                              (item.price + (item.modifiersTotal || 0)) *
                              item.quantity
                            }
                            symbolSize={14}
                            variant="primary"
                            className="font-semibold"
                          />
                        </span>
                        {item.modifiersTotal && item.modifiersTotal > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Base:{" "}
                            <PriceDisplay
                              price={item.price * item.quantity}
                              symbolSize={10}
                              className="text-xs"
                            />
                            {" + "}Extras:{" "}
                            <PriceDisplay
                              price={item.modifiersTotal * item.quantity}
                              symbolSize={10}
                              className="text-xs text-green-600"
                            />
                          </span>
                        )}
                      </div>
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove {item.name}</span>
                  </Button>
                </div>
              </Card>
            ))}
            {/* Clear Cart Button */}
            {cart.items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearCart();
                  setDiscountValue(""); // Clear discount when clearing cart
                }}
                className="w-full text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Footer - Customer Info & Total & Checkout */}
      {cart.items.length > 0 && (
        <div className="p-6 space-y-4">
          {/* Customer Section - Minimalistic Design */}
          <div className="bg-muted/20 rounded-lg p-3 space-y-2.5 transition-all duration-200 ease-in-out hover:bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-primary" />
                <Label className="text-xs font-medium text-foreground">
                  Customer Info
                </Label>
                {customerName && (
                  <span className="text-xs text-muted-foreground">
                    ({customerName})
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setIsCustomerSectionCollapsed(!isCustomerSectionCollapsed)
                }
                className="h-6 w-6 p-0 transition-transform duration-200 ease-in-out"
              >
                <div
                  className={`transition-transform duration-200 ease-in-out ${
                    isCustomerSectionCollapsed ? "rotate-180" : "rotate-0"
                  }`}
                >
                  <ChevronDown className="h-3 w-3" />
                </div>
              </Button>
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isCustomerSectionCollapsed
                  ? "max-h-0 opacity-0"
                  : "max-h-96 opacity-100"
              }`}
            >
              <div className="space-y-2 pt-2">
                {/* Phone Number and Name in the same row */}
                <div className="flex gap-2">
                  {/* Phone Number */}
                  <div className="relative flex-1">
                    <Input
                      type="tel"
                      placeholder="Phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="h-8 text-xs placeholder:text-xs w-full"
                    />
                    {isSearching && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin h-2.5 w-2.5 border border-primary border-t-transparent rounded-full"></div>
                      </div>
                    )}
                    {!isSearching && customerPhone && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${
                            isExistingCustomer
                              ? "bg-green-500"
                              : "bg-orange-500"
                          }`}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Customer Name */}
                  <div className="flex-1">
                    {isExistingCustomer ? (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded text-xs h-8">
                        <User className="h-3 w-3 text-green-600 dark:text-green-400" />
                        <span className="text-green-800 dark:text-green-200 font-medium truncate">
                          {customerName}
                        </span>
                        <span className="text-green-600 dark:text-green-400 text-xs ml-auto">
                          ✓
                        </span>
                      </div>
                    ) : (
                      <Input
                        type="text"
                        placeholder="Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="h-8 text-xs placeholder:text-xs w-full"
                      />
                    )}
                  </div>
                </div>

                {/* Address */}
                {isExistingCustomer ? (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded text-xs w-full">
                    <span className="text-slate-600 dark:text-slate-400 text-xs">
                      📍
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 truncate">
                      {customerAddress || "No address on file"}
                    </span>
                  </div>
                ) : (
                  <Input
                    type="text"
                    placeholder="Address (optional)"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="h-8 text-xs placeholder:text-xs w-full"
                  />
                )}

                {customerPhone.length > 0 && customerPhone.length < 4 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Enter at least 4 digits
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Discount Section */}
          <div className="bg-muted/20 rounded-lg p-3 space-y-2.5 transition-all duration-200 ease-in-out hover:bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="h-3.5 w-3.5 text-primary" />
                <Label className="text-xs font-medium text-foreground">
                  Discount
                </Label>
                {discountAmount > 0 && (
                  <span className="text-xs text-green-600 font-medium">
                    -
                    {discountType === "percentage"
                      ? `${discountValue}%`
                      : `${discountAmount.toFixed(2)}`}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setIsDiscountSectionCollapsed(!isDiscountSectionCollapsed)
                }
                className="h-6 w-6 p-0 transition-transform duration-200 ease-in-out"
              >
                <div
                  className={`transition-transform duration-200 ease-in-out ${
                    isDiscountSectionCollapsed ? "rotate-180" : "rotate-0"
                  }`}
                >
                  <ChevronDown className="h-3 w-3" />
                </div>
              </Button>
            </div>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isDiscountSectionCollapsed
                  ? "max-h-0 opacity-0"
                  : "max-h-96 opacity-100"
              }`}
            >
              <div className="space-y-2 pt-2">
                {/* Discount Type and Value */}
                <div className="flex gap-2">
                  {/* Discount Type */}
                  <div className="flex-shrink-0">
                    <Select
                      value={discountType}
                      onValueChange={(value: "percentage" | "amount") =>
                        setDiscountType(value)
                      }
                    >
                      <SelectTrigger className="w-24 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">
                          <div className="flex items-center gap-1">
                            <Percent className="h-3 w-3" />
                          </div>
                        </SelectItem>
                        <SelectItem value="amount">
                          <div className="flex items-center gap-1">
                            <SaudiRiyalSymbol className="h-3 w-3" />
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Discount Value */}
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder={discountType === "percentage" ? "0" : "0.00"}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      min="0"
                      max={
                        discountType === "percentage"
                          ? "100"
                          : cart.total.toString()
                      }
                      step={discountType === "percentage" ? "1" : "0.01"}
                      className="h-8 text-xs placeholder:text-xs w-full"
                    />
                  </div>
                </div>

                {/* Discount Preview */}
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-xs text-green-600 bg-green-50 dark:bg-green-950/50 px-2 py-1 rounded">
                    <span>Discount Applied:</span>
                    <span className="font-medium">
                      -{discountAmount.toFixed(2)} SAR
                    </span>
                  </div>
                )}

                {/* Clear Discount */}
                {discountValue && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDiscountValue("")}
                    className="w-full h-6 text-xs text-muted-foreground hover:text-red-600"
                  >
                    Clear Discount
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({cart.itemCount} items)</span>
              <PriceDisplay price={cart.total} symbolSize={14} />
            </div>

            {/* Individual Order Discount Display */}
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>
                  Order Discount (
                  {discountType === "percentage"
                    ? `${discountValue}%`
                    : "Amount"}
                  )
                </span>
                <span className="flex items-center">
                  -
                  <PriceDisplay
                    price={discountAmount}
                    symbolSize={14}
                    className="text-green-600"
                  />
                </span>
              </div>
            )}

            {/* Event Discount Display */}
            {eventDiscountAmount > 0 && (
              <div className="flex justify-between text-sm text-purple-600">
                <span className="flex items-center gap-1">
                  🎉 {eventDiscount.eventName} (
                  {eventDiscount.discountPercentage}%)
                </span>
                <span className="flex items-center">
                  -
                  <PriceDisplay
                    price={eventDiscountAmount}
                    symbolSize={14}
                    className="text-purple-600"
                  />
                </span>
              </div>
            )}

            {/* VAT temporarily hidden - can be re-enabled later */}
            {/* <div className="flex justify-between text-sm">
              <span>VAT (15% included)</span>
              <PriceDisplay
                price={(finalTotal * 0.15) / 1.15}
                symbolSize={14}
              />
            </div> */}
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <PriceDisplay
                price={finalTotal}
                symbolSize={16}
                className="font-semibold text-lg"
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium mb-2 block">
              Payment Method
            </Label>
            <div className="flex gap-3 justify-center">
              {[
                {
                  value: "cash",
                  label: "Cash",
                  icon: <Banknote className="h-5 w-5" />,
                  color: "bg-green-100 text-green-700 border-green-300",
                  active: "bg-green-600 text-white border-green-600 shadow-lg",
                },
                {
                  value: "card",
                  label: "Card",
                  icon: <CreditCard className="h-5 w-5" />,
                  color: "bg-blue-100 text-blue-700 border-blue-300",
                  active: "bg-blue-600 text-white border-blue-600 shadow-lg",
                },
                {
                  value: "mixed",
                  label: "Mixed",
                  icon: <Split className="h-5 w-5" />,
                  color: "bg-purple-100 text-purple-700 border-purple-300",
                  active:
                    "bg-purple-600 text-white border-purple-600 shadow-lg",
                },
              ].map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() =>
                    setPaymentMethod(method.value as "cash" | "card" | "mixed")
                  }
                  className={`flex-1 flex flex-col items-center gap-1 py-4 px-2 rounded-xl border font-semibold transition-all duration-200 cursor-pointer
                    ${
                      paymentMethod === method.value
                        ? method.active
                        : method.color
                    }
                    hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${
                      method.value === "cash"
                        ? "green"
                        : method.value === "card"
                        ? "blue"
                        : "purple"
                    }-400
                  `}
                >
                  {method.icon}
                  <span className="text-sm">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            className="w-full h-12 text-lg font-semibold"
            size="lg"
            onClick={handleProceedToCheckout}
            disabled={createOrder.isPending || userLoading || !currentUser}
          >
            {createOrder.isPending
              ? "Creating Order..."
              : userLoading
              ? "Loading..."
              : !currentUser
              ? "Please Login to Checkout"
              : "Proceed to Checkout"}
          </Button>
        </div>
      )}

      {/* Cash Calculator Dialog */}
      <CashCalculatorDialog
        open={showCashCalculator}
        onOpenChange={setShowCashCalculator}
        totalAmount={finalTotal}
        onCalculateChange={handleCashCalculation}
      />

      {/* Mixed Payment Dialog */}
      <MixedPaymentDialog
        open={showMixedPayment}
        onOpenChange={setShowMixedPayment}
        totalAmount={finalTotal}
        onConfirmPayment={handleMixedPayment}
      />
    </div>
  );
}
