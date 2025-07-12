import { NextResponse } from 'next/server';
import { pieServerService } from '@/lib/supabase/server-db';

export async function GET() {
  try {
    const pies = await pieServerService.getPies();
    return NextResponse.json({ 
      success: true, 
      count: pies.length, 
      pies: pies.slice(0, 2) // Return first 2 for testing
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}
