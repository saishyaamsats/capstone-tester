// Performance monitoring utilities

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private activeTimers: Map<string, number> = new Map();

  startTimer(name: string, metadata?: Record<string, any>): void {
    this.activeTimers.set(name, performance.now());
    if (metadata) {
      this.activeTimers.set(`${name}_metadata`, metadata as any);
    }
  }

  endTimer(name: string): PerformanceMetric | null {
    const startTime = this.activeTimers.get(name);
    if (!startTime) {
      return null;
    }

    const duration = performance.now() - startTime;
    const metadata = this.activeTimers.get(`${name}_metadata`) as Record<string, any>;
    
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);
    this.activeTimers.delete(name);
    this.activeTimers.delete(`${name}_metadata`);

    // Keep only last 100 metrics to prevent memory issues
    if (this.metrics.length > 100) {
      this.metrics.splice(0, this.metrics.length - 100);
    }

    return metric;
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  getAverageTime(name: string): number {
    const nameMetrics = this.getMetrics(name);
    if (nameMetrics.length === 0) return 0;
    
    const total = nameMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / nameMetrics.length;
  }

  getSlowQueries(threshold: number = 1000): PerformanceMetric[] {
    return this.metrics.filter(m => m.duration > threshold);
  }

  clearMetrics(): void {
    this.metrics.length = 0;
    this.activeTimers.clear();
  }

  getSummary() {
    const summary = {
      totalMetrics: this.metrics.length,
      averageDuration: this.metrics.length > 0 
        ? this.metrics.reduce((sum, m) => sum + m.duration, 0) / this.metrics.length 
        : 0,
      slowQueries: this.getSlowQueries().length,
      uniqueOperations: [...new Set(this.metrics.map(m => m.name))].length
    };

    return summary;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Utility function for timing async operations
export async function timeAsync<T>(
  name: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  performanceMonitor.startTimer(name, metadata);
  
  try {
    const result = await operation();
    const metric = performanceMonitor.endTimer(name);
    
    if (metric && metric.duration > 1000) {
    }
    
    return result;
  } catch (error) {
    performanceMonitor.endTimer(name);
    throw error;
  }
}

// Utility function for timing synchronous operations
export function timeSync<T>(
  name: string,
  operation: () => T,
  metadata?: Record<string, any>
): T {
  performanceMonitor.startTimer(name, metadata);
  
  try {
    const result = operation();
    performanceMonitor.endTimer(name);
    return result;
  } catch (error) {
    performanceMonitor.endTimer(name);
    throw error;
  }
}