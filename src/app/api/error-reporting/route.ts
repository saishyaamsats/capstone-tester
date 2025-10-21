import { NextRequest, NextResponse } from 'next/server';
import { advancedErrorHandler, ErrorCategory, ErrorSeverity } from '@/lib/advanced-error-handler';

interface ErrorReport {
  errorId: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context?: any;
  userAgent: string;
  url: string;
  timestamp: number;
  userId?: string;
}

// In-memory error storage (in production, use a proper database)
const errorReports: ErrorReport[] = [];

export async function POST(request: NextRequest) {
  try {
    const { 
      errorId, 
      message, 
      category, 
      severity, 
      context, 
      userAgent, 
      url, 
      userId 
    } = await request.json();

    if (!errorId || !message) {
      return NextResponse.json(
        { error: 'Error ID and message are required' },
        { status: 400 }
      );
    }

    const errorReport: ErrorReport = {
      errorId,
      message,
      category: category || ErrorCategory.SYSTEM,
      severity: severity || ErrorSeverity.MEDIUM,
      context,
      userAgent: userAgent || request.headers.get('user-agent') || 'Unknown',
      url: url || request.headers.get('referer') || 'Unknown',
      timestamp: Date.now(),
      userId
    };

    errorReports.push(errorReport);

    // Keep only last 1000 error reports
    if (errorReports.length > 1000) {
      errorReports.splice(0, errorReports.length - 1000);
    }

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
    }

    // In production, you would send this to an error tracking service
    // like Sentry, LogRocket, or Bugsnag

    return NextResponse.json({
      success: true,
      reportId: errorReport.errorId,
      message: 'Error report submitted successfully',
      timestamp: errorReport.timestamp
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit error report' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as ErrorCategory;
    const severity = searchParams.get('severity') as ErrorSeverity;
    const limit = parseInt(searchParams.get('limit') || '50');
    const userId = searchParams.get('userId');

    let filteredReports = errorReports;

    if (category) {
      filteredReports = filteredReports.filter(report => report.category === category);
    }

    if (severity) {
      filteredReports = filteredReports.filter(report => report.severity === severity);
    }

    if (userId) {
      filteredReports = filteredReports.filter(report => report.userId === userId);
    }

    // Sort by timestamp (newest first) and limit results
    const results = filteredReports
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    // Generate analytics
    const analytics = {
      totalReports: filteredReports.length,
      categoryCounts: Object.values(ErrorCategory).reduce((acc, cat) => {
        acc[cat] = filteredReports.filter(r => r.category === cat).length;
        return acc;
      }, {} as Record<ErrorCategory, number>),
      severityCounts: Object.values(ErrorSeverity).reduce((acc, sev) => {
        acc[sev] = filteredReports.filter(r => r.severity === sev).length;
        return acc;
      }, {} as Record<ErrorSeverity, number>),
      timeRange: {
        earliest: Math.min(...filteredReports.map(r => r.timestamp)),
        latest: Math.max(...filteredReports.map(r => r.timestamp))
      }
    };

    return NextResponse.json({
      reports: results,
      analytics,
      timestamp: Date.now()
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch error reports' },
      { status: 500 }
    );
  }
}