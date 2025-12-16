/**
 * Test Citation AI Recommendations
 * Run with: node test-citation-ai.js
 */

require('dotenv').config();
const { generateCitationRecommendations } = require('./services/citationRecommendationAI');

// Sample citation data for testing
const testCitationData = {
  domain: 'business.adobe.com',
  targetUrls: [
    'https://business.adobe.com/summit/2025/sessions/ai-session-1.html',
    'https://business.adobe.com/summit/2025/sessions/ai-session-2.html',
    'https://business.adobe.com/summit/2025/faq.html'
  ],
  citationRates: [
    {
      type: 'summary',
      week: 'w43-2024',
      platform: 'ChatGPT',
      totalPrompts: 500,
      selectedUrlCitations: 40,
      anyDomainCitations: 60,
      selectedUrlRate: 0.08,
      anyDomainRate: 0.12,
      citedUrls: ['https://business.adobe.com/summit/2025/faq.html']
    },
    {
      type: 'summary',
      week: 'w44-2024',
      platform: 'ChatGPT',
      totalPrompts: 520,
      selectedUrlCitations: 62,
      anyDomainCitations: 78,
      selectedUrlRate: 0.119,
      anyDomainRate: 0.15,
      citedUrls: [
        'https://business.adobe.com/summit/2025/faq.html',
        'https://business.adobe.com/summit/2025/sessions/ai-session-1.html'
      ]
    },
    {
      type: 'summary',
      week: 'w43-2024',
      platform: 'Perplexity',
      totalPrompts: 480,
      selectedUrlCitations: 35,
      anyDomainCitations: 50,
      selectedUrlRate: 0.073,
      anyDomainRate: 0.104,
      citedUrls: ['https://business.adobe.com/summit/2025/sessions/ai-session-2.html']
    },
    {
      type: 'summary',
      week: 'w44-2024',
      platform: 'Perplexity',
      totalPrompts: 490,
      selectedUrlCitations: 52,
      anyDomainCitations: 68,
      selectedUrlRate: 0.106,
      anyDomainRate: 0.139,
      citedUrls: [
        'https://business.adobe.com/summit/2025/sessions/ai-session-1.html',
        'https://business.adobe.com/summit/2025/sessions/ai-session-2.html'
      ]
    }
  ]
};

console.log('==================================');
console.log('  Citation AI Recommendations Test');
console.log('==================================\n');

console.log('Configuration:');
console.log('  Azure Endpoint:', process.env.AZURE_OPENAI_ENDPOINT || 'Using default');
console.log('  Azure API Key:', process.env.AZURE_OPENAI_KEY ? `SET (${process.env.AZURE_OPENAI_KEY.length} chars)` : 'NOT SET');
console.log('  Deployment:', process.env.AZURE_COMPLETION_DEPLOYMENT || 'gpt-4o');
console.log();

console.log('Test Data:');
console.log('  Domain:', testCitationData.domain);
console.log('  Target URLs:', testCitationData.targetUrls.length);
console.log('  Data Points:', testCitationData.citationRates.length);
console.log();

async function testRecommendations() {
  try {
    console.log('Generating AI recommendations...\n');
    
    const result = await generateCitationRecommendations(
      testCitationData,
      [],  // No week filter
      []   // No URL filter
    );

    console.log('Result:');
    console.log('  AI Generated:', result.isAIGenerated);
    console.log('  Recommendations:', result.recommendations.length);
    console.log();

    if (result.recommendations.length > 0) {
      console.log('Generated Recommendations:');
      console.log('─'.repeat(80));
      result.recommendations.forEach((rec, idx) => {
        console.log(`\n${idx + 1}. ${rec}\n`);
      });
      console.log('─'.repeat(80));
    }

    if (!result.isAIGenerated) {
      console.warn('\n⚠️  AI recommendations not generated. Possible reasons:');
      console.warn('   - Azure OpenAI API key not configured');
      console.warn('   - API endpoint incorrect');
      console.warn('   - Network or authentication error');
    } else {
      console.log('\n✅ SUCCESS! AI recommendations generated successfully.');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testRecommendations();

