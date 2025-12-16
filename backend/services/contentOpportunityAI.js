/**
 * Content Opportunity AI Service
 * Generates AI-powered content recommendations based on prompt analysis and citation patterns
 */

const { createServiceLogger } = require('../utils/logger');
const config = require('../utils/config');
const logger = createServiceLogger('ContentOpportunityAI');

/**
 * Generate AI recommendations for content opportunities
 */
async function generateContentRecommendations(promptAnalysis, contentPatterns, targetUrls) {
  logger.info('Generating AI content recommendations');
  
  // If Azure OpenAI is not configured, return structured recommendations
  if (!config.azure.isEnabled) {
    logger.warn('Azure OpenAI not configured, returning structured recommendations');
    return generateFallbackRecommendations(promptAnalysis, contentPatterns);
  }
  
  try {
    const prompt = buildPrompt(promptAnalysis, contentPatterns, targetUrls);
    const recommendations = await callAzureOpenAI(prompt);
    
    return {
      recommendations,
      isAIGenerated: true,
      generatedAt: new Date().toISOString()
    };
    
  } catch (error) {
    logger.error('Error generating AI recommendations:', error);
    // Fall back to structured recommendations
    return generateFallbackRecommendations(promptAnalysis, contentPatterns);
  }
}

/**
 * Build prompt for Azure OpenAI
 */
function buildPrompt(promptAnalysis, contentPatterns, targetUrls) {
  const opportunities = promptAnalysis.opportunities || [];
  const themes = promptAnalysis.themes || [];
  const domain = targetUrls.length > 0 ? extractDomain(targetUrls[0]) : 'your website';
  
  let prompt = `You are an expert content strategist analyzing LLM citation patterns to provide actionable content recommendations.

## CONTEXT

**Domain:** ${domain}
**Target URLs Being Tracked:** ${targetUrls.length}
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
  
  prompt += `

## CONTENT OPPORTUNITY GAPS

`;

  opportunities.slice(0, 5).forEach((opp, idx) => {
    prompt += `
### Opportunity ${idx + 1}: ${opp.themeName}
- **Current Citation Rate:** ${(opp.currentCitationRate * 100).toFixed(1)}%
- **Prompt Count:** ${opp.promptCount}
- **Potential Weekly Citations Gain:** ${opp.potentialGain}
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
5. **Show impact** - Reference potential citation gains

## CRITICAL RULES

- Focus on CREATING or ENHANCING content, not competing
- Recommendations should be educational and constructive
- Reference specific prompt examples from the data
- Include concrete content structure suggestions (lists, tables, steps, FAQs)
- Explain WHY the structure works (e.g., "LLMs cite structured comparisons 40% more often")
- Prioritize opportunities with high potential gain
- Make recommendations specific to the theme and funnel stage

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
    "potentialImpact": "Estimated citation gain or improvement",
    "priority": "high" | "medium" | "low"
  }
]

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
function generateFallbackRecommendations(promptAnalysis, contentPatterns) {
  const recommendations = [];
  const opportunities = promptAnalysis.opportunities || [];
  
  // Add top opportunities as recommendations
  opportunities.slice(0, 5).forEach(opp => {
    recommendations.push({
      title: `Improve Content for "${opp.themeName}" Theme`,
      theme: opp.themeName,
      description: `Your citation rate for ${opp.promptCount} prompts in this theme is ${(opp.currentCitationRate * 100).toFixed(1)}%. By creating structured, comprehensive content, you could gain approximately ${opp.potentialGain} additional citations per week.`,
      contentStructure: guessContentStructure(opp.funnelStage),
      actions: generateGenericActions(opp.themeName, opp.funnelStage),
      funnelInsight: getFunnelInsight(opp.funnelStage),
      potentialImpact: `+${opp.potentialGain} citations/week`,
      priority: opp.priority
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
        potentialImpact: rec.impact || 'Improves overall citation rate',
        priority: rec.priority
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

