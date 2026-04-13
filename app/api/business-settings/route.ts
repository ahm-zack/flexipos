import { NextRequest, NextResponse } from "next/server";
import {
  normalizeBusinessProfile,
  type RawBusinessProfile,
} from "@/lib/business-profile";
import {
  BusinessSettingsSchema,
  type BusinessSettingsInput,
} from "@/lib/schemas";
import {
  getCurrentUser,
  requireManagerOrHigher,
} from "@/lib/auth";
import { getCurrentUserBusinessId } from "@/lib/user-service";
import { createAdminClient } from "@/utils/supabase/admin";
import type { Json } from "@/database.types";

function isJsonObject(value: Json | null | undefined): value is Record<string, Json | undefined> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function buildMergedSettings(
  currentSettings: Json | null | undefined,
  input: BusinessSettingsInput,
) {
  const baseSettings = isJsonObject(currentSettings) ? currentSettings : {};

  return {
    ...baseSettings,
    nameAr: input.nameAr ?? null,
    name_ar: input.nameAr ?? null,
    addressAr: input.addressAr ?? null,
    address_ar: input.addressAr ?? null,
    vatNumber: input.vatNumber ?? null,
    vat_number: input.vatNumber ?? null,
    crNumber: input.crNumber ?? null,
    cr_number: input.crNumber ?? null,
  };
}

export async function GET() {
  try {
    const { user, error: authError } = await getCurrentUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: authError || "Not authenticated" },
        { status: 401 },
      );
    }

    const businessResult = await getCurrentUserBusinessId(user.id);
    if (!businessResult.success || !businessResult.data) {
      return NextResponse.json(
        { success: false, error: businessResult.error || "No business found" },
        { status: 400 },
      );
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from("businesses")
      .select("*")
      .eq("id", businessResult.data)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Failed to load business settings" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: normalizeBusinessProfile(data as RawBusinessProfile),
    });
  } catch (error) {
    console.error("Error in GET /api/business-settings:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { authorized, user, error: authError } = await requireManagerOrHigher();

    if (!authorized || !user) {
      return NextResponse.json(
        {
          success: false,
          error: authError || "Unauthorized: Only managers or admins can update business settings",
        },
        { status: 403 },
      );
    }

    const businessResult = await getCurrentUserBusinessId(user.id);
    if (!businessResult.success || !businessResult.data) {
      return NextResponse.json(
        { success: false, error: businessResult.error || "No business found" },
        { status: 400 },
      );
    }

    const payload = BusinessSettingsSchema.parse(await request.json());
    const adminClient = createAdminClient();

    const { data: currentBusiness, error: currentBusinessError } = await adminClient
      .from("businesses")
      .select("*")
      .eq("id", businessResult.data)
      .single();

    if (currentBusinessError || !currentBusiness) {
      return NextResponse.json(
        { success: false, error: "Failed to load existing business settings" },
        { status: 500 },
      );
    }

    const mergedSettings = buildMergedSettings(currentBusiness.settings, payload);
    const updateData = {
      name: payload.name,
      address: payload.address ?? null,
      address_ar: payload.addressAr ?? null,
      phone: payload.phone ?? null,
      email: payload.email ?? null,
      website: payload.website ?? null,
      name_ar: payload.nameAr ?? null,
      vat_number: payload.vatNumber ?? null,
      cr_number: payload.crNumber ?? null,
      settings: mergedSettings,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedBusiness, error: updateError } = await adminClient
      .from("businesses")
      .update(updateData)
      .eq("id", businessResult.data)
      .select("*")
      .single();

    if (updateError || !updatedBusiness) {
      console.error("Failed to update business settings:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update business settings" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: normalizeBusinessProfile(updatedBusiness as RawBusinessProfile),
    });
  } catch (error) {
    console.error("Error in PATCH /api/business-settings:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}