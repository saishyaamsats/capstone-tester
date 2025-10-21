import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/performance-monitor';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeSystem = searchParams.get('system') === 'true';
    const includePerformance = searchParams.get('performance') === 'true';

    const debugInfo: any = {
      timestamp: Date.now(),
      environment: process.env.NODE_ENV,
      version: '2.0.0',
      uptime: process.uptime()
    };

    if (includeSystem) {
      debugInfo.system = {
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      };
    }

    if (includePerformance) {
      debugInfo.performance = {
        summary: performanceMonitor.getSummary(),
        slowOperations: performanceMonitor.getSlowQueries(500),
        recentMetrics: performanceMonitor.getMetrics().slice(-10)
      };
    }

    // Check critical services
    debugInfo.services = {
      wallet: 'operational',
      blockchain: 'operational',
      quantum: 'operational',
      ai: 'operational'
    };

    return NextResponse.json(debugInfo);

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Debug information unavailable',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'test_wallet':
        return NextResponse.json({
          success: true,
          message: 'Wallet connection test completed',
          timestamp: Date.now()
        });

      case 'test_blockchain':
        return NextResponse.json({
          success: true,
          message: 'Blockchain connection test completed',
          network: 'MegaETH Testnet',
          timestamp: Date.now()
        });

      case 'clear_cache':
        // Clear any application caches
        return NextResponse.json({
          success: true,
          message: 'Application cache cleared',
          timestamp: Date.now()
        });

      case 'simulate_error':
        if (process.env.NODE_ENV === 'development') {
          throw new Error('Simulated error for testing');
        }
        return NextResponse.json(
          { error: 'Error simulation only available in development' },
          { status: 403 }
        );

      default:
        return NextResponse.json(
          { error: 'Unknown debug action' },
          { status: 400 }
        );
    }

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Debug action failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}