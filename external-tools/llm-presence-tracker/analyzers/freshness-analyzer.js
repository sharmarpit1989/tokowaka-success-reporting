/**
 * Content Freshness Analyzer
 * Analyzes how current and time-sensitive the content is
 */

const { extractWordCount } = require('../utils/utils.js');

/**
 * Analyze content freshness indicators
 * @param {Object} $ - Cheerio instance
 * @param {string} text - Page text content
 * @returns {Object} Freshness analysis
 */
function analyzeFreshness($, text) {
  // Safety check for text parameter
  if (!text || typeof text !== 'string') {
    text = '';
  }
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const hasCurrentYear = text.includes(currentYear.toString());
  
  // Extract dates
  const dateRegex = /\b(202[0-9]|Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\b/gi;
  const dates = text.match(dateRegex) || [];
  
  // Count references to current year
  const currentYearMatches = (text.match(new RegExp(currentYear.toString(), 'g')) || []).length;
  
  // Check for time-sensitive keywords
  const freshnessKeywords = [
    'latest', 'new', 'updated', 'recent', 'current', 
    'now', 'today', currentYear.toString(), '2025',
    'upcoming', 'announced', 'released', 'launches',
    'breaking', 'just', 'this week', 'this month', 'this year'
  ];
  const freshnessMatches = freshnessKeywords.filter(kw => 
    text.toLowerCase().includes(kw.toLowerCase())
  );
  const freshnessCount = freshnessMatches.length;
  
  // Check for pricing (time-sensitive)
  const pricingRegex = /\$\d+(?:,\d{3})*(?:\.\d{2})?|₹\d+(?:,\d+)*|€\d+(?:,\d{3})*(?:\.\d{2})?|£\d+(?:,\d{3})*(?:\.\d{2})?/g;
  const priceMatches = text.match(pricingRegex) || [];
  const hasPricing = priceMatches.length > 0;
  const pricingCount = priceMatches.length;
  
  // Check for version numbers (software, products)
  const versionRegex = /\bv?\d+\.\d+(?:\.\d+)?(?:\.\d+)?|version\s+\d+|iOS\s+\d+|Android\s+\d+/gi;
  const versionMatches = text.match(versionRegex) || [];
  const hasVersionNumbers = versionMatches.length > 0;
  
  // Check last modified date from meta tags
  const lastModified = $('meta[property="article:modified_time"]').attr('content') ||
                       $('meta[name="last-modified"]').attr('content') ||
                       $('meta[property="article:published_time"]').attr('content') ||
                       $('time[datetime]').first().attr('datetime');
  
  let lastModifiedDate = null;
  let daysSinceModified = null;
  if (lastModified) {
    try {
      lastModifiedDate = new Date(lastModified);
      const now = new Date();
      daysSinceModified = Math.floor((now - lastModifiedDate) / (1000 * 60 * 60 * 24));
    } catch (e) {
      // Invalid date
    }
  }
  
  // Calculate freshness score
  const score = calculateFreshnessScore({
    hasCurrentYear,
    currentYearMatches,
    dateCount: dates.length,
    freshnessCount,
    hasPricing,
    pricingCount,
    hasVersionNumbers,
    daysSinceModified
  });
  
  return {
    score,
    hasCurrentYear,
    currentYearMatches,
    dateCount: dates.length,
    freshnessKeywords: freshnessMatches.slice(0, 10), // Top 10
    freshnessKeywordCount: freshnessCount,
    hasPricing,
    pricingCount,
    hasVersionNumbers,
    versionCount: versionMatches.length,
    lastModified,
    lastModifiedDate: lastModifiedDate ? lastModifiedDate.toISOString() : null,
    daysSinceModified,
    recommendations: generateFreshnessRecommendations({
      hasCurrentYear,
      freshnessCount,
      hasPricing,
      daysSinceModified
    })
  };
}

/**
 * Calculate freshness score (0-1)
 */
function calculateFreshnessScore(metrics) {
  let score = 0;
  
  // Current year mentions (25 points)
  if (metrics.hasCurrentYear) {
    score += 0.25;
    // Bonus for multiple mentions
    if (metrics.currentYearMatches > 5) score += 0.05;
  }
  
  // Freshness keywords (25 points)
  if (metrics.freshnessCount > 0) {
    score += Math.min(0.25, metrics.freshnessCount * 0.03);
  }
  
  // Pricing information (15 points)
  if (metrics.hasPricing) {
    score += 0.15;
  }
  
  // Version numbers (10 points)
  if (metrics.hasVersionNumbers) {
    score += 0.10;
  }
  
  // Dates mentioned (10 points)
  if (metrics.dateCount > 0) {
    score += Math.min(0.10, metrics.dateCount * 0.02);
  }
  
  // Recency of last modification (15 points)
  if (metrics.daysSinceModified !== null) {
    if (metrics.daysSinceModified <= 7) {
      score += 0.15; // Within a week
    } else if (metrics.daysSinceModified <= 30) {
      score += 0.12; // Within a month
    } else if (metrics.daysSinceModified <= 90) {
      score += 0.08; // Within 3 months
    } else if (metrics.daysSinceModified <= 180) {
      score += 0.04; // Within 6 months
    }
  }
  
  return Math.min(1.0, score);
}

/**
 * Generate recommendations for improving freshness
 */
function generateFreshnessRecommendations(metrics) {
  const recommendations = [];
  
  if (!metrics.hasCurrentYear) {
    recommendations.push('Add current year mentions to indicate content is up-to-date');
  }
  
  if (metrics.freshnessCount < 3) {
    recommendations.push('Include more freshness keywords (e.g., "latest", "new", "updated")');
  }
  
  if (!metrics.hasPricing && metrics.hasPricing !== undefined) {
    recommendations.push('Consider adding pricing information if applicable');
  }
  
  if (metrics.daysSinceModified > 180) {
    recommendations.push('Content is over 6 months old - consider updating');
  } else if (metrics.daysSinceModified > 90) {
    recommendations.push('Content is over 3 months old - review for currency');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Content freshness is good - maintain regular updates');
  }
  
  return recommendations;
}

module.exports = {
  analyzeFreshness
};

