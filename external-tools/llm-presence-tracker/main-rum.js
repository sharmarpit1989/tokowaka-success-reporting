#!/usr/bin/env node
/**
 * LLM Presence Tracker - RUM API Integration
 * Automatically analyzes pages using Real User Monitoring data from Adobe RUM API
 * No manual CSV needed - fetches traffic and performance data automatically!
 */

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

// Import RUM API client from spacecat-shared
// Install: npm install @adobe/spacecat-shared-rum-api-client
let RUMAPIClient;
try {
  const rumModule = require('@adobe/spacecat-shared-rum-api-client');
  // Handle both CommonJS and ES module exports
  RUMAPIClient = rumModule.default || rumModule;
} catch (error) {
  console.error('❌ RUM API Client not installed. Run: npm install @adobe/spacecat-shared-rum-api-client');
  process.exit(1);
}

// Import utilities from local utils folder
const { 
  stripTagsToText, 
  extractWordCount,
  hashDJB2, 
  pct,
  setCheerio 
} = require('./utils/utils.js');

// Import LLM presence analyzers
const {
  analyzeLLMPresence,
  calculateFinalScore,
  interpretScore
} = require('./analyzers/index.js');

// Import page type classifier
const { classifyPageType } = require('./analyzers/page-type-classifier.js');

// Import page-type-specific scoring weights
const { calculatePageTypeScore, compareScoring } = require('./analyzers/scoring-weights.js');

// Import examples library for learning from past analyses
const { addExampleToLibrary, getRelevantExamples, getLibraryStats } = require('./analyzers/examples-library.js');

// Initialize cheerio for utils module
setCheerio(cheerio);

/**
 * Simple authority analysis
 */
function analyzeAuthority(url, $) {
  let score = 0;
  
  try {
    const urlObj = new URL(url);
    
    // Check for HTTPS
    if (urlObj.protocol === 'https:') score += 0.20;
    
    // Check for official/authoritative indicators
    const hasAuthorInfo = $('[rel="author"]').length > 0 || 
                         $('meta[name="author"]').length > 0;
    if (hasAuthorInfo) score += 0.15;
    
    // Check for external links (shows research/citations)
    const externalLinks = $('a[href^="http"]').filter((i, el) => {
      const href = $(el).attr('href');
      return href && !href.includes(urlObj.hostname);
    }).length;
    if (externalLinks >= 3) score += 0.20;
    else if (externalLinks >= 1) score += 0.10;
    
    // Check for structured data (JSON-LD)
    if ($('script[type="application/ld+json"]').length > 0) score += 0.15;
    
    // Check for schema.org markup
    if ($('[itemscope]').length > 0) score += 0.10;
    
    // Check for privacy policy / terms (trust signals)
    const hasPolicyLinks = $('a[href*="privacy"], a[href*="terms"]').length > 0;
    if (hasPolicyLinks) score += 0.10;
    
  } catch (e) {
    logger.warning(`Authority analysis error: ${e.message}`);
  }
  
  return Math.min(1.0, score);
}

/**
 * Simple structure analysis
 */
function analyzeStructure($, text) {
  let score = 0;
  
  // Word count (ideal range)
  const wordCount = extractWordCount($.html()).word_count;
  if (wordCount >= 300 && wordCount <= 2000) {
    score += 0.30;
  } else if (wordCount >= 150 && wordCount <= 3000) {
    score += 0.20;
  } else if (wordCount >= 100) {
    score += 0.10;
  }
  
  // Paragraph count
  const paragraphCount = $('p').length;
  if (paragraphCount >= 3 && paragraphCount <= 20) {
    score += 0.20;
  } else if (paragraphCount >= 2) {
    score += 0.10;
  }
  
  // Heading structure
  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;
  
  if (h1Count === 1 && h2Count >= 2) score += 0.20;
  else if (h1Count >= 1) score += 0.10;
  
  // Lists (good for LLMs)
  const listCount = $('ul, ol').length;
  if (listCount >= 2) score += 0.15;
  else if (listCount >= 1) score += 0.10;
  
  // Tables (structured data)
  if ($('table').length >= 1) score += 0.15;
  
  return Math.min(1.0, score);
}

