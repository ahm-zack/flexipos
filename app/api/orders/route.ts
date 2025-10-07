import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/lib/order-service';

export async function POST(request: NextRequest) {
    try {
        const orderData = await request.json();

        const result = await orderService.createOrder(orderData);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Failed to create order' },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true, data: result.data });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}