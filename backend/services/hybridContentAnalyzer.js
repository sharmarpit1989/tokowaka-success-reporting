/**
 * Hybrid Content Analyzer Service
 * Combines EXPERIMENTAL_llm-presence-tracker (LLM presence scoring) 
 * with COMPLETE_tokowaka-utilities (prompt generation)
 */

const path = require('path');
const fs = require('fs-extra');
const cheerio = require('cheerio');

// Import utilities
const config = require('../utils/config');
const { createServiceLogger } = require('../utils/logger');
const browserPool = require('../utils/browserPool');
const { AnalysisError } = require('../utils/errors');
const { acquireSlot, handleRateLimitError } = require('../utils/rateLimiter');

const logger = createServiceLogger('hybrid-analyzer');

// Paths to external tools
const LLM_TRACKER_PATH = config.externalTools.llmTrackerPath;
const RESULTS_DIR = config.storage.resultsDir;

logger.info('Using LLM Tracker at:', { path: LLM_TRACKER_PATH });

// Import LLM Presence Tracker
const llmTracker = require(path.join(LLM_TRACKER_PATH, 'main.js'));

// Azure OpenAI configuration for prompt generation
// Note: Read from process.env to ensure we get the latest value
const AZURE_OPENAI_ENDPOINT = config.azure.endpoint || process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = config.azure.apiKey || process.env.AZURE_OPENAI_KEY;
const AZURE_API_VERSION = config.azure.apiVersion || process.env.AZURE_API_VERSION;
const AZURE_COMPLETION_DEPLOYMENT = config.azure.deployment || process.env.AZURE_COMPLETION_DEPLOYMENT;

// In-memory job status tracking
const jobs = new Map();

/**
 * Extract main content from HTML (smart extraction, not blind truncation)
 * Focuses on actual article/page content, removes boilerplate
 */
function extractMainContent(html) {
  const $ = cheerio.load(html);
  
  // Remove non-content elements
  $('script, style, noscript, svg, iframe').remove();
  
  // Try to find main content area (in order of preference)
  let mainContent = $('main').first();
  if (mainContent.length === 0) mainContent = $('article').first();
  if (mainContent.length === 0) mainContent = $('[role="main"]').first();
  if (mainContent.length === 0) mainContent = $('#content, #main, .content, .main').first();
  if (mainContent.length === 0) mainContent = $('body');
  
  // Extract structured content with priorities
  const contentParts = [];
  
  // 1. Page title (highest priority)
  const title = $('h1').first().text().trim();
  if (title) contentParts.push(`TITLE: ${title}`);
  
  // 2. Meta description
  const metaDesc = $('meta[name="description"]').attr('content');
  if (metaDesc) contentParts.push(`DESCRIPTION: ${metaDesc}`);
  
  // 3. All headings (structure is important)
  mainContent.find('h1, h2, h3, h4, h5, h6').each((i, elem) => {
    const heading = $(elem).text().trim();
    const level = elem.name.toUpperCase();
    if (heading && heading.length < 200 && heading.length > 2) {
      contentParts.push(`${level}: ${heading}`);
    }
  });
  
  // 4. Paragraphs (first 3 sentences of each, or full if short)
  mainContent.find('p').each((i, elem) => {
    const para = $(elem).text().trim();
    if (para && para.length > 20) {
      // Take first 3 sentences or 300 chars
      const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
      const excerpt = sentences.slice(0, 3).join(' ').substring(0, 300);
      if (excerpt) contentParts.push(excerpt);
    }
  });
  
  // 5. Lists (important for feature descriptions)
  mainContent.find('ul, ol').each((i, elem) => {
    const listItems = $(elem).find('li').map((j, li) => {
      const text = $(li).text().trim();
      return text.length > 5 && text.length < 150 ? `• ${text}` : null;
    }).get().filter(Boolean);
    
    if (listItems.length > 0 && listItems.length < 30) {
      contentParts.push(listItems.slice(0, 15).join('\n'));
    }
  });
  
  // 6. Divs with substantial text (for JS-heavy pages)
  if (contentParts.length < 10) {
    mainContent.find('div').each((i, elem) => {
      const divText = $(elem).clone().children().remove().end().text().trim();
      if (divText && divText.length > 50 && divText.length < 500) {
        contentParts.push(divText);
      }
    });
  }
  
  // 7. Join and check if we have enough content
  let extracted = contentParts.join('\n\n');
  
  // ⚡ IMPROVED FALLBACK: If extraction resulted in too little content (< 1000 chars)
  if (extracted.length < 1000) {
    logger.warn(`Smart extraction yielded only ${extracted.length} chars, using aggressive fallback`, { 
      extractedLength: extracted.length 
    });
    
    // More aggressive fallback - don't remove much, just get the text
    // Only remove obviously non-content elements
    $('script, style, noscript').remove();
    $('[class*="cookie"], [class*="popup"], [class*="modal"]').remove();
    
    // Extract from body, preserving more structure
    extracted = $('body').text()
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .trim()
      .substring(0, 15000);  // Take first 15K chars (increased from 12K)
    
    logger.info(`Fallback extraction complete: ${extracted.length} chars`);
  }
  
  // If still too long, truncate intelligently
  if (extracted.length > 15000) {
    extracted = extracted.substring(0, 15000) + '...';
  }
  
  // Final safety check - ensure SOME content
  if (extracted.length < 200) {
    logger.error(`Still too little content after all fallbacks: ${extracted.length} chars`);
    // Last resort - just grab everything from body
    extracted = $('body').text()
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 10000) || 'Error: Could not extract content from page';
  }
  
  logger.debug(`Final extracted content length: ${extracted.length} chars`);
  return extracted;
}

