/**
 * Content Opportunity AI Service
 * Generates AI-powered content recommendations based on prompt analysis and citation patterns
 */

const { createServiceLogger } = require('../utils/logger');
const config = require('../utils/config');
const logger = createServiceLogger('ContentOpportunityAI');

/**
 * Generate AI recommendations for content opportunities
 * @param {Object} promptAnalysis - Prompt pattern analysis data
 * @param {Object} contentPatterns - High/low performing content patterns
 * @param {Array} targetUrls - List of target URLs being tracked
 * @param {Array} urlAnalysisData - Optional URL-level analysis data from AI Visibility dashboard
 */
async function generateContentRecommendations(promptAnalysis, contentPatterns, targetUrls, urlAnalysisData = null) {
  logger.info('Generating AI content recommendations', { 
    hasUrlAnalysis: !!urlAnalysisData,
    analyzedUrls: urlAnalysisData?.length || 0
  });
  
  // If Azure OpenAI is not configured, return structured recommendations
  if (!config.azure.isEnabled) {
    logger.warn('Azure OpenAI not configured, returning structured recommendations');
    return generateFallbackRecommendations(promptAnalysis, contentPatterns, urlAnalysisData);
  }
  
  try {
    const prompt = buildPrompt(promptAnalysis, contentPatterns, targetUrls, urlAnalysisData);
    const recommendations = await callAzureOpenAI(prompt);
    
    return {
      recommendations,
      isAIGenerated: true,
      generatedAt: new Date().toISOString()
    };
    
  } catch (error) {
    logger.error('Error generating AI recommendations:', error);
    // Fall back to structured recommendations
    return generateFallbackRecommendations(promptAnalysis, contentPatterns, urlAnalysisData);
  }
}

/**
 * Build prompt for Azure OpenAI
 */
