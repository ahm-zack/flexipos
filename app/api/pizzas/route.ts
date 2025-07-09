import { NextRequest, NextResponse } from 'next/server';
import { pizzaService } from '@/lib/pizza-service';
import { CreatePizzaSchema } from '@/lib/schemas';

export async function GET() {
  try {
    const result = await pizzaService.getPizzas();
    
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/pizzas:', error);
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
    const validatedData = CreatePizzaSchema.parse(body);

    // Create pizza in database
    const result = await pizzaService.createPizza({
      type: validatedData.type,
      nameAr: validatedData.nameAr,
      nameEn: validatedData.nameEn,
      crust: validatedData.crust || null,
      imageUrl: validatedData.imageUrl || '',
      extras: validatedData.extras || null,
      priceWithVat: validatedData.priceWithVat.toString(),
      modifiers: validatedData.modifiers || [],
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/pizzas:', error);
    
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
