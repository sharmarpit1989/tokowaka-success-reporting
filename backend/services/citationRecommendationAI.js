/**
 * Citation Performance AI Recommendation Service
 * Generates context-aware, actionable recommendations using Azure OpenAI
 * Inspired by llm-presence-tracker's prompting methodology
 */

const config = require('../utils/config');
const { logger } = require('../utils/logger');

// Azure OpenAI configuration
const AZURE_OPENAI_ENDPOINT = config.azure.endpoint;
const AZURE_OPENAI_KEY = config.azure.apiKey;
const AZURE_API_VERSION = config.azure.apiVersion;
const AZURE_COMPLETION_DEPLOYMENT = config.azure.deployment;

/**
 * Generate AI-powered recommendations for citation performance
 * @param {Object} citationData - Citation performance data
 * @param {Array} selectedWeeks - Selected week filters
 * @param {Array} selectedUrls - Selected URL filters
 * @returns {Promise<Object>} AI-generated recommendations
 */
async function generateCitationRecommendations(citationData, selectedWeeks = [], selectedUrls = []) {
  if (!AZURE_OPENAI_KEY) {
    logger.warn('Azure OpenAI key not configured - returning placeholder recommendations');
    return {
      recommendations: [
        'AI recommendations unavailable: Azure OpenAI API key not configured',
        'Please configure AZURE_OPENAI_KEY in your environment variables to enable AI-powered insights'
      ],
      isAIGenerated: false
    };
  }

  try {
    // Process and analyze the data
    const analysis = analyzeCitationData(citationData, selectedWeeks, selectedUrls);
    
    // Build detailed context for AI
    const context = buildPromptContext(analysis);
    
    // Generate recommendations using Azure OpenAI
    const aiRecommendations = await callAzureOpenAI(context);
    
    return {
      recommendations: aiRecommendations,
      isAIGenerated: true,
      generatedAt: new Date().toISOString()
    };
    
  } catch (error) {
    logger.error('Error generating AI recommendations:', error);
    return {
      recommendations: [
        'Unable to generate AI recommendations at this time',
        'Please try again later or contact support if the issue persists'
      ],
      isAIGenerated: false,
      error: error.message
    };
  }
}

/**
 * Analyze citation data to extract key metrics and patterns
 */
