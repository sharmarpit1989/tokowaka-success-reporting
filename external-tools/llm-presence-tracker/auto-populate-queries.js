#!/usr/bin/env node

/**
 * Auto-populate search queries using PAA (People Also Ask) questions
 * 
 * This script integrates with ../paa-keyword-extractor to automatically
 * generate Top_Search_Queries for URLs by:
 * 1. Extracting topics from URLs/titles
 * 2. Fetching PAA questions from Google SERP
 * 3. Converting them to search query format
 * 4. Populating the CSV for LLM presence analysis
 */

const fs = require('fs-extra');
const path = require('path');

// Azure OpenAI Configuration (reuse from parent)
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || 'https://aem-sites-1-genai-us-east-2.openai.azure.com';
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_API_VERSION = process.env.AZURE_API_VERSION || '2024-02-01';
const AZURE_COMPLETION_DEPLOYMENT = process.env.AZURE_COMPLETION_DEPLOYMENT || 'gpt-4o';

// SERP API Configuration (from paa-keyword-extractor)
const SERP_API_KEY = process.env.SERP_API_KEY;
const SERP_PROVIDER = process.env.SERP_PROVIDER || 'serpapi';

const logger = {
  info: (msg) => console.log(`${new Date().toISOString()} - INFO - ${msg}`),
  error: (msg) => console.error(`${new Date().toISOString()} - ERROR - ${msg}`),
  warning: (msg) => console.warn(`${new Date().toISOString()} - WARNING - ${msg}`)
};

/**
 * Extract topic from URL
 */
function extractTopicFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(p => p && p !== 'online');
    
    // Get the last meaningful part
    let topic = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2] || '';
    
    // Clean up common file extensions
    topic = topic.replace(/\.(html|php|aspx|jsp)$/i, '');
    
    // Convert hyphens/underscores to spaces
    topic = topic.replace(/[-_]/g, ' ');
    
    // Capitalize first letter of each word
    topic = topic.replace(/\b\w/g, l => l.toUpperCase());
    
    return topic;
  } catch (error) {
    return '';
  }
}

/**
 * Get search keywords from Azure OpenAI
 */
