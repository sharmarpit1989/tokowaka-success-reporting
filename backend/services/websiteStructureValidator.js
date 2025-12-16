/**
 * Website Structure Validator
 * Validates whether recommended content structures already exist on customer's website
 * Uses existing content analysis data to avoid redundant scraping
 */

const { createServiceLogger } = require('../utils/logger');
const logger = createServiceLogger('StructureValidator');

/**
 * Validate which recommended structures already exist on the website
 * @param {Array} recommendations - AI-generated recommendations
 * @param {Array} analyzedUrls - URLs that have been analyzed with content data
 * @param {Array} allUrls - All customer URLs (analyzed + unanalyzed)
 * @returns {Array} Enhanced recommendations with existence validation
 */
function validateRecommendations(recommendations, analyzedUrls, allUrls) {
  logger.info(`Validating ${recommendations.length} recommendations against ${analyzedUrls.length} analyzed URLs`);
  
  // Build a comprehensive structure inventory from analyzed URLs
  const structureInventory = buildStructureInventory(analyzedUrls);
  
  logger.info('Structure inventory:', {
    urlsWithTables: structureInventory.urlsWithTables.length,
    urlsWithLists: structureInventory.urlsWithLists.length,
    urlsWithSteps: structureInventory.urlsWithSteps.length,
    urlsWithFAQs: structureInventory.urlsWithFAQs.length,
    urlsWithExamples: structureInventory.urlsWithExamples.length
  });
  
  // Enhance each recommendation with validation
  const enhancedRecommendations = recommendations.map(rec => {
    const validation = validateSingleRecommendation(rec, structureInventory, allUrls);
    
    return {
      ...rec,
      validation: {
        status: validation.status, // 'exists', 'partial', 'missing'
        existingUrls: validation.existingUrls,
        message: validation.message,
        actionType: validation.actionType // 'optimize', 'create', 'expand'
      }
    };
  });
  
  return enhancedRecommendations;
}

/**
 * Build an inventory of content structures across analyzed URLs
 */
function buildStructureInventory(analyzedUrls) {
  const inventory = {
    urlsWithTables: [],
    urlsWithLists: [],
    urlsWithSteps: [],
    urlsWithFAQs: [],
    urlsWithExamples: [],
    urlsWithComparisons: [],
    structureByUrl: new Map()
  };
  
  analyzedUrls.forEach(urlData => {
    if (!urlData.contentAnalysis) return;
    
    const url = urlData.url;
    const analysis = urlData.contentAnalysis;
    
    // Analyze the content to detect structures
    const structures = detectStructures(analysis);
    
    inventory.structureByUrl.set(url, structures);
    
    // Build category lists
    if (structures.hasTables) inventory.urlsWithTables.push({ url, count: structures.tableCount });
    if (structures.hasLists) inventory.urlsWithLists.push({ url, count: structures.listCount });
    if (structures.hasSteps) inventory.urlsWithSteps.push({ url, count: structures.stepCount });
    if (structures.hasFAQs) inventory.urlsWithFAQs.push({ url, count: structures.faqCount });
    if (structures.hasExamples) inventory.urlsWithExamples.push({ url, count: structures.exampleCount });
    if (structures.hasComparisons) inventory.urlsWithComparisons.push({ url });
  });
  
  return inventory;
}

/**
 * Detect content structures from content analysis data
 */
