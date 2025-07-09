import { NextRequest, NextResponse } from "next/server";
import { miniPieService } from "@/lib/mini-pie-service";
import { CreateMiniPieSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const result = await miniPieService.getMiniPies();
    
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/mini-pies:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validationResult = CreateMiniPieSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid data", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const miniPieData = {
      type: validationResult.data.type,
      nameAr: validationResult.data.nameAr,
      nameEn: validationResult.data.nameEn,
      size: validationResult.data.size,
      priceWithVat: String(validationResult.data.priceWithVat),
      imageUrl: validationResult.data.imageUrl || "",
      modifiers: validationResult.data.modifiers || [],
    };

    const result = await miniPieService.createMiniPie(miniPieData);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/mini-pies:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
