#!/usr/bin/env node
/**
 * LLM Presence Tracker - Main Script
 * Analyzes web pages for LLM discoverability
 * Reuses core functionality from parent project
 */

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

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

// Azure OpenAI configuration (optional)
let AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || 'https://aem-sites-1-genai-us-east-2.openai.azure.com';
let AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY || null;
const AZURE_API_VERSION = process.env.AZURE_API_VERSION || '2024-02-01';
const AZURE_COMPLETION_DEPLOYMENT = process.env.AZURE_COMPLETION_DEPLOYMENT || 'gpt-4o';

// Debug: Log key status on module load
console.log('[LLM Tracker] Module loaded. Azure key status:', AZURE_OPENAI_KEY ? `✅ SET (${AZURE_OPENAI_KEY.length} chars)` : '❌ NOT SET');

// Concurrency for parallel processing
const CONCURRENCY = 5;

// Logger
const logger = {
  info: (message) => console.log(`${new Date().toISOString()} - INFO - ${message}`),
  error: (message) => console.error(`${new Date().toISOString()} - ERROR - ${message}`),
  warning: (message) => console.warn(`${new Date().toISOString()} - WARNING - ${message}`)
};

/**
 * Get Chrome executable path
 */
function getChromeExecutablePath() {
  const system = os.platform();
  let chromePaths = [];
  
  if (system === "darwin") {
    chromePaths = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"];
  } else if (system === "win32") {
    chromePaths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      `C:\\Users\\${os.userInfo().username}\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe`
    ];
  } else {
    chromePaths = ["/usr/bin/google-chrome", "/usr/bin/google-chrome-stable"];
  }
  
  for (const chromePath of chromePaths) {
    if (fs.existsSync(chromePath)) {
      return chromePath;
    }
  }
  
  logger.warning(`Google Chrome not found on ${system}. Using Puppeteer's bundled Chrome.`);
  return null;
}

/**
 * Enhance analysis with Azure OpenAI insights (page-type-aware, data-driven, and learning from past analyses)
 */
