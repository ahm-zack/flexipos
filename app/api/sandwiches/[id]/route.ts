import { NextRequest, NextResponse } from 'next/server';
import { sandwichService } from '@/lib/sandwich-service';
import { UpdateSandwichSchema } from '@/lib/schemas';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = await sandwichService.getSandwichById(id);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in GET /api/sandwiches/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    // Validate the request body
    const validationResult = UpdateSandwichSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    // Remove modifiers from the spread to avoid accidental overwrite
    const { modifiers, ...rest } = validationResult.data;
    const updateData: Record<string, unknown> = {
      ...rest,
      priceWithVat: validationResult.data.priceWithVat?.toString(),
    };
    // Only include modifiers if present in the request
    if (modifiers !== undefined) {
      updateData.modifiers = modifiers;
    }
    const result = await sandwichService.updateSandwich(id, updateData);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in PATCH /api/sandwiches/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = await sandwichService.deleteSandwich(id);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ message: 'Sandwich deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/sandwiches/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
