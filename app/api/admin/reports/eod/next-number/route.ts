import { NextResponse } from 'next/server';
import { getNextEODReportNumber } from '@/lib/eod-report/server-utils';

export async function GET() {
  try {
    const nextReportNumber = await getNextEODReportNumber();
    
    return NextResponse.json({
      success: true,
      data: {
        nextReportNumber,
      },
    });
  } catch (error) {
    console.error('Error getting next EOD report number:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