// Azure OpenAI configuration (optional)
let AZURE_OPENAI_ENDPOINT = 'https://aem-sites-1-genai-us-east-2.openai.azure.com';
let AZURE_OPENAI_KEY = null;
const AZURE_API_VERSION = '2024-02-01';
const AZURE_COMPLETION_DEPLOYMENT = 'gpt-4o';

// Concurrency for parallel processing
const CONCURRENCY = 5;

// Logger (compatible with RUM API client)
const logger = {
  info: (message) => console.log(`${new Date().toISOString()} - INFO - ${message}`),
  error: (message) => console.error(`${new Date().toISOString()} - ERROR - ${message}`),
  warning: (message) => console.warn(`${new Date().toISOString()} - WARNING - ${message}`),
  warn: (message) => console.warn(`${new Date().toISOString()} - WARNING - ${message}`),
  debug: (message) => {}, // Silent debug
  log: (message) => console.log(`${new Date().toISOString()} - ${message}`)
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    domain: null,
    days: 30,
    minTraffic: 1000,
    maxUrls: 50,
    mode: 'analyze', // 'analyze' or 'opportunities'
    outputDir: 'output',
    aiKey: null,
    granularity: 'daily',
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--domain':
      case '-d':
        options.domain = nextArg;
        i++;
        break;
      case '--days':
        options.days = parseInt(nextArg, 10);
        i++;
        break;
      case '--min-traffic':
        options.minTraffic = parseInt(nextArg, 10);
        i++;
        break;
      case '--max-urls':
        options.maxUrls = parseInt(nextArg, 10);
        i++;
        break;
      case '--mode':
      case '-m':
        options.mode = nextArg;
        i++;
        break;
      case '--output-dir':
        options.outputDir = nextArg;
        i++;
        break;
      case '--aikey':
        options.aiKey = nextArg;
        i++;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }

  return options;
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
🚀 LLM Presence Tracker - RUM API Integration

USAGE:
  node main-rum.js --domain <domain> [options]

OPTIONS:
  --domain, -d <domain>     Domain to analyze (required)
                            Example: www.example.com
  
  --days <number>           Number of days to fetch data (default: 30)
  
  --min-traffic <number>    Minimum pageviews to analyze (default: 1000)
  
  --max-urls <number>       Maximum URLs to analyze (default: 50)
  
  --mode, -m <mode>         Analysis mode: 'analyze' or 'opportunities'
                            - analyze: Full LLM presence analysis
                            - opportunities: Find high-traffic low-engagement pages
                            (default: analyze)
  
  --output-dir <dir>        Output directory (default: output)
  
  --aikey <key>             Azure OpenAI API key for AI insights (optional)
  
  --help, -h                Show this help message

ENVIRONMENT VARIABLES:
  RUM_ADMIN_KEY             RUM API admin key (required)
  AZURE_OPENAI_KEY          Azure OpenAI API key (alternative to --aikey)

EXAMPLES:
  # Basic analysis
  node main-rum.js --domain www.example.com

  # Analyze last 7 days, high-traffic pages only
  node main-rum.js --domain www.example.com --days 7 --min-traffic 10000

  # Find optimization opportunities
  node main-rum.js --domain www.example.com --mode opportunities

  # With AI insights
  node main-rum.js --domain www.example.com --aikey YOUR_KEY

WHAT IT DOES:
  1. Fetches real traffic data from Adobe RUM API
  2. Gets pageviews, organic traffic, Core Web Vitals
  3. Prioritizes pages by traffic and engagement
  4. Analyzes LLM presence for top pages
  5. Generates comprehensive reports

BENEFITS VS MANUAL CSV:
  ✅ No manual CSV creation
  ✅ Real-time traffic data
  ✅ Core Web Vitals included
  ✅ Bounce rate correlation
  ✅ Smart prioritization
