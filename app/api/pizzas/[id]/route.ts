import { NextRequest, NextResponse } from 'next/server';
import { pizzaService } from '@/lib/pizza-service';
import { UpdatePizzaSchema, type UpdatePizza } from '@/lib/schemas';
import type { NewPizza } from '@/lib/db/schema';

interface Params {
  id: string;
}

// Type-safe transformation from UpdatePizza to Partial<NewPizza>
function transformUpdatePizzaToPartialNewPizza(updateData: UpdatePizza): Partial<NewPizza> {
  const result: Partial<NewPizza> = {};
  
  if (updateData.type !== undefined) {
    result.type = updateData.type;
  }
  
  if (updateData.nameAr !== undefined) {
    result.nameAr = updateData.nameAr;
  }
  
  if (updateData.nameEn !== undefined) {
    result.nameEn = updateData.nameEn;
  }
  
  if (updateData.crust !== undefined) {
    result.crust = updateData.crust;
  }
  
  if (updateData.imageUrl !== undefined) {
    result.imageUrl = updateData.imageUrl;
  }
  
  if (updateData.extras !== undefined) {
    result.extras = updateData.extras;
  }
  
  if (updateData.priceWithVat !== undefined) {
    // Convert to string as expected by the database schema
    result.priceWithVat = typeof updateData.priceWithVat === 'string' 
      ? updateData.priceWithVat 
      : updateData.priceWithVat.toString();
  }
  
  if (updateData.modifiers !== undefined) {
    result.modifiers = updateData.modifiers;
  }
  
  return result;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const resolvedParams = await params;
    const result = await pizzaService.getPizzaById(resolvedParams.id);
    
    if (!result.success) {
      const status = result.error === 'Pizza not found' ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/pizzas/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const body = await request.json();
    
    // Validate the data
    const validatedData = UpdatePizzaSchema.parse(body);

    // Transform validated data to the format expected by the service
    const updateData = transformUpdatePizzaToPartialNewPizza(validatedData);

    const resolvedParams = await params;
    const result = await pizzaService.updatePizza(resolvedParams.id, updateData);

    if (!result.success) {
      const status = result.error === 'Pizza not found' ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in PATCH /api/pizzas/[id]:', error);
    
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
    const resolvedParams = await params;
    const result = await pizzaService.deletePizza(resolvedParams.id);

    if (!result.success) {
      const status = result.error === 'Pizza not found' ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in DELETE /api/pizzas/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
