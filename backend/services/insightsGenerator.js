/**
 * On-Demand AI Insights Generator
 * Generates AI-powered recommendations using cached analysis data
 * No re-scraping required - uses saved context from initial analysis
 */

const path = require('path');
const fs = require('fs-extra');
const { createServiceLogger } = require('../utils/logger');
const config = require('../utils/config');

const logger = createServiceLogger('InsightsGen');
const RESULTS_DIR = config.storage.resultsDir;

/**
 * Generate AI insights for a specific URL using cached analysis data
 * @param {string} projectId - Project ID
 * @param {string} url - URL to generate insights for
 * @param {boolean} regenerate - Force regeneration even if insights exist
 * @returns {Promise<Object>} Generated insights
 */
async function generateInsightsForUrl(projectId, url, regenerate = false) {
  logger.info('Generating AI insights for URL', { projectId, url, regenerate });
  
  try {
    // Load the project to get the content analysis job ID(s)
    const projectPath = path.join(RESULTS_DIR, `unified-${projectId}.json`);
    const project = await fs.readJson(projectPath);
    
    // Support both old single job ID and new multiple job IDs
    const jobIdsToSearch = project.contentAnalysisJobIds || (project.contentAnalysisJobId ? [project.contentAnalysisJobId] : []);
    
    if (jobIdsToSearch.length === 0) {
      throw new Error('No content analysis found for this project');
    }
    
    // Search through all job files to find the URL's analysis
    let urlAnalysis = null;
    let analysisPath = null;
    let analysisData = null;
    
    for (const jobId of jobIdsToSearch) {
      try {
        const currentAnalysisPath = path.join(RESULTS_DIR, `${jobId}.json`);
        if (await fs.pathExists(currentAnalysisPath)) {
          const currentAnalysisData = await fs.readJson(currentAnalysisPath);
          const found = currentAnalysisData.results?.find(r => r.url === url);
          if (found) {
            urlAnalysis = found;
            analysisPath = currentAnalysisPath;
            analysisData = currentAnalysisData;
            break;
          }
        }
      } catch (err) {
        logger.warn('Failed to read job file', { jobId, error: err.message });
      }
    }
    
    if (!urlAnalysis) {
      throw new Error(`No analysis found for URL: ${url}`);
    }
    
    // Check if insights already exist and regeneration not requested
    if (urlAnalysis.hasAIInsights && !regenerate) {
      logger.info('Insights already exist for URL', { url });
      return {
        insights: urlAnalysis.recommendations,
        regenerated: false,
        cached: true
      };
    }
    
    // Check if we have the necessary context
    if (!urlAnalysis.insightsContext) {
      throw new Error('Analysis context not available - URL needs to be re-analyzed');
    }
    
    // Call Azure OpenAI to generate insights
    logger.info('Calling Azure OpenAI for insights generation', { url });
    const insights = await callAzureForInsights(urlAnalysis);
    
    // Update the analysis with new insights
    urlAnalysis.recommendations = insights;
    urlAnalysis.hasAIInsights = true;
    urlAnalysis.aiInsightsGeneratedAt = new Date().toISOString();
    
    // Update the URL analysis in the results array
    const urlIndex = analysisData.results.findIndex(r => r.url === url);
    if (urlIndex !== -1) {
      analysisData.results[urlIndex] = urlAnalysis;
    }
    
    // Save updated analysis
    await fs.writeJson(analysisPath, analysisData, { spaces: 2 });
    logger.info('Insights generated and saved', { url, insightCount: insights.length });
    
    // Invalidate caches so dashboard shows new insights immediately
    const { invalidateCaches } = require('./unifiedAnalyzer');
    // Pass all job IDs (supports both single and multiple job IDs)
    const jobIdsToInvalidate = project.contentAnalysisJobIds || (project.contentAnalysisJobId ? [project.contentAnalysisJobId] : []);
    invalidateCaches(projectId, jobIdsToInvalidate);
    logger.info('Caches invalidated for project', { projectId, jobIds: jobIdsToInvalidate });
    
    return {
      insights,
      regenerated: regenerate,
      cached: false
    };
    
  } catch (error) {
    logger.error('Failed to generate insights', { projectId, url, error: error.message });
    throw error;
  }
}

/**
 * Generate insights for multiple URLs in parallel
 * @param {string} projectId - Project ID
 * @param {Array<string>} urls - URLs to generate insights for
 * @param {boolean} regenerate - Force regeneration
 * @returns {Promise<Object>} Results for all URLs
 */