function buildPrompt(promptAnalysis, contentPatterns, targetUrls, urlAnalysisData = null) {
  const opportunities = promptAnalysis.opportunities || [];
  const themes = promptAnalysis.themes || [];
  const domain = targetUrls.length > 0 ? extractDomain(targetUrls[0]) : 'your website';
  
  let prompt = `You are an expert content strategist analyzing LLM citation patterns to provide actionable content recommendations.

## CONTEXT

**Domain:** ${domain}
**Target URLs Being Tracked:** ${targetUrls.length}
**URLs with AI Visibility Analysis:** ${urlAnalysisData?.length || 0}
**Total Unique Prompts Analyzed:** ${promptAnalysis.totalUniquePrompts}
**Themes Identified:** ${themes.length}

## THEMATIC ANALYSIS

`;

  // Add top 5 themes
  themes.slice(0, 5).forEach((theme, idx) => {
    prompt += `
### Theme ${idx + 1}: ${theme.name}
- **Funnel Stage:** ${theme.funnelStage}
- **Prompt Count:** ${theme.promptCount}
- **Citation Rate:** ${(theme.citationRate * 100).toFixed(1)}%
- **Sample Prompts:** ${theme.prompts.slice(0, 3).map(p => `"${p.prompt}"`).join('; ')}
- **Currently Performing URLs:** ${theme.topCitedUrls.slice(0, 2).map(u => u.url).join(', ') || 'None'}
`;
  });
  
  // ✨ NEW: Add URL-level analysis insights if available
  if (urlAnalysisData && urlAnalysisData.length > 0) {
    prompt += `

## URL-LEVEL AI VISIBILITY ANALYSIS

We analyzed ${urlAnalysisData.length} URLs for LLM visibility. Here are key insights:

`;
    
    // Calculate aggregate statistics
    const avgLLMScore = calculateAverage(urlAnalysisData.map(u => u.contentAnalysis?.llmPresence?.overallScore));
    const avgFreshness = calculateAverage(urlAnalysisData.map(u => u.contentAnalysis?.llmPresence?.freshness));
    const avgAnswerability = calculateAverage(urlAnalysisData.map(u => u.contentAnalysis?.llmPresence?.answerability));
    const avgAuthority = calculateAverage(urlAnalysisData.map(u => u.contentAnalysis?.llmPresence?.authority));
    const avgStructure = calculateAverage(urlAnalysisData.map(u => u.contentAnalysis?.llmPresence?.structure));
    
    prompt += `
**Overall Metrics (Your Current Content):**
- Average LLM Presence Score: ${(avgLLMScore * 100).toFixed(1)}%
- Average Freshness Score: ${(avgFreshness * 100).toFixed(1)}%
- Average Answerability Score: ${(avgAnswerability * 100).toFixed(1)}%
- Average Authority Score: ${(avgAuthority * 100).toFixed(1)}%
- Average Structure Score: ${(avgStructure * 100).toFixed(1)}%

`;
    
    // Identify weak areas
    const weaknesses = [];
    if (avgFreshness < 0.6) weaknesses.push('Freshness (outdated content)');
    if (avgAnswerability < 0.6) weaknesses.push('Answerability (lacks direct answers)');
    if (avgAuthority < 0.6) weaknesses.push('Authority (needs more credibility signals)');
    if (avgStructure < 0.6) weaknesses.push('Structure (poor formatting for LLMs)');
    
    if (weaknesses.length > 0) {
      prompt += `**⚠️ Key Weaknesses Detected:** ${weaknesses.join(', ')}\n\n`;
    }
    
    // Group URLs by page type
    const pageTypeGroups = {};
    urlAnalysisData.forEach(u => {
      const pageType = u.contentAnalysis?.llmPresence?.pageType || 'Unknown';
      if (!pageTypeGroups[pageType]) pageTypeGroups[pageType] = [];
      pageTypeGroups[pageType].push(u);
    });
    
    prompt += `**Page Types on Your Site:**\n`;
    Object.entries(pageTypeGroups).forEach(([type, urls]) => {
      const avgScore = calculateAverage(urls.map(u => u.contentAnalysis?.llmPresence?.overallScore));
      prompt += `- ${type}: ${urls.length} pages (avg score: ${(avgScore * 100).toFixed(1)}%)\n`;
    });
    
    prompt += `\n`;
    
    // Show top and bottom performers
    const sortedUrls = [...urlAnalysisData]
      .filter(u => u.contentAnalysis?.llmPresence?.overallScore != null)
      .sort((a, b) => b.contentAnalysis.llmPresence.overallScore - a.contentAnalysis.llmPresence.overallScore);
    
    if (sortedUrls.length > 0) {
      prompt += `**Top Performing Pages (LLM Visibility):**\n`;
      sortedUrls.slice(0, 3).forEach((u, i) => {
        const score = u.contentAnalysis.llmPresence.overallScore;
        const pageType = u.contentAnalysis.llmPresence.pageType;
        prompt += `${i + 1}. ${u.url} (${(score * 100).toFixed(1)}%, ${pageType})\n`;
      });
      
      prompt += `\n**Lowest Performing Pages (Need Improvement):**\n`;
      sortedUrls.slice(-3).reverse().forEach((u, i) => {
        const score = u.contentAnalysis.llmPresence.overallScore;
        const pageType = u.contentAnalysis.llmPresence.pageType;
        const llm = u.contentAnalysis.llmPresence;
        const weakMetrics = [];
        if (llm.freshness < 0.5) weakMetrics.push('freshness');
        if (llm.answerability < 0.5) weakMetrics.push('answerability');
        if (llm.authority < 0.5) weakMetrics.push('authority');
        if (llm.structure < 0.5) weakMetrics.push('structure');
        
        prompt += `${i + 1}. ${u.url} (${(score * 100).toFixed(1)}%, ${pageType}) - Weak: ${weakMetrics.join(', ') || 'overall optimization needed'}\n`;
      });
      
      prompt += `\n`;
    }
  }
  
  prompt += `

## CONTENT OPPORTUNITY GAPS

`;

  opportunities.slice(0, 5).forEach((opp, idx) => {
    prompt += `
### Opportunity ${idx + 1}: ${opp.themeName}
- **Current Citation Rate:** ${(opp.currentCitationRate * 100).toFixed(1)}%
- **Prompt Count:** ${opp.promptCount}
- **Weekly Occurrences:** ${opp.totalOccurrences}
- **Funnel Stage:** ${opp.funnelStage}
- **Sample Prompts:** ${opp.samplePrompts.slice(0, 2).join('; ')}
`;
  });
  
  prompt += `

## CONTENT STRUCTURE ANALYSIS

**High-Performing Content Patterns:**
- Comparison tables: ${contentPatterns.highPerforming?.comparisonRate || 0}% of content
- Numbered/bulleted lists: ${contentPatterns.highPerforming?.listRate || 0}% of content
- Step-by-step guides: ${contentPatterns.highPerforming?.stepRate || 0}% of content
- Concrete examples: ${contentPatterns.highPerforming?.exampleRate || 0}% of content

**Low-Performing Content Patterns:**
- Comparison tables: ${contentPatterns.lowPerforming?.comparisonRate || 0}% of content
- Numbered/bulleted lists: ${contentPatterns.lowPerforming?.listRate || 0}% of content
- Step-by-step guides: ${contentPatterns.lowPerforming?.stepRate || 0}% of content
- Concrete examples: ${contentPatterns.lowPerforming?.exampleRate || 0}% of content

## YOUR TASK

Generate 5-7 actionable content recommendations. Each recommendation should:

1. **Be specific and actionable** - Include exact content types to create (e.g., "Create a comparison table showing...")
2. **Reference the data** - Mention which theme/prompts this addresses
3. **Include structural details** - Specify content elements (e.g., "3 comparison tables", "5-step guide")
4. **Be funnel-aware** - Explain how this matches user intent at a specific funnel stage
${urlAnalysisData && urlAnalysisData.length > 0 ? `5. **Use URL analysis insights** - Reference specific pages that need improvement or can be expanded
6. **Address metric weaknesses** - Target low-scoring metrics (freshness, answerability, authority, structure)` : ''}

## CRITICAL RULES

- Focus on CREATING or ENHANCING content, not competing
- Recommendations should be educational and constructive
- Reference specific prompt examples from the data
- Include concrete content structure suggestions (lists, tables, steps, FAQs)
- Explain WHY the structure works (e.g., "LLMs cite structured comparisons 40% more often")
- Prioritize opportunities with high volume and low citation rates
- Make recommendations specific to the theme and funnel stage
${urlAnalysisData && urlAnalysisData.length > 0 ? `- If URL analysis data is available, mention SPECIFIC URLS that should be improved or created
- Prioritize fixing pages with low LLM visibility scores (< 60%)
- Address the weakest metrics first (freshness, answerability, authority, structure)
- Suggest content updates for existing low-performing pages before recommending new pages` : ''}

## OUTPUT FORMAT

Return a JSON array of recommendation objects:

[
  {
    "title": "Brief, actionable title",
    "theme": "Which theme this addresses",
    "description": "2-3 sentences explaining the opportunity and why it matters",
    "contentStructure": {
      "tables": 2,
      "lists": 3,
      "steps": 5,
      "faqs": 10,
      "examples": 3
    },
    "actions": [
      "Specific action 1 with details",
      "Specific action 2 with details",
      "Specific action 3 with details"
    ],
    "funnelInsight": "Explain what audience expects at this funnel stage",
    "priority": "high" | "medium" | "low"${urlAnalysisData && urlAnalysisData.length > 0 ? `,
    "targetUrls": ["url1", "url2"],
    "metricFocus": "freshness" | "answerability" | "authority" | "structure" | "general"` : ''}
  }
]

${urlAnalysisData && urlAnalysisData.length > 0 ? `
**Note on targetUrls field:** 
- If recommending improvements to EXISTING pages, list 1-3 specific URLs from the analysis
- If recommending NEW content creation, set targetUrls to [] (empty array)
- Prioritize improving existing low-scoring pages before creating new ones

**Note on metricFocus field:**
- Specify which LLM visibility metric this recommendation primarily addresses
- Use this to ensure recommendations target the weakest areas` : ''}

Return ONLY valid JSON, no other text.`;

  return prompt;
}

