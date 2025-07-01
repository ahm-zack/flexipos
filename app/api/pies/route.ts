import { NextRequest, NextResponse } from 'next/server';
import { pieService } from '@/lib/pie-service';
import { CreatePieSchema } from '@/lib/schemas';

export async function GET() {
  try {
    const result = await pieService.getPies();
    
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/pies:', error);
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
    const validatedData = CreatePieSchema.parse(body);

    // Create pie in database
    const result = await pieService.createPie({
      type: validatedData.type,
      nameAr: validatedData.nameAr,
      nameEn: validatedData.nameEn,
      size: validatedData.size,
      imageUrl: validatedData.imageUrl || '',
      priceWithVat: validatedData.priceWithVat.toString(),
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/pies:', error);
    
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
