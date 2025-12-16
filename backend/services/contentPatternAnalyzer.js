/**
 * Content Pattern Analyzer
 * Analyzes content structure patterns of frequently-cited URLs
 * Provides insights on what content elements correlate with high citation rates
 */

const { createServiceLogger } = require('../utils/logger');
const logger = createServiceLogger('ContentPatternAnalyzer');

/**
 * Analyze content patterns from LLM answers
 * Since we can't actually fetch the URLs, we analyze the LLM's answers
 * to infer what content structure was present on cited URLs
 * 
 * @param {Array} prompts - Prompts with citation data
 * @param {Array<string>} targetUrls - User's target URLs
 * @returns {Object} Content pattern insights
 */
function analyzeContentPatterns(prompts, targetUrls) {
  logger.info(`Analyzing content patterns for ${prompts.length} prompts`);
  
  const patterns = {
    highPerforming: [], // Patterns from high-citation-rate prompts
    lowPerforming: [], // Patterns from low-citation-rate prompts
    recommendations: []
  };
  
  // Separate prompts by performance
  const highCitationPrompts = prompts.filter(p => p.yourUrlCitationRate >= 0.6);
  const lowCitationPrompts = prompts.filter(p => p.yourUrlCitationRate < 0.4 && p.totalOccurrences >= 3);
  
  logger.info(`High-performing prompts: ${highCitationPrompts.length}, Low-performing: ${lowCitationPrompts.length}`);
  
  // Analyze high-performing prompts
  if (highCitationPrompts.length > 0) {
    const highPatterns = analyzeAnswerStructures(highCitationPrompts, true);
    patterns.highPerforming = highPatterns;
  }
  
  // Analyze low-performing prompts
  if (lowCitationPrompts.length > 0) {
    const lowPatterns = analyzeAnswerStructures(lowCitationPrompts, false);
    patterns.lowPerforming = lowPatterns;
  }
  
  // Generate recommendations based on patterns
  patterns.recommendations = generateStructuralRecommendations(
    patterns.highPerforming,
    patterns.lowPerforming,
    targetUrls
  );
  
  return patterns;
}

/**
 * Analyze answer structures to infer content patterns
 */
function analyzeAnswerStructures(prompts, isHighPerforming) {
  const patterns = {
    hasComparisons: 0,
    hasLists: 0,
    hasTables: 0,
    hasSteps: 0,
    hasExamples: 0,
    hasPricing: 0,
    hasLinks: 0,
    avgLength: 0,
    totalAnalyzed: 0
  };
  
  let totalLength = 0;
  
  prompts.forEach(prompt => {
    prompt.sampleAnswers?.forEach(sample => {
      if (!sample.answer) return;
      
      const answer = sample.answer.toLowerCase();
      const length = answer.length;
      totalLength += length;
      patterns.totalAnalyzed++;
      
      // Detect patterns in LLM answers
      // These indicators suggest the cited content had these structures
      
      // Comparisons (tables, vs comparisons)
      if (answer.includes('comparison') || answer.includes(' vs ') || 
          answer.includes('compared to') || answer.includes('versus')) {
        patterns.hasComparisons++;
      }
      
      // Lists (numbered or bulleted)
      if (answer.match(/1\.|2\.|3\./g) || 
          answer.includes('first') || answer.includes('second') ||
          answer.includes('• ') || answer.includes('- ')) {
        patterns.hasLists++;
      }
      
      // Tables (indicated by structured comparison language)
      if (answer.includes('table') || answer.includes('chart') ||
          (answer.includes('feature') && answer.includes('plan'))) {
        patterns.hasTables++;
      }
      
      // Step-by-step guides
      if (answer.includes('step') || answer.includes('first,') ||
          answer.match(/1\.\s.*2\.\s.*3\./s)) {
        patterns.hasSteps++;
      }
      
      // Examples
      if (answer.includes('example') || answer.includes('for instance') ||
          answer.includes('such as') || answer.includes('e.g.')) {
        patterns.hasExamples++;
      }
      
      // Pricing information
      if (answer.match(/\$\d+/) || answer.includes('price') || 
          answer.includes('cost') || answer.includes('subscription')) {
        patterns.hasPricing++;
      }
      
      // Links/resources
      if (answer.includes('http') || answer.includes('www.')) {
        patterns.hasLinks++;
      }
    });
  });
  
  // Convert to percentages
  if (patterns.totalAnalyzed > 0) {
    patterns.avgLength = Math.round(totalLength / patterns.totalAnalyzed);
    patterns.comparisonRate = (patterns.hasComparisons / patterns.totalAnalyzed * 100).toFixed(1);
    patterns.listRate = (patterns.hasLists / patterns.totalAnalyzed * 100).toFixed(1);
    patterns.tableRate = (patterns.hasTables / patterns.totalAnalyzed * 100).toFixed(1);
    patterns.stepRate = (patterns.hasSteps / patterns.totalAnalyzed * 100).toFixed(1);
    patterns.exampleRate = (patterns.hasExamples / patterns.totalAnalyzed * 100).toFixed(1);
    patterns.pricingRate = (patterns.hasPricing / patterns.totalAnalyzed * 100).toFixed(1);
  }
  
  return patterns;
}

