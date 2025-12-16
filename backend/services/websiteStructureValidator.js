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
    hasComparisons: false
  };
  
  // Check recommendations for structure indicators
  if (analysis.recommendations && Array.isArray(analysis.recommendations)) {
    analysis.recommendations.forEach(rec => {
      const recText = JSON.stringify(rec).toLowerCase();
      
      // If AI recommendations suggest adding tables/lists, it means they don't exist
      if (recText.includes('add') && recText.includes('table')) {
        structures.hasTables = false; // Explicitly doesn't have it
      }
      if (recText.includes('add') && recText.includes('list')) {
        structures.hasLists = false;
      }
      if (recText.includes('add') && recText.includes('faq')) {
        structures.hasFAQs = false;
      }
      if (recText.includes('add') && recText.includes('example')) {
        structures.hasExamples = false;
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
    
    // Count question types as FAQ indicators
    const allPrompts = [...awareness, ...consideration, ...conversion];
    structures.faqCount = allPrompts.length;
    structures.hasFAQs = structures.faqCount >= 3;
  }
  
  // Check LLM presence scores - high structure score suggests good formatting
  if (analysis.llmPresence?.structure >= 0.7) {
    structures.hasLists = true;
    structures.listCount = 2; // Estimate
  }
  
  // Check answerability - high score suggests FAQ-like content
  if (analysis.llmPresence?.answerability >= 0.7) {
    structures.hasFAQs = true;
    structures.faqCount = Math.max(structures.faqCount, 3);
  }
  
  return structures;
}

/**
 * Validate a single recommendation against existing structures
 */
function validateSingleRecommendation(recommendation, inventory, allUrls) {
  const contentStructure = recommendation.contentStructure || {};
  
  let existingUrls = [];
  let hasAll = true;
  let hasPartial = false;
  let missingElements = [];
  
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
  
  // Determine status and message
  let status, message, actionType;
  
  if (hasAll && existingUrls.length > 0) {
    status = 'exists';
    actionType = 'optimize';
    message = `✅ You already have this content structure on ${existingUrls.length} page(s), but it's not getting cited effectively. Focus on optimizing these pages.`;
  } else if (hasPartial && existingUrls.length > 0) {
    status = 'partial';
    actionType = 'expand';
    message = `⚠️ You have partial content on ${existingUrls.length} page(s). Missing: ${missingElements.join(', ')}. Expand existing pages or create new comprehensive content.`;
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
    actionType
  };
}

module.exports = {
  validateRecommendations
};