/**
 * Call Azure OpenAI API
 */
async function callAzureOpenAI(prompt) {
  const { endpoint, apiKey, apiVersion, deployment } = config.azure;
  
  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are an expert content strategist specializing in LLM visibility and citation optimization. You provide specific, actionable recommendations based on data analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content in AI response');
  }
  
  // Parse JSON response
  try {
    // Extract JSON if wrapped in markdown code blocks
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\[[\s\S]*\]/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
    const recommendations = JSON.parse(jsonText);
    
    return Array.isArray(recommendations) ? recommendations : [recommendations];
  } catch (parseError) {
    logger.error('Failed to parse AI response as JSON:', parseError);
    logger.error('Raw response:', content);
    throw new Error('AI returned invalid JSON format');
  }
}

/**
 * Generate fallback recommendations without AI
 */
function generateFallbackRecommendations(promptAnalysis, contentPatterns, urlAnalysisData = null) {
  const recommendations = [];
  const opportunities = promptAnalysis.opportunities || [];
  
  // Add URL-based recommendations if analysis data is available
  if (urlAnalysisData && urlAnalysisData.length > 0) {
    const lowPerformers = urlAnalysisData
      .filter(u => u.contentAnalysis?.llmPresence?.overallScore < 0.6)
      .sort((a, b) => a.contentAnalysis.llmPresence.overallScore - b.contentAnalysis.llmPresence.overallScore)
      .slice(0, 3);
    
    lowPerformers.forEach(urlData => {
      const llm = urlData.contentAnalysis.llmPresence;
      const weakestMetric = getWeakestMetric(llm);
      
      recommendations.push({
        title: `Improve ${weakestMetric.name} on Low-Performing Page`,
        theme: 'URL Optimization',
        description: `This page has a low LLM visibility score of ${(llm.overallScore * 100).toFixed(1)}%, primarily due to weak ${weakestMetric.name.toLowerCase()} (${(weakestMetric.score * 100).toFixed(1)}%).`,
        contentStructure: guessContentStructure('consideration'),
        actions: generateMetricActions(weakestMetric.key, urlData.url),
        funnelInsight: `Focus on improving ${weakestMetric.name.toLowerCase()} to boost LLM citation potential`,
        priority: 'high',
        targetUrls: [urlData.url],
        metricFocus: weakestMetric.key
      });
    });
  }
  
  // Add top opportunities as recommendations
  opportunities.slice(0, 5).forEach(opp => {
    recommendations.push({
      title: `Improve Content for "${opp.themeName}" Theme`,
      theme: opp.themeName,
      description: `Your citation rate for ${opp.promptCount} prompts in this theme is ${(opp.currentCitationRate * 100).toFixed(1)}%. This represents a content gap opportunity with ${opp.totalOccurrences} weekly prompt occurrences.`,
      contentStructure: guessContentStructure(opp.funnelStage),
      actions: generateGenericActions(opp.themeName, opp.funnelStage),
      funnelInsight: getFunnelInsight(opp.funnelStage),
      priority: opp.priority,
      targetUrls: [],
      metricFocus: 'general'
    });
  });
  
  // Add structural recommendations from pattern analysis
  if (contentPatterns.recommendations) {
    contentPatterns.recommendations.slice(0, 3).forEach(rec => {
      recommendations.push({
        title: rec.title,
        theme: 'General Content Structure',
        description: rec.description,
        contentStructure: {},
        actions: rec.actions || [],
        funnelInsight: rec.impact || '',
        priority: rec.priority,
        targetUrls: [],
        metricFocus: 'structure'
      });
    });
  }
  
  return {
    recommendations,
    isAIGenerated: false,
    generatedAt: new Date().toISOString(),
    note: 'These are structured recommendations. Configure Azure OpenAI for AI-generated insights.'
  };
}