`);
}

/**
 * Fetch URLs from RUM API
 */
async function fetchUrlsFromRUM(domain, days, minTraffic) {
  logger.info(`Fetching RUM data for ${domain} (last ${days} days)...`);

  // Check for RUM_ADMIN_KEY
  if (!process.env.RUM_ADMIN_KEY) {
    throw new Error('RUM_ADMIN_KEY environment variable not set. Please set it to your RUM admin key.');
  }

  // Initialize RUM client
  const rumClient = RUMAPIClient.createFrom({ 
    env: process.env,
    log: logger 
  });

  try {
    // Fetch Core Web Vitals (includes traffic data)
    const opts = {
      domain: domain,
      interval: days,
      granularity: 'daily'
    };
    
    // If user has a domain-specific key instead of admin key, they can set it here
    if (process.env.RUM_DOMAIN_KEY) {
      opts.domainkey = process.env.RUM_DOMAIN_KEY;
      logger.info(`Using domain-specific key for ${domain}`);
    }

    logger.info('Querying RUM API for Core Web Vitals...');
    const cwvData = await rumClient.query('cwv', opts);

    // Debug: Show what RUM returned
    logger.info(`RUM API returned ${cwvData?.length || 0} total records`);
    if (cwvData && cwvData.length > 0) {
      const urlRecords = cwvData.filter(item => item.type === 'url');
      const groupRecords = cwvData.filter(item => item.type === 'group');
      logger.info(`  - ${urlRecords.length} individual URLs`);
      logger.info(`  - ${groupRecords.length} URL groups/patterns`);
      
      // Show first few URLs for debugging
      if (urlRecords.length > 0) {
        logger.info(`Sample URLs from RUM:`);
        urlRecords.slice(0, 5).forEach((item, idx) => {
          logger.info(`  ${idx + 1}. ${item.url} (${item.pageviews} views)`);
        });
      }
    }

    if (!cwvData || cwvData.length === 0) {
      logger.warning('No RUM data found for this domain');
      return [];
    }

    // Fetch engagement data
    logger.info('Querying RUM API for engagement metrics...');
    let engagementData = [];
    try {
      engagementData = await rumClient.query('engagement', opts);
    } catch (error) {
      logger.warning(`Could not fetch engagement data: ${error.message}`);
      logger.info('Continuing without engagement metrics...');
    }

    // Process and enrich URLs
    const urls = cwvData
      .filter(item => item.type === 'url') // Only individual URLs, not groups
      .map(item => {
        const engagement = engagementData.find(e => e.url === item.url);
        
        // Calculate priority score (higher = more important)
        const organicRatio = item.organic / item.pageviews;
        const trafficScore = Math.log10(item.pageviews) * 100; // Log scale
        const organicScore = organicRatio * 100;
        const engagementScore = engagement ? (100 - engagement.engagementPercentage) : 50;
        
        const priorityScore = (trafficScore * 0.5) + (organicScore * 0.3) + (engagementScore * 0.2);

        return {
          url: item.url,
          pageviews: item.pageviews,
          organic: item.organic,
          organicRatio: organicRatio,
          engagement: engagement ? engagement.engagementPercentage : null,
          bounceRate: engagement ? (100 - engagement.engagementPercentage) : null,
          priorityScore: priorityScore,
          cwv: {
            lcp: item.metrics?.[0]?.lcp || null,
            cls: item.metrics?.[0]?.cls || null,
            inp: item.metrics?.[0]?.inp || null,
            ttfb: item.metrics?.[0]?.ttfb || null
          }
        };
      })
      .filter(item => item.pageviews >= minTraffic) // Filter by minimum traffic
      .sort((a, b) => b.priorityScore - a.priorityScore); // Sort by priority

    logger.info(`Found ${urls.length} URLs with traffic >= ${minTraffic} pageviews`);

    return urls;

  } catch (error) {
    logger.error(`RUM API error: ${error.message}`);
    throw error;
  }
}

/**
 * Find optimization opportunities
 */
async function findOpportunities(domain, days) {
  logger.info(`Finding optimization opportunities for ${domain}...`);

  const rumClient = RUMAPIClient.createFrom({ 
    env: process.env,
    log: logger 
  });

  const opts = {
    domain: domain,
    interval: days
  };

  try {
    // Query for high organic traffic with low CTR
    logger.info('Finding high-organic, low-CTR pages...');
    const highOrganicLowCTR = await rumClient.query('high-organic-low-ctr', {
      ...opts,
      maxOpportunities: 20
    });

    // Query for high inorganic traffic with high bounce rate
    logger.info('Finding high-inorganic, high-bounce-rate pages...');
    const highInorganicHighBounce = await rumClient.query('high-inorganic-high-bounce-rate', opts);

    logger.info('\n📊 OPTIMIZATION OPPORTUNITIES FOUND:\n');

    console.log('🎯 High Organic Traffic, Low Click-Through Rate:');
    console.log('   (These pages rank well but users don\'t click - improve titles/snippets!)');
    highOrganicLowCTR.slice(0, 10).forEach((opp, idx) => {
      const traffic = opp.metrics.find(m => m.type === 'traffic')?.value || {};
      const ctr = opp.metrics.find(m => m.type === 'ctr')?.value || {};
      
      console.log(`\n   ${idx + 1}. ${opp.page}`);
      console.log(`      Pageviews: ${opp.pageViews.toLocaleString()}`);
      console.log(`      Organic: ${traffic.owned?.toLocaleString() || 'N/A'}`);
      console.log(`      CTR: ${(ctr.page * 100).toFixed(2)}%`);
      console.log(`      Site Average CTR: ${(opp.trackedKPISiteAverage * 100).toFixed(2)}%`);
    });

    console.log('\n\n💸 High Paid Traffic, High Bounce Rate:');
    console.log('   (Expensive traffic that bounces - optimize landing pages!)');
    highInorganicHighBounce.slice(0, 10).forEach((opp, idx) => {
      const traffic = opp.metrics.find(m => m.type === 'traffic')?.value || {};
      
      console.log(`\n   ${idx + 1}. ${opp.page}`);
      console.log(`      Pageviews: ${opp.pageViews.toLocaleString()}`);
      console.log(`      Paid Traffic: ${traffic.paid?.toLocaleString() || 'N/A'}`);
      console.log(`      Bounce Rate: ${(opp.trackedPageKPIValue * 100).toFixed(2)}%`);
    });

    // Combine all opportunities
    const allOpportunities = [
      ...highOrganicLowCTR.map(o => ({ ...o, type: 'high-organic-low-ctr' })),
      ...highInorganicHighBounce.map(o => ({ ...o, type: 'high-inorganic-high-bounce' }))
    ];

    console.log('\n\n💡 RECOMMENDATION:');
    console.log('   Run LLM presence analysis on these opportunities:');
    console.log('   node main-rum.js --domain ' + domain + ' --min-traffic 5000 --max-urls 20\n');

    return allOpportunities;

  } catch (error) {
    logger.error(`Error finding opportunities: ${error.message}`);
    throw error;
  }
}

/**
 * Analyze a single URL (reuse from main.js)
 */
async function analyzeUrl(browser, url, rumData, aiKey) {
  logger.info(`Analyzing: ${url}`);

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    const content = await page.content();
    await page.close();

    // Validate content
    if (!content || content.trim().length === 0) {
      throw new Error('Page returned no content');
    }

    const $ = cheerio.load(content);
    const textContent = stripTagsToText(content) || '';

    // Validate extracted text
    if (!textContent || textContent.trim().length < 50) {
      throw new Error(`Page content too short (${textContent.length} chars). Might be blocked or empty.`);
    }

    // Get page title
    const title = $('title').text() || '';

    // Classify page type (correct parameter order: url, $, text, title, azureConfig)
    const azureConfig = aiKey ? {
      AZURE_OPENAI_ENDPOINT,
      AZURE_OPENAI_KEY: aiKey,
      AZURE_COMPLETION_DEPLOYMENT,
      AZURE_API_VERSION
    } : null;
    
    const pageTypeClassification = await classifyPageType(url, $, textContent, title, azureConfig);

    // Analyze LLM presence (correct parameters: $, htmlContent, textContent, title)
    const llmAnalysis = analyzeLLMPresence($, content, textContent, title);
    
    // Add authority and structure scores
    const authorityScore = analyzeAuthority(url, $);
    const structureScore = analyzeStructure($, textContent);
    
    // Combine all scores
    const llmPresenceData = {
      freshness: llmAnalysis.freshness,
      answerability: llmAnalysis.answerability,
      queryAlignment: llmAnalysis.queryAlignment,
      snippetQuality: llmAnalysis.snippetQuality,
      authority: { score: authorityScore },
      structure: { score: structureScore }
    };

    // Calculate page-type-specific score
    const { score, appliedWeights } = calculatePageTypeScore(
      llmPresenceData,
      pageTypeClassification.primaryType
    );

    // Prepare result with RUM data enrichment
    const result = {
      url: url,
      timestamp: new Date().toISOString(),
      
      // RUM metrics
      rumMetrics: {
        pageviews: rumData.pageviews,
        organicTraffic: rumData.organic,
        organicRatio: (rumData.organicRatio * 100).toFixed(1) + '%',
        engagement: rumData.engagement ? rumData.engagement.toFixed(1) + '%' : 'N/A',
        bounceRate: rumData.bounceRate ? rumData.bounceRate.toFixed(1) + '%' : 'N/A',
        priorityScore: rumData.priorityScore.toFixed(1),
        coreWebVitals: rumData.cwv
      },
      
      // LLM presence metrics
      llmPresence: {
        overallScore: score || 0,
        freshness: llmPresenceData.freshness?.score || 0,
        answerability: llmPresenceData.answerability?.score || 0,
        queryAlignment: llmPresenceData.queryAlignment?.score || 0,
        authority: llmPresenceData.authority?.score || 0,
        structure: llmPresenceData.structure?.score || 0,
        snippetQuality: llmPresenceData.snippetQuality?.score || 0
      },
      
      // Page type
      pageType: pageTypeClassification,
      
      // Applied weights
      scoringWeights: appliedWeights,
      
      // Interpretation
      interpretation: interpretScore(score)
    };

    // Add to examples library for learning
    await addExampleToLibrary(url, llmPresenceData, pageTypeClassification);

    return result;

  } catch (error) {
    logger.error(`Error analyzing ${url}: ${error.message}`);
    logger.error(`Error stack: ${error.stack}`);
    return {
      url: url,
      error: error.message,
      stack: error.stack,
      rumMetrics: rumData
    };
  }
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  if (!options.domain) {
    console.error('❌ Error: --domain is required\n');
    showHelp();
    process.exit(1);
  }

  // Set Azure OpenAI key if provided
  if (options.aiKey) {
    AZURE_OPENAI_KEY = options.aiKey;
  } else if (process.env.AZURE_OPENAI_KEY) {
    AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
  }

  console.log(`
