/**
 * AI Visibility Analysis Recommendation Service
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
 * Generate AI-powered recommendations for visibility analysis dashboard
 * @param {Object} dashboard - Full dashboard data with URLs and analysis
 * @returns {Promise<Object>} AI-generated recommendations
 */
async function generateVisibilityRecommendations(dashboard) {
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
    // Process and analyze the dashboard data
    const analysis = analyzeDashboardData(dashboard);
    
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
 * Analyze dashboard data to extract key metrics and patterns
 */
function analyzeDashboardData(dashboard) {
  const urls = dashboard.urls || [];
  
  // Calculate LLM score for each URL
  const urlsWithScores = urls.map(url => {
    let llmScore = 0;
    let llmPresence = null;
    
    if (url.hasContentAnalysis && url.contentAnalysis?.llmPresence) {
      llmPresence = url.contentAnalysis.llmPresence;
      const scores = Object.values(llmPresence);
      llmScore = scores.reduce((sum, val) => sum + val, 0) / scores.length;
    }
    
    return {
      url: url.url,
      citationRate: url.citationRate || 0,
      hasCitationData: url.hasCitationData || false,
      hasContentAnalysis: url.hasContentAnalysis || false,
      llmScore,
      llmPresence,
      hasRecommendations: url.contentAnalysis?.recommendations?.length > 0
    };
  });

  // Categorize URLs
  const analyzed = urlsWithScores.filter(u => u.hasContentAnalysis);
  const withCitations = urlsWithScores.filter(u => u.hasCitationData);
  const highPerformers = analyzed.filter(u => u.llmScore >= 0.7 && u.citationRate >= 0.10);
  const lowPerformers = analyzed.filter(u => u.llmScore < 0.5 || (u.hasCitationData && u.citationRate < 0.05));
  const missingAnalysis = urlsWithScores.filter(u => !u.hasContentAnalysis);

  // Calculate averages
  const avgLLMScore = analyzed.length > 0 
    ? analyzed.reduce((sum, u) => sum + u.llmScore, 0) / analyzed.length 
    : 0;
  
  const avgCitationRate = withCitations.length > 0
    ? withCitations.reduce((sum, u) => sum + u.citationRate, 0) / withCitations.length
    : 0;

  // Identify metric-specific patterns
  const metricBreakdown = analyzed.reduce((acc, url) => {
    if (url.llmPresence) {
      Object.entries(url.llmPresence).forEach(([metric, score]) => {
        if (!acc[metric]) {
          acc[metric] = { total: 0, count: 0, low: [], high: [] };
        }
        acc[metric].total += score;
        acc[metric].count++;
        
        if (score < 0.5) {
          acc[metric].low.push({ url: url.url, score });
        } else if (score >= 0.8) {
          acc[metric].high.push({ url: url.url, score });
        }
      });
    }
    return acc;
  }, {});

  const metricAverages = Object.entries(metricBreakdown).map(([metric, data]) => ({
    metric,
    average: data.count > 0 ? data.total / data.count : 0,
    lowCount: data.low.length,
    highCount: data.high.length,
    sampleLow: data.low.slice(0, 3),
    sampleHigh: data.high.slice(0, 3)
  })).sort((a, b) => a.average - b.average);

  // Correlation between LLM score and citation rate
  const correlation = calculateCorrelation(
    analyzed.filter(u => u.hasCitationData),
    'llmScore',
    'citationRate'
  );

  return {
    summary: dashboard.summary,
    totalUrls: urls.length,
    analyzedCount: analyzed.length,
    withCitationsCount: withCitations.length,
    missingAnalysisCount: missingAnalysis.length,
    avgLLMScore,
    avgCitationRate,
    highPerformers,
    lowPerformers,
    metricAverages,
    correlation,
    urlsWithScores,
    analyzed
  };
}

/**
 * Calculate correlation between two metrics
 */
function calculateCorrelation(data, metric1, metric2) {
  if (data.length < 3) return { strength: 'unknown', value: 0 };

  const x = data.map(d => d[metric1]);
  const y = data.map(d => d[metric2]);
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumX2 = x.reduce((a, b) => a + b * b, 0);
  const sumY2 = y.reduce((a, b) => a + b * b, 0);

  const numerator = (n * sumXY) - (sumX * sumY);
  const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));
  
  if (denominator === 0) return { strength: 'unknown', value: 0 };
  
  const r = numerator / denominator;
  
  let strength = 'unknown';
  if (Math.abs(r) >= 0.7) strength = 'strong';
  else if (Math.abs(r) >= 0.4) strength = 'moderate';
  else if (Math.abs(r) >= 0.2) strength = 'weak';
  else strength = 'negligible';

  return { strength, value: r };
}

/**
 * Build detailed prompt context following llm-presence-tracker methodology
 */
