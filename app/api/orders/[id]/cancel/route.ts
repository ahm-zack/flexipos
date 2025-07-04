import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/lib/order-service';
import { z } from 'zod';

interface Params {
  id: string;
}

const CancelOrderSchema = z.object({
  canceledBy: z.string().uuid(),
  reason: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate the data
    const validatedData = CancelOrderSchema.parse(body);

    // Cancel order in database
    const result = await orderService.cancelOrder(
      id,
      validatedData.canceledBy,
      validatedData.reason
    );

    if (!result.success) {
      return NextResponse.json(result, { status: result.error === 'Order not found' ? 404 : 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in POST /api/orders/[id]/cancel:', error);
    
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
