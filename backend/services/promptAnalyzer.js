/**
 * Prompt Analyzer Service
 * Analyzes prompt-level citation patterns and groups prompts thematically
 */

const { createServiceLogger } = require('../utils/logger');
const config = require('../utils/config');
const logger = createServiceLogger('PromptAnalyzer');

/**
 * Analyze prompt-level citation patterns from processed data
 * @param {Array} combinedData - Enriched brand presence data with citation flags
 * @param {Array<string>} targetUrls - User's target URLs
 * @returns {Object} Prompt analysis with themes, opportunities, and patterns
 */
function analyzePromptPatterns(combinedData, targetUrls) {
  logger.info(`Starting prompt analysis for ${combinedData.length} rows and ${targetUrls.length} target URLs`);

  // Extract domain for classification
  const domain = targetUrls.length > 0 ? extractDomain(targetUrls[0]) : null;
  
  // Step 1: Group data by unique prompts
  const promptMap = new Map();
  
  combinedData.forEach(row => {
    const prompt = row.prompt?.trim();
    if (!prompt) return;
    
    if (!promptMap.has(prompt)) {
      promptMap.set(prompt, {
        prompt,
        totalOccurrences: 0,
        citedYourUrls: 0,
        citedYourDomain: 0,
        citedOtherUrls: 0,
        weeks: new Set(),
        platforms: new Set(),
        citedUrlsList: [], // Which specific URLs got cited for this prompt
        allCitedUrls: [], // ALL URLs cited (yours + others)
        sampleAnswers: []
      });
    }
    
    const promptData = promptMap.get(prompt);
    promptData.totalOccurrences++;
    promptData.weeks.add(row.week);
    promptData.platforms.add(row.platform);
    
    // Track citations
    if (row.selected_url_cited === 'Y') {
      promptData.citedYourUrls++;
      
      // Extract which specific URL(s) were cited
      const sources = (row.sources || '').split(';').map(s => s.trim()).filter(s => s);
      sources.forEach(source => {
        const matchedUrl = targetUrls.find(target => urlsMatch(source, target));
        if (matchedUrl && !promptData.citedUrlsList.includes(matchedUrl)) {
          promptData.citedUrlsList.push(matchedUrl);
        }
      });
    }
    
    if (row.any_url_from_domain === 'Y') {
      promptData.citedYourDomain++;
    }
    
    // Collect all cited URLs (for content pattern analysis)
    const sources = (row.sources || '').split(';').map(s => s.trim()).filter(s => s);
    sources.forEach(source => {
      if (source && !promptData.allCitedUrls.includes(source)) {
        promptData.allCitedUrls.push(source);
      }
    });
    
    // Sample answers (limit to 2 per prompt)
    if (promptData.sampleAnswers.length < 2 && row.answer) {
      promptData.sampleAnswers.push({
        answer: row.answer,
        week: row.week,
        platform: row.platform,
        sources: sources
      });
    }
  });
  
  // Step 2: Convert to array and calculate rates
  const prompts = Array.from(promptMap.values()).map(p => ({
    ...p,
    weeks: Array.from(p.weeks).sort(),
    platforms: Array.from(p.platforms),
    yourUrlCitationRate: p.totalOccurrences > 0 ? p.citedYourUrls / p.totalOccurrences : 0,
    domainCitationRate: p.totalOccurrences > 0 ? p.citedYourDomain / p.totalOccurrences : 0,
    consistency: p.weeks.size // How many different weeks this prompt appeared
  }));
  
  logger.info(`Analyzed ${prompts.length} unique prompts`);
  
  // Step 3: Simple keyword-based thematic grouping (placeholder for AI)
  const themes = groupPromptsIntoThemes(prompts);
  
  logger.info(`Grouped prompts into ${themes.length} themes`);
  
  // Step 4: Identify content opportunities
  const opportunities = identifyContentOpportunities(themes, targetUrls);
  
  logger.info(`Identified ${opportunities.length} content opportunities`);
  
  return {
    totalUniquePrompts: prompts.length,
    themes,
    opportunities,
    prompts: prompts.slice(0, 100) // Return top 100 prompts for detailed view
  };
}

/**
 * Group prompts into themes using keyword analysis
 * This is a simple implementation - can be enhanced with AI
 */
