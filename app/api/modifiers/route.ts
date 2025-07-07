import { NextRequest, NextResponse } from 'next/server';
import { getModifiersByMenuItem, createModifier } from '@/lib/modifiers-service';
import type { CreateModifierRequest } from '@/lib/modifiers-service';

// GET /api/modifiers?menuItemId=xxx&menuItemType=pizza
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const menuItemId = searchParams.get('menuItemId');
    const menuItemType = searchParams.get('menuItemType');

    if (!menuItemId || !menuItemType) {
      return NextResponse.json(
        { error: 'menuItemId and menuItemType are required' },
        { status: 400 }
      );
    }

    const result = await getModifiersByMenuItem(menuItemId, menuItemType);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ modifiers: result.data });
  } catch (error) {
    console.error('Error in GET /api/modifiers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/modifiers
export async function POST(request: NextRequest) {
  try {
    const body: CreateModifierRequest = await request.json();

    // Validate required fields
    if (!body.menuItemId || !body.menuItemType || !body.name || !body.type) {
      return NextResponse.json(
        { error: 'menuItemId, menuItemType, name, and type are required' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['extra', 'without'].includes(body.type)) {
      return NextResponse.json(
        { error: 'type must be either "extra" or "without"' },
        { status: 400 }
      );
    }

    // Validate menuItemType
    if (!['pizza', 'pie', 'sandwich', 'mini_pie'].includes(body.menuItemType)) {
      return NextResponse.json(
        { error: 'menuItemType must be one of: pizza, pie, sandwich, mini_pie' },
        { status: 400 }
      );
    }

    // Ensure price is provided for extras and is 0 for withouts
    if (body.type === 'extra' && (body.price === undefined || body.price < 0)) {
      return NextResponse.json(
        { error: 'price is required for extras and must be >= 0' },
        { status: 400 }
      );
    }

    if (body.type === 'without') {
      body.price = 0; // Force price to 0 for withouts
    }

    const result = await createModifier(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ modifier: result.data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/modifiers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
