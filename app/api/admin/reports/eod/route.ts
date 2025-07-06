import { NextRequest, NextResponse } from 'next/server';
import { generateEODReport, validateEODReportRequest, saveEODReportToDatabase } from '@/lib/eod-report-service';
import { requireRole } from '@/lib/auth';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    
    // Validate request
    const validatedRequest = validateEODReportRequest(body);
    
    // Generate report
    const report = await generateEODReport(validatedRequest);
    
    // Save to database if requested
    let savedReportId: string | undefined;
    if (validatedRequest.saveToDatabase) {
      savedReportId = await saveEODReportToDatabase(report, user.id);
    }
    
    return NextResponse.json({
      success: true,
      data: report,
      message: 'EOD report generated successfully',
      savedToDatabase: validatedRequest.saveToDatabase,
      savedReportId,
      generatedBy: user.id
    });
    
  } catch (error) {
    console.error('Error generating EOD report:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to generate EOD report'
    }, { status: 400 });
  }
}

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
    
    // Quick presets for testing
    const preset = searchParams.get('preset') || 'today';
    const saveToDb = searchParams.get('save') === 'true';
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDateTime: Date;
    let endDateTime: Date;
    
    switch (preset) {
      case 'yesterday':
        startDateTime = new Date(today);
        startDateTime.setDate(startDateTime.getDate() - 1);
        endDateTime = new Date(today);
        break;
      case 'last-7-days':
        startDateTime = new Date(today);
        startDateTime.setDate(startDateTime.getDate() - 7);
        endDateTime = now;
        break;
      default: // today
        startDateTime = today;
        endDateTime = now;
    }
    
    const reportRequest = {
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      saveToDatabase: saveToDb,
      includePreviousPeriodComparison: false
    };
    
    const report = await generateEODReport(reportRequest);
    
    // Save to database if requested
    let savedReportId: string | undefined;
    if (saveToDb) {
      savedReportId = await saveEODReportToDatabase(report, user.id);
    }
    
    return NextResponse.json({
      success: true,
      data: report,
      message: `EOD report generated for ${preset}`,
      parameters: {
        preset,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        savedToDatabase: saveToDb
      },
      savedReportId,
      generatedBy: user.id
    });
    
  } catch (error) {
    console.error('Error generating EOD report:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to generate EOD report'
    }, { status: 500 });
  }
}
