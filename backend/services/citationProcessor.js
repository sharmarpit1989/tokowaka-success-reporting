/**
 * Citation Processor Service
 * Processes brand presence data and calculates citation rates
 * This wraps the existing reporting automation functionality
 */

const path = require('path');
const fs = require('fs-extra');
const { spawn } = require('child_process');
const xlsx = require('xlsx');

// Uses environment variable if set, otherwise defaults to bundled version
const REPORTING_PATH = process.env.REPORTING_PATH || 
  path.join(__dirname, '..', '..', 'external-tools', 'reporting-automation');
const config = require('../utils/config');
const RESULTS_DIR = config.storage.resultsDir;

console.log('[Citation Processor] Using Reporting Tool at:', REPORTING_PATH);

/**
 * Parse brand presence Excel file
 */
function parseBrandPresenceFile(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  if (!data || data.length === 0) {
    console.warn(`No data found in file: ${filePath}`);
    return [];
  }

  // Return data with normalized column names
  return data.map(row => {
    const normalized = {};
    Object.keys(row).forEach(key => {
      const lowerKey = key.toLowerCase().trim();
      // Map important fields to consistent names
      if (lowerKey === 'prompt') {
        normalized.prompt = row[key];
      } else if (lowerKey === 'answer') {
        normalized.answer = row[key];
      } else if (lowerKey === 'sources') {
        normalized.sources = row[key];
      } else if (lowerKey === 'url') {
        normalized.URL = row[key]; // Always use uppercase URL
      } else if (lowerKey.includes('execution') || lowerKey.includes('date')) {
        normalized.executionDate = row[key];
      } else {
        // For other fields, preserve original key name (but skip if it's URL to avoid duplicates)
        if (lowerKey !== 'url') {
          normalized[key] = row[key];
        }
      }
    });
    return normalized;
  });
}

/**
 * Extract metadata from filename
 * Expected: brandpresence-{platform}-w{week}-{year}.xlsx
 * Or with timestamp prefix: {timestamp}-brandpresence-{platform}-w{week}-{year}.xlsx
 */
function extractMetadataFromFilename(filename) {
  const basename = path.basename(filename, path.extname(filename));
  
  // Remove timestamp prefix if present (e.g., "1765025113974-")
  const cleanName = basename.replace(/^\d{13}-/, '');
  
  // Extract week (e.g., w44, w48)
  const weekMatch = cleanName.match(/w(\d+)/i);
  const week = weekMatch ? `w${weekMatch[1]}` : 'unknown';
  
  // Extract platform (text between "brandpresence-" and "-w")
  const platformMatch = cleanName.match(/brandpresence-([^-]+(?:-[^-]+)*?)-w/i);
  let platform = platformMatch ? platformMatch[1] : 'unknown';
  
  // Normalize platform names to consistent capitalization
  const platformLower = platform.toLowerCase();
  
  const platformMap = {
    'all': 'ChatGPT-Paid',              // Files with "-all-" in name
    'chatgpt': 'ChatGPT-Free',          // Files with "-chatgpt-" in name
    'chatgpt-paid': 'ChatGPT-Paid',
    'chatgpt-free': 'ChatGPT-Free',
    'google-ai-overviews': 'Google AI Overviews',
    'ai-mode': 'AI Mode',
    'gemini': 'Gemini',
    'perplexity': 'Perplexity',
    'copilot': 'Copilot'
  };
  
  platform = platformMap[platformLower] || platform.charAt(0).toUpperCase() + platform.slice(1);
  
  // Extract year (4 digits after w{week}-)
  const yearMatch = cleanName.match(/w\d+-(\d{4})/);
  const year = yearMatch ? yearMatch[1] : null;

  return { week, platform, year };
}

/**
 * Process brand presence data from uploaded files
 * @param {string} jobId - Unique job identifier
 * @param {Array} files - Array of uploaded file objects
 * @param {Array<string>} targetUrls - URLs to track for citations
 */
