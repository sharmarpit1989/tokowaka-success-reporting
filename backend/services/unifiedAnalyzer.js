/**
 * Unified Analyzer Service
 * Combines sitemap parsing, citation tracking, and content analysis
 */

const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { parseSitemaps, extractDomain } = require('./sitemapParser');
const { processBrandPresenceData } = require('./citationProcessor');
const { runHybridAnalysis } = require('./hybridContentAnalyzer');
const config = require('../utils/config');

const RESULTS_DIR = config.storage.resultsDir;

// In-memory job tracking
const unifiedJobs = new Map();

// ⚡ PERFORMANCE: Multi-level in-memory caching with TTL
const dashboardCache = new Map(); // projectId -> { data, timestamp }
const citationDataCache = new Map(); // citationJobId -> { data, timestamp }
const contentAnalysisCache = new Map(); // analysisJobId -> { data, timestamp }

const DASHBOARD_CACHE_TTL = 30000; // 30 seconds - dashboard doesn't change often
const DATA_FILE_CACHE_TTL = 300000; // 5 minutes - raw data files almost never change

// Cache invalidation helper
function invalidateDashboardCache(projectId) {
  if (dashboardCache.has(projectId)) {
    dashboardCache.delete(projectId);
    console.log(`[Unified Analyzer] 🗑️ Cache invalidated for project ${projectId}`);
  }
}

// Invalidate all caches for a project (dashboard + content analysis)
function invalidateCaches(projectId, contentAnalysisJobId) {
  if (dashboardCache.has(projectId)) {
    dashboardCache.delete(projectId);
    console.log(`[Unified Analyzer] 🗑️ Dashboard cache invalidated for project ${projectId}`);
  }
  if (contentAnalysisJobId && contentAnalysisCache.has(contentAnalysisJobId)) {
    contentAnalysisCache.delete(contentAnalysisJobId);
    console.log(`[Unified Analyzer] 🗑️ Content analysis cache invalidated for job ${contentAnalysisJobId}`);
  }
}

/**
 * Create a new unified analysis project from URL file
 * @param {string} domain - Domain being analyzed
 * @param {Array<string>} urls - Array of URLs from file
 * @returns {Promise<Object>} Project info with jobId
 */
async function createUnifiedProjectFromUrls(domain, urls) {
  const projectId = uuidv4();
  
  console.log(`[Unified Analyzer] Creating project ${projectId} from URL list for domain: ${domain}`);
  
  try {
    // Initialize project
    const project = {
      projectId,
      domain,
      urls,
      urlCount: urls.length,
      status: 'initialized',
      createdAt: new Date().toISOString(),
      source: 'file',
      citationData: null,
      contentAnalysis: null
    };
    
    unifiedJobs.set(projectId, project);
    
    // Save project to disk
    const projectPath = path.join(RESULTS_DIR, `unified-${projectId}.json`);
    await fs.writeJson(projectPath, project, { spaces: 2 });
    
    console.log(`[Unified Analyzer] Project created with ${urls.length} URLs from file`);
    
    return {
      projectId,
      domain,
      urlCount: urls.length,
      urls: urls.slice(0, 100), // Return first 100 for preview
      message: `Successfully loaded ${urls.length} URLs from file`
    };
    
  } catch (error) {
    console.error(`[Unified Analyzer] Error creating project from URLs:`, error);
    throw error;
  }
}

/**
 * Create a new unified analysis project from sitemaps
 * @param {string} domain - Domain being analyzed
 * @param {Array<string>} sitemapUrls - Sitemap URLs to parse
 * @returns {Promise<Object>} Project info with jobId
 */
async function createUnifiedProject(domain, sitemapUrls) {
  const projectId = uuidv4();
  
  console.log(`[Unified Analyzer] Creating project ${projectId} for domain: ${domain}`);
  
  try {
    // Parse sitemaps to get URLs
    const urls = await parseSitemaps(sitemapUrls);
    
    // Initialize project
    const project = {
      projectId,
      domain,
      sitemapUrls,
      urls,
      urlCount: urls.length,
      status: 'initialized',
      createdAt: new Date().toISOString(),
      source: 'sitemap',
      citationData: null,
      contentAnalysis: null
    };
    
    unifiedJobs.set(projectId, project);
    
    // Save project to disk
    const projectPath = path.join(RESULTS_DIR, `unified-${projectId}.json`);
    await fs.writeJson(projectPath, project, { spaces: 2 });
    
    console.log(`[Unified Analyzer] Project created with ${urls.length} URLs`);
    
    return {
      projectId,
      domain,
      urlCount: urls.length,
      urls: urls.slice(0, 100), // Return first 100 for preview
      message: `Successfully extracted ${urls.length} URLs from sitemaps`
    };
    
  } catch (error) {
    console.error(`[Unified Analyzer] Error creating project:`, error);
    throw error;
  }
}

