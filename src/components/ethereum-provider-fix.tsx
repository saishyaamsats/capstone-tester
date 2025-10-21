"use client";

import { useEffect } from 'react';

/**
 * Ethereum Provider Conflict Resolution Component
 * 
 * This component prevents the "Cannot set property ethereum" error
 * by implementing safe ethereum provider access patterns.
 */
export default function EthereumProviderFix() {
  useEffect(() => {
    // Prevent ethereum property conflicts
    const preventEthereumConflicts = () => {
      if (typeof window === 'undefined') return;

      try {
        // Store original ethereum reference
        const originalEthereum = window.ethereum;
        
        // Create a safe descriptor that prevents overwrites
        Object.defineProperty(window, 'ethereum', {
          get() {
            return originalEthereum;
          },
          set(value) {
            // Log attempts to override but don't actually set
            return true;
          },
          configurable: false,
          enumerable: true
        });

      } catch (error) {
      }
    };

    // Apply fix after a short delay to ensure all extensions are loaded
    const timer = setTimeout(preventEthereumConflicts, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
}