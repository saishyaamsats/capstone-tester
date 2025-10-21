// Centralized error handling utilities

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: number;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = Date.now();

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NetworkError extends AppError {
  constructor(message: string) {
    super(message, 503);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
  }
}

export function handleApiError(error: unknown): {
  message: string;
  statusCode: number;
  timestamp: number;
  details?: string;
} {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
      details: error.stack
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
      timestamp: Date.now(),
      details: error.stack
    };
  }

  return {
    message: 'An unexpected error occurred',
    statusCode: 500,
    timestamp: Date.now()
  };
}

export function logError(error: unknown, context?: string) {
  // Error logging removed for production
}

export function createErrorResponse(error: unknown, defaultMessage: string = 'Internal server error') {
  const errorInfo = handleApiError(error);
  
  return {
    error: errorInfo.message || defaultMessage,
    timestamp: errorInfo.timestamp,
    ...(process.env.NODE_ENV === 'development' && errorInfo.details && { details: errorInfo.details })
  };
}