/**
 * Extract text content from HTML using Cheerio (fallback for simple extraction)
 */
function extractTextContent(html) {
  // Use smart extraction instead
  return extractMainContent(html);
}

/**
 * Parse AI insights JSON into structured recommendations
 * AI now returns JSON format: { "recommendations": ["rec1", "rec2", ...] }
 */
function parseAIRecommendations(aiInsights) {
  if (!aiInsights || aiInsights.includes('AI insights not available')) {
    return [];
  }

  try {
    // Try to parse as JSON (new format)
    const parsed = JSON.parse(aiInsights);
    
    if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
      return parsed.recommendations
        .filter(rec => rec && typeof rec === 'string' && rec.length > 20)
        .slice(0, 10);  // Limit to 10 max
    }
    
    // If JSON doesn't have the expected structure
    logger.warn('AI insights JSON missing recommendations array', { aiInsights: aiInsights.substring(0, 200) });
    return [];
    
  } catch (jsonError) {
    // If JSON parsing fails, try to extract JSON from surrounding text
    logger.warn('Failed to parse AI insights as JSON, attempting to extract', { error: jsonError.message });
    
    try {
      // Look for JSON object in the response (sometimes AI adds text before/after)
      const jsonMatch = aiInsights.match(/\{[\s\S]*"recommendations"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
          return parsed.recommendations
            .filter(rec => rec && typeof rec === 'string' && rec.length > 20)
            .slice(0, 10);
        }
      }
    } catch (extractError) {
      logger.error('Failed to extract JSON from AI insights', { error: extractError.message });
    }
    
    // Last resort: return error message
    logger.error('AI did not return valid JSON format', { 
      aiInsights: aiInsights.substring(0, 500),
      error: jsonError.message 
    });
    
    return ['AI recommendations unavailable - invalid response format'];
  }
}

/**
 * Generate AI prompts (Awareness, Consideration, Conversion)
 * Extracted from COMPLETE_tokowaka-utilities
 */
