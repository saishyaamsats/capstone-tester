"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  RefreshCw, 
  Copy, 
  ExternalLink, 
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Shield,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { advancedErrorHandler, EnhancedError, ErrorSeverity, ErrorCategory } from "@/lib/advanced-error-handler";

interface AdvancedErrorDisplayProps {
  error: EnhancedError;
  onRetry?: () => Promise<void>;
  onDismiss?: () => void;
  showDetails?: boolean;
}

export default function AdvancedErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss,
  showDetails = false 
}: AdvancedErrorDisplayProps) {
  const { toast } = useToast();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryProgress, setRetryProgress] = useState(0);
  const [showFullDetails, setShowFullDetails] = useState(showDetails);
  const [retryCount, setRetryCount] = useState(0);

  const getSeverityConfig = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return {
          color: "border-red-500/30 bg-red-500/5",
          textColor: "text-red-400",
          icon: XCircle,
          badge: "border-red-400/50 text-red-400"
        };
      case ErrorSeverity.HIGH:
        return {
          color: "border-orange-500/30 bg-orange-500/5",
          textColor: "text-orange-400",
          icon: AlertTriangle,
          badge: "border-orange-400/50 text-orange-400"
        };
      case ErrorSeverity.MEDIUM:
        return {
          color: "border-yellow-500/30 bg-yellow-500/5",
          textColor: "text-yellow-400",
          icon: AlertTriangle,
          badge: "border-yellow-400/50 text-yellow-400"
        };
      default:
        return {
          color: "border-blue-500/30 bg-blue-500/5",
          textColor: "text-blue-400",
          icon: Info,
          badge: "border-blue-400/50 text-blue-400"
        };
    }
  };

  const getCategoryIcon = (category: ErrorCategory) => {
    switch (category) {
      case ErrorCategory.WALLET: return Shield;
      case ErrorCategory.BLOCKCHAIN: return Zap;
      case ErrorCategory.NETWORK: return RefreshCw;
      case ErrorCategory.QUANTUM: return Clock;
      default: return AlertTriangle;
    }
  };

  const handleRetry = async () => {
    if (!onRetry || !error.retryable) return;
    
    setIsRetrying(true);
    setRetryProgress(0);
    
    try {
      // Simulate retry progress
      const progressInterval = setInterval(() => {
        setRetryProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
      
      await onRetry();
      setRetryProgress(100);
      setRetryCount(prev => prev + 1);
      
      toast({
        title: "Operation Successful! ✅",
        description: "The operation completed successfully after retry.",
      });
      
      setTimeout(() => {
        onDismiss?.();
      }, 1000);
      
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      setRetryCount(prev => prev + 1);
      
      toast({
        variant: "destructive",
        title: "Retry Failed",
        description: "The operation failed again. Please try the suggested actions below.",
      });
    } finally {
      setIsRetrying(false);
      setRetryProgress(0);
    }
  };

  const copyErrorDetails = () => {
    const errorDetails = {
      id: error.id,
      message: error.message,
      category: error.category,
      severity: error.severity,
      timestamp: new Date(error.timestamp).toISOString(),
      context: error.context,
      retryCount
    };
    
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
    toast({
      title: "Error Details Copied",
      description: "Error information has been copied to clipboard.",
    });
  };

  const config = getSeverityConfig(error.severity);
  const CategoryIcon = getCategoryIcon(error.category);
  const SeverityIcon = config.icon;

  const getSeverityIconBgClass = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return "p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/10";
      case ErrorSeverity.HIGH:
        return "p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/10";
      case ErrorSeverity.MEDIUM:
        return "p-2 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/10";
      default:
        return "p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${config.color} border-2 shadow-xl`}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={getSeverityIconBgClass(error.severity)}>
                <SeverityIcon className={`h-6 w-6 ${config.textColor}`} />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span className={config.textColor}>Error Detected</span>
                  <Badge variant="outline" className={config.badge}>
                    {error.severity.toUpperCase()}
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground capitalize">
                    {error.category} Error
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(error.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
            
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* User-friendly error message */}
          <Alert className={config.color}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm font-medium">
              {error.userMessage}
            </AlertDescription>
          </Alert>

          {/* Retry Progress */}
          {isRetrying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span>Retrying operation...</span>
                <span>{retryProgress}%</span>
              </div>
              <Progress value={retryProgress} className="h-2" />
            </motion.div>
          )}

          {/* Suggested Actions */}
          {error.suggestedActions && error.suggestedActions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Suggested Actions
              </h4>
              <div className="space-y-2">
                {error.suggestedActions.map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-primary/10"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    <span className="text-sm">{action}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {error.retryable && onRetry && (
              <Button 
                onClick={handleRetry} 
                disabled={isRetrying}
                className="quantum-button"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again {retryCount > 0 && `(${retryCount})`}
                  </>
                )}
              </Button>
            )}
            
            <Button variant="outline" onClick={copyErrorDetails}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Details
            </Button>
            
            {error.category === ErrorCategory.BLOCKCHAIN && error.context?.walletAddress && (
              <Button variant="outline" asChild>
                <a 
                  href={`https://www.megaexplorer.xyz/address/${error.context.walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on Explorer
                </a>
              </Button>
            )}
          </div>

          {/* Detailed Error Information */}
          <div className="border-t border-primary/20 pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullDetails(!showFullDetails)}
              className="w-full justify-between"
            >
              <span className="text-sm">Technical Details</span>
              {showFullDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            
            <AnimatePresence>
              {showFullDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Error ID:</span>
                      <div className="font-mono font-medium">{error.id}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <div className="font-medium capitalize">{error.category}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Retryable:</span>
                      <div className={`font-medium ${error.retryable ? 'text-green-400' : 'text-red-400'}`}>
                        {error.retryable ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Actionable:</span>
                      <div className={`font-medium ${error.actionable ? 'text-green-400' : 'text-red-400'}`}>
                        {error.actionable ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                  
                  {error.context && (
                    <div>
                      <span className="text-muted-foreground text-xs">Context:</span>
                      <pre className="text-xs bg-muted/20 p-2 rounded mt-1 overflow-auto max-h-20">
                        {JSON.stringify(error.context, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-muted-foreground text-xs">Original Message:</span>
                    <div className="text-xs bg-muted/20 p-2 rounded mt-1 font-mono">
                      {error.message}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}