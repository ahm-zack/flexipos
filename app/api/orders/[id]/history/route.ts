import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/lib/order-service';

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    
    const result = await orderService.getOrderHistory(id);
    
    if (!result.success) {
      return NextResponse.json(result, { status: result.error === 'Order not found' ? 404 : 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/orders/[id]/history:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
