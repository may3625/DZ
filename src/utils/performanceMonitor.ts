/**
 * Service de monitoring des performances en temps réel
 */

interface PerformanceMetrics {
  initialLoadTime: number;
  chunkLoadTimes: Record<string, number>;
  memoryUsage: number;
  bundleSize: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics;
  private chunkLoadStartTimes: Record<string, number> = {};

  private constructor() {
    this.metrics = {
      initialLoadTime: 0,
      chunkLoadTimes: {},
      memoryUsage: 0,
      bundleSize: 0
    };
    this.initializeMonitoring();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeMonitoring() {
    // Monitor initial load time
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      this.metrics.initialLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      console.log(`🚀 Initial load time: ${this.metrics.initialLoadTime.toFixed(2)}ms`);
    });

    // Monitor chunk loading
    this.monitorChunkLoading();

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      }, 5000);
    }
  }

  private monitorChunkLoading() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0] as string;
      if (url.includes('.js') || url.includes('.ts')) {
        const chunkName = this.extractChunkName(url);
        this.chunkLoadStartTimes[chunkName] = performance.now();
        
        try {
          const response = await originalFetch(...args);
          const loadTime = performance.now() - this.chunkLoadStartTimes[chunkName];
          this.metrics.chunkLoadTimes[chunkName] = loadTime;
          console.log(`📦 Chunk "${chunkName}" loaded in ${loadTime.toFixed(2)}ms`);
          return response;
        } catch (error) {
          console.error(`❌ Failed to load chunk "${chunkName}":`, error);
          throw error;
        }
      }
      return originalFetch(...args);
    };
  }

  private extractChunkName(url: string): string {
    const match = url.match(/([^\/]+)\.(js|ts)$/);
    return match ? match[1] : 'unknown';
  }

  trackLazyComponentLoad(componentName: string, loadTime: number) {
    console.log(`⚡ Lazy component "${componentName}" loaded in ${loadTime.toFixed(2)}ms`);
    this.metrics.chunkLoadTimes[`lazy-${componentName}`] = loadTime;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  reportSummary() {
    const totalChunkTime = Object.values(this.metrics.chunkLoadTimes).reduce((a, b) => a + b, 0);
    
    console.log('📊 Performance Summary:');
    console.log(`  Initial Load: ${this.metrics.initialLoadTime.toFixed(2)}ms`);
    console.log(`  Chunks Loaded: ${Object.keys(this.metrics.chunkLoadTimes).length}`);
    console.log(`  Total Chunk Time: ${totalChunkTime.toFixed(2)}ms`);
    console.log(`  Memory Usage: ${this.metrics.memoryUsage.toFixed(2)}MB`);
    
    // Calculate savings vs non-lazy loading
    const estimatedOriginalLoad = this.metrics.initialLoadTime + totalChunkTime;
    const actualLoad = this.metrics.initialLoadTime;
    const savings = ((estimatedOriginalLoad - actualLoad) / estimatedOriginalLoad * 100).toFixed(1);
    
    console.log(`  🎯 Estimated Savings: ${savings}% faster initial load`);
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
export default performanceMonitor;