function groupPromptsIntoThemes(prompts) {
  // Define theme keywords
  const themeDefinitions = [
    {
      name: 'Pricing & Plans',
      keywords: ['cost', 'price', 'pricing', 'plan', 'subscription', 'pay', 'free', 'trial', 'discount', 'refund'],
      funnelStage: 'conversion'
    },
    {
      name: 'Getting Started & Tutorials',
      keywords: ['how to', 'tutorial', 'guide', 'learn', 'beginner', 'start', 'basics', 'introduction', 'first'],
      funnelStage: 'awareness'
    },
    {
      name: 'Features & Capabilities',
      keywords: ['feature', 'can i', 'does it', 'support', 'capability', 'function', 'tool', 'option'],
      funnelStage: 'consideration'
    },
    {
      name: 'Comparisons',
      keywords: ['vs', 'versus', 'compare', 'comparison', 'alternative', 'better', 'difference', 'between'],
      funnelStage: 'consideration'
    },
    {
      name: 'Troubleshooting & Support',
      keywords: ['fix', 'error', 'problem', 'issue', 'troubleshoot', 'not working', 'help', 'support'],
      funnelStage: 'conversion'
    },
    {
      name: 'Best Practices',
      keywords: ['best', 'optimize', 'improve', 'tips', 'advice', 'should i', 'recommend'],
      funnelStage: 'consideration'
    }
  ];
  
  const themes = [];
  
  themeDefinitions.forEach(themeDef => {
    const matchingPrompts = prompts.filter(p => {
      const promptLower = p.prompt.toLowerCase();
      return themeDef.keywords.some(keyword => promptLower.includes(keyword));
    });
    
    if (matchingPrompts.length > 0) {
      // Calculate theme-level stats
      const totalOccurrences = matchingPrompts.reduce((sum, p) => sum + p.totalOccurrences, 0);
      const totalCitations = matchingPrompts.reduce((sum, p) => sum + p.citedYourUrls, 0);
      const citationRate = totalOccurrences > 0 ? totalCitations / totalOccurrences : 0;
      
      // Find most cited URLs for this theme
      const urlCitationCounts = {};
      matchingPrompts.forEach(p => {
        p.citedUrlsList.forEach(url => {
          urlCitationCounts[url] = (urlCitationCounts[url] || 0) + 1;
        });
      });
      
      const topCitedUrls = Object.entries(urlCitationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([url, count]) => ({ url, count }));
      
      themes.push({
        name: themeDef.name,
        funnelStage: themeDef.funnelStage,
        promptCount: matchingPrompts.length,
        totalOccurrences,
        citationRate,
        prompts: matchingPrompts.sort((a, b) => b.totalOccurrences - a.totalOccurrences).slice(0, 20),
        topCitedUrls
      });
    }
  });
  
  // Sort themes by opportunity (low citation rate + high prompt count)
  themes.sort((a, b) => {
    const scoreA = a.promptCount * (1 - a.citationRate);
    const scoreB = b.promptCount * (1 - b.citationRate);
    return scoreB - scoreA;
  });
  
  return themes;
}

/**
 * Identify content opportunities based on theme analysis
 */
function identifyContentOpportunities(themes, targetUrls) {
  const opportunities = [];
  
  themes.forEach(theme => {
    // Criteria for opportunity:
    // 1. Citation rate < 60% (room for improvement)
    // 2. At least 5 prompts in theme
    // 3. Appears in at least 2 weeks (consistent interest)
    
    if (theme.citationRate < 0.6 && theme.promptCount >= 5) {
      const weeksSet = new Set();
      theme.prompts.forEach(p => p.weeks.forEach(w => weeksSet.add(w)));
      
      if (weeksSet.size >= 2) {
        // Calculate priority based on volume and performance gap
        const volumeScore = theme.totalOccurrences;
        const performanceGap = 1 - theme.citationRate; // How much room for improvement
        const opportunityScore = volumeScore * performanceGap;
        
        opportunities.push({
          themeName: theme.name,
          funnelStage: theme.funnelStage,
          currentCitationRate: theme.citationRate,
          promptCount: theme.promptCount,
          totalOccurrences: theme.totalOccurrences,
          priority: opportunityScore > 50 ? 'high' : opportunityScore > 25 ? 'medium' : 'low',
          samplePrompts: theme.prompts.slice(0, 5).map(p => p.prompt),
          currentlyPerforming: theme.topCitedUrls.slice(0, 3)
        });
      }
    }
  });
  
  // Sort by opportunity score (volume × performance gap)
  return opportunities.sort((a, b) => {
    const scoreA = a.totalOccurrences * (1 - a.currentCitationRate);
    const scoreB = b.totalOccurrences * (1 - b.currentCitationRate);
    return scoreB - scoreA;
  });
}

/**
 * Helper: Extract domain from URL
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

/**
 * Helper: Normalize URL for comparison
 */
function normalizeURL(url) {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    let normalized = urlObj.origin + urlObj.pathname;
    normalized = normalized.toLowerCase().replace(/\/$/, '');
    return normalized;
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Helper: Check if two URLs match
 */
function urlsMatch(url1, url2) {
  return normalizeURL(url1) === normalizeURL(url2);
}

module.exports = {
  analyzePromptPatterns
};

