import { NextRequest, NextResponse } from "next/server";
import { miniPieService } from "@/lib/mini-pie-service";
import { editMiniPieFormSchema } from "@/lib/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await miniPieService.getMiniPieById(id);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in GET /api/mini-pies/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
    const validationResult = editMiniPieFormSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const miniPieData = {
      type: validationResult.data.type,
      nameAr: validationResult.data.nameAr,
      nameEn: validationResult.data.nameEn,
      size: validationResult.data.size,
      priceWithVat: validationResult.data.priceWithVat,
      imageUrl: validationResult.data.imageUrl || "",
    };

    const result = await miniPieService.updateMiniPie(id, miniPieData);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in PUT /api/mini-pies/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: "Mini pie deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/mini-pies/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