/**
 * Get the weakest metric from LLM presence scores
 */
function getWeakestMetric(llmPresence) {
  const metrics = [
    { key: 'freshness', name: 'Freshness', score: llmPresence.freshness || 0 },
    { key: 'answerability', name: 'Answerability', score: llmPresence.answerability || 0 },
    { key: 'authority', name: 'Authority', score: llmPresence.authority || 0 },
    { key: 'structure', name: 'Structure', score: llmPresence.structure || 0 }
  ];
  
  return metrics.reduce((weakest, current) => 
    current.score < weakest.score ? current : weakest
  );
}

/**
 * Generate actions based on which metric needs improvement
 */
function generateMetricActions(metricKey, url) {
  const actions = {
    freshness: [
      'Add clear publication date and last-updated date to the page',
      'Update content with current year statistics and examples',
      'Add a "Last Updated" section showing recent changes'
    ],
    answerability: [
      'Add a comprehensive FAQ section with 8-10 common questions',
      'Restructure content to directly answer "how", "what", and "why" questions',
      'Add clear, concise answers in the first paragraph of each section'
    ],
    authority: [
      'Add author credentials and expert quotes',
      'Include citations to authoritative sources',
      'Add case studies or real-world examples to demonstrate expertise'
    ],
    structure: [
      'Add numbered or bulleted lists for key points',
      'Create comparison tables for complex information',
      'Use clear H2/H3 headings to organize content hierarchically'
    ]
  };
  
  return actions[metricKey] || [
    `Review and optimize ${url}`,
    'Improve content quality and structure',
    'Add more detailed, actionable information'
  ];
}

