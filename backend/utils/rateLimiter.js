/**
 * Rate Limiter Utility
 * Manages API rate limits for Azure OpenAI and website scraping
 */

const { createServiceLogger } = require('./logger');
const logger = createServiceLogger('RateLimiter');

class RateLimiter {
  constructor(options = {}) {
    this.maxRequestsPerMinute = options.maxRequestsPerMinute || 10;
    this.minDelayBetweenRequests = options.minDelayBetweenRequests || 2000; // 2 seconds
    this.requestHistory = []; // Array of timestamps
    this.isThrottling = false;
    this.throttleUntil = null;
  }

  /**
   * Check if we can make a request now
   */
  canMakeRequest() {
    if (this.isThrottling && Date.now() < this.throttleUntil) {
      return false;
    }

    // Clear throttle if time has passed
    if (this.isThrottling && Date.now() >= this.throttleUntil) {
      this.isThrottling = false;
      this.throttleUntil = null;
      logger.info('Throttling period ended');
    }

    // Clean old requests (older than 1 minute)
    const oneMinuteAgo = Date.now() - 60000;
    this.requestHistory = this.requestHistory.filter(t => t > oneMinuteAgo);

    // Check if under limit
    return this.requestHistory.length < this.maxRequestsPerMinute;
  }

  /**
   * Wait until we can make a request
   */
  async waitForSlot() {
    while (!this.canMakeRequest()) {
      const waitTime = this.calculateWaitTime();
      logger.info(`Rate limit reached. Waiting ${waitTime}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Enforce minimum delay between requests
    const timeSinceLastRequest = this.getTimeSinceLastRequest();
    if (timeSinceLastRequest < this.minDelayBetweenRequests) {
      const additionalWait = this.minDelayBetweenRequests - timeSinceLastRequest;
      logger.info(`Enforcing minimum delay: ${additionalWait}ms`);
      await new Promise(resolve => setTimeout(resolve, additionalWait));
    }
  }

  /**
   * Record a request
   */
  recordRequest() {
    this.requestHistory.push(Date.now());
  }

  /**
   * Manually trigger throttling (e.g., when 429 error received)
   */
  throttle(durationMs = 60000) {
    this.isThrottling = true;
    this.throttleUntil = Date.now() + durationMs;
    logger.warn(`Manual throttle activated for ${durationMs}ms`);
  }

  /**
   * Calculate how long to wait
   */
  calculateWaitTime() {
    if (this.isThrottling && this.throttleUntil) {
      return Math.max(0, this.throttleUntil - Date.now());
    }

    // Wait until oldest request is older than 1 minute
    if (this.requestHistory.length >= this.maxRequestsPerMinute) {
      const oldestRequest = Math.min(...this.requestHistory);
      const waitTime = Math.max(0, 60000 - (Date.now() - oldestRequest)) + 100; // +100ms buffer
      return waitTime;
    }

    return this.minDelayBetweenRequests;
  }

  /**
   * Get time since last request
   */
  getTimeSinceLastRequest() {
    if (this.requestHistory.length === 0) {
      return Infinity;
    }
    const lastRequest = Math.max(...this.requestHistory);
    return Date.now() - lastRequest;
  }

  /**
   * Get current status
   */
  getStatus() {
    const oneMinuteAgo = Date.now() - 60000;
    const recentRequests = this.requestHistory.filter(t => t > oneMinuteAgo).length;
    
    return {
      requestsInLastMinute: recentRequests,
      maxRequestsPerMinute: this.maxRequestsPerMinute,
      utilizationPercent: (recentRequests / this.maxRequestsPerMinute * 100).toFixed(1),
      isThrottling: this.isThrottling,
      canMakeRequest: this.canMakeRequest(),
      timeSinceLastRequest: this.getTimeSinceLastRequest(),
      nextAvailableIn: this.canMakeRequest() ? 0 : this.calculateWaitTime()
    };
  }
}

// Global rate limiters for different services
const rateLimiters = {
  // Azure OpenAI - conservative limits
  azureOpenAI: new RateLimiter({
    maxRequestsPerMinute: 10, // 10 requests per minute
    minDelayBetweenRequests: 3000 // 3 seconds between requests
  }),

  // Website scraping - very conservative to avoid overloading customer sites
  websiteScraping: new RateLimiter({
    maxRequestsPerMinute: 5, // 5 requests per minute
    minDelayBetweenRequests: 5000 // 5 seconds between requests
  }),

  // General API calls
  generalAPI: new RateLimiter({
    maxRequestsPerMinute: 20, // 20 requests per minute
    minDelayBetweenRequests: 1000 // 1 second between requests
  })
};

/**
 * Get rate limiter for a specific service
 */
function getRateLimiter(service = 'generalAPI') {
  if (!rateLimiters[service]) {
    logger.warn(`Unknown service '${service}', using generalAPI limiter`);
    return rateLimiters.generalAPI;
  }
  return rateLimiters[service];
}

/**
 * Wait for rate limit slot and record request
 */
async function acquireSlot(service = 'generalAPI') {
  const limiter = getRateLimiter(service);
  await limiter.waitForSlot();
  limiter.recordRequest();
  return limiter;
}

/**
 * Handle rate limit error (e.g., 429 from API)
 */
function handleRateLimitError(service = 'generalAPI', error) {
  const limiter = getRateLimiter(service);
  
  // Check if it's a 429 error
  if (error.status === 429 || error.message?.includes('429') || error.message?.includes('rate limit')) {
    logger.warn(`Rate limit error detected for ${service}`, { error: error.message });
    
    // Extract retry-after header if available
    let throttleDuration = 60000; // Default 1 minute
    if (error.headers?.['retry-after']) {
      throttleDuration = parseInt(error.headers['retry-after']) * 1000;
    }
    
    limiter.throttle(throttleDuration);
    return true;
  }
  
  return false;
}

/**
 * Get status of all rate limiters
 */
function getAllStatus() {
  return Object.keys(rateLimiters).reduce((status, service) => {
    status[service] = rateLimiters[service].getStatus();
    return status;
  }, {});
}

module.exports = {
  RateLimiter,
  getRateLimiter,
  acquireSlot,
  handleRateLimitError,
  getAllStatus,
  rateLimiters
};

