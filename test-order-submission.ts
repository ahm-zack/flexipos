// Quick test for order submission with modifiers
import { CreateOrderSchema } from './lib/orders/schemas';

// Test cart item with modifiers (mimicking what the frontend would send)
const testCartItem = {
  id: "b0e89c4f-4e6b-4c2d-8c5f-8e3d7c8b9a10-1734897234567", // composite ID
  name: "Margherita Pizza",
  price: 15.00,
  quantity: 1,
  category: "Pizza",
  description: "Classic pizza with tomato sauce and mozzarella",
  modifiers: [
    {
      id: "mod-1",
      name: "Extra Cheese",
      type: "extra" as const,
      price: 2.50
    },
    {
      id: "mod-2", 
      name: "No Tomato Sauce",
      type: "without" as const,
      price: 0
    }
  ],
  modifiersTotal: 2.50
};

// Test order data
const testOrder = {
  customerName: "Test Customer",
  items: [testCartItem],
  totalAmount: 17.50, // 15.00 + 2.50
  paymentMethod: "cash" as const,
  createdBy: "a0e89c4f-4e6b-4c2d-8c5f-8e3d7c8b9a00" // valid UUID
};

console.log("🧪 Testing order schema validation...");

try {
  const validatedOrder = CreateOrderSchema.parse(testOrder);
  console.log("✅ Order validation successful!");
  console.log("Validated order:", JSON.stringify(validatedOrder, null, 2));
} catch (error) {
  console.log("❌ Order validation failed:");
  console.error(error);
}
