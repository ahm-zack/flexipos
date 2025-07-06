import { NextRequest, NextResponse } from 'next/server';
import { getEODReportsHistory } from '@/lib/eod-report-service';
import { requireRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check authorization - EOD reports require manager level or higher
    const { authorized, user, error: authError } = await requireRole('manager');
    
    if (!authorized || !user) {
      return NextResponse.json({
        success: false,
        error: authError || 'Unauthorized access',
        message: 'Manager role or higher required for EOD reports'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    
    // Parse dates if provided
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;
    
    // Validate date parsing
    if (startDateStr && (!startDate || isNaN(startDate.getTime()))) {
      return NextResponse.json({
        success: false,
        error: 'Invalid start date format',
        message: 'Please provide start date in ISO format (YYYY-MM-DD)'
      }, { status: 400 });
    }
    
    if (endDateStr && (!endDate || isNaN(endDate.getTime()))) {
      return NextResponse.json({
        success: false,
        error: 'Invalid end date format',
        message: 'Please provide end date in ISO format (YYYY-MM-DD)'
      }, { status: 400 });
    }
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({
        success: false,
        error: 'Invalid pagination parameters',
        message: 'Page must be >= 1 and limit must be between 1 and 100'
      }, { status: 400 });
    }
    
    const result = await getEODReportsHistory(page, limit, startDate, endDate);
    
    return NextResponse.json({
      success: true,
      data: result.reports,
      pagination: result.pagination,
      message: 'EOD reports retrieved successfully',
      requestedBy: user.id
    });
    
  } catch (error) {
    console.error('Error retrieving EOD reports:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to retrieve EOD reports'
    }, { status: 500 });
  }
}
