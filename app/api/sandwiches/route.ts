import { NextRequest, NextResponse } from 'next/server';
import { sandwichService } from '@/lib/sandwich-service';
import { CreateSandwichSchema } from '@/lib/schemas';

export async function GET() {
  try {
    const result = await sandwichService.getSandwiches();
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error in GET /api/sandwiches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validationResult = CreateSandwichSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const sandwichData = {
      ...validationResult.data,
      priceWithVat: validationResult.data.priceWithVat.toString(),
      modifiers: validationResult.data.modifiers || [],
    };
    const result = await sandwichService.createSandwich(sandwichData);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/sandwiches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
