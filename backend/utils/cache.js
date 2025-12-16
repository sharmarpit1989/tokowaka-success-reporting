/**
 * Cache Utility
 * Provides in-memory caching for expensive operations
 */

const NodeCache = require('node-cache');
const { createServiceLogger } = require('./logger');
const config = require('./config');

const logger = createServiceLogger('cache');

// Create cache instances for different purposes
const caches = {
  // Short-term cache for API responses
  api: new NodeCache({
    stdTTL: config.cache.ttl,
    checkperiod: config.cache.checkPeriod,
    useClones: false
  }),

  // Long-term cache for analysis results
  analysis: new NodeCache({
    stdTTL: 3600, // 1 hour
    checkperiod: 120,
    useClones: false
  }),

  // Cache for Spacecat API responses
  spacecat: new NodeCache({
    stdTTL: 1800, // 30 minutes
    checkperiod: 60,
    useClones: false
  })
};

// Log cache events
Object.entries(caches).forEach(([name, cache]) => {
  cache.on('set', (key, value) => {
    logger.debug(`Cache ${name}: SET ${key}`);
  });

  cache.on('expired', (key, value) => {
    logger.debug(`Cache ${name}: EXPIRED ${key}`);
  });

  cache.on('del', (key, value) => {
    logger.debug(`Cache ${name}: DEL ${key}`);
  });
});

/**
 * Generate cache key from object
 */
function generateKey(prefix, params) {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  return `${prefix}:${JSON.stringify(sortedParams)}`;
}

/**
 * Cache middleware for Express routes
 */
function cacheMiddleware(cacheName = 'api', ttl = null) {
  return (req, res, next) => {
    const cache = caches[cacheName] || caches.api;
    const key = generateKey(req.path, { ...req.query, ...req.params });

    const cachedResponse = cache.get(key);
    if (cachedResponse) {
      logger.debug(`Cache HIT: ${key}`);
      return res.json(cachedResponse);
    }

    logger.debug(`Cache MISS: ${key}`);

    // Intercept res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode === 200) {
        cache.set(key, data, ttl || cache.options.stdTTL);
      }
      return originalJson(data);
    };

    next();
  };
}

/**
 * Wrap a function with caching
 */
function withCache(cacheName, fn, keyGenerator) {
  return async (...args) => {
    const cache = caches[cacheName] || caches.api;
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    const cachedResult = cache.get(key);
    if (cachedResult !== undefined) {
      logger.debug(`Function cache HIT: ${key}`);
      return cachedResult;
    }

    logger.debug(`Function cache MISS: ${key}`);
    const result = await fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Clear cache by pattern
 */
function clearByPattern(cacheName, pattern) {
  const cache = caches[cacheName] || caches.api;
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => key.includes(pattern));
  
  matchingKeys.forEach(key => cache.del(key));
  
  logger.info(`Cleared ${matchingKeys.length} keys matching pattern: ${pattern}`);
  return matchingKeys.length;
}

/**
 * Get cache statistics
 */
function getStats() {
  const stats = {};
  
  Object.entries(caches).forEach(([name, cache]) => {
    stats[name] = cache.getStats();
  });

  return stats;
}

/**
 * Clear all caches
 */
function clearAll() {
  Object.entries(caches).forEach(([name, cache]) => {
    cache.flushAll();
    logger.info(`Cleared cache: ${name}`);
  });
}

module.exports = {
  caches,
  generateKey,
  cacheMiddleware,
  withCache,
  clearByPattern,
  getStats,
  clearAll
};

