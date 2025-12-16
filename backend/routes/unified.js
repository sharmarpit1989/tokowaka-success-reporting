/**
 * Unified Analysis Routes
 * Combines sitemap parsing, citation tracking, and content analysis
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const config = require('../utils/config');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.ensureDirSync(config.storage.uploadsDir);
    cb(null, config.storage.uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// Upload config for URL files (CSV/Excel)
const uploadUrlFile = multer({ 
  storage,
  limits: { fileSize: 10485760 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.csv' || ext === '.xlsx' || ext === '.xls') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed for URL files'));
    }
  }
});

// Upload config for brand presence files (Excel only)
const uploadBrandPresence = multer({ 
  storage,
  limits: { fileSize: 52428800 }, // 50MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed for brand presence data'));
    }
  }
});

const {
  createUnifiedProject,
  uploadBrandPresenceData,
  runContentAnalysisForProject,
  getUnifiedDashboard,
  getProjectStatus
} = require('../services/unifiedAnalyzer');

/**
 * POST /api/unified/upload-urls
 * Upload URL file and extract URLs (used by Citation Performance)
 * Body: FormData with 'file'
 */
router.post('/upload-urls', uploadUrlFile.single('file'), async (req, res) => {
  try {
    console.log('[Unified API] Received upload-urls request');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse the uploaded file and extract URLs
    const { parseURLFile } = require('../services/fileParser');
    const urls = await parseURLFile(req.file.path);

    console.log('[Unified API] Extracted URLs:', urls.length);

    res.json({
      success: true,
      filename: req.file.originalname,
      urlCount: urls.length,
      urls: urls,
      fileId: path.basename(req.file.path)
    });

  } catch (error) {
    console.error('[Unified API] Upload URLs error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/unified/create-from-file
 * Create a new project by uploading URL file
 * Body: FormData with 'file' and 'domain'
 */
router.post('/create-from-file', uploadUrlFile.single('file'), async (req, res) => {
  try {
    console.log('[Unified API] Received create-from-file request');
    console.log('[Unified API] Body:', req.body);
    console.log('[Unified API] File:', req.file ? req.file.originalname : 'No file');

    const { domain } = req.body;

    if (!domain) {
      console.error('[Unified API] Missing domain');
      return res.status(400).json({ 
        error: 'Domain is required' 
      });
    }

    if (!req.file) {
      console.error('[Unified API] Missing file');
      return res.status(400).json({ 
        error: 'URL file is required' 
      });
    }

    console.log(`[Unified API] Creating project from file for domain: ${domain}`);
    console.log(`[Unified API] File: ${req.file.originalname} (${req.file.size} bytes)`);

    // Parse URLs from file
    const { parseURLFile } = require('../services/fileParser');
    const urls = await parseURLFile(req.file.path);

    console.log(`[Unified API] Extracted ${urls.length} URLs from file`);

    if (urls.length === 0) {
      return res.status(400).json({ 
        error: 'No URLs found in file. Make sure file has a column named: url, urls, link, or links' 
      });
    }

    // Create project with extracted URLs
    const { createUnifiedProjectFromUrls } = require('../services/unifiedAnalyzer');
    const result = await createUnifiedProjectFromUrls(domain, urls);

    console.log(`[Unified API] Project created successfully: ${result.projectId}`);
    res.json(result);

  } catch (error) {
    console.error('[Unified API] Error creating project from file:', error);
    console.error('[Unified API] Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/unified/create
 * Create a new unified analysis project
 * Body: { domain, sitemapUrls }
 */
router.post('/create', async (req, res) => {
  try {
    const { domain, sitemapUrls } = req.body;

    if (!domain || !sitemapUrls || !Array.isArray(sitemapUrls) || sitemapUrls.length === 0) {
      return res.status(400).json({ 
        error: 'Domain and sitemapUrls array are required' 
      });
    }

    console.log(`[Unified API] Creating project for domain: ${domain}`);
    console.log(`[Unified API] Sitemap URLs:`, sitemapUrls);

    const result = await createUnifiedProject(domain, sitemapUrls);

    res.json(result);

  } catch (error) {
    console.error('[Unified API] Error creating project:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/unified/:projectId/upload-citations
 * Upload brand presence data for a project
 */
router.post('/:projectId/upload-citations', uploadBrandPresence.any(), async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    console.log(`[Unified API] Uploading ${req.files.length} brand presence files for project ${projectId}`);

    const result = await uploadBrandPresenceData(projectId, req.files);

    res.json(result);

  } catch (error) {
    console.error('[Unified API] Error uploading citations:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/unified/:projectId/analyze-content
 * Run content analysis for URLs in project
 * Body: { urls (optional), options }
 */
router.post('/:projectId/analyze-content', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { urls, options = {} } = req.body;

    console.log(`[Unified API] Starting content analysis for project ${projectId}`);

    const result = await runContentAnalysisForProject(projectId, urls, options);

    res.json(result);

  } catch (error) {
    console.error('[Unified API] Error starting content analysis:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/unified/:projectId/dashboard
 * Get unified dashboard data (with caching)
 */
const { cacheMiddleware } = require('../utils/cache');

// ⚡ OPTIMIZATION: Using backend-level caching with proper HTTP headers
router.get('/:projectId/dashboard', async (req, res) => {
  try {
    const { projectId } = req.params;

    console.log(`[Unified API] Fetching dashboard for project ${projectId}`);

    const dashboard = await getUnifiedDashboard(projectId);

    // ⚡ CRITICAL: Disable browser caching during active analysis
    // Browser 304 responses were causing frontend to miss completion
    // Backend has its own caching, browser caching causes stale data during polling
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json(dashboard);

  } catch (error) {
    console.error('[Unified API] Error fetching dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/unified/:projectId/status
 * Get project status
 */
router.get('/:projectId/status', async (req, res) => {
  try {
    const { projectId } = req.params;

    const status = await getProjectStatus(projectId);

    // Prevent browser caching of status checks
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json(status);

  } catch (error) {
    console.error('[Unified API] Error fetching status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /:projectId/generate-recommendations
 * Generate AI-powered recommendations for the visibility dashboard
 */
router.post('/:projectId/generate-recommendations', async (req, res) => {
  try {
    const { projectId } = req.params;

    console.log('[AI Recommendations] Generating for project:', projectId);

    // Get dashboard data
    const dashboard = await getUnifiedDashboard(projectId);

    if (!dashboard) {
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log('[AI Recommendations] Dashboard loaded:', {
      totalUrls: dashboard.urls?.length || 0,
      analyzed: dashboard.urls?.filter(u => u.hasContentAnalysis).length || 0
    });

    // Generate AI recommendations
    const { generateVisibilityRecommendations } = require('../services/visibilityRecommendationAI');
    const result = await generateVisibilityRecommendations(dashboard);

    console.log('[AI Recommendations] Generated:', result.recommendations.length, 'recommendations');

    res.json(result);

  } catch (error) {
    console.error('[AI Recommendations] Error:', error);
    res.status(500).json({ 
      error: error.message,
      recommendations: [
        'Unable to generate AI recommendations at this time',
        'Please try again later or contact support if the issue persists'
      ],
      isAIGenerated: false
    });
  }
});

/**
 * POST /:projectId/content-opportunities
 * Analyze prompt-level patterns and generate content opportunity recommendations
 * Query params: ?regenerate=true to force regeneration
 */
router.post('/:projectId/content-opportunities', async (req, res) => {
  try {
    const { projectId } = req.params;
    const regenerate = req.query.regenerate === 'true' || req.body.regenerate === true;

    console.log('[Content Opportunities] Request for project:', projectId, { regenerate });

    // Load project to get citationJobId
    const projectPath = path.join(config.storage.resultsDir, `unified-${projectId}.json`);
    
    if (!await fs.pathExists(projectPath)) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Read project file with error handling for corrupted files
    let project;
    try {
      project = await fs.readJson(projectPath);
    } catch (parseError) {
      console.error('[Content Opportunities] Failed to parse project file:', parseError.message);
      return res.status(500).json({ 
        error: 'Project file is corrupted. Please create a new project or re-upload your data.',
        details: 'The project data file could not be read. This may happen if the file was not saved completely.'
      });
    }
    
    if (!project.citationJobId) {
      return res.status(404).json({ error: 'Citation data not found. Please upload brand presence data first.' });
    }

    // Check for cached/saved content opportunities
    const opportunitiesPath = path.join(config.storage.resultsDir, `${projectId}-opportunities.json`);
    const hasCache = await fs.pathExists(opportunitiesPath);
    
    // Return cached data if available and regeneration not requested
    if (hasCache && !regenerate) {
      try {
        const cachedData = await fs.readJson(opportunitiesPath);
        console.log('[Content Opportunities] Returning cached data (generated:', cachedData.generatedAt, ')');
        return res.json({
          ...cachedData,
          cached: true,
          cachedAt: cachedData.generatedAt
        });
      } catch (error) {
        console.warn('[Content Opportunities] Failed to read cache, regenerating:', error.message);
        // Continue to regeneration below
      }
    }

    console.log('[Content Opportunities] Generating fresh analysis...');

    // Load citation results using citationJobId
    const resultsPath = path.join(config.storage.resultsDir, `${project.citationJobId}-citations.json`);
    
    if (!await fs.pathExists(resultsPath)) {
      return res.status(404).json({ error: 'Citation data not found. Processing may still be in progress.' });
    }

    // Read citation results with error handling
    let citationResults;
    try {
      citationResults = await fs.readJson(resultsPath);
    } catch (parseError) {
      console.error('[Content Opportunities] Failed to parse citation file:', parseError.message);
      return res.status(500).json({ 
        error: 'Citation data file is corrupted. Please re-upload your brand presence data.',
        details: 'The citation data file could not be read.'
      });
    }
    
    if (!citationResults.combinedData || citationResults.combinedData.length === 0) {
      return res.status(400).json({ error: 'No brand presence data available for analysis' });
    }

    console.log('[Content Opportunities] Loaded:', {
      totalRows: citationResults.combinedData.length,
      targetUrls: citationResults.targetUrls?.length || 0
    });

    // Step 1: Analyze prompt patterns
    const { analyzePromptPatterns } = require('../services/promptAnalyzer');
    const promptAnalysis = analyzePromptPatterns(
      citationResults.combinedData,
      citationResults.targetUrls || []
    );

    console.log('[Content Opportunities] Prompt analysis complete:', {
      uniquePrompts: promptAnalysis.totalUniquePrompts,
      themes: promptAnalysis.themes.length,
      opportunities: promptAnalysis.opportunities.length
    });

    // Step 2: Analyze content patterns
    const { analyzeContentPatterns } = require('../services/contentPatternAnalyzer');
    const contentPatterns = analyzeContentPatterns(
      promptAnalysis.prompts,
      citationResults.targetUrls || []
    );

    console.log('[Content Opportunities] Content pattern analysis complete');

    // Step 3: Generate AI recommendations
    const { generateContentRecommendations } = require('../services/contentOpportunityAI');
    const aiRecommendations = await generateContentRecommendations(
      promptAnalysis,
      contentPatterns,
      citationResults.targetUrls || []
    );

    console.log('[Content Opportunities] AI recommendations generated:', {
      count: aiRecommendations.recommendations?.length || 0,
      isAI: aiRecommendations.isAIGenerated
    });

    // Step 4: Validate recommendations against existing website content
    const { getUnifiedDashboard } = require('../services/unifiedAnalyzer');
    let dashboard = null;
    try {
      dashboard = await getUnifiedDashboard(projectId);
    } catch (error) {
      console.warn('[Content Opportunities] Could not load dashboard for validation:', error.message);
    }

    let validatedRecommendations = aiRecommendations.recommendations;
    let analyzedCount = 0;
    let totalUrls = 0;
    let validationEnabled = false;
    
    if (dashboard && dashboard.urls) {
      const { validateRecommendations } = require('../services/websiteStructureValidator');
      
      // Get analyzed URLs (ones with content analysis data)
      const analyzedUrls = dashboard.urls.filter(u => u.hasContentAnalysis && u.contentAnalysis);
      totalUrls = dashboard.urls.length;
      analyzedCount = analyzedUrls.length;
      
      console.log('[Content Opportunities] Validating against website:', {
        totalUrls,
        analyzedUrls: analyzedCount
      });
      
      if (analyzedUrls.length > 0) {
        validatedRecommendations = validateRecommendations(
          aiRecommendations.recommendations,
          analyzedUrls,
          dashboard.urls
        );
        validationEnabled = true;
        
        console.log('[Content Opportunities] Validation complete');
      } else {
        console.log('[Content Opportunities] No analyzed URLs available for validation');
      }
    }

    // Prepare response data
    const responseData = {
      promptAnalysis: {
        totalUniquePrompts: promptAnalysis.totalUniquePrompts,
        themes: promptAnalysis.themes,
        opportunities: promptAnalysis.opportunities
      },
      contentPatterns: {
        highPerforming: contentPatterns.highPerforming,
        lowPerforming: contentPatterns.lowPerforming,
        structuralRecommendations: contentPatterns.recommendations
      },
      aiRecommendations: validatedRecommendations,
      isAIGenerated: aiRecommendations.isAIGenerated,
      generatedAt: new Date().toISOString(),
      note: aiRecommendations.note,
      validation: {
        enabled: validationEnabled,
        analyzedUrls: analyzedCount,
        totalUrls: totalUrls
      },
      cached: false
    };

    // 💾 Save to disk for future requests
    try {
      await fs.writeJson(opportunitiesPath, responseData, { spaces: 2 });
      console.log('[Content Opportunities] 💾 Results saved to disk for future requests');
    } catch (saveError) {
      console.error('[Content Opportunities] Failed to save results:', saveError.message);
      // Continue anyway - saving is not critical
    }

    // Return comprehensive analysis
    res.json(responseData);

  } catch (error) {
    console.error('[Content Opportunities] Error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /rate-limit-status
 * Get current rate limit status for all services
 */
router.get('/rate-limit-status', (req, res) => {
  const { getAllStatus } = require('../utils/rateLimiter');
  const status = getAllStatus();
  res.json(status);
});

/**
 * POST /:projectId/generate-insights
 * Generate AI insights for specific URL(s) on-demand
 * Body: { url: "https://..." } or { urls: ["https://...", ...], regenerate: true }
 */
router.post('/:projectId/generate-insights', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { url, urls, regenerate = false } = req.body;
    
    console.log(`[Unified API] Generating AI insights for project ${projectId}`, { url, urls, regenerate });
    
    const { generateInsightsForUrl, generateInsightsForUrls } = require('../services/insightsGenerator');
    
    let result;
    
    if (url) {
      // Single URL
      result = await generateInsightsForUrl(projectId, url, regenerate);
      res.json({
        success: true,
        url,
        insights: result.insights,
        regenerated: result.regenerated,
        cached: result.cached
      });
    } else if (urls && Array.isArray(urls) && urls.length > 0) {
      // Multiple URLs (batch)
      result = await generateInsightsForUrls(projectId, urls, regenerate);
      res.json({
        success: true,
        results: result,
        summary: {
          total: urls.length,
          successful: Object.values(result).filter(r => r.success).length,
          failed: Object.values(result).filter(r => !r.success).length
        }
      });
    } else {
      res.status(400).json({ error: 'Either "url" or "urls" array must be provided' });
    }
    
  } catch (error) {
    console.error('[Unified API] Error generating insights:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