/**
 * Upload brand presence data for a project
 * @param {string} projectId - Project ID
 * @param {Array} files - Uploaded brand presence files
 * @returns {Promise<Object>} Citation processing results
 */
async function uploadBrandPresenceData(projectId, files) {
  console.log(`[Unified Analyzer] Uploading brand presence for project ${projectId}`);
  
  const project = unifiedJobs.get(projectId);
  if (!project) {
    // Try loading from disk
    const projectPath = path.join(RESULTS_DIR, `unified-${projectId}.json`);
    if (await fs.pathExists(projectPath)) {
      const loadedProject = await fs.readJson(projectPath);
      unifiedJobs.set(projectId, loadedProject);
    } else {
      throw new Error('Project not found');
    }
  }
  
  const updatedProject = unifiedJobs.get(projectId);
  
  // Process brand presence data using the target URLs from sitemap
  const citationJobId = uuidv4();
  
  // Start citation processing in background
  processBrandPresenceData(citationJobId, files, updatedProject.urls)
    .then(async () => {
      console.log(`[Unified Analyzer] Citation processing completed for project ${projectId}`);
      
      // Update project status to completed
      updatedProject.status = 'completed';
      updatedProject.updatedAt = new Date().toISOString();
      const projectPath = path.join(RESULTS_DIR, `unified-${projectId}.json`);
      await fs.writeJson(projectPath, updatedProject);
      console.log(`[Unified Analyzer] ✅ Project ${projectId} marked as completed`);
      
      // Invalidate caches when citation data changes
      if (dashboardCache.has(projectId)) {
        dashboardCache.delete(projectId);
        console.log(`[Unified Analyzer] 🗑️ Dashboard cache invalidated (citations complete)`);
      }
      if (citationDataCache.has(citationJobId)) {
        citationDataCache.delete(citationJobId);
        console.log(`[Unified Analyzer] 🗑️ Citation data cache invalidated (new data)`);
      }
    })
    .catch(err => {
      console.error(`[Unified Analyzer] Citation processing failed:`, err);
    });
  
  // Update project
  updatedProject.citationJobId = citationJobId;
  updatedProject.status = 'processing_citations';
  updatedProject.updatedAt = new Date().toISOString();
  
  unifiedJobs.set(projectId, updatedProject);
  
  const projectPath = path.join(RESULTS_DIR, `unified-${projectId}.json`);
  await fs.writeJson(projectPath, updatedProject, { spaces: 2 });
  
  // Invalidate dashboard cache (citation data will be fresh when complete)
  if (dashboardCache.has(projectId)) {
    dashboardCache.delete(projectId);
    console.log(`[Unified Analyzer] 🗑️ Dashboard cache invalidated (citations started)`);
  }
  
  return {
    projectId,
    citationJobId,
    message: 'Brand presence data processing started',
    statusEndpoint: `/api/unified/status/${projectId}`
  };
}

/**
 * Run content analysis for URLs in project (on-demand or batch)
 * @param {string} projectId - Project ID
 * @param {Array<string>} urls - Specific URLs to analyze (optional, defaults to all)
 * @param {Object} options - Analysis options
 */