async function getAIInsights(url, llmPresenceData, textContent, pageTypeClassification, appliedWeights, searchQueryData = {}, relevantExamples = '') {
  console.log('[LLM Tracker] getAIInsights called for:', url);
  console.log('[LLM Tracker] AZURE_OPENAI_KEY present:', !!AZURE_OPENAI_KEY);
  
  if (!AZURE_OPENAI_KEY) {
    console.log('[LLM Tracker] No Azure key - returning placeholder');
    return 'AI insights not available (no API key provided)';
  }
  
  console.log('[LLM Tracker] Calling Azure OpenAI API...');
  
  try {
    // Build weight context showing what matters most for this page type
    const weightEntries = Object.entries(appliedWeights)
      .sort((a, b) => b[1] - a[1])
      .map(([factor, weight]) => `  - ${factor}: ${(weight * 100).toFixed(0)}%`)
      .join('\n');
    
    const pageTypeContext = pageTypeClassification.primaryTypeName !== 'Unknown' 
      ? `\nPage Type: ${pageTypeClassification.primaryTypeName}${pageTypeClassification.secondaryTypeName ? ` (${pageTypeClassification.secondaryTypeName})` : ''}
Classification Confidence: ${pageTypeClassification.confidence}

Scoring Weights Applied (most important first):
${weightEntries}

NOTE: Focus your recommendations on the highest-weighted factors for this page type.`
      : '';
    
    // Build detailed current state to avoid recommending what already exists
    const currentState = `
WHAT'S ALREADY ON THIS PAGE:
Structure:
  - ${llmPresenceData.answerability.h1Count} H1 heading(s)
  - ${llmPresenceData.answerability.h2Count} H2 headings
  - ${llmPresenceData.answerability.h3Count} H3 headings
  - ${llmPresenceData.answerability.listCount} lists
  - ${llmPresenceData.answerability.tableCount} tables

Content Features (USE THESE COUNTS IN YOUR RECOMMENDATIONS):
  - Questions: ${llmPresenceData.answerability.hasQuestions ? 'YES' : 'NO'}${llmPresenceData.answerability.hasQuestions ? ` (${llmPresenceData.answerability.questionCount || 'count unknown'} found)` : ' (0 found)'}
  - Question Headings: ${llmPresenceData.answerability.hasQuestionHeadings ? 'YES' : 'NO'}${llmPresenceData.answerability.hasQuestionHeadings ? ` (${llmPresenceData.answerability.questionHeadingCount} found)` : ' (0 found)'}
  - Step-by-step instructions: ${llmPresenceData.answerability.hasSteps ? 'YES' : 'NO'}${llmPresenceData.answerability.hasSteps ? ` (${llmPresenceData.answerability.stepCount} found)` : ' (0 found)'}
  - Definitions: ${llmPresenceData.answerability.hasDefinitions ? 'YES' : 'NO'}${llmPresenceData.answerability.hasDefinitions ? ` (${llmPresenceData.answerability.definitionCount} found)` : ' (0 found)'}
  - Comparisons: ${llmPresenceData.answerability.hasComparisons ? 'YES' : 'NO'}${llmPresenceData.answerability.hasComparisons ? ` (${llmPresenceData.answerability.comparisonCount || 0} found)` : ' (0 found)'}

Freshness Indicators:
  - Current year (${new Date().getFullYear()}): ${llmPresenceData.freshness.hasCurrentYear ? 'YES' : 'NO'}
  - Pricing info: ${llmPresenceData.freshness.hasPricing ? 'YES' : 'NO'}
  - Dates mentioned: ${llmPresenceData.freshness.dateCount}

Snippet Optimization:
  - Title length: ${llmPresenceData.snippetQuality.metaTitle?.length || 0} chars (ideal: 50-60)
  - Meta description: ${llmPresenceData.snippetQuality.metaDescription?.text ? 'YES' : 'NO'}${llmPresenceData.snippetQuality.metaDescription?.text ? ` (${llmPresenceData.snippetQuality.metaDescription.length} chars, ideal: 150-160)` : ''}
  - First paragraph length: ${llmPresenceData.snippetQuality.firstParagraph?.length || 0} chars
  - Structured data: ${llmPresenceData.snippetQuality.structuredData?.hasStructuredData ? 'YES' : 'NO'}

ACTUAL PAGE CONTENT (use this to verify what exists):
Title: "${llmPresenceData.snippetQuality.metaTitle?.text || 'NOT FOUND'}"

Meta Description: ${llmPresenceData.snippetQuality.metaDescription?.text ? `"${llmPresenceData.snippetQuality.metaDescription.text}"` : 'NOT FOUND'}

First Paragraph: "${llmPresenceData.snippetQuality.firstParagraph?.text || 'NOT FOUND'}"

Sample H2 Headings:${llmPresenceData.answerability.h2Count > 0 ? `
${llmPresenceData.answerability.sampleHeadings?.slice(0, 5).map(h => `  - "${h}"`).join('\n') || '  (Not captured)'}` : '  (No H2 headings found)'}

Sample Question Headings:${llmPresenceData.answerability.hasQuestionHeadings ? `
${llmPresenceData.answerability.sampleQuestionHeadings?.slice(0, 3).map(q => `  - "${q}"`).join('\n') || '  (Not captured)'}` : '  (No question headings found)'}

SPECIFIC WEAKNESSES (prioritize these):
${Object.entries(appliedWeights)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([factor, weight]) => {
    const scoreMap = {
      freshness: llmPresenceData.freshness.score,
      answerability: llmPresenceData.answerability.score,
      queryAlignment: llmPresenceData.queryAlignment.score,
      snippetQuality: llmPresenceData.snippetQuality.score
    };
    const score = scoreMap[factor] || 0;
    const isWeak = score < 0.5;
    return `  - ${factor} (${(weight * 100).toFixed(0)}% weight): ${(score * 100).toFixed(0)}% ${isWeak ? '⚠️ NEEDS IMPROVEMENT' : ''}`;
  })
  .join('\n')}`;
    
    // Build search query context if available
    const searchQueryContext = searchQueryData.Top_Search_Queries ? `

REAL USER SEARCH QUERIES (use these to guide recommendations):
Target Audience Searches For:
${searchQueryData.Top_Search_Queries.split(';').map(q => `  - "${q.trim()}"`).join('\n')}

User Intent: ${searchQueryData.User_Intent || 'unknown'}

IMPORTANT: Your recommendations MUST align with these actual search queries. Don't suggest content about topics users aren't searching for.` : '';
    
    const prompt = `Analyze this web page for LLM discoverability and provide 3-5 specific, actionable recommendations.${relevantExamples}

URL: ${url}${pageTypeContext}${searchQueryContext}

Current Scores:
- Overall LLM Presence: ${(llmPresenceData.overallScore * 100).toFixed(0)}%
- Freshness: ${(llmPresenceData.freshness.score * 100).toFixed(0)}%
- Answerability: ${(llmPresenceData.answerability.score * 100).toFixed(0)}%
- Query Alignment: ${(llmPresenceData.queryAlignment.score * 100).toFixed(0)}%
- Snippet Quality: ${(llmPresenceData.snippetQuality.score * 100).toFixed(0)}%
${currentState}

Content Sample (first 2000 chars):
${textContent.substring(0, 2000)}

CRITICAL RULES - READ CAREFULLY:
1. Review "ACTUAL PAGE CONTENT" section above - these are REAL elements from the page
2. ALWAYS reference current counts when making recommendations (e.g., "currently has X, add Y more")
3. If the Title, Meta Description, or First Paragraph already exist and look good, DO NOT recommend changing them
4. DO NOT recommend adding features that already exist (see "WHAT'S ALREADY ON THIS PAGE")
5. If a score is LOW but the content EXISTS, recommend HOW to IMPROVE it specifically
6. Only recommend changes to HIGH-WEIGHTED factors that are genuinely weak or missing
7. Be specific with actionable steps, not vague suggestions

Examples of GOOD recommendations (aligned with search queries):
✓ "Users search for 'qr code generator free' and 'create qr code online' - add H2: 'How to Create a Free QR Code in 3 Steps' and emphasize 'free' and 'online' in first paragraph"
✓ "Top query is 'pdf to word converter free' - ensure the first paragraph includes 'free', 'converter', and '100% secure' within first 120 chars"
✓ "Users search 'compress pdf without losing quality' - add FAQ: 'Will compressing reduce image quality?' and 'What compression level preserves quality?'"
✓ "Search intent is 'transactional' (ready to use tool) - prioritize clear CTA, step-by-step instructions, and 'Start Free' messaging over educational content"
✓ "Queries include 'background remover online' and 'transparent background maker' - add H2s covering both terms: 'Online Background Remover Tool' and 'Create Transparent Backgrounds'"
✓ "With questions like 'How do I create a QR code?' already present, add 3-4 more based on search queries: 'How to make QR code free?', 'Can I customize QR code colors?', 'How to download QR code?'"

Examples of BAD recommendations (too generic, no context):
✗ "Improve the first paragraph" (what's wrong with it? how long is it now?)
✗ "Add FAQ section" (how many questions already exist?)
✗ "Add more definitions" (how many are there currently?)
✗ "Make title more descriptive" (what's the current title? what's wrong with it?)

USE EXAMPLES FROM THE PAGE:
- Reference actual H2 headings, questions, or content from "ACTUAL PAGE CONTENT" section
- When suggesting additions, show what currently exists and what to add (e.g., "Currently: 'X', 'Y' → Add: 'Z', 'W'")
- Make examples concrete and relevant to this specific page's topic
- If suggesting new questions, model them after existing questions shown above
- If suggesting new H2s, align them with the existing heading style

YOUR TASK:
Provide 3-5 HIGH-QUALITY, specific, actionable recommendations based on what's actually missing or genuinely weak on this page.

QUALITY REQUIREMENTS (MOST IMPORTANT):
1. Be SPECIFIC - reference actual content and counts from the page
2. Be ACTIONABLE - tell exactly what to do, not vague suggestions
3. Be DATA-DRIVEN - align with search queries and user needs
4. Be CONTEXTUAL - reference what already exists on the page
5. Be IMPACTFUL - focus on changes that help users find and understand the content
6. Include CONCRETE EXAMPLES - show what to add, how to change it

Each recommendation should:
- Start with the specific action (e.g., "Add H2 heading...", "Expand first paragraph from X to Y...")
- Reference current state if changing something (e.g., "currently has 3, add 2 more")
- Explain WHY it matters for USERS/BUSINESS (e.g., "because users searching for 'X' need to quickly see...", "this helps visitors understand...", "people looking for 'Y' expect to find...")
- Include specific examples from the page topic
- Be 2-4 sentences with complete details
- DO NOT mention scores, percentages, or internal metrics (no "improve score from X%" - focus on user/business value instead)

**OUTPUT FORMAT (JSON):**

Return ONLY this JSON structure (no extra text):

{
  "recommendations": [
    "Recommendation 1: Specific action + current state + reason + concrete example",
    "Recommendation 2: Specific action + current state + reason + concrete example",
    "Recommendation 3: Specific action + current state + reason + concrete example"
  ]
}

Example output:
{
  "recommendations": [
    "Add H2 heading 'How to Create a Free QR Code in 3 Steps' near the top of the page (currently missing) because the most common search query is 'qr code generator free' and users need to immediately understand that this is a free tool. This heading directly addresses what people are searching for and helps them quickly confirm they're in the right place.",
    "Expand first paragraph from current 80 characters to 150+ characters, ensuring it includes the key terms 'free', 'online', 'generator', and 'customize' within the first 120 characters. When users search for 'qr code generator', they expect to see these terms prominently displayed upfront to confirm the page matches their needs, and search engines use this content to generate snippets in search results.",
    "Add 4 FAQ questions addressing common user concerns: 'How to make QR code free?', 'Can I customize QR code colors?', 'How to download QR code as image?', and 'Do QR codes expire?'. The page currently has only 2 questions, but these specific queries appear frequently in search data, indicating users need these answers before using the tool. Addressing these upfront reduces friction and builds trust."
  ]
}

Focus on quality and specificity - these recommendations will be read by real people making website improvements.`;

    const response = await fetch(
      `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_COMPLETION_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_OPENAI_KEY
        },
        body: JSON.stringify({
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert SEO and LLM optimization consultant who provides specific, data-driven, actionable recommendations. You always output valid JSON.'
            },
            { 
              role: 'user', 
              content: prompt 
            }
          ],
          max_tokens: 2000,
          temperature: 0.5,
          response_format: { type: "json_object" }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || 'Unable to generate insights';
    
  } catch (error) {
    logger.error(`Error getting AI insights: ${error.message}`);
    return `Error: ${error.message}`;
  }
}

/**
 * Analyze a single URL for LLM presence
 */
async function analyzeUrl(browser, url, timestamp, searchQueryData = {}, disableLearning = false) {
  let page;
  
  try {
    page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    logger.info(`Analyzing ${url}...`);
    
    const response = await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    const title = await page.title();
    const htmlContent = await page.content();
    const textContent = stripTagsToText(htmlContent);
    
    // Load into cheerio for analysis
    const $ = cheerio.load(htmlContent);
    
    // Classify page type (with AI if key available)
    const azureConfig = AZURE_OPENAI_KEY ? {
      AZURE_OPENAI_ENDPOINT,
      AZURE_OPENAI_KEY,
      AZURE_COMPLETION_DEPLOYMENT,
      AZURE_API_VERSION
    } : null;
    
    logger.info(`Classifying page type for ${url}...`);
    const pageTypeClassification = await classifyPageType(url, $, textContent, title, azureConfig);
    logger.info(`Page type: ${pageTypeClassification.primaryTypeName} (${pageTypeClassification.confidence} confidence)`);
    
    // Run LLM presence analysis
    const llmAnalysis = analyzeLLMPresence($, htmlContent, textContent, title);
    
    // Add authority and structure scores (simplified)
    const authorityScore = analyzeAuthority(url, $);
    const structureScore = analyzeStructure($, textContent);
    
    // Calculate final score using page-type-specific weights
    const allScores = {
      freshness: llmAnalysis.freshness.score,
      answerability: llmAnalysis.answerability.score,
      queryAlignment: llmAnalysis.queryAlignment.score,
      snippetQuality: llmAnalysis.snippetQuality.score,
      authority: authorityScore,
      structure: structureScore
    };
    
    const scoringResult = calculatePageTypeScore(allScores, pageTypeClassification.primaryType);
    const finalScore = scoringResult.finalScore;
    
    // Compare with default scoring
    const scoringComparison = compareScoring(allScores, pageTypeClassification.primaryType);
    
    const interpretation = interpretScore(finalScore);
    
    logger.info(`Score: ${(finalScore * 100).toFixed(1)}% (${scoringComparison.deltaPercent} vs default scoring)`);
    
    // Get AI-powered insights if enabled (now page-type-aware, data-driven, and learning)
    let aiInsights = null;
    if (AZURE_OPENAI_KEY) {
      // Get relevant examples from past analyses (ONLY if learning enabled and we have enough quality examples)
      let relevantExamples = '';
      
      if (!disableLearning) {
        const library = await require('./analyzers/examples-library.js').loadExamplesLibrary();
        
        // Only use learning if we have 10+ examples with good scores
        if (library.examples.length >= 10) {
          const avgScore = library.examples.reduce((sum, ex) => sum + ex.scores.overall, 0) / library.examples.length;
          if (avgScore >= 0.75) { // Only if average score is 75%+
            relevantExamples = await getRelevantExamples(
              pageTypeClassification.primaryType,
              searchQueryData.User_Intent,
              searchQueryData.Top_Search_Queries,
              3 // Get top 3 similar examples
            );
          }
        }
      }
      
      aiInsights = await getAIInsights(
        url, 
        llmAnalysis, 
        textContent, 
        pageTypeClassification, 
        scoringResult.weights, 
        searchQueryData,
        relevantExamples
      );
    }
    
    // Compile complete analysis
    const completeAnalysis = {
      url,
      timestamp,
      title,
      pageType: {
        primary: pageTypeClassification.primaryTypeName,
        primaryKey: pageTypeClassification.primaryType,
        secondary: pageTypeClassification.secondaryTypeNames,
        confidence: pageTypeClassification.confidence,
        reasoning: pageTypeClassification.reasoning,
        method: pageTypeClassification.method
      },
      llm_presence_score: finalScore,
      interpretation,
      scoring: {
        weights: scoringResult.weights,
        breakdown: scoringResult.breakdown,
        reasoning: scoringResult.reasoning,
        comparison: {
          defaultScore: scoringComparison.defaultScore,
          specificScore: scoringComparison.specificScore,
          delta: scoringComparison.delta,
          deltaPercent: scoringComparison.deltaPercent,
          improvement: scoringComparison.improvement
        }
      },
      metrics: {
        freshness: llmAnalysis.freshness,
        answerability: llmAnalysis.answerability,
        queryAlignment: llmAnalysis.queryAlignment,
        snippetQuality: llmAnalysis.snippetQuality,
        authority: { score: authorityScore },
        structure: { score: structureScore }
      },
      recommendations: llmAnalysis.recommendations,
      ai_insights: aiInsights,
      content: {
        wordCount: extractWordCount(htmlContent).word_count,
        textLength: textContent.length,
        htmlLength: htmlContent.length
      }
    };
    
    logger.info(`✅ ${url} - Score: ${(finalScore * 100).toFixed(0)}% (${interpretation.rating})`);
    
    return {
      success: true,
      analysis: completeAnalysis
    };
    
  } catch (error) {
    logger.error(`❌ Failed to analyze ${url}: ${error.message}`);
    return {
      success: false,
      url,
      error: error.message,
      timestamp
    };
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (e) {
        logger.warning(`Error closing page: ${e.message}`);
      }
    }
  }
}

/**
 * Simple authority analysis
 */
function analyzeAuthority(url, $) {
  let score = 0;
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    
    // Check for HTTPS
    if (urlObj.protocol === 'https:') score += 0.20;
    
    // Check for official/authoritative indicators
    const hasAuthorInfo = $('[rel="author"]').length > 0 || 
                         $('meta[name="author"]').length > 0;
    if (hasAuthorInfo) score += 0.15;
    
    // Check for external links (shows research/citations)
    const externalLinks = $('a[href^="http"]').filter((i, el) => {
      try {
        const href = $(el).attr('href');
        return href && !href.includes(domain);
      } catch (e) {
        return false;
      }
    }).length;
    if (externalLinks >= 3) score += 0.15;
    
    // Check for organization schema
    const hasOrgSchema = $('script[type="application/ld+json"]').filter((i, el) => {
      const json = $(el).html();
      return json && (json.includes('Organization') || json.includes('Person'));
    }).length > 0;
    if (hasOrgSchema) score += 0.15;
    
    // Check for contact information
    const hasContact = /contact|email|phone|address/i.test($.html());
    if (hasContact) score += 0.10;
    
    // Check for https and www (professional setup)
    if (domain.startsWith('www.')) score += 0.05;
    
    // Check domain age indicators (about, history pages)
    const hasAboutPage = $('a[href*="about"]').length > 0;
    if (hasAboutPage) score += 0.10;
    
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
  
  // Readability (simple heuristic: avg words per sentence)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const avgWordsPerSentence = wordCount / (sentences.length || 1);
  if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25) {
    score += 0.20; // Good readability
  } else if (avgWordsPerSentence >= 8 && avgWordsPerSentence <= 30) {
    score += 0.10;
  }
  
  // Image alt text (accessibility and SEO)
  const images = $('img');
  const imagesWithAlt = $('img[alt]').filter((i, el) => $(el).attr('alt').trim().length > 0);
  if (images.length > 0) {
    const altTextRatio = imagesWithAlt.length / images.length;
    score += altTextRatio * 0.15;
  } else {
    score += 0.05; // No images is okay for text content
  }
  
  // Internal linking
  const internalLinks = $('a[href^="/"], a[href^="./"], a[href^="../"]').length;
  if (internalLinks >= 3) {
    score += 0.15;
  } else if (internalLinks >= 1) {
    score += 0.08;
  }
  
  return Math.min(1.0, score);
}

/**
 * Generate CSV output
 */
function generateCSV(results, originalCsvData, originalColumnOrder) {
  const newColumns = [
    'Page_Type',
    'Page_Type_Confidence',
    'Classification_Method',
    'LLM_Presence_Score',
    'Score_vs_Default',
    'Score_Rating',
    'Freshness_Score',
    'Answerability_Score',
    'Query_Alignment_Score',
    'Snippet_Quality_Score',
    'Authority_Score',
    'Structure_Score',
    'Has_Current_Year',
    'Has_Pricing',
    'Has_Questions',
    'Has_Definitions',
    'Has_Steps',
    'Has_Comparisons',
    'H1_Count',
    'H2_Count',
    'List_Count',
    'Top_Phrases',
    'Intent_Awareness',
    'Intent_Consideration',
    'Intent_Conversion',
    'AI_Summary'
  ];
  
  const allColumns = [...originalColumnOrder, ...newColumns];
  const rows = [allColumns.join(',')];
  
  for (const result of results) {
    if (!result.success) continue;
    
    const url = result.analysis.url;
    const originalRow = originalCsvData[url] || {};
    const analysis = result.analysis;
    
    const rowData = [];
    
    // Original columns
    for (const col of originalColumnOrder) {
      const value = originalRow[col] || '';
      const escaped = value.includes(',') || value.includes('"') ? 
        `"${value.replace(/"/g, '""')}"` : value;
      rowData.push(escaped);
    }
    
    // Page type classification columns
    const pageTypePrimary = analysis.pageType?.primary || 'Unknown';
    const pageTypeSecondary = analysis.pageType?.secondary?.join('; ') || '';
    const fullPageType = pageTypeSecondary ? `${pageTypePrimary} (${pageTypeSecondary})` : pageTypePrimary;
    rowData.push(fullPageType);
    rowData.push(analysis.pageType?.confidence || 'unknown');
    rowData.push(analysis.pageType?.method || 'unknown');
    
    // New analysis columns
    rowData.push((analysis.llm_presence_score * 100).toFixed(1));
    rowData.push(analysis.scoring?.comparison?.deltaPercent || 'N/A');
    rowData.push(analysis.interpretation.rating);
    rowData.push((analysis.metrics.freshness.score * 100).toFixed(1));
    rowData.push((analysis.metrics.answerability.score * 100).toFixed(1));
    rowData.push((analysis.metrics.queryAlignment.score * 100).toFixed(1));
    rowData.push((analysis.metrics.snippetQuality.score * 100).toFixed(1));
    rowData.push((analysis.metrics.authority.score * 100).toFixed(1));
    rowData.push((analysis.metrics.structure.score * 100).toFixed(1));
    rowData.push(analysis.metrics.freshness.hasCurrentYear ? 'Yes' : 'No');
    rowData.push(analysis.metrics.freshness.hasPricing ? 'Yes' : 'No');
    rowData.push(analysis.metrics.answerability.hasQuestions ? 'Yes' : 'No');
    rowData.push(analysis.metrics.answerability.hasDefinitions ? 'Yes' : 'No');
    rowData.push(analysis.metrics.answerability.hasSteps ? 'Yes' : 'No');
    rowData.push(analysis.metrics.answerability.hasComparisons ? 'Yes' : 'No');
    rowData.push(analysis.metrics.answerability.h1Count.toString());
    rowData.push(analysis.metrics.answerability.h2Count.toString());
    rowData.push(analysis.metrics.answerability.listCount.toString());
    
    // Top phrases (comma-separated, quoted)
    const topPhrases = analysis.metrics.queryAlignment.topPhrases
      .slice(0, 5)
      .map(p => p.phrase)
      .join('; ');
    rowData.push(`"${topPhrases}"`);
    
    // Intent coverage (simplified)
    rowData.push('Check'); // Awareness
    rowData.push('Check'); // Consideration
    rowData.push('Check'); // Conversion
    
    // AI summary (if available) - format for better readability
    const aiSummary = analysis.ai_insights || 'N/A';
    // Keep newlines for readability, but ensure proper CSV escaping
    const formattedAI = aiSummary
      .replace(/"/g, '""')  // Escape quotes for CSV
      .replace(/\n\n+/g, '\n\n')  // Keep paragraph breaks
      .replace(/(\d+\.\s+\*\*)/g, '\n$1');  // Add line break before numbered points
    const escapedAI = `"${formattedAI}"`;  // Always quote to preserve formatting
    rowData.push(escapedAI);
    
    rows.push(rowData.join(','));
  }
  
  return rows.join('\n');
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  let csvFile = 'sample-urls.csv';
  let outputDir = 'output';
  let aiKey = null;
  let disableLearning = false;
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--csv' && args[i + 1]) {
      csvFile = args[i + 1];
      i++;
    } else if (args[i] === '--output-dir' && args[i + 1]) {
      outputDir = args[i + 1];
      i++;
    } else if (args[i] === '--aikey' && args[i + 1]) {
      aiKey = args[i + 1];
      i++;
    } else if (args[i] === '--disable-learning') {
      disableLearning = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log('LLM Presence Tracker - Analyze web pages for LLM discoverability\n');
      console.log('Usage: node main.js [options]\n');
      console.log('Options:');
      console.log('  --csv <file>         CSV file with URLs to analyze (default: sample-urls.csv)');
      console.log('  --output-dir <dir>   Output directory (default: output)');
      console.log('  --aikey <key>        Azure OpenAI API key for AI insights (optional)');
      console.log('  --disable-learning   Disable learning from past analyses (use fresh AI only)');
      console.log('  --help, -h           Show this help message\n');
      console.log('Example:');
      console.log('  node main.js --csv urls.csv --aikey YOUR_KEY');
      console.log('  node main.js --csv urls.csv --aikey YOUR_KEY --disable-learning');
      process.exit(0);
    }
  }
  
  if (disableLearning) {
    logger.info('⚠️  Learning system DISABLED - using fresh AI recommendations only');
  }
  
  if (aiKey) {
    AZURE_OPENAI_KEY = aiKey;
    logger.info('Azure OpenAI AI insights enabled');
  }
  
  // Load URLs from CSV
  const csvPath = path.isAbsolute(csvFile) ? csvFile : path.join(__dirname, csvFile);
  
  if (!await fs.pathExists(csvPath)) {
    logger.error(`CSV file not found: ${csvPath}`);
    process.exit(1);
  }
  
  const content = await fs.readFile(csvPath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  const hasHeader = lines[0].toLowerCase().includes('url');
  const headerRow = hasHeader ? lines[0] : null;
  const dataLines = hasHeader ? lines.slice(1) : lines;
  
  const columnNames = headerRow ? headerRow.split(',').map(c => c.trim()) : ['URL'];
  const urls = [];
  const originalCsvData = {};
  
  for (const line of dataLines) {
    const fields = line.split(',').map(f => f.trim().replace(/^["']+|["']+$/g, ''));
    const url = fields[0];
    
    if (url) {
      urls.push(url);
      const rowData = {};
      fields.forEach((field, index) => {
        rowData[columnNames[index] || `column_${index}`] = field;
      });
      originalCsvData[url] = rowData;
    }
  }
  
  if (urls.length === 0) {
    logger.error('No URLs found in CSV file');
    process.exit(1);
  }
  
  logger.info(`Loaded ${urls.length} URLs from ${csvFile}`);
  
  // Create output directory
  const outputPath = path.isAbsolute(outputDir) ? outputDir : path.join(__dirname, outputDir);
  await fs.ensureDir(outputPath);
  
  // Initialize browser
  logger.info('Initializing browser...');
  const chromePath = getChromeExecutablePath();
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chromePath
  });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const results = [];
  
  try {
    // Process URLs with concurrency control
    for (let i = 0; i < urls.length; i += CONCURRENCY) {
      const batch = urls.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(
        batch.map(url => analyzeUrl(browser, url, timestamp, originalCsvData[url] || {}, disableLearning))
      );
      results.push(...batchResults);
    }
    
    logger.info(`\n✅ Analysis complete! Processed ${results.length} URLs\n`);
    
    // Save individual analysis files and learn from each
    for (const result of results) {
      if (result.success) {
        const cleanUrl = result.analysis.url.replace(/:\/\//g, '_').replace(/\//g, '_').replace(/\./g, '_');
        const analysisPath = path.join(outputPath, `llm-presence-${cleanUrl}-${timestamp}.json`);
        await fs.writeJson(analysisPath, result.analysis, { spaces: 2 });
        
        // Add to examples library for future learning (if learning enabled)
        if (!disableLearning) {
          const searchData = originalCsvData[result.analysis.url] || {};
          await addExampleToLibrary(result, searchData);
        }
      }
    }
    
    // Log examples library stats (if learning enabled)
    if (!disableLearning) {
      const libStats = await getLibraryStats();
      logger.info(`📚 Examples Library: ${libStats.totalExamples} examples stored (avg score: ${libStats.averageScore})`);
    }
    
    // Generate summary CSV
    const csvContent = generateCSV(results, originalCsvData, columnNames);
    const csvOutputPath = path.join(outputPath, `llm-presence-summary_${timestamp}.csv`);
    await fs.writeFile(csvOutputPath, csvContent, 'utf8');
    
    // Generate summary report
    const summary = {
      timestamp,
      total_urls: urls.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      average_score: results
        .filter(r => r.success)
        .reduce((sum, r) => sum + r.analysis.llm_presence_score, 0) / 
        results.filter(r => r.success).length,
      results: results
    };
    
    const summaryPath = path.join(outputPath, `llm-presence-report_${timestamp}.json`);
    await fs.writeJson(summaryPath, summary, { spaces: 2 });
    
    logger.info(`📊 Summary Report:`);
    logger.info(`   Total URLs: ${summary.total_urls}`);
    logger.info(`   Successful: ${summary.successful}`);
    logger.info(`   Failed: ${summary.failed}`);
    logger.info(`   Average Score: ${(summary.average_score * 100).toFixed(1)}%\n`);
    logger.info(`📁 Output files:`);
    logger.info(`   CSV: ${csvOutputPath}`);
    logger.info(`   Report: ${summaryPath}`);
    logger.info(`   Individual analyses: ${outputPath}/llm-presence-*.json\n`);
    
  } catch (error) {
    logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  } finally {
    await browser.close();
    logger.info('Browser closed');
  }
}

// Run main
if (require.main === module) {
  main().catch(error => {
    logger.error(`Unhandled error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { analyzeUrl, analyzeLLMPresence };