function buildPromptContext(analysis) {
  const {
    summary,
    totalUrls,
    analyzedCount,
    withCitationsCount,
    missingAnalysisCount,
    avgLLMScore,
    avgCitationRate,
    highPerformers,
    lowPerformers,
    metricAverages,
    correlation
  } = analysis;

  // Current state summary
  const currentState = `
DOMAIN ANALYSIS OVERVIEW:
Total URLs: ${totalUrls}
Analyzed URLs: ${analyzedCount} (${((analyzedCount / totalUrls) * 100).toFixed(1)}%)
URLs with Citation Data: ${withCitationsCount} (${((withCitationsCount / totalUrls) * 100).toFixed(1)}%)
Missing Analysis: ${missingAnalysisCount} URLs

OVERALL PERFORMANCE:
Average LLM Score: ${(avgLLMScore * 100).toFixed(1)}%
Average Citation Rate: ${(avgCitationRate * 100).toFixed(2)}%
High Performers: ${highPerformers.length} URLs (LLM ≥70% + Citations ≥10%)
Low Performers: ${lowPerformers.length} URLs (LLM <50% or Citations <5%)`;

  // Metric breakdown
  const metricBreakdown = `
LLM PRESENCE METRICS (sorted by average - weakest first):
${metricAverages.map((m, idx) => `${idx + 1}. ${m.metric}: ${(m.average * 100).toFixed(1)}% average | ${m.lowCount} low (<50%) | ${m.highCount} high (≥80%)`).join('\n')}

WEAKEST METRIC: ${metricAverages[0]?.metric} (${(metricAverages[0]?.average * 100).toFixed(1)}% average)
  ${metricAverages[0]?.lowCount} URLs scoring below 50%
  Sample low-scoring URLs:
${metricAverages[0]?.sampleLow.map(u => `    - ${u.url} (${(u.score * 100).toFixed(0)}%)`).join('\n') || '    (none)'}

STRONGEST METRIC: ${metricAverages[metricAverages.length - 1]?.metric} (${(metricAverages[metricAverages.length - 1]?.average * 100).toFixed(1)}% average)
  ${metricAverages[metricAverages.length - 1]?.highCount} URLs scoring 80% or above`;

  // Correlation insights
  const correlationInsight = `
CORRELATION ANALYSIS:
LLM Score vs Citation Rate: ${correlation.strength.toUpperCase()} correlation (r=${correlation.value.toFixed(2)})
${correlation.value > 0.4 ? '✓ Strong positive relationship - improving LLM scores likely improves citations' :
  correlation.value > 0 ? '→ Moderate relationship - LLM scores somewhat influence citations' :
  '⚠ Weak or negative relationship - other factors may be more important'}`;

  // High performers analysis
  const highPerformersAnalysis = highPerformers.length > 0 ? `
HIGH PERFORMERS (${highPerformers.length} URLs):
These URLs have both strong LLM scores (≥70%) AND good citation rates (≥10%):
${highPerformers.slice(0, 5).map((u, idx) => `${idx + 1}. ${u.url}
   LLM Score: ${(u.llmScore * 100).toFixed(1)}% | Citation Rate: ${(u.citationRate * 100).toFixed(2)}%`).join('\n')}
${highPerformers.length > 5 ? `... and ${highPerformers.length - 5} more` : ''}` : 
`HIGH PERFORMERS: None found
⚠ No URLs meeting criteria (LLM ≥70% + Citations ≥10%)
This suggests systemic issues that need addressing`;

  // Low performers analysis
  const lowPerformersAnalysis = lowPerformers.length > 0 ? `
LOW PERFORMERS (${lowPerformers.length} URLs):
These URLs have poor LLM scores (<50%) OR low citation rates (<5%):
${lowPerformers.slice(0, 5).map((u, idx) => `${idx + 1}. ${u.url}
   LLM Score: ${(u.llmScore * 100).toFixed(1)}% | Citation Rate: ${(u.citationRate * 100).toFixed(2)}%`).join('\n')}
${lowPerformers.length > 5 ? `... and ${lowPerformers.length - 5} more need attention` : ''}` : 
`LOW PERFORMERS: None identified (good!)
✓ All analyzed URLs meeting minimum thresholds`;

  // Coverage gaps
  const coverageGap = missingAnalysisCount > 0 ? `
COVERAGE GAP:
${missingAnalysisCount} URLs (${((missingAnalysisCount / totalUrls) * 100).toFixed(1)}%) have not been analyzed yet
⚠ Cannot provide complete insights without full coverage` : 
`COVERAGE: Complete
✓ All URLs have been analyzed`;

  // Key patterns
  const patterns = `
KEY PATTERNS IDENTIFIED:
${avgLLMScore >= 0.7 ? '✓ Strong overall LLM presence - good foundation' : avgLLMScore >= 0.5 ? '→ Moderate LLM presence - room for improvement' : '✗ Weak LLM presence - significant optimization needed'}
${avgCitationRate >= 0.10 ? '✓ Good citation performance' : avgCitationRate >= 0.05 ? '→ Fair citation performance' : '✗ Poor citation performance - urgent action needed'}
${correlation.value > 0.5 ? '✓ LLM improvements will likely boost citations' : '→ LLM improvements may help, but other factors matter too'}
${metricAverages[0]?.average < 0.5 ? `⚠ ${metricAverages[0]?.metric} is a major weakness across most URLs` : ''}
${highPerformers.length > lowPerformers.length ? '✓ More high performers than low - positive overall' : '⚠ More low performers than high - needs attention'}
${missingAnalysisCount > totalUrls * 0.5 ? '⚠ Over 50% of URLs not analyzed - incomplete picture' : ''}`;

  return {
    currentState,
    metricBreakdown,
    correlationInsight,
    highPerformersAnalysis,
    lowPerformersAnalysis,
    coverageGap,
    patterns,
    rawData: analysis
  };
}

