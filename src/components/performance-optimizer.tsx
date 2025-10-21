"use client";

import { useEffect } from "react";

export default function PerformanceOptimizer() {
  useEffect(() => {
    // Preload critical resources
    const preloadResources = () => {
      // Preload fonts
      const fontLink = document.createElement('link');
      fontLink.rel = 'preload';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap';
      fontLink.as = 'style';
      document.head.appendChild(fontLink);

      // Preload critical API endpoints
      fetch('/api/health', { method: 'HEAD' }).catch(() => {});
    };

    // Optimize images
    const optimizeImages = () => {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.loading) {
          img.loading = 'lazy';
        }
        if (!img.decoding) {
          img.decoding = 'async';
        }
      });
    };

    // Clean up unused resources
    const cleanupResources = () => {
      // Remove unused event listeners
      const unusedElements = document.querySelectorAll('[data-cleanup="true"]');
      unusedElements.forEach(el => el.remove());
    };

    preloadResources();
    optimizeImages();
    cleanupResources();

    // Performance monitoring
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}