function analyzeCitationData(citationData, selectedWeeks, selectedUrls) {
  const summaryRates = citationData.citationRates.filter(r => r.type === 'summary' || !r.type);
  
  // Apply filters
  const filteredData = summaryRates.filter(rate => {
    const weekMatch = selectedWeeks.length === 0 || selectedWeeks.includes(rate.week);
    let urlMatch = true;
    if (selectedUrls.length > 0 && rate.citedUrls) {
      urlMatch = rate.citedUrls.some(url => selectedUrls.includes(url));
    }
    return weekMatch && urlMatch;
  });

  // Aggregate by week
  const weeklyData = {};
  filteredData.forEach(rate => {
    if (!weeklyData[rate.week]) {
      weeklyData[rate.week] = {
        week: rate.week,
        totalPrompts: 0,
        totalCitations: 0,
        platforms: new Set(),
        citedUrls: new Set()
      };
    }
    weeklyData[rate.week].totalPrompts += rate.totalPrompts || 0;
    weeklyData[rate.week].totalCitations += rate.selectedUrlCitations || 0;
    weeklyData[rate.week].platforms.add(rate.platform);
    if (rate.citedUrls) {
      rate.citedUrls.forEach(url => weeklyData[rate.week].citedUrls.add(url));
    }
  });

  const weeklyTrends = Object.values(weeklyData)
    .map(w => ({
      ...w,
      rate: w.totalPrompts > 0 ? w.totalCitations / w.totalPrompts : 0,
      platformCount: w.platforms.size,
      urlCount: w.citedUrls.size,
      platforms: Array.from(w.platforms),
      citedUrls: Array.from(w.citedUrls)
    }))
    .sort((a, b) => a.week.localeCompare(b.week));

  // Calculate trends
  const getTrend = () => {
    if (weeklyTrends.length < 2) return { direction: 'stable', change: 0 };
    const recent = weeklyTrends.slice(-3);
    const older = weeklyTrends.slice(0, -3);
    if (older.length === 0) return { direction: 'stable', change: 0 };
    
    const recentAvg = recent.reduce((sum, w) => sum + w.rate, 0) / recent.length;
    const olderAvg = older.reduce((sum, w) => sum + w.rate, 0) / older.length;
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > 10) return { direction: 'improving', change };
    if (change < -10) return { direction: 'declining', change };
    return { direction: 'stable', change };
  };

  // Aggregate by platform
  const platformStats = {};
  filteredData.forEach(rate => {
    if (!platformStats[rate.platform]) {
      platformStats[rate.platform] = {
        totalPrompts: 0,
        selectedUrlCitations: 0,
        anyDomainCitations: 0,
        citedUrls: new Set(),
        weeks: new Set(),
        rates: []
      };
    }
    platformStats[rate.platform].totalPrompts += rate.totalPrompts || 0;
    platformStats[rate.platform].selectedUrlCitations += rate.selectedUrlCitations || 0;
    platformStats[rate.platform].anyDomainCitations += rate.anyDomainCitations || 0;
    platformStats[rate.platform].weeks.add(rate.week);
    platformStats[rate.platform].rates.push(rate.selectedUrlRate || 0);
    if (rate.citedUrls) {
      rate.citedUrls.forEach(url => platformStats[rate.platform].citedUrls.add(url));
    }
  });

  const platformList = Object.entries(platformStats).map(([platform, stats]) => {
    const selectedUrlRate = stats.totalPrompts > 0 ? (stats.selectedUrlCitations / stats.totalPrompts) : 0;
    const domainRate = stats.totalPrompts > 0 ? (stats.anyDomainCitations / stats.totalPrompts) : 0;
    
    // Calculate consistency
    const avg = stats.rates.reduce((sum, r) => sum + r, 0) / stats.rates.length;
    const variance = stats.rates.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / stats.rates.length;
    const stdDev = Math.sqrt(variance);
    const consistency = 1 - Math.min(stdDev / avg, 1);
    
    return {
      platform,
      totalPrompts: stats.totalPrompts,
      selectedUrlCitations: stats.selectedUrlCitations,
      selectedUrlRate,
      domainRate,
      citedUrls: Array.from(stats.citedUrls),
      weekCount: stats.weeks.size,
      consistency,
      rates: stats.rates
    };
  }).sort((a, b) => b.selectedUrlRate - a.selectedUrlRate);

  const trend = getTrend();
  const avgUrlRate = platformList.length > 0 
    ? platformList.reduce((sum, p) => sum + p.selectedUrlRate, 0) / platformList.length 
    : 0;

  const bestWeek = weeklyTrends.length > 0 
    ? weeklyTrends.reduce((best, current) => current.rate > best.rate ? current : best)
    : null;
  
  const worstWeek = weeklyTrends.length > 0
    ? weeklyTrends.reduce((worst, current) => current.rate < worst.rate ? current : worst)
    : null;

  return {
    domain: citationData.domain,
    totalUrls: citationData.targetUrls?.length || 0,
    targetUrls: citationData.targetUrls || [],
    weeklyTrends,
    platformList,
    trend,
    avgUrlRate,
    bestWeek,
    worstWeek,
    filteredData,
    filterContext: {
      selectedWeeks: selectedWeeks.length > 0 ? selectedWeeks : 'all',
      selectedUrls: selectedUrls.length > 0 ? selectedUrls : 'all'
    }
  };
}

/**
 * Build detailed prompt context following llm-presence-tracker methodology
 */
