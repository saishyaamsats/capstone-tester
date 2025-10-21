"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Home, Bug, Copy, ExternalLink, Shield, Zap, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { advancedErrorHandler, ErrorCategory, ErrorSeverity } from "@/lib/advanced-error-handler";

interface EnhancedErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
  retryCount?: number;
  isRecovering?: boolean;
}

interface EnhancedErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

class EnhancedErrorBoundary extends React.Component<EnhancedErrorBoundaryProps, EnhancedErrorBoundaryState> {
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, retryCount: 0, isRecovering: false };
  }

  static getDerivedStateFromError(error: Error): EnhancedErrorBoundaryState {
    return { 
      hasError: true, 
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      retryCount: 0,
      isRecovering: false
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    // Enhanced error logging with advanced error handler
    const enhancedError = advancedErrorHandler.enhanceError(error, ErrorCategory.SYSTEM, {
      component: 'ErrorBoundary',
      errorInfo: errorInfo.componentStack,
      errorId: this.state.errorId
    });
    
    // Log error to analytics
    if (typeof window !== 'undefined') {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'error',
          metadata: {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            errorId: this.state.errorId,
            severity: enhancedError.severity,
            category: enhancedError.category
          }
        })
      }).catch(() => {
        // Analytics logging failed, continue
      });
    }
  }

  handleRecovery = async () => {
    this.setState({ isRecovering: true });
    
    try {
      // Attempt automatic recovery
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate recovery time
      
      // Clear error state
      this.setState({ 
        hasError: false, 
        error: undefined, 
        errorInfo: undefined, 
        errorId: undefined,
        isRecovering: false,
        retryCount: (this.state.retryCount || 0) + 1
      });
      
      // Force re-render
      window.location.reload();
      
    } catch (recoveryError) {
      this.setState({ isRecovering: false });
    }
  };
  copyErrorDetails = () => {
    const errorDetails = {
      id: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount,
      severity: 'high'
    };
    
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
  };

  reportError = () => {
    const errorDetails = {
      id: this.state.errorId,
      message: this.state.error?.message,
      timestamp: new Date().toISOString()
    };
    
    // In a real app, this would send to an error reporting service
  };

  render() {
    if (this.state.hasError) {
      const reset = () => {
        this.setState({ 
          hasError: false, 
          error: undefined, 
          errorInfo: undefined, 
          errorId: undefined,
          retryCount: (this.state.retryCount || 0) + 1,
          isRecovering: false
        });
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
            className="w-full max-w-2xl"
          >
            <Card className="quantum-card">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-2xl w-fit">
                  <Bug className="h-12 w-12 text-red-400 quantum-pulse" />
                </div>
                <CardTitle className="text-3xl font-headline text-red-400 mb-2">
                  System Error Detected
                </CardTitle>
                <CardDescription className="text-base">
                  The quantum computing platform encountered an unexpected error
                </CardDescription>
                
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Badge variant="outline" className="text-red-400 border-red-400/50">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Critical Error
                  </Badge>
                  {this.state.retryCount && this.state.retryCount > 0 && (
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Retry #{this.state.retryCount}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Recovery Progress */}
                {this.state.isRecovering && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
                      <span className="text-sm font-medium">Attempting automatic recovery...</span>
                    </div>
                    <Progress value={66} className="h-2" />
                  </motion.div>
                )}
                
                <Alert className="border-red-500/20 bg-red-500/5">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <div className="font-semibold text-red-400 mb-2">System Error</div>
                    <div className="text-red-200/90 mb-3">
                      {this.state.error?.message || "An unexpected error occurred in the application"}
                    </div>
                    {this.state.errorId && (
                      <div className="text-xs text-red-300/60">
                        Error ID: {this.state.errorId}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
                
                {/* Suggested Recovery Actions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-400" />
                    Recovery Options
                  </h4>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-primary/10">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">1</span>
                      </div>
                      <span className="text-sm">Try refreshing the page or restarting the operation</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-primary/10">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">2</span>
                      </div>
                      <span className="text-sm">Check your wallet connection and network settings</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-primary/10">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">3</span>
                      </div>
                      <span className="text-sm">Contact support if the problem persists</span>
                    </div>
                  </div>
                </div>
                
                {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Development Details</span>
                      <Button variant="ghost" size="sm" onClick={this.copyErrorDetails}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Details
                      </Button>
                    </div>
                    <pre className="text-xs bg-muted/50 p-4 rounded-lg overflow-auto max-h-40 font-mono border border-primary/10">
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button 
                    onClick={this.handleRecovery} 
                    disabled={this.state.isRecovering}
                    className="quantum-button"
                  >
                    {this.state.isRecovering ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Recovering...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Auto Recovery
                      </>
                    )}
                  </Button>
                  
                  <Button onClick={reset} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Manual Retry
                  </Button>
                  
                  <Button 
                    variant="outline" 
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </div>

                {process.env.NODE_ENV === 'production' && (
                  <div className="pt-6 border-t border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Need help? Our support team is here to assist you.
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={this.reportError}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Report Error
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;