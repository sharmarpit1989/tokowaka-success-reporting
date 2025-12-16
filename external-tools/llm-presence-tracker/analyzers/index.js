/**
 * Central export for all LLM presence analyzers
 */

const { analyzeFreshness } = require('./freshness-analyzer.js');
const { analyzeAnswerability } = require('./answerability-analyzer.js');
const { analyzeQueryAlignment } = require('./query-alignment-analyzer.js');
const { analyzeSnippetQuality } = require('./snippet-optimizer.js');

/**
 * Run complete LLM presence analysis
 * @param {Object} $ - Cheerio instance
 * @param {string} htmlContent - Full HTML content
 * @param {string} textContent - Extracted text content
 * @param {string} title - Page title
 * @returns {Object} Complete LLM presence analysis
 */
function analyzeLLMPresence($, htmlContent, textContent, title) {
  // Run all analyzers
  const freshness = analyzeFreshness($, textContent);
  const answerability = analyzeAnswerability($, textContent);
  const queryAlignment = analyzeQueryAlignment(textContent, title);
  const snippetQuality = analyzeSnippetQuality($, textContent);
  
  // Calculate overall LLM presence score with weighted average
  const weights = {
    freshness: 0.20,
    answerability: 0.25,
    queryAlignment: 0.15,
    snippetQuality: 0.15,
    // Authority and structure will be added separately (0.15 + 0.10 = 0.25)
  };
  
  const baseScore = 
    freshness.score * weights.freshness +
    answerability.score * weights.answerability +
    queryAlignment.score * weights.queryAlignment +
    snippetQuality.score * weights.snippetQuality;
  
  // Aggregate all recommendations
  const allRecommendations = [
    ...freshness.recommendations.map(r => ({ category: 'Freshness', text: r })),
    ...answerability.recommendations.map(r => ({ category: 'Answerability', text: r })),
    ...queryAlignment.recommendations.map(r => ({ category: 'Query Alignment', text: r })),
    ...snippetQuality.recommendations.map(r => ({ category: 'Snippet Quality', text: r }))
  ];
  
  return {
    overallScore: baseScore, // Will be adjusted after authority/structure analysis
    freshness,
    answerability,
    queryAlignment,
    snippetQuality,
    recommendations: allRecommendations,
    weights
  };
}

/**
 * Calculate final LLM presence score including authority and structure
 * @param {number} baseScore - Score from core analyzers
 * @param {number} authorityScore - Authority analysis score
 * @param {number} structureScore - Structure analysis score
 * @returns {number} Final weighted score
 */
function calculateFinalScore(baseScore, authorityScore, structureScore) {
  // Base score accounts for 65% (freshness, answerability, query, snippet)
  // Add remaining 35% (authority 15%, structure 10%, buffer 10%)
  const finalScore = (baseScore * 0.65) + (authorityScore * 0.15) + (structureScore * 0.10);
  return Math.min(1.0, finalScore);
}

/**
 * Get score interpretation
 * @param {number} score - LLM presence score (0-1)
 * @returns {Object} Interpretation
 */
function interpretScore(score) {
  if (score >= 0.80) {
    return {
      rating: 'Excellent',
      color: 'green',
      summary: 'Highly discoverable by LLMs. Content is well-optimized.',
      action: 'Maintain and expand current approach'
    };
  } else if (score >= 0.60) {
    return {
      rating: 'Good',
      color: 'blue',
      summary: 'Good LLM discoverability with room for improvement.',
      action: 'Minor optimizations recommended'
    };
  } else if (score >= 0.40) {
    return {
      rating: 'Fair',
      color: 'yellow',
      summary: 'Moderate LLM discoverability. Significant improvements possible.',
      action: 'Significant improvements needed'
    };
  } else {
    return {
      rating: 'Poor',
      color: 'red',
      summary: 'Low LLM discoverability. Major improvements required.',
      action: 'Major overhaul required'
    };
  }
}

module.exports = {
  analyzeLLMPresence,
  analyzeFreshness,
  analyzeAnswerability,
  analyzeQueryAlignment,
  analyzeSnippetQuality,
  calculateFinalScore,
  interpretScore
};