function detectStructures(analysis) {
  const structures = {
    hasTables: false,
    tableCount: 0,
    hasLists: false,
    listCount: 0,
    hasSteps: false,
    stepCount: 0,
    hasFAQs: false,
    faqCount: 0,
    hasExamples: false,
    exampleCount: 0,
    hasComparisons: false,
    // ✨ NEW: Add LLM visibility metrics for better validation
    llmMetrics: {
      overallScore: analysis.llmPresence?.overallScore || 0,
      freshness: analysis.llmPresence?.freshness || 0,
      answerability: analysis.llmPresence?.answerability || 0,
      authority: analysis.llmPresence?.authority || 0,
      structure: analysis.llmPresence?.structure || 0,
      queryAlignment: analysis.llmPresence?.queryAlignment || 0
    },
    pageType: analysis.llmPresence?.pageType || 'Unknown'
  };
  
  // Check details object for actual structure counts
  if (analysis.details?.structure) {
    const structDetails = analysis.details.structure;
    
    // Tables
    if (structDetails.tableCount > 0) {
      structures.hasTables = true;
      structures.tableCount = structDetails.tableCount;
    }
    
    // Lists
    if (structDetails.listCount > 0) {
      structures.hasLists = true;
      structures.listCount = structDetails.listCount;
    }
    
    // Headings suggest structure
    if (structDetails.h2Count > 0 || structDetails.h3Count > 0) {
      structures.hasLists = true; // Well-structured content
      structures.listCount = Math.max(structures.listCount, 1);
    }
  }
  
  // Check answerability details for FAQ indicators
  if (analysis.details?.answerability) {
    const answerDetails = analysis.details.answerability;
    
    if (answerDetails.questionHeadingCount > 0) {
      structures.hasFAQs = true;
      structures.faqCount = answerDetails.questionHeadingCount;
    }
    
    if (answerDetails.directAnswerSections > 0) {
      structures.hasFAQs = true;
      structures.faqCount = Math.max(structures.faqCount, answerDetails.directAnswerSections);
    }
  }
  
  // Check recommendations for structure indicators (what's MISSING)
  if (analysis.recommendations && Array.isArray(analysis.recommendations)) {
    analysis.recommendations.forEach(rec => {
      const recText = JSON.stringify(rec).toLowerCase();
      
      // If AI recommendations suggest adding tables/lists, it means they don't exist
      if (recText.includes('add') && recText.includes('table')) {
        structures.hasTables = false; // Explicitly doesn't have it
        structures.tableCount = 0;
      }
      if (recText.includes('add') && recText.includes('list')) {
        structures.hasLists = false;
        structures.listCount = 0;
      }
      if (recText.includes('add') && recText.includes('faq')) {
        structures.hasFAQs = false;
        structures.faqCount = 0;
      }
      if (recText.includes('add') && recText.includes('example')) {
        structures.hasExamples = false;
        structures.exampleCount = 0;
      }
    });
  }
  
  // Check prompts data (if content answers comparison queries well, it likely has comparisons)
  if (analysis.prompts) {
    const { awareness = [], consideration = [], conversion = [] } = analysis.prompts;
    
    // If it has consideration-stage prompts, likely has comparison content
    if (consideration && consideration.length > 0) {
      structures.hasComparisons = true;
    }
    
    // Count question types as FAQ indicators (if not already counted)
    if (structures.faqCount === 0) {
      const allPrompts = [...awareness, ...consideration, ...conversion];
      structures.faqCount = allPrompts.length;
      structures.hasFAQs = structures.faqCount >= 3;
    }
  }
  
  // Use LLM presence scores as fallback indicators
  if (analysis.llmPresence) {
    // High structure score suggests good formatting
    if (analysis.llmPresence.structure >= 0.7 && !structures.hasLists) {
      structures.hasLists = true;
      structures.listCount = Math.max(structures.listCount, 2); // Estimate
    }
    
    // High answerability suggests FAQ-like content
    if (analysis.llmPresence.answerability >= 0.7 && !structures.hasFAQs) {
      structures.hasFAQs = true;
      structures.faqCount = Math.max(structures.faqCount, 3);
    }
  }
  
  return structures;
}

/**
 * Validate a single recommendation against existing structures
 */
