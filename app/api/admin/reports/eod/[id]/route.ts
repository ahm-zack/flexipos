import { NextRequest, NextResponse } from 'next/server';
import { getEODReportById, deleteEODReport } from '@/lib/eod-report-service';
import { requireRole } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: reportId } = await params;
    
    if (!reportId) {
      return NextResponse.json({
        success: false,
        error: 'Report ID is required',
        message: 'Invalid request parameters'
      }, { status: 400 });
    }
    
    const report = await getEODReportById(reportId);
    
    return NextResponse.json({
      success: true,
      data: report,
      message: 'EOD report retrieved successfully',
      requestedBy: user.id
    });
    
  } catch (error) {
    console.error('Error retrieving EOD report:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({
        success: false,
        error: 'EOD report not found',
        message: 'The requested EOD report does not exist'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to retrieve EOD report'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: reportId } = await params;
    
    if (!reportId) {
      return NextResponse.json({
        success: false,
        error: 'Report ID is required',
        message: 'Invalid request parameters'
      }, { status: 400 });
    }
    
    await deleteEODReport(reportId);
    
    return NextResponse.json({
      success: true,
      message: 'EOD report deleted successfully',
      deletedBy: user.id,
      deletedReportId: reportId
    });
    
  } catch (error) {
    console.error('Error deleting EOD report:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({
        success: false,
        error: 'EOD report not found',
        message: 'The requested EOD report does not exist'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to delete EOD report'
    }, { status: 500 });
  }
}
