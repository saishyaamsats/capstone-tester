// Advanced Error Handling System
import { performanceMonitor } from './performance-monitor';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  NETWORK = 'network',
  WALLET = 'wallet',
  BLOCKCHAIN = 'blockchain',
  QUANTUM = 'quantum',
  AUTH = 'auth',
  VALIDATION = 'validation',
  SYSTEM = 'system'
}

export interface ErrorContext {
  userId?: string;
  walletAddress?: string;
  networkId?: number;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface EnhancedError {
  id: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: number;
  context?: ErrorContext;
  stack?: string;
  userMessage: string;
  actionable: boolean;
  retryable: boolean;
  suggestedActions?: string[];
}

class AdvancedErrorHandler {
  private errors: Map<string, EnhancedError> = new Map();
  private errorListeners: ((error: EnhancedError) => void)[] = [];
  private retryAttempts: Map<string, number> = new Map();

  // Error classification and enhancement
  enhanceError(
    error: Error | string,
    category: ErrorCategory,
    context?: ErrorContext
  ): EnhancedError {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;
    
    const enhancedError: EnhancedError = {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: errorMessage,
      category,
      severity: this.determineSeverity(errorMessage, category),
      timestamp: Date.now(),
      context,
      stack: errorStack,
      userMessage: this.generateUserMessage(errorMessage, category),
      actionable: this.isActionable(errorMessage, category),
      retryable: this.isRetryable(errorMessage, category),
      suggestedActions: this.generateSuggestedActions(errorMessage, category)
    };

    this.errors.set(enhancedError.id, enhancedError);
    this.notifyListeners(enhancedError);
    
    // Log to performance monitor
    performanceMonitor.startTimer(`error_${category}`, {
      severity: enhancedError.severity,
      retryable: enhancedError.retryable
    });

    return enhancedError;
  }

  private determineSeverity(message: string, category: ErrorCategory): ErrorSeverity {
    const lowerMessage = message.toLowerCase();
    
    // Critical errors
    if (lowerMessage.includes('contract not found') || 
        lowerMessage.includes('network unreachable') ||
        lowerMessage.includes('authentication failed')) {
      return ErrorSeverity.CRITICAL;
    }
    
    // High severity
    if (lowerMessage.includes('transaction failed') ||
        lowerMessage.includes('insufficient funds') ||
        lowerMessage.includes('wallet connection')) {
      return ErrorSeverity.HIGH;
    }
    
    // Medium severity
    if (lowerMessage.includes('timeout') ||
        lowerMessage.includes('rate limit') ||
        lowerMessage.includes('validation')) {
      return ErrorSeverity.MEDIUM;
    }
    
    return ErrorSeverity.LOW;
  }

  private generateUserMessage(message: string, category: ErrorCategory): string {
    const lowerMessage = message.toLowerCase();
    
    // Wallet-specific messages
    if (category === ErrorCategory.WALLET) {
      if (lowerMessage.includes('user rejected')) {
        return "Transaction was cancelled. Please try again and approve the transaction in your wallet.";
      }
      if (lowerMessage.includes('insufficient funds')) {
        return "Insufficient balance for this transaction. Please add more ETH to your wallet.";
      }
      if (lowerMessage.includes('network')) {
        return "Please ensure you're connected to MegaETH Testnet and try again.";
      }
    }
    
    // Blockchain-specific messages
    if (category === ErrorCategory.BLOCKCHAIN) {
      if (lowerMessage.includes('contract')) {
        return "Smart contract interaction failed. Please check your network connection.";
      }
      if (lowerMessage.includes('gas')) {
        return "Transaction gas estimation failed. Please try with a higher gas limit.";
      }
    }
    
    // Network-specific messages
    if (category === ErrorCategory.NETWORK) {
      if (lowerMessage.includes('timeout')) {
        return "Network request timed out. Please check your internet connection and try again.";
      }
      if (lowerMessage.includes('unreachable')) {
        return "Cannot connect to the blockchain network. Please try again later.";
      }
    }
    
    // Quantum-specific messages
    if (category === ErrorCategory.QUANTUM) {
      if (lowerMessage.includes('provider')) {
        return "Quantum provider is temporarily unavailable. Please try a different provider.";
      }
      if (lowerMessage.includes('algorithm')) {
        return "Invalid quantum algorithm format. Please check your input and try again.";
      }
    }
    
    return "An unexpected error occurred. Please try again or contact support if the problem persists.";
  }

  private isActionable(message: string, category: ErrorCategory): boolean {
    const lowerMessage = message.toLowerCase();
    
    return lowerMessage.includes('insufficient funds') ||
           lowerMessage.includes('user rejected') ||
           lowerMessage.includes('network') ||
           lowerMessage.includes('validation') ||
           lowerMessage.includes('timeout');
  }

