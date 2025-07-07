import { NextRequest, NextResponse } from 'next/server';
import { reorderModifiers } from '@/lib/modifiers-service';
import type { ReorderModifiersRequest } from '@/lib/modifiers-service';

// POST /api/modifiers/reorder
export async function POST(request: NextRequest) {
  try {
    const body: ReorderModifiersRequest = await request.json();

    // Validate request body
    if (!body.modifiers || !Array.isArray(body.modifiers)) {
      return NextResponse.json(
        { error: 'modifiers array is required' },
        { status: 400 }
      );
    }

    // Validate each modifier object
    for (const modifier of body.modifiers) {
      if (!modifier.id || typeof modifier.displayOrder !== 'number') {
        return NextResponse.json(
          { error: 'Each modifier must have id and displayOrder' },
          { status: 400 }
        );
      }
    }

    const result = await reorderModifiers(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/modifiers/reorder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