async function generatePrompts(textContent) {
  logger.info('[generatePrompts] Called', { 
    hasKey: !!AZURE_OPENAI_KEY, 
    textLength: textContent?.length || 0 
  });
  
  if (!AZURE_OPENAI_KEY) {
    logger.warn('[generatePrompts] No Azure OpenAI key available');
    return {
      summary: 'AI prompt generation not available (no Azure OpenAI key)',
      awarenessQuestions: [],
      considerationQuestions: [],
      conversionQuestions: []
    };
  }

  try {
    logger.info('[generatePrompts] Starting prompt generation with Azure OpenAI');
    const prompt = `Analyze this webpage content and generate natural user questions.

TASK:
Generate 2 questions for each category (Awareness, Consideration, Conversion) based ONLY on what the content actually covers.

CATEGORIES:
- Awareness: Learning/discovering this topic (e.g., "How does X work?", "What is X?")
- Consideration: Comparing options or evaluating fit (e.g., "Which X is best for...", "X vs Y comparison")
- Conversion: Taking action/implementing (e.g., "How much does X cost?", "How do I start with X?")

RULES:
- Use natural, conversational language (how real people search)
- Use generic category terms only (e.g., "content management system" not brand names)
- Each question must be supported by a quote from the content
- If a category isn't covered, write "Not Found"
- Keep questions simple and practical

OUTPUT FORMAT:
Summary: [2-3 sentences on main topic and LLM discoverability]

Awareness:
[Question 1] — "[Quote from content]"
[Question 2] — "[Quote from content]"
OR "Not Found"

Consideration:
[Question 1] — "[Quote from content]"
[Question 2] — "[Quote from content]"
OR "Not Found"

Conversion:
[Question 1] — "[Quote from content]"
[Question 2] — "[Quote from content]"
OR "Not Found"

CONTENT:
${textContent}`;

    // Acquire rate limit slot for Azure OpenAI
    await acquireSlot('azureOpenAI');
    logger.debug('Rate limit slot acquired for Azure OpenAI');

    const response = await fetch(`${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_COMPLETION_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_OPENAI_KEY
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are an expert in analyzing content for LLM discoverability and generating relevant user questions.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      // Handle rate limit errors
      const error = new Error(`Azure OpenAI API error: ${response.status}`);
      error.status = response.status;
      error.headers = response.headers;
      
      if (handleRateLimitError('azureOpenAI', error)) {
        logger.warn('Rate limit detected, will retry with backoff');
      }
      
      throw new Error(`Azure OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const llmResponse = data.choices[0].message.content;
    logger.info('[generatePrompts] Received LLM response', { responseLength: llmResponse?.length || 0 });
    logger.info('[generatePrompts] Raw response preview:', { preview: llmResponse.substring(0, 500) });

    // Parse the response
    const parsed = parsePromptResponse(llmResponse);
    logger.info('[generatePrompts] Parsed prompts', { 
      hasSummary: !!parsed.summary,
      awarenessCount: parsed.awarenessQuestions?.length || 0,
      considerationCount: parsed.considerationQuestions?.length || 0,
      conversionCount: parsed.conversionQuestions?.length || 0
    });
    return parsed;

  } catch (error) {
    logger.error('Prompt generation error', { error: error.message });
    return {
      summary: `Error generating prompts: ${error.message}`,
      awarenessQuestions: [],
      considerationQuestions: [],
      conversionQuestions: []
    };
  }
}

/**
 * Parse LLM response to extract summary and questions
 */
function parsePromptResponse(llmResponse) {
  const result = {
    summary: '',
    awarenessQuestions: [],
    considerationQuestions: [],
    conversionQuestions: []
  };

  // Extract summary (handle both same-line and next-line formats)
  const summaryMatch = llmResponse.match(/Summary:\s*(.+?)(?=\n\n|Awareness:|$)/s);
  if (summaryMatch) {
    result.summary = summaryMatch[1].trim();
  }

  // Extract questions by section (more flexible matching)
  const awarenessMatch = llmResponse.match(/Awareness:\s*(.+?)(?=\n\n|Consideration:|$)/s);
  const considerationMatch = llmResponse.match(/Consideration:\s*(.+?)(?=\n\n|Conversion:|$)/s);
  const conversionMatch = llmResponse.match(/Conversion:\s*(.+?)$/s);

  if (awarenessMatch && !awarenessMatch[1].includes('Not Found')) {
    result.awarenessQuestions = extractQuestions(awarenessMatch[1]);
  }

  if (considerationMatch && !considerationMatch[1].includes('Not Found')) {
    result.considerationQuestions = extractQuestions(considerationMatch[1]);
  }

  if (conversionMatch && !conversionMatch[1].includes('Not Found')) {
    result.conversionQuestions = extractQuestions(conversionMatch[1]);
  }

  return result;
}

/**
 * Extract individual questions from a section
 */
function extractQuestions(sectionText) {
  const questions = [];
  const lines = sectionText.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    // Match patterns like "Question text — "Supporting text""
    const match = line.match(/^(.+?)\s*—\s*"(.+?)"$/);
    if (match) {
      questions.push({
        question: match[1].trim(),
        support: match[2].trim()
      });
    } else if (line.trim() && !line.includes('—')) {
      // Simple question without support text
      questions.push({
        question: line.trim(),
        support: ''
      });
    }
  }
  
  return questions;
}

/**
 * Analyze a single URL using LLM Presence Tracker + Prompt Generation
 */