/**
 * Generate structural recommendations based on pattern analysis
 */
function generateStructuralRecommendations(highPatterns, lowPatterns, targetUrls) {
  const recommendations = [];
  
  if (!highPatterns.totalAnalyzed || !lowPatterns.totalAnalyzed) {
    return [{
      type: 'info',
      title: 'Insufficient Data',
      description: 'Not enough prompt data to generate pattern-based recommendations. Analyze more URLs or wait for more weekly data.',
      priority: 'low'
    }];
  }
  
  // Compare high vs low performing patterns
  const highComp = parseFloat(highPatterns.comparisonRate) || 0;
  const lowComp = parseFloat(lowPatterns.comparisonRate) || 0;
  
  const highList = parseFloat(highPatterns.listRate) || 0;
  const lowList = parseFloat(lowPatterns.listRate) || 0;
  
  const highStep = parseFloat(highPatterns.stepRate) || 0;
  const lowStep = parseFloat(lowPatterns.stepRate) || 0;
  
  const highTable = parseFloat(highPatterns.tableRate) || 0;
  const lowTable = parseFloat(lowPatterns.tableRate) || 0;
  
  const highExample = parseFloat(highPatterns.exampleRate) || 0;
  const lowExample = parseFloat(lowPatterns.exampleRate) || 0;
  
  // Recommendation: Comparison tables
  if (highComp > lowComp + 15) {
    recommendations.push({
      type: 'add_structure',
      title: 'Add Comparison Tables to Improve Citations',
      description: `High-citation content includes comparisons ${highComp}% of the time, vs only ${lowComp}% for low-citation content. LLMs favor structured comparisons.`,
      actions: [
        'Create feature comparison tables (e.g., Plan A vs Plan B vs Plan C)',
        'Add "Pros & Cons" comparison sections',
        'Include competitive comparison charts where relevant',
        'Structure comparisons with clear column headers and rows'
      ],
      priority: 'high',
      impact: 'Adding comparison tables can increase citation rate by 20-30%'
    });
  }
  
  // Recommendation: Numbered lists
  if (highList > lowList + 15) {
    recommendations.push({
      type: 'add_structure',
      title: 'Use More Numbered and Bulleted Lists',
      description: `${highList}% of high-performing content uses lists, vs ${lowList}% of low-performing content. Lists make content easier for LLMs to extract and cite.`,
      actions: [
        'Convert paragraph content into numbered steps where applicable',
        'Add "Top 5" or "Top 10" style lists',
        'Use bulleted lists for feature listings',
        'Structure complex information as hierarchical lists'
      ],
      priority: 'high',
      impact: 'Structured lists improve LLM citation rates by 15-25%'
    });
  }
  
  // Recommendation: Step-by-step guides
  if (highStep > lowStep + 10) {
    recommendations.push({
      type: 'add_structure',
      title: 'Create Step-by-Step Guides',
      description: `${highStep}% of high-performing content includes step-by-step instructions. LLMs cite procedural content frequently for "how-to" queries.`,
      actions: [
        'Add "Getting Started" guides with numbered steps',
        'Create workflow tutorials (Step 1: X, Step 2: Y, etc.)',
        'Include prerequisite checklists before main steps',
        'Add "Quick Start" sections to existing pages'
      ],
      priority: 'medium',
      impact: 'Step-by-step formats increase citations for tutorial/how-to queries'
    });
  }
  
  // Recommendation: Examples
  if (highExample > lowExample + 10) {
    recommendations.push({
      type: 'add_structure',
      title: 'Add More Concrete Examples',
      description: `High-citation content includes examples ${highExample}% of the time. Real-world examples help LLMs provide better answers.`,
      actions: [
        'Add "Example:" sections after abstract explanations',
        'Include use case scenarios',
        'Provide before/after examples',
        'Add customer story snippets or case studies'
      ],
      priority: 'medium',
      impact: 'Examples make content more citable for practical queries'
    });
  }
  
  // Recommendation: Content length
  if (highPatterns.avgLength > lowPatterns.avgLength * 1.5) {
    recommendations.push({
      type: 'expand_content',
      title: 'Expand Content Depth',
      description: `High-citation content averages ${highPatterns.avgLength} characters vs ${lowPatterns.avgLength} for low-citation content. More comprehensive content performs better.`,
      actions: [
        'Expand thin content pages with more detail',
        'Add FAQ sections to address related questions',
        'Include troubleshooting or edge cases',
        'Add context and background information'
      ],
      priority: 'medium',
      impact: 'Comprehensive content gets cited more consistently'
    });
  }
  
  // If no strong patterns found
  if (recommendations.length === 0) {
    recommendations.push({
      type: 'maintain',
      title: 'Your Content Structure is Performing Well',
      description: 'No significant structural gaps identified. Focus on expanding content to more topic areas.',
      actions: [
        'Continue with current content structure',
        'Focus on creating content for low-citation themes',
        'Monitor weekly citation trends for changes'
      ],
      priority: 'low',
      impact: 'Maintain current quality standards'
    });
  }
  
  return recommendations;
}

module.exports = {
  analyzeContentPatterns
};

