import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/lib/order-service';
import { CreateOrderSchema } from '@/lib/orders/schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') as 'completed' | 'canceled' | 'modified' | null;
    const createdBy = searchParams.get('createdBy');
    const customerName = searchParams.get('customerName');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build filters object
    const filters = {
      ...(status && { status }),
      ...(createdBy && { createdBy }),
      ...(customerName && { customerName }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
    };

    const result = await orderService.getOrders(filters, page, limit);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the data
    const validatedData = CreateOrderSchema.parse(body);

    // Create order in database
    const result = await orderService.createOrder({
      customerName: validatedData.customerName,
      items: validatedData.items,
      totalAmount: validatedData.totalAmount,
      paymentMethod: validatedData.paymentMethod,
      createdBy: validatedData.createdBy,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    
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