function validateSingleRecommendation(recommendation, inventory, allUrls) {
  const contentStructure = recommendation.contentStructure || {};
  const metricFocus = recommendation.metricFocus || 'general';
  const targetUrls = recommendation.targetUrls || [];
  
  let existingUrls = [];
  let hasAll = true;
  let hasPartial = false;
  let missingElements = [];
  
  // ✨ NEW: If recommendation specifies target URLs, validate those specifically
  if (targetUrls.length > 0) {
    // This is a recommendation to improve specific existing pages
    targetUrls.forEach(targetUrl => {
      const structures = inventory.structureByUrl.get(targetUrl);
      if (structures) {
        existingUrls.push(targetUrl);
        
        // Check if the page has low LLM scores that need improvement
        const metrics = structures.llmMetrics;
        const focusMetricScore = metrics[metricFocus] || metrics.overallScore;
        
        if (focusMetricScore < 0.6) {
          hasPartial = true; // Exists but needs improvement
          
          // Identify what's missing based on metric focus
          if (metricFocus === 'structure' && !structures.hasLists) {
            missingElements.push('structured lists and headings');
          }
          if (metricFocus === 'answerability' && !structures.hasFAQs) {
            missingElements.push('FAQ section');
          }
          if (metricFocus === 'freshness') {
            missingElements.push('updated dates and current information');
          }
          if (metricFocus === 'authority') {
            missingElements.push('credibility signals and expert content');
          }
        }
      }
    });
    
    if (existingUrls.length > 0) {
      // Determine status based on LLM metrics
      const avgScore = existingUrls.reduce((sum, url) => {
        const structures = inventory.structureByUrl.get(url);
        return sum + (structures?.llmMetrics?.overallScore || 0);
      }, 0) / existingUrls.length;
      
      if (avgScore >= 0.7) {
        return {
          status: 'exists',
          existingUrls: existingUrls.slice(0, 3),
          message: `✅ Target pages exist with good LLM visibility (${(avgScore * 100).toFixed(0)}%). Minor optimizations recommended.`,
          actionType: 'optimize',
          llmScore: avgScore
        };
      } else if (avgScore >= 0.4) {
        return {
          status: 'partial',
          existingUrls: existingUrls.slice(0, 3),
          message: `⚠️ Target pages exist but have low LLM visibility (${(avgScore * 100).toFixed(0)}%). ${missingElements.length > 0 ? `Missing: ${missingElements.join(', ')}.` : 'Needs optimization.'}`,
          actionType: 'expand',
          llmScore: avgScore
        };
      } else {
        return {
          status: 'missing',
          existingUrls: existingUrls.slice(0, 3),
          message: `❌ Target pages have very low LLM visibility (${(avgScore * 100).toFixed(0)}%). Significant improvements needed: ${missingElements.join(', ') || 'comprehensive content overhaul'}.`,
          actionType: 'create',
          llmScore: avgScore
        };
      }
    }
  }
  
  // Original validation logic for general recommendations (no specific target URLs)
  // Check each recommended structure element
  if (contentStructure.tables > 0) {
    const urlsWithTables = inventory.urlsWithTables;
    if (urlsWithTables.length === 0) {
      hasAll = false;
      missingElements.push(`${contentStructure.tables} comparison tables`);
    } else if (urlsWithTables.length < contentStructure.tables) {
      hasPartial = true;
      existingUrls.push(...urlsWithTables.map(u => u.url));
    } else {
      existingUrls.push(...urlsWithTables.slice(0, contentStructure.tables).map(u => u.url));
    }
  }
  
  if (contentStructure.lists > 0) {
    const urlsWithLists = inventory.urlsWithLists;
    if (urlsWithLists.length === 0) {
      hasAll = false;
      missingElements.push(`${contentStructure.lists} structured lists`);
    } else if (urlsWithLists.length < contentStructure.lists) {
      hasPartial = true;
      existingUrls.push(...urlsWithLists.map(u => u.url));
    } else {
      existingUrls.push(...urlsWithLists.slice(0, contentStructure.lists).map(u => u.url));
    }
  }
  
  if (contentStructure.faqs > 0) {
    const urlsWithFAQs = inventory.urlsWithFAQs;
    if (urlsWithFAQs.length === 0) {
      hasAll = false;
      missingElements.push(`FAQ section with ${contentStructure.faqs} questions`);
    } else if (urlsWithFAQs.some(u => u.count < contentStructure.faqs)) {
      hasPartial = true;
      existingUrls.push(...urlsWithFAQs.map(u => u.url));
    } else {
      existingUrls.push(...urlsWithFAQs.slice(0, 1).map(u => u.url));
    }
  }
  
  if (contentStructure.steps > 0) {
    const urlsWithSteps = inventory.urlsWithSteps;
    if (urlsWithSteps.length === 0) {
      hasAll = false;
      missingElements.push(`${contentStructure.steps}-step guide`);
    } else {
      existingUrls.push(...urlsWithSteps.slice(0, 1).map(u => u.url));
      hasPartial = true;
    }
  }
  
  if (contentStructure.examples > 0) {
    const urlsWithExamples = inventory.urlsWithExamples;
    if (urlsWithExamples.length === 0) {
      hasAll = false;
      missingElements.push(`${contentStructure.examples} concrete examples`);
    } else if (urlsWithExamples.some(u => u.count < contentStructure.examples)) {
      hasPartial = true;
      existingUrls.push(...urlsWithExamples.map(u => u.url));
    } else {
      existingUrls.push(...urlsWithExamples.slice(0, 1).map(u => u.url));
    }
  }
  
  // Remove duplicates
  existingUrls = [...new Set(existingUrls)];
  
  // ✨ NEW: Calculate average LLM score for existing URLs
  let avgLLMScore = null;
  if (existingUrls.length > 0) {
    const scores = existingUrls
      .map(url => inventory.structureByUrl.get(url)?.llmMetrics?.overallScore)
      .filter(s => s != null);
    
    if (scores.length > 0) {
      avgLLMScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    }
  }
  
  // Determine status and message
  let status, message, actionType;
  
  if (hasAll && existingUrls.length > 0) {
    status = 'exists';
    actionType = 'optimize';
    const scoreText = avgLLMScore ? ` (avg LLM score: ${(avgLLMScore * 100).toFixed(0)}%)` : '';
    message = `✅ You already have this content structure on ${existingUrls.length} page(s)${scoreText}, but it's not getting cited effectively. Focus on optimizing these pages.`;
  } else if (hasPartial && existingUrls.length > 0) {
    status = 'partial';
    actionType = 'expand';
    const scoreText = avgLLMScore ? ` (avg LLM score: ${(avgLLMScore * 100).toFixed(0)}%)` : '';
    message = `⚠️ You have partial content on ${existingUrls.length} page(s)${scoreText}. Missing: ${missingElements.join(', ')}. Expand existing pages or create new comprehensive content.`;
  } else {
    status = 'missing';
    actionType = 'create';
    
    // Check if they have any analyzed URLs for this theme
    const theme = recommendation.theme;
    const analyzedCount = inventory.structureByUrl.size;
    const totalCount = allUrls.length;
    
    if (analyzedCount < totalCount) {
      message = `❌ Content gap detected. Not found on ${analyzedCount} analyzed pages (${totalCount - analyzedCount} pages not yet analyzed). Create new content: ${missingElements.join(', ')}.`;
    } else {
      message = `❌ Content gap detected. Not found on any of your ${analyzedCount} analyzed pages. Create new content: ${missingElements.join(', ')}.`;
    }
  }
  
  return {
    status,
    existingUrls: existingUrls.slice(0, 3), // Limit to top 3
    message,
    actionType,
    llmScore: avgLLMScore
  };
}

module.exports = {
  validateRecommendations
};

