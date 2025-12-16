/**
 * Browser Pool for Puppeteer
 * Manages a pool of browser instances to improve performance
 */

const puppeteer = require('puppeteer');
const { createServiceLogger } = require('./logger');
const config = require('./config');

const logger = createServiceLogger('browser-pool');

class BrowserPool {
  constructor(poolSize = config.puppeteer.poolSize) {
    this.poolSize = poolSize;
    this.browsers = [];
    this.available = [];
    this.inUse = new Set();
    this.initialized = false;
  }

  /**
   * Initialize the browser pool
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    logger.info(`Initializing browser pool with ${this.poolSize} browsers`);

    for (let i = 0; i < this.poolSize; i++) {
      try {
        const browser = await puppeteer.launch({
          headless: config.puppeteer.headless === false ? false : 'new',
          args: config.puppeteer.args
        });

        this.browsers.push(browser);
        this.available.push(browser);

        logger.debug(`Browser ${i + 1}/${this.poolSize} created`);
      } catch (error) {
        logger.error(`Failed to create browser ${i + 1}`, { error: error.message });
      }
    }

    this.initialized = true;
    logger.info(`Browser pool initialized with ${this.browsers.length} browsers`);
  }

  /**
   * Acquire a browser from the pool
   */
  async acquire() {
    if (!this.initialized) {
      await this.initialize();
    }

    // Wait for available browser
    while (this.available.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const browser = this.available.pop();
    this.inUse.add(browser);

    logger.debug(`Browser acquired. Available: ${this.available.length}, In use: ${this.inUse.size}`);

    return browser;
  }

  /**
   * Release a browser back to the pool
   */
  async release(browser) {
    if (!this.inUse.has(browser)) {
      logger.warn('Attempted to release a browser that was not in use');
      return;
    }

    // Check if browser is still connected
    if (!browser.isConnected()) {
      logger.warn('Browser disconnected, creating new instance');
      this.browsers = this.browsers.filter(b => b !== browser);
      
      try {
        const newBrowser = await puppeteer.launch({
          headless: config.puppeteer.headless === false ? false : 'new',
          args: config.puppeteer.args
        });
        this.browsers.push(newBrowser);
        this.available.push(newBrowser);
      } catch (error) {
        logger.error('Failed to create replacement browser', { error: error.message });
      }
    } else {
      // Close all pages except one to clean up memory
      const pages = await browser.pages();
      for (let i = 1; i < pages.length; i++) {
        await pages[i].close();
      }

      this.available.push(browser);
    }

    this.inUse.delete(browser);

    logger.debug(`Browser released. Available: ${this.available.length}, In use: ${this.inUse.size}`);
  }

  /**
   * Execute a function with a browser from the pool
   */
  async execute(fn) {
    const browser = await this.acquire();
    try {
      return await fn(browser);
    } finally {
      await this.release(browser);
    }
  }

  /**
   * Close all browsers in the pool
   */
  async shutdown() {
    logger.info('Shutting down browser pool');

    for (const browser of this.browsers) {
      try {
        await browser.close();
      } catch (error) {
        logger.error('Error closing browser', { error: error.message });
      }
    }

    this.browsers = [];
    this.available = [];
    this.inUse.clear();
    this.initialized = false;

    logger.info('Browser pool shut down');
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      poolSize: this.poolSize,
      totalBrowsers: this.browsers.length,
      available: this.available.length,
      inUse: this.inUse.size,
      initialized: this.initialized
    };
  }
}

// Create singleton instance
const browserPool = new BrowserPool();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await browserPool.shutdown();
});

process.on('SIGINT', async () => {
  await browserPool.shutdown();
});

module.exports = browserPool;

