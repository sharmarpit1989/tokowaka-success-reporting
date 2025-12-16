/**
 * Validation Utilities
 * Provides input validation and sanitization functions
 */

const { ValidationError } = require('./errors');

/**
 * Validate URL format
 */
function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate URL list
 */
function validateUrls(urls) {
  if (!Array.isArray(urls)) {
    throw new ValidationError('URLs must be an array');
  }

  if (urls.length === 0) {
    throw new ValidationError('URL array cannot be empty');
  }

  const invalidUrls = urls.filter(url => !validateUrl(url));
  if (invalidUrls.length > 0) {
    throw new ValidationError('Invalid URLs provided', {
      invalidUrls: invalidUrls.slice(0, 10) // Show first 10
    });
  }

  return true;
}

/**
 * Validate domain format
 */
function validateDomain(domain) {
  if (!domain || typeof domain !== 'string') {
    throw new ValidationError('Domain must be a non-empty string');
  }

  const domainPattern = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
  if (!domainPattern.test(domain)) {
    throw new ValidationError('Invalid domain format');
  }

  return true;
}

/**
 * Validate file extension
 */
function validateFileExtension(filename, allowedExtensions) {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  
  if (!allowedExtensions.includes(ext)) {
    throw new ValidationError(
      `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`,
      { filename, extension: ext }
    );
  }

  return true;
}

/**
 * Validate UUID format
 */
function validateUuid(uuid) {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!uuidPattern.test(uuid)) {
    throw new ValidationError('Invalid UUID format', { uuid });
  }

  return true;
}

/**
 * Validate pagination parameters
 */
function validatePagination(page, limit, maxLimit = 1000) {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (isNaN(pageNum) || pageNum < 1) {
    throw new ValidationError('Page must be a positive integer');
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > maxLimit) {
    throw new ValidationError(`Limit must be between 1 and ${maxLimit}`);
  }

  return { page: pageNum, limit: limitNum };
}

/**
 * Sanitize string input
 */
function sanitizeString(input, maxLength = 1000) {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potential HTML tags
}

/**
 * Validate and sanitize analysis options
 */
function validateAnalysisOptions(options) {
  const sanitized = {};

  if (options.aikey) {
    sanitized.aikey = sanitizeString(options.aikey, 200);
  }

  if (options.timeout) {
    const timeout = parseInt(options.timeout, 10);
    if (isNaN(timeout) || timeout < 1000 || timeout > 120000) {
      throw new ValidationError('Timeout must be between 1000 and 120000 ms');
    }
    sanitized.timeout = timeout;
  }

  if (options.concurrency) {
    const concurrency = parseInt(options.concurrency, 10);
    if (isNaN(concurrency) || concurrency < 1 || concurrency > 10) {
      throw new ValidationError('Concurrency must be between 1 and 10');
    }
    sanitized.concurrency = concurrency;
  }

  return sanitized;
}

/**
 * Validate request body against schema
 */
function validateBody(schema) {
  return (req, res, next) => {
    const errors = [];

    Object.entries(schema).forEach(([field, rules]) => {
      const value = req.body[field];

      // Required check
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        return;
      }

      // Skip validation if not required and value is empty
      if (!rules.required && (value === undefined || value === null || value === '')) {
        return;
      }

      // Type check
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${field} must be of type ${rules.type}`);
      }

      // Array check
      if (rules.isArray && !Array.isArray(value)) {
        errors.push(`${field} must be an array`);
      }

      // Min/Max length
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must have at least ${rules.minLength} items`);
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must have at most ${rules.maxLength} items`);
      }

      // Custom validator
      if (rules.validator && typeof rules.validator === 'function') {
        try {
          rules.validator(value);
        } catch (error) {
          errors.push(error.message);
        }
      }
    });

    if (errors.length > 0) {
      return next(new ValidationError('Validation failed', { errors }));
    }

    next();
  };
}

module.exports = {
  validateUrl,
  validateUrls,
  validateDomain,
  validateFileExtension,
  validateUuid,
  validatePagination,
  sanitizeString,
  validateAnalysisOptions,
  validateBody
};

