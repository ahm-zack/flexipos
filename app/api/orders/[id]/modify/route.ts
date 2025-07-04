import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/lib/order-service';
import { z } from 'zod';
import { OrderItemSchema } from '@/lib/orders/schemas';

interface Params {
  id: string;
}

const ModifyOrderSchema = z.object({
  modifiedBy: z.string().uuid(),
  modificationType: z.enum(['item_added', 'item_removed', 'quantity_changed', 'item_replaced', 'multiple_changes']),
  customerName: z.string().optional(),
  items: z.array(OrderItemSchema).optional(),
  totalAmount: z.number().min(0).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate the data
    const validatedData = ModifyOrderSchema.parse(body);

    // Modify order in database
    const result = await orderService.modifyOrder(
      id,
      validatedData.modifiedBy,
      {
        customerName: validatedData.customerName,
        items: validatedData.items,
        totalAmount: validatedData.totalAmount,
      },
      validatedData.modificationType
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