async function runContentAnalysisForProject(projectId, urls = null, options = {}) {
  console.log(`[Unified Analyzer] Running content analysis for project ${projectId}`);
  
  const project = unifiedJobs.get(projectId) || await loadProject(projectId);
  
  const urlsToAnalyze = urls || project.urls;
  const analysisJobId = uuidv4();
  
  // Start content analysis in background
  runHybridAnalysis(analysisJobId, urlsToAnalyze, options)
    .then(async () => {
      // ✅ Update project status to completed when analysis finishes
      console.log(`[Unified Analyzer] Analysis completed for project ${projectId}`);
      const updatedProject = unifiedJobs.get(projectId) || await loadProject(projectId);
      updatedProject.status = 'completed';
      updatedProject.updatedAt = new Date().toISOString();
      
      unifiedJobs.set(projectId, updatedProject);
      
      const projectPath = path.join(RESULTS_DIR, `unified-${projectId}.json`);
      await fs.writeJson(projectPath, updatedProject, { spaces: 2 });
      
      // ⚠️ Only invalidate dashboard cache (keep data file caches for performance)
      // Content analysis cache will auto-refresh when new analysisJobId is detected
      if (dashboardCache.has(projectId)) {
        dashboardCache.delete(projectId);
        console.log(`[Unified Analyzer] 🗑️ Dashboard cache invalidated (analysis complete)`);
      }
      
      console.log(`[Unified Analyzer] ✅ Project ${projectId} marked as completed`);
    })
    .catch(async err => {
      console.error(`[Unified Analyzer] Content analysis failed:`, err);
      
      // Mark project as failed
      const updatedProject = unifiedJobs.get(projectId) || await loadProject(projectId);
      updatedProject.status = 'failed';
      updatedProject.error = err.message;
      updatedProject.updatedAt = new Date().toISOString();
      
      unifiedJobs.set(projectId, updatedProject);
      
      const projectPath = path.join(RESULTS_DIR, `unified-${projectId}.json`);
      await fs.writeJson(projectPath, updatedProject, { spaces: 2 });
      
      // Invalidate dashboard cache only
      if (dashboardCache.has(projectId)) {
        dashboardCache.delete(projectId);
        console.log(`[Unified Analyzer] 🗑️ Dashboard cache invalidated (analysis failed)`);
      }
    });
  
  // Update project
  project.contentAnalysisJobId = analysisJobId;
  project.status = 'processing_content';
  project.updatedAt = new Date().toISOString();
  
  unifiedJobs.set(projectId, project);
  
  const projectPath = path.join(RESULTS_DIR, `unified-${projectId}.json`);
  await fs.writeJson(projectPath, project, { spaces: 2 });
  
  // ⚠️ Only invalidate dashboard cache (keep citation data cache intact)
  if (dashboardCache.has(projectId)) {
    dashboardCache.delete(projectId);
    console.log(`[Unified Analyzer] 🗑️ Dashboard cache invalidated (analysis started)`);
  }
  
  return {
    projectId,
    analysisJobId,
    message: 'Content analysis started',
    statusEndpoint: `/api/unified/status/${projectId}`
  };
}

/**
 * Normalize URL for consistent comparison
 * Returns hostname + pathname without protocol, query, or hash
 */
function normalizeUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname + parsed.pathname;
  } catch {
    return null;
  }
}

/**
 * Get unified dashboard data (OPTIMIZED with pre-indexing + in-memory caching)
 * Combines citation data and content analysis for all URLs
 * 
 * Performance: O(n) instead of O(n²)
 * - Before: 150 URLs × 10,000 citations = 1,500,000 operations
 * - After: 10,000 + 150 = 10,150 operations (147x faster!)
 * 
 * Caching: 5-second TTL to reduce disk I/O during polling
 * - Dashboard calls go from 1-18s → 1-5ms (cached)
 * - Only re-reads files when data actually changes
 */
