import { NextRequest, NextResponse } from "next/server";
import { miniPieService } from "@/lib/mini-pie-service";
import { UpdateMiniPieSchema } from "@/lib/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await miniPieService.getMiniPieById(id);
    
    if (!result.success) {
      const status = result.error === 'Mini pie not found' ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/mini-pies/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate the request body
    const validationResult = UpdateMiniPieSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("Validation error in PUT /api/mini-pies/[id]:", validationResult.error.issues, "Payload:", body);
      return NextResponse.json(
        { success: false, error: "Invalid data", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const miniPieData: Record<string, unknown> = {
      type: validationResult.data.type,
      nameAr: validationResult.data.nameAr,
      nameEn: validationResult.data.nameEn,
      size: validationResult.data.size,
      priceWithVat: validationResult.data.priceWithVat,
      imageUrl: validationResult.data.imageUrl || "",
    };
    if (validationResult.data.modifiers !== undefined) {
      miniPieData.modifiers = validationResult.data.modifiers;
    }

    const result = await miniPieService.updateMiniPie(id, miniPieData);
    
    if (!result.success) {
      const status = result.error === 'Mini pie not found' ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in PUT /api/mini-pies/[id]:", error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid data format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await miniPieService.deleteMiniPie(id);
    
    if (!result.success) {
      const status = result.error === 'Mini pie not found' ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in DELETE /api/mini-pies/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