/**
 * Call Azure OpenAI to generate recommendations
 */
async function callAzureOpenAI(context) {
  const prompt = `You are an expert AI Visibility Analyst helping improve how well a website's content is discovered and cited by AI platforms like ChatGPT, Perplexity, and Claude.

CONTEXT: This company analyzes their URLs for "LLM Presence" (how discoverable content is to AI) and tracks citation performance (how often AI platforms actually cite their content).

${context.currentState}

${context.metricBreakdown}

${context.correlationInsight}

${context.highPerformersAnalysis}

${context.lowPerformersAnalysis}

${context.coverageGap}

${context.patterns}

YOUR TASK:
Generate 3-5 specific, actionable, data-driven recommendations to improve AI visibility and citation performance.

CRITICAL RULES:
1. Be SPECIFIC - reference actual metrics, counts, and percentages from above
2. Be ACTIONABLE - tell exactly what to do, not vague suggestions
3. Be DATA-DRIVEN - base recommendations on patterns in the data above
4. Be CONTEXTUAL - explain WHY based on the current state
5. Be IMPACTFUL - focus on changes that will meaningfully improve visibility
6. Include CONCRETE EXAMPLES - show what to analyze, test, or change
7. Prioritize by IMPACT - address the biggest opportunities first

GOOD RECOMMENDATIONS (specific, actionable, data-driven):
✓ "Focus optimization efforts on ${context.rawData.metricAverages[0]?.metric || 'Freshness'} which is your weakest metric at ${(context.rawData.metricAverages[0]?.average * 100 || 45).toFixed(1)}% average. ${context.rawData.metricAverages[0]?.lowCount || 12} URLs score below 50% on this metric. Start with the 3 lowest-scoring URLs and implement specific improvements: if it's Freshness, add current year mentions and recent dates; if it's Answerability, add FAQ sections; if it's Structure, improve heading hierarchy."

✓ "Analyze your ${context.rawData.highPerformers.length || 3} high-performing URLs (averaging ${((context.rawData.highPerformers.reduce((s, u) => s + u.llmScore, 0) / context.rawData.highPerformers.length || 0.75) * 100).toFixed(1)}% LLM score and ${((context.rawData.highPerformers.reduce((s, u) => s + u.citationRate, 0) / context.rawData.highPerformers.length || 0.12) * 100).toFixed(1)}% citation rate) to identify success patterns. Compare their ${context.rawData.metricAverages[0]?.metric || 'content structure'}, topic depth, and formatting against your ${context.rawData.lowPerformers.length || 8} low performers. Document what makes high performers successful (e.g., word count, heading structure, question coverage) and replicate those elements across other URLs."

✓ "With ${context.rawData.missingAnalysisCount || 0} URLs (${((context.rawData.missingAnalysisCount / context.rawData.totalUrls) * 100 || 0).toFixed(0)}%) not yet analyzed, prioritize analyzing URLs that receive high organic traffic or serve important business functions. Without complete analysis, you're missing potential quick wins. Analyze 10-15 URLs per week focusing on your most valuable pages first - product pages, key landing pages, and high-traffic blog posts."

BAD RECOMMENDATIONS (too vague, no context):
✗ "Improve your content quality" - HOW? Which URLs? What specific changes?
✗ "Focus on better metrics" - Which ones? Why? Based on what data?
✗ "Optimize for AI" - What does that mean specifically?
✗ "Add more content" - Where? What type? Why?

QUALITY REQUIREMENTS:
Each recommendation must:
- Start with a specific action verb (Analyze, Focus, Optimize, Prioritize, etc.)
- Reference specific data points from above (counts, percentages, metrics)
- Explain WHY it matters (what pattern or insight drives this)
- Include concrete next steps or criteria for success
- Be 3-5 sentences with complete details
- Focus on business value (visibility, citations, discoverability)

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
            content: 'You are an expert AI Visibility Analyst who provides specific, data-driven, actionable recommendations. You always output valid JSON and reference actual data points.'
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
  generateVisibilityRecommendations
};

