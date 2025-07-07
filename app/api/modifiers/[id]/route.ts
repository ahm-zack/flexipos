import { NextRequest, NextResponse } from 'next/server';
import { updateModifier, deleteModifier } from '@/lib/modifiers-service';
import type { UpdateModifierRequest } from '@/lib/modifiers-service';

// PUT /api/modifiers/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: modifierId } = await params;
    const body: UpdateModifierRequest = await request.json();

    // Validate type if provided
    if (body.type && !['extra', 'without'].includes(body.type)) {
      return NextResponse.json(
        { error: 'type must be either "extra" or "without"' },
        { status: 400 }
      );
    }

    // Validate price if provided
    if (body.price !== undefined && body.price < 0) {
      return NextResponse.json(
        { error: 'price must be >= 0' },
        { status: 400 }
      );
    }

    // If changing to "without", force price to 0
    if (body.type === 'without') {
      body.price = 0;
    }

    const result = await updateModifier(modifierId, body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'Modifier not found' ? 404 : 500 }
      );
    }

    return NextResponse.json({ modifier: result.data });
  } catch (error) {
    console.error('Error in PUT /api/modifiers/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/modifiers/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: modifierId } = await params;

    const result = await deleteModifier(modifierId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'Modifier not found' ? 404 : 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/modifiers/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