async function processBrandPresenceData(jobId, files, targetUrls = []) {
  try {
    // Create status file
    const statusPath = path.join(RESULTS_DIR, `${jobId}-status.json`);
    await fs.writeJson(statusPath, {
      jobId,
      status: 'processing',
      progress: 0,
      total: files.length,
      startTime: new Date().toISOString()
    });

    // Process each file and combine data
    const allData = [];
    let processedCount = 0;

    for (const file of files) {
      try {
        const metadata = extractMetadataFromFilename(file.originalname);
        const data = parseBrandPresenceFile(file.path);

        // Add metadata to each row
        data.forEach(row => {
          row.week = metadata.week;
          row.platform = metadata.platform;
          row.year = metadata.year;
        });
        
        // Debug: Check platform on first row
        if (data.length > 0 && processedCount === 0) {
          console.log(`[Citation Processor] DEBUG - After adding metadata:`);
          console.log(`  File: ${file.originalname}`);
          console.log(`  Extracted platform: "${metadata.platform}"`);
          console.log(`  First row platform: "${data[0].platform}"`);
        }

        allData.push(...data);
        processedCount++;

        // Update progress
        await fs.writeJson(statusPath, {
          jobId,
          status: 'processing',
          progress: Math.round((processedCount / files.length) * 100),
          processedFiles: processedCount,
          total: files.length
        });

      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
      }
    }

    console.log(`[Citation Processor] Processing complete. Total rows: ${allData.length}`);
    console.log(`[Citation Processor] Sample row:`, allData[0]);

    // Use user-provided target URLs only (no auto-detection)
    const effectiveTargetUrls = targetUrls;
    
    if (effectiveTargetUrls.length === 0) {
      console.warn(`[Citation Processor] WARNING: No target URLs provided. Citations will be 0.`);
      console.warn(`[Citation Processor] Please upload a CSV with target URLs to track citations.`);
    } else {
      console.log(`[Citation Processor] Tracking ${effectiveTargetUrls.length} user-provided target URLs.`);
      console.log(`[Citation Processor] URLs:`, effectiveTargetUrls);
    }

    // Add citation flags
    console.log(`[Citation Processor] Adding citation flags for ${allData.length} rows...`);
    const enrichedData = addCitationFlags(allData, effectiveTargetUrls);
    console.log(`[Citation Processor] ✓ Enriched data count: ${enrichedData.length}`);

    // Calculate citation rates
    console.log(`[Citation Processor] Calculating citation rates for ${effectiveTargetUrls.length} target URLs...`);
    const citationRates = calculateCitationRates(enrichedData, effectiveTargetUrls);
    console.log(`[Citation Processor] ✓ Citation rates calculated: ${citationRates.length} entries`);

    // Extract domain
    const domain = effectiveTargetUrls.length > 0 ? extractDomain(effectiveTargetUrls[0]) : 'unknown';
    console.log(`[Citation Processor] Tracking domain: ${domain}`);

    // Save results
    const resultsPath = path.join(RESULTS_DIR, `${jobId}-citations.json`);
    console.log(`[Citation Processor] Saving results to: ${resultsPath}`);
    
    const resultsData = {
      jobId,
      status: 'completed',
      completedAt: new Date().toISOString(),
      domain,
      fileCount: files.length,
      totalRows: enrichedData.length,
      targetUrls: effectiveTargetUrls,
      combinedData: enrichedData,
      citationRates
    };
    
    await fs.writeJson(resultsPath, resultsData, { spaces: 2 });
    console.log(`[Citation Processor] Results saved successfully`);

    // Update status
    await fs.writeJson(statusPath, {
      jobId,
      status: 'completed',
      progress: 100,
      completedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error(`[Citation Processor] Job ${jobId} failed:`, error);
    console.error(`[Citation Processor] Error stack:`, error.stack);
    
    const statusPath = path.join(RESULTS_DIR, `${jobId}-status.json`);
    try {
      await fs.writeJson(statusPath, {
        jobId,
        status: 'failed',
        error: error.message,
        stack: error.stack,
        completedAt: new Date().toISOString()
      });
    } catch (writeError) {
      console.error(`[Citation Processor] Failed to write error status:`, writeError);
    }
  }
}

/**
 * Process brand presence data from existing folder
 */
async function processBrandPresenceFolder(jobId, folderPath, targetUrls = []) {
  try {
    const files = await fs.readdir(folderPath);
    const excelFiles = files.filter(f => f.endsWith('.xlsx') || f.endsWith('.xls'));

    const fileObjects = excelFiles.map(filename => ({
      originalname: filename,
      path: path.join(folderPath, filename)
    }));

    return processBrandPresenceData(jobId, fileObjects, targetUrls);

  } catch (error) {
    console.error(`Folder processing failed:`, error);
    throw error;
  }
}

/**
 * Add citation flags to data
 * Adds three columns:
 * - selected_url_cited?: Y/N if any target URL is cited
 * - any_url_from_domain: Y/N if any URL from domain is cited
 * - any_url_from_domain_excluding_specified_URLs: Y/N if non-target domain URLs cited
 */
function addCitationFlags(data, targetUrls) {
  // Pre-compute sets for O(1) lookups
  const domainSet = new Set(targetUrls.map(url => extractDomain(url)));
  const normalizedTargetSet = new Set(targetUrls.map(url => normalizeURL(url)));
  
  console.log(`[Citation Processor] FAST: Processing ${data.length} rows with ${targetUrls.length} target URLs`);
  const startTime = Date.now();

  const result = data.map((row, index) => {
    // Progress logging every 10k rows
    if (index % 10000 === 0 && index > 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const rate = (index / (Date.now() - startTime) * 1000).toFixed(0);
      console.log(`[Citation Processor] Progress: ${index}/${data.length} (${Math.round(index/data.length*100)}%) - ${elapsed}s - ${rate} rows/sec`);
    }

    const sources = row.sources || '';
    const sourceUrls = sources
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const normalizedSources = sourceUrls.map(url => normalizeURL(url));

    // Check if any target URL is cited - O(k) with Set.has()
    const selectedUrlCited = normalizedSources.some(source => normalizedTargetSet.has(source));

    // Check if any URL from domain is cited - O(k) with Set.has()
    const anyUrlFromDomain = sourceUrls.some(source => domainSet.has(extractDomain(source)));

    // Check if non-target domain URLs are cited
    const otherDomainUrls = sourceUrls.filter(source => {
      const sourceDomain = extractDomain(source);
      const isFromDomain = domainSet.has(sourceDomain);
      const normalizedSource = normalizeURL(source);
      const isTargetUrl = normalizedTargetSet.has(normalizedSource);
      return isFromDomain && !isTargetUrl;
    });

    return {
      ...row,
      selected_url_cited: selectedUrlCited ? 'Y' : 'N',
      any_url_from_domain: anyUrlFromDomain ? 'Y' : 'N',
      any_url_from_domain_excluding_specified_URLs: otherDomainUrls.length > 0 ? 'Y' : 'N'
    };
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[Citation Processor] ✓ Complete! Processed ${data.length} rows in ${elapsed}s`);
  
  return result;
}

/**
 * Calculate citation rates by week, platform, and URL
 */
function calculateCitationRates(data, targetUrls) {
  const rates = [];

  // Group by week and platform
  const groups = {};
  data.forEach(row => {
    const key = `${row.week}-${row.platform}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(row);
  });

  // Pre-compute normalized target URLs for fast lookups
  const normalizedTargetMap = new Map();
  targetUrls.forEach(url => {
    normalizedTargetMap.set(normalizeURL(url), url);
  });

  console.log(`[Citation Processor] Calculating rates for ${Object.keys(groups).length} groups...`);
  const startTime = Date.now();

  // Calculate rates for each group
  Object.keys(groups).forEach((key, index) => {
    const parts = key.split('-');
    const week = parts[0];
    const platform = parts.slice(1).join('-'); // Handle platforms with hyphens like "ChatGPT-Paid"
    const groupData = groups[key];
    
    // Progress logging
    if (index % 5 === 0 && index > 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`[Citation Processor] Progress: ${index}/${Object.keys(groups).length} groups processed in ${elapsed}s`);
    }

    const totalPrompts = groupData.length;
    const selectedUrlCitations = groupData.filter(r => r.selected_url_cited === 'Y').length;
    const anyDomainCitations = groupData.filter(r => r.any_url_from_domain === 'Y').length;
    const otherDomainCitations = groupData.filter(r => r.any_url_from_domain_excluding_specified_URLs === 'Y').length;

    // Unique prompts with domain citations
    const uniquePromptsWithCitations = new Set(
      groupData
        .filter(r => r.any_url_from_domain === 'Y')
        .map(r => r.prompt)
    ).size;

    // Find which target URLs were cited in this group - OPTIMIZED
    const citedTargetUrlsSet = new Set();
    if (targetUrls.length > 0) {
      // Build a set of all normalized sources cited in this group (once, not per URL)
      const citedSourcesInGroup = new Set();
      groupData.forEach(row => {
        const sources = (row.sources || '').split(';').map(s => s.trim());
        sources.forEach(source => {
          if (source) {
            citedSourcesInGroup.add(normalizeURL(source));
          }
        });
      });
      
      // Check which target URLs appear in the cited sources (O(n) instead of O(n*m*k))
      normalizedTargetMap.forEach((originalUrl, normalizedUrl) => {
        if (citedSourcesInGroup.has(normalizedUrl)) {
          citedTargetUrlsSet.add(originalUrl);
        }
      });
    }
    const citedTargetUrls = Array.from(citedTargetUrlsSet);
    
    // Summary row for week+platform
    rates.push({
      type: 'summary',
      week,
      platform,
      totalPrompts,
      selectedUrlCitations,
      anyDomainCitations,
      otherDomainCitations,
      uniquePromptsWithCitations,
      selectedUrlRate: totalPrompts > 0 ? (selectedUrlCitations / totalPrompts) : 0,
      anyDomainRate: totalPrompts > 0 ? (anyDomainCitations / totalPrompts) : 0,
      otherDomainRate: totalPrompts > 0 ? (otherDomainCitations / totalPrompts) : 0,
      citedUrls: citedTargetUrls // List of URLs that were cited
    });

    // Calculate per-URL rates (only if there are target URLs and not too many)
    // Skip per-URL breakdown for very large URL lists to avoid data bloat
    if (targetUrls.length > 0 && targetUrls.length <= 100) {
      // Already have citedSourcesInGroup from above, reuse it
      targetUrls.forEach(url => {
        const normalizedUrl = normalizeURL(url);
        
        // Count how many rows cited this specific URL
        const urlCitations = groupData.filter(row => {
          const sources = (row.sources || '').split(';').map(s => s.trim());
          return sources.some(source => normalizeURL(source) === normalizedUrl);
        }).length;

        // Always include URL entries, even if 0 citations (for complete distribution)
        rates.push({
          type: 'per-url',
          week,
          platform,
          url,
          totalPrompts,
          citations: urlCitations,
          citationRate: urlCitations / totalPrompts
        });
      });
    }
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[Citation Processor] ✓ Citation rates calculated: ${rates.length} entries in ${elapsed}s`);

  return rates;
}

/**
 * Helper: Extract domain from URL
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

/**
 * Helper: Normalize URL for comparison
 */
function normalizeURL(url) {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    // Remove trailing slash, convert to lowercase
    let normalized = urlObj.origin + urlObj.pathname;
    normalized = normalized.toLowerCase().replace(/\/$/, '');
    return normalized;
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Helper: Check if two URLs match (ignoring query params, fragments, trailing slashes)
 */
function urlsMatch(url1, url2) {
  return normalizeURL(url1) === normalizeURL(url2);
}

module.exports = {
  processBrandPresenceData,
  processBrandPresenceFolder,
  addCitationFlags,
  calculateCitationRates
};