/**
 * Guess content structure based on funnel stage
 */
function guessContentStructure(funnelStage) {
  switch (funnelStage) {
    case 'awareness':
      return { lists: 2, examples: 3, faqs: 5 };
    case 'consideration':
      return { tables: 2, lists: 2, examples: 2, faqs: 8 };
    case 'conversion':
      return { tables: 1, steps: 5, faqs: 10 };
    default:
      return { lists: 2, examples: 2, faqs: 5 };
  }
}

/**
 * Generate generic actions based on theme and funnel stage
 */
function generateGenericActions(themeName, funnelStage) {
  const actions = [];
  
  if (funnelStage === 'awareness') {
    actions.push(
      `Create an introductory guide page addressing "${themeName}" basics`,
      'Add "What is..." and "How does...work?" sections',
      'Include 3-5 concrete examples or use cases'
    );
  } else if (funnelStage === 'consideration') {
    actions.push(
      `Create a comparison page for ${themeName}`,
      'Add feature comparison tables',
      'Include pros/cons lists and best-fit scenarios'
    );
  } else if (funnelStage === 'conversion') {
    actions.push(
      `Create a step-by-step guide for ${themeName}`,
      'Add pricing or plan comparison tables',
      'Include FAQ section with 8-10 common questions'
    );
  }
  
  return actions;
}

/**
 * Get funnel stage insight
 */
function getFunnelInsight(funnelStage) {
  const insights = {
    awareness: 'Users at this stage are exploring options and need clear, educational content that answers "what" and "how" questions.',
    consideration: 'Users are comparing alternatives and need structured comparisons, feature lists, and evaluation criteria.',
    conversion: 'Users are ready to act and need specific details like pricing, plans, implementation steps, and FAQs.'
  };
  
  return insights[funnelStage] || 'Tailor content to match user intent at this stage.';
}

/**
 * Helper: Calculate average of numeric values
 */
function calculateAverage(values) {
  const validValues = values.filter(v => v != null && !isNaN(v) && isFinite(v));
  if (validValues.length === 0) return 0;
  return validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
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

module.exports = {
  generateContentRecommendations
};

