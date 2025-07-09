import { NextRequest, NextResponse } from 'next/server';
import { pieService } from '@/lib/pie-service';
import { UpdatePieSchema } from '@/lib/schemas';

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    
    // Since we don't have a getPieById method, we'll get all pies and filter
    const result = await pieService.getPies();
    
    if (!result.success || !result.data) {
      return NextResponse.json(result, { status: 500 });
    }
    
    const pie = result.data.find((p) => p.id === id);
    
    if (!pie) {
      return NextResponse.json(
        { success: false, error: 'Pie not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: pie });
  } catch (error) {
    console.error('Error in GET /api/pies/[id]:', error);
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
    
    // Validate the update data
    const validatedData = UpdatePieSchema.parse(body);
    
    // Update pie in database
    const updateData = {
      ...validatedData,
      modifiers: validatedData.modifiers ?? [],
    };
    const result = await pieService.updatePie(id, updateData);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in PUT /api/pies/[id]:', error);
    
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
    
    // Delete pie from database
    const result = await pieService.deletePie(id);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in DELETE /api/pies/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
