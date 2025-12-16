/**
 * Content Analyzer Service
 * Integrates with Puppeteer to analyze content with/without JavaScript
 * This wraps the existing tokowaka-utilities functionality
 */

const path = require('path');
const fs = require('fs-extra');
const { spawn } = require('child_process');

// Path to the existing tokowaka-utilities tool
// NOTE: This file is legacy - hybridContentAnalyzer.js is now used instead
// Uses environment variable if set, otherwise defaults to bundled version
const TOKOWAKA_PATH = process.env.TOKOWAKA_PATH || 
  path.join(__dirname, '..', '..', 'external-tools', 'tokowaka-utilities');
const config = require('../utils/config');
const RESULTS_DIR = config.storage.resultsDir;

// In-memory job status tracking
const jobs = new Map();

/**
 * Run content analysis on URLs
 * @param {string} jobId - Unique job identifier
 * @param {Array<string>} urls - Array of URLs to analyze
 * @param {Object} options - Analysis options
 */
async function runContentAnalysis(jobId, urls, options = {}) {
  try {
    // Initialize job status
    jobs.set(jobId, {
      jobId,
      status: 'running',
      progress: 0,
      total: urls.length,
      startTime: new Date().toISOString(),
      results: []
    });

    // Create temporary CSV file with URLs
    const tempDir = path.join(RESULTS_DIR, 'temp');
    await fs.ensureDir(tempDir);
    
    const tempCSV = path.join(tempDir, `${jobId}-urls.csv`);
    const csvContent = 'URL\n' + urls.join('\n');
    await fs.writeFile(tempCSV, csvContent);

    // Prepare command to run the analysis
    // This calls the existing main.js from tokowaka-utilities
    const args = ['main.js', '--csv', tempCSV];
    
    if (options.aikey) {
      args.push(`--aikey=${options.aikey}`);
    }

    // Run the analysis as a child process
    const analysisProcess = spawn('node', args, {
      cwd: TOKOWAKA_PATH,
      env: { ...process.env, NODE_ENV: 'production' }
    });

    let outputData = '';
    let errorData = '';

    analysisProcess.stdout.on('data', (data) => {
      outputData += data.toString();
      console.log(`[Job ${jobId}] ${data}`);
      
      // Try to parse progress if available
      // (You could enhance main.js to output progress in a parseable format)
      updateJobProgress(jobId);
    });

    analysisProcess.stderr.on('data', (data) => {
      errorData += data.toString();
      console.error(`[Job ${jobId}] Error: ${data}`);
    });

    analysisProcess.on('close', async (code) => {
      if (code === 0) {
        // Analysis completed successfully
        // Look for the output file in tokowaka-utilities/output directory
        const outputDir = path.join(TOKOWAKA_PATH, 'output');
        const outputFiles = await fs.readdir(outputDir);
        
        // Find the most recent JSON output
        const jsonFiles = outputFiles
          .filter(f => f.endsWith('.json'))
          .sort((a, b) => {
            const statA = fs.statSync(path.join(outputDir, a));
            const statB = fs.statSync(path.join(outputDir, b));
            return statB.mtime - statA.mtime;
          });

        let results = [];
        if (jsonFiles.length > 0) {
          const latestOutput = path.join(outputDir, jsonFiles[0]);
          results = await fs.readJson(latestOutput);
        }

        // Save results to our results directory
        const resultsPath = path.join(RESULTS_DIR, `${jobId}.json`);
        await fs.writeJson(resultsPath, {
          jobId,
          status: 'completed',
          completedAt: new Date().toISOString(),
          urlCount: urls.length,
          results
        }, { spaces: 2 });

        // Update job status
        jobs.set(jobId, {
          ...jobs.get(jobId),
          status: 'completed',
          progress: 100,
          completedAt: new Date().toISOString(),
          results
        });

        // Clean up temp file
        await fs.remove(tempCSV);
      } else {
        // Analysis failed
        jobs.set(jobId, {
          ...jobs.get(jobId),
          status: 'failed',
          error: errorData || `Process exited with code ${code}`,
          completedAt: new Date().toISOString()
        });

        // Save error results
        const resultsPath = path.join(RESULTS_DIR, `${jobId}.json`);
        await fs.writeJson(resultsPath, {
          jobId,
          status: 'failed',
          error: errorData || `Process exited with code ${code}`,
          completedAt: new Date().toISOString()
        }, { spaces: 2 });
      }
    });

  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);
    jobs.set(jobId, {
      ...jobs.get(jobId),
      status: 'failed',
      error: error.message,
      completedAt: new Date().toISOString()
    });
  }
}

/**
 * Update job progress (helper function)
 */
function updateJobProgress(jobId) {
  const job = jobs.get(jobId);
  if (job && job.status === 'running') {
    // Increment progress (this is a simplified version)
    // In a real implementation, you'd parse actual progress from the child process
    job.progress = Math.min(job.progress + 1, job.total);
    jobs.set(jobId, job);
  }
}

/**
 * Get job status
 * @param {string} jobId - Job identifier
 * @returns {Object|null} Job status or null if not found
 */
async function getJobStatus(jobId) {
  // First check in-memory
  if (jobs.has(jobId)) {
    return jobs.get(jobId);
  }

  // Check if results file exists
  const resultsPath = path.join(RESULTS_DIR, `${jobId}.json`);
  if (await fs.pathExists(resultsPath)) {
    const results = await fs.readJson(resultsPath);
    return {
      jobId,
      status: results.status || 'completed',
      completedAt: results.completedAt,
      urlCount: results.urlCount,
      hasResults: true
    };
  }

  return null;
}

/**
 * Cancel a running job
 * @param {string} jobId - Job identifier
 */
async function cancelJob(jobId) {
  const job = jobs.get(jobId);
  if (job && job.status === 'running') {
    // In a real implementation, you'd kill the child process
    job.status = 'cancelled';
    job.completedAt = new Date().toISOString();
    jobs.set(jobId, job);
    return true;
  }
  return false;
}

module.exports = {
  runContentAnalysis,
  getJobStatus,
  cancelJob
};

