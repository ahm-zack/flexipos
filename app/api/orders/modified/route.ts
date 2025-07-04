import { NextResponse } from 'next/server';
import { orderService } from '@/lib/order-service';

export async function GET() {
  try {
    const result = await orderService.getModifiedOrders();
    
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/orders/modified:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
