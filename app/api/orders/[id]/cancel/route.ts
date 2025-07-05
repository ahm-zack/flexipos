import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/lib/order-service';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';
import { PaymentMethodEnum } from '@/lib/orders/schemas';

interface Params {
  id: string;
}

const CancelOrderSchema = z.object({
  canceledBy: z.string().uuid().optional(),
  reason: z.string().optional(),
  paymentMethod: PaymentMethodEnum.optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Get current user for cancellation tracking
    const { user: currentUser, error: authError } = await getCurrentUser();
    if (authError || !currentUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Validate the data
    const validatedData = CancelOrderSchema.parse(body);

    // Use current user ID for cancellation tracking
    const canceledBy = validatedData.canceledBy || currentUser.id;

    // Cancel order in database
    const result = await orderService.cancelOrder(
      id,
      canceledBy,
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
