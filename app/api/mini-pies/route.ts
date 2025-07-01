import { NextRequest, NextResponse } from "next/server";
import { miniPieService } from "@/lib/mini-pie-service";
import { createMiniPieFormSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const result = await miniPieService.getMiniPies();
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in GET /api/mini-pies:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validationResult = createMiniPieFormSchema.safeParse(body);
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

    const result = await miniPieService.createMiniPie(miniPieData);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/mini-pies:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