🚀 LLM Presence Tracker - RUM API Mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Domain:      ${options.domain}
Days:        ${options.days}
Min Traffic: ${options.minTraffic}
Max URLs:    ${options.maxUrls}
Mode:        ${options.mode}
AI Insights: ${AZURE_OPENAI_KEY ? '✅ Enabled' : '❌ Disabled'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  try {
    // Mode: Find opportunities
    if (options.mode === 'opportunities') {
      await findOpportunities(options.domain, options.days);
      console.log('\n✅ Opportunities analysis complete!\n');
      process.exit(0);
    }

    // Mode: Analyze URLs
    // Step 1: Fetch URLs from RUM API
    const urls = await fetchUrlsFromRUM(options.domain, options.days, options.minTraffic);

    if (urls.length === 0) {
      logger.warning('No URLs found matching criteria');
      console.log('\n✅ Analysis complete (no URLs to analyze)\n');
      process.exit(0);
    }

    // Limit to max URLs
    const urlsToAnalyze = urls.slice(0, options.maxUrls);

    console.log(`\n📋 Top ${urlsToAnalyze.length} URLs by Priority:\n`);
    urlsToAnalyze.forEach((urlData, idx) => {
      console.log(`${idx + 1}. ${urlData.url}`);
      console.log(`   Views: ${urlData.pageviews.toLocaleString()}, Organic: ${urlData.organic.toLocaleString()} (${(urlData.organicRatio * 100).toFixed(1)}%)`);
      console.log(`   Engagement: ${urlData.engagement?.toFixed(1) || 'N/A'}%, Priority: ${urlData.priorityScore.toFixed(1)}\n`);
    });

    // Step 2: Launch browser
    logger.info('Launching browser...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Step 3: Analyze each URL
    const results = [];
    for (const urlData of urlsToAnalyze) {
      const result = await analyzeUrl(browser, urlData.url, urlData, AZURE_OPENAI_KEY);
      results.push(result);
      
      // Brief delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    await browser.close();

    // Step 4: Save results
    const outputDir = path.join(options.outputDir, options.domain.replace(/[^a-z0-9]/gi, '_'));
    await fs.ensureDir(outputDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(outputDir, `rum-analysis-${timestamp}.json`);
    
    await fs.writeJson(outputFile, {
      domain: options.domain,
      analysisDate: new Date().toISOString(),
      daysAnalyzed: options.days,
      totalUrlsFound: urls.length,
      urlsAnalyzed: results.length,
      results: results
    }, { spaces: 2 });

    logger.info(`✅ Results saved to: ${outputFile}`);

    // Step 5: Print summary
    console.log('\n\n📊 ANALYSIS SUMMARY\n');
    console.log('═══════════════════════════════════════════════════════\n');

    results.forEach((result, idx) => {
      if (result.error) {
        console.log(`${idx + 1}. ❌ ${result.url}`);
        console.log(`   Error: ${result.error}\n`);
        return;
      }

      const score = result.llmPresence.overallScore || 0;
      const emoji = score >= 0.8 ? '🟢' : score >= 0.6 ? '🟡' : '🔴';
      
      // Get confidence as percentage (handle both string and number)
      let confidenceDisplay = 'N/A';
      if (result.pageType.confidence) {
        const conf = result.pageType.confidence;
        if (typeof conf === 'number') {
          confidenceDisplay = `${(conf * 100).toFixed(0)}%`;
        } else {
          confidenceDisplay = conf; // 'high', 'medium', 'low'
        }
      }

      console.log(`${idx + 1}. ${emoji} ${result.url}`);
      console.log(`   LLM Score: ${(score * 100).toFixed(1)}% (${result.interpretation?.rating || 'N/A'})`);
      console.log(`   Traffic: ${result.rumMetrics.pageviews.toLocaleString()} views (${result.rumMetrics.organicRatio} organic)`);
      console.log(`   Engagement: ${result.rumMetrics.engagement}, Bounce: ${result.rumMetrics.bounceRate}`);
      console.log(`   Page Type: ${result.pageType.primaryTypeName || result.pageType.primaryType} (${confidenceDisplay} confidence)`);
      console.log(`   Core Web Vitals: LCP=${result.rumMetrics.coreWebVitals.lcp}ms, CLS=${result.rumMetrics.coreWebVitals.cls.toFixed(3)}`);
      console.log('');
    });

    // Correlation insights
    const avgScore = results.reduce((sum, r) => sum + (r.llmPresence?.overallScore || 0), 0) / results.length;
    const avgBounce = results.reduce((sum, r) => {
      const bounce = parseFloat(r.rumMetrics?.bounceRate);
      return sum + (isNaN(bounce) ? 0 : bounce);
    }, 0) / results.length;

    console.log('\n💡 KEY INSIGHTS:\n');
    console.log(`   Average LLM Presence Score: ${(avgScore * 100).toFixed(1)}%`);
    console.log(`   Average Bounce Rate: ${avgBounce.toFixed(1)}%`);
    
    const highScoreLowBounce = results.filter(r => 
      r.llmPresence?.overallScore >= 0.7 && 
      parseFloat(r.rumMetrics?.bounceRate) < avgBounce
    ).length;
    
    console.log(`   Pages with Good LLM Score & Low Bounce: ${highScoreLowBounce}/${results.length}`);
    
    console.log('\n✅ Analysis complete!\n');
    
    // Exit cleanly
    process.exit(0);

  } catch (error) {
    logger.error(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run main function
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { fetchUrlsFromRUM, findOpportunities };

