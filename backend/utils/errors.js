/**
 * Custom Error Classes
 * Provides structured error handling across the application
 */

class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, details);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource', id = null) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

class ExternalServiceError extends AppError {
  constructor(service, message, details = null) {
    super(`External service error (${service}): ${message}`, 502, details);
    this.service = service;
  }
}

class AnalysisError extends AppError {
  constructor(message, url = null, details = null) {
    super(message, 500, details);
    this.url = url;
  }
}

// Error handler middleware
function errorHandler(err, req, res, next) {
  const { logger } = require('./logger');
  
  // Log error
  logger.error(err.message, {
    stack: err.stack,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    details: err.details
  });

  // Don't leak stack traces in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Prepare error response
  const errorResponse = {
    error: err.message || 'Internal server error',
    statusCode: err.statusCode || 500
  };

  // Add additional details in development
  if (isDevelopment) {
    errorResponse.stack = err.stack;
    errorResponse.details = err.details;
  }

  // Send response
  res.status(err.statusCode || 500).json(errorResponse);
}

// Async error wrapper
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ExternalServiceError,
  AnalysisError,
  errorHandler,
  asyncHandler
};

