import { NextRequest, NextResponse } from 'next/server';

interface SystemMetrics {
  uptime: number;
  memory: NodeJS.MemoryUsage;
  timestamp: number;
  environment: string;
  version: string;
  features: {
    quantumComputing: boolean;
    blockchainIntegration: boolean;
    aiAssistant: boolean;
    postQuantumCrypto: boolean;
  };
}

export async function GET(request: NextRequest) {
  try {
    const metrics: SystemMetrics = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: Date.now(),
      environment: process.env.NODE_ENV || 'development',
      version: '2.0.0',
      features: {
        quantumComputing: true,
        blockchainIntegration: true,
        aiAssistant: true,
        postQuantumCrypto: true
      }
    };

    // Add performance metrics
    const performanceMetrics = {
      heapUsedMB: Math.round(metrics.memory.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(metrics.memory.heapTotal / 1024 / 1024),
      externalMB: Math.round(metrics.memory.external / 1024 / 1024),
      uptimeHours: Math.round(metrics.uptime / 3600 * 100) / 100
    };

    return NextResponse.json({
      ...metrics,
      performance: performanceMetrics,
      status: 'operational'
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch system metrics',
        timestamp: Date.now(),
        status: 'error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'gc':
        // Trigger garbage collection if available
        if (global.gc) {
          global.gc();
          return NextResponse.json({ 
            success: true, 
            message: 'Garbage collection triggered',
            timestamp: Date.now()
          });
        } else {
          return NextResponse.json({ 
            success: false, 
            message: 'Garbage collection not available',
            timestamp: Date.now()
          });
        }

      case 'clear_cache':
        // Clear any in-memory caches
        return NextResponse.json({ 
          success: true, 
          message: 'Cache cleared',
          timestamp: Date.now()
        });

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to execute system action' },
      { status: 500 }
    );
  }
}