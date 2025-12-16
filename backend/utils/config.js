/**
 * Centralized Configuration Management
 * All environment variables and configuration in one place
 */

require('dotenv').config();
const path = require('path');

const config = {
  // Server Configuration
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test'
  },

  // CORS Configuration
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
  },

  // Spacecat API Configuration
  spacecat: {
    baseUrl: process.env.SPACECAT_API_BASE_URL || 'https://spacecat.experiencecloud.live/api/v1',
    apiKey: process.env.SPACECAT_API_KEY || null,
    isEnabled: !!process.env.SPACECAT_API_KEY
  },

  // Azure OpenAI Configuration
  azure: {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'https://aem-sites-1-genai-us-east-2.openai.azure.com',
    apiKey: process.env.AZURE_OPENAI_KEY || null,
    apiVersion: process.env.AZURE_API_VERSION || '2024-02-01',
    deployment: process.env.AZURE_COMPLETION_DEPLOYMENT || 'gpt-4o',
    isEnabled: !!process.env.AZURE_OPENAI_KEY
  },

  // Data Storage Configuration
  storage: {
    dataDir: path.join(__dirname, '..', '..', process.env.DATA_DIR || 'data'),
    uploadsDir: path.join(__dirname, '..', '..', process.env.DATA_DIR || 'data', 'uploads'),
    resultsDir: path.join(__dirname, '..', '..', process.env.DATA_DIR || 'data', 'results')
  },

  // External Tools Paths
  externalTools: {
    llmTrackerPath: process.env.LLM_TRACKER_PATH || 
      path.join(__dirname, '..', '..', 'external-tools', 'llm-presence-tracker'),
    reportingAutomationPath: process.env.REPORTING_AUTOMATION_PATH ||
      path.join(__dirname, '..', '..', 'external-tools', 'reporting-automation')
  },

  // Puppeteer Configuration
  puppeteer: {
    concurrency: parseInt(process.env.PUPPETEER_CONCURRENCY, 10) || 3,
    timeout: parseInt(process.env.ANALYSIS_TIMEOUT, 10) || 30000,
    poolSize: parseInt(process.env.PUPPETEER_POOL_SIZE, 10) || 2,
    headless: process.env.PUPPETEER_HEADLESS !== 'false',
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage',
      // HTTP/2 fixes for protocol errors
      '--disable-http2',           // Disable HTTP/2 entirely
      '--disable-features=NetworkService',  // Use legacy network service
      '--enable-features=NetworkServiceInProcess'  // Run network service in-process
    ]
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760, // 10MB
    maxBrandPresenceFileSize: parseInt(process.env.MAX_BRAND_PRESENCE_FILE_SIZE, 10) || 52428800, // 50MB
    allowedUrlFileExtensions: ['.csv', '.xlsx', '.xls'],
    allowedBrandPresenceExtensions: ['.xlsx', '.xls']
  },

  // Cache Configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 300, // 5 minutes default
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD, 10) || 60,
    maxKeys: parseInt(process.env.CACHE_MAX_KEYS, 10) || 1000
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

// Validate critical configuration
function validateConfig() {
  const errors = [];

  if (config.server.isProduction && !config.azure.apiKey) {
    errors.push('AZURE_OPENAI_KEY is recommended for production');
  }

  if (errors.length > 0) {
    console.warn('Configuration warnings:', errors.join(', '));
  }

  return errors.length === 0;
}

// Initialize configuration
validateConfig();

module.exports = config;