  private isRetryable(message: string, category: ErrorCategory): boolean {
    const lowerMessage = message.toLowerCase();
    
    // Non-retryable errors
    if (lowerMessage.includes('user rejected') ||
        lowerMessage.includes('insufficient funds') ||
        lowerMessage.includes('invalid format')) {
      return false;
    }
    
    // Retryable errors
    return lowerMessage.includes('timeout') ||
           lowerMessage.includes('network') ||
           lowerMessage.includes('connection') ||
           lowerMessage.includes('rate limit');
  }

  private generateSuggestedActions(message: string, category: ErrorCategory): string[] {
    const lowerMessage = message.toLowerCase();
    const actions: string[] = [];
    
    if (lowerMessage.includes('wallet')) {
      actions.push("Check that MetaMask is unlocked and connected");
      actions.push("Ensure you're on the correct network (MegaETH Testnet)");
    }
    
    if (lowerMessage.includes('insufficient funds')) {
      actions.push("Add more ETH to your wallet");
      actions.push("Visit the MegaETH faucet for testnet ETH");
    }
    
    if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
      actions.push("Check your internet connection");
      actions.push("Try refreshing the page");
      actions.push("Switch to a different RPC endpoint");
    }
    
    if (lowerMessage.includes('gas')) {
      actions.push("Increase the gas limit");
      actions.push("Wait for network congestion to decrease");
    }
    
    if (lowerMessage.includes('timeout')) {
      actions.push("Wait a moment and try again");
      actions.push("Check network status");
    }
    
    return actions;
  }

  // Retry mechanism
  async retryOperation<T>(
    operation: () => Promise<T>,
    errorId: string,
    maxAttempts: number = 3,
    delay: number = 1000
  ): Promise<T> {
    const currentAttempts = this.retryAttempts.get(errorId) || 0;
    
    if (currentAttempts >= maxAttempts) {
      throw new Error(`Max retry attempts (${maxAttempts}) exceeded for operation`);
    }
    
    try {
      const result = await operation();
      this.retryAttempts.delete(errorId);
      return result;
    } catch (error) {
      this.retryAttempts.set(errorId, currentAttempts + 1);
      
      if (currentAttempts + 1 < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, currentAttempts)));
        return this.retryOperation(operation, errorId, maxAttempts, delay);
      }
      
      throw error;
    }
  }

  // Error recovery suggestions
  getRecoveryOptions(errorId: string): {
    canRetry: boolean;
    suggestedActions: string[];
    severity: ErrorSeverity;
  } {
    const error = this.errors.get(errorId);
    if (!error) {
      return {
        canRetry: false,
        suggestedActions: [],
        severity: ErrorSeverity.LOW
      };
    }
    
    return {
      canRetry: error.retryable,
      suggestedActions: error.suggestedActions || [],
      severity: error.severity
    };
  }

  // Event listeners for error notifications
  addErrorListener(listener: (error: EnhancedError) => void): void {
    this.errorListeners.push(listener);
  }

  removeErrorListener(listener: (error: EnhancedError) => void): void {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  private notifyListeners(error: EnhancedError): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
      }
    });
  }

  // Error analytics
  getErrorAnalytics(): {
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    mostCommonErrors: Array<{ message: string; count: number }>;
  } {
    const errors = Array.from(this.errors.values());
    
    const errorsByCategory = errors.reduce((acc, error) => {
      acc[error.category] = (acc[error.category] || 0) + 1;
      return acc;
    }, {} as Record<ErrorCategory, number>);
    
    const errorsBySeverity = errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<ErrorSeverity, number>);
    
    const messageCount = errors.reduce((acc, error) => {
      acc[error.message] = (acc[error.message] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonErrors = Object.entries(messageCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([message, count]) => ({ message, count }));
    
    return {
      totalErrors: errors.length,
      errorsByCategory,
      errorsBySeverity,
      mostCommonErrors
    };
  }

  // Clear old errors (memory management)
  clearOldErrors(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    for (const [id, error] of this.errors.entries()) {
      if (now - error.timestamp > maxAge) {
        this.errors.delete(id);
      }
    }
  }
}

export const advancedErrorHandler = new AdvancedErrorHandler();

// Utility functions for common error scenarios
export const ErrorUtils = {
  handleWalletError: (error: any, context?: ErrorContext) => {
    return advancedErrorHandler.enhanceError(error, ErrorCategory.WALLET, context);
  },
  
  handleBlockchainError: (error: any, context?: ErrorContext) => {
    return advancedErrorHandler.enhanceError(error, ErrorCategory.BLOCKCHAIN, context);
  },
  
  handleNetworkError: (error: any, context?: ErrorContext) => {
    return advancedErrorHandler.enhanceError(error, ErrorCategory.NETWORK, context);
  },
  
  handleQuantumError: (error: any, context?: ErrorContext) => {
    return advancedErrorHandler.enhanceError(error, ErrorCategory.QUANTUM, context);
  },
  
  handleValidationError: (error: any, context?: ErrorContext) => {
    return advancedErrorHandler.enhanceError(error, ErrorCategory.VALIDATION, context);
  }
};