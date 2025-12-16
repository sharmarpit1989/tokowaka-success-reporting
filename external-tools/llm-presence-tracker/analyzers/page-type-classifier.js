/**
 * AI-Powered Page Type Classifier
 * Uses Azure OpenAI to identify page category from predefined types
 */

/**
 * Predefined page type categories
 */
const PAGE_TYPES = {
  // Product & Commerce
  PRODUCT_PAGE: {
    name: 'Product Page',
    description: 'Individual product/service page with features, pricing, specifications'
  },
  PRODUCT_CATEGORY: {
    name: 'Product Category',
    description: 'Category/collection page listing multiple products'
  },
  PRICING_PAGE: {
    name: 'Pricing Page',
    description: 'Dedicated pricing information, plans, packages'
  },
  LANDING_PAGE: {
    name: 'Landing Page',
    description: 'Marketing landing page for campaigns, sign-ups, downloads'
  },
  
  // Content & Information
  BLOG_POST: {
    name: 'Blog Post',
    description: 'Article, news, or blog content'
  },
  TUTORIAL_GUIDE: {
    name: 'Tutorial/Guide',
    description: 'How-to guide, tutorial, or step-by-step instructions'
  },
  DOCUMENTATION: {
    name: 'Documentation',
    description: 'Technical documentation, API docs, user manual'
  },
  FAQ_PAGE: {
    name: 'FAQ Page',
    description: 'Frequently Asked Questions page'
  },
  KNOWLEDGE_BASE: {
    name: 'Knowledge Base',
    description: 'Help center, support article, knowledge base entry'
  },
  
  // Tool & Utility
  ONLINE_TOOL: {
    name: 'Online Tool',
    description: 'Web-based tool, converter, calculator, generator'
  },
  DEMO_SANDBOX: {
    name: 'Demo/Sandbox',
    description: 'Interactive demo, playground, or sandbox environment'
  },
  
  // Company & Info
  HOMEPAGE: {
    name: 'Homepage',
    description: 'Company or website homepage/main page'
  },
  ABOUT_PAGE: {
    name: 'About Page',
    description: 'Company information, about us, team page'
  },
  CONTACT_PAGE: {
    name: 'Contact Page',
    description: 'Contact information, contact form'
  },
  
  // Resources & Downloads
  RESOURCE_CENTER: {
    name: 'Resource Center',
    description: 'Resources hub, downloads, templates, assets'
  },
  CASE_STUDY: {
    name: 'Case Study',
    description: 'Customer story, case study, testimonial page'
  },
  WHITEPAPER_EBOOK: {
    name: 'Whitepaper/eBook',
    description: 'Downloadable whitepaper, eBook, or research report'
  },
  
  // Community & Engagement
  COMMUNITY_FORUM: {
    name: 'Community/Forum',
    description: 'Community page, forum, discussion board'
  },
  EVENTS_WEBINAR: {
    name: 'Events/Webinar',
    description: 'Event page, webinar registration, conference info'
  },
  
  // Comparison & Reviews
  COMPARISON_PAGE: {
    name: 'Comparison Page',
    description: 'Product comparison, "vs" page, alternatives'
  },
  
  // Other
  OTHER: {
    name: 'Other',
    description: 'Does not fit standard categories'
  }
};

/**
 * Classify page type using simple heuristics (no AI needed)
 * This serves as a fallback when AI is not available
 */
function classifyPageTypeHeuristic(url, $, text, title) {
  const urlLower = url ? url.toLowerCase() : '';
  const textLower = text ? text.toLowerCase() : '';
  const titleLower = title ? title.toLowerCase() : '';
  
  const classifications = [];
  let confidence = 'low';
  
  // Online Tool patterns (very specific for Adobe)
  if (urlLower.includes('/online/') || 
      urlLower.includes('/converter') ||
      urlLower.includes('/generator') ||
      urlLower.includes('/editor') ||
      textLower.includes('upload') && textLower.includes('download') && textLower.includes('convert')) {
    classifications.push('ONLINE_TOOL');
    confidence = 'high';
  }
  
  // Product page patterns
  else if (urlLower.includes('/product') || 
           urlLower.includes('/products/') ||
           (textLower.includes('buy now') && textLower.includes('features'))) {
    classifications.push('PRODUCT_PAGE');
    confidence = 'medium';
  }
  
  // Pricing page patterns
  else if (urlLower.includes('/pricing') || 
           urlLower.includes('/plans') ||
           titleLower.includes('pricing') ||
           (textLower.match(/\$/g) || []).length > 5) {
    classifications.push('PRICING_PAGE');
    confidence = 'high';
  }
  
  // Blog/Article patterns
  else if (urlLower.includes('/blog') || 
           urlLower.includes('/article') ||
           urlLower.includes('/news')) {
    classifications.push('BLOG_POST');
    confidence = 'high';
  }
  
  // Tutorial/Guide patterns
  else if (urlLower.includes('/tutorial') || 
           urlLower.includes('/guide') ||
           urlLower.includes('/how-to') ||
           titleLower.includes('how to') ||
           textLower.includes('step 1') || textLower.includes('langkah 1')) {
    classifications.push('TUTORIAL_GUIDE');
    confidence = 'medium';
  }
  
  // Documentation patterns
  else if (urlLower.includes('/docs') || 
           urlLower.includes('/documentation') ||
           urlLower.includes('/api') ||
           urlLower.includes('/reference')) {
    classifications.push('DOCUMENTATION');
    confidence = 'high';
  }
  
  // FAQ patterns
  else if (urlLower.includes('/faq') || 
           titleLower.includes('faq') ||
           titleLower.includes('frequently asked')) {
    classifications.push('FAQ_PAGE');
    confidence = 'high';
  }
  
  // Homepage patterns
  else if (url.match(/^https?:\/\/[^\/]+\/?$/)) {
    classifications.push('HOMEPAGE');
    confidence = 'high';
  }
  
  // About page patterns
  else if (urlLower.includes('/about') || 
           titleLower.includes('about us')) {
    classifications.push('ABOUT_PAGE');
    confidence = 'high';
  }
  
  // Contact page patterns
  else if (urlLower.includes('/contact') || 
           titleLower.includes('contact us')) {
    classifications.push('CONTACT_PAGE');
    confidence = 'high';
  }
  
  // Default to OTHER if no match
  if (classifications.length === 0) {
    classifications.push('OTHER');
    confidence = 'low';
  }
  
  return {
    primaryType: classifications[0],
    secondaryTypes: classifications.slice(1),
    confidence,
    method: 'heuristic'
  };
}

