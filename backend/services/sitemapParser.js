/**
 * Sitemap Parser Service
 * Parses XML sitemaps and extracts URLs
 */

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Parse sitemap URL(s) and extract all URLs
 * @param {Array<string>} sitemapUrls - Array of sitemap URLs
 * @returns {Promise<Array<string>>} Array of extracted URLs
 */
async function parseSitemaps(sitemapUrls) {
  console.log(`[Sitemap Parser] Parsing ${sitemapUrls.length} sitemap(s)`);
  
  const allUrls = new Set();
  
  for (const sitemapUrl of sitemapUrls) {
    try {
      const urls = await parseSingleSitemap(sitemapUrl);
      urls.forEach(url => allUrls.add(url));
      console.log(`[Sitemap Parser] Extracted ${urls.length} URLs from ${sitemapUrl}`);
    } catch (error) {
      console.error(`[Sitemap Parser] Error parsing ${sitemapUrl}:`, error.message);
    }
  }
  
  const urlArray = Array.from(allUrls);
  console.log(`[Sitemap Parser] Total unique URLs extracted: ${urlArray.length}`);
  
  return urlArray;
}

/**
 * Parse a single sitemap
 * Handles both regular sitemaps and sitemap indexes
 */
async function parseSingleSitemap(sitemapUrl) {
  try {
    const response = await axios.get(sitemapUrl, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AIVisibilityBot/1.0)'
      }
    });
    
    const xml = response.data;
    const $ = cheerio.load(xml, { xmlMode: true });
    
    const urls = [];
    
    // Check if it's a sitemap index (contains other sitemaps)
    const sitemapElements = $('sitemap > loc');
    if (sitemapElements.length > 0) {
      console.log(`[Sitemap Parser] Found sitemap index with ${sitemapElements.length} sitemaps`);
      
      // Recursively parse each sitemap in the index
      const nestedSitemaps = [];
      sitemapElements.each((i, elem) => {
        nestedSitemaps.push($(elem).text().trim());
      });
      
      for (const nestedSitemap of nestedSitemaps) {
        const nestedUrls = await parseSingleSitemap(nestedSitemap);
        urls.push(...nestedUrls);
      }
    } else {
      // Regular sitemap with URLs
      const urlElements = $('url > loc');
      urlElements.each((i, elem) => {
        const url = $(elem).text().trim();
        if (url) {
          urls.push(url);
        }
      });
    }
    
    return urls;
    
  } catch (error) {
    console.error(`[Sitemap Parser] Failed to parse ${sitemapUrl}:`, error.message);
    throw error;
  }
}

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

module.exports = {
  parseSitemaps,
  extractDomain
};