async function getUnifiedDashboard(projectId) {
  console.log(`[Unified Analyzer] Getting dashboard for project ${projectId}`);
  
  // ⚡ Check cache first
  const cached = dashboardCache.get(projectId);
  const now = Date.now();
  if (cached && (now - cached.timestamp) < DASHBOARD_CACHE_TTL) {
    console.log(`[Unified Analyzer] 🚀 Cache HIT (age: ${now - cached.timestamp}ms)`);
    return cached.data;
  }
  
  console.log(`[Unified Analyzer] 💾 Cache MISS - reading from disk`);
  const project = await loadProject(projectId);
  
  // Load citation data if available (WITH CACHING - this file can be huge!)
  let citationData = null;
  if (project.citationJobId) {
    // Check citation data cache first
    const cachedCitation = citationDataCache.get(project.citationJobId);
    if (cachedCitation && (now - cachedCitation.timestamp) < DATA_FILE_CACHE_TTL) {
      console.log(`[Unified Analyzer] ⚡ Citation data cache HIT (age: ${now - cachedCitation.timestamp}ms)`);
      citationData = cachedCitation.data;
    } else {
      console.log(`[Unified Analyzer] 📂 Reading citation data from disk...`);
      const citationPath = path.join(RESULTS_DIR, `${project.citationJobId}-citations.json`);
      if (await fs.pathExists(citationPath)) {
        try {
          const startTime = Date.now();
          citationData = await fs.readJson(citationPath);
          const readTime = Date.now() - startTime;
          
          console.log(`[Unified Analyzer] ✅ Citation data loaded in ${readTime}ms (${citationData.combinedData?.length || 0} rows, ${citationData.citationRates?.length || 0} rate entries)`);
          
          // Cache the lightweight version
          citationDataCache.set(project.citationJobId, {
            data: citationData,
            timestamp: now
          });
        } catch (error) {
          console.error('[Unified Analyzer] Failed to read citation data file, skipping', { 
            path: citationPath, 
            error: error.message 
          });
          // File is corrupted - continue without citation data
          citationData = null;
        }
      }
    }
  }
  
  // Load content analysis if available (WITH CACHING)
  let contentAnalysis = null;
  if (project.contentAnalysisJobId) {
    // Check content analysis cache first
    const cachedAnalysis = contentAnalysisCache.get(project.contentAnalysisJobId);
    if (cachedAnalysis && (now - cachedAnalysis.timestamp) < DATA_FILE_CACHE_TTL) {
      console.log(`[Unified Analyzer] ⚡ Content analysis cache HIT (age: ${now - cachedAnalysis.timestamp}ms)`);
      contentAnalysis = cachedAnalysis.data;
    } else {
      console.log(`[Unified Analyzer] 📂 Reading content analysis from disk...`);
      const analysisPath = path.join(RESULTS_DIR, `${project.contentAnalysisJobId}.json`);
      if (await fs.pathExists(analysisPath)) {
        try {
          const startTime = Date.now();
          contentAnalysis = await fs.readJson(analysisPath);
          const readTime = Date.now() - startTime;
          console.log(`[Unified Analyzer] ✅ Content analysis loaded in ${readTime}ms (${contentAnalysis.results?.length || 0} results)`);
          
          // Cache it for future requests
          contentAnalysisCache.set(project.contentAnalysisJobId, {
            data: contentAnalysis,
            timestamp: now
          });
        } catch (error) {
          console.error('[Unified Analyzer] Failed to read content analysis file, skipping', { 
            path: analysisPath, 
            error: error.message 
          });
          // File is corrupted - continue without content analysis
          contentAnalysis = null;
        }
      }
    }
  }
  
  // ===== PRE-INDEX PHASE: Build lookup maps once (O(n)) =====
  
  // 1. Build citation lookup map: URL → citation rows (parsed from sources column)
  const citationsByUrl = new Map();
  if (citationData?.combinedData) {
    console.log(`[Unified Analyzer] 📊 Building citation map from ${citationData.combinedData.length} rows...`);
    const startMap = Date.now();
    citationData.combinedData.forEach(row => {
      // Parse the 'sources' column which contains semicolon-separated URLs that were cited
      if (row.sources) {
        const sources = row.sources.split(';').map(s => s.trim()).filter(s => s);
        sources.forEach(sourceUrl => {
          const normalized = normalizeUrl(sourceUrl);
          if (normalized) {
            if (!citationsByUrl.has(normalized)) {
              citationsByUrl.set(normalized, []);
            }
            citationsByUrl.get(normalized).push(row);
          }
        });
      }
    });
    console.log(`[Unified Analyzer] ✅ Citation map built in ${Date.now() - startMap}ms (${citationsByUrl.size} unique URLs found in sources)`);
  }
  
  // 2. Build per-URL citation stats map (from citationRates array)
  const citationStatsByUrl = new Map();
  if (citationData?.citationRates) {
    citationData.citationRates.forEach(r => {
      if (r.type === 'per-url' && r.url) {
        if (!citationStatsByUrl.has(r.url)) {
          citationStatsByUrl.set(r.url, { citations: 0, prompts: 0 });
        }
        const stats = citationStatsByUrl.get(r.url);
        stats.citations += r.citations || 0;
        stats.prompts += r.totalPrompts || 0;
      }
    });
  }
  
  // 3. Build cited URLs set (from summary data)
  const citedUrlsSet = new Set();
  if (citationData?.citationRates) {
    const summaryRows = citationData.citationRates.filter(r => r.type === 'summary' || !r.type);
    summaryRows.forEach(r => {
      if (r.citedUrls && Array.isArray(r.citedUrls)) {
        r.citedUrls.forEach(url => citedUrlsSet.add(url));
      }
    });
  }
  
  // 4. Calculate domain citation rate once
  let domainCitationRate = null;
  if (citationData?.citationRates) {
    const domainRates = citationData.citationRates.filter(r => r.type === 'summary' || !r.type);
    if (domainRates.length > 0) {
      domainCitationRate = domainRates.reduce((sum, r) => sum + (r.anyDomainRate || 0), 0) / domainRates.length;
    }
  }
  
  // 5. Build content analysis lookup map: URL → analysis
  const contentByUrl = new Map();
  if (contentAnalysis?.results) {
    console.log(`[Unified Analyzer] 📊 Building content analysis map: ${contentAnalysis.results.length} results found`);
    contentAnalysis.results.forEach(result => {
      if (result.url) {
        contentByUrl.set(result.url, result);
        console.log(`[Unified Analyzer] 🔗 Mapped analysis for: ${result.url}`);
      }
    });
  } else {
    console.log(`[Unified Analyzer] ⚠️  No content analysis results found!`, {
      hasContentAnalysis: !!contentAnalysis,
      hasResults: !!contentAnalysis?.results,
      contentAnalysisJobId: project.contentAnalysisJobId
    });
  }
  
  // ===== LOOKUP PHASE: Fast O(1) lookups per URL =====
  
  // Calculate total unique prompts for citation rate denominator
  const totalUniquePrompts = citationData?.combinedData 
    ? new Set(citationData.combinedData.map(row => row.prompt)).size 
    : 1;
  
  console.log(`[Unified Analyzer] Total unique prompts for citation rate calculation: ${totalUniquePrompts}`);
  
  const unifiedData = project.urls.map(url => {
    const row = {
      url,
      domain: project.domain,
      citationRate: null,
      totalCitations: 0,
      domainCitationRate: domainCitationRate,
      contentAnalysis: null,
      hasContentAnalysis: false,
      hasCitationData: false
    };
    
    // Add citation data using pre-indexed lookups (O(1))
    if (citationData) {
      // Primary: Check combinedData via pre-built map
      if (citationsByUrl.size > 0) {
        const normalized = normalizeUrl(url);
        const urlCitations = normalized ? citationsByUrl.get(normalized) : null;
        
        if (urlCitations && urlCitations.length > 0) {
          // Count unique prompts that cited this URL (not total rows)
          const uniquePrompts = new Set(urlCitations.map(c => c.prompt)).size;
          row.totalCitations = uniquePrompts;
          row.citationRate = uniquePrompts / totalUniquePrompts;
          row.hasCitationData = true;
        } else {
          // URL was tracked but not cited
          row.totalCitations = 0;
          row.citationRate = 0;
          row.hasCitationData = true;
        }
      }
      
      // Fallback: Try citationRates array via pre-built map
      if (!row.hasCitationData && citationStatsByUrl.size > 0) {
        const stats = citationStatsByUrl.get(url);
        if (stats) {
          row.totalCitations = stats.citations;
          row.citationRate = stats.prompts > 0 ? stats.citations / stats.prompts : 0;
          row.hasCitationData = true;
        } else if (citedUrlsSet.has(url)) {
          // URL appears in cited URLs but no detailed stats
          row.hasCitationData = true;
        } else if (citedUrlsSet.size > 0) {
          // URL was tracked but not cited
          row.totalCitations = 0;
          row.citationRate = 0;
          row.hasCitationData = true;
        }
      }
    }
    
    // Add content analysis using pre-built map (O(1))
    const analysis = contentByUrl.get(url);
    if (analysis) {
      row.contentAnalysis = analysis;
      row.hasContentAnalysis = true;
    }
    
    return row;
  });
  
  // Calculate aggregate stats from citation rates
  let aggregateCitationRate = null;
  let totalCitations = 0;
  let totalPrompts = 0;
  if (citationData?.citationRates) {
    const summaryRates = citationData.citationRates.filter(r => r.type === 'summary' || !r.type);
    summaryRates.forEach(r => {
      totalCitations += r.selectedUrlCitations || 0;
      totalPrompts += r.totalPrompts || 0;
    });
    aggregateCitationRate = totalPrompts > 0 ? totalCitations / totalPrompts : null;
  }

  const dashboardData = {
    projectId,
    domain: project.domain,
    urlCount: project.urls.length,
    status: project.status,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    urls: unifiedData,
    summary: {
      totalUrls: project.urls.length,
      urlsWithCitations: unifiedData.filter(u => u.hasCitationData && u.totalCitations > 0).length,
      urlsWithContent: unifiedData.filter(u => u.hasContentAnalysis).length,
      // Use aggregate rate from citationRates if per-URL data not available
      avgCitationRate: aggregateCitationRate !== null ? aggregateCitationRate : calculateAverage(unifiedData.map(u => u.citationRate)),
      avgLLMScore: calculateAverage(unifiedData.map(u => u.contentAnalysis?.llmPresence?.overallScore)),
      totalCitations,
      totalPrompts
    },
    // ✅ Include citation rates for dashboard charts/tables
    citationRates: citationData?.citationRates || [],
    targetUrls: citationData?.targetUrls || []
  };
  
  // ⚡ Cache the result
  dashboardCache.set(projectId, {
    data: dashboardData,
    timestamp: Date.now()
  });
  
  return dashboardData;
}