async function getSearchKeywords(topic) {
  if (!AZURE_OPENAI_KEY) {
    logger.warning('Azure OpenAI key not provided, skipping keyword generation');
    return [topic];
  }
  
  logger.info(`Generating search keywords for: "${topic}"`);
  
  const prompt = `Generate 3-5 actual Google search queries that users would type to find information about: "${topic}"

Requirements:
- Output ONLY search queries, one per line
- Use natural search language (how people actually search)
- Include variations (e.g., "how to", "free", "online")
- No numbering, bullets, or explanations
- Each query should be 3-6 words

Example format:
pdf to word converter free
convert pdf to word online
how to convert pdf to word`;

  try {
    const response = await fetch(`${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_COMPLETION_DEPLOYMENT}/chat/completions?api-version=${AZURE_API_VERSION}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_OPENAI_KEY
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are an SEO expert who generates realistic search queries.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.choices[0]?.message?.content?.trim() || '';
    
    // Parse keywords (one per line)
    const keywords = responseText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.match(/^\d+[\.)]/)) // Remove numbering
      .slice(0, 5);
    
    logger.info(`Generated ${keywords.length} search queries`);
    return keywords;
  } catch (error) {
    logger.error(`Error generating keywords: ${error.message}`);
    return [topic];
  }
}

/**
 * Fetch PAA questions from SERP API
 */
async function getPAAQuestions(keyword) {
  if (!SERP_API_KEY) {
    logger.warning('SERP API key not provided, skipping PAA fetch');
    return [];
  }
  
  logger.info(`Fetching PAA questions for: "${keyword}"`);
  
  try {
    let response;
    
    if (SERP_PROVIDER === 'serpapi') {
      response = await fetch(`https://serpapi.com/search?q=${encodeURIComponent(keyword)}&api_key=${SERP_API_KEY}`);
    } else if (SERP_PROVIDER === 'valueserp') {
      response = await fetch(`https://api.valueserp.com/search?q=${encodeURIComponent(keyword)}&api_key=${SERP_API_KEY}`);
    } else if (SERP_PROVIDER === 'serper') {
      response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': SERP_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: keyword })
      });
    }
    
    if (!response.ok) {
      throw new Error(`SERP API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract PAA questions (structure varies by provider)
    let paaQuestions = [];
    if (data.related_questions) {
      paaQuestions = data.related_questions.map(q => q.question || q.title || q);
    } else if (data.peopleAlsoAsk) {
      paaQuestions = data.peopleAlsoAsk.map(q => q.question || q);
    }
    
    logger.info(`Found ${paaQuestions.length} PAA questions`);
    return paaQuestions.slice(0, 5);
  } catch (error) {
    logger.error(`Error fetching PAA: ${error.message}`);
    return [];
  }
}

/**
 * Detect user intent from queries/questions
 */
function detectIntent(queries) {
  const transactionalKeywords = ['buy', 'price', 'download', 'free', 'converter', 'tool', 'online', 'generator'];
  const navigationalKeywords = ['login', 'sign in', 'account', 'official', 'website'];
  const commercialKeywords = ['best', 'top', 'review', 'compare', 'vs'];
  
  const queryText = queries.join(' ').toLowerCase();
  
  if (transactionalKeywords.some(kw => queryText.includes(kw))) return 'transactional';
  if (navigationalKeywords.some(kw => queryText.includes(kw))) return 'navigational';
  if (commercialKeywords.some(kw => queryText.includes(kw))) return 'commercial';
  
  return 'informational';
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  let inputCsv = 'sample-urls-minimal.csv';
  let outputCsv = 'sample-urls-with-auto-queries.csv';
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--csv' || args[i] === '-c') {
      inputCsv = args[i + 1];
    } else if (args[i] === '--output' || args[i] === '-o') {
      outputCsv = args[i + 1];
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Usage: node auto-populate-queries.js [options]

Options:
  --csv, -c <file>      Input CSV file (default: sample-urls-minimal.csv)
  --output, -o <file>   Output CSV file (default: sample-urls-with-auto-queries.csv)
  --help, -h            Show this help message

Environment Variables Required:
  AZURE_OPENAI_KEY      Azure OpenAI API key (for keyword generation)
  SERP_API_KEY          SERP API key (for PAA questions)
  SERP_PROVIDER         SERP provider: serpapi, valueserp, or serper (default: serpapi)

Example:
  node auto-populate-queries.js --csv my-urls.csv --output enriched-urls.csv
      `);
      process.exit(0);
    }
  }
  
  // Check required keys
  if (!AZURE_OPENAI_KEY) {
    logger.error('AZURE_OPENAI_KEY environment variable is required');
    process.exit(1);
  }
  
  if (!SERP_API_KEY) {
    logger.warning('SERP_API_KEY not provided - will only generate keywords, no PAA questions');
  }
  
  // Read input CSV
  const csvPath = path.isAbsolute(inputCsv) ? inputCsv : path.join(__dirname, inputCsv);
  
  if (!await fs.pathExists(csvPath)) {
    logger.error(`Input CSV not found: ${csvPath}`);
    process.exit(1);
  }
  
  const content = await fs.readFile(csvPath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  const hasHeader = lines[0].toLowerCase().includes('url');
  const headerRow = hasHeader ? lines[0] : null;
  const dataLines = hasHeader ? lines.slice(1) : lines;
  
  logger.info(`Loaded ${dataLines.length} URLs from ${inputCsv}`);
  
  // Process each URL
  const enrichedData = [];
  
  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    const fields = line.split(',').map(f => f.trim().replace(/^["']+|["']+$/g, ''));
    const url = fields[0];
    const traffic = fields[1] || '';
    
    if (!url) continue;
    
    logger.info(`\n[${i + 1}/${dataLines.length}] Processing: ${url}`);
    
    // Extract topic from URL
    const topic = extractTopicFromUrl(url);
    logger.info(`Topic: "${topic}"`);
    
    // Generate search keywords
    const keywords = await getSearchKeywords(topic);
    
    // Optionally fetch PAA questions for the first keyword
    let paaQuestions = [];
    if (SERP_API_KEY && keywords.length > 0) {
      paaQuestions = await getPAAQuestions(keywords[0]);
    }
    
    // Combine keywords and PAA questions (remove duplicates)
    const allQueries = [...new Set([...keywords, ...paaQuestions])].slice(0, 5);
    
    // Detect intent
    const userIntent = detectIntent(allQueries);
    
    // Format for CSV
    const queriesStr = allQueries.join('; ');
    
    enrichedData.push({
      url,
      traffic,
      queries: queriesStr,
      intent: userIntent
    });
    
    logger.info(`✅ Added ${allQueries.length} queries (intent: ${userIntent})`);
    
    // Rate limiting (be nice to APIs)
    if (i < dataLines.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Write output CSV
  const outputPath = path.isAbsolute(outputCsv) ? outputCsv : path.join(__dirname, outputCsv);
  
  let csvOutput = 'URL,Traffic,Category,Top_Search_Queries,User_Intent\n';
  
  for (const item of enrichedData) {
    const escapedQueries = item.queries.includes(',') ? `"${item.queries}"` : item.queries;
    csvOutput += `${item.url},${item.traffic},,${escapedQueries},${item.intent}\n`;
  }
  
  await fs.writeFile(outputPath, csvOutput, 'utf8');
  
  logger.info(`\n✅ Success! Enriched CSV saved to: ${outputCsv}`);
  logger.info(`\nNext step: Run LLM presence analysis:`);
  logger.info(`  node main.js --csv ${outputCsv} --aikey YOUR_KEY`);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { getSearchKeywords, getPAAQuestions, detectIntent, extractTopicFromUrl };

