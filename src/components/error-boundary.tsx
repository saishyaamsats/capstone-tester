"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Home, Bug, Copy } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
  }

  copyErrorDetails = () => {
    const errorDetails = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString()
    };
    
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
  };
  render() {
    if (this.state.hasError) {
      const reset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
      };

      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} reset={reset} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <Card className="quantum-card">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-red-500/20 rounded-full w-fit">
                  <Bug className="h-8 w-8 text-red-400" />
                </div>
                <CardTitle className="text-2xl font-headline text-red-400">
                  Application Error
                </CardTitle>
                <CardDescription>
                  An unexpected error occurred
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-red-500/20 bg-red-500/5">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {this.state.error?.message || "An unexpected error occurred"}
                  </AlertDescription>
                </Alert>
                
                {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Error Details</span>
                      <Button variant="ghost" size="sm" onClick={this.copyErrorDetails}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button onClick={reset} className="flex-1 quantum-button">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/dashboard'}
                    className="flex-1"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;