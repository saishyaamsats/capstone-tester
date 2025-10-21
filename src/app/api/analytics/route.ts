import { NextRequest, NextResponse } from 'next/server';

interface AnalyticsEvent {
  id: string;
  type: 'job_submitted' | 'job_completed' | 'wallet_connected' | 'page_view';
  userId?: string;
  metadata: Record<string, any>;
  timestamp: number;
}

// In-memory analytics storage (in production, use a proper analytics service)
const analyticsEvents: AnalyticsEvent[] = [];

export async function POST(request: NextRequest) {
  try {
    const { type, userId, metadata } = await request.json();

    if (!type) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      );
    }

    const event: AnalyticsEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      userId,
      metadata: metadata || {},
      timestamp: Date.now()
    };

    analyticsEvents.push(event);

    // Keep only last 1000 events to prevent memory issues
    if (analyticsEvents.length > 1000) {
      analyticsEvents.splice(0, analyticsEvents.length - 1000);
    }

    return NextResponse.json({ 
      success: true, 
      eventId: event.id,
      timestamp: event.timestamp
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to record analytics event' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '100');

    let filteredEvents = analyticsEvents;

    if (type) {
      filteredEvents = filteredEvents.filter(event => event.type === type);
    }

    if (userId) {
      filteredEvents = filteredEvents.filter(event => event.userId === userId);
    }

    // Sort by timestamp (newest first) and limit results
    const results = filteredEvents
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    const summary = {
      totalEvents: filteredEvents.length,
      eventTypes: [...new Set(filteredEvents.map(e => e.type))],
      timeRange: {
        earliest: Math.min(...filteredEvents.map(e => e.timestamp)),
        latest: Math.max(...filteredEvents.map(e => e.timestamp))
      }
    };

    return NextResponse.json({
      events: results,
      summary,
      timestamp: Date.now()
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}