import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/lib/order-service';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';
import { OrderItemSchema, PaymentMethodEnum } from '@/lib/orders/schemas';

interface Params {
  id: string;
}

const ModifyOrderSchema = z.object({
  modifiedBy: z.string().uuid().optional(),
  modificationType: z.enum(['item_added', 'item_removed', 'quantity_changed', 'item_replaced', 'multiple_changes']).optional(),
  customerName: z.string().optional(),
  items: z.array(OrderItemSchema).optional(),
  totalAmount: z.number().min(0).optional(),
  paymentMethod: PaymentMethodEnum.optional(),
  reason: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Get current user for modification tracking
    const { user: currentUser, error: authError } = await getCurrentUser();
    if (authError || !currentUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Validate the data
    const validatedData = ModifyOrderSchema.parse(body);

    // Use current user ID for modification tracking
    const modifiedBy = validatedData.modifiedBy || currentUser.id;
    const modificationType = validatedData.modificationType || 'multiple_changes';

    // Modify order in database
    const result = await orderService.modifyOrder(
      id,
      modifiedBy,
      {
        customerName: validatedData.customerName,
        items: validatedData.items,
        totalAmount: validatedData.totalAmount,
        paymentMethod: validatedData.paymentMethod,
      },
      modificationType
    );

    if (!result.success) {
      return NextResponse.json(result, { status: result.error === 'Order not found' ? 404 : 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in POST /api/orders/[id]/modify:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid data format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
