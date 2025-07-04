import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/lib/order-service';
import { UpdateOrderSchema } from '@/lib/orders/schemas';

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    
    const result = await orderService.getOrderById(id);
    
    if (!result.success) {
      return NextResponse.json(result, { status: result.error === 'Order not found' ? 404 : 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/orders/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate the data
    const validatedData = UpdateOrderSchema.parse(body);

    // Update order in database
    const result = await orderService.updateOrder(id, {
      customerName: validatedData.customerName,
      items: validatedData.items,
      totalAmount: validatedData.totalAmount,
      status: validatedData.status,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: result.error === 'Order not found' ? 404 : 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in PUT /api/orders/[id]:', error);
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    
    const result = await orderService.deleteOrder(id);
    
    if (!result.success) {
      return NextResponse.json(result, { status: result.error === 'Order not found' ? 404 : 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in DELETE /api/orders/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
