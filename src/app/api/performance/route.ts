import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/performance-monitor';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');
    const threshold = parseInt(searchParams.get('threshold') || '1000');

    if (operation) {
      const metrics = performanceMonitor.getMetrics(operation);
      const averageTime = performanceMonitor.getAverageTime(operation);
      
      return NextResponse.json({
        operation,
        metrics,
        averageTime,
        count: metrics.length,
        timestamp: Date.now()
      });
    }

    const summary = performanceMonitor.getSummary();
    const slowQueries = performanceMonitor.getSlowQueries(threshold);
    const allMetrics = performanceMonitor.getMetrics();

    return NextResponse.json({
      summary,
      slowQueries,
      recentMetrics: allMetrics.slice(-20), // Last 20 metrics
      timestamp: Date.now()
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    performanceMonitor.clearMetrics();
    
    return NextResponse.json({
      success: true,
      message: 'Performance metrics cleared',
      timestamp: Date.now()
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear performance metrics' },
      { status: 500 }
    );
  }
}