"use client";

import { useState } from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { WalletProvider } from "@/contexts/wallet-context";
import { Toaster } from "@/components/ui/toaster";
import RealTimeNotifications from "@/components/real-time-notifications";
import EnhancedErrorBoundary from "@/components/enhanced-error-boundary";
import PerformanceOptimizer from "@/components/performance-optimizer";
import EthereumProviderFix from "@/components/ethereum-provider-fix";
import AIChatWidget from "@/components/ai-chat-widget";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap'
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space-grotesk',
  display: 'swap'
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showAIWidget, setShowAIWidget] = useState(false);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-body`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <WalletProvider>
              <EnhancedErrorBoundary>
                <EthereumProviderFix />
                <PerformanceOptimizer />
                {children}
                <AIChatWidget 
                  isOpen={showAIWidget} 
                  onToggle={() => setShowAIWidget(!showAIWidget)} 
                />
                <Toaster />
                <RealTimeNotifications />
              </EnhancedErrorBoundary>
            </WalletProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}