async function generateInsightsForUrls(projectId, urls, regenerate = false) {
  logger.info('Batch generating insights', { projectId, urlCount: urls.length, regenerate });
  
  // Process in parallel for speed (limit concurrency to 3)
  const results = {};
  const chunks = [];
  
  // Split into chunks of 3 for parallel processing
  for (let i = 0; i < urls.length; i += 3) {
    chunks.push(urls.slice(i, i + 3));
  }
  
  for (const chunk of chunks) {
    const chunkResults = await Promise.allSettled(
      chunk.map(url => generateInsightsForUrl(projectId, url, regenerate))
    );
    
    // Collect results
    chunk.forEach((url, index) => {
      const result = chunkResults[index];
      if (result.status === 'fulfilled') {
        results[url] = {
          success: true,
          ...result.value
        };
      } else {
        results[url] = {
          success: false,
          error: result.reason.message
        };
      }
    });
  }
  
  const successCount = Object.values(results).filter(r => r.success).length;
  logger.info('Batch insights generation complete', { 
    total: urls.length, 
    successful: successCount,
    failed: urls.length - successCount
  });
  
  return results;
}

/**
 * Call Azure OpenAI to generate insights based on analysis context
 * Similar to LLM Tracker's getAIInsights but uses cached data
 */
async function callAzureForInsights(urlAnalysis) {
  if (!config.azure.apiKey) {
    throw new Error('Azure OpenAI API key not configured');
  }
  
  const context = urlAnalysis.insightsContext;
  const llmPresence = urlAnalysis.llmPresence;
  const details = urlAnalysis.details;
  
  // Build weight context showing what matters most
  const weights = context.appliedWeights || {};
  const weightEntries = Object.entries(weights)
    .sort((a, b) => b[1] - a[1])
    .map(([factor, weight]) => `  - ${factor}: ${(weight * 100).toFixed(0)}%`)
    .join('\n');
  
  const pageTypeContext = llmPresence.pageType !== 'Unknown' 
    ? `\nPage Type: ${llmPresence.pageType}\n\nScoring Weights Applied (most important first):\n${weightEntries}\n\nNOTE: Focus recommendations on the highest-weighted factors.`
    : '';
  
  // Build detailed current state
  const currentState = `
Current Scores:
- Overall LLM Presence: ${(llmPresence.overallScore * 100).toFixed(1)}% (${llmPresence.rating})
- Freshness: ${(llmPresence.freshness * 100).toFixed(1)}%
- Answerability: ${(llmPresence.answerability * 100).toFixed(1)}%
- Query Alignment: ${(llmPresence.queryAlignment * 100).toFixed(1)}%
- Authority: ${(llmPresence.authority * 100).toFixed(1)}%
- Structure: ${(llmPresence.structure * 100).toFixed(1)}%
- Snippet Quality: ${(llmPresence.snippetQuality * 100).toFixed(1)}%

Key Findings:
${JSON.stringify(details, null, 2).substring(0, 2000)}
`;

  // Get current date for freshness recommendations
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });
  
  // Enhanced prompt for detailed, URL-specific insights
  const prompt = `You are an SEO expert specializing in LLM/AI discoverability. Analyze this specific webpage and provide tailored recommendations.

CONTEXT:
- Current Date: ${currentMonth} ${currentYear}
- URL: ${urlAnalysis.url}
- Page Title: ${urlAnalysis.title || 'Not available'}
${pageTypeContext}

${currentState}

Content Analysis:
- Word Count: ${urlAnalysis.wordCount || 0}
- Heading Structure: ${details.structure?.h1Count || 0} H1s, ${details.structure?.h2Count || 0} H2s, ${details.structure?.h3Count || 0} H3s
- Has Tables: ${details.structure?.tableCount > 0 ? 'Yes' : 'No'}
- Has Lists: ${details.structure?.listCount > 0 ? 'Yes' : 'No'}
- Question-based headings: ${details.answerability?.questionHeadingCount || 0}

Content Sample (first 2500 chars):
${context.textContent.substring(0, 2500)}

TASK: Generate 3-5 HIGHLY SPECIFIC recommendations for THIS URL to improve its LLM presence score.

CRITICAL REQUIREMENTS:
1. **URL-SPECIFIC**: Reference the actual content, product names, topics visible in the content sample above
2. **METRIC-FOCUSED**: Prioritize the 2-3 LOWEST scoring metrics (shown in Current Scores above)
3. **CURRENT & RELEVANT**: When suggesting dates/years, use ${currentYear} (not outdated years)
4. **DETAILED STRUCTURE**: Each recommendation must have:
   - title: Short actionable title (5-8 words)
   - description: Detailed explanation referencing SPECIFIC page elements from the content sample (20-40 words)
   - actions: Array of 2-4 concrete implementation steps with SPECIFIC examples from the actual content
   - priority: "high" (for lowest metrics), "medium", or "low"
5. **AVOID GENERIC ADVICE**: 
   - BAD: "Add FAQ section" 
   - GOOD: "Add FAQ section about [specific product name from content] covering questions like 'How to clean [product]?' and 'What sizes are available for [product]?'"
6. **NO REPETITION**: Each recommendation must be unique and complementary

OUTPUT FORMAT (JSON only, no markdown):
{
  "recommendations": [
    {
      "title": "Enhance Product Comparison Tables",
      "description": "Current structure score is ${(llmPresence.structure * 100).toFixed(0)}%. Add detailed comparison tables for [specific products visible in content] to help LLMs extract and compare features.",
      "actions": [
        "Create a table comparing [Product A from content] vs [Product B from content] with columns for price, dimensions, and materials",
        "Add a feature comparison table showing [specific features mentioned in content]",
        "Include a size guide table with specific measurements from product specs"
      ],
      "priority": "high"
    }
  ]
}`;

  logger.debug('Calling Azure OpenAI', { url: urlAnalysis.url, promptLength: prompt.length });
  
  try {
    const response = await fetch(
      `${config.azure.endpoint}/openai/deployments/${config.azure.deployment}/chat/completions?api-version=${config.azure.apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.azure.apiKey
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `You are an expert SEO analyst specializing in LLM discoverability. Today is ${currentMonth} ${currentYear}. Analyze the specific URL provided and give tailored, detailed recommendations that reference actual page content (product names, features, topics visible in the content sample). When suggesting freshness improvements, use current dates (${currentYear}). Avoid generic advice. Return structured JSON with title, description, actions, and priority for each recommendation.` },
            { role: 'user', content: prompt }
          ],
          temperature: 0.4,
          max_tokens: 2500,
          response_format: { type: 'json_object' }
        })
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    const llmResponse = data.choices[0].message.content;
    
    // Parse JSON response
    const parsed = JSON.parse(llmResponse);
    
    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      throw new Error('Invalid response format from Azure OpenAI');
    }
    
    // Keep full recommendation objects (not just strings)
    const recommendations = parsed.recommendations
      .filter(rec => rec && (typeof rec === 'object' || typeof rec === 'string'))
      .slice(0, 5);
    
    logger.info('Successfully generated insights', { 
      url: urlAnalysis.url, 
      recommendationCount: recommendations.length 
    });
    
    return recommendations;
    
  } catch (error) {
    logger.error('Azure OpenAI call failed', { 
      url: urlAnalysis.url, 
      error: error.message 
    });
    
    // Return fallback recommendations based on scores
    return generateFallbackRecommendations(llmPresence);
  }
}

/**
 * Generate fallback recommendations when Azure API is unavailable
 */
function generateFallbackRecommendations(llmPresence) {
  const recommendations = [];
  
  // Identify weakest areas
  const scores = [
    { name: 'freshness', score: llmPresence.freshness, advice: 'Add clear publication and last-updated dates in both metadata and visible content' },
    { name: 'answerability', score: llmPresence.answerability, advice: 'Create an FAQ section addressing common user questions directly' },
    { name: 'queryAlignment', score: llmPresence.queryAlignment, advice: 'Incorporate natural language questions and conversational phrases users would ask' },
    { name: 'authority', score: llmPresence.authority, advice: 'Add author credentials, citations, and expert quotes to boost authority signals' },
    { name: 'structure', score: llmPresence.structure, advice: 'Improve content structure with clear headings, bullet lists, and summary sections' },
    { name: 'snippetQuality', score: llmPresence.snippetQuality, advice: 'Optimize meta description and opening paragraph for concise, informative snippets' }
  ];
  
  // Sort by score (lowest first) and take top 4
  scores.sort((a, b) => a.score - b.score);
  
  scores.slice(0, 4).forEach(({ name, score, advice }) => {
    recommendations.push(`[${name.toUpperCase()}] ${advice} (current score: ${(score * 100).toFixed(0)}%)`);
  });
  
  recommendations.push('Consider re-analyzing this page after implementing changes to measure improvement');
  
  return recommendations;
}

module.exports = {
  generateInsightsForUrl,
  generateInsightsForUrls
};