/**
 * Get project status
 */
async function getProjectStatus(projectId) {
  const project = await loadProject(projectId);
  
  // Check citation job status
  let citationStatus = 'pending';
  if (project.citationJobId) {
    const statusPath = path.join(RESULTS_DIR, `${project.citationJobId}-status.json`);
    if (await fs.pathExists(statusPath)) {
      try {
        const status = await fs.readJson(statusPath);
        citationStatus = status.status;
      } catch (error) {
        logger.warn('Failed to read citation status file, marking as pending', { 
          path: statusPath, 
          error: error.message 
        });
        // File is corrupted - delete it and mark as pending
        try {
          await fs.unlink(statusPath);
          logger.info('Deleted corrupted citation status file', { path: statusPath });
        } catch (deleteError) {
          logger.error('Failed to delete corrupted file', { error: deleteError.message });
        }
        citationStatus = 'pending';
      }
    }
  }
  
  // Check content analysis status
  let contentStatus = 'pending';
  if (project.contentAnalysisJobId) {
    const { getJobStatus } = require('./hybridContentAnalyzer');
    const status = getJobStatus(project.contentAnalysisJobId);
    if (status) {
      contentStatus = status.status;
    }
  }
  
  return {
    projectId,
    domain: project.domain,
    urlCount: project.urls.length,
    overallStatus: project.status,
    citationStatus,
    contentStatus,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
}

/**
 * Load project from disk
 */
async function loadProject(projectId) {
  let project = unifiedJobs.get(projectId);
  
  if (!project) {
    const projectPath = path.join(RESULTS_DIR, `unified-${projectId}.json`);
    if (await fs.pathExists(projectPath)) {
      try {
        project = await fs.readJson(projectPath);
        unifiedJobs.set(projectId, project);
      } catch (error) {
        logger.error('Failed to read project file - file may be corrupted', { 
          projectId, 
          path: projectPath, 
          error: error.message 
        });
        throw new Error(`Project file corrupted or unreadable: ${projectId}`);
      }
    } else {
      throw new Error('Project not found');
    }
  }
  
  return project;
}

/**
 * Helper: Calculate average
 */
function calculateAverage(values) {
  const validValues = values.filter(v => v != null && !isNaN(v));
  if (validValues.length === 0) return 0;
  return validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
}

module.exports = {
  createUnifiedProject,
  createUnifiedProjectFromUrls,
  uploadBrandPresenceData,
  runContentAnalysisForProject,
  getUnifiedDashboard,
  getProjectStatus,
  invalidateCaches
};

