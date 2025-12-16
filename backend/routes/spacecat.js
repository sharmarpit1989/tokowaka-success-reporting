/**
 * Spacecat API Integration Routes
 * Fetches top pages and traffic data from Spacecat API
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');

const SPACECAT_BASE_URL = process.env.SPACECAT_API_BASE_URL || 'https://spacecat.experiencecloud.live/api/v1';
const SPACECAT_API_KEY = process.env.SPACECAT_API_KEY;

// Create axios instance with auth
const spacecatAPI = axios.create({
  baseURL: SPACECAT_BASE_URL,
  headers: {
    'x-api-key': SPACECAT_API_KEY,
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

/**
 * GET /api/spacecat/top-pages/:domain
 * Fetch top pages for a domain from Spacecat API
 */
router.get('/top-pages/:domain', async (req, res) => {
  try {
    if (!SPACECAT_API_KEY) {
      return res.status(503).json({ 
        error: 'Spacecat API key not configured',
        message: 'Set SPACECAT_API_KEY in environment variables'
      });
    }

    const { domain } = req.params;
    const { source, geo, limit } = req.query;

    // Build query params
    const params = {};
    if (source) params.source = source;
    if (geo) params.geo = geo;

    const response = await spacecatAPI.get(`/sites/${domain}/top-pages`, { params });

    let topPages = response.data;

    // Apply limit if specified
    if (limit && Array.isArray(topPages)) {
      topPages = topPages.slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      domain,
      count: Array.isArray(topPages) ? topPages.length : 0,
      topPages
    });

  } catch (error) {
    console.error('Spacecat API error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ 
        error: 'Domain not found in Spacecat',
        domain: req.params.domain
      });
    }

    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.message || error.message 
    });
  }
});

/**
 * GET /api/spacecat/traffic/:url
 * Get traffic data for a specific URL
 */
router.get('/traffic/:url(*)', async (req, res) => {
  try {
    if (!SPACECAT_API_KEY) {
      return res.status(503).json({ 
        error: 'Spacecat API key not configured' 
      });
    }

    const url = req.params.url;
    
    // Extract domain from URL
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const domain = urlObj.hostname.replace('www.', '');

    // Fetch top pages and find the matching URL
    const response = await spacecatAPI.get(`/sites/${domain}/top-pages`);
    const topPages = response.data;

    if (!Array.isArray(topPages)) {
      return res.status(404).json({ error: 'No traffic data available' });
    }

    // Find matching URL (normalize for comparison)
    const normalizedUrl = url.toLowerCase().replace(/\/$/, '');
    const pageData = topPages.find(page => {
      const pageUrl = page.url?.toLowerCase().replace(/\/$/, '');
      return pageUrl === normalizedUrl || pageUrl === normalizedUrl.replace(/^https?:\/\//, '');
    });

    if (!pageData) {
      return res.status(404).json({ 
        error: 'URL not found in top pages',
        url
      });
    }

    res.json({
      success: true,
      url,
      traffic: pageData.traffic || pageData.visits || 0,
      source: pageData.source,
      geo: pageData.geo,
      data: pageData
    });

  } catch (error) {
    console.error('Traffic fetch error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.message || error.message 
    });
  }
});

/**
 * POST /api/spacecat/bulk-traffic
 * Get traffic data for multiple URLs at once
 */
router.post('/bulk-traffic', async (req, res) => {
  try {
    if (!SPACECAT_API_KEY) {
      return res.status(503).json({ 
        error: 'Spacecat API key not configured' 
      });
    }

    const { urls } = req.body;

    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: 'URLs array is required' });
    }

    // Group URLs by domain
    const urlsByDomain = {};
    urls.forEach(url => {
      try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        const domain = urlObj.hostname.replace('www.', '');
        if (!urlsByDomain[domain]) {
          urlsByDomain[domain] = [];
        }
        urlsByDomain[domain].push(url);
      } catch (err) {
        console.warn(`Invalid URL: ${url}`);
      }
    });

    // Fetch top pages for each domain
    const results = [];
    const domainPromises = Object.keys(urlsByDomain).map(async domain => {
      try {
        const response = await spacecatAPI.get(`/sites/${domain}/top-pages`);
        const topPages = response.data;

        if (Array.isArray(topPages)) {
          urlsByDomain[domain].forEach(url => {
            const normalizedUrl = url.toLowerCase().replace(/\/$/, '');
            const pageData = topPages.find(page => {
              const pageUrl = page.url?.toLowerCase().replace(/\/$/, '');
              return pageUrl === normalizedUrl || pageUrl === normalizedUrl.replace(/^https?:\/\//, '');
            });

            results.push({
              url,
              traffic: pageData?.traffic || pageData?.visits || 0,
              source: pageData?.source,
              geo: pageData?.geo,
              found: !!pageData
            });
          });
        }
      } catch (err) {
        console.error(`Error fetching data for ${domain}:`, err.message);
        // Add URLs with no data
        urlsByDomain[domain].forEach(url => {
          results.push({ url, traffic: 0, found: false, error: err.message });
        });
      }
    });

    await Promise.all(domainPromises);

    res.json({
      success: true,
      count: results.length,
      results
    });

  } catch (error) {
    console.error('Bulk traffic fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/spacecat/domains
 * List all available domains (sites) in Spacecat
 */
router.get('/domains', async (req, res) => {
  try {
    if (!SPACECAT_API_KEY) {
      return res.status(503).json({ 
        error: 'Spacecat API key not configured' 
      });
    }

    const response = await spacecatAPI.get('/sites');
    
    res.json({
      success: true,
      count: response.data?.length || 0,
      domains: response.data
    });

  } catch (error) {
    console.error('Domains fetch error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.message || error.message 
    });
  }
});

module.exports = router;