function buildPromptContext(analysis) {
  const {
    domain,
    totalUrls,
    targetUrls,
    weeklyTrends,
    platformList,
    trend,
    avgUrlRate,
    bestWeek,
    worstWeek,
    filterContext
  } = analysis;

  // Current state summary
  const currentState = `
DOMAIN: ${domain}
TRACKING: ${totalUrls} target URLs
TIME RANGE: ${weeklyTrends.length} weeks analyzed (${weeklyTrends[0]?.week} to ${weeklyTrends[weeklyTrends.length - 1]?.week})
PLATFORMS: ${platformList.length} platforms monitored

FILTERS APPLIED:
- Weeks: ${Array.isArray(filterContext.selectedWeeks) ? filterContext.selectedWeeks.join(', ') : filterContext.selectedWeeks}
- URLs: ${Array.isArray(filterContext.selectedUrls) ? `${filterContext.selectedUrls.length} specific URLs selected` : filterContext.selectedUrls}`;

  // Overall performance
  const overallPerformance = `
OVERALL CITATION PERFORMANCE:
Trend Direction: ${trend.direction.toUpperCase()} ${trend.direction !== 'stable' ? `(${trend.change > 0 ? '+' : ''}${trend.change.toFixed(1)}%)` : ''}
Average URL Citation Rate: ${(avgUrlRate * 100).toFixed(2)}%
Total Prompts Analyzed: ${weeklyTrends.reduce((sum, w) => sum + w.totalPrompts, 0).toLocaleString()}
Total Citations Received: ${weeklyTrends.reduce((sum, w) => sum + w.totalCitations, 0).toLocaleString()}`;

  // Weekly breakdown
  const weeklyBreakdown = `
WEEK-BY-WEEK PERFORMANCE (chronological):
${weeklyTrends.map((w, idx) => {
    const prev = idx > 0 ? weeklyTrends[idx - 1] : null;
    const change = prev ? ((w.rate - prev.rate) / prev.rate) * 100 : 0;
    return `Week ${w.week}: ${(w.rate * 100).toFixed(2)}% citation rate | ${w.totalCitations} citations from ${w.totalPrompts.toLocaleString()} prompts | ${w.platformCount} platforms${prev ? ` | ${change > 0 ? '↑' : '↓'} ${Math.abs(change).toFixed(1)}% vs prev week` : ''}`;
  }).join('\n')}

BEST WEEK: ${bestWeek?.week} (${(bestWeek.rate * 100).toFixed(2)}% rate, ${bestWeek.totalCitations} citations)
WORST WEEK: ${worstWeek?.week} (${(worstWeek.rate * 100).toFixed(2)}% rate, ${worstWeek.totalCitations} citations)
PERFORMANCE GAP: ${((bestWeek.rate - worstWeek.rate) * 100).toFixed(2)} percentage points`;

  // Platform breakdown
  const platformBreakdown = `
PLATFORM PERFORMANCE (sorted by citation rate):
${platformList.map((p, idx) => {
    const vsAvg = ((p.selectedUrlRate - avgUrlRate) / avgUrlRate) * 100;
    const performance = p.selectedUrlRate >= 0.15 ? 'EXCELLENT' : 
                       p.selectedUrlRate >= 0.10 ? 'GOOD' : 
                       p.selectedUrlRate >= 0.05 ? 'FAIR' : 'POOR';
    return `${idx + 1}. ${p.platform}: ${(p.selectedUrlRate * 100).toFixed(2)}% rate | ${p.selectedUrlCitations} citations | ${p.weekCount} weeks | Consistency: ${(p.consistency * 100).toFixed(0)}% | Performance: ${performance} | vs Avg: ${vsAvg > 0 ? '+' : ''}${vsAvg.toFixed(1)}%`;
  }).join('\n')}

TOP PERFORMER: ${platformList[0]?.platform} (${(platformList[0]?.selectedUrlRate * 100).toFixed(2)}%)
BOTTOM PERFORMER: ${platformList[platformList.length - 1]?.platform} (${(platformList[platformList.length - 1]?.selectedUrlRate * 100).toFixed(2)}%)
MOST CONSISTENT: ${platformList.reduce((best, p) => p.consistency > best.consistency ? p : best)?.platform}
MOST VARIABLE: ${platformList.reduce((worst, p) => p.consistency < worst.consistency ? p : worst)?.platform}`;

  // URL insights (top performers)
  const urlCitationCounts = {};
  analysis.filteredData.forEach(rate => {
    if (rate.citedUrls) {
      rate.citedUrls.forEach(url => {
        urlCitationCounts[url] = (urlCitationCounts[url] || 0) + 1;
      });
    }
  });
  
  const topUrls = Object.entries(urlCitationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const urlInsights = `
TOP 10 CITED URLS (by frequency across platforms/weeks):
${topUrls.map(([url, count], idx) => `${idx + 1}. ${url} (cited ${count} times)`).join('\n')}

SAMPLE TARGET URLS BEING TRACKED:
${targetUrls.slice(0, 5).map((url, idx) => `${idx + 1}. ${url}`).join('\n')}
${totalUrls > 5 ? `... and ${totalUrls - 5} more URLs` : ''}`;

  // Key patterns to highlight
  const patterns = `
KEY PATTERNS IDENTIFIED:
${trend.direction === 'improving' ? '✓ Citation performance trending upward - momentum is positive' : ''}
${trend.direction === 'declining' ? '✗ Citation performance declining - action needed' : ''}
${trend.direction === 'stable' ? '→ Performance stable - opportunity for optimization' : ''}
${bestWeek && worstWeek && ((bestWeek.rate - worstWeek.rate) / avgUrlRate) > 0.5 ? '⚠ High week-to-week variability - inconsistent results' : ''}
${platformList.some(p => p.selectedUrlRate >= 0.15) ? `✓ Strong performers exist: ${platformList.filter(p => p.selectedUrlRate >= 0.15).map(p => p.platform).join(', ')}` : ''}
${platformList.some(p => p.selectedUrlRate < 0.05) ? `✗ Weak performers need attention: ${platformList.filter(p => p.selectedUrlRate < 0.05).map(p => p.platform).join(', ')}` : ''}
${platformList.some(p => p.consistency < 0.5) ? `⚠ Variable platforms: ${platformList.filter(p => p.consistency < 0.5).map(p => p.platform).join(', ')} - investigate causes` : ''}`;

  return {
    currentState,
    overallPerformance,
    weeklyBreakdown,
    platformBreakdown,
    urlInsights,
    patterns,
    rawData: analysis
  };
}

/**
 * Call Azure OpenAI to generate recommendations
 */
async function callAzureOpenAI(context) {
  const prompt = `You are an expert AI Citation Performance Analyst helping ${context.rawData.domain} improve their visibility across AI platforms.

CONTEXT: This company tracks how often AI platforms (ChatGPT, Perplexity, Claude, etc.) cite their URLs when answering user questions.

${context.currentState}

${context.overallPerformance}

${context.weeklyBreakdown}

${context.platformBreakdown}

${context.urlInsights}

${context.patterns}

YOUR TASK:
Generate 3-5 specific, actionable, data-driven recommendations to improve citation performance.

CRITICAL RULES:
1. Be SPECIFIC - reference actual data points (weeks, platforms, rates, URLs)
2. Be ACTIONABLE - tell exactly what to do, not vague suggestions
3. Be DATA-DRIVEN - base recommendations on patterns in the data above
4. Be CONTEXTUAL - explain WHY based on the current state
5. Be IMPACTFUL - focus on changes that will meaningfully improve citation rates
6. Include CONCRETE EXAMPLES - show what to analyze, test, or change

GOOD RECOMMENDATIONS (specific, actionable, data-driven):
✓ "Analyze content from Week 45 which achieved ${context.rawData.bestWeek ? `${(context.rawData.bestWeek.rate * 100).toFixed(1)}%` : 'best'} citation rate - ${context.rawData.bestWeek?.totalCitations} citations from ${context.rawData.bestWeek?.platforms?.join(', ')}. Identify what topics, formats, or URLs performed best that week and replicate those elements in upcoming content. Compare the top 3 cited URLs from that week against lower-performing weeks to find patterns."

✓ "Focus content optimization efforts on ${context.rawData.platformList[0]?.platform} which shows both high performance (${(context.rawData.platformList[0]?.selectedUrlRate * 100).toFixed(1)}% rate) and consistency (${(context.rawData.platformList[0]?.consistency * 100).toFixed(0)}% score). This platform has cited ${context.rawData.platformList[0]?.citedUrls.length} unique URLs across ${context.rawData.platformList[0]?.weekCount} weeks, suggesting reliable discovery of your content. Prioritize creating more content similar to your top-cited URLs on this platform."

✓ "Investigate why ${context.rawData.platformList[context.rawData.platformList.length - 1]?.platform} consistently underperforms (${(context.rawData.platformList[context.rawData.platformList.length - 1]?.selectedUrlRate * 100).toFixed(1)}% vs ${(context.rawData.avgUrlRate * 100).toFixed(1)}% average). Test whether this platform responds better to specific content formats (how-tos, comparisons, tutorials) or topics. Run a 2-week experiment creating 5 pieces of content optimized for this platform's likely user queries."

BAD RECOMMENDATIONS (too vague, no context):
✗ "Improve your content strategy" - HOW? Which content? Based on what data?
✗ "Focus on better platforms" - Which ones? Why? What makes them better?
✗ "Create more content" - What type? For which platform? About what?
✗ "Monitor your performance" - That's already being done. What ACTION to take?

QUALITY REQUIREMENTS:
Each recommendation must:
- Start with a specific action verb (Analyze, Test, Focus, Investigate, Optimize, Create, etc.)
- Reference specific data points from above (weeks, platforms, rates, URLs, counts)
- Explain WHY it matters (what pattern or insight drives this)
- Include concrete next steps or criteria for success
- Be 3-5 sentences with complete details
- Focus on business value (revenue, reach, discoverability) not just metrics

OUTPUT FORMAT (JSON):

{
  "recommendations": [
    "Recommendation 1: Specific action + data reference + reason + concrete steps",
    "Recommendation 2: Specific action + data reference + reason + concrete steps",
    "Recommendation 3: Specific action + data reference + reason + concrete steps"
  ]
}

Generate recommendations now:`;

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
            content: 'You are an expert AI Citation Performance Analyst who provides specific, data-driven, actionable recommendations. You always output valid JSON and reference actual data points.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.95
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No content in Azure OpenAI response');
  }

  // Parse JSON response
  try {
    const parsed = JSON.parse(content);
    return parsed.recommendations || [];
  } catch (parseError) {
    logger.warn('Failed to parse AI response as JSON, attempting to extract recommendations');
    // Fallback: try to extract recommendations from text
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('{') && !line.startsWith('}'));
    return lines.length > 0 ? lines : ['Unable to parse AI recommendations'];
  }
}

module.exports = {
  generateCitationRecommendations
};