/**
 * Classify page type using Azure OpenAI
 */
async function classifyPageTypeWithAI(url, text, title, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, AZURE_COMPLETION_DEPLOYMENT, AZURE_API_VERSION) {
  if (!AZURE_OPENAI_KEY) {
    return null;
  }
  
  try {
    // Build prompt with page type definitions
    const pageTypesList = Object.entries(PAGE_TYPES)
      .map(([key, value]) => `- ${key}: ${value.description}`)
      .join('\n');
    
    const prompt = `Classify this web page into one or more categories from the predefined list below.

URL: ${url}
Title: ${title}

Content Sample (first 2000 characters):
${text.substring(0, 2000)}

Available Page Types:
${pageTypesList}

Instructions:
1. Identify the PRIMARY page type (most accurate match)
2. Optionally identify 1-2 SECONDARY types if the page serves multiple purposes
3. Provide a confidence level: high, medium, or low
4. Briefly explain why (1 sentence)

Response format (JSON):
{
  "primaryType": "PAGE_TYPE_KEY",
  "secondaryTypes": ["PAGE_TYPE_KEY"],
  "confidence": "high|medium|low",
  "reasoning": "Brief explanation"
}

Example response:
{
  "primaryType": "ONLINE_TOOL",
  "secondaryTypes": ["TUTORIAL_GUIDE"],
  "confidence": "high",
  "reasoning": "Page provides PDF to Word conversion tool with step-by-step instructions"
}`;

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
            { role: 'system', content: 'You are a web page classification expert. Always respond with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 300,
          temperature: 0.1,  // Low temperature for consistent classification
          response_format: { type: "json_object" }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error('Empty response from AI');
    }
    
    // Parse JSON response
    const classification = JSON.parse(content);
    
    // Validate response
    if (!classification.primaryType || !PAGE_TYPES[classification.primaryType]) {
      throw new Error(`Invalid page type: ${classification.primaryType}`);
    }
    
    return {
      primaryType: classification.primaryType,
      secondaryTypes: classification.secondaryTypes || [],
      confidence: classification.confidence || 'medium',
      reasoning: classification.reasoning || 'AI classification',
      method: 'ai'
    };
    
  } catch (error) {
    console.error(`Error classifying page type with AI: ${error.message}`);
    return null;
  }
}

/**
 * Main classification function
 * Uses AI if available, falls back to heuristics
 */
async function classifyPageType(url, $, text, title, azureConfig = null) {
  let result = null;
  
  // Try AI classification first if Azure config provided
  if (azureConfig && azureConfig.AZURE_OPENAI_KEY) {
    result = await classifyPageTypeWithAI(
      url, 
      text, 
      title,
      azureConfig.AZURE_OPENAI_ENDPOINT,
      azureConfig.AZURE_OPENAI_KEY,
      azureConfig.AZURE_COMPLETION_DEPLOYMENT,
      azureConfig.AZURE_API_VERSION
    );
  }
  
  // Fall back to heuristic if AI failed or not available
  if (!result) {
    result = classifyPageTypeHeuristic(url, $, text, title);
  }
  
  // Add human-readable labels
  const primaryTypeInfo = PAGE_TYPES[result.primaryType] || PAGE_TYPES.OTHER;
  const secondaryTypeInfo = result.secondaryTypes.map(t => PAGE_TYPES[t]?.name || t);
  
  return {
    primaryType: result.primaryType,
    primaryTypeName: primaryTypeInfo.name,
    secondaryTypes: result.secondaryTypes,
    secondaryTypeNames: secondaryTypeInfo,
    confidence: result.confidence,
    reasoning: result.reasoning,
    method: result.method,
    allPageTypes: PAGE_TYPES  // Include for reference
  };
}

/**
 * Get list of all available page types
 */
function getAvailablePageTypes() {
  return PAGE_TYPES;
}

module.exports = {
  classifyPageType,
  getAvailablePageTypes,
  PAGE_TYPES
};

