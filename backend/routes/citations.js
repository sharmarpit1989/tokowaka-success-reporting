/**
 * Citation Tracking Routes
 * Handles brand presence data processing and citation rate calculations
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
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

const upload = multer({ 
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 }
});

/**
 * POST /api/citations/upload
 * Upload brand presence Excel files for processing
 */
router.post('/upload', upload.array('files', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { targetUrls } = req.body; // JSON string of target URLs to track
    
    console.log('[Citations Upload] Received request');
    console.log('  Files:', req.files.length);
    console.log('  Target URLs raw:', targetUrls);
    
    const parsedUrls = targetUrls ? JSON.parse(targetUrls) : [];
    console.log('  Parsed URLs count:', parsedUrls.length);
    if (parsedUrls.length > 0) {
      console.log('  Sample URLs:', parsedUrls.slice(0, 3));
    }
    
    // Generate unique processing job ID
    const jobId = uuidv4();

    // Start processing in background
    const { processBrandPresenceData } = require('../services/citationProcessor');
    processBrandPresenceData(jobId, req.files, parsedUrls)
      .catch(err => {
        console.error(`Citation processing job ${jobId} failed:`, err);
      });

    res.json({
      success: true,
      jobId,
      fileCount: req.files.length,
      message: 'Processing started. Use jobId to check progress.',
      statusEndpoint: `/api/citations/status/${jobId}`
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/citations/process
 * Process citation data from uploaded files or existing data
 */
router.post('/process', async (req, res) => {
  try {
    const { dataFolder, targetUrls = [] } = req.body;

    if (!dataFolder) {
      return res.status(400).json({ error: 'dataFolder is required' });
    }

    const jobId = uuidv4();

    // Process from existing folder
    const { processBrandPresenceFolder } = require('../services/citationProcessor');
    processBrandPresenceFolder(jobId, dataFolder, targetUrls)
      .catch(err => {
        console.error(`Citation processing job ${jobId} failed:`, err);
      });

    res.json({
      success: true,
      jobId,
      message: 'Processing started',
      statusEndpoint: `/api/citations/status/${jobId}`
    });

  } catch (error) {
    console.error('Process error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/citations/status/:jobId
 * Check status of citation processing job
 */
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const statusPath = path.join(config.storage.resultsDir, `${jobId}-status.json`);

    if (!await fs.pathExists(statusPath)) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const status = await fs.readJson(statusPath);
    res.json(status);

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/citations/results/:jobId
 * Get citation processing results
 */
router.get('/results/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const resultsPath = path.join(config.storage.resultsDir, `${jobId}-citations.json`);

    if (!await fs.pathExists(resultsPath)) {
      return res.status(404).json({ error: 'Results not found' });
    }

    const results = await fs.readJson(resultsPath);
    res.json(results);

  } catch (error) {
    console.error('Results fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/citations/rates
 * Get aggregated citation rates (can be filtered)
 */
router.get('/rates', async (req, res) => {
  try {
    const { jobId, week, platform, url } = req.query;

    if (!jobId) {
      return res.status(400).json({ error: 'jobId is required' });
    }

    const resultsPath = path.join(config.storage.resultsDir, `${jobId}-citations.json`);

    if (!await fs.pathExists(resultsPath)) {
      return res.status(404).json({ error: 'Results not found' });
    }

    let results = await fs.readJson(resultsPath);

    // Apply filters
    if (results.citationRates) {
      let rates = results.citationRates;

      if (week) {
        rates = rates.filter(r => r.week === week);
      }
      if (platform) {
        rates = rates.filter(r => r.platform === platform);
      }
      if (url) {
        rates = rates.filter(r => r.url === url);
      }

      res.json({ citationRates: rates });
    } else {
      res.json(results);
    }

  } catch (error) {
    console.error('Rates fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/citations/trends
 * Get citation trends over time
 */
router.get('/trends', async (req, res) => {
  try {
    const { jobId, platform, url } = req.query;

    if (!jobId) {
      return res.status(400).json({ error: 'jobId is required' });
    }

    const resultsPath = path.join(config.storage.resultsDir, `${jobId}-citations.json`);

    if (!await fs.pathExists(resultsPath)) {
      return res.status(404).json({ error: 'Results not found' });
    }

    const results = await fs.readJson(resultsPath);

    // Build trend data grouped by week
    const trends = {};
    
    if (results.citationRates) {
      results.citationRates.forEach(rate => {
        if (platform && rate.platform !== platform) return;
        if (url && rate.url !== url) return;

        if (!trends[rate.week]) {
          trends[rate.week] = {};
        }
        if (!trends[rate.week][rate.platform]) {
          trends[rate.week][rate.platform] = [];
        }
        trends[rate.week][rate.platform].push(rate);
      });
    }

    res.json({ trends });

  } catch (error) {
    console.error('Trends fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/citations/history
 * Get list of all citation processing jobs
 */
router.get('/history', async (req, res) => {
  try {
    await fs.ensureDir(config.storage.resultsDir);

    const files = await fs.readdir(config.storage.resultsDir);
    const history = [];

    for (const file of files) {
      if (file.endsWith('-citations.json')) {
        const filePath = path.join(config.storage.resultsDir, file);
        const data = await fs.readJson(filePath);
        const stats = await fs.stat(filePath);
        
        history.push({
          jobId: file.replace('-citations.json', ''),
          timestamp: stats.mtime,
          domain: data.domain || 'unknown',
          totalUrls: data.targetUrls?.length || 0,
          status: data.status || 'completed'
        });
      }
    }

    // Sort by timestamp descending
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ history });

  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/citations/generate-recommendations
 * Generate AI-powered recommendations for citation performance
 */
router.post('/generate-recommendations', async (req, res) => {
  try {
    const { citationData, selectedWeeks = [], selectedUrls = [] } = req.body;

    if (!citationData) {
      return res.status(400).json({ error: 'Citation data is required' });
    }

    console.log('[AI Recommendations] Generating for:', citationData.domain);
    console.log('[AI Recommendations] Weeks filtered:', selectedWeeks.length || 'all');
    console.log('[AI Recommendations] URLs filtered:', selectedUrls.length || 'all');

    // Generate AI recommendations
    const { generateCitationRecommendations } = require('../services/citationRecommendationAI');
    const result = await generateCitationRecommendations(citationData, selectedWeeks, selectedUrls);

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

module.exports = router;

