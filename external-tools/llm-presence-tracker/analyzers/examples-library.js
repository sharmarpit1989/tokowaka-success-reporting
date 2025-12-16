const fs = require('fs-extra');
const path = require('path');

const LIBRARY_PATH = path.join(__dirname, '..', 'examples-library.json');

/**
 * Load examples library from disk
 */
async function loadExamplesLibrary() {
  try {
    if (await fs.pathExists(LIBRARY_PATH)) {
      return await fs.readJson(LIBRARY_PATH);
    }
  } catch (error) {
    console.error('Error loading examples library:', error.message);
  }
  
  return {
    version: '1.0',
    lastUpdated: null,
    examples: []
  };
}

/**
 * Save examples library to disk
 */
async function saveExamplesLibrary(library) {
  try {
    library.lastUpdated = new Date().toISOString();
    await fs.writeJson(LIBRARY_PATH, library, { spaces: 2 });
  } catch (error) {
    console.error('Error saving examples library:', error.message);
  }
}

/**
 * Extract learnable example from analysis result
 */
function extractExample(analysisResult, searchQueryData) {
  if (!analysisResult.success || !analysisResult.analysis.ai_insights) {
    return null;
  }
  
  const analysis = analysisResult.analysis;
  
  // Only save high-quality examples (score >= 75%)
  if (analysis.llm_presence_score < 0.75) {
    return null;
  }
  
  // Extract key characteristics
  const example = {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    
    // Page characteristics
    pageType: analysis.pageType?.primary || 'Unknown',
    pageTypeSecondary: analysis.pageType?.secondary || [],
    userIntent: searchQueryData.User_Intent || null,
    
    // Search queries if available
    searchQueries: searchQueryData.Top_Search_Queries ? 
      searchQueryData.Top_Search_Queries.split(';').map(q => q.trim()) : [],
    
    // Performance metrics
    scores: {
      overall: analysis.llm_presence_score,
      freshness: analysis.metrics?.freshness?.score || 0,
      answerability: analysis.metrics?.answerability?.score || 0,
      queryAlignment: analysis.metrics?.queryAlignment?.score || 0,
      snippetQuality: analysis.metrics?.snippetQuality?.score || 0
    },
    
    // Page features
    features: {
      hasQuestions: analysis.metrics?.answerability?.hasQuestions || false,
      hasSteps: analysis.metrics?.answerability?.hasSteps || false,
      hasDefinitions: analysis.metrics?.answerability?.hasDefinitions || false,
      hasComparisons: analysis.metrics?.answerability?.hasComparisons || false,
      h2Count: analysis.metrics?.answerability?.h2Count || 0,
      listCount: analysis.metrics?.answerability?.listCount || 0
    },
    
    // AI recommendations (first 300 chars as summary)
    recommendationSummary: analysis.ai_insights ? 
      analysis.ai_insights.substring(0, 300).replace(/\n+/g, ' ').trim() : null,
    
    // Full recommendations stored separately for reference
    fullRecommendations: analysis.ai_insights,
    
    // URL domain for similarity matching
    domain: extractDomain(analysis.url)
  };
  
  return example;
}

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return null;
  }
}

/**
 * Find similar examples from library
 */
function findSimilarExamples(library, currentPageType, currentIntent, currentQueries = [], limit = 3) {
  if (!library.examples || library.examples.length === 0) {
    return [];
  }
  
  // Score each example by similarity
  const scoredExamples = library.examples.map(example => {
    let score = 0;
    
    // Page type match (highest weight)
    if (example.pageType === currentPageType) {
      score += 50;
      
      // Secondary type match
      if (example.pageTypeSecondary && example.pageTypeSecondary.length > 0) {
        score += 10;
      }
    }
    
    // User intent match
    if (currentIntent && example.userIntent === currentIntent) {
      score += 30;
    }
    
    // Search query overlap
    if (currentQueries.length > 0 && example.searchQueries.length > 0) {
      const queryOverlap = currentQueries.filter(q1 => 
        example.searchQueries.some(q2 => 
          q1.toLowerCase().includes(q2.toLowerCase()) || 
          q2.toLowerCase().includes(q1.toLowerCase())
        )
      ).length;
      score += queryOverlap * 10;
    }
    
    // Recency bonus (prefer recent examples)
    const ageInDays = (Date.now() - new Date(example.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays < 30) score += 10;
    else if (ageInDays < 90) score += 5;
    
    return { example, score };
  });
  
  // Sort by score and return top matches
  return scoredExamples
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.example);
}

/**
 * Format similar examples for AI prompt
 */
function formatExamplesForPrompt(similarExamples) {
  if (!similarExamples || similarExamples.length === 0) {
    return '';
  }
  
  const exampleTexts = similarExamples.map((ex, index) => {
    const queries = ex.searchQueries.length > 0 ? 
      `\nSearch Queries: ${ex.searchQueries.slice(0, 3).join('; ')}` : '';
    
    return `
Example ${index + 1} (${ex.pageType}${ex.userIntent ? `, ${ex.userIntent} intent` : ''}):${queries}
Score: ${(ex.scores.overall * 100).toFixed(0)}%
Recommendations Applied:
${ex.recommendationSummary}...`;
  }).join('\n---');
  
  return `

LEARNED FROM PAST ANALYSES (use these as reference):
${exampleTexts}

NOTE: Use these examples as inspiration, but tailor your recommendations to this specific page's context.`;
}

/**
 * Add new example to library
 */
async function addExampleToLibrary(analysisResult, searchQueryData) {
  const example = extractExample(analysisResult, searchQueryData);
  
  if (!example) {
    return;
  }
  
  const library = await loadExamplesLibrary();
  
  // Add new example
  library.examples.push(example);
  
  // Keep only last 100 examples to prevent file from growing too large
  if (library.examples.length > 100) {
    library.examples = library.examples.slice(-100);
  }
  
  await saveExamplesLibrary(library);
}

/**
 * Get relevant examples for current analysis
 */
async function getRelevantExamples(pageType, userIntent, searchQueries = [], limit = 3) {
  const library = await loadExamplesLibrary();
  
  const queries = typeof searchQueries === 'string' ? 
    searchQueries.split(';').map(q => q.trim()) : searchQueries;
  
  const similarExamples = findSimilarExamples(library, pageType, userIntent, queries, limit);
  
  return formatExamplesForPrompt(similarExamples);
}

/**
 * Get library statistics
 */
async function getLibraryStats() {
  const library = await loadExamplesLibrary();
  
  const stats = {
    totalExamples: library.examples.length,
    lastUpdated: library.lastUpdated,
    pageTypes: {},
    averageScore: 0
  };
  
  if (library.examples.length > 0) {
    // Count by page type
    library.examples.forEach(ex => {
      stats.pageTypes[ex.pageType] = (stats.pageTypes[ex.pageType] || 0) + 1;
    });
    
    // Calculate average score
    const totalScore = library.examples.reduce((sum, ex) => sum + ex.scores.overall, 0);
    stats.averageScore = (totalScore / library.examples.length * 100).toFixed(1) + '%';
  }
  
  return stats;
}

module.exports = {
  addExampleToLibrary,
  getRelevantExamples,
  getLibraryStats,
  loadExamplesLibrary
};