async function analyzeSingleUrl(browser, url, aiKey) {
  logger.info('Analyzing URL', { url });
  
  // Acquire rate limit slot for website scraping
  await acquireSlot('websiteScraping');
  logger.info('Rate limit slot acquired for website scraping', { url });
  
  let browserForLLM = browser;
  let createdBrowserForLLM = false;

  try {
    // Browser is now always provided by the pool
    if (!browserForLLM) {
      throw new AnalysisError('Browser instance not provided', url);
    }

    // Use LLM Presence Tracker to analyze the URL
    // ⚡ OPTIMIZATION: Skip AI insights initially for 2x faster analysis
    // Insights can be generated on-demand later
    logger.debug('Calling LLM Presence Tracker (skipping AI insights)', { url });
    
    // Temporarily disable AI insights by unsetting the Azure key
    const originalAzureKey = process.env.AZURE_OPENAI_KEY;
    delete process.env.AZURE_OPENAI_KEY;
    
    const llmResult = await llmTracker.analyzeUrl(
      browserForLLM, 
      url, 
      new Date().toISOString(),
      {}, // searchQueryData 
      false // disableLearning
    );
    
    // Restore Azure key for prompt generation
    if (originalAzureKey) {
      process.env.AZURE_OPENAI_KEY = originalAzureKey;
    }
    
    if (!llmResult.success) {
      throw new AnalysisError(llmResult.error || 'LLM Presence Tracker failed', url);
    }

    const analysis = llmResult.analysis;
    logger.info('LLM analysis complete (without AI insights)', {
      url,
      score: (analysis.llm_presence_score * 100).toFixed(1) + '%',
      hasInsights: false // AI insights skipped
    });

    // Now extract text content for prompt generation using the same browser
    logger.debug('Extracting content for prompt generation', { url });
    
    let htmlContent, textContent, title, prompts;
    let page = null;
    
    try {
      page = await browserForLLM.newPage();
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Try to navigate with retries for HTTP2 errors
      let navigationSuccess = false;
      const maxRetries = 3; // Increased from 2 to 3
      let lastError = null;
      
      for (let attempt = 1; attempt <= maxRetries && !navigationSuccess; attempt++) {
        try {
          logger.debug(`Attempting navigation to ${url} (attempt ${attempt}/${maxRetries})`);
          
          // Progressive fallback strategy for HTTP/2 errors
          let gotoOptions = { timeout: config.puppeteer.timeout };
          
          if (attempt === 1) {
            // First attempt: Use domcontentloaded (more reliable for modern sites)
            gotoOptions.waitUntil = 'domcontentloaded';
          } else if (attempt === 2) {
            // Second attempt: Disable HTTP/2 with headers + domcontentloaded
            logger.debug('Using HTTP/2 workaround', { url, attempt });
            await page.setExtraHTTPHeaders({
              'Connection': 'close',
              'HTTP2-Settings': '' // Hint to not use HTTP/2
            });
            gotoOptions.waitUntil = 'domcontentloaded';
          } else {
            // Third attempt: Most aggressive fallback
            logger.debug('Using most aggressive fallback (load event)', { url, attempt });
            await page.setExtraHTTPHeaders({
              'Connection': 'close',
              'HTTP2-Settings': '',
              'Upgrade-Insecure-Requests': '1'
            });
            gotoOptions.waitUntil = 'load'; // Wait for load event only
            gotoOptions.timeout = 20000; // Shorter timeout
          }
          
          await page.goto(url, gotoOptions);
          
          navigationSuccess = true;
          logger.debug('Navigation successful', { url, attempt });
          
        } catch (navError) {
          lastError = navError;
          logger.warn(`Navigation attempt ${attempt} failed`, { 
            url, 
            error: navError.message,
            errorCode: navError.message.includes('ERR_') ? navError.message.match(/ERR_[A-Z0-9_]+/)?.[0] : 'unknown',
            willRetry: attempt < maxRetries
          });
          
          // Wait before retrying (exponential backoff)
          if (attempt < maxRetries) {
            const waitTime = Math.min(1000 * attempt, 3000); // 1s, 2s, 3s max
            logger.debug(`Waiting ${waitTime}ms before retry`, { url, attempt });
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }
      
      // Extract content if navigation was successful, or handle gracefully if it failed
      if (navigationSuccess) {
        htmlContent = await page.content();
        const rawHtmlSize = htmlContent.length;
        textContent = extractTextContent(htmlContent);
        title = await page.title();
        
        // Log content reduction
        logger.info('Smart content extraction complete', { 
          url, 
          rawHtmlSize, 
          extractedSize: textContent.length,
          reduction: `${((1 - textContent.length / rawHtmlSize) * 100).toFixed(1)}%`
        });
        
        // Generate AI prompts (awareness, consideration, conversion)
        logger.info('Generating AI prompts', { url, textLength: textContent.length });
        prompts = await generatePrompts(textContent);
        logger.info('Prompts generated', {
          url,
          summary: prompts.summary ? 'present' : 'empty',
          awareness: prompts.awarenessQuestions?.length || 0,
          consideration: prompts.considerationQuestions?.length || 0,
          conversion: prompts.conversionQuestions?.length || 0
        });
      } else {
        // Navigation failed after all retries
        const errorMsg = lastError?.message || 'Unknown error';
        const isHTTP2Error = errorMsg.includes('ERR_HTTP2_PROTOCOL_ERROR');
        
        logger.error(`Failed to load page after ${maxRetries} attempts`, {
          url,
          error: errorMsg,
          errorType: isHTTP2Error ? 'HTTP2_PROTOCOL_ERROR' : 'OTHER',
          suggestion: isHTTP2Error ? 'Server may have HTTP/2 connection issues' : 'Check URL accessibility'
        });
        
        // Create partial data - analysis succeeded but prompts failed
        htmlContent = '';
        textContent = `Analysis completed but could not generate detailed prompts due to page loading issues: ${errorMsg}`;
        title = 'Page loading failed';
        prompts = {
          summary: `Could not load page: ${isHTTP2Error ? 'HTTP/2 protocol error - server connection issue' : errorMsg}`,
          awarenessQuestions: [],
          considerationQuestions: [],
          conversionQuestions: []
        };
        
        logger.warn('Returning partial results - LLM analysis succeeded but prompt generation failed', { url });
      }
      
    } catch (pageError) {
      // If prompt generation fails, we still have the LLM scores
      logger.warn('Failed to generate prompts, but LLM analysis succeeded', { 
        url, 
        error: pageError.message 
      });
      
      // Use fallback values
      title = analysis.pageType?.primary || 'Unknown Page';
      prompts = {
        summary: `Analysis completed but could not generate detailed prompts due to page loading issues: ${pageError.message}`,
        awarenessQuestions: [],
        considerationQuestions: [],
        conversionQuestions: []
      };
    } finally {
      // Clean up page if it was created
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          logger.debug('Error closing page (non-critical)', { url, error: closeError.message });
        }
      }
    }

    // Combine all data
    return {
      url,
      title,
      timestamp: analysis.timestamp || new Date().toISOString(),
      
      // Full LLM Presence Scores from EXPERIMENTAL_llm-presence-tracker
      llmPresence: {
        overallScore: analysis.llm_presence_score || 0,
        rating: analysis.interpretation?.rating || 'Unknown',
        pageType: analysis.pageType?.primary || 'Unknown',
        freshness: analysis.metrics?.freshness?.score || 0,
        answerability: analysis.metrics?.answerability?.score || 0,
        queryAlignment: analysis.metrics?.queryAlignment?.score || 0,
        authority: analysis.metrics?.authority?.score || 0,
        structure: analysis.metrics?.structure?.score || 0,
        snippetQuality: analysis.metrics?.snippetQuality?.score || 0
      },
      
      // Detailed metrics for info tooltips
      details: {
        freshness: analysis.metrics?.freshness || {},
        answerability: analysis.metrics?.answerability || {},
        queryAlignment: analysis.metrics?.queryAlignment || {},
        authority: analysis.metrics?.authority || {},
        structure: analysis.metrics?.structure || {},
        snippetQuality: analysis.metrics?.snippetQuality || {}
      },
      
      // AI-powered recommendations (initially empty - can be generated on-demand)
      recommendations: [],
      hasAIInsights: false, // Flag to show "Generate Insights" button
      
      // Raw AI insights for debugging
      aiInsightsRaw: null,
      
      // AI-generated prompts from tokowaka-utilities logic
      prompts: {
        summary: prompts.summary,
        awareness: prompts.awarenessQuestions,
        consideration: prompts.considerationQuestions,
        conversion: prompts.conversionQuestions
      },
      
      // Content stats
      wordCount: analysis.content?.wordCount || 0,
      
      // 💾 Save context for on-demand insights generation (without re-scraping)
      insightsContext: {
        textContent: textContent ? textContent.substring(0, 5000) : '', // First 5K chars
        htmlContent: htmlContent ? htmlContent.substring(0, 10000) : '', // First 10K chars
        pageTypeClassification: analysis.pageType || {},
        appliedWeights: analysis.appliedWeights || {},
        fullAnalysis: {
          metrics: analysis.metrics,
          content: analysis.content,
          interpretation: analysis.interpretation
        }
      }
    };

  } catch (error) {
    logger.error('Error analyzing URL', { 
      url, 
      error: error.message,
      stack: error.stack
    });
    
    return {
      url,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Run hybrid content analysis on URLs
 * @param {string} jobId - Unique job identifier
 * @param {Array<string>} urls - Array of URLs to analyze
 * @param {Object} options - Analysis options
 */
async function runHybridAnalysis(jobId, urls, options = {}) {
  let browser = null;
  
  try {
    logger.info('Starting hybrid analysis job', { jobId, urlCount: urls.length });

    // Initialize job status
    jobs.set(jobId, {
      jobId,
      status: 'running',
      progress: 0,
      total: urls.length,
      startTime: new Date().toISOString(),
      results: []
    });

    // Set Azure OpenAI key if provided
    if (options.aikey) {
      AZURE_OPENAI_KEY = options.aikey;
    }

    // Acquire browser from pool
    browser = await browserPool.acquire();
    logger.debug('Browser acquired from pool', { jobId });

    const results = [];
    let processedCount = 0;

    // Process URLs sequentially (parallel processing can be added later with proper concurrency control)
    for (const url of urls) {
      const result = await analyzeSingleUrl(browser, url, options.aikey);
      results.push(result);
      processedCount++;

      // Update progress
      const progress = Math.round((processedCount / urls.length) * 100);
      jobs.set(jobId, {
        ...jobs.get(jobId),
        progress,
        processedCount
      });

      logger.debug('Analysis progress', { 
        jobId, 
        progress: `${processedCount}/${urls.length}`,
        percentage: `${progress}%`
      });
    }

    // Release browser back to pool
    if (browser) {
      await browserPool.release(browser);
      logger.debug('Browser released to pool', { jobId });
    }

    // Save results with proper error handling
    const resultsPath = path.join(RESULTS_DIR, `${jobId}.json`);
    logger.info('Saving analysis results', { 
      jobId, 
      path: resultsPath,
      resultCount: results.length 
    });
    
    try {
      // Ensure directory exists
      await fs.ensureDir(RESULTS_DIR);
      
      // Save results
      await fs.writeJson(resultsPath, {
        jobId,
        status: 'completed',
        completedAt: new Date().toISOString(),
        urlCount: urls.length,
        results
      }, { spaces: 2 });
      
      logger.info('✅ Results file saved successfully', { 
        jobId,
        path: resultsPath,
        fileSize: (await fs.stat(resultsPath)).size
      });
    } catch (saveError) {
      logger.error('❌ CRITICAL: Failed to save results file!', {
        jobId,
        path: resultsPath,
        error: saveError.message,
        stack: saveError.stack
      });
      throw new Error(`Failed to save analysis results: ${saveError.message}`);
    }

    // Update job status
    jobs.set(jobId, {
      ...jobs.get(jobId),
      status: 'completed',
      progress: 100,
      completedAt: new Date().toISOString(),
      resultsPath  // Store path for debugging
    });

    logger.info('Job completed successfully', { 
      jobId, 
      urlCount: urls.length,
      duration: Date.now() - new Date(jobs.get(jobId).startTime).getTime() + 'ms'
    });

  } catch (error) {
    logger.error('Job failed', { 
      jobId, 
      error: error.message,
      stack: error.stack
    });
    
    // Release browser if still held
    if (browser) {
      try {
        await browserPool.release(browser);
      } catch (releaseError) {
        logger.error('Error releasing browser', { error: releaseError.message });
      }
    }
    
    jobs.set(jobId, {
      ...jobs.get(jobId),
      status: 'failed',
      error: error.message,
      completedAt: new Date().toISOString()
    });

    throw error;
  }
}

/**
 * Get job status
 */
function getJobStatus(jobId) {
  return jobs.get(jobId) || null;
}

module.exports = {
  runHybridAnalysis,
  getJobStatus
};

