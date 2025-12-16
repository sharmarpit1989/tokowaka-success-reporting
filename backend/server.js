#!/usr/bin/env node
/**
 * AI Visibility Dashboard - Backend Server
 * Integrates content analysis and citation tracking into a unified API
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs-extra');

// Import utilities
const config = require('./utils/config');
const { logger, createServiceLogger } = require('./utils/logger');
const { errorHandler } = require('./utils/errors');
const browserPool = require('./utils/browserPool');

const serverLogger = createServiceLogger('server');

// Initialize Express app
const app = express();
const PORT = config.server.port;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: config.server.isProduction ? undefined : false,
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6
}));

// CORS middleware
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: config.cors.credentials
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    serverLogger.info(`${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
  });
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    serverLogger.warn('Rate limit exceeded', { ip: req.ip, path: req.path });
    res.status(429).json({
      error: 'Too many requests, please try again later'
    });
  }
});

app.use('/api/', limiter);

// Static file serving for uploads and data
app.use('/data', express.static(config.storage.dataDir));

// Ensure data directories exist
fs.ensureDirSync(config.storage.dataDir);
fs.ensureDirSync(config.storage.uploadsDir);
fs.ensureDirSync(config.storage.resultsDir);

serverLogger.info('Data directories initialized');

// API Routes
const citationRoutes = require('./routes/citations');
const spacecatRoutes = require('./routes/spacecat');
const unifiedRoutes = require('./routes/unified');

app.use('/api/citations', citationRoutes);
app.use('/api/spacecat', spacecatRoutes);
app.use('/api/unified', unifiedRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const { getStats: getCacheStats } = require('./utils/cache');
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.server.nodeEnv,
    browserPool: browserPool.getStats(),
    cache: getCacheStats(),
    integrations: {
      spacecat: config.spacecat.isEnabled,
      azureOpenAI: config.azure.isEnabled
    }
  });
});

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// 404 handler (must be before error handler)
app.use((req, res) => {
  serverLogger.warn('Route not found', { path: req.path, method: req.method });
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, async () => {
  serverLogger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        AI Visibility Dashboard - Backend Server          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

🚀 Server running on: http://localhost:${PORT}
📊 API endpoints available at: http://localhost:${PORT}/api
🏥 Health check: http://localhost:${PORT}/api/health
🌍 Environment: ${config.server.nodeEnv}
📁 Data directory: ${config.storage.dataDir}

${config.server.isProduction
  ? '📦 Serving production frontend build' 
  : '🔧 Development mode - Frontend should run separately on port 5173'}

Integrations:
${config.spacecat.isEnabled ? '✅' : '⚠️ '} Spacecat API
${config.azure.isEnabled ? '✅' : '⚠️ '} Azure OpenAI (optional)

Optimizations:
✅ Browser pooling (${config.puppeteer.poolSize} instances)
✅ Response caching
✅ Compression enabled
✅ Rate limiting active
✅ Security headers (Helmet)

Ready to analyze! 🎯
`);

  // Initialize browser pool in background
  browserPool.initialize().catch(err => {
    serverLogger.error('Failed to initialize browser pool', { error: err.message });
  });
});

// Graceful shutdown
async function gracefulShutdown(signal) {
  serverLogger.info(`${signal} signal received: closing server gracefully`);
  
  // Stop accepting new connections
  server.close(async () => {
    serverLogger.info('HTTP server closed');
    
    // Shutdown browser pool
    await browserPool.shutdown();
    
    // Clear caches
    const { clearAll } = require('./utils/cache');
    clearAll();
    
    serverLogger.info('Graceful shutdown complete');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    serverLogger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

